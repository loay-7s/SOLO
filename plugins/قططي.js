import { catsStore } from '../config.js';

export default {
    name: "قططي",
    description: "عرض قائمة قططك المسجلة كجهات اتصال",
    category: "fun",
    aliases: ["قططي", "mycats"],

    async run({ bot, message, react }) { 
        const jid = message.key.remoteJid;
        const sender = message.sender || message.key.participant || "";

        // التفاعل مع الرسالة (مثل ملف المطور)
        await react('🐈');

        // تحميل البيانات من المخزن
        await catsStore.load();
        let myCats = catsStore.get(sender) || [];

        if (!Array.isArray(myCats) || myCats.length === 0) {
            return bot.sendMessage(jid, { text: "😿 *لـيـس لـديـك أي قـطـط مـسـجـلـة حـالـيـاً.*" }, { quoted: message });
        }

        // --- الخطوة 1: تجهيز جهات الاتصال (VCards) للقطط ---
        const catContacts = myCats.map((catJid, index) => {
            const num = catJid.split('@')[0];
            return {
                displayName: `القطة رقم ${index + 1}`,
                vcard: `BEGIN:VCARD
VERSION:3.0
FN:SOLO CAT #${index + 1}
TEL;type=CELL;waid=${num}:${num}
ORG:SOLO SYSTEM PETS
NOTE:هذه القطة تابعة للمستخدم المسجل.
END:VCARD`
            };
        });

        // --- الخطوة 2: إرسال النص التعريفي ---
        const caption = `*⌬〔 𝐒𝐎𝐋𝐎 𝐂𝐀𝐓𝐒 𝐋𝐈𝐒𝐓 🐈 〕⌬*\n\n*👤 الـمـالـك:* @${sender.split('@')[0]}\n*📊 عـدد الـقـطـط:* ${myCats.length}\n\n*تـم جـلـب الـبـيـانـات مـن قـاعـدة الـمـجـلـد.. 👇*`;

        await bot.sendMessage(jid, { 
            text: caption, 
            mentions: [sender, ...myCats] 
        }, { quoted: message });

        // --- الخطوة 3: إرسال القطط كبطاقات اتصال (مثل المطور) ---
        await bot.sendMessage(jid, {
            contacts: {
                displayName: `قائمة قططك (${myCats.length})`,
                contacts: catContacts
            }
        }, { quoted: message });

        await react('✅');
    }
};