import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { createMagneticEffect } from '../utils/animations';

export default function Navbar({ theme, onThemeToggle, onHistoryOpen, historyCount }) {
    const histBtnRef = useRef(null);
    const themeBtnRef = useRef(null);

    useEffect(() => {
        const cleanHist = createMagneticEffect(histBtnRef.current, 0.3);
        const cleanTheme = createMagneticEffect(themeBtnRef.current, 0.3);
        return () => { cleanHist(); cleanTheme(); };
    }, []);

    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0,
                zIndex: 100,
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(3, 3, 15, 0.85)',
                backdropFilter: 'blur(24px) saturate(160%)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            }}
            role="navigation"
            aria-label="Main navigation"
        >
            {/* Logo */}
            <motion.div
                style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    cursor: 'default', userSelect: 'none',
                }}
                whileHover={{ scale: 1.02 }}
            >
                <div style={{
                    width: '36px', height: '36px',
                    background: 'var(--grad-primary)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem',
                    boxShadow: '0 0 20px var(--glow-primary)',
                    animation: 'float 3s ease-in-out infinite',
                }}>
                    ✦
                </div>
                <div>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        letterSpacing: '-0.02em',
                    }}>
                        <span className="gradient-text">VakyaVerse</span>
                    </div>
                    <div style={{
                        fontSize: '0.6rem',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }}>
                        AI Translation Platform
                    </div>
                </div>
            </motion.div>

            {/* Center badge */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '100px',
                fontSize: '0.72rem',
                color: '#6EE7B7',
                fontWeight: 500,
            }}>
                <span style={{
                    width: '6px', height: '6px',
                    borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 8px #10B981',
                    animation: 'pulse-ring 2s infinite',
                }} />
                API Connected
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* History button */}
                <motion.button
                    ref={histBtnRef}
                    onClick={onHistoryOpen}
                    className="btn-ghost"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        position: 'relative',
                        gap: '8px',
                        fontSize: '0.82rem',
                    }}
                    aria-label="Open translation history"
                >
                    📚 History
                    {historyCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                            style={{
                                position: 'absolute',
                                top: '-6px', right: '-6px',
                                width: '18px', height: '18px',
                                background: 'var(--grad-primary)',
                                borderRadius: '50%',
                                fontSize: '0.65rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 700,
                            }}
                        >
                            {historyCount > 99 ? '99+' : historyCount}
                        </motion.span>
                    )}
                </motion.button>

                {/* Theme toggle */}
                <motion.button
                    ref={themeBtnRef}
                    onClick={onThemeToggle}
                    className="btn-icon"
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                    style={{ fontSize: '1rem' }}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </motion.button>
            </div>
        </motion.nav>
    );
}
