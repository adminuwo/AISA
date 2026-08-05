import axios from 'axios';
import { apis } from '../types';
import { getUserData } from '../userStore/userData';
import { getDeviceFingerprint } from '../utils/deviceHelper';

export const generateChatResponse = async (
  history,
  currentMessage,
  systemInstruction,
  attachments,
  language,
  abortSignal = null,
  mode = null,
  sessionId = null,
  projectId = null,
  userMsgId = null,
  aiMsgId = null,
  aspectRatio = null,
  modelId = null,
  onTokenChunk = null
) => {
  try {
    const token = getUserData()?.token;
    const headers = {
      'X-Device-Fingerprint': getDeviceFingerprint(),
    };
    if (token && token !== 'undefined' && token !== 'null') {
      headers.Authorization = `Bearer ${token}`;
    }

    // Language handling is now performed centrally in the backend ai.service.js
    const combinedSystemInstruction = (systemInstruction || '').trim();

    let images = [];
    let documents = [];
    let finalMessage = currentMessage;

    if (attachments && Array.isArray(attachments)) {
      attachments.forEach(attachment => {
        if (attachment.url && attachment.url.startsWith('data:')) {
          const base64Data = attachment.url.split(',')[1];
          const mimeType = attachment.url.substring(
            attachment.url.indexOf(':') + 1,
            attachment.url.indexOf(';')
          );

          if (attachment.type === 'image' || mimeType.startsWith('image/')) {
            images.push({ mimeType, base64Data });
          } else {
            documents.push({
              mimeType: mimeType || 'application/pdf',
              base64Data,
              name: attachment.name,
            });
          }
        } else if (attachment.url) {
          // Include URL in images array if it's an image type
          const isImage =
            attachment.type === 'image' ||
            (attachment.name && /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(attachment.name)) ||
            (attachment.mimeType && attachment.mimeType.startsWith('image/'));

          if (isImage) {
            images.push({
              url: attachment.url,
              name: attachment.name,
              mimeType: attachment.mimeType,
            });
          }

          finalMessage += `\n[Shared File: ${attachment.name || 'Link'} - ${attachment.url}]`;
        }
      });
    }

    // Limit history to last 50 messages to prevent token overflow in unlimited chats
    const recentHistory = history.length > 50 ? history.slice(-50) : history;

    const payload = {
      content: finalMessage,
      history: recentHistory,
      systemInstruction: combinedSystemInstruction,
      image: images,
      document: documents,
      language: language || 'English',
      mode: mode,
      sessionId: sessionId,
      projectId: projectId,
      userMsgId: userMsgId,
      aiMsgId: aiMsgId,
      ...(aspectRatio && { aspectRatio }),
      ...(modelId && { modelId }),
    };

    // Deep Search runs a 3-step pipeline (Gemini plan → Tavily → Gemini synthesis)
    // which can take 35–90s. Use 180s for search modes, 60s for everything else.
    const isSearchMode = mode === 'DEEP_SEARCH' || mode === 'web_search' || mode === 'SEARCH';
    const requestTimeout = isSearchMode ? 180000 : 60000;

    // Try SSE streaming if callback is provided or for standard text prompts
    if (onTokenChunk) {
      try {
        const streamRes = await generateChatResponseStream(
          history, currentMessage, systemInstruction, attachments, language,
          onTokenChunk, abortSignal, mode, sessionId, projectId, userMsgId, aiMsgId, aspectRatio, modelId
        );
        if (streamRes && (streamRes.reply || streamRes.text)) {
          return streamRes;
        }
      } catch (streamErr) {
        console.warn('[geminiService] Stream failed, falling back to POST:', streamErr.message);
      }
    }

    const result = await axios.post(apis.chatAgent, payload, {
      headers: headers,
      signal: abortSignal,
      withCredentials: true,
      timeout: requestTimeout,
    });

    // Return full response data (includes reply and potentially conversion data)
    return result.data;
  } catch (error) {
    if (
      axios.isCancel(error) ||
      error?.name === 'CanceledError' ||
      error?.code === 'ERR_CANCELED'
    ) {
      return null;
    }
    console.error('Gemini API Error:', error);

    // Handle credit / plan errors
    if (error.response?.status === 403) {
      const code = error.response?.data?.code;
      const message = error.response?.data?.message || error.response?.data?.error;

      if (code === 'OUT_OF_CREDITS') {
        window.dispatchEvent(new Event('out_of_credits'));
        return { error: 'OUT_OF_CREDITS', message };
      }
      if (code === 'PREMIUM_ONLY') {
        window.dispatchEvent(
          new CustomEvent('premium_required', { detail: { toolName: 'this feature' } })
        );
        return { error: 'PREMIUM_ONLY', message };
      }
    }

    if (error.response?.status === 429) {
      const detail =
        error.response?.data?.details ||
        error.response?.data?.error ||
        error.response?.data?.message;
      if (detail) return `System Busy (429): ${detail}`;
      return 'The A-Series system is currently busy (Quota limit reached). Please wait 60 seconds and try again.';
    }
    if (error.response?.status === 401) {
      return 'Please [Log In](/login) to your AISA™ account to continue chatting.';
    }
    if (error.response?.data?.error === 'LIMIT_REACHED') {
      throw error;
    }
    if (error.response?.status === 403 && error.response?.data?.code === 'QUOTA_EXCEEDED') {
      throw error;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    // Return backend error message if available
    if (error.response?.data?.error) {
      const details = error.response.data.details ? ` - ${error.response.data.details}` : '';
      return `System Message: ${error.response.data.error}${details}`;
    }

    return {
      reply: "I'm having trouble connecting right now. Please try again in a moment.",
    };
  }
};

/**
 * Stream AI Chat Response using Server-Sent Events (SSE)
 */
export const generateChatResponseStream = async (
  history,
  currentMessage,
  systemInstruction,
  attachments,
  language,
  onTokenChunk,
  abortSignal = null,
  mode = null,
  sessionId = null,
  projectId = null,
  userMsgId = null,
  aiMsgId = null,
  aspectRatio = null,
  modelId = null
) => {
  const token = getUserData()?.token;
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
    language,
    mode,
    sessionId,
    projectId,
    userMsgId,
    aiMsgId,
    aspectRatio,
    modelId,
  };

  const streamEndpoint = apis.chatAgentStream || (apis.chatAgent.endsWith('/') ? `${apis.chatAgent}stream` : `${apis.chatAgent}/stream`);

  const response = await fetch(streamEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: abortSignal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`SSE stream HTTP error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let accumulatedText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.replace('data: ', '').trim();
        if (dataStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.text) {
            accumulatedText += parsed.text;
            if (onTokenChunk) onTokenChunk(accumulatedText);
          }
        } catch (e) {
          // Raw text chunk fallback
        }
      }
    }
  }

  return { reply: accumulatedText, text: accumulatedText };
};

/**
 * Generates context-aware follow-up prompts for a given user query.
 * Useful for "Smart Suggestions" after image generation or chat.
 * @param {string} prompt - The original prompt
 * @param {string} type - 'image', 'video', or 'chat'
 * @returns {Promise<string[]>} List of 3 suggested prompts
 */
export const generateFollowUpPrompts = async (prompt, type = 'image') => {
  try {
    const systemInstruction = `You are a smart suggestion engine for an AI assistant.
Your job is to generate exactly 3 highly relevant, context-aware, and ACTION-ORIENTED follow-up suggestions for ${type} mode.

STRICT RULES:
1. NO GENERIC SUGGESTIONS: Never return "Explain more", "Give examples", or "Summarize".
2. ACTION-ORIENTED: Suggestions must feel like a next step.
3. LENGTH: 5–10 words max.
4. FORMAT: Return ONLY a JSON array: ["S1", "S2", "S3"]`;

    // Use skipSession:true so the backend does NOT create a ghost chat session for this internal call
    const token = getUserData()?.token;
    const headers = { 'X-Device-Fingerprint': getDeviceFingerprint() };
    if (token && token !== 'undefined' && token !== 'null')
      headers.Authorization = `Bearer ${token}`;
    const raw = await axios.post(
      apis.chatAgent,
      {
        content: prompt,
        history: [],
        systemInstruction,
        image: [],
        document: [],
        language: 'English',
        skipSession: true,
      },
      { headers, withCredentials: true, timeout: 15000 }
    );
    const response = raw.data;

    // Handle both object {reply: "..."} and direct string responses
    const replyText = response?.reply || (typeof response === 'string' ? response : null);

    if (replyText && !replyText.includes('Log In') && !replyText.includes('System Message')) {
      // Attempt to parse as JSON first
      try {
        // Remove markdown code blocks if present
        const jsonMatch = replyText.match(/\[\s*".*?"\s*\]/s) || replyText.match(/\[.*\]/s);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed)) {
            return parsed
              .map(s => s.trim())
              .filter(s => s.length > 2)
              .slice(0, 3);
          }
        }
      } catch (e) {
        console.warn('Failed to parse suggestions as JSON, falling back to line splitting.');
      }

      // Fallback: Split by newline or standard bullet patterns (1., -, *, •)
      return replyText
        .split(/\n|(?=\b\d+\.)|(?=\b[-*•]\s)/)
        .map(line =>
          line
            .replace(/^\s*[-*•\d+.]\s*/, '')
            .replace(/["'\[\]]/g, '')
            .trim()
        )
        .filter(line => line.length > 2 && line.length < 100)
        .slice(0, 3);
    }
    return [];
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
};
