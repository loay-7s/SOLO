import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const execPromise = promisify(exec);

export default {
    name: "مخيف",
    aliases: ["horror"],
    description: "تحويل الصوت إلى صوت رعب (نفس السرعة)",
    category: "tools",
    
    async run({ message, sock, reply, react }) {
        let mediaMessage = null;
        
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage) {
            mediaMessage = message.message.extendedTextMessage.contextInfo.quotedMessage.audioMessage;
        }
        
        if (!mediaMessage) {
            return reply("*❌ ࢪد عـلـى فـويـس بـالأمـر .مخيف*");
        }
        
        await react("🔧");
        
        const tempPath = path.join(process.cwd(), 'temp');
        fs.ensureDirSync(tempPath);
        const inputFile = path.join(tempPath, `in_${Date.now()}.mp3`);
        const outputFile = path.join(tempPath, `out_${Date.now()}.mp3`);
        
        try {
            const stream = await downloadContentFromMessage(mediaMessage, 'audio');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            await fs.writeFile(inputFile, buffer);
            
            // تأثير رعب: echo + reverb + تردد منخفض (نفس السرعة)
            await execPromise(`ffmpeg -i "${inputFile}" -af "aecho=0.8:0.9:800:0.4,asetrate=28000,aresample=44100,atempo=1.0" "${outputFile}" -y`);
            
            await sock.sendMessage(message.key.remoteJid, {
                audio: { url: outputFile },
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: message });
            
            await fs.unlink(inputFile).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
            await react("✅");
        } catch (error) {
            console.error(error);
            await react("❌");
            await reply("*❌ فـشـل مـعـالـجـة الـفـويـس*");
        }
    }
};