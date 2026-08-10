import { getDeviceFingerprint } from '../utils/deviceHelper';
import { getUserData } from '../userStore/userData';
import { getApiBaseUrl } from '../types';

const LEGAL_CHAT_API = `${getApiBaseUrl()}/chat/stream`;

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

  if (onTokenChunk) {
    try {
      const response = await fetch(LEGAL_CHAT_API, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: abortSignal,
      });

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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Last entry may be an incomplete line split across reads — keep it for next iteration
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') {
              reader.cancel().catch(() => {});
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
      return { text: accumulatedText, reply: accumulatedText };
    } catch (streamErr) {
      console.warn('[aiLegalChatService] Stream failed:', streamErr.message);
      throw streamErr;
    }
  }

  // Fallback if no onTokenChunk is provided (non-streaming mode)
  const result = await fetch(LEGAL_CHAT_API, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: abortSignal,
  });

  if (!result.ok) {
    throw new Error(`Legal chat HTTP error: ${result.status}`);
  }

  return result.json();
};
