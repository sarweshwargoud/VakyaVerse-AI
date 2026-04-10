import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeBackground from './components/ThreeBackground';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import TextTranslator from './components/TextTranslator';
import VoiceTranslator from './components/VoiceTranslator';
import ImageTranslator from './components/ImageTranslator';
import ConversationMode from './components/ConversationMode';
import HistoryPanel from './components/HistoryPanel';
import { Prefs } from './utils/historyManager';
import { ParticleBurst } from './utils/animations';
import { getAllTranslations } from './utils/historyManager';

const TABS = [
    { id: 'text', icon: '✍️', label: 'Text' },
    { id: 'voice', icon: '🎙', label: 'Voice' },
    { id: 'image', icon: '📸', label: 'Image' },
    { id: 'conversation', icon: '💬', label: 'Conversation' },
];

export default function App() {
    const [theme, setTheme] = useState(() => Prefs.get('theme', 'dark'));
    const [activeTab, setActiveTab] = useState(() => Prefs.get('activeTab', 'text'));
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyCount, setHistoryCount] = useState(0);
    const [toasts, setToasts] = useState([]);

    const canvasRef = useRef(null);
    const burstRef = useRef(null);

    // Apply theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        Prefs.set('theme', theme);
    }, [theme]);

    // Persist tab
    useEffect(() => {
        Prefs.set('activeTab', activeTab);
    }, [activeTab]);

    // Init particle system
    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            burstRef.current = new ParticleBurst(canvas);

            const onResize = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                burstRef.current?.resize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener('resize', onResize);
            return () => { window.removeEventListener('resize', onResize); burstRef.current?.destroy(); };
        }
    }, []);

    // Load history count
    const refreshCount = useCallback(async () => {
        const all = await getAllTranslations();
        setHistoryCount(all.length);
    }, []);

    useEffect(() => { refreshCount(); }, []);

    const triggerBurst = useCallback((x, y, count = 30) => {
        burstRef.current?.burst(x, y, count);
    }, []);

    const showToast = useCallback((msg, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }, []);

    const handleTabChange = (tabId) => {
        if (tabId === activeTab) return;
        setActiveTab(tabId);
    };

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
            {/* Three.js Background */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
                <ThreeBackground theme={theme} />
            </div>

            {/* Particle Burst Canvas — floats above content during burst, transparent otherwise */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed', top: 0, left: 0,
                    width: '100%', height: '100%',
                    pointerEvents: 'none',
                    zIndex: 9,
                }}
                aria-hidden="true"
            />

            {/* Background gradient orbs */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                <div style={{
                    position: 'absolute', top: '-20%', left: '-10%',
                    width: '60vw', height: '60vw',
                    background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    animation: 'float 8s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-20%', right: '-10%',
                    width: '50vw', height: '50vw',
                    background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    animation: 'float 10s ease-in-out infinite reverse',
                }} />
            </div>

            {/* Navbar */}
            <Navbar
                theme={theme}
                onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                onHistoryOpen={() => setHistoryOpen(true)}
                historyCount={historyCount}
            />

            {/* Main Content */}
            <main style={{
                position: 'relative', zIndex: 10,
                paddingTop: '70px',
                paddingBottom: '60px',
                minHeight: '100vh',
            }}>
                {/* Hero */}
                <HeroSection />

                {/* Mode Tabs */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '0 16px 32px',
                    position: 'relative', zIndex: 2,
                }}>
                    <div
                        className="tab-container"
                        role="tablist"
                        aria-label="Translation modes"
                        style={{
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                        }}
                    >
                        {TABS.map(tab => (
                            <motion.button
                                key={tab.id}
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                aria-controls={`panel-${tab.id}`}
                                id={`tab-${tab.id}`}
                                onClick={() => handleTabChange(tab.id)}
                                className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                                whileHover={activeTab !== tab.id ? { scale: 1.05 } : {}}
                                whileTap={{ scale: 0.97 }}
                                layout
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Tab Content — single keyed motion.div ensures only ONE tab renders at a time */}
                <div
                    role="tabpanel"
                    aria-labelledby={`tab-${activeTab}`}
                    id={`panel-${activeTab}`}
                    style={{ padding: '0 16px' }}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -12, scale: 0.98 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                maxWidth: activeTab === 'voice' ? '720px' : activeTab === 'image' ? '820px' : '920px',
                                margin: '0 auto',
                            }}
                        >
                            {activeTab === 'text' && (
                                <TextTranslator
                                    onTranslationComplete={refreshCount}
                                    particleBurst={triggerBurst}
                                />
                            )}
                            {activeTab === 'voice' && (
                                <VoiceTranslator particleBurst={triggerBurst} />
                            )}
                            {activeTab === 'image' && (
                                <ImageTranslator particleBurst={triggerBurst} />
                            )}
                            {activeTab === 'conversation' && (
                                <ConversationMode />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <footer style={{
                    textAlign: 'center',
                    padding: '48px 24px 24px',
                    position: 'relative', zIndex: 2,
                }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '8px 20px',
                        background: 'var(--bg-glass)',
                        backdropFilter: 'blur(8px)',
                        border: 'var(--border-glass)',
                        borderRadius: '100px',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                    }}>
                        <span className="gradient-text" style={{ fontWeight: 700 }}>VakyaVerse</span>
                        <span>·</span>
                        <span>Intelligent AI Translation Platform</span>
                        <span>·</span>
                        <span>Built by Sarweshwar</span>
                    </div>
                </footer>
            </main>

            {/* History Panel */}
            <HistoryPanel
                isOpen={historyOpen}
                onClose={() => setHistoryOpen(false)}
            />

            {/* Toast Container */}
            <div className="toast-container" role="alert" aria-live="polite">
                <AnimatePresence>
                    {toasts.map(t => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 40, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 40, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className={`toast ${t.type}`}
                        >
                            <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : '⚠️'}</span>
                            {t.msg}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
