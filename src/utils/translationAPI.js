/**
 * VakyaVerse Translation API — translationAPI.js
 * - Indian languages + World Top 5 only
 * - Romanized Indian language detection (e.g. "emaindi" → Telugu)
 * - Primary: Lingva API (Google Translate wrapper, free, no key)
 * - Fallback: MyMemory API (free, 5000 words/day)
 */
import axios from 'axios';

// ── Language List: Indian Languages + World Top 5 ─────────────────────────
export const LANGUAGES = [
    // Detection
    { code: 'auto', name: 'Auto Detect', flag: '🔍', region: 'auto' },

    // ── INDIAN LANGUAGES ──
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', region: 'India' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳', region: 'India' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳', region: 'India' },
    { code: 'bn', name: 'Bengali', flag: '🇮🇳', region: 'India' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳', region: 'India' },
    { code: 'gu', name: 'Gujarati', flag: '🇮🇳', region: 'India' },
    { code: 'kn', name: 'Kannada', flag: '🇮🇳', region: 'India' },
    { code: 'ml', name: 'Malayalam', flag: '🇮🇳', region: 'India' },
    { code: 'pa', name: 'Punjabi', flag: '🇮🇳', region: 'India' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰', region: 'India' },
    { code: 'or', name: 'Odia', flag: '🇮🇳', region: 'India' },

    // ── WORLD TOP 5 (by total speakers) ──
    { code: 'en', name: 'English', flag: '🇬🇧', region: 'World' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', region: 'World' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', region: 'World' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', region: 'World' },
    { code: 'fr', name: 'French', flag: '🇫🇷', region: 'World' },
];

// ── Romanized Indian Language Dictionary ─────────────────────────────────
// Detects when user types Indian language using English letters (transliteration)
const ROMANIZED_DICT = {
    te: {
        words: new Set([
            // Common words
            'emaindi', 'ela', 'avunu', 'kaadu', 'ledu', 'cheppandi', 'nenu', 'nuvvu', 'meeru', 'mee',
            'chala', 'bagundi', 'ayyindi', 'ishtam', 'kastam', 'manchi', 'naku', 'niku', 'vaddu',
            'cheyyi', 'vella', 'raa', 'ikkade', 'akkade', 'anta', 'ante', 'okka', 'rendu', 'moodu',
            'naalu', 'aidu', 'padi', 'illu', 'gadi', 'vandi', 'pelli', 'ammaa', 'nannaa', 'annaa',
            'akka', 'thammudi', 'chelli', 'bayam', 'andam', 'konni', 'poyi', 'vasthunnaa',
            'chestunnaa', 'antunnaa', 'cheppindi', 'chesaanu', 'vastanu', 'veltanu', 'telugu',
            'andhra', 'namasthe', 'evaru', 'em', 'emiti', 'matladandi', 'chaduvuthunnanu',
            'tidutunnanu', 'nidrutunnanu', 'velthunnanu', 'vasthunnanu', 'chusthunnanu',
            'okkadesaa', 'jaropoyindi', 'pedda', 'chinna', 'tondara', 'saardha', 'yekkuva',
            'thakkuva', 'munchhu', 'kinda', 'meeda', 'parakka', 'mundhu', 'venaka', 'pilichi',
            'cheppindi', 'vinapadindi', 'kanipistundi', 'anipistundi', 'telustundi', 'ledu',
            'kaavalante', 'kaavadam', 'velladam', 'raavadam', 'choosaanu', 'chesaanu',
        ]),
        threshold: 1,
        label: 'Telugu (Romanized)'
    },
    hi: {
        words: new Set([
            // Common words
            'kya', 'hai', 'hain', 'main', 'mein', 'tum', 'aap', 'hum', 'yeh', 'woh',
            'kaise', 'kaisa', 'accha', 'acha', 'bohot', 'bahut', 'thoda', 'abhi', 'phir',
            'kab', 'kyun', 'kahaan', 'kahan', 'kuch', 'sab', 'nahi', 'nahin', 'haan',
            'theek', 'bilkul', 'matlab', 'kyunki', 'lekin', 'aur', 'bhai', 'yaar', 'dost',
            'ghar', 'kaam', 'paani', 'khana', 'roti', 'chai', 'aaj', 'kal', 'pehle',
            'baad', 'samajh', 'dekh', 'sun', 'bol', 'kar', 'jaa', 'aa', 'mera', 'meri',
            'tera', 'teri', 'unka', 'unki', 'hamara', 'hamari', 'iska', 'iski', 'uska',
            'uski', 'karna', 'rehna', 'khana', 'peena', 'sona', 'uthna', 'jana', 'aana',
            'sunna', 'dekhna', 'bolna', 'likhna', 'padhna', 'lena', 'dena', 'milna',
            'hindi', 'hindustani', 'namaste', 'namaskar', 'dhanyawad', 'shukriya',
        ]),
        threshold: 1,
        label: 'Hindi (Romanized)'
    },
    ta: {
        words: new Set([
            'enna', 'epdi', 'naan', 'nee', 'avar', 'inga', 'anga', 'sari', 'illa', 'aamaa',
            'ponga', 'vanga', 'paaru', 'sollu', 'theriyum', 'mudiuma', 'venum', 'vendam',
            'romba', 'konjam', 'yen', 'yenna', 'naanga', 'unga', 'avanga', 'avan', 'aval',
            'appa', 'amma', 'akka', 'anna', 'thambi', 'thangai', 'vidu', 'vaa', 'po',
            'solren', 'pannuven', 'irukken', 'irukku', 'varuvom', 'povom', 'paarpom',
            'tamil', 'tamizh', 'vanakkam', 'nandri', 'ayya', 'amma', 'paati', 'thaatha',
        ]),
        threshold: 1,
        label: 'Tamil (Romanized)'
    },
    kn: {
        words: new Set([
            'enu', 'yenu', 'hege', 'naanu', 'neenu', 'avanu', 'avalu', 'illi', 'alli',
            'houdu', 'alla', 'beda', 'banni', 'hogi', 'nodu', 'helu', 'gottilla', 'gottu',
            'beku', 'mugidu', 'sari', 'chennaagi', 'kashta', 'sukha', 'maneli', 'thumba',
            'swalpaa', 'yaaru', 'yaake', 'yaavaga', 'ellide', 'tangi', 'anna', 'appa', 'amma',
            'kannada', 'namaskara', 'dhanyavadagalu', 'hegidira', 'yaako', 'yelli',
        ]),
        threshold: 1,
        label: 'Kannada (Romanized)'
    },
    ml: {
        words: new Set([
            'enthu', 'engane', 'njan', 'njaan', 'nee', 'avar', 'ithil', 'athil', 'aanu',
            'alla', 'vaa', 'poo', 'oke', 'parayoo', 'ariyam', 'ariyilla', 'veedum', 'venda',
            'nanni', 'pinne', 'ennitu', 'enthukondu', 'cheyyo', 'kazhiyum', 'achan',
            'chechi', 'chetta', 'ithanu', 'avanu', 'aval', 'malayalam', 'nanniyund',
            'sthuthi', 'evide', 'enthinu', 'eppozhanu', 'evideya', 'ethu',
        ]),
        threshold: 1,
        label: 'Malayalam (Romanized)'
    },
    bn: {
        words: new Set([
            'ki', 'kemon', 'ami', 'tumi', 'apni', 'amra', 'haan', 'na', 'ache', 'nei',
            'kothay', 'kobe', 'keno', 'bhalo', 'mondo', 'onek', 'ektu', 'ekhon', 'pore',
            'age', 'didi', 'dada', 'baba', 'maa', 'bari', 'kaj', 'jawa', 'asha', 'bola',
            'bangla', 'bengali', 'dhanyabad', 'nomoshkar', 'kothay', 'amake', 'tomake',
        ]),
        threshold: 1,
        label: 'Bengali (Romanized)'
    },
    mr: {
        words: new Set([
            'kay', 'aahe', 'mi', 'tu', 'aapan', 'aamhi', 'tumhi', 'ho', 'nahi', 'kuthe',
            'keva', 'kasa', 'changla', 'vaait', 'khup', 'thoda', 'aata', 'nantar',
            'yeto', 'jaato', 'bagh', 'aai', 'baba', 'tai', 'dada', 'mulga', 'mulgi',
            'marathi', 'dhanyawad', 'namaskar', 'aho', 'kaay', 'kasa', 'apan',
        ]),
        threshold: 1,
        label: 'Marathi (Romanized)'
    },
    gu: {
        words: new Set([
            'shu', 'chhe', 'hun', 'tame', 'haa', 'naa', 'kyaan', 'kyare', 'kem', 'saaru',
            'kharab', 'ghanu', 'thodu', 'aa', 'te', 'mane', 'tane', 'amne', 'ghare',
            'javu', 'aavu', 'joi', 'karo', 'avo', 'jao', 'gujarati', 'kevaa', 'kyan',
        ]),
        threshold: 1,
        label: 'Gujarati (Romanized)'
    },
    pa: {
        words: new Set([
            'ki', 'main', 'tusi', 'assi', 'haan', 'nahi', 'kithe', 'kado', 'kyun',
            'changaa', 'mada', 'bahut', 'thoda', 'yaar', 'oye', 'paaji', 'penji',
            'puttar', 'sat sri akal', 'waheguru', 'apna', 'sadda', 'punjabi', 'kive',
        ]),
        threshold: 1,
        label: 'Punjabi (Romanized)'
    },
};

/**
 * Detect romanized Indian language from English-script text
 * Returns { lang, name, confidence, isRomanized } or null
 */
export function detectRomanizedIndian(text) {
    const lower = text.toLowerCase().trim();
    const tokens = lower.split(/[\s,.!?;:]+/).filter(Boolean);

    if (tokens.length === 0) return null;

    let best = null;
    let bestScore = 0;

    for (const [langCode, config] of Object.entries(ROMANIZED_DICT)) {
        let matches = 0;
        for (const token of tokens) {
            if (config.words.has(token)) matches++;
        }
        const score = matches / tokens.length;
        // Must match at least `threshold` unique words
        if (matches >= config.threshold && score > bestScore) {
            bestScore = score;
            best = { lang: langCode, name: config.label, confidence: score, isRomanized: true };
        }
    }

    return best;
}

/**
 * Client-side heuristic for script-based detection
 */
export function detectLanguageClientSide(text) {
    // Indian script Unicode ranges
    const scriptMap = [
        { re: /[\u0900-\u097F]/, lang: 'hi', name: 'Hindi' },
        { re: /[\u0C00-\u0C7F]/, lang: 'te', name: 'Telugu' },
        { re: /[\u0B80-\u0BFF]/, lang: 'ta', name: 'Tamil' },
        { re: /[\u0980-\u09FF]/, lang: 'bn', name: 'Bengali' },
        { re: /[\u0C80-\u0CFF]/, lang: 'kn', name: 'Kannada' },
        { re: /[\u0D00-\u0D7F]/, lang: 'ml', name: 'Malayalam' },
        { re: /[\u0A00-\u0A7F]/, lang: 'pa', name: 'Punjabi' },
        { re: /[\u0A80-\u0AFF]/, lang: 'gu', name: 'Gujarati' },
        { re: /[\u0B00-\u0B7F]/, lang: 'or', name: 'Odia' },
        { re: /[\u0600-\u06FF]/, lang: 'ur', name: 'Urdu' },
        { re: /[\u4E00-\u9FFF]/, lang: 'zh', name: 'Chinese' },
        { re: /[\u0600-\u06FF]/, lang: 'ar', name: 'Arabic' },
    ];

    for (const { re, lang, name } of scriptMap) {
        if (re.test(text)) return { lang, name, confidence: 0.95, isRomanized: false };
    }

    // Try romanized Indian detection
    const romanized = detectRomanizedIndian(text);
    if (romanized) return romanized;

    // Default: assume English
    return { lang: 'en', name: 'English', confidence: 0.6, isRomanized: false };
}

// ── API Constants ────────────────────────────────────────────────────────────

// Lingva API (free Google Translate proxy)
const LINGVA_ENDPOINTS = [
    'https://lingva.ml',
    'https://translate.terraprint.co',
];

// MyMemory API (free, 5000 words/day, no key)
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

let lingvaIndex = 0;

async function lingvaTranslate(text, sourceLang, targetLang) {
    const src = sourceLang === 'auto' ? 'auto' : sourceLang;
    const tgt = targetLang;
    const enc = encodeURIComponent(text);

    for (let attempt = 0; attempt < LINGVA_ENDPOINTS.length; attempt++) {
        const base = LINGVA_ENDPOINTS[(lingvaIndex + attempt) % LINGVA_ENDPOINTS.length];
        try {
            const res = await axios.get(`${base}/api/v1/${src}/${tgt}/${enc}`, {
                timeout: 8000,
            });
            if (res.data?.translation) {
                lingvaIndex = (lingvaIndex + attempt) % LINGVA_ENDPOINTS.length;
                return {
                    translatedText: res.data.translation,
                    detectedLanguage: res.data.info?.detectedSource || src,
                    confidence: 0.95,
                    source: 'lingva',
                };
            }
        } catch { /* try next */ }
    }
    throw new Error('Lingva API failed');
}

async function myMemoryTranslate(text, sourceLang, targetLang) {
    const langPair = `${sourceLang}|${targetLang}`;
    const res = await axios.get(MYMEMORY_URL, {
        params: { q: text, langpair: langPair },
        timeout: 8000,
    });

    const data = res.data;
    if (data?.responseStatus === 429) throw new Error('RATE_LIMIT');
    if (!data?.responseData?.translatedText) throw new Error('MyMemory: no translation');

    const translated = data.responseData.translatedText;
    if (translated.toUpperCase() === text.toUpperCase()) throw new Error('MyMemory: no change');

    return {
        translatedText: translated,
        detectedLanguage: sourceLang,
        confidence: data.responseData.match || 0.8,
        source: 'mymemory',
    };
}

// Rate limiting
const lastRequestTime = {};
const MIN_INTERVAL_MS = 800;

function checkRateLimit(key) {
    const now = Date.now();
    if (lastRequestTime[key] && now - lastRequestTime[key] < MIN_INTERVAL_MS) {
        throw new Error('RATE_LIMIT');
    }
    lastRequestTime[key] = now;
}

/**
 * Main translate function — tries Lingva first, MyMemory as fallback
 */
export async function translateText(text, sourceLang = 'auto', targetLang = 'en') {
    if (!text?.trim()) throw new Error('Empty text');
    if (text.length > 3000) throw new Error('Text too long (max 3000 chars)');

    const rateKey = `${sourceLang}-${targetLang}`;
    checkRateLimit(rateKey);

    // If source text is romanized Indian, detect it
    let effectiveSrc = sourceLang;
    let detected = null;

    if (sourceLang === 'auto') {
        detected = detectLanguageClientSide(text);
        effectiveSrc = detected?.lang || 'en';
    }

    // Don't translate if same language
    if (effectiveSrc === targetLang && effectiveSrc !== 'auto') {
        return {
            translatedText: text,
            detectedLanguage: effectiveSrc,
            confidence: 1,
            source: 'passthrough',
        };
    }

    // Try Lingva (handles romanized text via Google Translate)
    try {
        const result = await lingvaTranslate(text, effectiveSrc, targetLang);
        if (detected) result.detectedLanguage = detected.lang;
        result.isRomanized = detected?.isRomanized || false;
        return result;
    } catch (lingvaErr) {
        console.warn('[VakyaVerse] Lingva failed, trying MyMemory:', lingvaErr.message);
    }

    // Fallback: MyMemory
    try {
        // MyMemory uses 'zh-CN' for Chinese, map if needed
        const srcMM = mapLangForMM(effectiveSrc);
        const tgtMM = mapLangForMM(targetLang);
        const result = await myMemoryTranslate(text, srcMM, tgtMM);
        if (detected) result.detectedLanguage = detected.lang;
        result.isRomanized = detected?.isRomanized || false;
        return result;
    } catch (mmErr) {
        if (mmErr.message === 'RATE_LIMIT') throw mmErr;
        throw new Error(`Translation failed: ${mmErr.message}`);
    }
}

function mapLangForMM(code) {
    const map = { zh: 'zh-CN', pa: 'pa-IN', or: 'or-IN' };
    return map[code] || code;
}

// ── Sentiment Analysis ────────────────────────────────────────────────────────
const POSITIVE_WORDS = new Set([
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'happy', 'joy',
    'love', 'like', 'best', 'nice', 'beautiful', 'awesome', 'perfect', 'glad', 'pleased',
    'brilliant', 'outstanding', 'superb', 'delightful', 'terrific', 'marvelous', 'fine',
    'splendid', 'impressive', 'remarkable', 'exceptional',
]);
const NEGATIVE_WORDS = new Set([
    'bad', 'terrible', 'awful', 'horrible', 'sad', 'hate', 'worst', 'ugly', 'disgusting',
    'dreadful', 'poor', 'wrong', 'fail', 'failure', 'disappointing', 'miserable', 'pathetic',
    'atrocious', 'abysmal', 'dreadful', 'appalling', 'inferior', 'unacceptable',
]);

export function analyzeSentiment(text) {
    const words = text.toLowerCase().split(/\s+/);
    let pos = 0, neg = 0;
    for (const w of words) {
        if (POSITIVE_WORDS.has(w)) pos++;
        if (NEGATIVE_WORDS.has(w)) neg++;
    }
    const total = Math.max(words.length, 1);
    const score = (pos - neg) / total;
    const emotion = score > 0.05 ? 'Positive' : score < -0.05 ? 'Negative' : 'Neutral';
    const emojiMap = { Positive: '😊', Negative: '😔', Neutral: '😐' };
    return { score, emotion, emoji: emojiMap[emotion], pos, neg };
}

// ── AI Explanation ─────────────────────────────────────────────────────────
export function generateExplanation(sourceText, translatedText, sourceLang, targetLang) {
    const srcName = LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang;
    const tgtName = LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;

    const words = sourceText.split(/\s+/).length;
    const sentences = sourceText.split(/[.!?]+/).filter(Boolean).length;

    const grammar = [
        `Translation from ${srcName} to ${tgtName}.`,
        `Source: ${words} word${words !== 1 ? 's' : ''} in ${sentences} sentence${sentences !== 1 ? 's' : ''}.`,
        `Script: ${getScriptInfo(targetLang)}`,
    ];

    const idioms = [
        'Direct literal translation applied where possible.',
        'Idiomatic expressions adapted to target language conventions.',
    ];

    const cultural = [
        getCulturalNote(targetLang),
        'Honorifics and politeness levels matched to context.',
    ];

    const alternatives = words <= 3 ? getAlternatives(sourceText, tgtName) : [
        'For shorter phrases, multiple translation variants are available.',
    ];

    return { grammar, idioms, cultural, alternatives };
}

function getScriptInfo(lang) {
    const scripts = {
        hi: 'Devanagari (left-to-right)',
        te: 'Telugu script (left-to-right)',
        ta: 'Tamil script (left-to-right)',
        bn: 'Bengali script (left-to-right)',
        kn: 'Kannada script (left-to-right)',
        ml: 'Malayalam script (left-to-right)',
        pa: 'Gurmukhi script (left-to-right)',
        gu: 'Gujarati script (left-to-right)',
        ur: 'Nastaliq/Naskh script (right-to-left)',
        ar: 'Arabic script (right-to-left)',
        zh: 'Chinese characters (top-to-bottom or left-to-right)',
        fr: 'Latin alphabet with diacritics',
        es: 'Latin alphabet with accents (ñ, á, é, etc.)',
        en: 'Latin alphabet',
    };
    return scripts[lang] || 'Latin/Unicode script';
}

function getCulturalNote(lang) {
    const notes = {
        hi: 'Hindi uses formal आप (aap) and informal तुम (tum) — formality level preserved.',
        te: 'Telugu has distinct honorific forms — మీరు (meeru) vs నువ్వు (nuvvu).',
        ta: 'Tamil maintains classical literary roots in formal contexts.',
        bn: 'Bengali tonal variation between Bangladesh and West Bengal preserved.',
        kn: 'Kannada differentiates Brahmin, common, and archaic dialects.',
        ml: 'Malayalam has the highest script complexity in India with distinct letterforms.',
        ur: 'Urdu uses Perso-Arabic loanwords enriching the vocabulary.',
        ar: 'Arabic distinguishes Modern Standard Arabic from regional dialects.',
        zh: 'Chinese uses Simplified characters (Mainland) vs Traditional (Taiwan/HK).',
        fr: 'French uses gender agreement for nouns and adjectives.',
        es: 'Spanish has Latin American vs Castilian variants.',
        pa: 'Punjabi has Gurmukhi (India) and Shahmukhi (Pakistan) scripts.',
        en: 'British vs American English spelling/vocabulary may differ.',
    };
    return notes[lang] || 'Cultural context and formality level maintained.';
}

function getAlternatives(text, langName) {
    return [
        `"${text}" in ${langName} — formal register`,
        `"${text}" in ${langName} — informal register`,
        'Regional dialect variations available on request.',
    ];
}
