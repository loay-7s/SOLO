export default {
    name: "مزاجي",
    aliases: ["مزاج", "mood"],
    description: "البوت يحلل مزاجك بشكل عشوائي ومفصل",
    category: "fun",

    async run({ sock, m, userJid, reply, react }) {
        const chatId = m.key.remoteJid;
        
        // تفاعلات درامية
        await react("🔮");
        await new Promise(resolve => setTimeout(resolve, 500));
        await sock.sendMessage(chatId, { react: { text: "🎭", key: m.key } });

        // قائمة المزاجات الأسطورية (12 مزاج)
        const moods = [
            { 
                name: "سـعـيـد", 
                emoji: "😊",
                color: "🟡",
                colorName: "أصـفـر",
                element: "☀️",
                desc: "تـنـشـر الـبـهـجـة أيـنـمـا تـذهـب، والـجـمـيـع يـحـب صـحـبـتـك الـيـوم",
                advice: "🍦 أنـصـحـك تـأكـل آيـس كـريـم وتـفـرح ز يـادة",
                song: "🎵 Don't Worry, Be Happy",
                activity: "🍕 تـاكـل بـيـتـزا مـع صـحـابـك",
                avoid: "❌ تـتـجـنـب الأخـبـار الـحـزيـنـة"
            },
            { 
                name: "حـزيـن", 
                emoji: "😢",
                color: "🔵",
                colorName: "أزرق",
                element: "🌧️",
                desc: "تـحـتـاج إلـى مـن يـسـمـعـك، ربـمـا كـوب شـاي ودردشـة",
                advice: "☕ خـذ كـوب شـاي واسـتـمـع لأغـنـيـة حـزيـنـة، بـتـخـف",
                song: "🎵 Fix You - Coldplay",
                activity: "📖 تـقـرأ كـتـاب وتـحـضـن وسـادة",
                avoid: "🚫 تـتـجـنـب الأماكـن الـمـزدهـمـة"
            },
            { 
                name: "مـتـحـمـس", 
                emoji: "🔥",
                color: "🔴",
                colorName: "أحـمـر",
                element: "⚡",
                desc: "طـاقـتـك الـيـوم عـالـيـة، سـتـنـجـز كـل شـيء بـسـرعـة",
                advice: "⚡ اكـتـب صـيـد حـالاً قـبـل مـا تـهـدأ",
                song: "🎵 Eye of the Tiger",
                activity: "🏋️ تـتـمـرن فـي الـجـيـم",
                avoid: "❌ تـتـجـنـب الـكـسـلانـيـن"
            },
            { 
                name: "نـايـم", 
                emoji: "😴",
                color: "⚫",
                colorName: "أسـود",
                element: "🌙",
                desc: "تـرددك فـي الـردود مـفـهـوم، الـكـافـيـيـن صـديقـك الـيـوم",
                advice: "🛏️ روح نـام بـس بـلاش تـنـسـى تـشـوف الـمـنـبـه",
                song: "🎵 No Surprises - Radiohead",
                activity: "🛌 تـنـام 10 سـاعـات كـامـلـة",
                avoid: "🚫 تـتـجـنـب الـقـهـوة عـشـان مـاتـسـهـرش"
            },
            { 
                name: "مـتـعـب", 
                emoji: "💤",
                color: "⚪",
                colorName: "أبـيـض",
                element: "☁️",
                desc: "لا تـرهـق نـفـسـك، خـذ قـسـطـاً مـن الـراحـة",
                advice: "🧘 خـذ نـفـس عـمـيـق وكـرر",
                song: "🎵 Let It Be - Beatles",
                activity: "🛀 حـمـام دافـئ وخـلـود مـبـكـر",
                avoid: "🚫 تـتـجـنـب الـشـغـل ز يادة"
            },
            { 
                name: "غـامـض", 
                emoji: "🎭",
                color: "🟣",
                colorName: "بـنـفـسـجـي",
                element: "🌑",
                desc: "لا أحـد يـفـهـم مـا تـقـصـده، وأنـت تـسـتـمـتـع بـذلـك",
                advice: "🕵️ و اضـح إنـك بـتـخـطـط لـشـيء كـبـيـر",
                song: "🎵 The Sound of Silence",
                activity: "📝 تـكـتـب أفـكـارك فـي مـذكـرة سـريـة",
                avoid: "🚫 تـتـجـنـب فـضـولـيـيـن"
            },
            { 
                name: "مـلـكـي", 
                emoji: "👑",
                color: "🟡",
                colorName: "ذهـبـي",
                element: "👑",
                desc: "تـتـعـامـل مـع الـجـمـيـع مـن عـلـيـائـك، مـتـوقـعـاً الإحـتـرام",
                advice: "👑 نـعـم، نـعـم، كـلـنا رعـايـاك يـا مـولاي",
                song: "🎵 We Are the Champions",
                activity: "💼 تـتـصـرف كـالـمـديـر مـع الـجـمـيـع",
                avoid: "🚫 تـتـجـنـب الـعـاديـيـن"
            },
            { 
                name: "مـتـمـرد", 
                emoji: "🗡️",
                color: "🔴",
                colorName: "قـرمـزي",
                element: "🔥",
                desc: "لا تـعـتـرف بـقـوانـيـن، تـفـعـل مـا يـحـلـو لـك",
                advice: "💢 مـاشي يـا زعـيـم، كـل شـيء بـأمـرك",
                song: "🎵 Bohemian Rhapsody",
                activity: "🎸 تـسـمـع مـز يـكا صـاخـبـة",
                avoid: "🚫 تـتـجـنـب الـنـصـايـح"
            },
            { 
                name: "عـاشـق", 
                emoji: "💕",
                color: "💗",
                colorName: "ور دي",
                element: "🌸",
                desc: "تـرى الـورد فـي كـل مـكـان، وتـكـتـب شـعـراً لـلـجـدار",
                advice: "💌 عـيـنـي عـلـيـك، حـتـى الـجـدران تـتـغـزل فـيـهـا الـيـوم",
                song: "🎵 Perfect - Ed Sheeran",
                activity: "💝 تـشـتـري هـديـة لـحـبـيـبـك",
                avoid: "🚫 تـتـجـنـب الـوحـدة"
            },
            { 
                name: "مـحـارب", 
                emoji: "⚔️",
                color: "⚔️",
                colorName: "حـديـدي",
                element: "🗡️",
                desc: "مـسـتـعـد لأي تـحـدي، لا تـخـشـى الـمـواجـهـة",
                advice: "🏹 ار مـي سـهـمـك، الأهـداف كـثـيـرة",
                song: "🎵 Holding Out for a Hero",
                activity: "🎮 تـلـعـب ألـعـاب قـتـالـيـة",
                avoid: "🚫 تـتـجـنـب الـجـبـنـاء"
            },
            { 
                name: "حـكـيـم", 
                emoji: "🦉",
                color: "🟤",
                colorName: "بـنـي",
                element: "📜",
                desc: "تـقـدم الـنـصـائـح لـلـجـمـيـع، وكـأنـك عـشـت ألـف عـام",
                advice: "📜 هـات نـصـيـحـتـك، إحـنـا مـسـتـعـديـن",
                song: "🎵 The Sound of Silence",
                activity: "📚 تـقـرأ كـتـب تـنـمـيـة بـشـريـة",
                avoid: "🚫 تـتـجـنـب الـجـهـلـة"
            },
            { 
                name: "مـجـنـون", 
                emoji: "🤪",
                color: "🌈",
                colorName: "قـوس قـزح",
                element: "🌀",
                desc: "تـضـحـك فـي الأوقـات غـيـر الـمـنـاسـبـة، وهـذا رائـع",
                advice: "🤪 أنـت كـده كـده مـجـنـون، بـس الـيـوم ز يادة",
                song: "🎵 Crazy - Gnarls Barkley",
                activity: "🎉 تـعـمـل حـركـات غـريـبـة",
                avoid: "🚫 تـتـجـنـب الـجـاديـن"
            }
        ];

        // اختيار مزاج عشوائي
        const mood = moods[Math.floor(Math.random() * moods.length)];

        // مقدمات درامية
        const openings = [
            "*🔮 الـبـوت يـفـتـح مـلـف مـشـاعـرك*",
            "*🎭 تـحـلـيـل الـشـخـصـيـة الـعـمـيـق*",
            "*🌙 الأبـراج الـيـوم تـكـشـف*",
            "*⚡ طـاقـتـك الـكـونـيـة الـيـوم*",
            "*🍃 الـريـاح تـخـبـرنـي أنـك*",
            "*💫 الـنـجـوم رتـبـت لـك*",
            "*🔍 بـعـد فـحـص دقـيـق لـمـشـاعـرك*",
            "*🎴 الـكـوتـشـيـنـة تـقـول إنـك*",
            "*📊 نـظـام تـحـلـيـل الـمـشـاعـر يـقـرر*",
            "*🧿 الـطـالـع الـيـوم يـخـبـرنـي*"
        ];
        const opening = openings[Math.floor(Math.random() * openings.length)];

        // حالات مزاجية إضافية
        const powerLevels = ["مـنـخـفـض", "مـتـوسـط", "مـرتـفـع", "جـنـونـي"];
        const powerLevel = powerLevels[Math.floor(Math.random() * powerLevels.length)];

        const compatibility = ["عـاشـق", "مـحـارب", "حـكـيـم", "مـجـنـون", "مـلـكـي", "غـامـض"].filter(m => m !== mood.name);
        const bestMatch = compatibility[Math.floor(Math.random() * compatibility.length)];
        const worstMatch = compatibility.filter(m => m !== bestMatch)[Math.floor(Math.random() * (compatibility.length-1))];

        // اقتباس عشوائي
        const quotes = [
            "*💭 الـسـعـادة لا تـكـمـن فـي فـعـل مـا نـحـب، بـل فـي حـب مـا نـفـعـل*",
            "*💭 الـحـيـاة مـثـل الـمـرآة، تـبـتـسـم لـك عـنـدمـا تـبـتـسـم لـهـا*",
            "*💭 كـل يـوم هـو صـفـحـة جـديـدة فـي كـتـاب حـيـاتـك*",
            "*💭 لا تـبـكـي لأن الأمـر انـتـهـى، ابـتـسـم لأنـه حـدث*",
            "*💭 أنـت أقـوى مـمـا تـتـصـور، وأجـمـل مـمـا تـتـخـيـل*"
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];

        // وقت اليوم
        const hours = new Date().getHours();
        let timeOfDay = "";
        if (hours < 12) timeOfDay = "🌅 صـبـاحـي";
        else if (hours < 17) timeOfDay = "☀️ ظـهـيـري";
        else if (hours < 20) timeOfDay = "🌆 مـسـائـي";
        else timeOfDay = "🌙 لـيـلـي";

        // رسالة التوقيع
        const signatures = [
            "*🔮 الـبـوت الـعـر اف*",
            "*🎭 مـفـسـر الـمـشـاعـر*",
            "*🌙 كـاهـن الـطـالـع*",
            "*⚡ مـحـلـل الـمـزاج*",
            "*🍃 ر او ي الأحـوال*"
        ];
        const signature = signatures[Math.floor(Math.random() * signatures.length)];

        const finalMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🎭 تـحـلـيـل الـمـزاج الـحـالـي 🎭*

*───━━━⊱  ${mood.emoji}  ⊰━━━───*

*❑ [ مـعـلـومـات أسـاسـيـة ]*

${opening}

*الـمـزاج:* *⦓  ${mood.name}  ⦔*

*الـلـون:* *⦓  ${mood.colorName}  ⦔* ${mood.color}

*الـعـنـصـر:* *⦓  ${mood.element}  ⦔*

*الـوقـت:* *⦓  ${timeOfDay}  ⦔*

*قـوة الـمـزاج:* *⦓  ${powerLevel}  ⦔*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*❑ [ الـوصـف الـتـفـصـيـلـي ]*

*📝 ⦓  ${mood.desc}  ⦔*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*❑ [ الأنـشـطـة الـمـقـتـرحـة ]*

*✅ ⦓  ${mood.activity}  ⦔*

*❌ ⦓  ${mood.avoid}  ⦔*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*❑ [ نـصـيـحـة الـيـوم ]*

*💬 ⦓  ${mood.advice}  ⦔*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*❑ [ اقـتـراح غـنـائـي ]*

*🎵 ⦓  ${mood.song}  ⦔*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*❑ [ الـتـوافـق الـمـزاجـي ]*

*💚 مـتـوافـق مـع:* *⦓  ${bestMatch}  ⦔*

*💔 غـيـر مـتـوافـق مـع:* *⦓  ${worstMatch}  ⦔*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*❑ [ حـكـمـة الـيـوم ]*

${quote}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📋 تـوقـيـع:* ${signature}

*📅 جـرب غـداً لـتـرى تـقـريـر جـديـد*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

        await sock.sendMessage(chatId, { 
            text: finalMsg,
            mentions: [userJid]
        }, { quoted: m });
    }
};