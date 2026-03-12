import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import fs from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

export default {
    name: "صورة",
    aliases: ["صوره", "setpp", "setpicture"],
    description: "تغيير صورة المجموعة",
    category: "group",
    admin: true,
    group: true,

    async run({ bot, message, isGroup, userJid, reply, react }) {
        const jid = message.key.remoteJid;

        if (!isGroup) {
            return reply("❌ *هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        // ✅ التحقق من أن المستخدم مشرف
        try {
            const groupMetadata = await bot.sock.groupMetadata(jid);
            const senderParticipant = groupMetadata.participants.find(p => p.id === userJid);
            
            if (!senderParticipant?.admin) {
                return reply("*❌ هـذا الأمـࢪ لـلـمـشـࢪفـيـن فـقـط.*");
            }
        } catch (error) {
            console.error("❌ خطأ في جلب معلومات المجموعة:", error);
            return reply("*❌ خـلـيـنـي مـشـࢪف الأول يـا عـبـيـط.*");
        }

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMsg = message.message?.imageMessage || quoted?.imageMessage;

        if (!imageMsg) {
            return reply("📸 *قـم بـالـرد عـلى صـورة لـتـغـيـيـر صـورة الـمـجـمـوعـة*");
        }

        await react("📸");

        try {
            // تحميل الصورة مباشرة بدون أي تعديل (نفس الجودة الأصلية)
            const stream = await downloadContentFromMessage(imageMsg, "image");
            let buffer = Buffer.from([]);
            
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // تغيير صورة المجموعة بالصورة الأصلية (بدون تغيير الجودة)
            await bot.sock.updateProfilePicture(jid, buffer);

            // رسالة النجاح
            const successMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*📸 تـغـيـيـر صـورة الـمـجـمـوعـة*

*───━━━⊱  🖼️  ⊰━━━───*

*👤 الـمـشـرف:* ⦓ *@${userJid.split('@')[0]}* ⦔

*✅ تـم تـغـيـيـر صـورة الـمـجـمـوعـة بـنـجـاح*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await bot.sendMessage(jid, {
                text: successMsg,
                mentions: [userJid]
            }, { quoted: message });

            await react("✅");

        } catch (error) {
            console.error("❌ خطأ في تغيير صورة المجموعة:", error);
            
            const errorMsg = `*❌ خـلـيـنـي مـشـࢪف الأول يـا عـبـيـط.*`;

            await bot.sendMessage(jid, {
                text: errorMsg,
                mentions: [userJid]
            }, { quoted: message });
        }
    }
};