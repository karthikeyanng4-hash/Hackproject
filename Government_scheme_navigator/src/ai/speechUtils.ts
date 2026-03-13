
/**
 * Speech utility for consistent TTS across the application.
 * Particularly focuses on selecting reliable Tamil (ta-IN) and Hindi (hi-IN) voices.
 */

let voices: SpeechSynthesisVoice[] = [];
let isSpeechEnabled = false;

// Initialize voices
const loadVoices = () => {
  voices = window.speechSynthesis.getVoices();
};

if ('speechSynthesis' in window) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Gets the best voice for a given language code (BCP-47)
 */
const getBestVoice = (langCode: string): SpeechSynthesisVoice | null => {
  if (voices.length === 0) loadVoices();
  
  // Try to find an exact match for the language code
  const exactMatch = voices.find(v => v.lang === langCode);
  if (exactMatch) return exactMatch;

  // Try to find a match for the primary language (e.g., 'ta' for 'ta-IN')
  const primaryLang = langCode.split('-')[0];
  const langMatch = voices.find(v => v.lang.startsWith(primaryLang));
  if (langMatch) return langMatch;

  return null;
};

/**
 * Speaks the provided text in the specified language.
 * @param text The text to speak
 * @param lang The language code (en, hi, ta)
 * @param isMuted If true, will not speak
 */
export const speakText = (text: string, lang: string, isMuted: boolean = false): Promise<void> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window) || isMuted || !isSpeechEnabled) {
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const langMap: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      ta: 'ta-IN'
    };

    const targetLang = langMap[lang] || 'en-IN';
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language
    utterance.lang = targetLang;
    
    // Try to find a specific voice for better quality/reliability
    const voice = getBestVoice(targetLang);
    if (voice) {
      console.log(`SpeechUtils: Using voice ${voice.name} for ${targetLang}`);
      utterance.voice = voice;
    } else {
      console.warn(`SpeechUtils: No specific voice found for ${targetLang}, falling back to default.`);
    }

    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance error', event);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Stops all ongoing speech
 */
export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Updates the speech enabled state and stops speech if disabled.
 */
export const setSpeechEnabled = (enabled: boolean) => {
  isSpeechEnabled = enabled;
  if (!enabled) {
    stopSpeaking();
  }
};
