import fs from 'fs-extra';
import path from 'path';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
    name: "ميديا",
    aliases: ["save", "قائمة_الميديا", "عرض", "حذف"],
    description: "حفظ الصور والفيديوهات والصوتيات في مجلد media وعرض وإرسال وحذف الملفات المحفوظة",
    category: "tools",
    developer: true,
    group: true,
    private: true,

    async run({ message, sock, reply, react, args }) {
        const cmd = args[0]?.toLowerCase();
        
        // ━━━━━━━━━━ 🗑️ أمر حذف ملف محدد 🗑️ ━━━━━━━━━━
        if (cmd === 'حذف' && args[1]) {
            await react("🗑️");
            
            const fileNumber = parseInt(args[1]);
            if (isNaN(fileNumber) || fileNumber < 1) {
                return reply(`*❌ يـرجـى إدخـال رقـم صـحـيـح*\n📌 مثال: .ميديا حذف 1`);
            }
            
            const mediaDir = path.join(process.cwd(), 'media');
            fs.ensureDirSync(mediaDir);
            
            const files = await fs.readdir(mediaDir);
            const mediaFiles = files.filter(f => {
                const ext = path.extname(f).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.mp4', '.mp3', '.webp', '.pdf', '.docx', '.gif'].includes(ext);
            });
            
            if (fileNumber > mediaFiles.length) {
                return reply(`*❌ لا يـوجـد مـلـف بـالـرقـم ${fileNumber}*\n📊 عدد الملفات المتاحة: ${mediaFiles.length}`);
            }
            
            const targetFile = mediaFiles[fileNumber - 1];
            const filePath = path.join(mediaDir, targetFile);
            
            try {
                await fs.remove(filePath);
                
                await reply(`*╭─━━━━━━━━━━━━━━━─╮*
*│ 🗑️ تـم الـحـذف بـنـجـاح 🗑️*
*╰─━━━━━━━━━━━━━━━─╯*

*📄 الـمـلـف:* ${targetFile}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
                
                await react("✅");
            } catch (error) {
                await react("❌");
                await reply(`*❌ فـشـل الـحـذف*\n${error.message}`);
            }
            return;
        }
        
        // ━━━━━━━━━━ 📋 أمر عرض قائمة الميديا 📋 ━━━━━━━━━━
        if (cmd === 'قائمة' || cmd === 'list' || (cmd === 'عرض' && !args[1])) {
            await react("📋");
            
            const mediaDir = path.join(process.cwd(), 'media');
            fs.ensureDirSync(mediaDir);
            
            const files = await fs.readdir(mediaDir);
            const mediaFiles = files.filter(f => {
                const ext = path.extname(f).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.mp4', '.mp3', '.webp', '.pdf', '.docx', '.gif'].includes(ext);
            });
            
            if (mediaFiles.length === 0) {
                return reply(`*╭─━━━━━━━━━━━━━━━─╮*
*│ 📂 قـائـمـة الـمـيـديـا 📂*
*╰─━━━━━━━━━━━━━━━─╯*

*📭 لا يـوجـد أي مـلـف مـحـفـوظ*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
            }
            
            let numberedList = [];
            
            for (let i = 0; i < mediaFiles.length; i++) {
                const file = mediaFiles[i];
                const filePath = path.join(mediaDir, file);
                const stats = await fs.stat(filePath);
                const sizeKB = (stats.size / 1024).toFixed(2);
                const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                const sizeText = sizeKB < 1024 ? `${sizeKB} KB` : `${sizeMB} MB`;
                
                numberedList.push(`*${i+1}.* 📄 ${file} (${sizeText})`);
            }
            
            let msg = `*╭─━━━━━━━━━━━━━━━━━━─╮*
*│ 📂 قـائـمـة الـمـيـديـا الـمـحـفـوظـة 📂*
*╰─━━━━━━━━━━━━━━━━━━─╯*

*📊 الإجمالي:* ${mediaFiles.length} ملف

*📋 القائمة المرقمة:*
${numberedList.slice(0, 30).join('\n')}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

📌 *لإرسال ملف:* .ميديا عرض (الرقم)
📌 *لحذف ملف:* .ميديا حذف (الرقم)

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;
            
            if (msg.length > 4096) {
                const parts = msg.match(/.{1,4000}/g);
                for (const part of parts) await reply(part);
            } else {
                await reply(msg);
            }
            
            await react("✅");
            return;
        }
        
        // ━━━━━━━━━━ 🖼️ أمر عرض وإرسال ملف محدد 🖼️ ━━━━━━━━━━
        if (cmd === 'عرض' && args[1]) {
            await react("📤");
            
            const fileNumber = parseInt(args[1]);
            if (isNaN(fileNumber) || fileNumber < 1) {
                return reply(`*❌ يـرجـى إدخـال رقـم صـحـيـح*\n📌 مثال: .ميديا عرض 1`);
            }
            
            const mediaDir = path.join(process.cwd(), 'media');
            fs.ensureDirSync(mediaDir);
            
            const files = await fs.readdir(mediaDir);
            const mediaFiles = files.filter(f => {
                const ext = path.extname(f).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.mp4', '.mp3', '.webp', '.pdf', '.docx', '.gif'].includes(ext);
            });
            
            if (fileNumber > mediaFiles.length) {
                return reply(`*❌ لا يـوجـد مـلـف بـالـرقـم ${fileNumber}*\n📊 عدد الملفات المتاحة: ${mediaFiles.length}`);
            }
            
            const targetFile = mediaFiles[fileNumber - 1];
            const filePath = path.join(mediaDir, targetFile);
            const ext = path.extname(targetFile).toLowerCase();
            const fileBuffer = await fs.readFile(filePath);
            
            if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                await sock.sendMessage(message.key.remoteJid, {
                    image: fileBuffer,
                    caption: `*🖼️ تـم إرسـال الـمـلـف:*\n📄 ${targetFile}`
                }, { quoted: message });
            } else if (ext === '.mp4') {
                await sock.sendMessage(message.key.remoteJid, {
                    video: fileBuffer,
                    caption: `*🎥 تـم إرسـال الـمـلـف:*\n📄 ${targetFile}`
                }, { quoted: message });
            } else if (ext === '.mp3') {
                await sock.sendMessage(message.key.remoteJid, {
                    audio: fileBuffer,
                    mimetype: 'audio/mpeg',
                    ptt: false
                }, { quoted: message });
            } else if (ext === '.webp') {
                await sock.sendMessage(message.key.remoteJid, {
                    sticker: fileBuffer
                }, { quoted: message });
            } else {
                await sock.sendMessage(message.key.remoteJid, {
                    document: fileBuffer,
                    fileName: targetFile,
                    mimetype: 'application/octet-stream'
                }, { quoted: message });
            }
            
            await react("✅");
            return;
        }
        
        // ━━━━━━━━━━ 💾 أمر حفظ الميديا (الرد على الرسالة) 💾 ━━━━━━━━━━
        
        let fileName = args.join(" ");
        
        let mediaMessage = null;
        let mediaType = null;
        
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg) {
            return reply(`*╭─━━━━━━━━━━━━━━━─╮*
*│ 💾 أمـر إدارة الـمـيـديـا 💾*
*╰─━━━━━━━━━━━━━━━─╯*

*📝 طـرق الاسـتـخـدام:*

*1️⃣ حفظ/اضافة ملف:*
(رد على الوسائط) .ميديا اسم_الملف

*2️⃣ عرض قائمة الميديا:*
.ميديا قائمة

*3️⃣ إرسال ملف محفوظ:*
.ميديا عرض (الرقم)

*4️⃣ حذف ملف محفوظ:*
.ميديا حذف (الرقم)

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
📌 *أمثلة:*
│ .ميديا solo
│ .ميديا قائمة
│ .ميديا عرض 3
│ .ميديا حذف 3

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
        }
        
        // تحديد نوع الوسائط
        if (quotedMsg.imageMessage) {
            mediaMessage = quotedMsg.imageMessage;
            mediaType = "image";
            if (!fileName) fileName = `image_${Date.now()}`;
        } else if (quotedMsg.videoMessage) {
            mediaMessage = quotedMsg.videoMessage;
            mediaType = "video";
            if (!fileName) fileName = `video_${Date.now()}`;
        } else if (quotedMsg.audioMessage) {
            mediaMessage = quotedMsg.audioMessage;
            mediaType = "audio";
            if (!fileName) fileName = `audio_${Date.now()}`;
        } else if (quotedMsg.stickerMessage) {
            mediaMessage = quotedMsg.stickerMessage;
            mediaType = "sticker";
            if (!fileName) fileName = `sticker_${Date.now()}`;
        } else if (quotedMsg.documentMessage) {
            mediaMessage = quotedMsg.documentMessage;
            mediaType = "document";
            if (!fileName) fileName = quotedMsg.documentMessage.fileName || `file_${Date.now()}`;
        } else {
            return reply("*❌ لا توجد وسائط للحفظ في هذه الرسالة*");
        }
        
        await react("💾");
        
        const mediaDir = path.join(process.cwd(), 'media');
        fs.ensureDirSync(mediaDir);
        
        let safeFileName = fileName.replace(/[^a-zA-Z0-9\u0600-\u06FF._-]/g, '_');
        
        let extension = "";
        if (mediaType === "image") extension = ".jpg";
        else if (mediaType === "video") extension = ".mp4";
        else if (mediaType === "audio") extension = ".mp3";
        else if (mediaType === "sticker") extension = ".webp";
        else if (mediaType === "document") {
            const originalName = mediaMessage.fileName || "file";
            extension = path.extname(originalName);
            safeFileName = safeFileName.replace(extension, '');
        }
        
        const finalFileName = `${safeFileName}${extension}`;
        const filePath = path.join(mediaDir, finalFileName);
        
        try {
            const stream = await downloadContentFromMessage(mediaMessage, mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            await fs.writeFile(filePath, buffer);
            
            const fileSizeKB = (buffer.length / 1024).toFixed(2);
            const fileSizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
            let sizeText = fileSizeKB < 1024 ? `${fileSizeKB} KB` : `${fileSizeMB} MB`;
            
            await reply(`*╭─━━━━━━━━━━━━━━━─╮*
*│ 💾 تـم الـحـفـظ بـنـجـاح 💾*
*╰─━━━━━━━━━━━━━━━─╯*

*📄 الاسم:* ${finalFileName}
*📂 النوع:* ${mediaType}
*📦 الحجم:* ${sizeText}
*💾 المسار:* media/${finalFileName}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

💡 *لعرض الملفات:* .ميديا قائمة

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
            
            await react("✅");
            
        } catch (error) {
            console.error("Save error:", error);
            await react("❌");
            await reply(`*❌ فـشـل الـحـفـظ*\n${error.message}`);
        }
    }
};