import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Voice assistant hook — Web Speech API.
 * Recognition: te-IN (Telugu) or en-IN based on `language` ('te' | 'en').
 * Synthesis: speaks bot replies aloud in the matching voice when enabled.
 * All optional/progressive — silently no-ops on unsupported browsers.
 */
const useVoiceAssistant = ({ language = 'te', onResult }) => {
  const [listening, setListening] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (_) {
      /* noop */
    }
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    // Cancel any ongoing speech so the mic doesn't hear the bot.
    try {
      window.speechSynthesis?.cancel();
    } catch (_) {
      /* noop */
    }

    const rec = new SR();
    rec.lang = language === 'te' ? 'te-IN' : 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    rec.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript || '';
      setListening(false);
      if (transcript && onResultRef.current) onResultRef.current(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch (_) {
      setListening(false);
    }
  }, [language]);

  const toggleListening = useCallback(() => {
    if (listening) stopListening();
    else startListening();
  }, [listening, startListening, stopListening]);

  /** Speak a reply aloud (used when speakEnabled). Strips markdown/emoji noise. */
  const speak = useCallback(
    (text) => {
      if (!speakEnabled || !window.speechSynthesis || !text) return;
      const clean = String(text)
        .replace(/[*_#`>~]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .slice(0, 320);
      if (!clean.trim()) return;

      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(clean);
      const targetLang = language === 'te' ? 'te' : 'en';
      const voices = window.speechSynthesis.getVoices() || [];
      const voice =
        voices.find((v) => v.lang?.toLowerCase().startsWith(targetLang === 'te' ? 'te' : 'en-in')) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith(targetLang)) ||
        null;
      if (voice) utter.voice = voice;
      utter.lang = language === 'te' ? 'te-IN' : 'en-IN';
      utter.rate = 0.98;
      window.speechSynthesis.speak(utter);
    },
    [language, speakEnabled]
  );

  // Stop everything on unmount
  useEffect(
    () => () => {
      try {
        recognitionRef.current?.stop();
        window.speechSynthesis?.cancel();
      } catch (_) {
        /* noop */
      }
    },
    []
  );

  return { supported, listening, toggleListening, stopListening, speak, speakEnabled, setSpeakEnabled };
};

export default useVoiceAssistant;
