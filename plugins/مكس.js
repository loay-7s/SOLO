import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import webpmux from 'node-webpmux';

const execPromise = promisify(exec);

export default {
    name: "مكس",
    aliases: ["دمج_ايموجي", "emojimix"],
    description: "دمج ايموجيين مع بعض لتكوين ملصق",
    category: "tools",
    developer: false,
    group: false,
    private: false,

    async run({ message, sock, reply, react, args }) {
        let emojis = args.join(" ");
        
        if (!emojis || !emojis.includes('+')) {
            await react("🎴");
            return reply(`*╭─━━━━━━━━━━━━━━━━━─╮*
*│ 🎴  دمـج الإيـمـوجـي  🎴*
*╰─━━━━━━━━━━━━━━━━━─╯*

*📝 اكتب ايموجيين بينهم علامة +*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
📌 *مثال:*

*.مكس 😎+🥰*

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
        }
        
        let [emoji1, emoji2] = emojis.split('+').map(e => e.trim());
        
        if (!emoji1 || !emoji2) {
            await react("❌");
            return reply(`*❌ ايموجي غير صالح*\n📌 مثال: .مكس 😎+🥰`);
        }
        
        await react("⏳");
        
        const tempPath = path.join(process.cwd(), 'temp');
        fs.ensureDirSync(tempPath);
        
        const inputFile = path.join(tempPath, `input_${Date.now()}.png`);
        const outputFile = path.join(tempPath, `output_${Date.now()}.webp`);
        
        try {
            const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;
            
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });
            
            if (!response.data?.results?.length) {
                throw new Error('No results found');
            }
            
            const imageUrl = response.data.results[0].url;
            
            const imgResponse = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 15000
            });
            
            await fs.writeFile(inputFile, Buffer.from(imgResponse.data));
            
            await execPromise(`ffmpeg -i "${inputFile}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" "${outputFile}" -y`);
            
            // ✅ إضافة حقوق البوت
            const stickerBuffer = await fs.readFile(outputFile);
            const img = new webpmux.Image();
            await img.load(stickerBuffer);
            
            const exifData = {
                "sticker-pack-id": `solo-${Date.now()}`,
                "sticker-pack-publisher": `╔══════════════════╗
║ 𓆩🍷𓆪『𝑺𝑶𝑳𝑶★𝑩𝑶𝑻』𓆩🍷𓆪  ║
╠══════════════════╣
║ 𝑩𝑶𝑹𝑵 𝑭𝑹𝑶𝑴 𝑪𝑶𝑫𝑬 ║
║ 𝑩𝑼𝑰𝑳𝑻 𝑭𝑶𝑹 𝑳𝑬𝑮𝑬𝑵𝑫𝑺 ║
╠══════════════════╣
   ⚝ 𝑼𝑵𝑲𝑵𝑶𝑾𝑵 ⚝   ║
╚══════════════════╝`,
                "emojis": []
            };
            
            const exifHeader = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuffer = Buffer.from(JSON.stringify(exifData), "utf-8");
            const exifFinal = Buffer.concat([exifHeader, jsonBuffer]);
            exifFinal.writeUIntLE(jsonBuffer.length, 14, 4);
            
            img.exif = exifFinal;
            const finalSticker = await img.save(null);
            
            await react("✅");
            
            await sock.sendMessage(message.key.remoteJid, {
                sticker: finalSticker
            }, { quoted: message });
            
            await fs.unlink(inputFile).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
            
        } catch (error) {
            console.error("Emojimix Error:", error);
            await react("❌");
            await reply(`*❌ فشل دمج الايموجي*\n📌 تأكد من أن الايموجي صالحة للدمج\n📌 مثال: .مكس 😎+🥰`);
            
            await fs.unlink(inputFile).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
        }
    }
};