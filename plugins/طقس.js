import axios from 'axios';

export default {
    name: "طقس",
    aliases: ["weather", "الجو"],
    category: "tools",

    async run({ bot, message, args, reply }) {
        const jid = message.key.remoteJid;
        const city = args.join(" ");

        if (!city) {
            return reply("*⚠️ يرجى كتابة اسم المدينة [.طقس القاهرة]!*");
        }

        try {
            // 🔥 تفاعل الغيوم كما طلبت
            await bot.sendMessage(jid, { react: { text: "☁️", key: message.key } });

            // 1. البحث عن إحداثيات المدينة
            const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ar&format=json`);
            
            if (!geoRes.data.results) {
                return reply("*❌ لم أجد بيانات لهذه المدينة!*");
            }
            
            const { latitude, longitude, name, country, timezone } = geoRes.data.results[0];

            // 2. جلب تفاصيل طقس عميقة (رطوبة، سحب، ضغط، إلخ)
            const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m&timezone=auto`);
            const current = weatherRes.data.current;

            // 🛠️ تجهيز "التوثيق الملكي" (vCard)
            const vcard = "BEGIN:VCARD\nVERSION:3.0\nFN: 𝐒𝐎𝐋𝐎 𝐁𝐎𝐓\nORG: SOLO Team\nTEL;type=CELL;waid=6283833432570:+62 838-3343-2570\nEND:VCARD";
            const fakeQuoted = {
                key: { remoteJid: jid, fromMe: false, participant: "0@s.whatsapp.net", id: "SOLO_SYSTEM_VERIFIED" },
                message: { contactMessage: { displayName: "𝐒𝐎𝐋𝐎 𝐁𝐎𝐓", vcard } }
            };

            // 📜 التنسيق الملكي الجديد بالتفاصيل الكثيرة
            const weatherText = `
┏━━━━┫ 𝐒𝐎𝐋𝐎 𝐖𝐄𝐀𝐓𝐇𝐄𝐑 ┣━━━━┓
┃
┃  📍 *الـمـديـنـة:* ${name} - ${country}

┃  🌡️ *الـحـرارة:* ${Math.round(current.temperature_2m)}°C

┃  🌡️ *الـحـرارة الـمـحـسـوسـة:* ${Math.round(current.apparent_temperature)}°C

┃  💧 *الـرطـوبـة:* ${current.relative_humidity_2m}%

┃  ☁️ *غـطـاء الـسـحـب:* ${current.cloud_cover}%

┃  🌬️ *سـرعـة الـريـاح:* ${current.wind_speed_10m} km/h

┃  🌀 *الـضـغـط الـجـوي:* ${Math.round(current.surface_pressure)} hPa

┃  🌧️ *الـهـطـول:* ${current.precipitation} mm

┃  🌍 *الـتـوقـيـت:* ${current.time.split('T')[1]}

┃  🕒 *الـمـنـطـقـة:* ${timezone}
┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`.trim();

            // 🚀 الإرسال بالتوثيق الرسمي
            await bot.sendMessage(jid, { 
                text: weatherText,
                contextInfo: {
                    externalAdReply: {
                        title: "𝐒𝐎𝐋𝐎 𝐒𝐘𝐒𝐓𝐄𝐌",
                        body: `ᴡᴇᴀᴛʜᴇʀ oғ: ${name} ❄️`,
                        mediaType: 1,
                        thumbnailUrl: "https://telegra.ph/file/48d30d1e39b977717f917.jpg", 
                        sourceUrl: "https://whatsapp.com/biz/", 
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: fakeQuoted });

            await bot.sendMessage(jid, { react: { text: "✅", key: message.key } });

        } catch (error) {
            console.error(error);
            reply("*❌ حدث خطأ أثناء جلب البيانات!*");
        }
    }
};