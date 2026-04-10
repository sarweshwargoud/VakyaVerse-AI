// Text-to-Speech Engine using Web Speech API
let currentUtterance = null;
let wordCallback = null;
let endCallback = null;

export const TTS = {
    isSupported: () => 'speechSynthesis' in window,

    getVoices: () => {
        return new Promise((resolve) => {
            let voices = window.speechSynthesis.getVoices();
            if (voices.length) { resolve(voices); return; }
            window.speechSynthesis.onvoiceschanged = () => {
                resolve(window.speechSynthesis.getVoices());
            };
            // Fallback timeout
            setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
        });
    },

    getCategorizedVoices: async () => {
        const voices = await TTS.getVoices();
        const male = voices.filter(v =>
            v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('guy') ||
            v.name.toLowerCase().includes('james') ||
            v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('alex') ||
            v.name.toLowerCase().includes('mark') ||
            v.name.toLowerCase().includes('google uk english male')
        );
        const female = voices.filter(v => !male.includes(v));
        return { male, female, all: voices };
    },

    speak: (text, { voice, rate = 1, pitch = 1, lang = 'en', onWord, onEnd, onPause } = {}) => {
        TTS.stop();
        if (!TTS.isSupported()) return;

        const words = text.split(/\s+/);
        let wordIndex = 0;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.lang = lang;
        if (voice) utterance.voice = voice;

        utterance.onboundary = (e) => {
            if (e.name === 'word' && onWord) {
                onWord(wordIndex, words[wordIndex]);
                wordIndex++;
            }
        };

        utterance.onend = () => {
            currentUtterance = null;
            if (onEnd) onEnd();
        };

        utterance.onerror = () => {
            currentUtterance = null;
            if (onEnd) onEnd();
        };

        currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
        return utterance;
    },

    pause: () => {
        if (window.speechSynthesis.speaking) window.speechSynthesis.pause();
    },

    resume: () => {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    },

    stop: () => {
        window.speechSynthesis.cancel();
        currentUtterance = null;
    },

    isSpeaking: () => window.speechSynthesis.speaking,
    isPaused: () => window.speechSynthesis.paused,
};
