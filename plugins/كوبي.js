// ملف: plugins/كوبي.js (بإصلاح نهائي لطريقة التحقق من الصلاحيات)

import fs from 'fs-extra';
import path from 'path';

const backupDir = path.join(process.cwd(), 'data', 'group_backups');
fs.ensureDirSync(backupDir);

export default {
    name: "كوبي",
    aliases: ["copy"],
    description: "إدارة نسخ المجموعات (نسخ، لصق، عرض، حذف).",
    category: "group",
    group: true,

    async run({ message, args, reply, sock, isDeveloper }) {
        const subCommand = args[0]?.toLowerCase();
        const backupName = args[1];

        if (!subCommand) {
            const helpMessage = `
*╔═════ 「 إدارة النسخ 」 ═════╗*
*║*
*║ 📋 *.كوبي نسخ <اسم>*
*║*    (لحفظ نسخة من المجموعة الحالية)
*║*
*║ 📥 *.كوبي لصق <اسم>*
*║*    (لتطبيق نسخة محفوظة)
*║*
*║ 📂 *.كوبي عرض*
*║*    (لعرض كل النسخ المحفوظة)
*║*
*║ 🔎 *.كوبي عرض <اسم>*
*║*    (لعرض تفاصيل نسخة معينة)
*║*
*║ 🗑️ *.كوبي حذف <اسم>*
*║*    (لحذف نسخة محفوظة)
*║*
*╚══════════════════╝*
            `;
            return reply(helpMessage.trim());
        }

        // --- التحقق من صلاحيات المستخدم (مشرف أو مطور) ---
        const metadata = await sock.groupMetadata(message.key.remoteJid);
        const sender = metadata.participants.find(p => p.id === message.key.participant);
        const isAdmin = sender?.admin === 'admin' || sender?.admin === 'superadmin';

        if (!isAdmin && !isDeveloper) {
            return reply("❌ هذا الأمر للمشرفين والمطور فقط.");
        }

        const requiresBackupName = ['نسخ', 'لصق', 'حذف'];
        if (requiresBackupName.includes(subCommand) && !backupName) {
            return reply(`📂 يرجى تحديد اسم للنسخة بعد الأمر الفرعي.\n*مثال:*\n.كوبي ${subCommand} سولو`);
        }
        
        const backupPath = backupName ? path.join(backupDir, `${backupName}.json`) : null;

        // ==================== منطق الأوامر الفرعية ====================
        switch (subCommand) {
            case "نسخ": {
                await reply(`🔄 جاري حفظ نسخة من المجموعة باسم "${backupName}"...`);
                try {
                    const currentMetadata = await sock.groupMetadata(message.key.remoteJid);
                    const backupData = {
                        name: currentMetadata.subject,
                        desc: currentMetadata.desc?.toString() || 'لا يوجد وصف.',
                        copiedBy: message.pushName,
                        timestamp: new Date().toISOString()
                    };
                    fs.writeJsonSync(backupPath, backupData, { spaces: 2 });
                    let backupMessage = `*✅ تم حفظ النسخة بنجاح!*\n\n*🔖 الاسم المحفوظ:* ${backupData.name}\n*📝 الوصف المحفوظ:*\n\`\`\`${backupData.desc}\`\`\``;
                    await reply(backupMessage.trim());
                } catch (e) {
                    if (e.message.includes('not-a-group')) {
                         await reply(`❌ خطأ: هذه ليست مجموعة.`);
                    } else {
                         await reply(`❌ حدث خطأ أثناء الحفظ: ${e.message}`);
                    }
                }
                break;
            }
            case "لصق": {
                if (!fs.existsSync(backupPath)) {
                    return reply(`❌ لم يتم العثور على نسخة بهذا الاسم: "${backupName}".`);
                }
                await reply(`🔄 جاري تطبيق نسخة "${backupName}"...`);
                try {
                    const backupData = fs.readJsonSync(backupPath);
                    
                    // ✨ [الإصلاح هنا] محاولة تغيير الاسم والتقاط الخطأ ✨
                    await sock.groupUpdateSubject(message.key.remoteJid, backupData.name);
                    await reply(`📝 تم تغيير اسم المجموعة إلى: *${backupData.name}*`);
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    if (backupData.desc) {
                        await sock.groupUpdateDescription(message.key.remoteJid, backupData.desc);
                        await reply(`ℹ️ تم تغيير وصف المجموعة.`);
                    }
                    await reply(`✅ تم تطبيق نسخة "${backupName}" بنجاح!`);

                } catch (e) {
                    // ✨ [الإصلاح هنا] التحقق من رسالة الخطأ المحددة ✨
                    if (e.message.includes('not-admin')) {
                        await reply("❌ فشلت العملية. يجب أن يكون البوت مشرفًا لتنفيذ هذا الأمر.");
                    } else {
                        await reply(`❌ حدث خطأ أثناء التطبيق: ${e.message}`);
                    }
                }
                break;
            }
            case "عرض": {
                if (backupName) {
                    if (!fs.existsSync(backupPath)) {
                        return reply(`❌ لم يتم العثور على نسخة بهذا الاسم: "${backupName}".`);
                    }
                    const backupData = fs.readJsonSync(backupPath);
                    let backupMessage = `*🔎 تفاصيل نسخة: ${backupName}*\n\n*🔖 الاسم:* ${backupData.name}\n*📝 الوصف:*\n\`\`\`${backupData.desc}\`\`\`\n\n*👤 تم نسخها بواسطة:* ${backupData.copiedBy}\n*📅 بتاريخ:* ${new Date(backupData.timestamp).toLocaleDateString('ar-EG')}`;
                    return reply(backupMessage.trim());
                } else {
                    const files = fs.readdirSync(backupDir).filter(file => file.endsWith('.json'));
                    if (files.length === 0) {
                        return reply("🗂️ لا توجد أي نسخ محفوظة حاليًا.");
                    }
                    let listMessage = "*📂 قائمة النسخ المحفوظة:*\n\n";
                    files.forEach((file, index) => {
                        const backupNameFromFile = file.replace('.json', '');
                        listMessage += `*${index + 1}.* \`${backupNameFromFile}\`\n`;
                    });
                    listMessage += "\n*لعرض تفاصيل نسخة، اكتب:*\n.كوبي عرض <اسم_النسخة>";
                    return reply(listMessage.trim());
                }
            }
            case "حذف": {
                if (!fs.existsSync(backupPath)) {
                    return reply(`❌ لم يتم العثور على نسخة بهذا الاسم: "${backupName}".`);
                }
                try {
                    fs.removeSync(backupPath);
                    await reply(`🗑️ تم حذف نسخة "${backupName}" بنجاح.`);
                } catch (e) {
                    await reply(`❌ حدث خطأ أثناء الحذف: ${e.message}`);
                }
                break;
            }
            default:
                await reply(`❌ الأمر الفرعي "${subCommand}" غير معروف. اكتب *.كوبي* لعرض قائمة المساعدة.`);
                break;
        }
    }
};