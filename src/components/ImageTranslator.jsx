import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LANGUAGES, translateText } from '../utils/translationAPI';
import { addTranslation } from '../utils/historyManager';
import TiltCard from './TiltCard';

export default function ImageTranslator({ particleBurst }) {
    const [imageUrl, setImageUrl] = useState('');
    const [imageName, setImageName] = useState('');
    const [extractedText, setExtracted] = useState('');
    const [translated, setTranslated] = useState('');
    const [targetLang, setTargetLang] = useState('hi');
    const [isOcr, setIsOcr] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [copiedOcr, setCopiedOcr] = useState(false);
    const [copiedTrans, setCopiedTrans] = useState(false);

    const fileRef = useRef(null);
    const dropZoneId = 'image-drop-zone';

    const INDIAN = LANGUAGES.filter(l => l.code !== 'auto' && l.region === 'India');
    const WORLD = LANGUAGES.filter(l => l.code !== 'auto' && l.region === 'World');

    const processFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            setError('Please upload a valid image (JPEG, PNG, WebP).'); return;
        }
        if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB.'); return; }
        setError(''); setExtracted(''); setTranslated(''); setOcrProgress(0);
        setImageName(file.name);
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        runOCR(url);
    };

    const runOCR = async (url) => {
        setIsOcr(true);
        try {
            const { createWorker } = await import('tesseract.js');
            const worker = await createWorker('eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100));
                },
            });
            const result = await worker.recognize(url);
            const text = result.data.text.trim();
            setExtracted(text); setOcrProgress(100);
            await worker.terminate();
            setIsOcr(false);

            if (text) {
                await doTranslate(text);
                if (particleBurst) {
                    const el = document.getElementById(dropZoneId);
                    if (el) {
                        const r = el.getBoundingClientRect();
                        particleBurst(r.left + r.width / 2, r.top + r.height / 2, 22);
                    }
                }
            } else {
                setError('No text detected. Try a clearer image with good contrast.');
            }
        } catch (err) {
            console.error(err);
            setError('OCR failed. Try a clearer image with sharper text.');
            setIsOcr(false);
        }
    };

    const doTranslate = async (text) => {
        setIsTranslating(true);
        try {
            const result = await translateText(text, 'en', targetLang);
            setTranslated(result.translatedText);
            await addTranslation({ sourceText: text, translatedText: result.translatedText, sourceLang: 'en', targetLang, mode: 'image' });
        } catch {
            setError('Translation failed after OCR.');
        } finally { setIsTranslating(false); }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault(); setIsDragging(false);
        processFile(e.dataTransfer.files[0]);
    }, [targetLang]);

    const reset = () => {
        setImageUrl(''); setImageName(''); setExtracted(''); setTranslated('');
        setOcrProgress(0); setError(''); setIsOcr(false); setIsTranslating(false);
    };

    const copy = (text, setter) => {
        navigator.clipboard.writeText(text).then(() => { setter(true); setTimeout(() => setter(false), 2000); });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ── Upload Card ── */}
            <TiltCard
                id={dropZoneId}
                maxTilt={5}
                glowColor="rgba(6,182,212,0.2)"
                scale={1.012}
                onClick={() => !imageUrl && fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onKeyDown={e => e.key === 'Enter' && !imageUrl && fileRef.current?.click()}
                role={imageUrl ? undefined : 'button'}
                tabIndex={imageUrl ? undefined : 0}
                aria-label="Upload image for OCR translation"
                style={{
                    overflow: 'hidden',
                    border: `2px ${isDragging ? 'solid rgba(6,182,212,0.7)' : 'dashed rgba(255,255,255,0.09)'}`,
                    cursor: imageUrl ? 'default' : 'pointer',
                    boxShadow: isDragging ? '0 0 50px rgba(6,182,212,0.25), inset 0 0 30px rgba(6,182,212,0.05)' : undefined,
                    transition: 'border-color 0.2s, box-shadow 0.3s',
                }}
            >
                {/* Header strip */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px',
                    background: 'rgba(0,0,0,0.18)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.1rem' }}>📸</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>
                            Image OCR Translation
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Translate to:</span>
                        <select
                            value={targetLang}
                            onChange={e => { setTargetLang(e.target.value); setTranslated(''); }}
                            onClick={e => e.stopPropagation()}
                            className="select-glass"
                            aria-label="Target language"
                        >
                            <optgroup label="── Indian Languages ──">
                                {INDIAN.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                            </optgroup>
                            <optgroup label="── World Top 5 ──">
                                {WORLD.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                            </optgroup>
                        </select>
                        {imageUrl && (
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={e => { e.stopPropagation(); reset(); }}
                                className="btn-icon" title="Remove image" style={{ fontSize: '0.85rem' }}>
                                ✕
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Hidden file input */}
                <input ref={fileRef} type="file" accept="image/*"
                    onChange={e => e.target.files[0] && processFile(e.target.files[0])}
                    style={{ display: 'none' }} aria-hidden="true" />

                {/* Drop / Preview area */}
                <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '14px', position: 'relative' }}>
                    <AnimatePresence mode="wait">
                        {imageUrl ? (
                            <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
                                <img src={imageUrl} alt="Uploaded for OCR" style={{
                                    maxHeight: '200px', maxWidth: '100%', borderRadius: '12px',
                                    objectFit: 'contain', opacity: isOcr ? 0.6 : 1,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)', transition: 'opacity 0.3s',
                                }} />
                                {imageName && (
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>📄 {imageName}</span>
                                )}
                            </motion.div>
                        ) : isDragging ? (
                            <motion.div key="dragging" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem' }}>📂</div>
                                <p style={{ color: '#67E8F9', fontWeight: 600, marginTop: '8px' }}>Drop your image here!</p>
                            </motion.div>
                        ) : (
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={{ textAlign: 'center' }}>
                                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{ fontSize: '3.5rem', marginBottom: '12px' }}>
                                    📸
                                </motion.div>
                                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>
                                    Drop an image or click to upload
                                </p>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                                    JPEG · PNG · WebP · Up to 10MB
                                </p>
                                <p style={{ fontSize: '0.74rem', color: 'rgba(6,182,212,0.8)', margin: '8px 0 0' }}>
                                    📖 Extracts text automatically &amp; translates it
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Scan line overlay */}
                    <AnimatePresence>
                        {isOcr && (
                            <motion.div key="scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', overflow: 'hidden', pointerEvents: 'none' }}>
                                <motion.div
                                    animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    style={{
                                        position: 'absolute', left: 0, right: 0, height: '3px',
                                        background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.9), transparent)',
                                        boxShadow: '0 0 16px rgba(6,182,212,0.7)'
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* OCR Progress bar */}
                <AnimatePresence>
                    {isOcr && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            style={{ padding: '12px 20px', background: 'rgba(6,182,212,0.06)', borderTop: '1px solid rgba(6,182,212,0.15)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#67E8F9', marginBottom: '6px' }}>
                                <span>🔬 Scanning text…</span>
                                <span style={{ fontFamily: 'var(--font-mono)' }}>{ocrProgress}%</span>
                            </div>
                            <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                                <motion.div animate={{ width: `${ocrProgress}%` }} transition={{ duration: 0.3 }}
                                    style={{
                                        height: '100%', borderRadius: '3px',
                                        background: 'linear-gradient(90deg, #7C3AED, #06B6D4)',
                                        boxShadow: '0 0 8px rgba(6,182,212,0.6)'
                                    }} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </TiltCard>

            {/* ── Results ── */}
            <AnimatePresence>
                {(extractedText || translated) && (
                    <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.45 }}
                        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                        {/* Extracted text */}
                        <TiltCard maxTilt={4} glowColor="rgba(255,255,255,0.05)" scale={1.008} style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{
                                padding: '14px 16px', background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                                    📝 Extracted Text
                                </span>
                                {extractedText && (
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        onClick={() => copy(extractedText, setCopiedOcr)}
                                        className="btn-icon" title="Copy" style={{ fontSize: '0.82rem' }}>
                                        {copiedOcr ? '✅' : '📋'}
                                    </motion.button>
                                )}
                            </div>
                            <p style={{
                                padding: '16px', fontSize: '0.88rem', lineHeight: 1.65,
                                color: 'var(--text-primary)', maxHeight: '180px', overflowY: 'auto', margin: 0
                            }}>
                                {extractedText || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Processing…</span>}
                            </p>
                        </TiltCard>

                        {/* Translation */}
                        <TiltCard maxTilt={4} glowColor="rgba(124,58,237,0.12)" scale={1.008}
                            style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(124,58,237,0.2)' }}>
                            <div style={{
                                padding: '14px 16px', background: 'rgba(124,58,237,0.07)', borderBottom: '1px solid rgba(124,58,237,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                                    {LANGUAGES.find(l => l.code === targetLang)?.flag} Translation
                                </span>
                                {translated && (
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        onClick={() => copy(translated, setCopiedTrans)}
                                        className="btn-icon" title="Copy" style={{ fontSize: '0.82rem' }}>
                                        {copiedTrans ? '✅' : '📋'}
                                    </motion.button>
                                )}
                            </div>
                            <div style={{ padding: '16px', minHeight: '60px' }}>
                                <AnimatePresence mode="wait">
                                    {isTranslating ? (
                                        <motion.div key="xlating" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }}
                                            style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            Translating…
                                        </motion.div>
                                    ) : (
                                        <motion.p key="translated" initial={{ opacity: 0, filter: 'blur(6px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }}
                                            transition={{ duration: 0.4 }}
                                            style={{
                                                fontSize: '0.88rem', lineHeight: 1.65, color: 'var(--text-primary)',
                                                maxHeight: '180px', overflowY: 'auto', margin: 0
                                            }}>
                                            {translated}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </TiltCard>
                    </motion.div>
                )}
            </AnimatePresence>

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
