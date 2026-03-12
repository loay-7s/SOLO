import axios from 'axios';

export default {
    name: "عملة",
    aliases: ["صرف"],
    category: "tools",

    async run({ bot, message, args, reply }) {
        const jid = message.key.remoteJid;
        const query = args.join(" ").trim();

        if (!query) {
            return reply("*⚠️ يـࢪجـى كـتـابـة الـعـمـلات الـتـي تـࢪيـد تـحـويـلـها.*\n*مثال:* `.عملة 100 امريكي الى مصري* *(يـعـمـل مـع جـمـيـع الـدول)*");
        }

        // 🌍 القاموس العملاق (55 عملة بأسماء كاملة)
        const currencyMap = {
            // عملات عربية
            "جنيه": { code: "EGP", full: "جنيه مصري" }, "مصري": { code: "EGP", full: "جنيه مصري" },
            "ريال": { code: "SAR", full: "ريال سعودي" }, "سعودي": { code: "SAR", full: "ريال سعودي" },
            "درهم": { code: "AED", full: "درهم إماراتي" }, "اماراتي": { code: "AED", full: "درهم إماراتي" },
            "دينار": { code: "KWD", full: "دينار كويتي" }, "كويتي": { code: "KWD", full: "دينار كويتي" },
            "قطري": { code: "QAR", full: "ريال قطري" }, "بحريني": { code: "BHD", full: "دينار بحريني" },
            "عماني": { code: "OMR", full: "ريال عماني" }, "اردني": { code: "JOD", full: "دينار أردني" },
            "عراقي": { code: "IQD", full: "دينار عراقي" }, "مغربي": { code: "MAD", full: "درهم مغربي" },
            "جزائري": { code: "DZD", full: "دينار جزائري" }, "تونسي": { code: "TND", full: "دينار تونسي" },
            "ليبي": { code: "LYD", full: "دينار ليبي" }, "لبناني": { code: "LBP", full: "ليرة لبنانية" },
            "سوري": { code: "SYP", full: "ليرة سورية" }, "سوداني": { code: "SDG", full: "جنيه سوداني" },
            "يمني": { code: "YER", full: "ريال يمني" }, "موريتاني": { code: "MRU", full: "أوقية موريتانية" },
            "فلسطيني": { code: "ILS", full: "شيكل" },

            // عملات عالمية
            "دولار": { code: "USD", full: "دولار أمريكي" }, "امريكي": { code: "USD", full: "دولار أمريكي" },
            "يورو": { code: "EUR", full: "يورو أوروبي" }, "اوروبي": { code: "EUR", full: "يورو أوروبي" },
            "استرليني": { code: "GBP", full: "جنيه إسترليني" }, "بريطاني": { code: "GBP", full: "جنيه إسترليني" },
            "ين": { code: "JPY", full: "ين ياباني" }, "ياباني": { code: "JPY", full: "ين ياباني" },
            "يوان": { code: "CNY", full: "يوان صيني" }, "صيني": { code: "CNY", full: "يوان صيني" },
            "كندي": { code: "CAD", full: "دولار كندي" }, "استرالي": { code: "AUD", full: "دولار أسترالي" },
            "سويسري": { code: "CHF", full: "فرنك سويسري" }, "روسي": { code: "RUB", full: "روبل روسي" },
            "تركي": { code: "TRY", full: "ليرة تركية" }, "هندي": { code: "INR", full: "روبية هندية" },
            "برازيلي": { code: "BRL", full: "ريال برازيلي" }, "جنوب_افريقي": { code: "ZAR", full: "راند جنوب أفريقي" },
            "كوري": { code: "KRW", full: "وون كوري" }, "مكسيكي": { code: "MXN", full: "بيزو مكسيكي" },
            "سنغافوري": { code: "SGD", full: "دولار سنغافوري" }, "سويدي": { code: "SEK", full: "كرونة سويدية" },
            "نرويجي": { code: "NOK", full: "كرونة نرويجية" }, "دنماركي": { code: "DKK", full: "كرونة دنماركية" },
            "نيوزيلندي": { code: "NZD", full: "دولار نيوزيلندي" }, "هونج_كونج": { code: "HKD", full: "دولار هونج كونج" },
            "ماليزي": { code: "MYR", full: "رينغيت ماليزي" }, "تايلاندي": { code: "THB", full: "بات تايلاندي" },
            "اندونيسي": { code: "IDR", full: "روبية إندونيسية" }, "فلبيني": { code: "PHP", full: "بيزو فلبيني" },
            "باكستاني": { code: "PKR", full: "روبية باكستانية" }, "فيتنامي": { code: "VND", full: "دونغ فيتنامي" },
            "نيجيري": { code: "NGN", full: "نايرا نيجيرية" }
        };

        try {
            await bot.sendMessage(jid, { react: { text: "🪙", key: message.key } });

            const amount = query.match(/\d+(\.\d+)?/)?.[0];
            const parts = query.replace(/[0-9.]/g, '').split(/\s+/);
            
            let fromData, toData;

            for (let word of parts) {
                if (currencyMap[word]) {
                    if (!fromData) fromData = currencyMap[word];
                    else if (fromData && fromData.code !== currencyMap[word].code) toData = currencyMap[word];
                }
            }

            if (!amount || !fromData || !toData) {
                return reply("*❌ لـم افـهـم الـعـمـلات الـمـطـلـوبـة بـوضـوح*");
            }

            const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromData.code}`);
            const rate = res.data.rates[toData.code];
            
            // النتيجة والأرقام إنجليزية دائمًا
            const result = (amount * rate).toLocaleString('en-US', { minimumFractionDigits: 2 });
            const formattedRate = rate.toLocaleString('en-US', { minimumFractionDigits: 4 });

            const vcard = "BEGIN:VCARD\nVERSION:3.0\nFN: 𝐒𝐎𝐋𝐎 𝐁𝐎𝐓\nORG: SOLO Team\nTEL;type=CELL;waid=6283833432570:+62 838-3343-2570\nEND:VCARD";
            const fakeQuoted = {
                key: { remoteJid: jid, fromMe: false, participant: "0@s.whatsapp.net", id: "SOLO_SYSTEM_VERIFIED" },
                message: { contactMessage: { displayName: "𝐒𝐎𝐋𝐎 𝐁𝐎𝐓", vcard } }
            };

            const exchangeText = `
┏━━┫ 𝐒𝐎𝐋𝐎 𝐄𝐗𝐂𝐇𝐀𝐍𝐆𝐄 ┣━━┓
┃
┃  💵 *الـمـبـلـغ : ${amount} ${fromData.full}*

┃  🔄 *الـتـحـويـل إلـى عـمـلـة : ${toData.full}*

┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃  💰 *الـنـتـيـجـة : ${result} ${toData.full}*
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

┃  📈 *سـعـر الـصـرف الـحـالـي :*
*┃  ❯ 1 ${fromData.full.split(' ')[0]} = ${formattedRate} ${toData.full.split(' ')[0]}*

┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`.trim();

            await bot.sendMessage(jid, { 
                text: exchangeText,
                contextInfo: {
                    externalAdReply: {
                        title: "𝐒𝐎𝐋𝐎 𝐒𝐘𝐒𝐓𝐄𝐌",
                        body: `Currency Converter: ${fromData.code} ➔ ${toData.code}`,
                        mediaType: 1,
                        thumbnailUrl: "https://telegra.ph/file/48d30d1e39b977717f917.jpg", 
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: fakeQuoted });

            await bot.sendMessage(jid, { react: { text: "✅", key: message.key } });

        } catch (error) {
            reply("*❌ حـدث خـطـأ فـي الـنـظـام أو الـعـمـلـة مـجـهـولـة.*");
        }
    }
};