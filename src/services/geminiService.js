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
    } else {
      const guestToken = localStorage.getItem('aisa_guest_token');
      const guestId = localStorage.getItem('aisa_guest_id');
      if (guestToken) headers['X-Guest-Token'] = guestToken;
      if (guestId) headers['X-Guest-Id'] = guestId;
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

    // Image generation, image editing, and document conversion need the regular
    // endpoint: it parses the model's action JSON and executes the corresponding
    // pipeline before returning an image URL or converted file. The SSE endpoint
    // streams that JSON as display text, which prevents the action from running.
    const requiresCompletedResponse = [
      'IMAGE_GENERATION',
      'IMAGE_GEN',
      'IMAGE_EDIT',
      'DOCUMENT_CONVERT',
      'FILE_CONVERSION',
    ].includes(mode);

    const requestTimeout = isSearchMode || requiresCompletedResponse ? 180000 : 60000;

    // Stream normal text answers, but wait for a complete response for actions.
    if (onTokenChunk && !requiresCompletedResponse) {
      try {
        const streamRes = await generateChatResponseStream(
          history,
          currentMessage,
          systemInstruction,
          attachments,
          language,
          onTokenChunk,
          abortSignal,
          mode,
          sessionId,
          projectId,
          userMsgId,
          aiMsgId,
          aspectRatio,
          modelId
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

    const resGuestToken = result.headers?.['x-guest-token'] || result.headers?.['X-Guest-Token'];
    const resGuestId = result.headers?.['x-guest-id'] || result.headers?.['X-Guest-Id'];
    if (resGuestToken) localStorage.setItem('aisa_guest_token', resGuestToken);
    if (resGuestId) localStorage.setItem('aisa_guest_id', resGuestId);

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

    // Intercept Login Required / Guest Limit Reached
    if (
      error.response?.status === 401 ||
      error.response?.data?.code === 'LOGIN_REQUIRED' ||
      error.response?.data?.code === 'GUEST_LIMIT_REACHED' ||
      error.response?.data?.error === 'LIMIT_REACHED'
    ) {
      const toolName = error.response?.data?.toolName || 'AISA™ Magic Tools';
      const customMessage =
        error.response?.data?.message ||
        (error.response?.data?.code === 'GUEST_LIMIT_REACHED'
          ? 'You have reached the 5-chat limit for Guest Mode. Please log in or create an account to continue.'
          : '');
      window.dispatchEvent(
        new CustomEvent('login_required', {
          detail: {
            toolName,
            customMessage,
          },
        })
      );
      throw error;
    }

    // Handle credit / plan errors
    if (error.response?.status === 403) {
      const code = error.response?.data?.code;
      const message = error.response?.data?.message || error.response?.data?.error;
      const toolName = error.response?.data?.toolName || mode || 'Deep Search';

      window.dispatchEvent(
        new CustomEvent('quota_exceeded', {
          detail: {
            code: code || 'PLAN_RESTRICTED',
            toolName,
            customMessage: message,
          },
        })
      );
      throw error;
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
  } else {
    const guestToken = localStorage.getItem('aisa_guest_token');
    const guestId = localStorage.getItem('aisa_guest_id');
    if (guestToken) headers['X-Guest-Token'] = guestToken;
    if (guestId) headers['X-Guest-Id'] = guestId;
  }

  let finalMessage = currentMessage;
  const images = [];
  const documents = [];

  // Streaming is the default chat path. Include attachments here as well as in
  // the non-streaming fallback so uploaded files reach the AI in both cases.
  if (attachments && Array.isArray(attachments)) {
    attachments.forEach(attachment => {
      if (attachment.url && attachment.url.startsWith('data:')) {
        const base64Data = attachment.url.split(',')[1];
        const mimeType = attachment.url.substring(
          attachment.url.indexOf(':') + 1,
          attachment.url.indexOf(';')
        );

        if (attachment.type === 'image' || mimeType.startsWith('image/')) {
          images.push({ mimeType, base64Data, name: attachment.name });
        } else {
          documents.push({
            mimeType: mimeType || 'application/octet-stream',
            base64Data,
            name: attachment.name,
          });
        }
      } else if (attachment.url) {
        const isImage =
          attachment.type === 'image' ||
          (attachment.name && /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(attachment.name)) ||
          attachment.mimeType?.startsWith('image/');

        if (isImage) {
          images.push({
            url: attachment.url,
            name: attachment.name,
            mimeType: attachment.mimeType,
          });
        } else {
          documents.push({
            url: attachment.url,
            name: attachment.name,
            mimeType: attachment.mimeType,
          });
        }
        finalMessage += `\n[Shared File: ${attachment.name || 'Link'} - ${attachment.url}]`;
      }
    });
  }

  const payload = {
    content: finalMessage,
    history: history.length > 50 ? history.slice(-50) : history,
    systemInstruction: (systemInstruction || '').trim(),
    image: images,
    document: documents,
    language,
    mode,
    sessionId,
    projectId,
    userMsgId,
    aiMsgId,
    aspectRatio,
    modelId,
  };

  const streamEndpoint =
    apis.chatAgentStream ||
    (apis.chatAgent.endsWith('/') ? `${apis.chatAgent}stream` : `${apis.chatAgent}/stream`);

  const response = await fetch(streamEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: abortSignal,
  });

  const resGuestToken = response.headers?.get?.('x-guest-token');
  const resGuestId = response.headers?.get?.('x-guest-id');
  if (resGuestToken) localStorage.setItem('aisa_guest_token', resGuestToken);
  if (resGuestId) localStorage.setItem('aisa_guest_id', resGuestId);

  if (!response.ok || !response.body) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch (e) {}

    if (
      response.status === 401 ||
      errorData?.code === 'LOGIN_REQUIRED' ||
      errorData?.code === 'GUEST_LIMIT_REACHED' ||
      errorData?.error === 'LIMIT_REACHED'
    ) {
      window.dispatchEvent(
        new CustomEvent('login_required', {
          detail: {
            toolName: errorData?.toolName || 'AISA™ Magic Tools',
            customMessage:
              errorData?.message ||
              (errorData?.code === 'GUEST_LIMIT_REACHED'
                ? 'You have reached the 5-chat limit for Guest Mode. Please log in or create an account to continue.'
                : ''),
          },
        })
      );
      throw new Error(errorData?.message || 'Login required');
    }

    if (response.status === 403) {
      window.dispatchEvent(
        new CustomEvent('quota_exceeded', {
          detail: {
            code: errorData?.code || 'PLAN_RESTRICTED',
            toolName: errorData?.toolName || mode || 'Deep Search',
            customMessage: errorData?.message || errorData?.error,
          },
        })
      );
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
        const dataStr = line.replace('data: ', '').trim();
        if (dataStr === '[DONE]') {
          reader.cancel().catch(() => {});
          break;
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (
            parsed.error === 'LOGIN_REQUIRED' ||
            parsed.code === 'LOGIN_REQUIRED' ||
            parsed.error === 'LIMIT_REACHED' ||
            parsed.code === 'GUEST_LIMIT_REACHED'
          ) {
            window.dispatchEvent(
              new CustomEvent('login_required', {
                detail: {
                  toolName: parsed.toolName || 'AISA™ Magic Tools',
                  customMessage:
                    parsed.message ||
                    (parsed.code === 'GUEST_LIMIT_REACHED'
                      ? 'You have reached the 5-chat limit for Guest Mode. Please log in or create an account to continue.'
                      : ''),
                },
              })
            );
            reader.cancel().catch(() => {});
            throw new Error(parsed.message || 'Login required');
          }
          if (parsed.text) {
            accumulatedText += parsed.text;
            if (onTokenChunk) onTokenChunk(accumulatedText);
          }
        } catch (e) {
          if (e.message === 'Login required') throw e;
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
