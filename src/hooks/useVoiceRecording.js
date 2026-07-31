import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useVoiceRecording = ({ currentLang, onTranscriptComplete }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const isManualStopRef = useRef(false);

  const stopListening = useCallback(() => {
    isManualStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('[useVoiceRecording] Error stopping recognition:', e);
      }
    }
    setIsListening(false);
  }, []);

  const handleVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    isManualStopRef.current = false;
    transcriptRef.current = '';

    const langMap = {
      Hindi: 'hi-IN',
      English: 'en-US',
      Spanish: 'es-ES',
      French: 'fr-FR',
      German: 'de-DE',
      Japanese: 'ja-JP',
    };
    recognition.lang = langMap[currentLang] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      transcriptRef.current = transcript;
    };

    recognition.onend = () => {
      setIsListening(false);
      const text = transcriptRef.current.trim();
      if (!isManualStopRef.current && text && onTranscriptComplete) {
        onTranscriptComplete(text);
      }
      isManualStopRef.current = false;
    };

    recognition.onerror = (event) => {
      console.error('[useVoiceRecording] Speech error:', event.error);
      setIsListening(false);
      isManualStopRef.current = true;
      if (event.error === 'not-allowed') toast.error('Microphone access denied');
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('[useVoiceRecording] Failed to start:', e);
    }
  }, [isListening, currentLang, stopListening, onTranscriptComplete]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    handleVoiceInput,
    stopListening,
  };
};

export default useVoiceRecording;
