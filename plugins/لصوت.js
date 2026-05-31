import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export default {
    name: "لصوت",
    description: "تحويل الفيديو إلى MP3 بحجم صغير وجودة مضبوطة",
    category: "tools",
    
    async run({ sock, message, reply }) {
        try {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const videoMessage = quoted?.videoMessage || quoted?.viewOnceMessageV2?.message?.videoMessage;

            if (!videoMessage) {
                return reply("*🕷️ ࢪد عـلـى الـفـيـديـو الـذي تـࢪيـد تـحـويـلـه لـصـوتـيـة بـألأمـࢪ.*");
            }

            // نظام التوثيق
            const vcard = "BEGIN:VCARD\nVERSION:3.0\nFN: SOLO Bot\nORG: SOLO Team\nTEL;type=CELL;waid=6283833432570:+62 838-3343-2570\nEND:VCARD";
            const fakeQuoted = {
                key: {
                    remoteJid: message.key.remoteJid,
                    fromMe: false,
                    participant: "0@s.whatsapp.net",
                    id: "OFFICIAL_SOLO_AUDIO"
                },
                message: {
                    contactMessage: {
                        displayName: "𝑺𝑶𝑳𝑶 𝑩𝑶𝑻 ⚡",
                        vcard
                    }
                }
            };

            await sock.sendMessage(message.key.remoteJid, { react: { text: "📥", key: message.key } });

            // تحميل الفيديو
            const stream = await downloadContentFromMessage(videoMessage, 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const tempVideoPath = join(tmpdir(), `solo_${Date.now()}.mp4`);
            const tempAudioPath = join(tmpdir(), `solo_${Date.now()}.mp3`);

            await writeFile(tempVideoPath, buffer);

            // ✅ تحويل بجودة منخفضة لتقليل الحجم
            // -ar 22050 = تردد 22 كيلوهرتز (نصف الجودة الأصلية)
            // -ac 1 = صوت أحادي (مونو) بدل استريو
            // -b:a 64k = معدل بت 64 كيلوبت في الثانية (جودة مقبولة وحجم صغير)
            exec(`ffmpeg -i "${tempVideoPath}" -vn -ar 22050 -ac 1 -b:a 64k "${tempAudioPath}"`, async (error) => {
                await unlink(tempVideoPath).catch(() => {});

                if (error) {
                    console.error("FFMPEG Error:", error);
                    return reply("❌ *تأكد من تثبيت ffmpeg على السيرفر*");
                }

                // جلب حجم الملف
                const stats = await import('fs').then(fs => fs.promises.stat(tempAudioPath).catch(() => null));
                const fileSizeMB = stats ? (stats.size / (1024 * 1024)).toFixed(2) : "0";
                
                await sock.sendMessage(message.key.remoteJid, {
                    audio: { url: tempAudioPath },
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    fileName: `𝐒𝐎𝐋𝐎_𝐀𝐔𝐃𝐈𝐎.mp3`,
                    contextInfo: {
                        externalAdReply: {
                            title: "𝐒𝐎𝐋𝐎 𝐒𝐘𝐒𝐓𝐄𝐌",
                            body: `𝑪𝒐𝒏𝒗𝒆𝒓𝒕𝒆𝒅 𝑻𝒐 𝑨𝒖𝒅𝒊𝒐 📤`,
                            mediaType: 1,
                            renderLargerThumbnail: false,
                            showAdAttribution: false
                        }
                    }
                }, { quoted: fakeQuoted });

                await unlink(tempAudioPath).catch(() => {});
                await sock.sendMessage(message.key.remoteJid, { react: { text: "✅", key: message.key } });
            });

        } catch (e) {
            console.error(e);
            reply("❌ *فشل التحويل، تأكد من جودة الفيديو*");
        }
    }
};