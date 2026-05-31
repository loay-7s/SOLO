import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const execPromise = promisify(exec);

export default {
    name: "ابطأ",
    aliases: ["slow"],
    description: "تخفيف سرعة الصوت",
    category: "tools",
    
    async run({ message, sock, reply, react }) {
        let mediaMessage = null;
        
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage) {
            mediaMessage = message.message.extendedTextMessage.contextInfo.quotedMessage.audioMessage;
        }
        
        if (!mediaMessage) {
            return reply("*❌ ࢪد عـلـى فـويـس بـالأمـر .ابطأ*");
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
            
            await execPromise(`ffmpeg -i "${inputFile}" -filter:a "atempo=0.7" "${outputFile}" -y`);
            
            await sock.sendMessage(message.key.remoteJid, {
                audio: { url: outputFile },
                mimetype: 'audio/mpeg',
                ptt: false   // ✅ صوت عادي مش تسجيل
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