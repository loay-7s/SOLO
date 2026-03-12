export default {
    name: "اقتراح",
    aliases: ["suggest"],
    description: "اقتراحات عشوائية في مجالات متعددة",
    category: "fun",
    group: true,

    async run({ bot, message, args, isGroup, userJid, reply, react }) {
        const jid = message.key.remoteJid;

        if (!isGroup) {
            return reply("*❌ هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        await react("💡");

        const category = args[0]?.toLowerCase() || 'عشوائي';

        // 📚 جميع الاقتراحات الأسطورية
        const suggestions = {
            // 🍽️ أكل (40 اقتراح)
            اكل: [
                { text: "جرب تعمل بيتزا بالجبنة الربع ساعة", tip: "ضيف زيتون أسود عشان الطعم" },
                { text: "اطلب برجر من مطعم الشيف", tip: "جرب معاه بطاطس ودجز" },
                { text: "سوي باستا بالصوص الأبيض", tip: "حط فطر ومشروم" },
                { text: "اكل شاورما عربي", tip: "مع ثومية وطحينة" },
                { text: "جرب المحشي ورق عنب", tip: "بلاش نار عشان ما ينشفش" },
                { text: "اعمل كسكسي بالخضار", tip: "ضيف الحمص للطعم الأصلي" },
                { text: "اطلب فول وطعمية", tip: "العيش الفلاحي أحسن حاجة" },
                { text: "سوي ملوخية بالأرانب", tip: "الأرز المصري هو السر" },
                { text: "جرب الكشري المصري", tip: "دقة وشطة كتير" },
                { text: "اكل مسقعة بالباذنجان", tip: "حاول تشوح الباذنجان الأول" },
                { text: "اعمل صينية مكرونة بشاميل", tip: "الجبنة الموتزاريلا تحفة" },
                { text: "جرب الكبة المقلية", tip: "اللبن الرايب جنبها" },
                { text: "اطلب منسف أردني", tip: "الجميد البلدي سر الطعم" },
                { text: "سوي مجبوس دجاج", tip: "الهيل والليمون الأسود" },
                { text: "جرب القرص بالعسل", tip: "ساخن أحسن" },
                { text: "اكل فطير مشلتت", tip: "بالعسل أو بالجبنة" },
                { text: "اعمل محشي كوسا", tip: "الصلصة الحمرا سرها" },
                { text: "جرب الكنافة النابلسية", tip: "مع الجبنة الحلوة" },
                { text: "اطلب قهوة عربية", tip: "مع التمر جنبها" },
                { text: "سوي سمك مشوي", tip: "شوي بالفحم أحلى" },
                { text: "جرب الكفتة المشوية", tip: "البقدونس سر الطعم" },
                { text: "اكل شيش طاووق", tip: "تتبيلة الزبادي" },
                { text: "اعمل صينية خضار بالفراخ", tip: "سويها في الفرن" },
                { text: "جرب المندي اليمني", tip: "الفحم تحت الرز" },
                { text: "اطلب برياني دجاج", tip: "مع صلصة حارة" },
                { text: "سوي عدس بالارز", tip: "تقلى البصل للوش" },
                { text: "جرب البطاطس المهروسة", tip: "مع جبنة كريمي" },
                { text: "اكل ورق عنب بالزيت", tip: "باردة أحلى" },
                { text: "اعمل فاهيتا فراخ", tip: "مع خضار ملون" },
                { text: "جرب السوشي الياباني", tip: "جرب مع واصبي" },
                { text: "اطلب باستا ألفريدو", tip: "الدجاج المشوي جنبها" },
                { text: "سوي برجر لحم", tip: "الجبنة الشيدر" },
                { text: "جرب الهوت دوج", tip: "صوص الباربكيو" },
                { text: "اكل بطاطس ودجز", tip: "مع كاتشب ومايونيز" },
                { text: "اعمل كباب حلة", tip: "في طنجرة على نار هادية" },
                { text: "جرب الكوارع بالخل", tip: "بالشوفان أحلى" },
                { text: "اطلب مخ", tip: "على الريق صباح" },
                { text: "سوي كفتة رز", tip: "بالصلصة الحمرا" },
                { text: "جرب الممبار", tip: "الجهاز بتاعك" }
            ],

            // 🎬 أفلام (40 اقتراح)
            افلام: [
                { text: "فيلم Inception", tip: "انتبه للمشهد الأول" },
                { text: "فيلم The Godfather", tip: "الجزء الأول أحسن" },
                { text: "فيلم Interstellar", tip: "الفضاء مخيف" },
                { text: "فيلم Shutter Island", tip: "النهاية مش متوقعاها" },
                { text: "فيلم The Dark Knight", tip: "الجوكر أحسن شرير" },
                { text: "فيلم Pulp Fiction", tip: "ترتيب الأحداث عجيب" },
                { text: "فيلم Fight Club", tip: "القاعدة الأولى" },
                { text: "فيلم Forrest Gump", tip: "العلبة شوكولاتة" },
                { text: "فيلم The Matrix", tip: "الجيل الأزرق ولا الأحمر" },
                { text: "فيلم Goodfellas", tip: "مافيا حقيقية" },
                { text: "فيلم The Shawshank Redemption", tip: "الأمل" },
                { text: "فيلم Schindler's List", tip: "فيلم مؤثر" },
                { text: "فيلم 12 Angry Men", tip: "فيلم واحد مكان" },
                { text: "فيلم The Silence of the Lambs", tip: "كلاريس" },
                { text: "فيلم Se7en", tip: "شنطة إيه" },
                { text: "فيلم The Usual Suspects", tip: "المفاجأة" },
                { text: "فيلم Memento", tip: "الذاكرة" },
                { text: "فيلم The Prestige", tip: "السحر" },
                { text: "فيلم The Green Mile", tip: "جون كوفي" },
                { text: "فيلم Gladiator", tip: "ماكسيموس" },
                { text: "فيلم Braveheart", tip: "فريدوم" },
                { text: "فيلم Titanic", tip: "منجمدين" },
                { text: "فيلم Avatar", tip: "الأزرق" },
                { text: "فيلم The Avengers", tip: "تجميع الأبطال" },
                { text: "فيلم Iron Man", tip: "توني ستارك" },
                { text: "فيلم Spider-Man: No Way Home", tip: "الثلاثة" },
                { text: "فيلم Joker", tip: "واو" },
                { text: "فيلم Parasite", tip: "كوري" },
                { text: "فيلم Coco", tip: "كرتون جميل" },
                { text: "فيلم Inside Out", tip: "المشاعر" },
                { text: "فيلم Up", tip: "البيت بالبالونات" },
                { text: "فيلم Toy Story", tip: "وودي وباز" },
                { text: "فيلم The Lion King", tip: "سيمبا" },
                { text: "فيلم Frozen", tip: "لطيفي" },
                { text: "فيلم Moana", tip: "محيط" },
                { text: "فيلم Encanto", tip: "كولومبيا" },
                { text: "فيلم Soul", tip: "الجاز" },
                { text: "فيلم Luca", tip: "البحر" },
                { text: "فيلم Turning Red", tip: "الباندا" }
            ],

            // 📚 كتب (40 اقتراح)
            كتب: [
                { text: "كتاب 1984", tip: "الأخ الأكبر يراقبك" },
                { text: "كتاب عالم جديد شجاع", tip: "مستقبل مخيف" },
                { text: "كتاب الجريمة والعقاب", tip: "نفسية" },
                { text: "كتاب البؤساء", tip: "فرنسي" },
                { text: "كتاب مئة عام من العزلة", tip: "ماركيز" },
                { text: "كتاب دون كيخوتي", tip: "طواحين الهواء" },
                { text: "كتاب الأخوة كارامازوف", tip: "روسي" },
                { text: "كتاب آنا كارنينا", tip: "قطار" },
                { text: "كتاب مدام بوفاري", tip: "فرنسي" },
                { text: "كتاب غاتسبي العظيم", tip: "الضوء الأخضر" },
                { text: "كتاب على الطريق", tip: "رحلات" },
                { text: "كتاب لوليتا", tip: "مثير للجدل" },
                { text: "كتاب كافكا على الشاطئ", tip: "موراكامي" },
                { text: "كتاب الخيميائي", tip: "بولولو" },
                { text: "كتاب الجبل الخامس", tip: "كوهيلو" },
                { text: "كتاب الزهرة", tip: "سانت اكزوبيري" },
                { text: "كتاب الرجل العنكبوت", tip: "أطفال" },
                { text: "كتاب الثلاثية", tip: "نجيب محفوظ" },
                { text: "كتاب أولاد حارتنا", tip: "محفوظ" },
                { text: "كتاب اللص والكلاب", tip: "محفوظ" },
                { text: "كتاب المرايا", tip: "محفوظ" },
                { text: "كتاب الكرنك", tip: "محفوظ" },
                { text: "كتاب حديث الصباح والمساء", tip: "محفوظ" },
                { text: "كتاب أفراح القبة", tip: "محفوظ" },
                { text: "كتاب رحلة ابن فطومة", tip: "محفوظ" },
                { text: "كتاب السكرية", tip: "محفوظ" },
                { text: "كتاب قصر الشوق", tip: "محفوظ" },
                { text: "كتاب بين القصرين", tip: "محفوظ" },
                { text: "كتاب الثلاثية المصرية", tip: "محفوظ" },
                { text: "كتاب العائد", tip: "هاني" },
                { text: "كتاب أرض زيكولا", tip: "عمرو عبد الحميد" },
                { text: "كتاب يوتوبيا", tip: "أحمد خالد توفيق" },
                { text: "كتاب مثل إيكاروس", tip: "توفيق" },
                { text: "كتاب السنجة", tip: "توفيق" },
                { text: "كتاب شاي بلسان", tip: "توفيق" },
                { text: "كتاب مقتل فخر الدين", tip: "يوسف زيدان" },
                { text: "كتاب عزازيل", tip: "زيدان" },
                { text: "كتاب النبطي", tip: "زيدان" },
                { text: "كتاب اللاهوت العربي", tip: "زيدان" }
            ],

            // 🎮 ألعاب (40 اقتراح)
            العاب: [
                { text: "لعبة The Witcher 3", tip: "جيرالت" },
                { text: "لعبة Red Dead Redemption 2", tip: "آرثر" },
                { text: "لعبة God of War", tip: "كريتوس" },
                { text: "لعبة The Last of Us", tip: "جويل وإيلي" },
                { text: "لعبة Uncharted 4", tip: "ناثان دريك" },
                { text: "لعبة Spider-Man", tip: "بيتر باركر" },
                { text: "لعبة Horizon Zero Dawn", tip: "آلوي" },
                { text: "لعبة Ghost of Tsushima", tip: "جين" },
                { text: "لعبة Bloodborne", tip: "صعبة" },
                { text: "لعبة Sekiro", tip: "أصعب" },
                { text: "لعبة Dark Souls 3", tip: "أصعب بكتير" },
                { text: "لعبة Elden Ring", tip: "الأصعب" },
                { text: "لعبة GTA V", tip: "فرانكلين ومايكل" },
                { text: "لعبة GTA San Andreas", tip: "سي جي" },
                { text: "لعبة GTA IV", tip: "نيكو" },
                { text: "لعبة Mafia", tip: "فيتو" },
                { text: "لعبة Mafia 2", tip: "فيتو" },
                { text: "لعبة Mafia 3", tip: "لينكولن" },
                { text: "لعبة Call of Duty MW", tip: "كابتن برايس" },
                { text: "لعبة Call of Duty Black Ops", tip: "ميسون" },
                { text: "لعبة Battlefield 1", tip: "حرب عالمية" },
                { text: "لعبة Battlefield V", tip: "حرب تانية" },
                { text: "لعبة FIFA 24", tip: "كرة قدم" },
                { text: "لعبة PES 21", tip: "كرة قدم كمان" },
                { text: "لعبة NBA 2K24", tip: "سلة" },
                { text: "لعبة Forza Horizon 5", tip: "سباق" },
                { text: "لعبة Need for Speed Heat", tip: "سباق وشرطة" },
                { text: "لعبة Minecraft", tip: "مكعبات" },
                { text: "لعبة Fortnite", tip: "باتل رويال" },
                { text: "لعبة PUBG", tip: "باتل رويال" },
                { text: "لعبة Apex Legends", tip: "باتل رويال" },
                { text: "لعبة Valorant", tip: "شوتر" },
                { text: "لعبة CS:GO", tip: "كلاش" },
                { text: "لعبة Overwatch 2", tip: "شوتر" },
                { text: "لعبة League of Legends", tip: "موبا" },
                { text: "لعبة Dota 2", tip: "موبا" },
                { text: "لعبة Mobile Legends", tip: "موبا على الموبايل" },
                { text: "لعبة Wild Rift", tip: "لول على الموبايل" },
                { text: "لعبة Pokémon Go", tip: "امشي وانت بتلعب" }
            ],

            // 🏝️ سفر (20 اقتراح)
            سفر: [
                { text: "سافر بالي", tip: "الجو رهيب" },
                { text: "سافر شرم الشيخ", tip: "غطس" },
                { text: "سافر دهب", tip: "شباب" },
                { text: "سافر الغردقة", tip: "فنادق" },
                { text: "سافر العلمين", tip: "جديدة" },
                { text: "سافر اسطنبول", tip: "تركيا" },
                { text: "سافر أنطاليا", tip: "بحر تركيا" },
                { text: "سافر دبي", tip: "برج خليفة" },
                { text: "سافر أبو ظبي", tip: "الإمارات" },
                { text: "سافر الدوحة", tip: "قطر" },
                { text: "سافر باريس", tip: "فرنسا" },
                { text: "سافر لندن", tip: "إنجلترا" },
                { text: "سافر روما", tip: "إيطاليا" },
                { text: "سافر برشلونة", tip: "إسبانيا" },
                { text: "سافر مدريد", tip: "إسبانيا" },
                { text: "سافر نيويورك", tip: "أمريكا" },
                { text: "سافر لوس أنجلوس", tip: "أمريكا" },
                { text: "سافر طوكيو", tip: "اليابان" },
                { text: "سافر كيوتو", tip: "اليابان" },
                { text: "سافر جاكرتا", tip: "أندونيسيا" }
            ],

            // 💡 مشاريع (20 اقتراح)
            مشاريع: [
                { text: "افتح محل عصير", tip: "في منطقة حارة" },
                { text: "افتح كشك حلويات", tip: "جنب مدرسة" },
                { text: "اعمل مشروع أكل بيتي", tip: "سوشيال ميديا" },
                { text: "افتح محل جوالات", tip: "صيانة وبيع" },
                { text: "اعمل قناة يوتيوب", tip: "لايف" },
                { text: "اعمل بوت واتساب", tip: "زي اللي بتعمله دلوقتي" },
                { text: "افتح متجر إلكتروني", tip: "ملابس" },
                { text: "اعمل تطبيق موبايل", tip: "فكرة جديدة" },
                { text: "افتح مركز تعليمي", tip: "دروس خصوصية" },
                { text: "اعمل مشروع توزيع", tip: "مواد غذائية" },
                { text: "افتح مغسلة ملابس", tip: "خدمة توصيل" },
                { text: "افتح محل عطور", tip: "تجميع" },
                { text: "اعمل مشروع نظارات", tip: "شمسي وطبي" },
                { text: "افتح كافيه", tip: "جو شبابي" },
                { text: "افتح مطعم صغير", tip: "سندوتشات" },
                { text: "اعمل مشروع فريلانس", tip: "تصميم أو برمجة" },
                { text: "افتح محل ورد", tip: "هدايا" },
                { text: "اعمل مشروع إكسسوارات", tip: "يدوي" },
                { text: "افتح محل هدايا", tip: "ألعاب أطفال" },
                { text: "اعمل مشروع تنظيف", tip: "شركات ومنازل" }
            ],

            // 🎵 أغاني (20 اقتراح)
            اغاني: [
                { text: "أغنية Shape of You", tip: "إد شيران" },
                { text: "أغنية Blinding Lights", tip: "ذا ويكند" },
                { text: "أغنية Dance Monkey", tip: "تونيس" },
                { text: "أغنية Despacito", tip: "لويس فونسي" },
                { text: "أغنية Havana", tip: "كاميلا" },
                { text: "أغنية راجعين يا هوا", tip: "عمرو دياب" },
                { text: "أغنية أنا عايش", tip: "عمرو دياب" },
                { text: "أغنية حبيبي يا نور العين", tip: "عمرو دياب" },
                { text: "أغنية كملت", pt: "بهاء سلطان" },
                { text: "أغنية لو بتحب", tip: "تامر عاشور" },
                { text: "أغنية بحبك", tip: "تامر حسني" },
                { text: "أغنية بعيد عنك", tip: "تامر حسني" },
                { text: "أغنية بسم الله", tip: "ويجز" },
                { text: "أغنية البخت", tip: "ويجز" },
                { text: "أغنية البوم ولسة", tip: "ويجز" },
                { text: "أغنية أضواء الشهرة", tip: "عفروتو" },
                { text: "أغنية كسوف", tip: "عفروتو" },
                { text: "أغنية مهرجان", tip: "حمو بيكا" },
                { text: "أغنية أنا طفيلي", tip: "حمو بيكا" },
                { text: "أغنية ع الماشي", tip: "حسن شاكوش" }
            ],

            // 📺 مسلسلات (20 اقتراح)
            مسلسلات: [
                { text: "مسلسل Breaking Bad", tip: "والتر وايت" },
                { text: "مسلسل Better Call Saul", tip: "سول" },
                { text: "مسلسل Game of Thrones", tip: "العرش الحديدي" },
                { text: "مسلسل The Walking Dead", tip: "زومبي" },
                { text: "مسلسل Stranger Things", tip: "الأطفال" },
                { text: "مسلسل The Office", tip: "كوميدي" },
                { text: "مسلسل Friends", tip: "الأصدقاء" },
                { text: "مسلسل How I Met Your Mother", tip: "بارني" },
                { text: "مسلسل The Big Bang Theory", tip: "شيلدون" },
                { text: "مسلسل Prison Break", tip: "الهروب" },
                { text: "مسلسل La Casa de Papel", tip: "البروفيسور" },
                { text: "مسلسل Narcos", tip: "بابلو إسكوبار" },
                { text: "مسلسل Sherlock", tip: "بنديكت" },
                { text: "مسلسل Black Mirror", tip: "تكنولوجيا" },
                { text: "مسلسل Dark", tip: "ألماني" },
                { text: "مسلسل الكبير أوي", tip: "أحمد مكي" },
                { text: "مسلسل ربع مشكل", tip: "أحمد مكي" },
                { text: "مسلسل نيللي وشريهان", tip: "ياسمين صبري" },
                { text: "مسلسل النصابين", tip: "مصطفى خاطر" },
                { text: "مسلسل بـ 100 وش", tip: "الفيشاوي" }
            ]
        };

        // تحديد المجال المطلوب
        let selectedCategory = category;
        let categoryEmoji = '💡';
        let categoryName = 'عـشـوائـي';
        let categorySuggestions = [];

        // جمع كل الاقتراحات في مصفوفة واحدة
        const allSuggestions = [];
        for (const cat in suggestions) {
            allSuggestions.push(...suggestions[cat]);
        }

        if (category === 'عشوائي' || !suggestions[category]) {
            categorySuggestions = allSuggestions;
            categoryName = 'عـشـوائـي';
            categoryEmoji = '✨';
        } else {
            categorySuggestions = suggestions[category];
            // تعيين الإيموجي المناسب
            if (category === 'اكل') categoryEmoji = '🍽️';
            else if (category === 'افلام') categoryEmoji = '🎬';
            else if (category === 'كتب') categoryEmoji = '📚';
            else if (category === 'العاب') categoryEmoji = '🎮';
            else if (category === 'سفر') categoryEmoji = '🏝️';
            else if (category === 'مشاريع') categoryEmoji = '💡';
            else if (category === 'اغاني') categoryEmoji = '🎵';
            else if (category === 'مسلسلات') categoryEmoji = '📺';
            else categoryEmoji = '✨';
            
            categoryName = category === 'اكل' ? 'أكـل' :
                           category === 'افلام' ? 'أفـلام' :
                           category === 'كتب' ? 'كـتـب' :
                           category === 'العاب' ? 'ألـعـاب' :
                           category === 'سفر' ? 'سـفـر' :
                           category === 'مشاريع' ? 'مـشـاريـع' :
                           category === 'اغاني' ? 'أغـانـي' :
                           category === 'مسلسلات' ? 'مـسـلـسـلات' : 'عـشـوائـي';
        }

        // اختيار اقتراح عشوائي
        const randomSuggestion = categorySuggestions[Math.floor(Math.random() * categorySuggestions.length)];

        const resultMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*💡 اقـتـراح الـيـوم*
*───━━━⊱  ✨  ⊰━━━───*

*${categoryEmoji} الـمـجـال:* *${categoryName}*

*📝 الـاقـتـراح:*

> *${randomSuggestion.text}*


*💬 نـصـيـحـة:*
*${randomSuggestion.tip || 'استمتع!'}*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📌 لـلـمـزيـد:*

*• .اقتراح اكل* - *أكـلـة🥩*

*• .اقتراح افلام* - *فـيـلـم🎥*

*• .اقتراح كتب* - *كـتـاب📓*

*• .اقتراح العاب* - *لـعـبـة🎮*

*• .اقتراح سفر* - *سـفـريـة✈️*

*• .اقتراح مشاريع* - *مـشـاريـع💡*

*• .اقتراح اغاني* - *أغـنـيـة🎼*

*• .اقتراح مسلسلات* - *مـسـلـسـلات📽*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

        await bot.sendMessage(jid, {
            text: resultMsg,
            mentions: [userJid]
        }, { quoted: message });

        await react("✅");
    }
};