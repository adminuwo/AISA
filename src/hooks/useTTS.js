import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apis } from '../types';
import { getUserData } from '../userStore/userData';
import { cleanTextForTTS } from '../utils/chatHelpers';

export const useTTS = ({ currentLang, voiceName, speed = 1.0, pitch = 0 } = {}) => {
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef(null);
  const audioCacheRef = useRef({});
  const objectURLsRef = useRef(new Set());
  const speechQueueRef = useRef([]);
  const isSpeakingRef = useRef(false);
  const currentSpeechResolverRef = useRef(null);

  // Revoke all created object URLs on unmount
  useEffect(() => {
    const urls = objectURLsRef.current;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      urls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          console.warn('[useTTS] Failed to revoke URL:', e);
        }
      });
      urls.clear();
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setSpeakingMessageId(null);
    setIsPaused(false);
    speechQueueRef.current = [];
    isSpeakingRef.current = false;
    if (currentSpeechResolverRef.current) {
      currentSpeechResolverRef.current();
      currentSpeechResolverRef.current = null;
    }
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeSpeaking = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(e => console.error('[useTTS] Resume failed:', e));
      setIsPaused(false);
    }
  }, []);

  const executeSpeak = useCallback(
    async (
      text,
      language,
      msgId,
      attachments = [],
      reqVoiceName = null,
      reqSpeed = null,
      reqPitch = null,
      onAudioReady = null
    ) => {
      return new Promise(async resolve => {
        currentSpeechResolverRef.current = resolve;
        try {
          let audioBlob = null;
          let activeVoiceName = (typeof reqVoiceName === 'string' && reqVoiceName) ? reqVoiceName : (typeof voiceName === 'string' && voiceName ? voiceName : 'en-US-Chirp3-HD-Autonoe');
          if (typeof activeVoiceName === 'string' && activeVoiceName.startsWith('XA-Chirp3-HD-')) {
            activeVoiceName = activeVoiceName.replace(/^XA-Chirp3-HD-/, 'ar-XA-Chirp3-HD-');
          }
          const activeSpeed = reqSpeed !== null && reqSpeed !== undefined ? reqSpeed : speed;
          const activePitch = reqPitch !== null && reqPitch !== undefined ? reqPitch : pitch;

          // Extract language code from voiceName if available
          let targetLang = 'en-US';
          if (activeVoiceName && activeVoiceName.includes('-Chirp3-HD-')) {
            targetLang = activeVoiceName.split('-Chirp3-HD-')[0];
            if (targetLang === 'XA') targetLang = 'ar-XA';
          } else {
            const langMap = {
              Hindi: 'hi-IN',
              English: 'en-US',
              Spanish: 'es-ES',
              French: 'fr-FR',
              German: 'de-DE',
              Japanese: 'ja-JP',
            };
            targetLang = langMap[language || currentLang] || 'en-US';
          }

          const readableAttachment =
            attachments && attachments.length > 0
              ? attachments.find(
                  a =>
                    a.type &&
                    (a.type.includes('pdf') ||
                      a.type.includes('word') ||
                      a.type.includes('document') ||
                      a.type.includes('text') ||
                      a.type.startsWith('image/'))
                )
              : null;

          if (msgId && audioCacheRef.current[msgId]) {
            audioBlob = audioCacheRef.current[msgId];
          } else {
            if (readableAttachment) {
              toast.loading('Processing file & text...', { id: 'voice-loading' });
              const fileRes = await fetch(readableAttachment.url);
              const fileBlob = await fileRes.blob();

              const base64Data = await new Promise(res => {
                const reader = new FileReader();
                reader.onloadend = () => res(reader.result.split(',')[1]);
                reader.readAsDataURL(fileBlob);
              });

              const headerText = text ? cleanTextForTTS(text) : '';
              const response = await axios.post(
                apis.synthesizeFile,
                {
                  fileData: base64Data,
                  mimeType: readableAttachment.type || 'application/pdf',
                  languageCode: targetLang,
                  voiceName: activeVoiceName,
                  speakingRate: activeSpeed,
                  pitch: activePitch,
                  introText: headerText,
                },
                {
                  responseType: 'arraybuffer',
                  headers: { Authorization: `Bearer ${getUserData()?.token}` },
                }
              );

              audioBlob = new Blob([response.data], {
                type: response.headers['content-type'] || 'audio/wav',
              });
              toast.dismiss('voice-loading');
            } else {
              if (!text) {
                resolve();
                return;
              }

              const cleanText = cleanTextForTTS(text);
              if (!cleanText) {
                resolve();
                return;
              }

              const token = getUserData()?.token || localStorage.getItem('token');
              const response = await axios.post(
                apis.synthesize,
                {
                  text: cleanText,
                  languageCode: targetLang,
                  voiceName: activeVoiceName,
                  speakingRate: activeSpeed,
                  pitch: activePitch,
                },
                {
                  responseType: 'arraybuffer',
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
              );

              audioBlob = new Blob([response.data], {
                type: response.headers['content-type'] || 'audio/wav',
              });
            }

            if (msgId && audioBlob) {
              audioCacheRef.current[msgId] = audioBlob;
            }
          }

          if (!audioBlob) {
            resolve();
            return;
          }

          // Audio Convert renders its own player. Hand the generated audio back
          // to that player instead of creating a second, hidden browser player.
          if (typeof onAudioReady === 'function') {
            onAudioReady(audioBlob);
            currentSpeechResolverRef.current = null;
            resolve();
            return;
          }

          const audioUrl = URL.createObjectURL(audioBlob);
          objectURLsRef.current.add(audioUrl);

          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            objectURLsRef.current.delete(audioUrl);
            currentSpeechResolverRef.current = null;
            resolve();
          };

          audio.onerror = e => {
            console.error('[useTTS] Audio playback error:', e);
            URL.revokeObjectURL(audioUrl);
            objectURLsRef.current.delete(audioUrl);
            currentSpeechResolverRef.current = null;
            resolve();
          };

          audio.play().catch(err => {
            console.error('[useTTS] Play failed:', err);
            currentSpeechResolverRef.current = null;
            resolve();
          });
        } catch (err) {
          console.error('[useTTS] Synthesis error:', err);
          toast.dismiss('voice-loading');
          toast.error('Voice playback failed');
          currentSpeechResolverRef.current = null;
          resolve();
        }
      });
    },
    [currentLang, voiceName, speed, pitch]
  );

  const processQueue = useCallback(async () => {
    if (isSpeakingRef.current || speechQueueRef.current.length === 0) return;

    isSpeakingRef.current = true;
    const currentItem = speechQueueRef.current[0];
    setSpeakingMessageId(currentItem.msgId);
    setIsPaused(false);

    await executeSpeak(
      currentItem.text,
      currentItem.language,
      currentItem.msgId,
      currentItem.attachments,
      currentItem.voiceName,
      currentItem.speed,
      currentItem.pitch,
      currentItem.onAudioReady
    );

    speechQueueRef.current.shift();
    isSpeakingRef.current = false;

    if (speechQueueRef.current.length > 0) {
      processQueue();
    } else {
      setSpeakingMessageId(null);
      setIsPaused(false);
    }
  }, [executeSpeak]);

  const speakResponse = useCallback(
    (
      text,
      language,
      msgId,
      attachments = [],
      reqVoiceName = null,
      reqSpeed = null,
      reqPitch = null,
      onAudioReady = null
    ) => {
      if (speakingMessageId === msgId) {
        if (isPaused) {
          resumeSpeaking();
        } else {
          pauseSpeaking();
        }
        return;
      }

      stopSpeaking();
      speechQueueRef.current = [{
        text,
        language,
        msgId,
        attachments,
        voiceName: reqVoiceName,
        speed: reqSpeed,
        pitch: reqPitch,
        onAudioReady,
      }];
      processQueue();
    },
    [speakingMessageId, isPaused, resumeSpeaking, pauseSpeaking, stopSpeaking, processQueue]
  );

  return {
    speakingMessageId,
    isPaused,
    speakResponse,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
  };
};

export default useTTS;
