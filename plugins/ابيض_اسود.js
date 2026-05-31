import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const execPromise = promisify(exec);

export default {
    name: "ابيض_اسود",
    aliases: ["bw", "mono", "رمادي"],
    description: "تحويل الصورة إلى أبيض وأسود",
    category: "tools",
    
    async run({ message, sock, reply, react }) {
        let mediaMessage = null;
        
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
            mediaMessage = message.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
        } else if (message.message?.imageMessage) {
            mediaMessage = message.message.imageMessage;
        }
        
        if (!mediaMessage) {
            return reply("*❌ ࢪد عـلـى صـوࢪة بـألأمـࢪ لـ تـحـويـلـهـا الـى ابـيـض و أسـود.*");
        }
        
        await react("🎨");
        
        const tempPath = path.join(process.cwd(), 'temp');
        fs.ensureDirSync(tempPath);
        const inputFile = path.join(tempPath, `in_${Date.now()}.jpg`);
        const outputFile = path.join(tempPath, `out_${Date.now()}.jpg`);
        
        try {
            const stream = await downloadContentFromMessage(mediaMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            await fs.writeFile(inputFile, buffer);
            
            await execPromise(`ffmpeg -i "${inputFile}" -vf "colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3" "${outputFile}" -y`);
            
            // إرسال الصورة مباشرة مع الكابتشن بدون رسايل وسيطة
            await sock.sendMessage(message.key.remoteJid, {
                image: { url: outputFile },
                caption: "*⚫ تـم تـحـويـل الـصـورة إلـى أبـيـض و أسـود ⚪*"
            }, { quoted: message });
            
            await fs.unlink(inputFile).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
            await react("✅");
        } catch (error) {
            console.error(error);
            await react("❌");
            // رسالة خطأ واحدة بس
            await reply("*❌ فـشـل مـعـالـجـة الـصـورة*");
        }
    }
};