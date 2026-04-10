import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getAllTranslations, deleteTranslation,
    toggleBookmark, searchTranslations
} from '../utils/historyManager';
import { LANGUAGES } from '../utils/translationAPI';

export default function HistoryPanel({ isOpen, onClose }) {
    const [entries, setEntries] = useState([]);
    const [query, setQuery] = useState('');
    const [deleting, setDeleting] = useState(new Set());
    const [filter, setFilter] = useState('all'); // all | bookmarked

    const loadHistory = useCallback(async () => {
        const all = await getAllTranslations();
        setEntries(all);
    }, []);

    useEffect(() => {
        if (isOpen) loadHistory();
    }, [isOpen, loadHistory]);

    const handleSearch = async (q) => {
        setQuery(q);
        if (q.trim()) {
            const results = await searchTranslations(q);
            setEntries(results);
        } else {
            loadHistory();
        }
    };

    const handleDelete = async (id) => {
        setDeleting(prev => new Set([...prev, id]));
        setTimeout(async () => {
            await deleteTranslation(id);
            setEntries(prev => prev.filter(e => e.id !== id));
            setDeleting(prev => { const n = new Set(prev); n.delete(id); return n; });
        }, 400);
    };

    const handleBookmark = async (id) => {
        await toggleBookmark(id);
        setEntries(prev => prev.map(e => e.id === id ? { ...e, bookmarked: !e.bookmarked } : e));
    };

    const displayed = filter === 'bookmarked'
        ? entries.filter(e => e.bookmarked)
        : entries;

    const formatTime = (ts) => {
        const d = new Date(ts);
        const now = Date.now();
        const diff = now - ts;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return d.toLocaleDateString();
    };

    const getLangFlag = (code) => LANGUAGES.find(l => l.code === code)?.flag || '🌐';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 'calc(var(--z-panel) - 1)',
                            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                        }}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
                        style={{
                            position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px',
                            maxWidth: '100vw', zIndex: 'var(--z-panel)',
                            background: 'rgba(6, 6, 20, 0.95)',
                            backdropFilter: 'blur(30px)',
                            borderLeft: '1px solid rgba(255,255,255,0.07)',
                            display: 'flex', flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                        role="dialog"
                        aria-label="Translation history"
                    >
                        {/* Header */}
                        <div style={{
                            padding: '20px 20px 16px',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            background: 'rgba(0,0,0,0.2)',
                            flexShrink: 0,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>📚</span>
                                    <div>
                                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                            Translation History
                                        </h2>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                            {entries.length} entries stored locally
                                        </p>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={onClose}
                                    className="btn-icon"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label="Close history panel"
                                    style={{ fontSize: '1.1rem' }}
                                >
                                    ✕
                                </motion.button>
                            </div>

                            {/* Search */}
                            <div style={{ position: 'relative', marginBottom: '12px' }}>
                                <input
                                    type="search"
                                    value={query}
                                    onChange={e => handleSearch(e.target.value)}
                                    placeholder="Search history..."
                                    style={{
                                        width: '100%',
                                        padding: '10px 16px 10px 38px',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '10px',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '0.875rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                    aria-label="Search translation history"
                                />
                                <span style={{
                                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                                    fontSize: '0.9rem', color: 'var(--text-muted)', pointerEvents: 'none',
                                }}>🔍</span>
                            </div>

                            {/* Filter tabs */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['all', 'bookmarked'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        style={{
                                            padding: '5px 14px',
                                            borderRadius: '100px',
                                            border: `1px solid ${filter === f ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                            background: filter === f ? 'rgba(124,58,237,0.2)' : 'transparent',
                                            color: filter === f ? '#a78bfa' : 'var(--text-muted)',
                                            fontSize: '0.78rem',
                                            cursor: 'pointer',
                                            fontFamily: 'var(--font-body)',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {f === 'bookmarked' ? '⭐ Starred' : '🕒 All'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Entries list */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                            <AnimatePresence mode="popLayout">
                                {displayed.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                                            justifyContent: 'center', height: '200px', gap: '12px',
                                            color: 'var(--text-muted)', textAlign: 'center',
                                        }}
                                    >
                                        <div style={{ fontSize: '2.5rem' }}>{query ? '🔍' : filter === 'bookmarked' ? '⭐' : '📭'}</div>
                                        <p style={{ fontSize: '0.85rem' }}>
                                            {query
                                                ? `No results for "${query}"`
                                                : filter === 'bookmarked'
                                                    ? 'No bookmarks yet'
                                                    : 'No translations yet'}
                                        </p>
                                    </motion.div>
                                ) : (
                                    displayed.map(entry => (
                                        <motion.div
                                            key={entry.id}
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{
                                                opacity: deleting.has(entry.id) ? 0 : 1,
                                                x: deleting.has(entry.id) ? 40 : 0,
                                                scale: deleting.has(entry.id) ? 0.95 : 1,
                                                height: deleting.has(entry.id) ? 0 : 'auto',
                                            }}
                                            exit={{ opacity: 0, x: 30, height: 0 }}
                                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                            style={{
                                                padding: '14px 14px',
                                                marginBottom: '8px',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${entry.bookmarked ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.06)'}`,
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s ease',
                                                overflow: 'hidden',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                        >
                                            {/* Lang badge */}
                                            <div style={{
                                                display: 'flex', justifyContent: 'space-between',
                                                alignItems: 'center', marginBottom: '8px',
                                            }}>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    fontSize: '0.72rem', color: 'var(--text-muted)',
                                                    fontFamily: 'var(--font-mono)',
                                                }}>
                                                    <span>{getLangFlag(entry.sourceLang)}</span>
                                                    <span>{entry.sourceLang}</span>
                                                    <span>→</span>
                                                    <span>{getLangFlag(entry.targetLang)}</span>
                                                    <span>{entry.targetLang}</span>
                                                    {entry.mode && (
                                                        <span style={{
                                                            padding: '2px 6px', borderRadius: '4px',
                                                            background: 'rgba(124,58,237,0.2)', color: '#a78bfa',
                                                            fontSize: '0.65rem', textTransform: 'uppercase',
                                                        }}>
                                                            {entry.mode}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    {/* Bookmark */}
                                                    <button
                                                        onClick={e => { e.stopPropagation(); handleBookmark(entry.id); }}
                                                        aria-label={entry.bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                                                        style={{
                                                            background: 'none', border: 'none',
                                                            cursor: 'pointer', fontSize: '0.85rem',
                                                            color: entry.bookmarked ? '#F59E0B' : 'var(--text-muted)',
                                                            padding: '2px 4px',
                                                            transition: 'transform 0.2s, color 0.2s',
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                    >
                                                        {entry.bookmarked ? '⭐' : '☆'}
                                                    </button>
                                                    {/* Delete */}
                                                    <button
                                                        onClick={e => { e.stopPropagation(); handleDelete(entry.id); }}
                                                        aria-label="Delete entry"
                                                        style={{
                                                            background: 'none', border: 'none',
                                                            cursor: 'pointer', fontSize: '0.8rem',
                                                            color: 'var(--text-muted)',
                                                            padding: '2px 4px',
                                                            transition: 'color 0.2s',
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                                    >
                                                        🗑
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Text */}
                                            <p style={{
                                                fontSize: '0.82rem', color: 'var(--text-secondary)',
                                                marginBottom: '6px', lineHeight: 1.4,
                                                overflow: 'hidden', textOverflow: 'ellipsis',
                                                display: '-webkit-box', WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}>
                                                {entry.sourceText}
                                            </p>
                                            <p style={{
                                                fontSize: '0.82rem', color: 'var(--text-accent)',
                                                lineHeight: 1.4,
                                                overflow: 'hidden', textOverflow: 'ellipsis',
                                                display: '-webkit-box', WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}>
                                                {entry.translatedText}
                                            </p>

                                            <div style={{
                                                marginTop: '6px', fontSize: '0.68rem', color: 'var(--text-muted)',
                                                fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px',
                                            }}>
                                                🕒 {formatTime(entry.timestamp)}
                                                {entry.sentiment && (
                                                    <span style={{ marginLeft: '8px' }}>
                                                        {entry.sentiment.emoji} {entry.sentiment.emotion}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
