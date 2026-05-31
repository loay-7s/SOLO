import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import webpmux from 'node-webpmux';

const execPromise = promisify(exec);

export default {
    name: "متحركة",
    aliases: ["متحركه"],
    description: "جلب ملصقات متحركة من Tenor مع حقوق البوت",
    category: "tools",
    developer: false,
    group: false,
    private: false,

    async run({ message, sock, reply, react, args }) {
        let query = args.join(" ");
        
        if (!query) {
            await react("🎬");
            return reply(`*╭─━━━━━━━━━━━━━━━─╮*
*│ 🎬 مـلـصـقـات مـتـحـركـة 🎬*
*╰─━━━━━━━━━━━━━━━─╯*

*📝 اكتب اسم الأنمي أو الشخصية*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
📌 *مثال:*
.متحركة ناروتو
.متحركة جوكو 5

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
        }
        
        let parts = query.split(' ');
        let count = 1;
        let last = parts[parts.length - 1];
        
        if (!isNaN(last)) {
            count = parseInt(last);
            if (count > 10) count = 10;
            if (count < 1) count = 1;
            parts.pop();
        }
        
        let searchQuery = parts.join(' ').trim();
        
        await react("🔍");
        await reply(`*🔍 جـاري الـبـحـث عـن:* ${searchQuery}`);
        
        const tempPath = path.join(process.cwd(), 'temp');
        fs.ensureDirSync(tempPath);
        
        try {
            const response = await axios.get(
                `https://g.tenor.com/v1/search?q=${encodeURIComponent(searchQuery + ' anime')}&key=LIVDSRZULELA&limit=${count}`
            );
            
            const results = response.data.results;
            
            if (!results || results.length === 0) {
                await react("❌");
                return reply(`*❌ لا توجد نتائج للبحث:* ${searchQuery}`);
            }
            
            await react("🎨");
            
            let sentCount = 0;
            
            for (const item of results) {
                try {
                    const gifUrl = item?.media?.[0]?.gif?.url;
                    if (!gifUrl) continue;
                    
                    const inputFile = path.join(tempPath, `input_${Date.now()}_${sentCount}.gif`);
                    const outputFile = path.join(tempPath, `output_${Date.now()}_${sentCount}.webp`);
                    
                    const gifResponse = await axios({
                        url: gifUrl,
                        method: 'GET',
                        responseType: 'arraybuffer',
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    });
                    
                    await fs.writeFile(inputFile, Buffer.from(gifResponse.data));
                    
                    // تحويل GIF إلى WebP
                    await execPromise(`ffmpeg -y -i "${inputFile}" -vf "fps=8,scale=512:512:force_original_aspect_ratio=increase,crop=512:512" -loop 0 -an -threads 2 "${outputFile}"`);
                    
                    // ✅ إضافة حقوق البوت (نفس طريقة أمر حقوق)
                    const stickerBuffer = await fs.readFile(outputFile);
                    const img = new webpmux.Image();
                    await img.load(stickerBuffer);
                    
// 🔥 حقوق البوت الأسطورية - تصميم استمارة فخم
const exifData = {
    "sticker-pack-id": `solo-${Date.now()}`,
    "sticker-pack-publisher": `╔══════════════════╗
║ 𓆩🍷𓆪『𝑺𝑶𝑳𝑶★𝑩𝑶𝑻』𓆩🍷𓆪  ║
╠══════════════════╣
║ 𝑩𝑶𝑹𝑵 𝑭𝑹𝑶𝑴 𝑪𝑶𝑫𝑬 ║
║ 𝑩𝑼𝑰𝑳𝑻 𝑭𝑶𝑹 𝑳𝑬𝑮𝑬𝑵𝑫𝑺 ║
╠════════════════════╣
║   ⚝ 𝑼𝑵𝑲𝑵𝑶𝑾𝑵 ⚝  ║
╚════════════════════╝`,
    "emojis": []
};
                    
                    const exifHeader = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
                    const jsonBuffer = Buffer.from(JSON.stringify(exifData), "utf-8");
                    const exifFinal = Buffer.concat([exifHeader, jsonBuffer]);
                    exifFinal.writeUIntLE(jsonBuffer.length, 14, 4);
                    
                    img.exif = exifFinal;
                    const finalSticker = await img.save(null);
                    
                    await sock.sendMessage(message.key.remoteJid, {
                        sticker: finalSticker
                    }, { quoted: message });
                    
                    sentCount++;
                    
                    await fs.unlink(inputFile).catch(() => {});
                    await fs.unlink(outputFile).catch(() => {});
                    
                } catch (err) {
                    console.error("Sticker conversion error:", err);
                }
            }
            
            await react("✅");
            
            if (sentCount > 0) {
                await reply(`*✅ تـم إرسـال ${sentCount} مـلـصـق مـتـحـرك*`);
            } else {
                await reply(`*❌ فـشـل تـحـويـل الـمـلـصـقـات*`);
            }
            
        } catch (error) {
            console.error("Tenor API Error:", error);
            await react("❌");
            await reply(`*❌ فـشـل الـبـحـث، حـاول مـرة أخـرى*`);
        }
    }
};