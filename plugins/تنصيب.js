import { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { Boom } from '@hapi/boom';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PAIRING_CODE = 'SOLOXBOT';
const MAX_SUB_BOTS = 3;
const COOLDOWN_TIME = 90000;
const PAIRING_TIMEOUT = 120000; // دقيقتين

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (!global.subBots) global.subBots = {};
if (!global.pairCooldown) global.pairCooldown = {};

function extractNumberFromJid(jid) {
    let number = jid.split('@')[0].split(':')[0];
    number = number.replace(/[^0-9]/g, '');
    if (number.startsWith('0')) number = number.substring(1);
    if (number.length <= 10) number = '20' + number;
    return number;
}

function parsePhoneNumber(input) {
    let cleanNumber = input.toString()
        .replace(/[^0-9]/g, '')
        .replace(/^0+/, '');
    
    try {
        const phone = parsePhoneNumberFromString(`+${cleanNumber}`);
        if (phone && phone.isValid()) {
            return phone.number.substring(1);
        }
    } catch (e) {}
    
    if (cleanNumber.length <= 10) {
        return '20' + cleanNumber;
    }
    
    return cleanNumber;
}

export default {
    name: "تنصيب",
    aliases: ["pair", "بوتاتي", "الغي_ربط"],
    description: "إدارة البوتات الفرعية",
    category: "tools",
    developer: false,
    group: true,
    private: false,

    async run({ message, sock, reply, react, args, userJid }) {
        const cmd = args[0]?.toLowerCase();
        const senderNumber = extractNumberFromJid(userJid);

        // عرض البوتات الفرعية
        if (cmd === 'بوتاتي' || cmd === 'list') {
            await react("📋");
            const activeBots = Object.values(global.subBots).filter(b => b.status === 'online');
            if (activeBots.length === 0) {
                return reply(`*╭─━━━━━━━━━━━━━━━─╮*
*│ 🤖 الـبـوتـات الـفـرعـيـة 🤖*
*╰─━━━━━━━━━━━━━━━─╯*

*📭 لا يـوجـد أي بـوت فـرعـي نـشـط*

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
            }
            let msg = `*╭─━━━━━━━━━━━━━━━─╮*
*│ 🤖 الـبـوتـات الـفـرعـيـة 🤖*
*╰─━━━━━━━━━━━━━━━─╯*

`;
            activeBots.forEach((bot, i) => {
                msg += `*${i+1}.* 📱 *${bot.number}*
│ 🟢 نـشـط
│ 📅 ${new Date(bot.createdAt).toLocaleDateString()}
│ ⏰ ${new Date(bot.createdAt).toLocaleTimeString()}

`;
            });
            msg += `*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;
            return reply(msg);
        }

        // إلغاء ربط بوت فرعي
        if (cmd === 'الغي_ربط' || cmd === 'حذف' || cmd === 'remove') {
            let targetNumber = args[1];
            if (!targetNumber && message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
                const quotedText = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
                if (quotedText && quotedText.match(/\d{10,15}/)) {
                    targetNumber = quotedText.match(/\d{10,15}/)[0];
                }
            }
            if (!targetNumber) {
                return reply(`*╭─━━━━━━━━━━━━━━━─╮*
*│ 🗑️ إلـغـاء ربـط بـوت فـرعـي 🗑️*
*╰─━━━━━━━━━━━━━━━─╯*

*📝 يـرجى إرسـال رقـم الـبـوت الـفـرعـي*

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
📌 مثال: .الغي_ربط 201234567890

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
            }
            let cleanNumber = parsePhoneNumber(targetNumber);
            const userId = `${cleanNumber}@s.whatsapp.net`;
            if (!global.subBots[userId]) {
                return reply(`*❌ لا يـوجـد بـوت فـرعـي بـالـرقـم ${cleanNumber}*`);
            }
            try {
                const sessionPath = path.join(process.cwd(), 'subBots', cleanNumber);
                if (global.subBots[userId].sock) {
                    await global.subBots[userId].sock.end(new Error('Logged out by main bot'));
                }
                delete global.subBots[userId];
                await fs.remove(sessionPath);
                await react("🗑️");
                await reply(`*✅ تـم حـذف الـبـوت الـفـرعـي بـالـرقـم ${cleanNumber} بـنـجـاح*`);
            } catch (err) {
                await reply(`*❌ فـشـل حـذف الـبـوت: ${err.message}*`);
            }
            return;
        }

        // التنصيب
        let targetNumber = args[0];
        
        if (global.pairCooldown[senderNumber]) {
            const remaining = Math.ceil((global.pairCooldown[senderNumber] - Date.now()) / 1000);
            if (remaining > 0) {
                await react("⏰");
                return reply(`*يـجـب أن تـنـتـظـر ${remaining} ثـانـيـة*`);
            }
        }
        
        let cleanNumber;
        if (targetNumber) {
            cleanNumber = parsePhoneNumber(targetNumber);
        } else {
            cleanNumber = senderNumber;
        }
        
        if (!cleanNumber) {
            await react("📱");
            return reply(`*╭─━━━━━━━━━━━━━━━─╮*
*│ 📱 تـنـصـيـب بـوت فـرعـي 📱*
*╰─━━━━━━━━━━━━━━━─╯*

*📝 يـرجى إرسـال رقـم الـهـاتـف*

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
📌 .تنصيب 201234567890

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
        }

        const userId = `${cleanNumber}@s.whatsapp.net`;
        const activeBotsCount = Object.values(global.subBots).filter(b => b.status === 'online').length;
        if (activeBotsCount >= MAX_SUB_BOTS && !global.subBots[userId]) {
            return reply(`*⚠️ عـدد الـبـوتـات ${activeBotsCount}/${MAX_SUB_BOTS}*\nاستخدم .الغي_ربط`);
        }

        await react("⏳");
        
        if (global.subBots[userId]?.sock?.user) {
            return reply(`*⚠️ يـوجـد بـوت فـرعـي بـالـرقـم ${cleanNumber}*`);
        }

        global.pairCooldown[senderNumber] = Date.now() + COOLDOWN_TIME;
        setTimeout(() => delete global.pairCooldown[senderNumber], COOLDOWN_TIME);

        const welcomeMessage = `*╭─━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─╮*
*│ ░█▀▀░█▀█░█▄█░█▀█░█░░░█▀▀░█▀▄░█▀█░█▀▄░█▀▀ │*
*│ ░█░░░█░█░█░█░█░█░█░░░█▀▀░█░█░█░█░█░█░█▀▀ │*
*│ ░▀▀▀░▀▀▀░▀░▀░▀▀▀░▀▀▀░▀▀▀░▀▀░░▀▀▀░▀▀░░▀▀▀ │*
*╰─━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─╯*

*┌─────────────────────────────────┐*
*│      🤖 بـوت SOLO الـفـرعـي      │*
*└─────────────────────────────────┘*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📱 الـرقـم:* ${cleanNumber}
*🔐 كـود الـربـط:* ${PAIRING_CODE}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*⏳ جـاري تـجـهـيـز الـبـوت...*
*⚡ سيصلك كود التفعيل خلال لحظات*
*⏰ الكود صالح لمدة دقيقتين فقط*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;

        await reply(welcomeMessage);

        try {
            const subBotDir = path.join(process.cwd(), 'subBots', cleanNumber);
            fs.ensureDirSync(subBotDir);
            const { state, saveCreds } = await useMultiFileAuthState(subBotDir);
            const { version } = await fetchLatestBaileysVersion();
            
            const subSock = makeWASocket({
                version,
                logger: pino({ level: 'silent' }),
                printQRInTerminal: false,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
                },
                browser: ["Windows", "Chrome", "131.0.0.0"],
                syncFullHistory: false,
                markOnlineOnConnect: true,
            });

            global.subBots[userId] = {
                sock: subSock,
                number: cleanNumber,
                createdAt: Date.now(),
                status: 'connecting',
                timeout: setTimeout(() => {
                    if (global.subBots[userId] && global.subBots[userId].status !== 'online') {
                        delete global.subBots[userId];
                        fs.remove(subBotDir).catch(() => {});
                        sock.sendMessage(message.key.remoteJid, { 
                            text: `*⏰ انتهت مهلة الدقيقتين*\n📱 الرقم: ${cleanNumber}\n*❌ تم إلغاء تنصيب البوت الفرعي*`
                        }).catch(() => {});
                    }
                }, PAIRING_TIMEOUT)
            };
            
            subSock.ev.on('creds.update', saveCreds);

            // انتظر الاتصال لمدة 60 ثانية
let isReady = false;
for (let i = 0; i < 60; i++) {
    if (subSock.user?.id || subSock.authState?.creds?.registered) {
        isReady = true;
        break;
    }
    await delay(1000);
}

// لو لسه مجاش، نحاول نطلب الكود برضه
let code;
try {
    code = await subSock.requestPairingCode(cleanNumber, PAIRING_CODE);
} catch (err) {
    // لو فشل، نرجع نحاول بعد 3 ثواني
    await delay(3000);
    code = await subSock.requestPairingCode(cleanNumber, PAIRING_CODE);
}
            
            const codeMessage = `*╭─━━━━━━━━━━━━━━━━━━━━━─╮*
*│ 🔐 كـود الـتـفـعـيـل 🔐*
*╰─━━━━━━━━━━━━━━━━━━━━━─╯*

*┌─────────────────────────────────┐*
*│         🔑 ${code} 🔑         │*
*└─────────────────────────────────┘*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

📝 *الخطوات:*
1️⃣ اذهب إلى واتساب
2️⃣ الأجهزة المرتبطة
3️⃣ ربط جهاز ← الربط برقم الهاتف
4️⃣ أدخل الكود أعلاه

⏰ *صالح لمدة دقيقتين*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;

            await reply(codeMessage);
            await react("🔐");

            subSock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;
                if (connection === 'open') {
                    if (global.subBots[userId]?.timeout) {
                        clearTimeout(global.subBots[userId].timeout);
                    }
                    global.subBots[userId].status = 'online';
                    const successMessage = `*╭─━━━━━━━━━━━━━━━─╮*
*│ ✅ تـم الـربـط بـنـجـاح ✅*
*╰─━━━━━━━━━━━━━━━─╯*

*📱 ${cleanNumber}*
*🤖 SOLO BOT*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;
                    await sock.sendMessage(message.key.remoteJid, { text: successMessage }, { quoted: message });
                } else if (connection === 'close') {
                    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                    if (reason !== DisconnectReason.loggedOut) {
                        setTimeout(async () => {
                            try {
                                const { state, saveCreds } = await useMultiFileAuthState(subBotDir);
                                subSock.auth = { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) };
                                subSock.connect();
                            } catch (e) {}
                        }, 5000);
                    } else {
                        delete global.subBots[userId];
                        await fs.remove(subBotDir);
                    }
                }
            });
            
        } catch (error) {
            console.error(error);
            if (global.subBots[userId]?.timeout) {
                clearTimeout(global.subBots[userId].timeout);
            }
            delete global.subBots[userId];
            await fs.remove(path.join(process.cwd(), 'subBots', cleanNumber)).catch(() => {});
            await react("❌");
            await reply(`*❌ فـشـل الـتـنـصـيـب*\n${error.message}`);
        }
    }
};