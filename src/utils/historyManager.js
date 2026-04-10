// IndexedDB + LocalStorage History Manager
import { openDB } from 'idb';

const DB_NAME = 'vakyaverse-db';
const DB_VERSION = 1;
const STORE_NAME = 'translations';
const MAX_ENTRIES = 200;

let dbPromise = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp');
                    store.createIndex('bookmarked', 'bookmarked');
                }
            },
        });
    }
    return dbPromise;
}

export async function addTranslation(entry) {
    const db = await getDB();
    const id = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const record = { ...entry, id, timestamp: Date.now(), bookmarked: false };
    await db.add(STORE_NAME, record);

    // Enforce max entries
    const all = await db.getAll(STORE_NAME);
    if (all.length > MAX_ENTRIES) {
        const nonBookmarked = all
            .filter(e => !e.bookmarked)
            .sort((a, b) => a.timestamp - b.timestamp);
        const toDelete = nonBookmarked.slice(0, all.length - MAX_ENTRIES);
        const tx = db.transaction(STORE_NAME, 'readwrite');
        await Promise.all(toDelete.map(e => tx.store.delete(e.id)));
        await tx.done;
    }

    return record;
}

export async function getAllTranslations() {
    const db = await getDB();
    const all = await db.getAll(STORE_NAME);
    return all.sort((a, b) => b.timestamp - a.timestamp);
}

export async function deleteTranslation(id) {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
}

export async function toggleBookmark(id) {
    const db = await getDB();
    const entry = await db.get(STORE_NAME, id);
    if (!entry) return;
    entry.bookmarked = !entry.bookmarked;
    await db.put(STORE_NAME, entry);
    return entry.bookmarked;
}

export async function searchTranslations(query) {
    const all = await getAllTranslations();
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter(e =>
        e.sourceText?.toLowerCase().includes(q) ||
        e.translatedText?.toLowerCase().includes(q) ||
        e.sourceLang?.toLowerCase().includes(q) ||
        e.targetLang?.toLowerCase().includes(q)
    );
}

export async function clearAllTranslations() {
    const db = await getDB();
    await db.clear(STORE_NAME);
}

// User preferences via localStorage
export const Prefs = {
    get(key, def) {
        try {
            const v = localStorage.getItem(`vv_${key}`);
            return v !== null ? JSON.parse(v) : def;
        } catch { return def; }
    },
    set(key, value) {
        try { localStorage.setItem(`vv_${key}`, JSON.stringify(value)); } catch { }
    },
};
