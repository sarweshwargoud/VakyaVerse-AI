import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

export default function HeroSection() {
    const brandRef = useRef(null);
    const tagRef = useRef(null);
    const subRef = useRef(null);
    const badgesRef = useRef(null);
    const lineRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ delay: 0.15 });

            // VakyaVerse brand – cinematic blur-in from bottom
            tl.fromTo(brandRef.current,
                { opacity: 0, y: 80, filter: 'blur(30px)', scale: 0.92 },
                { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 1.4, ease: 'expo.out' }
            )
                // Tagline slides up
                .fromTo(tagRef.current,
                    { opacity: 0, y: 30, filter: 'blur(10px)' },
                    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out' },
                    '-=0.8'
                )
                // Sub line
                .fromTo(subRef.current,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
                    '-=0.5'
                )
                // Badges stagger
                .fromTo(badgesRef.current?.children || [],
                    { opacity: 0, y: 16, scale: 0.8 },
                    { opacity: 1, y: 0, scale: 1, stagger: 0.09, duration: 0.55, ease: 'back.out(1.7)' },
                    '-=0.3'
                )
                // Divider line
                .fromTo(lineRef.current,
                    { scaleX: 0, opacity: 0 },
                    { scaleX: 1, opacity: 1, duration: 0.9, ease: 'expo.out', transformOrigin: 'center' },
                    '-=0.2'
                );
        });
        return () => ctx.revert();
    }, []);

    const badges = [
        { icon: '🧠', label: 'AI-Powered' },
        { icon: '🌍', label: '50+ Languages' },
        { icon: '🎭', label: 'Tone Analysis' },
        { icon: '🔊', label: 'Neural TTS' },
        { icon: '📸', label: 'OCR Vision' },
        { icon: '💬', label: 'Live Convo' },
    ];

    return (
        <section style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            padding: '112px 24px 48px',
            maxWidth: '960px',
            margin: '0 auto',
        }}>
            {/* Large glow orb — visible behind everything */}
            <div style={{
                position: 'absolute',
                top: '30%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '700px', height: '500px',
                background: 'radial-gradient(ellipse, rgba(124,58,237,0.22) 0%, rgba(6,182,212,0.08) 50%, transparent 75%)',
                pointerEvents: 'none',
                filter: 'blur(60px)',
                zIndex: 0,
            }} />

            {/* ── BRAND NAME: VakyaVerse ─────────────── */}
            <div ref={brandRef} style={{ opacity: 0, position: 'relative', zIndex: 1, marginBottom: '10px' }}>

                {/* Micro-badge above */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '7px',
                        padding: '5px 15px',
                        background: 'rgba(124,58,237,0.12)',
                        border: '1px solid rgba(124,58,237,0.35)',
                        borderRadius: '100px',
                        fontSize: '0.72rem', fontWeight: 700,
                        color: '#a78bfa', letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        marginBottom: '18px',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <span style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: '#10B981', boxShadow: '0 0 10px #10B981',
                        display: 'inline-block',
                        animation: 'pulse-ring 2s infinite',
                    }} />
                    AI Translation Platform
                </motion.div>

                {/* ── THE GIANT BRAND WORD ── */}
                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(4.5rem, 13vw, 9rem)',
                    fontWeight: 900,
                    lineHeight: 0.95,
                    letterSpacing: '-0.04em',
                    margin: '0 0 4px',
                    position: 'relative',
                    display: 'inline-block',
                }}>
                    {/* Glow layer behind text */}
                    <span style={{
                        position: 'absolute', inset: 0,
                        fontSize: 'inherit', fontWeight: 'inherit',
                        background: 'var(--grad-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'blur(28px)',
                        opacity: 0.55,
                        userSelect: 'none',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }} aria-hidden="true">
                        VakyaVerse
                    </span>
                    {/* Real text on top */}
                    <span style={{
                        position: 'relative', zIndex: 1,
                        background: 'linear-gradient(135deg, #c4b5fd 0%, #818cf8 30%, #38bdf8 65%, #a78bfa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        backgroundSize: '200% 200%',
                        animation: 'gradientShift 5s ease infinite',
                    }}>
                        VakyaVerse
                    </span>
                </h1>
            </div>

            {/* ── TAGLINE: Intelligent AI Translation Platform ── */}
            <div ref={tagRef} style={{ opacity: 0, position: 'relative', zIndex: 1, marginBottom: '20px' }}>
                <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.25rem, 3.5vw, 2.1rem)',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.3,
                    margin: 0,
                    opacity: 0.9,
                }}>
                    Intelligent{' '}
                    <span style={{
                        background: 'var(--grad-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: 700,
                    }}>AI</span>{' '}
                    Translation Platform
                </p>
            </div>

            {/* ── SUBLINE: Beyond Words ── */}
            <p ref={subRef} style={{
                opacity: 0,
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                fontWeight: 300,
                color: 'var(--text-secondary)',
                letterSpacing: '0.06em',
                marginBottom: '36px',
                position: 'relative', zIndex: 1,
            }}>
                Beyond Words. &nbsp;
                <span style={{ color: '#06B6D4', fontWeight: 400 }}>Context.</span>&nbsp;
                <span style={{ color: '#EC4899', fontWeight: 400 }}>Emotion.</span>&nbsp;
                <span style={{ color: '#F59E0B', fontWeight: 400 }}>Culture.</span>
            </p>

            {/* ── Feature badges ── */}
            <div ref={badgesRef} style={{
                display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center',
                position: 'relative', zIndex: 1, marginBottom: '0',
            }}>
                {badges.map(b => (
                    <motion.div
                        key={b.label}
                        whileHover={{ scale: 1.1, y: -3, boxShadow: '0 0 16px rgba(124,58,237,0.3)' }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px',
                            background: 'rgba(255,255,255,0.04)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '100px',
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            opacity: 0,
                            cursor: 'default',
                            transition: 'border-color 0.2s ease',
                        }}
                        onHoverStart={e => {
                            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)';
                            e.currentTarget.style.color = '#c4b5fd';
                        }}
                        onHoverEnd={e => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.color = '';
                        }}
                    >
                        <span>{b.icon}</span>
                        {b.label}
                    </motion.div>
                ))}
            </div>

            {/* Divider line */}
            <div ref={lineRef} style={{
                marginTop: '44px', height: '1px', opacity: 0,
                background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), rgba(6,182,212,0.4), transparent)',
            }} />
        </section>
    );
}
