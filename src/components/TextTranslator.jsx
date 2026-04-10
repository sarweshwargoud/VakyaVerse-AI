import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LANGUAGES, translateText, detectLanguageClientSide, analyzeSentiment } from '../utils/translationAPI';
import { addTranslation } from '../utils/historyManager';
import { TTS } from '../utils/ttsEngine';
import { debounce, createMagneticEffect } from '../utils/animations';
import TiltCard from './TiltCard';

const MAX_CHARS = 3000;

export default function TextTranslator({ onTranslationComplete, particleBurst }) {
    const [sourceLang, setSourceLang] = useState('auto');
    const [targetLang, setTargetLang] = useState('hi');
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState('');
    const [detected, setDetected] = useState(null);
    const [sentiment, setSentiment] = useState(null);
    const [copiedSuccess, setCopiedSuccess] = useState(false);

    const translateBtn = useRef(null);

    useEffect(() => {
        const removeMag = createMagneticEffect(translateBtn.current, 0.35);
        return () => removeMag?.();
    }, []);

    const autoDetect = useCallback(
        debounce((text) => {
            if (text.trim().length < 2 || sourceLang !== 'auto') return;
            const result = detectLanguageClientSide(text);
            setDetected(result);
        }, 300),
        [sourceLang]
    );

    const handleSourceChange = (e) => {
        const val = e.target.value.slice(0, MAX_CHARS);
        setSourceText(val);
        if (val.length > 2) autoDetect(val);
        if (!val) { setDetected(null); setTranslatedText(''); setSentiment(null); }
    };

    const handleSwap = () => {
        if (sourceLang === 'auto') return;
        const s = sourceLang; setSourceLang(targetLang); setTargetLang(s);
        setSourceText(translatedText); setTranslatedText(sourceText);
        setDetected(null);
    };

    const handleTranslate = async () => {
        if (!sourceText.trim()) return;
        setIsTranslating(true); setError('');
        try {
            const src = sourceLang === 'auto' ? (detected?.lang || 'auto') : sourceLang;
            const result = await translateText(sourceText, src, targetLang);
            setTranslatedText(result.translatedText);
            setSentiment(analyzeSentiment(sourceText));
            if (particleBurst && translateBtn.current) {
                const r = translateBtn.current.getBoundingClientRect();
                particleBurst(r.left + r.width / 2, r.top + r.height / 2, 25);
            }
            await addTranslation({
                sourceText, translatedText: result.translatedText,
                sourceLang: result.detectedLanguage || src, targetLang, mode: 'text',
            });
            onTranslationComplete?.();
        } catch (err) {
            setError(err.message === 'RATE_LIMIT' ? 'Too many requests — wait a moment.' : 'Translation failed. Please try again.');
        } finally { setIsTranslating(false); }
    };

    const handleCopy = () => {
        if (!translatedText) return;
        navigator.clipboard.writeText(translatedText).then(() => {
            setCopiedSuccess(true);
            setTimeout(() => setCopiedSuccess(false), 2000);
        });
    };

    const handleSpeak = () => {
        if (!translatedText) return;
        TTS.speak(translatedText, targetLang);
    };

    const INDIAN = LANGUAGES.filter(l => l.code !== 'auto' && l.region === 'India');
    const WORLD = LANGUAGES.filter(l => l.code !== 'auto' && l.region === 'World');

    return (
        <TiltCard
            maxTilt={6}
            glowColor="rgba(124,58,237,0.18)"
            scale={1.01}
            style={{ overflow: 'hidden' }}
        >
            {/* ── Header bar ── */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                gap: '12px', alignItems: 'center',
                padding: '18px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(0,0,0,0.15)',
            }}>
                {/* Source lang */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select
                        value={sourceLang}
                        onChange={e => { setSourceLang(e.target.value); setDetected(null); }}
                        className="select-glass"
                        aria-label="Source language"
                    >
                        <option value="auto">🔍 Auto Detect</option>
                        <optgroup label="── Indian Languages ──">
                            {INDIAN.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                        </optgroup>
                        <optgroup label="── World Top 5 ──">
                            {WORLD.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                        </optgroup>
                    </select>
                    <AnimatePresence>
                        {detected && sourceLang === 'auto' && (
                            <motion.span
                                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                style={{
                                    fontSize: '0.7rem', color: detected.isRomanized ? '#FCD34D' : 'var(--neon-secondary)',
                                    background: detected.isRomanized ? 'rgba(245,158,11,0.12)' : 'rgba(6,182,212,0.12)',
                                    padding: '2px 8px', borderRadius: '100px',
                                    border: `1px solid ${detected.isRomanized ? 'rgba(245,158,11,0.3)' : 'rgba(6,182,212,0.3)'}`,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {detected.isRomanized ? '✍ ' : ''}
                                {LANGUAGES.find(l => l.code === detected.lang)?.flag} {LANGUAGES.find(l => l.code === detected.lang)?.name}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Swap */}
                <motion.button
                    onClick={handleSwap}
                    disabled={sourceLang === 'auto'}
                    whileHover={sourceLang !== 'auto' ? { rotate: 180, scale: 1.15 } : {}}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: sourceLang === 'auto' ? 'transparent' : 'rgba(124,58,237,0.15)',
                        cursor: sourceLang === 'auto' ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', opacity: sourceLang === 'auto' ? 0.3 : 1,
                        transition: 'all 0.2s',
                    }}
                    aria-label="Swap languages"
                >⇄</motion.button>

                {/* Target lang */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <select value={targetLang} onChange={e => setTargetLang(e.target.value)} className="select-glass" aria-label="Target language">
                        <optgroup label="── Indian Languages ──">
                            {INDIAN.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                        </optgroup>
                        <optgroup label="── World Top 5 ──">
                            {WORLD.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                        </optgroup>
                    </select>
                </div>
            </div>

            {/* ── Text Areas ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', minHeight: '220px' }}>
                {/* Source */}
                <div style={{ position: 'relative' }}>
                    <textarea
                        value={sourceText}
                        onChange={handleSourceChange}
                        placeholder="Type or paste text here…"
                        className="textarea-glass"
                        style={{
                            height: '220px', resize: 'none', borderRadius: 0,
                            borderRight: 'none', borderLeft: 'none', borderTop: 'none', borderBottom: 'none',
                            background: 'transparent',
                        }}
                        aria-label="Source text"
                    />
                    <div style={{
                        position: 'absolute', bottom: '10px', right: '14px',
                        fontSize: '0.68rem', color: sourceText.length > MAX_CHARS * 0.9 ? '#F87171' : 'var(--text-muted)',
                    }}>
                        {sourceText.length}/{MAX_CHARS}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ background: 'rgba(255,255,255,0.06)', width: '1px' }} />

                {/* Output */}
                <div style={{ position: 'relative' }}>
                    <AnimatePresence mode="wait">
                        {isTranslating ? (
                            <motion.div key="loading"
                                animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }}
                                style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}
                            >
                                Translating…
                            </motion.div>
                        ) : translatedText ? (
                            <motion.div key="result" initial={{ opacity: 0, filter: 'blur(8px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }}
                                transition={{ duration: 0.4 }}
                                style={{
                                    padding: '20px', fontSize: '0.95rem', lineHeight: 1.65,
                                    color: 'var(--text-primary)', maxHeight: '220px', overflowY: 'auto'
                                }}
                            >
                                {translatedText}
                            </motion.div>
                        ) : (
                            <motion.p key="placeholder"
                                style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}
                            >
                                Translation will appear here…
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* Output actions */}
                    {translatedText && (
                        <div style={{ position: 'absolute', bottom: '10px', right: '12px', display: 'flex', gap: '6px' }}>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={handleCopy} className="btn-icon" title="Copy translation" style={{ fontSize: '0.9rem' }}>
                                {copiedSuccess ? '✅' : '📋'}
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={handleSpeak} className="btn-icon" title="Speak translation" style={{ fontSize: '0.9rem' }}>
                                🔊
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Footer Bar ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 24px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(0,0,0,0.1)',
            }}>
                {/* Sentiment */}
                <AnimatePresence>
                    {sentiment && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span style={{ fontSize: '1.1rem' }}>{sentiment.emoji}</span>
                            <span>{sentiment.emotion} tone</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Translate button */}
                <motion.button
                    ref={translateBtn}
                    onClick={handleTranslate}
                    disabled={!sourceText.trim() || isTranslating}
                    whileHover={sourceText.trim() ? { scale: 1.04 } : {}}
                    whileTap={{ scale: 0.97 }}
                    style={{
                        padding: '10px 28px',
                        background: sourceText.trim() ? 'var(--grad-primary)' : 'rgba(255,255,255,0.05)',
                        border: 'none', borderRadius: '10px',
                        color: sourceText.trim() ? 'white' : 'var(--text-muted)',
                        fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem',
                        cursor: sourceText.trim() ? 'pointer' : 'not-allowed',
                        boxShadow: sourceText.trim() ? '0 0 24px rgba(124,58,237,0.35)' : 'none',
                        transition: 'all 0.3s ease',
                    }}
                    aria-label="Translate text"
                >
                    {isTranslating ? '⏳ Translating…' : '✨ Translate'}
                </motion.button>
            </div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        style={{
                            padding: '10px 24px', background: 'rgba(239,68,68,0.1)', borderTop: '1px solid rgba(239,68,68,0.2)',
                            color: '#FCA5A5', fontSize: '0.82rem'
                        }}>
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </TiltCard>
    );
}
