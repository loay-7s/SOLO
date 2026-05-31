import * as cheerio from 'cheerio';
import axios from 'axios';
import { translate } from '@vitalets/google-translate-api';

const BASE = 'https://4kwallpapers.com';
const HEADERS = {
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
    'referer': 'https://4kwallpapers.com/'
};

async function translateToEnglish(text) {
    try {
        const res = await translate(text, { to: 'en' });
        return res.text;
    } catch (e) {
        return text;
    }
}

async function fetchHtml(url) {
    const res = await axios.get(url, { headers: HEADERS, timeout: 20000 });
    return res.data;
}

async function searchWallpapers(query, limit) {
    const html = await fetchHtml(`${BASE}/search/?q=${encodeURIComponent(query)}`);
    const $ = cheerio.load(html);
    const results = [];

    $('a[href*=".html"]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href || results.length >= limit) return;
        if (!href.includes(BASE) && !href.startsWith('/')) return;
        const fullHref = href.startsWith('http') ? href : BASE + href;
        if (!/\/[a-z0-9-]+-(\d+)\.html$/.test(fullHref)) return;
        if (!results.includes(fullHref)) results.push(fullHref);
    });

    return results.slice(0, limit);
}

async function getWallpaperImage(detailUrl) {
    const html = await fetchHtml(detailUrl);
    const $ = cheerio.load(html);

    const mobileRes = ['1080x2400', '1080x2340', '1080x2160', '1080x1920', '720x1280'];
    const desktopRes = ['3840x2160', '2560x1440', '1920x1080', '1366x768'];
    const preferred = [...mobileRes, ...desktopRes];

    const allLinks = [];
    $('a[href*="/images/wallpapers/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href) allLinks.push(href.startsWith('http') ? href : BASE + href);
    });

    if (!allLinks.length) return null;

    for (const res of preferred) {
        const match = allLinks.find(l => l.includes(res));
        if (match) return match;
    }

    return allLinks[0];
}

export default {
    name: "خلفية",
    aliases: ["wallpaper", "خلفيات", "خلفيه"],
    description: "بحث عن خلفيات 4K عالية الجودة (يدعم العربي والإنجليزي)",
    category: "tools",
    developer: false,
    group: false,
    private: false,

    async run({ message, sock, reply, react, args }) {
        let query = args.join(" ");
        let limit = 1;
        
        if (!query) {
            await react("🖼️");
            return reply(`*╭─━━━━━━━━━━━━━━━━━─╮*
*│ 🖼️ بـحـث عـن خـلـفـيـات 4K 🖼️*
*╰─━━━━━━━━━━━━━━━━━─╯*

*📝 اكتب اسم الخلفية (عربي أو إنجليزي)*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

📌 *.خلفية ناروتو* → يجيب خلفية واحدة
📌 *.خلفية ناروتو 5* → يجيب 5 خلفيات
📌 *.خلفية sunset 10* → يجيب 10 خلفيات

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
        }
        
        // استخراج العدد من آخر كلمة إذا كان رقماً
        const words = query.split(' ');
        const lastWord = words[words.length - 1];
        if (!isNaN(lastWord) && lastWord >= 1 && lastWord <= 10) {
            limit = parseInt(lastWord);
            words.pop();
            query = words.join(' ');
        }
        
        if (limit > 10) limit = 10;
        if (limit < 1) limit = 1;
        
        await react("🔍");
        
        // إرسال رسالة انتظار
        const waitMsg = await reply(`*╭─━━━━━━━━━━━━━━━━━━─╮*
*│ 🔍 جـاري الـبـحـث عـن خـلـفـيـات 🔍*
*╰─━━━━━━━━━━━━━━━━━─╯*

📝 *الكلمة:* ${query}
🔢 *العدد:* ${limit}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
        
        // ترجمة البحث إلى الإنجليزية إذا كان عربياً
        let searchQuery = query;
        const isArabic = /[\u0600-\u06FF]/.test(query);
        if (isArabic) {
            try {
                searchQuery = await translateToEnglish(query);
                await sock.sendMessage(message.key.remoteJid, {
                    text: `*🌐 تـم تـرجـمـة الـبـحـث:* "${query}" → "${searchQuery}"`,
                    edit: waitMsg.key.id
                });
            } catch (e) {
                console.log("Translation failed:", e.message);
            }
        }
        
        let detailPages;
        try {
            detailPages = await searchWallpapers(searchQuery, limit);
        } catch (err) {
            await react("❌");
            return reply(`*❌ فـشـل الـبـحـث*\n📝 حاول مرة أخرى بعد قليل`);
        }
        
        if (!detailPages.length) {
            await react("😢");
            return reply(`*❌ لا توجد نتائج لـ:* ${query}\n📝 جرب كلمات بحث مختلفة`);
        }
        
        await reply(`*🖼️ تـم الـعـثـور عـلـى ${detailPages.length} خـلـفـيـة*\n⏳ جـاري الـتـحـضـيـر...`);
        
        const imageUrls = await Promise.all(
            detailPages.map(url => getWallpaperImage(url).catch(() => null))
        );
        
        const valid = imageUrls.filter(Boolean);
        
        if (!valid.length) {
            await react("❌");
            return reply(`*❌ فـشـل جـلـب الـصـور*\n📝 حاول مرة أخرى`);
        }
        
        await react("✅");
        
        let sent = 0;
        for (let i = 0; i < valid.length; i++) {
            try {
                const imgUrl = valid[i];
                const resolution = imgUrl.match(/(\d{3,4}x\d{3,4})/)?.[1] || '';
                const caption = `*╭─━━━━━━━━━━━━━━━━─╮*
*│ 🖼️ خـلـفـيـة ${query} 🖼️*
*╰─━━━━━━━━━━━━━━━━─╯*

📐 *الدقة:* ${resolution || '4K Ultra HD'}
🔢 *الصورة:* ${i+1}/${valid.length}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;
                
                await sock.sendMessage(message.key.remoteJid, {
                    image: { url: imgUrl },
                    caption: caption
                }, { quoted: message });
                sent++;
            } catch (err) {
                console.error("Send error:", err.message);
            }
        }
        
        if (sent === 0) {
            await reply(`*❌ فـشـل إرسـال الـخـلـفـيـات*\n📝 حاول مرة أخرى`);
        }
    }
};