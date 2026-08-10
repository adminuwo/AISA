import axios from 'axios';
import { getDeviceFingerprint } from '../utils/deviceHelper';
import { getUserData } from '../userStore/userData';
import { apis } from '../types';

const AI_AD_API = `${apis.baseUrl}/ai-ad`;

/**
 * generateAiAdChatResponse
 * Dedicated service for interacting with the Capilot AI ADS™ Chat Bot.
 */
export const generateAiAdChatResponse = async (
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

  const streamEndpoint = `${AI_AD_API}/chat`;

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
            message: "Your plan doesn't include access to Capilot AI ADS Chat Bot. Please upgrade.",
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
        // Last entry may be an incomplete line split across reads — keep it for the next iteration
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
      console.warn('[aiAdService] Stream failed:', streamErr.message);
      // Optional fallback to normal axios POST could go here
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
