import axios from 'axios';

export default {
    name: "ويكيبيديا",
    aliases: ["ويكي", "wiki"],
    category: "tools",

    async run({ bot, message, args, reply }) {
        const jid = message.key.remoteJid;
        const query = args.join(" ").trim();

        if (!query) {
            return reply("*⚠️ يـࢪجـى تـحـديـد مـوضـوع الـبـحـث..مـثـال[.ويكي ميسي]*");
        }

        try {
            await bot.sendMessage(jid, { react: { text: "🌐", key: message.key } });

            const searchUrl = `https://ar.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&explaintext=1&titles=${encodeURIComponent(query)}&redirects=1&pithumbsize=1000`;
            
            const res = await axios.get(searchUrl, {
                headers: { 'User-Agent': 'SOLO_BOT_OFFICIAL' }
            });

            const pages = res.data.query.pages;
            const pageId = Object.keys(pages)[0];
            
            if (pageId === "-1") {
                return reply("*❌ لـم أجـد هـذا الـمـوضـو؏.[تـأكـد مـن كـتـابـة مـوضـوعـك بـشـكـل صـحـيـح]*");
            }

            let content = pages[pageId].extract;
            const title = pages[pageId].title;
            const thumbnail = pages[pageId].thumbnail ? pages[pageId].thumbnail.source : "https://telegra.ph/file/48d30d1e39b977717f917.jpg";

            // تنظيف المقال من المراجع والمصادر لضمان الجودة
            if (content.includes("المراجع")) content = content.split("المراجع")[0];
            if (content.includes("المصادر")) content = content.split("المصادر")[0];

            const vcard = "BEGIN:VCARD\nVERSION:3.0\nFN: 𝐒𝐎𝐋𝐎 𝐁𝐎𝐓\nORG: SOLO Team\nTEL;type=CELL;waid=6283833432570:+62 838-3343-2570\nEND:VCARD";
            const fakeQuoted = {
                key: { remoteJid: jid, fromMe: false, participant: "0@s.whatsapp.net", id: "SOLO_SYSTEM_VERIFIED" },
                message: { contactMessage: { displayName: "𝐒𝐎𝐋𝐎 𝐁𝐎𝐓", vcard } }
            };

            const header = `┏━┫ 𝐒𝐎𝐋𝐎 𝐖𝐈𝐊𝐈𝐏𝐄𝐃𝐈𝐀 ┣━┓\n┃\n┃  🔍 *الـبـحـث عـن :* *${title}*\n┃  🌐 *الـمـصـدر :* *ويـكـيـبـيـديـا*\n┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n\n`.trim();

            // 🔥 تقسيم المقال رياضياً إلى 3 أجزاء متساوية تماماً
            const partSize = Math.ceil(content.length / 3);
            const chunks = [
                content.substring(0, partSize),
                content.substring(partSize, partSize * 2),
                content.substring(partSize * 2)
            ];

            // 1. إرسال الجزء الأول بالصورة والهيدر
            await bot.sendMessage(jid, { 
                text: header + "\n\n" + chunks[0] + "\n\n*(1/3) يتبع...*",
                contextInfo: {
                    externalAdReply: {
                        title: `𝐒𝐎𝐋𝐎 𝐒𝐘𝐒𝐓𝐄𝐌`,
                        body: `WIKIPEDIA: PART 1`,
                        mediaType: 1,
                        thumbnailUrl: thumbnail,
                        sourceUrl: `https://ar.wikipedia.org/wiki/${encodeURIComponent(title)}`,
                        renderLargerThumbnail: true,
                        showAdAttribution: false
                    }
                }
            }, { quoted: fakeQuoted });

            // 2. إرسال الجزء الثاني
            await new Promise(resolve => setTimeout(resolve, 1500));
            await bot.sendMessage(jid, { 
                text: `*تـابـع الـمـقـال (2/3) :*\n\n` + chunks[1] 
            }, { quoted: fakeQuoted });

            // 3. إرسال الجزء الثالث والأخير مع الفوتر
            const footer = `\n\n┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n┃  🔗 *الرابط :* https://ar.wikipedia.org/wiki/${encodeURIComponent(title)}\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
            await new Promise(resolve => setTimeout(resolve, 1500));
            await bot.sendMessage(jid, { 
                text: `*الـجـزء الأخـيـر (3/3) :*\n\n` + chunks[2] + footer
            }, { quoted: fakeQuoted });

            await bot.sendMessage(jid, { react: { text: "✅", key: message.key } });

        } catch (error) {
            reply("*❌ حدث خطأ في تقسيم المقال.*");
        }
    }
};