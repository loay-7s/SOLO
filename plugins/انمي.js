import axios from 'axios';
import translate from 'translate';

translate.engine = 'google';
translate.from = 'en';
translate.to = 'ar';

export default {
    name: "انمي",
    aliases: ["شرح_انمي"],
    description: "شرح قصة أنمي بالعربية مع البوستر واقتراحات مشابهة",
    category: "انمي",
    group: true,

    async run({ bot, message, args, reply, react, userJid, sock }) {
        const chatId = message.key.remoteJid;

        if (!chatId.endsWith('@g.us')) {
            return reply("*❌ هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        let animeName = args.join(' ');

        if (!animeName) {
            const helpMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*📖 شـرح الأنـمـي*

*───━━━⊱  📋  ⊰━━━───*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📝 طـريـقـة الاسـتـخـدام:*

*.انمي* *[اسم الأنمي]*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📌 أمـثـلـة:*

*.انمي هجوم العمالقة*
*.انمي سولو ليفلنج*
*.انمي ون بيس*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            return reply(helpMsg);
        }

        await react("📖");

        let englishName = animeName;
        try {
            const translation = await translate(animeName, { from: 'ar', to: 'en' });
            if (translation && translation !== animeName) {
                englishName = translation;
            }
        } catch (e) {}

        const startMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*📖 جـاري الـبـحـث*
*───━━━⊱  🔍  ⊰━━━───*

*🎬 الاسـم:* ⦓ *${animeName}* ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*⏳ جـاري الـبـحـث فـي قـاعـدة بـيـانـات الأنـمـي...*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*`;

        await reply(startMsg);

        try {
            const searchUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(englishName)}&limit=1`;
            const searchRes = await axios.get(searchUrl);
            
            if (!searchRes.data.data || searchRes.data.data.length === 0) {
                return reply(`*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*❌ لـم يـتـم الـعـثـور عـلـى الأنـمـي*

*───━━━⊱  ❌  ⊰━━━───*

*🎬 الاسـم:* ⦓ *${animeName}* ⦔

*💡 نصـيـحـة: حـاول كـتـابـة الاسـم بـالإنجـلـيـزيـة*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*`);
            }

            const anime = searchRes.data.data[0];
            
            let arabicSynopsis = '*جـاري الـتـرجـمـة...*';
            if (anime.synopsis) {
                try {
                    arabicSynopsis = await translate(anime.synopsis);
                    arabicSynopsis = arabicSynopsis.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
                    // اختصار القصة لو طويلة جداً
                    if (arabicSynopsis.length > 2000) {
                        arabicSynopsis = arabicSynopsis.substring(0, 2000) + '...';
                    }
                } catch(e) {
                    arabicSynopsis = anime.synopsis + '\n\n*(غـيـر مـتـرجـم)*';
                }
            } else {
                arabicSynopsis = '*لا يـوجـد وصـف مـتـوفـر*';
            }

            let suggestionsText = '';
            try {
                const recommendationsUrl = `https://api.jikan.moe/v4/anime/${anime.mal_id}/recommendations`;
                const recRes = await axios.get(recommendationsUrl);
                const suggestions = recRes.data.data?.slice(0, 3) || [];
                
                if (suggestions.length > 0) {
                    suggestionsText = suggestions.map((rec, i) => {
                        return `*┃ ${i+1}.* ⦓ *${rec.entry.title}* ⦔`;
                    }).join('\n\n');
                } else {
                    const genreIds = anime.genres.map(g => g.mal_id).join(',');
                    if (genreIds) {
                        const similarUrl = `https://api.jikan.moe/v4/anime?genres=${genreIds}&limit=3`;
                        const similarRes = await axios.get(similarUrl);
                        if (similarRes.data.data) {
                            suggestionsText = similarRes.data.data.slice(0, 3).map((a, i) => {
                                return `*┃ ${i+1}.* ⦓ *${a.title}* ⦔`;
                            }).join('\n\n');
                        }
                    }
                }
            } catch (e) {
                suggestionsText = '*┃ لا تـوجـد اقـتـراحـات مـتـوفـرة*';
            }

            if (!suggestionsText) {
                suggestionsText = '*┃ لا تـوجـد اقـتـراحـات مـتـوفـرة*';
            }

            let genresText = '';
            if (anime.genres && anime.genres.length > 0) {
                genresText = anime.genres.map(g => `*${g.name}*`).join(' • ');
            } else {
                genresText = '*غـيـر مـعـروف*';
            }

            let statusText = '';
            if (anime.status === 'Finished Airing') statusText = 'انـتـهـى عـرضـه ✅';
            else if (anime.status === 'Currently Airing') statusText = 'يـعـرض الآن 🔥';
            else if (anime.status === 'Not yet aired') statusText = 'لـم يـعـرض بـعـد ⏳';
            else statusText = anime.status || 'غـيـر مـعـروف';

            // ✅ تجهيز رابط البوستر (جودة عالية)
            let posterUrl = anime.images?.jpg?.large_image_url || 
                           anime.images?.jpg?.image_url ||
                           'https://i.imgur.com/3XrQm7N.png';
            
            // ✅ النص اللي هيتكتب تحت البوستر (الكابتشن)
            const caption = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*📖 شـرح الأنـمـي*

*───━━━⊱  🎬  ⊰━━━───*

*🎬 الاسـم:* ⦓ *${anime.title}* ⦔

*🔖 الاسـم الأصـلـي:* ⦓ *${anime.title_japanese || anime.title}* ⦔

*📅 السـنـة:* ⦓ *${anime.year || 'غـيـر مـعـروف'}* ⦔

*⭐ الـتـقـيـيـم:* ⦓ *${anime.score || 'غـيـر مـتـوفـر'}* ⦔ / 10

*🎭 الـحـلـقـات:* ⦓ *${anime.episodes || 'غـيـر مـعـروف'}* ⦔

*📊 الـحـالـة:* ⦓ *${statusText}* ⦔

*🏷 الـتـصـنـيـف:* ${genresText}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📝 الـقـصـة:* 

${arabicSynopsis}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*🔥 أنـمـيـات مـشـابـهـة:* 

${suggestionsText}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*🔗 رابط MyAnimeList:* 
https://myanimelist.net/anime/${anime.mal_id}

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            // ==================== 🎨 إرسال البوستر مع الشرح (بدون إعادة توجيه) ====================
            try {
                // ✅ تحميل الصورة أولاً عشان نتأكد إنها شغالة
                const imageResponse = await axios.get(posterUrl, { responseType: 'arraybuffer', timeout: 10000 });
                const imageBuffer = Buffer.from(imageResponse.data);
                
                // ✅ إرسال الصورة مع الكابتشن (بدون contextInfo الخاص بإعادة التوجيه)
                await sock.sendMessage(chatId, {
                    image: imageBuffer,
                    caption: caption,
                    mentions: [userJid]
                }, { quoted: message });

                await react("✅");
                
            } catch (imageError) {
                // لو فشل تحميل الصورة، نرسل النص فقط
                console.log("⚠️ فشل تحميل البوستر:", imageError.message);
                await sock.sendMessage(chatId, {
                    text: caption,
                    mentions: [userJid]
                }, { quoted: message });
                await react("🖼️");
            }

        } catch (error) {
            console.error("❌ خطأ في شرح الأنمي:", error);
            
            const errorMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*❌ فـشـل الـبـحـث*
*───━━━⊱  ⚠️  ⊰━━━───*

*📋 الأسباب المحتملة:*

*• اسـم الأنـمـي غـيـر صـحـيـح*

*• مـشـكـلة فـي الـاتـصـال*

*• خـادم API مـشـغـول*

*💡 حـاول بـاسـم إنجـلـيـزي أو حـروف عـربـيـة*
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*`;

            await bot.sendMessage(chatId, {
                text: errorMsg,
                mentions: [userJid]
            }, { quoted: message });
        }
    }
};