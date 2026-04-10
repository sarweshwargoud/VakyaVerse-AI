import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LANGUAGES, translateText } from '../utils/translationAPI';
import { addTranslation } from '../utils/historyManager';
import TiltCard from './TiltCard';

export default function VoiceTranslator({ particleBurst }) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [translated, setTranslated] = useState('');
    const [sourceLang, setSourceLang] = useState('te-TE');
    const [targetLang, setTargetLang] = useState('hi');
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState('');

    const recognitionRef = useRef(null);
    const micBtnRef = useRef(null);

    const INDIAN = LANGUAGES.filter(l => l.code !== 'auto' && l.region === 'India');
    const WORLD = LANGUAGES.filter(l => l.code !== 'auto' && l.region === 'World');

    const doTranslate = async (text) => {
        if (!text.trim()) return;
        setIsTranslating(true);
        try {
            const srcCode = sourceLang.split('-')[0];
            const result = await translateText(text, srcCode, targetLang);
            setTranslated(result.translatedText);

            if ('speechSynthesis' in window) {
                const utt = new SpeechSynthesisUtterance(result.translatedText);
                utt.lang = targetLang; utt.rate = 0.9;
                window.speechSynthesis.speak(utt);
            }

            await addTranslation({
                sourceText: text, translatedText: result.translatedText,
                sourceLang: srcCode, targetLang, mode: 'voice',
            });

            if (particleBurst && micBtnRef.current) {
                const r = micBtnRef.current.getBoundingClientRect();
                particleBurst(r.left + r.width / 2, r.top + r.height / 2, 20);
            }
        } catch {
            setError('Translation failed. Try again.');
        } finally {
            setIsTranslating(false);
        }
    };

    const startRecording = useCallback(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { setError('Speech recognition not supported in this browser.'); return; }

        const rec = new SR();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = sourceLang;

        let lastText = '';
        rec.onresult = (e) => {
            lastText = Array.from(e.results).map(r => r[0].transcript).join('');
            setTranscript(lastText);
        };
        rec.onend = () => {
            setIsRecording(false);
            if (lastText.trim()) doTranslate(lastText);
        };
        rec.onerror = (e) => { setError(`Error: ${e.error}`); setIsRecording(false); };

        recognitionRef.current = rec;
        rec.start();
        setIsRecording(true);
        setTranscript('');
        setTranslated('');
        setError('');
    }, [sourceLang, targetLang]);

    const stopRecording = () => { recognitionRef.current?.stop(); };

    const srcLang = INDIAN.concat(WORLD).find(l => `${l.code}-${l.code.toUpperCase()}` === sourceLang)
        || LANGUAGES.find(l => l.code === sourceLang.split('-')[0]);

    return (
        <TiltCard
            maxTilt={7}
            glowColor="rgba(239,68,68,0.15)"
            scale={1.018}
            style={{ overflow: 'hidden' }}
        >
            {/* Header */}
            <div style={{
                textAlign: 'center', padding: '22px 24px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(0,0,0,0.12)',
            }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                    🎙 Voice Translation
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Speak in any language — translated &amp; spoken back
                </p>
            </div>

            <div style={{ padding: '24px' }}>
                {/* Language selectors */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '14px', alignItems: 'center', marginBottom: '28px' }}>
                    <select value={sourceLang} onChange={e => setSourceLang(e.target.value)} className="select-glass" aria-label="Speak in language">
                        <optgroup label="── Indian Languages ──">
                            {INDIAN.map(l => <option key={l.code} value={`${l.code}-${l.code.toUpperCase()}`}>{l.flag} {l.name}</option>)}
                        </optgroup>
                        <optgroup label="── World Top 5 ──">
                            {WORLD.map(l => <option key={l.code} value={`${l.code}-${l.code.toUpperCase()}`}>{l.flag} {l.name}</option>)}
                        </optgroup>
                    </select>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <div style={{ fontSize: '1.3rem', color: 'var(--text-muted)' }}>→</div>
                    </div>

                    <select value={targetLang} onChange={e => setTargetLang(e.target.value)} className="select-glass" aria-label="Translate to language">
                        <optgroup label="── Indian Languages ──">
                            {INDIAN.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                        </optgroup>
                        <optgroup label="── World Top 5 ──">
                            {WORLD.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                        </optgroup>
                    </select>
                </div>

                {/* Mic Button */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                    <div style={{ position: 'relative' }}>
                        {/* Pulse rings */}
                        {isRecording && [1, 2, 3].map(i => (
                            <motion.div key={i}
                                style={{
                                    position: 'absolute', inset: `-${i * 18}px`,
                                    borderRadius: '50%',
                                    border: `1px solid rgba(239,68,68,${0.4 / i})`,
                                    pointerEvents: 'none',
                                }}
                                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0, 0.6] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.25 }}
                            />
                        ))}
                        <motion.button
                            ref={micBtnRef}
                            onClick={isRecording ? stopRecording : startRecording}
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.93 }}
                            style={{
                                width: '120px', height: '120px', borderRadius: '50%',
                                border: `3px solid ${isRecording ? '#EF4444' : 'rgba(124,58,237,0.5)'}`,
                                background: isRecording
                                    ? 'radial-gradient(circle, rgba(239,68,68,0.35), rgba(239,68,68,0.1))'
                                    : 'radial-gradient(circle, rgba(124,58,237,0.3), rgba(124,58,237,0.08))',
                                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: '6px',
                                boxShadow: isRecording
                                    ? '0 0 40px rgba(239,68,68,0.4)'
                                    : '0 0 30px rgba(124,58,237,0.25)',
                                transition: 'all 0.3s ease', position: 'relative',
                            }}
                            aria-label={isRecording ? 'Stop recording' : 'Start speaking'}
                        >
                            <span style={{ fontSize: '2.5rem' }}>{isRecording ? '⏹' : '🎙'}</span>
                            <span style={{
                                fontSize: '0.68rem', fontWeight: 700,
                                color: isRecording ? '#FCA5A5' : '#a78bfa',
                                letterSpacing: '0.1em', textTransform: 'uppercase',
                            }}>
                                {isRecording ? 'Stop' : 'Speak'}
                            </span>
                        </motion.button>
                    </div>
                </div>

                {/* Results */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {/* Transcript */}
                    <div style={{
                        padding: '16px', minHeight: '110px',
                        background: 'rgba(0,0,0,0.25)', borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {srcLang && <span>{srcLang.flag}</span>}
                            <span>You said</span>
                        </div>
                        <AnimatePresence mode="wait">
                            {isRecording && !transcript ? (
                                <motion.div key="listening"
                                    animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.1 }}
                                    style={{ color: '#EF4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', display: 'inline-block', boxShadow: '0 0 8px #EF4444' }} />
                                    Listening…
                                </motion.div>
                            ) : transcript ? (
                                <motion.p key="transcript" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ fontSize: '0.9rem', lineHeight: 1.55, color: 'var(--text-primary)' }}>
                                    {transcript}
                                </motion.p>
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                                    Press the mic button to start…
                                </p>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Translation */}
                    <div style={{
                        padding: '16px', minHeight: '110px',
                        background: 'rgba(124,58,237,0.07)', borderRadius: '14px',
                        border: '1px solid rgba(124,58,237,0.2)',
                    }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {LANGUAGES.find(l => l.code === targetLang)?.flag}
                            <span>Translation</span>
                        </div>
                        <AnimatePresence mode="wait">
                            {isTranslating ? (
                                <motion.div key="xlating" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }}
                                    style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    Translating…
                                </motion.div>
                            ) : translated ? (
                                <motion.p key="result" initial={{ opacity: 0, filter: 'blur(8px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }}
                                    transition={{ duration: 0.45 }}
                                    style={{ fontSize: '0.9rem', lineHeight: 1.55, color: 'var(--text-primary)' }}>
                                    {translated}
                                </motion.p>
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                                    Translation will appear here…
                                </p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            style={{
                                marginTop: '14px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#FCA5A5', fontSize: '0.82rem'
                            }}>
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </TiltCard>
    );
}
