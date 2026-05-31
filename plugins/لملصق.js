import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import webpmux from "node-webpmux";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

function getDynamicFPS(duration){
    if(duration <= 4) return 18;
    if(duration <= 8) return 15;
    if(duration <= 12) return 10;
    return 8;
}

async function compressSticker(tmpIn, fps, quality){
    const tmpOut = join(tmpdir(), `${Date.now()}_${Math.random()}.webp`);

    await new Promise((res,rej)=>{
        ffmpeg(tmpIn)
        .addOutputOptions([
            "-vcodec","libwebp",
            "-vf",`crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=${fps}`,
            "-preset","picture",
            "-lossless","0",
            "-q:v",`${quality}`,
            "-compression_level","6",
            "-loop","0",
            "-an",
            "-vsync","0",
            "-threads","2"
        ])
        .toFormat("webp")
        .save(tmpOut)
        .on("end",res)
        .on("error",rej);
    });

    return tmpOut;
}

async function convertToWebp(media, isVideo, duration=5){

    const tmpIn = join(tmpdir(), `${Date.now()}.${isVideo ? "mp4" : "jpg"}`);
    await fs.writeFile(tmpIn, media);

    const fpsBase = getDynamicFPS(duration);

    let fps = fpsBase;
    let quality = 70;

    let tmpOut = await compressSticker(tmpIn,fps,quality);

    let buffer = await fs.readFile(tmpOut);

    while(buffer.length > 950000){

        await fs.unlink(tmpOut).catch(()=>{});

        fps = Math.max(6, fps-2);
        quality = Math.max(25, quality-10);

        tmpOut = await compressSticker(tmpIn,fps,quality);
        buffer = await fs.readFile(tmpOut);
    }

    await fs.unlink(tmpIn).catch(()=>{});
    await fs.unlink(tmpOut).catch(()=>{});

    return buffer;
}

export default {
    name: "لملصق",
    aliases: ["استيكر","sticker","s"],
    category: "tools",

    async run({ bot, message }) {

        const jid = message.key.remoteJid;

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const videoMsg = message.message?.videoMessage || quoted?.videoMessage;
        const imageMsg = message.message?.imageMessage || quoted?.imageMessage;
        const gifMsg = message.message?.gifMessage || quoted?.gifMessage;

        const mime = imageMsg || videoMsg || gifMsg;

        if (!mime) {
            return await bot.sendMessage(jid,{ text:"⚠️ *قـم بـالـرد عـلى صـورة أو فـيـديـو لـتـحـويـلـه لـمـلـصـق!*" });
        }

        const isVideo = !!videoMsg || !!gifMsg;

        if (videoMsg) {

            const duration = videoMsg.seconds;
            const size = videoMsg.fileLength;

            if (duration > 15) {
                return await bot.sendMessage(jid,{
                    text:"*❌ الـمـدة تـتـجـاوز الـحـد الأقـصـى لـلـمـلـصـقـات الـمـتـحـركـة(أكـثـࢪ مـن 15 ثـانـيـة)(كـلـمـا قـلّـت الـمـدة، زادت الـسـلاسـة).*"
                });
            }

            if (size > 2.0 * 1024 * 1024) {
                return await bot.sendMessage(jid,{
                    text:"*❌ حـجـم الـفـيـديـو الأصـلـي كـبـيـر (اكـبـر مـن 2MB).*"
                });
            }
        }

        await bot.sendMessage(jid,{ react:{ text:"🍷", key:message.key } });

        try {

            const stream = await downloadContentFromMessage(mime,isVideo ? "video":"image");

            let buffer = Buffer.from([]);

            for await(const chunk of stream){
                buffer = Buffer.concat([buffer,chunk]);
            }

            const duration = videoMsg?.seconds || 5;

            const webpBuffer = await convertToWebp(buffer,isVideo,duration);

            const img = new webpmux.Image();
            await img.load(webpBuffer);

            const exifData = {
                "sticker-pack-id":"solo-leveling-v2",
                "sticker-pack-name":"",
                "sticker-pack-publisher":`╔══════════════════╗
║ 𓆩🍷𓆪『𝑺𝑶𝑳𝑶★𝑩𝑶𝑻』𓆩🍷𓆪  ║
╠══════════════════╣
║ 𝑩𝑶𝑹𝑵 𝑭𝑹𝑶𝑴 𝑪𝑶𝑫𝑬 ║
║ 𝑩𝑼𝑰𝑳𝑻 𝑭𝑶𝑹 𝑳𝑬𝑮𝑬𝑵𝑫𝑺 ║
╠══════════════════╣
   ⚝ 𝑼𝑵𝑲𝑵𝑶𝑾𝑵 ⚝   ║
╚══════════════════╝`
            };

            const exif = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00]);

            const jsonBuffer = Buffer.from(JSON.stringify(exifData),"utf-8");

            const exiffinal = Buffer.concat([exif,jsonBuffer]);

            exiffinal.writeUIntLE(jsonBuffer.length,14,4);

            img.exif = exiffinal;

            const finalSticker = await img.save(null);

            await bot.sendMessage(jid,{
                sticker: finalSticker,
                contextInfo:{
                    externalAdReply:{
                        title:"⌬〔 𝑺𝑶𝑳𝑶-𝑩𝑶𝑻 〕⌬",
                        body:"𝑺𝑼𝑵𝑮 𝑷𝑶𝑾𝑬𝑹𝑬𝑫🍷",
                        mediaType:1,
                        thumbnailUrl:"https://telegra.ph/file/48d30d1e39b977717f917.jpg",
                        sourceUrl:"https://github.com/",
                        renderLargerThumbnail:false
                    }
                }
            },{ quoted:message });

            await bot.sendMessage(jid,{ react:{ text:"✅", key:message.key } });

        } catch(error){

            console.error(error);

            await bot.sendMessage(jid,{
                text:"❌ *حـدث خـطأ فـي نـظـام الـمـعـالـجـة!*"
            });

        }

    }
};