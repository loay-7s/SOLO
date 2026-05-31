import fs from 'fs';

export default {
    name: "منشن",
    aliases: ["tagall"],
    category: "group",
    group: true,

    async run({ sock, m, text, handler }) {
        const chatId = m.key.remoteJid;

        try {
            const metadata = await sock.groupMetadata(chatId).catch(e => null);
            if (!metadata) return;
            
            const participants = metadata.participants || [];
            const sender = m.sender || m.key.participant;
            const senderId = sender.split('@')[0];

            // التحقق من الصلاحية (مشرف أو مطور)
            const isAdmin = participants.find(p => p.id === sender)?.admin !== null;
            const isDev = handler.isDeveloper(senderId);

            if (!isAdmin && !isDev) {
                return await sock.sendMessage(chatId, { 
                    text: "*❌ هـذا الأمـر لـلـمـشـرفـيـن فـقـط*" 
                }, { quoted: m });
            }

            await sock.sendMessage(chatId, { react: { text: "🧧", key: m.key } });

            // جلب صورة المجموعة
            let ppUrl;
            let hasImage = true;
            try {
                ppUrl = await sock.profilePictureUrl(chatId, 'image');
            } catch {
                hasImage = false;
            }

            // تقسيم الأعضاء
            const admins = participants.filter(p => p.admin !== null);
            const members = participants.filter(p => p.admin === null);
            
            // العثور على المالك
            const owner = participants.find(p => p.admin === 'superadmin') || admins[0] || null;
            
            // اسم المجموعة
            const groupName = metadata.subject || 'المجموعة';
            
            // رسالة مخصصة أو رسالة افتراضية
            const customMessage = text ? text : "تـواجـدوا يـا أحـبـة 🌟";

            // بناء قائمة المشرفين (بدون المالك) مع سطر بين كل منشن
            let adminList = '';
            const otherAdmins = admins.filter(admin => admin !== owner);
            otherAdmins.forEach((admin, index) => {
                adminList += `┃ ${index + 1}.* ⦓ *@${admin.id.split('@')[0]}* ⦔\n\n`;
            });

            // بناء قائمة الأعضاء مع سطر بين كل منشن
            let memberList = '';
            members.forEach((member, index) => {
                memberList += `┃ ${index + 1}.* ⦓ *@${member.id.split('@')[0]}* ⦔\n\n`;
            });

            // حساب الأعداد
            const totalAdmins = admins.length;
            const totalMembers = members.length;
            const totalParticipants = participants.length;

            // تصميم الرسالة الأسطوري مع الإحصائيات في الأسفل
            const messageText = `*┏┅ ━━━━━━━━━━━━━━━ ┅ ━┓*
*┃╻💬╹↵ ❮ مـنـشـن جـمـاعـي ❯ ↯*

*┃╻🔖╹↵ ❮ ${groupName} ❯*
*┏┅ ━━━━━━━━━━━━━━━ ┅ ━┓*
*┃╻👑╹↵ ❮ الـمـالـك ❯ ↯*

*┃╻🔖╹↵ ⦓ @${owner ? owner.id.split('@')[0] : 'لا يوجد'} ⦔*
*┣┅ ━━━━━━━━━━━━━━━ ┅ ━┫*
*┃╻🕵🏻‍♂️╹↵ ❮ الـمـشـرفـون ❯ ↯*

${adminList || '┃ ⦓ *لا يوجد مشرفين* ⦔'}
*┣┅ ━━━━━━━━━━━━━━━ ┅ ━┫*
*┃╻👥╹↵ ❮ الأعـضـاء ❯ ↯*

${memberList || '┃ ⦓ *لا يوجد أعضاء* ⦔'}
*┣┅ ━━━━━━━━━━━━━━━ ┅ ━┫*
*┃╻📊╹↵ ❮ الإحـصـائـيـات ❯ ↯*

*┃  • الـمـشـرفـيـن: ⦓ ${totalAdmins} ⦔*
*┃  • الأعـضـاء: ⦓ ${totalMembers} ⦔*
*┃  • الإجـمـالـي: ⦓ ${totalParticipants} ⦔*
*┗┅ ━━━━━━━━━━━━━━━ ┅ ━┛*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~

> *${customMessage}*`;

            if (hasImage) {
                // إرسال الصورة مع النص
                await sock.sendMessage(chatId, {
                    image: { url: ppUrl },
                    caption: messageText,
                    mentions: participants.map(p => p.id)
                }, { quoted: m });
            } else {
                // إرسال نص فقط لو مفيش صورة
                await sock.sendMessage(chatId, {
                    text: messageText,
                    mentions: participants.map(p => p.id)
                }, { quoted: m });
            }

            // إضافة رد فعل إضافي
            setTimeout(async () => {
                await sock.sendMessage(chatId, { 
                    react: { text: "🧧", key: m.key } 
                });
            }, 1000);

        } catch (e) {
            console.error("❌ خطأ في أمر المنشن:", e);
            await sock.sendMessage(chatId, { 
                text: "*❌ حـدث خـطـأ أثـنـاء الـتـنـفـيذ*" 
            }, { quoted: m });
        }
    }
};