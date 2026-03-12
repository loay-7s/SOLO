import fs from 'fs';

export default {
    name: "الحماية",
    aliases: ["فتح_الحماية", "غلق_الحماية"],
    category: "admin",

    async run({ sock, m, isDeveloper, text }) {
        const chatId = m.key.remoteJid;
        
        // التأكد من وجود المخزن العالمي
        if (!global.protectionStatus) global.protectionStatus = {};

        const body = (text || "").toLowerCase().trim();
        const fullMsg = (m.message?.conversation || m.message?.extendedTextMessage?.text || "").toLowerCase();

        // التحقق من أن المستخدم مطور
        if (!isDeveloper) {
            return sock.sendMessage(chatId, { 
                text: "*❌ هـذا الأمـر لـلـمـطـوريـن فـقـط*" 
            }, { quoted: m });
        }

        // 1. منطق الفتح
        if (fullMsg.includes("فتح") || body.includes("فتح")) {
            if (global.protectionStatus[chatId] === true) {
                return sock.sendMessage(chatId, { 
                    text: `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*🛡️ نـظـام الـحـمـايـة*
*───━━━⊱  ⚠️  ⊰━━━───*

*✅ الـحـمـايـة مـفـعـلـة بـالـفـعـل*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*` 
                }, { quoted: m });
            }
            
            global.protectionStatus[chatId] = true;
            
            return sock.sendMessage(chatId, { 
                text: `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*🛡️ تـم تـفـعـيـل الـحـمـايـة*
*───━━━⊱  ✅  ⊰━━━───*

*🔒 الـنـظـام الآن يـحـمـي الـمـجـمـوعـة*

*⚠️ سـيـتـم حـذف أي رسـالـة مـخـالـفـة*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*` 
            }, { quoted: m });
        }

        // 2. منطق الغلق
        if (fullMsg.includes("غلق") || body.includes("غلق")) {
            if (global.protectionStatus[chatId] === false || global.protectionStatus[chatId] === undefined) {
                return sock.sendMessage(chatId, { 
                    text: `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*🛡️ نـظـام الـحـمـايـة*
*───━━━⊱  ⚠️  ⊰━━━───*

*❌ الـحـمـايـة مـعـطـلـة بـالـفـعـل*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~` 
                }, { quoted: m });
            }
            
            global.protectionStatus[chatId] = false;
            
            return sock.sendMessage(chatId, { 
                text: `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*🔓 تـم إيـقـاف الـحـمـايـة*
*───━━━⊱  ⚠️  ⊰━━━───*

*🔓 الـنـظـام الآن مـعـطـل*

*📝 سـيـتـم تـرك الـرسـائـل بـدون تـدخـل*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*` 
            }, { quoted: m });
        }

        // 3. عرض الاستمارة (في حالة كتابة .الحماية فقط)
        const shieldImg = './media/shield.jpg';
        const status = global.protectionStatus[chatId] ? "مُـفـعـل ✅" : "مُـعـطـل ❌";
        
        const initialText = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*🛡️ نـظـام الـحـمـايـة*
*───━━━⊱  📋  ⊰━━━───*

*⚠️ الـحـالـة الـحـالـيـة:* ⦓ *${status}* ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📌 الأوامـر الـمـتـوفـرة:*


*✅* *.فتح_الحماية* - *لـتـفـعـيـل الـحـمـايـة*

*❌* *.غلق_الحماية* - *لـتـعـطـيـل الـحـمـايـة*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

        try {
            if (fs.existsSync(shieldImg)) {
                await sock.sendMessage(chatId, { 
                    image: fs.readFileSync(shieldImg), 
                    caption: initialText 
                }, { quoted: m });
            } else {
                await sock.sendMessage(chatId, { 
                    text: initialText 
                }, { quoted: m });
            }
        } catch (e) {
            await sock.sendMessage(chatId, { 
                text: initialText 
            }, { quoted: m });
        }
    }
};