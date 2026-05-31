import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs-extra';
import path from 'path';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
    name: "كيو_ار",
    aliases: ["qr", "باركود", "فك_كيو_ار", "قراءة_كيو_ار"],
    description: "تحويل نص/رابط إلى QR Code أو قراءة QR Code من صورة",
    category: "tools",
    developer: false,
    group: false,
    private: false,

    async run({ bot, message, args, reply, react }) {
        const jid = message.key.remoteJid;
        
        let text = args.join(" ");
        let hasImage = false;
        let mediaMessage = null;
        
        if (message.message?.imageMessage) {
            hasImage = true;
            mediaMessage = message.message.imageMessage;
        }
        
        if (!hasImage && message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
            hasImage = true;
            mediaMessage = message.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
        }
        
        if (!text && !hasImage && message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
            text = quotedMsg.conversation || 
                   quotedMsg.extendedTextMessage?.text || 
                   quotedMsg.imageMessage?.caption ||
                   quotedMsg.videoMessage?.caption;
        }
        
        // قراءة QR Code من صورة
        if (hasImage) {
            await react("🔍");
            
            const tempPath = path.join(process.cwd(), 'temp');
            fs.ensureDirSync(tempPath);
            const inputFile = path.join(tempPath, `qr_read_${Date.now()}.jpg`);
            
            try {
                const stream = await downloadContentFromMessage(mediaMessage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                await fs.writeFile(inputFile, buffer);
                
                const formData = new FormData();
                formData.append('file', fs.createReadStream(inputFile));
                
                const response = await axios.post('https://api.qrserver.com/v1/read-qr-code/', formData, {
                    headers: { ...formData.getHeaders() },
                    timeout: 15000
                });
                
                const result = response.data[0]?.symbol[0]?.data;
                
                if (result && result !== 'null') {
                    let type = "نص";
                    if (result.startsWith('http://') || result.startsWith('https://')) {
                        type = "رابط";
                    }
                    await reply(`*╭─━━━━━━━━━━━━━━━─╮*
*│ 🔓 قـراءة QR Code 🔓*
*╰─━━━━━━━━━━━━━━━─╯*

*📝 الـنـوع:* ${type}
*🔗 الـمـحـتـوى:*
\`${result}\`

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*𝑺𝑶𝑳𝑶 𝑩𝑶𝑻*~`);
                    await react("✅");
                } else {
                    await reply("*❌ لم يتم العثور على بيانات في QR Code*");
                    await react("❌");
                }
                
                await fs.unlink(inputFile).catch(() => {});
                
            } catch (error) {
                console.error("QR Read Error:", error);
                await react("❌");
                await reply("*❌ فـشـل قـراءة QR Code. تأكد من جودة الصورة*");
            }
            return;
        }
        
        // إنشاء QR Code
        if (!text) {
            await react("📱");
            return reply(`*╭─━━━━━━━━━━━━━━━─╮*
*│ 📱 تـحـويـل QR Code 📱*
*╰─━━━━━━━━━━━━━━━─╯*

*📝 طـرق الاسـتـخـدام:*

*1️⃣ إنشاء QR Code:*
│ *.كيو_ار نص أو رابط*
│ أو رد على رسالة واكتب *.كيو_ار*

*2️⃣ قراءة QR Code:*
│ رد على صورة فيها QR Code واكتب *.كيو_ار*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*💡 أمثلة:*
│ *.كيو_ار مرحبا*

│ *.كيو_ار https://vt.tiktok.com/ZSxRKdBQx/*

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*𝑺𝑶𝑳𝑶 𝑩𝑶𝑻*~`);
        }

        if (text.length > 2000) {
            return reply("*❌ الـنـص طـويـل جـداً (الحد الأقصى 2000 حرف)*");
        }

        await react("🖨");

        const tempPath = path.join(process.cwd(), 'temp');
        fs.ensureDirSync(tempPath);
        const qrFile = path.join(tempPath, `qr_${Date.now()}.png`);

        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
            
            const response = await axios({
                method: 'get',
                url: qrUrl,
                responseType: 'arraybuffer'
            });

            await fs.writeFile(qrFile, Buffer.from(response.data));

            let type = "نص";
            if (text.startsWith('http://') || text.startsWith('https://')) {
                type = "رابط";
            }

            await bot.sock.sendMessage(jid, {
                image: { url: qrFile },
                caption: `*╭─━━━━━━━━━━━━━━━─╮*
*│ 📱 QR Code 📱*
*╰─━━━━━━━━━━━━━━━─╯*

*📝 الـنـوع:* ${type}

*📄 الـمـحـتـوى:*
\`${text.length > 500 ? text.substring(0, 500) + '...' : text}\`

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*𝑺𝑶𝑳𝑶 𝑩𝑶𝑻*~`
            }, { quoted: message });

            setTimeout(() => {
                fs.unlink(qrFile).catch(() => {});
            }, 5000);

            await react("✅");

        } catch (error) {
            console.error("QR Error:", error);
            await react("❌");
            await reply("*❌ فـشـل إنـشـاء QR Code. حاول مرة أخرى.*");
        }
    }
};