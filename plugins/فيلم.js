import axios from 'axios';
import translate from 'translate';

translate.engine = 'google';
translate.from = 'en';
translate.to = 'ar';

const TMDB_API_KEY = 'aa6cf66a6c7f4c2459654ae2cbe2fffe';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export default {
    name: "فيلم",
    aliases: ["شرح_فيلم","مسلسل"],
    description: "شرح قصة فيلم أو مسلسل بالعربية مع البوستر",
    category: "افلام",
    group: true,

    async run({ bot, message, args, reply, react, userJid, sock }) {
        const chatId = message.key.remoteJid;

        if (!chatId.endsWith('@g.us')) {
            return reply("*❌ هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        let mediaName = args.join(' ');

        if (!mediaName) {
            const helpMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🎬 شـرح الأفـلام والـمـسـلـسـلات*

*───━━━⊱  📋  ⊰━━━───*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📝 طـريـقـة الاسـتـخـدام:*

*.فيلم* *[اسم الفيلم أو المسلسل]*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📌 أمـثـلـة:*

*.فيلم الخلاص*
*.فيلم interstellar*
*.فيلم breaking bad*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            return reply(helpMsg);
        }

        await react("🎬");

        let englishName = mediaName;
        try {
            const translation = await translate(mediaName, { from: 'ar', to: 'en' });
            if (translation && translation !== mediaName) {
                englishName = translation;
            }
        } catch (e) {}

        const startMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*🎬 جـاري الـبـحـث*
*───━━━⊱  🔍  ⊰━━━───*

*🎥 الاسـم:* ⦓ *${mediaName}* ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*⏳ جـاري الـبـحـث فـي قـاعـدة بـيـانـات TMDB...*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*`;

        await reply(startMsg);

        try {
            // البحث في TMDB (أفلام ومسلسلات)
            const searchUrl = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(englishName)}&language=ar`;
            
            const searchRes = await axios.get(searchUrl);
            
            if (!searchRes.data.results || searchRes.data.results.length === 0) {
                return reply(`*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*❌ لـم يـتـم الـعـثـور عـلـى الـفـيـلم أو الـمـسـلـسـل*

*───━━━⊱  ❌  ⊰━━━───*

*🎥 الاسـم:* ⦓ *${mediaName}* ⦔

*💡 نصـيـحـة: حـاول بـالإنجـلـيـزيـة*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*`);
            }

            const media = searchRes.data.results[0];
            const isMovie = media.media_type === 'movie';
            const mediaType = isMovie ? 'فيلم' : 'مسلسل';
            
            // جلب التفاصيل الكاملة
            let detailsUrl;
            if (isMovie) {
                detailsUrl = `${TMDB_BASE_URL}/movie/${media.id}?api_key=${TMDB_API_KEY}&language=ar`;
            } else {
                detailsUrl = `${TMDB_BASE_URL}/tv/${media.id}?api_key=${TMDB_API_KEY}&language=ar`;
            }
            
            const detailsRes = await axios.get(detailsUrl);
            const details = detailsRes.data;
            
            // ترجمة القصة
            let arabicOverview = '*جـاري الـتـرجـمـة...*';
            if (details.overview) {
                try {
                    arabicOverview = await translate(details.overview);
                    arabicOverview = arabicOverview.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
                    if (arabicOverview.length > 2000) {
                        arabicOverview = arabicOverview.substring(0, 2000) + '...';
                    }
                } catch(e) {
                    arabicOverview = details.overview + '\n\n*(غـيـر مـتـرجـم)*';
                }
            } else {
                arabicOverview = '*لا يـوجـد وصـف مـتـوفـر*';
            }
            
            // الأنواع
            let genresText = '';
            if (details.genres && details.genres.length > 0) {
                genresText = details.genres.map(g => `*${g.name}*`).join(' • ');
            } else {
                genresText = '*غـيـر مـعـروف*';
            }
            
            // السنة
            let year = '';
            if (isMovie) {
                year = details.release_date ? details.release_date.split('-')[0] : 'غـيـر مـعـروف';
            } else {
                year = details.first_air_date ? details.first_air_date.split('-')[0] : 'غـيـر مـعـروف';
            }
            
            // التقييم
            let rating = details.vote_average ? details.vote_average.toFixed(1) : 'غـيـر مـتـوفـر';
            
            // الحالة
            let statusText = '';
            if (isMovie) {
                statusText = 'فـيـلم اكـتـمـل ✅';
            } else {
                if (details.status === 'Ended') statusText = 'انـتـهـى عـرضـه ✅';
                else if (details.status === 'Returning Series') statusText = 'يـعـرض الآن 🔥';
                else if (details.status === 'In Production') statusText = 'قـيـد الإنتـاج ⚙️';
                else if (details.status === 'Planned') statusText = 'مـخـطـط لـه 📅';
                else statusText = details.status || 'غـيـر مـعـروف';
            }
            
            // عدد الحلقات (للمسلسلات فقط)
            let episodesText = '';
            if (!isMovie && details.number_of_episodes) {
                episodesText = `*🎭 الـحـلـقـات:* ⦓ *${details.number_of_episodes}* ⦔\n`;
            }
            
            // المدة (للأفلام فقط)
            let runtimeText = '';
            if (isMovie && details.runtime) {
                runtimeText = `*⏱️ الـمـدة:* ⦓ *${details.runtime} دقيقة* ⦔\n`;
            }
            
            // الممثلين (أول 3)
            let castText = '';
            try {
                let creditsUrl;
                if (isMovie) {
                    creditsUrl = `${TMDB_BASE_URL}/movie/${media.id}/credits?api_key=${TMDB_API_KEY}`;
                } else {
                    creditsUrl = `${TMDB_BASE_URL}/tv/${media.id}/aggregate_credits?api_key=${TMDB_API_KEY}`;
                }
                const creditsRes = await axios.get(creditsUrl);
                const cast = creditsRes.data.cast?.slice(0, 3) || [];
                if (cast.length > 0) {
                    castText = cast.map((actor, i) => `*┃ ${i+1}.* ⦓ *${actor.name}* ⦔`).join('\n');
                    castText = `*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*\n\n*🎭 أهـم الـمـمـثـلـيـن:* \n${castText}\n`;
                }
            } catch(e) {}
            
            // رابط البوستر
            let posterUrl = details.poster_path 
                ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
                : 'https://i.imgur.com/3XrQm7N.png';
            
            // الكابتشن النهائي
            const caption = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🎬 شـرح الـ${mediaType}*

*───━━━⊱  📽️  ⊰━━━───*

*🎥 الاسـم:* ⦓ *${details.title || details.name}* ⦔

*🔖 الاسـم الأصـلـي:* ⦓ *${details.original_title || details.original_name}* ⦔

*📅 السـنـة:* ⦓ *${year}* ⦔

*⭐ الـتـقـيـيـم:* ⦓ *${rating}* ⦔ / 10

${runtimeText}${episodesText}
*📊 الـحـالـة:* ⦓ *${statusText}* ⦔

*🏷️ الأنـواع:* ${genresText}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📝 الـقـصـة:* 

${arabicOverview}

${castText}

*🔗 رابط TMDB:* 
https://www.themoviedb.org/${isMovie ? 'movie' : 'tv'}/${media.id}

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            // إرسال البوستر مع الشرح
            try {
                const imageResponse = await axios.get(posterUrl, { responseType: 'arraybuffer', timeout: 10000 });
                const imageBuffer = Buffer.from(imageResponse.data);
                
                await sock.sendMessage(chatId, {
                    image: imageBuffer,
                    caption: caption,
                    mentions: [userJid]
                }, { quoted: message });

                await react("✅");
                
            } catch (imageError) {
                console.log("⚠️ فشل تحميل البوستر:", imageError.message);
                await sock.sendMessage(chatId, {
                    text: caption,
                    mentions: [userJid]
                }, { quoted: message });
                await react("🖼️");
            }

        } catch (error) {
            console.error("❌ خطأ في البحث:", error);
            
            const errorMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*❌ فـشـل الـبـحـث*
*───━━━⊱  ⚠️  ⊰━━━───*

*📋 الأسباب المحتملة:*

*• اسـم الـفـيـلم غـيـر صـحـيـح*

*• مـشـكـلة فـي الـاتـصـال*

*• خـادم TMDB مـشـغـول*

*💡 حـاول بـاسـم إنجـلـيـزي*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*`;

            await bot.sendMessage(chatId, {
                text: errorMsg,
                mentions: [userJid]
            }, { quoted: message });
        }
    }
};