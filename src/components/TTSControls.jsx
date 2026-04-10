import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TTS } from '../utils/ttsEngine';

export default function TTSControls({ text, lang }) {
    const [voices, setVoices] = useState({ male: [], female: [], all: [] });
    const [selectedVoice, setVoice] = useState(null);
    const [voiceGender, setGender] = useState('female');
    const [rate, setRate] = useState(1);
    const [pitch, setPitch] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [activeWord, setActiveWord] = useState(-1);
    const [showControls, setShowControls] = useState(false);

    const words = text?.split(/\s+/) || [];

    useEffect(() => {
        TTS.getCategorizedVoices().then(v => {
            setVoices(v);
            const preferred = v.female[0] || v.all[0];
            setVoice(preferred);
        });
        return () => TTS.stop();
    }, []);

    useEffect(() => {
        const list = voiceGender === 'male' ? voices.male : voices.female;
        setVoice(list[0] || voices.all[0] || null);
    }, [voiceGender, voices]);

    const handlePlay = () => {
        if (isPaused) {
            TTS.resume();
            setIsPaused(false);
            setIsPlaying(true);
            return;
        }
        if (isPlaying) {
            TTS.pause();
            setIsPaused(true);
            setIsPlaying(false);
            return;
        }

        setIsPlaying(true);
        setActiveWord(0);

        TTS.speak(text, {
            voice: selectedVoice,
            rate, pitch,
            lang: lang || 'en',
            onWord: (idx) => setActiveWord(idx),
            onEnd: () => { setIsPlaying(false); setIsPaused(false); setActiveWord(-1); },
        });
    };

    const handleStop = () => {
        TTS.stop();
        setIsPlaying(false);
        setIsPaused(false);
        setActiveWord(-1);
    };

    if (!TTS.isSupported()) return null;

    return (
        <div style={{ marginBottom: '12px' }}>
            {/* TTS Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '8px',
                flexWrap: 'wrap',
            }}>
                {/* Play/Pause */}
                <motion.button
                    onClick={handlePlay}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: isPlaying ? 'rgba(124, 58, 237, 0.25)' : 'var(--bg-glass)',
                        border: `1px solid ${isPlaying ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '100px',
                        color: isPlaying ? '#a78bfa' : 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        transition: 'all 0.2s ease',
                    }}
                    aria-label={isPlaying ? 'Pause speech' : isPaused ? 'Resume speech' : 'Play speech'}
                >
                    {isPlaying ? '⏸ Pause' : isPaused ? '▶ Resume' : '🔊 Listen'}
                </motion.button>

                {/* Stop */}
                {(isPlaying || isPaused) && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleStop}
                        className="btn-icon"
                        style={{ fontSize: '0.85rem' }}
                        aria-label="Stop speech"
                    >
                        ⏹
                    </motion.button>
                )}

                {/* Waveform */}
                <AnimatePresence>
                    {isPlaying && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="waveform"
                        >
                            {Array.from({ length: 8 }, (_, i) => (
                                <div
                                    key={i}
                                    className="waveform-bar"
                                    style={{ animationDelay: `${i * 0.08}s`, animationDuration: `${0.5 + Math.random() * 0.4}s` }}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toggle controls */}
                <button
                    onClick={() => setShowControls(v => !v)}
                    style={{
                        marginLeft: 'auto',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-body)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}
                >
                    ⚙ {showControls ? 'Hide' : 'Voice settings'}
                </button>
            </div>

            {/* Voice Controls */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            padding: '12px 16px',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '12px',
                            border: 'var(--border-glass)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            marginBottom: '8px',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Gender select */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['female', 'male'].map(g => (
                                <button
                                    key={g}
                                    onClick={() => setGender(g)}
                                    style={{
                                        padding: '5px 14px',
                                        borderRadius: '100px',
                                        border: `1px solid ${voiceGender === g ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                        background: voiceGender === g ? 'rgba(124,58,237,0.2)' : 'transparent',
                                        color: voiceGender === g ? '#a78bfa' : 'var(--text-muted)',
                                        fontSize: '0.78rem',
                                        cursor: 'pointer',
                                        fontFamily: 'var(--font-body)',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {g === 'female' ? '👩 Female' : '👨 Male'}
                                </button>
                            ))}
                        </div>

                        {/* Speed slider */}
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ minWidth: '42px' }}>Speed</span>
                            <input
                                type="range" min="0.5" max="2" step="0.1" value={rate}
                                onChange={e => setRate(Number(e.target.value))}
                                style={{ flex: 1, accentColor: 'var(--neon-primary)' }}
                                aria-label="Speech rate"
                            />
                            <span style={{ fontFamily: 'var(--font-mono)', minWidth: '32px' }}>{rate}x</span>
                        </label>

                        {/* Pitch slider */}
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ minWidth: '42px' }}>Pitch</span>
                            <input
                                type="range" min="0.5" max="2" step="0.1" value={pitch}
                                onChange={e => setPitch(Number(e.target.value))}
                                style={{ flex: 1, accentColor: 'var(--neon-secondary)' }}
                                aria-label="Speech pitch"
                            />
                            <span style={{ fontFamily: 'var(--font-mono)', minWidth: '32px' }}>{pitch}</span>
                        </label>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Word Highlight */}
            {isPlaying && words.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        padding: '10px 14px',
                        background: 'rgba(124, 58, 237, 0.08)',
                        borderRadius: '10px',
                        border: '1px solid rgba(124,58,237,0.2)',
                        fontSize: '0.9rem',
                        lineHeight: 1.7,
                        marginBottom: '8px',
                    }}
                >
                    {words.map((word, i) => (
                        <span
                            key={i}
                            className={i === activeWord ? 'word-speaking' : ''}
                            style={{ marginRight: '4px', transition: 'all 0.15s ease' }}
                        >
                            {word}
                        </span>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
