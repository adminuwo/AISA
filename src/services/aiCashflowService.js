import axios from 'axios';
import { getDeviceFingerprint } from '../utils/deviceHelper';
import { getUserData } from '../userStore/userData';
import { getApiBaseUrl } from '../types';

const getCashflowChatApi = () => `${getApiBaseUrl()}/cashflow/chat`;

/**
 * generateCashflowChatResponse
 * Dedicated service for interacting with the AI CashFlow™ Personal Bot via SSE streaming.
 */
export const generateCashflowChatResponse = async (
  history,
  currentMessage,
  systemInstruction,
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
    systemInstruction: (systemInstruction || '').trim(),
    sessionId,
  };

  const streamEndpoint = getCashflowChatApi();

  if (onTokenChunk) {
    try {
      const response = await fetch(streamEndpoint, {
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
          return {
            error: 'PREMIUM_ONLY',
            message: "Your plan doesn't include access to AI CashFlow Copilot. Please upgrade.",
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
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
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
      return { text: accumulatedText, reply: accumulatedText };
    } catch (streamErr) {
      console.warn('[aiCashflowService] Stream failed:', streamErr.message);
      throw streamErr;
    }
  }

  // Fallback if no onTokenChunk is provided
  const result = await axios.post(streamEndpoint, payload, {
    headers,
    signal: abortSignal,
    withCredentials: true,
  });

  return result.data;
};
