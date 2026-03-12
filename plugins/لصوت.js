import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export default {
    name: "لصوت",
    description: "تحويل الفيديو إلى MP3 بستايل موثق",
    category: "tools",
    
    async run({ sock, message, reply }) {
        try {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const videoMessage = quoted?.videoMessage || quoted?.viewOnceMessageV2?.message?.videoMessage;

            if (!videoMessage) {
                return reply("🕷️ *رد على الفيديو الذي تريد تحويله لصوت*");
            }

            // --- نظام التوثيق الخارق (من كود تست) ---
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
                        displayName: "𝐒𝐎𝐋𝐎 𝐒𝐘𝐒𝐓𝐄𝐌 ✅",
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

            // عملية التحويل باستخدام FFMPEG
            exec(`ffmpeg -i "${tempVideoPath}" -vn -ar 44100 -ac 2 -b:a 192k "${tempAudioPath}"`, async (error) => {
                await unlink(tempVideoPath).catch(() => {});

                if (error) {
                    console.error("FFMPEG Error:", error);
                    return reply("❌ *تأكد من تثبيت ffmpeg على السيرفر*");
                }

                // إرسال الصوت بالتوثيق والخط الفخم
                await sock.sendMessage(message.key.remoteJid, {
                    audio: { url: tempAudioPath },
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    fileName: `𝐒𝐎𝐋𝐎_𝐌𝐔𝐒𝐈𝐂.mp3`,
                    contextInfo: {
                        externalAdReply: {
                            title: "𝐒𝐎𝐋𝐎 𝐒𝐘𝐒𝐓𝐄𝐌 ✅",
                            body: "تـم تـحـويـل الـفـيـديـو بـنـجـاح 🕷️",
                            mediaType: 1,
                            renderLargerThumbnail: false,
                            showAdAttribution: false
                        }
                    }
                }, { quoted: fakeQuoted });

                await unlink(tempAudioPath).catch(() => {});
            });

        } catch (e) {
            console.error(e);
            reply("❌ *فشل التحويل، تأكد من جودة الفيديو*");
        }
    }
};