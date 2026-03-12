import { makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, Browsers, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import gradient from 'gradient-string';
import QRCode from 'qrcode-terminal';
import { EventEmitter } from 'events';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
EventEmitter.defaultMaxListeners = 100;
process.setMaxListeners(0);
const logger = pino({ level: 'silent' });
console.debug = () => {};
console.info = () => {};

// 🎨 تصاميم فخمة جداً (نفسها بدون تغيير)
const styles = {
    gold: chalk.hex('#FFD700'),
    silver: chalk.hex('#C0C0C0'),
    purple: chalk.hex('#9B59B6'),
    cyan: chalk.hex('#00FFFF'),
    pink: chalk.hex('#FF69B4'),
    orange: chalk.hex('#FFA500'),
    red: chalk.hex('#FF4444'),
    green: chalk.hex('#00FF00'),
    blue: chalk.hex('#4169E1'),
    yellow: chalk.hex('#FFFF00'),
    white: chalk.white,
    rainbow: (text) => gradient(['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'])(text)
};

class SOLOBot {
    constructor() {
        this.sock = null;
        this.authState = null;
        this.saveCreds = null;
        this.isConnected = false;
        this.startTime = Date.now();
        this.connectionRetries = 0;
        this.maxRetries = Infinity;
        this.config = { PREFIX: '.', MODE: 'public' };
        this.handler = null;
        this.messages = null;
        this.console = null;
        this.system = null;
        this.qrAttempts = 0;
        this.reconnecting = false;
        
        // ✅ نظام منع التعلق
        this.keepAlive = null;
        this.messageCount = 0;
        this.lastMessageTime = Date.now();
        
        global.bot = this;
    }

    // 🚀 البانر الرئيسي الفخم (نفسه)
    showMainBanner() {
        console.clear();
        console.log(styles.rainbow(`
    ███████╗ ██████╗ ██╗      ██████╗     ██████╗  ██████╗ ████████╗
    ██╔════╝██╔═══██╗██║     ██╔═══██╗    ██╔══██╗██╔═══██╗╚══██╔══╝
    ███████╗██║   ██║██║     ██║   ██║    ██████╔╝██║   ██║   ██║   
    ╚════██║██║   ██║██║     ██║   ██║    ██╔══██╗██║   ██║   ██║   
    ███████║╚██████╔╝███████╗╚██████╔╝    ██████╔╝╚██████╔╝   ██║   
    ╚══════╝ ╚═════╝ ╚══════╝ ╚═════╝     ╚═════╝  ╚═════╝    ╚═╝   
        `));
        
        const infoBox = `
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║              🍷  𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐃 𝐁𝐘 𝐒𝐔𝐍𝐆  🍷                       ║
    ║              📞  +𝟐𝟎𝟏𝟐𝟐𝟔𝟎𝟏𝟖𝟕𝟖𝟑                               ║
    ║              ⚡  𝐕𝐄𝐑𝐒𝐈𝐎𝐍 𝟓.𝟎 𝐒𝐓𝐀𝐁𝐋𝐄 ⚡                       ║
    ║              🔥  𝐍𝐄𝐕𝐄𝐑 𝐂𝐑𝐀𝐒𝐇 𝐄𝐃𝐈𝐓𝐈𝐎𝐍 🔥                      ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
        `;
        
        console.log(styles.gold(infoBox));
        console.log(styles.cyan('\n  ⚡ INITIALIZING BOT SYSTEMS... ⚡\n'));
    }

    // 🎯 شاشة الاتصال الناجح (نفسها)
    showConnectedScreen() {
        console.clear();
        this.showMainBanner();
        
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const connectedBox = `
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║              🎉  𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘!  🎉               ║
    ║                                                              ║
    ╠══════════════════════════════════════════════════════════════╣
    ║                                                              ║
    ║  📱  𝐒𝐓𝐀𝐓𝐔𝐒:        🟢 𝐎𝐍𝐋𝐈𝐍𝐄                               ║
    ║  ⏰  𝐔𝐏𝐓𝐈𝐌𝐄:        ${`${hours}h ${minutes}m ${seconds}s`.padEnd(30)}║
    ║  💬  𝐌𝐄𝐒𝐒𝐀𝐆𝐄𝐒:      ${this.messageCount}                                  ║
    ║                                                              ║
    ║  🍷  𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑:     𝐒𝐔𝐍𝐆                                   ║
    ║  📞  𝐂𝐎𝐍𝐓𝐀𝐂𝐓:      +𝟐𝟎𝟏𝟐𝟐𝟔𝟎𝟏𝟖𝟕𝟖𝟑                           ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
        `;
        
        console.log(styles.green(connectedBox));
        console.log(styles.cyan('\n  ✨ Type .menu to see all commands ✨\n'));
    }

    // 📱 شاشة QR Code (نفسها)
    showQRScreen(qr, attempt) {
        console.clear();
        this.showMainBanner();
        
        const qrBox = `
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║              📱  𝐒𝐂𝐀𝐍 𝐐𝐑 𝐂𝐎𝐃𝐄 𝐓𝐎 𝐂𝐎𝐍𝐍𝐄𝐂𝐓  📱               ║
    ║                                                              ║
    ╠══════════════════════════════════════════════════════════════╣
    ║                                                              ║
    ║  ⏰  𝐄𝐗𝐏𝐈𝐑𝐄𝐒 𝐈𝐍:    𝟔𝟎 𝐬𝐞𝐜𝐨𝐧𝐝𝐬                              ║
    ║  📊  𝐀𝐓𝐓𝐄𝐌𝐏𝐓:       ${attempt}/3                                         ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
        `;
        
        console.log(styles.orange(qrBox));
        
        console.log(styles.cyan('\n  📋  𝐇𝐎𝐖 𝐓𝐎 𝐂𝐎𝐍𝐍𝐄𝐂𝐓:\n'));
        console.log(styles.white('  1️⃣  Open WhatsApp on your phone'));
        console.log(styles.white('  2️⃣  Tap Menu (⋮) or Settings ⚙️'));
        console.log(styles.white('  3️⃣  Select "Linked Devices" 📱'));
        console.log(styles.white('  4️⃣  Tap "Link a Device" 🔗'));
        console.log(styles.white('  5️⃣  Scan the QR code below 📸\n'));
        
        QRCode.generate(qr, { small: true }, (qrcode) => {
            console.log(styles.green(qrcode));
        });
        
        console.log(styles.yellow(`\n  ⏰ QR expires in 60 seconds | Attempt ${attempt}/3\n`));
    }

    async initialize() {
        try {
            this.showMainBanner();
            this.createDirectories();
            await this.loadConfig();
            await this.startConnection();
            this.startKeepAlive();
        } catch (error) {
            console.log(styles.red('\n❌ Initial setup failed:'), error.message);
            await this.handleReconnection();
        }
    }

// ✅ نظام منع التعلق (بدون soft restart)
startKeepAlive() {
    if (this.keepAlive) clearInterval(this.keepAlive);
    
    this.keepAlive = setInterval(() => {
        // مجرد ping بسيط للحفاظ على الاتصال
        if (this.sock?.ws?.readyState === 1) {
            try {
                this.sock.ws.ping();
            } catch (e) {}
        }
        
        // تنظيف الذاكرة كل ساعة
        if (global.gc) {
            global.gc();
            console.log(styles.blue('🧹 Memory cleaned'));
        }
    }, 60000);
}

    async handleReconnection() {
        this.connectionRetries++;
        if (this.connectionRetries > this.maxRetries) {
            console.log(styles.red('❌ Max reconnection attempts reached'));
            process.exit(1);
        }

        console.log(styles.yellow(`🔄 Reconnection attempt ${this.connectionRetries}/${this.maxRetries}`));
        await new Promise(resolve => setTimeout(resolve, 3000));
        await this.initialize();
    }

    createDirectories() {
        const dirs = ['./session', './plugins', './data', './media'];
        dirs.forEach(dir => fs.ensureDirSync(dir));
    }

    async loadConfig() {
        try {
            const configPath = path.join(process.cwd(), 'config.js');
            if (fs.existsSync(configPath)) {
                const { config } = await import('./config.js');
                this.config = { PREFIX: '.', MODE: 'public', ...config };
            }
        } catch (error) {}
    }

    async startConnection() {
        try {
            const sessionDir = './session';
            
            if (fs.existsSync(sessionDir) && fs.existsSync(path.join(sessionDir, 'creds.json'))) {
                console.log(styles.blue('📁 Existing session found, attempting to use it...'));
            } else {
                console.log(styles.yellow('🆕 No valid session found, will request new QR code...'));
            }

            const { version } = await fetchLatestBaileysVersion();
            console.log(styles.blue(`📱 WhatsApp version: ${version.join('.')}`));

            const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
            this.authState = state;
            this.saveCreds = saveCreds;

            this.sock = makeWASocket({
                version,
                auth: {
                    creds: this.authState.creds,
                    keys: makeCacheableSignalKeyStore(this.authState.keys, logger),
                },
                logger,
                printQRInTerminal: false,
                browser: Browsers.ubuntu('Chrome'),
                syncFullHistory: false,
                retryRequestDelayMs: 1000,
                maxRetries: 3,
                defaultQueryTimeoutMs: 30000,
                keepAliveIntervalMs: 15000
            });

            this.setupEventHandlers();

            if (!this.authState.creds.registered) {
                console.log(styles.yellow('\n⏳ Waiting for QR code...\n'));
            }

        } catch (error) {
            console.log(styles.red('❌ Connection Error:'), error.message);
            setTimeout(() => this.startConnection(), 5000);
        }
    }

    setupEventHandlers() {
        this.sock.ev.on('connection.update', (update) => {
            this.handleConnectionUpdate(update);
        });

        this.sock.ev.on('messages.upsert', (m) => {
            this.handleMessagesUpsert(m);
        });
        
        this.sock.ev.on('group-participants.update', async (data) => {
    try {

        if (data.action !== 'add') return;

        const chatId = data.id;
const participant = data.participants[0];

const newMemberJid =
    typeof participant === "string"
        ? participant
        : (participant.phoneNumber ?? participant.id ?? participant.jid);
        const settingsPath = './data/welcome_settings.json';

        if (!fs.existsSync(settingsPath)) return;

        const settings = fs.readJsonSync(settingsPath, { throws: false }) || {};

        if (!settings[chatId]?.enabled) return;

        try {

            // جلب اسم العضو
            let memberName = newMemberJid.split('@')[0];

            try {
                const contact = await this.sock.onWhatsApp(newMemberJid);
                if (contact?.notify) memberName = contact.notify;
            } catch {}

            // جلب صورة البروفايل
            let ppUrl;
            let hasImage = true;

            try {
                ppUrl = await this.sock.profilePictureUrl(newMemberJid, 'image');
            } catch {
                hasImage = false;
            }

            // رسالة الترحيب (كما هي حرفياً)
            const welcomeMsg = `*╭━─━─━─≪✠≫─━─━─━╮*  *💠𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐓𝐇𝐄 𝐆𝐔𝐈𝐋𝐃💠*
*╰━─━─━─≪✠≫─━─━─━╯*

*🛡️┇ بـكـل فـخـر و إعـتـزاز نـرحـب بـ*
*🔥┇ انـضـمامـك فـي نـقـابـتـنـا*
*🍃┇العـزيـزة و الـغـالـيـة.🌼*

*🍷┇هـنـا حـيـث سكـنـت المـتـعـة💫*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*👤┇ الـعـضـو الـمـوقـر : ⦓ @${newMemberJid.split('@')[0]} ⦔ 🌸*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*💎┇أصـبـحـت جزءاً جـمـيـلاً و مـمـيـزاً فـي عـائـلـتـنـا.🪻*


*⚜️┇نـتـمـنـى لـك رحـلـة مـمـتـعـة و مـمـيـزة مـعـنـا 🎐*


*🚫┇الـࢪجـاء قـࢪاءة قـوانـيـن الـنـقـابـة لـلأهـمـيـة.. اكـتـب [.القوانين]♦️*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*🏛️┇ مـرحـبـاً بـك نـوࢪت فـي عـريـن الـعـظـمـاء.🍷*

   ~*『 𝐄𝐍𝐉𝐎𝐘  𝐘𝐎𝐔𝐑  𝐒𝐓𝐀𝐘 』*~
   *╰━─━─━─≪✠≫─━─━─━╯*
> ~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;

            if (hasImage) {

                await this.sock.sendMessage(chatId, {
                    image: { url: ppUrl },
                    caption: welcomeMsg,
                    mentions: [newMemberJid]
                });

            } else {

                await this.sock.sendMessage(chatId, {
                    text: welcomeMsg,
                    mentions: [newMemberJid]
                });

            }

            console.log(`✅ تم الترحيب بالعضو: ${newMemberJid.split('@')[0]}`);

        } catch (error) {

            console.error("❌ خطأ في الترحيب:", error);

        }

    } catch (err) {

        console.log("❌ Welcome event error:", err);

    }
});

this.sock.ev.on('group-participants.update', async (data) => {

try {

if (data.action !== "add") return;

const chatId = data.id;
const participant = data.participants[0];

const newMemberJid =
typeof participant === "string"
? participant
: (participant.id ?? participant.jid ?? participant.phoneNumber);

const settingsPath = "./data/reception_settings.json";

if (!fs.existsSync(settingsPath)) return;

const settings = fs.readJsonSync(settingsPath, { throws:false }) || {};

if (!settings[chatId]?.enabled) return;

const wait = (ms)=> new Promise(r=>setTimeout(r,ms));


/* الرسالة الأولى */

const msg1 = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*⌬ مـمـلـكـة و نـقـابـات الأنـمـي ⌬*
*───━━━⊱  🏮  ⊰━━━───*

*💎 عـضـو جـديـد :*
*⦓ @${newMemberJid.split('@')[0]} ⦔*

*🌸 جـئـتُ اهـلاً نـوࢪت و اشـࢪقـت اسـتـقـبـالـنـا الـجـمـيـل.*

*🔹 اذا كـانـت هـذه أول مـرة تـدخـل فـيـهـا جـࢪوب انـمـي ولا تـفـهـم مـعـنـى مـمـلـكـة أو نـقـابـة، اقـرأ الـتـالـي:*                                                                                                                                                                                                                                                                                                                                                                                                                                                                 

⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔

*❑ [ الـمـمـلـكـة ] 👑↯*

*الـمـمـلـكـة هـي تـجـمـع عـدد مـن الـنـقـابـات تـحـت مـسـؤولـيـة مـؤسـس او إمـبـراطـور. بـمـعـنـى انـهـا هـي الـنـظـام، والـنـقـابـات، والأعـضـاء، وفـروع مـسـابـقـات...الـخ.*

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*❑ [ الـنـقـابـات ] ⚔️↯*

*الـنـقـابـة هـي جـروب انـمـي داخـل الـمـمـلـكـة. كـل عـضـو يـنـضـم لـنـقـابـة ويـشـارك ويـتـفـاعـل مـعـهـا.*

*⎔┄┄─── ⊱╎⌯ 📌 ⌯╎⊰ ───┄┄⎔*

*⚠️ مـلاحـظـة مـهـمـة:*

*كـل عـضـو يـلـتـزم بـالـنـقـابـة الـتـي دخـل إلـيـهـا، لا يـمـكـن الـتـواجـد فـي نـقـابـتـيـن مـخـتـلـفـتـيـن. لـكـن يـوجـد "زيـارة" بـحـيـث يـمـكـن زيـارة نـقـابـة اخـرى لـمـدة مـعـيـنـة ثـم تـخـرج.*

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*❑ [ الـرتـب بـاخـتـصـار ] 🏅↯*

*👑 الإمـبـراطـور*
*قـائـد الـمـمـلـكـة الأعـلى والـمـسـؤول عـنـها*

*⚜ نـائـب الإمـبـراطـور*
*يـسـاعـد فـي إدارة الـمـمـلـكـة*

*🏰 الـلـورد*
*مـسـؤول عـن الـمـمـلـكـة بـعـد الـنـائـب، ويـكـون لـديـه نـواب مـسـؤولـة عـن كـل جـزء فـي الـمـمـلـكـة، حـيـث انـه مـتـعـدد الـمـهـام*

*🛡 الـسـلـطـان*
*مـسـؤول عـن الأَمـن والـنـظـام فـي الـمـمـلـكـة*

*📜 الـدوق / الـمـارشـال*
*مـسـؤولـون عـن عـدد مـحـدد مـن الـنـقـابـات*

*⚓ الأدمـيـرال*
*يـديـر نـقـابـة واحـدة خـاصـة بـه ويـشـرف عـلى الأعـضـاء*


*⚔ بـاقـي الـرتـب:* 
*تـنـفـذ الـمـهـام الآتـيـة مـن الأدمـيـرال وتـتـدرج مـع الـنـشـاط*

⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔

*💠 انـضـم لـنـقـابـة، شـارك فـي الـتـفـاعـل والـفـعـالـيـات، ومـع الـوقـت تـرتـقـي فـي الـرتـب اذا أرَدت*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
> *~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

await this.sock.sendMessage(chatId,{
text: msg1,
mentions:[newMemberJid]
});


await wait(1000);


/* الرسالة الثانية */

const msg2 = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*⌬ شـرح إسـتـمـاࢪة الاسـتـقـبـال 📄 ⌬*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
*───━━━⊱  📋  ⊰━━━───*
*❑ [ الـلـقـب ] 🏷️↯*

*اخـتـار اسـم شـخـصـيـة انـمـي / مـانـهـوا / مـانـجـا / لـعـبـة، لـتـكـون لـقـبـك فـي الـنـقـابـة.*

*⚠️ يـجـب اخـتـيـار لـقـب مـتـاح، حـيـث الألـقـاب الـمـأخـوذة مـكـتـوبـة فـي مـعـلـومـات الـجـروب أو الـوصـف.*
*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*❑ [ الـطـرف ] 🔗↯*

*مـن الـشـخـص او مـا الـصـفـحـة الـذي أتـيـت إلـى الـجـروب هـنـا عـن طـريـقـهـا؟*    
*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*❑ [ الـجـنـس ] ⚥↯*

*بـنـت أو ولـد؟*

*⚠️ لا يـمـكـن لـبـنـت اخـذ لـقـب شـخـصـيـة ولـد والعكس.*                                                                                                                                                                    

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*💎 تـم اࢪسـال اسـتـمـارة الأسـتـقـبـال يـࢪجـى نـسـخـهـا و مـلـئ الـفـࢪاغـات ثـم اࢪسـلـهـا و تـأكـد انـك اخـتـࢪت لـقـب مـتـاح لـيـس مـأخـوذ، الألـقـاب الـمـاخـوذة فـي الـوصـف [بـعـد أن تـمـلأ الإسـتـمـاࢪة، انـتـظـر حـتـى يـأتـي مـشـࢪف لـ يـدخـلـك الـجـࢪوب الأسـاسـي.🪷*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
> *~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

await this.sock.sendMessage(chatId,{
text: msg2,
mentions:[newMemberJid]
});


await wait(1000);


/* الرسالة الثالثة */

const msg3 = `﷽
*✪ ◞ اهـلا بـك فـي اسـتـقـبـال الـنـقـابـة ◜*
*⌬──≪══━━⊹𓆩🏮𓆪⊹━━══≽──⌬*

*✪ يـࢪجـى مـلء الإسـتـمـاࢪة📄*

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*❐╎الــلــقـب؟↫「 」*


*❐╎مِـن طـرف مَـن؟↫「 」*


*❐╎بـنـت أو ولـد؟↫「 」*

*⌬──≪══━━⊹𓆩🏮𓆪⊹━━══≽──⌬*
> *~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

await this.sock.sendMessage(chatId,{
text: msg3,
mentions:[newMemberJid]
});


} catch(err){

console.log("Reception error:",err);

}

});

        this.sock.ev.on('creds.update', () => {
            if (this.saveCreds) this.saveCreds();
        });
    }

    handleConnectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr && !this.authState.creds.registered) {
            this.qrAttempts++;
            this.showQRScreen(qr, this.qrAttempts);
            
            if (this.qrAttempts >= 3) {
                console.log(styles.red('\n⚠️ Multiple QR attempts failed. Restarting process...\n'));
                this.qrAttempts = 0;
                setTimeout(() => {
                    fs.rmSync('./session', { recursive: true, force: true });
                    this.initialize();
                }, 3000);
            }
        }
        
        if (connection === 'open') {
            this.isConnected = true;
            this.connectionRetries = 0;
            this.qrAttempts = 0;
            this.reconnecting = false;
            
            this.showConnectedScreen();
            
            // تحميل المنبهات المحفوظة
            try {
                import('./data/alarms.js').then(module => {
                    if (module.loadSavedAlarms) {
                        module.loadSavedAlarms(this.sock);
                    }
                }).catch(() => {});
            } catch (e) {}
            
            if (!this.handler) { 
                console.log(styles.cyan('🚀 Loading bot systems...'));
                this.loadSystems();
            }
            
        } else if (connection === 'close') {
            this.isConnected = false;
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const isCriticalError = statusCode === DisconnectReason.loggedOut || statusCode === DisconnectReason.connectionReplaced;

            if (isCriticalError) {
                console.log(styles.red('\n❌ Critical session issue. Cleaning up...'));
                fs.rmSync('./session', { recursive: true, force: true });
                setTimeout(() => this.initialize(), 3000);
            } else {
                if (!this.reconnecting) {
                    this.reconnecting = true;
                    console.log(styles.yellow('\n🔄 Reconnecting...\n'));
                    setTimeout(() => {
                        this.reconnecting = false;
                        this.startConnection();
                    }, 5000);
                }
            }
        }
    }

    async handleMessagesUpsert(m) {
        try {
            const message = m.messages[0];
            if (!message || !message.message || message.key.remoteJid === 'status@broadcast') return;
            
            // تحديث الوقت
            this.lastMessageTime = Date.now();
            this.messageCount++;
            
            const messageTime = message.messageTimestamp ? message.messageTimestamp * 1000 : Date.now();
            if (messageTime < this.startTime - 10000) return;

            if (this.console) this.console.logMessage(message);
            if (this.handler) await this.handler.handleMessage(message);
        } catch (error) {}
    }

    async loadSystems() {
        try {
            const handlerPath = path.join(process.cwd(), 'handler.js');
            if (fs.existsSync(handlerPath)) {
                const { Handler } = await import('./handler.js');
                this.handler = new Handler(this);
                await this.handler.loadPlugins();
                console.log(styles.green('  ✅ Command handler loaded'));
            }
            
            const messagesPath = path.join(process.cwd(), 'messages.js');
            if (fs.existsSync(messagesPath)) {
                const { MessageSystem } = await import('./messages.js');
                this.messages = new MessageSystem(this);
                console.log(styles.green('  ✅ Message system loaded'));
            }
            
            const consolePath = path.join(process.cwd(), 'console.js');
            if (fs.existsSync(consolePath)) {
                const { ConsoleSystem } = await import('./console.js');
                this.console = new ConsoleSystem(this);
                console.log(styles.green('  ✅ Console system loaded'));
            }
            
            console.log(styles.green('✅ All systems loaded'));
        } catch (error) {
            console.log(styles.red('❌ System loading failed:'), error.message);
        }
    }

    async sendMessage(jid, content, options = {}) {
        try {
            return await this.sock.sendMessage(jid, content, options);
        } catch (error) {
            console.log(styles.red('❌ Send message error:'), error.message);
        }
    }

    async softRestart() {
        console.log(styles.yellow('\n🔄 Soft restart...\n'));
        this.handler = null;
        this.messages = null;
        this.console = null;
        this.reconnecting = false;
        this.messageCount = 0;
        this.startTime = Date.now();
        
        if (this.keepAlive) {
            clearInterval(this.keepAlive);
            this.keepAlive = null;
        }
        
        if (this.sock) {
            try {
                await this.sock.end(new Error('Restarting'));
            } catch (e) {}
        }
        
        setTimeout(() => this.startConnection(), 2000);
    }
}

async function main() {
    const bot = new SOLOBot();
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', async (input) => {
        if (input.toLowerCase() === '.restart') {
            await bot.softRestart();
        } else if (input.toLowerCase() === '.exit') {
            if (bot.keepAlive) clearInterval(bot.keepAlive);
            console.log(styles.yellow('\n👋 Shutting down...\n'));
            process.exit(0);
        }
    });

    try {
        await bot.initialize();
    } catch (error) {
        console.error(styles.red('❌ Critical error:'), error);
        setTimeout(() => main(), 5000);
    }
}

process.on('SIGINT', () => {
    console.log(styles.yellow('\n👋 Received SIGINT. Shutting down...\n'));
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log(styles.yellow('\n👋 Received SIGTERM. Shutting down...\n'));
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.log(styles.red('\n❌ Error:'), error.message);
});

process.on('unhandledRejection', (error) => {
    // تجاهل
});

main();