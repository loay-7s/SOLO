import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const execPromise = promisify(exec);

export default {
    name: "عكس_الوان",
    aliases: ["عكسالوان"],
    description: "عكس ألوان الصورة (Negative Effect)",
    category: "tools",
    
    async run({ message, sock, reply, react }) {
        let mediaMessage = null;
        
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
            mediaMessage = message.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
        } else if (message.message?.imageMessage) {
            mediaMessage = message.message.imageMessage;
        }
        
        if (!mediaMessage) {
            return reply("*❌ ࢪد عـلـى صـورة بـالأمـر لـ عـكـس الـوانـهـا.*");
        }
        
        await react("🎭");
        
        const tempPath = path.join(process.cwd(), 'temp');
        fs.ensureDirSync(tempPath);
        const inputFile = path.join(tempPath, `in_${Date.now()}.jpg`);
        const outputFile = path.join(tempPath, `out_${Date.now()}.jpg`);
        
        try {
            const stream = await downloadContentFromMessage(mediaMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            await fs.writeFile(inputFile, buffer);
            
            // تأثير عكس الألوان
            await execPromise(`ffmpeg -i "${inputFile}" -vf "negate" "${outputFile}" -y`);
            
            await sock.sendMessage(message.key.remoteJid, {
                image: { url: outputFile },
                caption: "*🎭 تـم عـكـس ألـوان الـصـورة 🎭*"
            }, { quoted: message });
            
            await fs.unlink(inputFile).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
            await react("✅");
        } catch (error) {
            console.error(error);
            await react("❌");
            await reply("*❌ فـشـل مـعـالـجـة الـصـورة*");
        }
    }
};