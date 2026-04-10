import { motion } from 'framer-motion';

export default function SentimentPanel({ sentiment }) {
    const { source, target, toneShift } = sentiment;

    const meterColors = {
        Positive: '#10B981',
        Joyful: '#10B981',
        Negative: '#EF4444',
        Distressed: '#EF4444',
        Neutral: '#94A3B8',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card"
            style={{
                marginTop: '16px',
                padding: '20px 24px',
                position: 'relative',
                zIndex: 2,
                overflow: 'hidden',
            }}
        >
            {/* Background glow */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `radial-gradient(circle at 80% 50%, ${source.color}15 0%, transparent 60%)`,
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.1rem' }}>🎭</span>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    Sentiment & Tone Analysis
                </h3>
                {toneShift && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            marginLeft: 'auto',
                            padding: '4px 12px',
                            background: 'rgba(245, 158, 11, 0.15)',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            borderRadius: '100px',
                            fontSize: '0.72rem',
                            color: '#F59E0B',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}
                    >
                        ⚠️ Tone Shift Detected
                    </motion.div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                    { label: 'Source Tone', data: source },
                    { label: 'Translation Tone', data: target },
                ].map(({ label, data }, i) => (
                    <div key={i} style={{
                        padding: '14px 16px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '12px',
                        border: `1px solid ${data.color}30`,
                    }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', marginBottom: '10px',
                        }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
                            <span style={{ fontSize: '1.3rem' }}>{data.emoji}</span>
                        </div>
                        <div style={{
                            fontSize: '1rem', fontWeight: 700,
                            color: data.color, marginBottom: '8px',
                            fontFamily: 'var(--font-display)',
                        }}>
                            {data.emotion}
                        </div>
                        <div className="sentiment-meter">
                            <motion.div
                                className="sentiment-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${data.score * 100}%` }}
                                transition={{ delay: 0.2 + i * 0.1, duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
                                style={{ background: `linear-gradient(90deg, ${data.color}80, ${data.color})` }}
                            />
                        </div>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            marginTop: '4px', fontSize: '0.68rem', color: 'var(--text-muted)',
                        }}>
                            <span>Confidence: {(data.confidence * 100).toFixed(0)}%</span>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>{(data.score * 100).toFixed(0)}/100</span>
                        </div>
                    </div>
                ))}
            </div>

            {toneShift && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        borderRadius: '10px',
                        fontSize: '0.8rem',
                        color: '#FCD34D',
                        lineHeight: 1.5,
                    }}
                >
                    ⚠️ <strong>Tone Shift Warning:</strong> The emotional tone has shifted significantly between the source and translated text. Consider reviewing the translation for cultural context or rephrasing to match the intended sentiment.
                </motion.div>
            )}
        </motion.div>
    );
}
