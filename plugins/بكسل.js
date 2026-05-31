import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const execPromise = promisify(exec);

export default {
    name: "بكسل",
    aliases: ["pixel","pixelate"],
    description: "تحويل الصورة إلى تأثير بكسل (مكعبات)",
    category: "tools",
    
    async run({ message, sock, reply, react }) {
        let mediaMessage = null;
        
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
            mediaMessage = message.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
        } else if (message.message?.imageMessage) {
            mediaMessage = message.message.imageMessage;
        }
        
        if (!mediaMessage) {
            return reply("*❌ ࢪد عـلـى صـورة بـالأمـر لـ تـحـويـلـهـا.*");
        }
        
        await react("◽");
        
        const tempPath = path.join(process.cwd(), 'temp');
        fs.ensureDirSync(tempPath);
        const inputFile = path.join(tempPath, `in_${Date.now()}.jpg`);
        const outputFile = path.join(tempPath, `out_${Date.now()}.jpg`);
        
        try {
            const stream = await downloadContentFromMessage(mediaMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            await fs.writeFile(inputFile, buffer);
            
            // تأثير بكسل (تقسيم الصورة لمكعبات 10x10)
            await execPromise(`ffmpeg -i "${inputFile}" -vf "scale=iw/10:ih/10,scale=iw*10:ih*10" "${outputFile}" -y`);
            
            await sock.sendMessage(message.key.remoteJid, {
                image: { url: outputFile },
                caption: "*◽ تـم تـحـويـل الـصـورة إلـى طـابـع بــكــســل ◽*"
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