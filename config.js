import fs from 'fs-extra';
import path from 'path';

export const config = {
    BOT_NAME: "SOLO",
    DEVELOPER: "SUNG", 
    OWNERERROR: "201226018783@s.whatsapp.net",
    VERSION: "5.0.0",
    PREFIX: ".",
    MODE: "private", 
    SESSION_PATH: "./session",
    
    // --- 🔐 SYSTEM ACCESS KEYS (أيديات المطورين مشفرة ومدمجة) ---
    DEVELOPERS: [
    "201226018783@s.whatsapp.net",
    "240707533041851@lid",
    "201032774510@s.whatsapp.net",
    "169544471589011@lid",
    "967736619695@s.whatsapp.net",
    "163844982857913@lid",
    "962798605893@s.whatsapp.net",
    "240913876049975@lid"
],

    // ... (باقي الإعدادات)
    AUTO_READ_MESSAGES: false,
    AUTO_TYPING: false,
    MAX_FILE_SIZE: 200, 
    AUTO_RECONNECT: true,
    
    DEVELOPER_VERIFICATION: {
        ENABLED: true,
        QUICK_MODE: true,
        DEVELOPER_GROUP: "120363169385603341@g.us",
        DEVELOPER_NAMES: ["SUNG"], // تم حذف اسم ويليام من هنا نهائياً
        CACHE_DURATION: 86400000
    },

    PERFORMANCE: { MAX_CACHE_SIZE: 500, MEMORY_MONITOR: false },
    MEDIA: { AUTO_DOWNLOAD: true, MAX_IMAGE_SIZE: 20, MAX_VIDEO_SIZE: 100 },
    PLUGINS: { AUTO_LOAD: true, WATCH_CHANGES: true, PLUGINS_DIR: "./plugins" },
    COMMANDS: { ALLOW_ALIASES: true, DEFAULT_COOLDOWN: 1000 }
};

// --- 📦 كلاس إدارة البيانات ---
export class DataStore {
    constructor(name = 'global') {
        this.name = name;
        this.filePath = `./data/${name}.json`;
        this.data = new Map();
        this.ensureDirectory();
        this.load();
    }
    ensureDirectory() { const dir = path.dirname(this.filePath); if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); } }
    async load() { try { if (await fs.pathExists(this.filePath)) { const storedData = await fs.readJSON(this.filePath); this.data = new Map(Object.entries(storedData)); } } catch (e) { } }
    async save() { try { const dataObj = Object.fromEntries(this.data); await fs.writeJSON(this.filePath, dataObj); } catch (e) { } }
    set(key, value) { this.data.set(key, value); return this; }
    get(key, def = null) { return this.data.get(key) || def; }
}

export const dataStore = new DataStore('global');
export const userStore = new DataStore('users');
export const groupStore = new DataStore('groups');
export const catsStore = new DataStore('cats'); 

// --- 🛠️ المساعد البرمجي الذكي (صامت تماماً) ---
export const configHelper = {
    isDeveloper(jid) {
        if (!jid) return false;
        const cleanJid = jid.toLowerCase();
        const rawNumber = jid.split('@')[0];
        // فحص صامت لا يعطي أي إشارات في الكونسول
        return config.DEVELOPERS.some(dev => {
            const d = dev.toLowerCase();
            return cleanJid === d || rawNumber === d.split('@')[0];
        });
    },
    isPrivateMode() { return config.MODE === 'private'; },
    getPrefix() { return config.PREFIX; }
};

export default config;