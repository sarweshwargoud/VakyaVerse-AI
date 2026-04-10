import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LANGUAGES, translateText } from '../utils/translationAPI';
import TiltCard from './TiltCard';

const A = 0, B = 1;

export default function ConversationMode() {
    const [messages, setMessages] = useState([]);
    const [recording, setRecording] = useState(null);
    const [transcript, setTranscript] = useState({ side: null, text: '' });
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState('');
    const [langA, setLangA] = useState('te-TE');
    const [langB, setLangB] = useState('hi-HI');

    const chatRef = useRef(null);
    const recRef = useRef(null);

    const INDIAN = LANGUAGES.filter(l => l.code !== 'auto' && l.region === 'India');
    const WORLD = LANGUAGES.filter(l => l.code !== 'auto' && l.region === 'World');

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages, transcript]);

    const getCode = (lang) => lang.split('-')[0];

    const personLabel = (side) => side === A ? 'Person A' : 'Person B';
    const personLang = (side) => side === A ? langA : langB;
    const personFlag = (side) => LANGUAGES.find(l => l.code === getCode(side === A ? langA : langB))?.flag || '🌐';
    const targetLang = (side) => getCode(side === A ? langB : langA);

    const startRecording = useCallback((side) => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { setError('Speech recognition not supported.'); return; }

        const lang = personLang(side);
        const rec = new SR();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = lang;

        let lastText = '';
        rec.onresult = e => {
            lastText = Array.from(e.results).map(r => r[0].transcript).join('');
            setTranscript({ side, text: lastText });
        };

        rec.onend = async () => {
            setRecording(null);
            if (!lastText.trim()) return;

            const srcCode = getCode(lang);
            const tgtCode = targetLang(side);
            setIsTranslating(true);
            try {
                const result = await translateText(lastText, srcCode, tgtCode);
                setMessages(prev => [...prev, {
                    id: Date.now(), side,
                    original: lastText,
                    translation: result.translatedText,
                    srcFlag: personFlag(side),
                    tgtFlag: LANGUAGES.find(l => l.code === tgtCode)?.flag || '🌐',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }]);
                setTranscript({ side: null, text: '' });

                if ('speechSynthesis' in window) {
                    const utt = new SpeechSynthesisUtterance(result.translatedText);
                    utt.lang = tgtCode; utt.rate = 0.92;
                    window.speechSynthesis.speak(utt);
                }
            } catch {
                setError('Translation failed.');
            } finally {
                setIsTranslating(false);
            }
        };

        rec.onerror = () => setRecording(null);
        recRef.current = rec;
        rec.start();
        setRecording(side);
        setTranscript({ side, text: '' });
        setError('');
    }, [langA, langB]);

    const stopRecording = () => recRef.current?.stop();
    const clearAll = () => { setMessages([]); setTranscript({ side: null, text: '' }); };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* ── Language Selection Card ── */}
            <TiltCard maxTilt={4} glowColor="rgba(16,185,129,0.1)" scale={1.01} style={{ overflow: 'hidden' }}>
                <div style={{
                    padding: '14px 20px',
                    background: 'rgba(0,0,0,0.15)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    textAlign: 'center',
                }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
                        💬 Two-Way Conversation
                    </span>
                    <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Each person speaks their language — instant translation
                    </p>
                </div>
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                    gap: '14px', alignItems: 'center', padding: '16px 20px',
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Person A</span>
                        <select value={langA} onChange={e => setLangA(e.target.value)} className="select-glass" aria-label="Person A language">
                            <optgroup label="── Indian Languages ──">
                                {INDIAN.map(l => <option key={l.code} value={`${l.code}-${l.code.toUpperCase()}`}>{l.flag} {l.name}</option>)}
                            </optgroup>
                            <optgroup label="── World Top 5 ──">
                                {WORLD.map(l => <option key={l.code} value={`${l.code}-${l.code.toUpperCase()}`}>{l.flag} {l.name}</option>)}
                            </optgroup>
                        </select>
                    </div>

                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '1.5rem' }}>⇌</div>
                        <div style={{ fontSize: '0.62rem', marginTop: '2px' }}>speak</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Person B</span>
                        <select value={langB} onChange={e => setLangB(e.target.value)} className="select-glass" aria-label="Person B language">
                            <optgroup label="── Indian Languages ──">
                                {INDIAN.map(l => <option key={l.code} value={`${l.code}-${l.code.toUpperCase()}`}>{l.flag} {l.name}</option>)}
                            </optgroup>
                            <optgroup label="── World Top 5 ──">
                                {WORLD.map(l => <option key={l.code} value={`${l.code}-${l.code.toUpperCase()}`}>{l.flag} {l.name}</option>)}
                            </optgroup>
                        </select>
                    </div>
                </div>
            </TiltCard>

            {/* ── Chat Area ── */}
            <TiltCard maxTilt={3} glowColor="rgba(124,58,237,0.06)" scale={1.005} style={{ overflow: 'hidden' }}>
                {/* Chat messages */}
                <div ref={chatRef} style={{
                    display: 'flex', flexDirection: 'column', gap: '14px',
                    minHeight: '280px', maxHeight: '400px', overflowY: 'auto',
                    padding: '20px',
                }}>
                    {messages.length === 0 && !transcript.text ? (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', height: '240px', gap: '12px',
                            color: 'var(--text-muted)', textAlign: 'center'
                        }}>
                            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                                <span style={{ fontSize: '3rem' }}>💬</span>
                            </motion.div>
                            <p style={{ fontSize: '0.88rem', margin: 0 }}>Press a microphone button to start speaking</p>
                            <p style={{ fontSize: '0.75rem', margin: 0, color: 'rgba(255,255,255,0.2)' }}>Messages appear here as a conversation</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {messages.map(msg => (
                                <motion.div key={msg.id}
                                    initial={{ opacity: 0, x: msg.side === A ? -24 : 24 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    style={{ alignSelf: msg.side === A ? 'flex-start' : 'flex-end', maxWidth: '72%' }}
                                >
                                    {/* Original */}
                                    <div style={{
                                        padding: '10px 14px', borderRadius: msg.side === A ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                                        fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-primary)',
                                    }}>
                                        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                            {msg.srcFlag} {personLabel(msg.side)} · {msg.time}
                                        </div>
                                        {msg.original}
                                    </div>
                                    {/* Translation */}
                                    <div style={{
                                        marginTop: '5px', padding: '10px 14px',
                                        borderRadius: msg.side === A ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                                        background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))',
                                        border: '1px solid rgba(124,58,237,0.25)',
                                        fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-primary)',
                                    }}>
                                        <div style={{ fontSize: '0.64rem', color: 'rgba(167,139,250,0.7)', marginBottom: '4px' }}>
                                            {msg.tgtFlag} Translated
                                        </div>
                                        {msg.translation}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {/* Live transcript */}
                    <AnimatePresence>
                        {transcript.text && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                style={{
                                    alignSelf: transcript.side === A ? 'flex-start' : 'flex-end',
                                    padding: '8px 14px', background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                                    fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic',
                                }}>
                                🎤 {transcript.text}…
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Translating */}
                    {isTranslating && (
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}
                            style={{ alignSelf: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Translating…
                        </motion.div>
                    )}
                </div>

                {/* Chat footer actions */}
                {messages.length > 0 && (
                    <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'right' }}>
                        <button onClick={clearAll} className="btn-ghost" style={{ fontSize: '0.75rem' }}>
                            🗑 Clear conversation
                        </button>
                    </div>
                )}
            </TiltCard>

            {/* ── Mic Buttons ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[A, B].map(side => {
                    const isActive = recording === side;
                    const isDisabled = recording !== null && recording !== side;
                    const lang = side === A ? langA : langB;
                    const langInfo = LANGUAGES.find(l => l.code === getCode(lang));
                    return (
                        <motion.button
                            key={side}
                            onClick={() => isActive ? stopRecording() : startRecording(side)}
                            disabled={isDisabled}
                            whileHover={!isDisabled ? { scale: 1.03 } : {}}
                            whileTap={!isDisabled ? { scale: 0.97 } : {}}
                            animate={isActive ? {
                                boxShadow: ['0 0 0 0 rgba(239,68,68,0.5)', '0 0 0 20px rgba(239,68,68,0)', '0 0 0 0 rgba(239,68,68,0)'],
                            } : { boxShadow: '0 0 0 0 transparent' }}
                            transition={{ duration: 1.4, repeat: isActive ? Infinity : 0 }}
                            style={{
                                padding: '18px 16px',
                                background: isActive ? 'rgba(239,68,68,0.14)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${isActive ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                borderRadius: '16px',
                                color: isActive ? '#FCA5A5' : 'var(--text-primary)',
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                opacity: isDisabled ? 0.45 : 1,
                                fontFamily: 'var(--font-body)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                                transition: 'all 0.25s ease',
                            }}
                            aria-label={`${personLabel(side)} microphone`}
                        >
                            <span style={{ fontSize: '1.6rem' }}>{isActive ? '⏹' : '🎙'}</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                                {personLabel(side)} {isActive ? '· Recording' : ''}
                            </span>
                            {langInfo && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {langInfo.flag} {langInfo.name}
                                </span>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        style={{
                            padding: '10px 16px', background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#FCA5A5', fontSize: '0.82rem'
                        }}>
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
