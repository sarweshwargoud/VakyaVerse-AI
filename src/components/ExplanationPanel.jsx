import { motion } from 'framer-motion';

export default function ExplanationPanel({ explanation }) {
    const { grammarNotes, idiomNotes, culturalNotes, alternatives } = explanation;

    const sections = [
        { icon: '📐', title: 'Grammar Adjustments', items: grammarNotes, color: '#7C3AED' },
        { icon: '🗣️', title: 'Idiom & Expression Handling', items: idiomNotes, color: '#06B6D4' },
        { icon: '🌏', title: 'Cultural Adaptation', items: culturalNotes, color: '#EC4899' },
        { icon: '🔄', title: 'Alternative Phrasings', items: alternatives, color: '#F59E0B' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card"
            style={{
                marginTop: '16px',
                padding: '24px',
                position: 'relative',
                zIndex: 2,
                overflow: 'hidden',
            }}
        >
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.06) 0%, transparent 70%)'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.2rem' }}>🧠</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Why This Translation?
                </h3>
                <span style={{
                    marginLeft: 'auto',
                    padding: '3px 10px',
                    background: 'rgba(124,58,237,0.15)',
                    border: '1px solid rgba(124,58,237,0.3)',
                    borderRadius: '100px',
                    fontSize: '0.7rem',
                    color: '#a78bfa',
                    fontWeight: 600,
                }}>
                    AI Explanation Mode
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {sections.map(({ icon, title, items, color }, si) => (
                    <motion.div
                        key={si}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: si * 0.08, duration: 0.4 }}
                        style={{
                            padding: '14px 16px',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '12px',
                            border: `1px solid ${color}25`,
                        }}
                    >
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px',
                        }}>
                            <span style={{ fontSize: '1rem' }}>{icon}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color, fontFamily: 'var(--font-display)' }}>
                                {title}
                            </span>
                        </div>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {items.map((item, i) => (
                                <li key={i} style={{
                                    display: 'flex', gap: '8px', alignItems: 'flex-start',
                                    fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5,
                                }}>
                                    <span style={{ color, opacity: 0.7, flexShrink: 0, marginTop: '2px' }}>◆</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
