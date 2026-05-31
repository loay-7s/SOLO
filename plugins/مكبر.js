import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const execPromise = promisify(exec);

export default {
    name: "مكبر",
    aliases: ["amplify", "تكبير"],
    description: "تكبير مستوى الصوت (من 1 إلى 10)",
    category: "tools",
    
    async run({ message, sock, reply, react, args }) {
        let mediaMessage = null;
        
        // جلب رقم التكبير من الأمر
        let level = parseInt(args[0]);
        
        // التحقق من صحة الرقم
        if (isNaN(level) || level < 1 || level > 10) {
            await react("🔊");
            return reply(`*╭─━━━━━━━━━━━━━━━━─╮*
          *│ 🔊 مـكـبـر الـصـوت 🔊*
*╰─━━━━━━━━━━━━━━━━─╯*

*📝 استخدم الأمر مع رقم من 1 إلى 10*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*📌 أمثلة:*
*.مكبر 2* - ضعف الصوت
*.مكبر 5* - 5 أضعاف
*.مكبر 10* - 10 أضعاف

*⚠️ المستويات من 6 لـ 10 قد تسبب تشويه*

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*𝑩𝒀 𝑺𝑶𝑳𝑶 𝑩𝑶𝑻*~`);
        }
        
        // تحويل الرقم إلى مستوى صوت (1 = 1.5x، 10 = 10x)
        // خريطة المستويات: 1→1.5, 2→2, 3→3, 4→4, 5→5, 6→6, 7→7, 8→8, 9→9, 10→10
        let volumeLevel;
        if (level === 1) {
            volumeLevel = 1.5;
        } else {
            volumeLevel = level;
        }
        
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage) {
            mediaMessage = message.message.extendedTextMessage.contextInfo.quotedMessage.audioMessage;
        }
        
        if (!mediaMessage) {
            return reply(`*❌ ࢪد عـلـى فـويـس بـالأمـر .مكبر ${level}*`);
        }
        
        // إيموجي حسب القوة
        const emojis = { 1: "🔈", 2: "🔉", 3: "🔊", 4: "📢", 5: "📣", 6: "🔔", 7: "⏰", 8: "💥", 9: "🤯", 10: "💀" };
        await react(emojis[level] || "🔊");
        
        const tempPath = path.join(process.cwd(), 'temp');
        fs.ensureDirSync(tempPath);
        const inputFile = path.join(tempPath, `in_${Date.now()}.mp3`);
        const outputFile = path.join(tempPath, `out_${Date.now()}.mp3`);
        
        // رسائل مستوى الصوت
        const levelMessages = {
            1: "خـفـيـف", 2: "مـتـوسـط", 3: "واضـح", 4: "عـالـي", 5: "قـوي",
            6: "قـوي جـدا", 7: "مـدهـش", 8: "صـاخـب", 9: "جـنـونـي", 10: "مـدمـر"
        };
        
        try {
            const stream = await downloadContentFromMessage(mediaMessage, 'audio');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            await fs.writeFile(inputFile, buffer);
            
            // تكبير الصوت حسب المستوى المختار
            await execPromise(`ffmpeg -i "${inputFile}" -af "volume=${volumeLevel}" "${outputFile}" -y`);
            
            await sock.sendMessage(message.key.remoteJid, {
                audio: { url: outputFile },
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: message });
            
            await react("✅");
            
        } catch (error) {
            console.error(error);
            await react("❌");
            await reply("*❌ فـشـل مـعـالـجـة الـفـويـس*");
        } finally {
            // تنظيف الملفات المؤقتة
            await fs.unlink(inputFile).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
        }
    }
};