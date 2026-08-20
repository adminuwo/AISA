import { getDeviceFingerprint } from '../utils/deviceHelper';
import { getUserData } from '../userStore/userData';
import { getApiBaseUrl } from '../types';

const getLegalChatApi = () => `${getApiBaseUrl()}/chat/stream`;

/**
 * generateLegalChatResponse
 * Dedicated service for interacting with the AI Legal™ Chat Bot.
 *
 * Routes to /api/chat/stream with mode='LEGAL_TOOLKIT'.
 * Uses domain-isolated legal system prompt from legalPrompts.js.
 */
export const generateLegalChatResponse = async (
  history,
  currentMessage,
  sessionId = null,
  onTokenChunk = null,
  abortSignal = null
) => {
  // Try multiple token sources in priority order
  const token =
    getUserData()?.token ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('accessToken');

  const headers = {
    'Content-Type': 'application/json',
    'X-Device-Fingerprint': getDeviceFingerprint(),
  };

  if (token && token !== 'undefined' && token !== 'null') {
    headers.Authorization = `Bearer ${token}`;
  }

  const payload = {
    content: currentMessage,
    history: history.length > 50 ? history.slice(-50) : history,
    sessionId,
    mode: 'LEGAL_TOOLKIT',
  };

  const streamUrl = getLegalChatApi();

  if (onTokenChunk) {
    try {
      console.log(`[aiLegalChatService STREAM REQUEST] POST ${streamUrl}`, payload);
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: abortSignal,
      });

      console.log(`[aiLegalChatService STREAM RESPONSE] Status: ${response.status}`);

      if (!response.ok || !response.body) {
        if (response.status === 401) {
          return {
            error: 'AUTH_REQUIRED',
            message: 'Your session has expired. Please refresh the page and log in again.',
          };
        }
        if (response.status === 403) {
          const data = await response.json().catch(() => ({}));
          if (data?.code === 'OUT_OF_CREDITS') {
            return { error: 'OUT_OF_CREDITS', message: data.message };
          }
          return {
            error: 'PREMIUM_ONLY',
            message: "Your plan doesn't include access to AI Legal Chat. Please upgrade.",
          };
        }
        throw new Error(`SSE stream HTTP error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';
      let isDone = false;

      while (!isDone) {
        let readResult;
        try {
          readResult = await reader.read();
        } catch (readErr) {
          // If the reader was cancelled/aborted or closed cleanly
          if (readErr.name === 'AbortError' || isDone) break;
          throw readErr;
        }

        const { done, value } = readResult || {};
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Last entry may be an incomplete line split across reads — keep it for next iteration
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) {
            // Skip keep-alive ping comments and empty lines
            continue;
          }
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === '[DONE]') {
              isDone = true;
              try {
                reader.cancel().catch(() => {});
              } catch (_) {}
              break;
            }
            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                return { error: data.error, message: data.reason || data.error };
              }
              if (data.text) {
                accumulatedText += data.text;
                onTokenChunk(data.text);
              }
            } catch (e) {
              // Ignore parse errors on partial JSON chunks
            }
          }
        }
      }

      // Process any remaining data left in the buffer after the stream ends.
      if (buffer.trim()) {
        const remainingLine = buffer.trim();
        if (remainingLine.startsWith('data: ')) {
          const dataStr = remainingLine.slice(6).trim();
          if (dataStr !== '[DONE]') {
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                accumulatedText += data.text;
                onTokenChunk(data.text);
              }
            } catch (e) {
              // Ignore parse errors on partial JSON chunks
            }
          }
        }
      }

      return { text: accumulatedText, reply: accumulatedText };
    } catch (streamErr) {
      console.error('[aiLegalChatService STREAM ERROR] Stream failed:', streamErr.message);
      throw streamErr;
    }
  }

  // Fallback if no onTokenChunk is provided (non-streaming mode)
  console.log(`[aiLegalChatService FALLBACK REQUEST] POST ${streamUrl}`, payload);
  const result = await fetch(streamUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: abortSignal,
  });

  console.log(`[aiLegalChatService FALLBACK RESPONSE] Status: ${result.status}`);

  if (!result.ok) {
    throw new Error(`Legal chat HTTP error: ${result.status}`);
  }

  return result.json();
};
