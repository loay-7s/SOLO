export default {
    name: "توقيت",
    aliases: ["time", "الوقت"],
    description: "عرض الوقت في أي دولة",
    category: "tools",

    async run({ bot, message, args, reply, react }) {
        const jid = message.key.remoteJid;
        const country = args.join(" ").toLowerCase().trim();

        if (!country) {
            return reply("*🌍 طـريـقـة الاسـتـخـدام:*\n\n*.توقيت اسم الدولة*\n\n*مـثـال:*\n*.توقيت مصر*\n*.توقيت اليابان*");
        }

        await react("🕒");

        // قاعدة بيانات الدول مع المناطق الزمنية (بدون همزات)
        const countries = {
            // شمال افريقيا والشرق الاوسط
            "مصر": "Africa/Cairo",
            "السعودية": "Asia/Riyadh",
            "الامارات": "Asia/Dubai",
            "الكويت": "Asia/Kuwait",
            "قطر": "Asia/Qatar",
            "البحرين": "Asia/Bahrain",
            "عمان": "Asia/Muscat",
            "اليمن": "Asia/Aden",
            "العراق": "Asia/Baghdad",
            "الاردن": "Asia/Amman",
            "فلسطين": "Asia/Gaza",
            "لبنان": "Asia/Beirut",
            "سوريا": "Asia/Damascus",
            "ليبيا": "Africa/Tripoli",
            "تونس": "Africa/Tunis",
            "الجزائر": "Africa/Algiers",
            "المغرب": "Africa/Casablanca",
            "موريتانيا": "Africa/Nouakchott",
            "السودان": "Africa/Khartoum",
            "الصومال": "Africa/Mogadishu",
            "جيبوتي": "Africa/Djibouti",
            "جزر القمر": "Indian/Comoro",

            // اوروبا
            "البانيا": "Europe/Tirane",
            "اندورا": "Europe/Andorra",
            "النمسا": "Europe/Vienna",
            "بلجيكا": "Europe/Brussels",
            "بلغاريا": "Europe/Sofia",
            "كرواتيا": "Europe/Zagreb",
            "قبرص": "Asia/Nicosia",
            "التشيك": "Europe/Prague",
            "الدنمارك": "Europe/Copenhagen",
            "استونيا": "Europe/Tallinn",
            "فنلندا": "Europe/Helsinki",
            "فرنسا": "Europe/Paris",
            "المانيا": "Europe/Berlin",
            "اليونان": "Europe/Athens",
            "المجر": "Europe/Budapest",
            "ايسلندا": "Atlantic/Reykjavik",
            "ايرلندا": "Europe/Dublin",
            "ايطاليا": "Europe/Rome",
            "لاتفيا": "Europe/Riga",
            "ليتوانيا": "Europe/Vilnius",
            "لوكسمبورغ": "Europe/Luxembourg",
            "مالطا": "Europe/Malta",
            "موناكو": "Europe/Monaco",
            "الجبل الاسود": "Europe/Podgorica",
            "هولندا": "Europe/Amsterdam",
            "النرويج": "Europe/Oslo",
            "بولندا": "Europe/Warsaw",
            "البرتغال": "Europe/Lisbon",
            "رومانيا": "Europe/Bucharest",
            "روسيا": "Europe/Moscow",
            "صربيا": "Europe/Belgrade",
            "سلوفاكيا": "Europe/Bratislava",
            "سلوفينيا": "Europe/Ljubljana",
            "اسبانيا": "Europe/Madrid",
            "السويد": "Europe/Stockholm",
            "سويسرا": "Europe/Zurich",
            "اوكرانيا": "Europe/Kiev",
            "بريطانيا": "Europe/London",
            "الفاتيكان": "Europe/Vatican",

            // اسيا
            "افغانستان": "Asia/Kabul",
            "ارمينيا": "Asia/Yerevan",
            "اذربيجان": "Asia/Baku",
            "بنغلاديش": "Asia/Dhaka",
            "بوتان": "Asia/Thimphu",
            "بروناي": "Asia/Brunei",
            "كمبوديا": "Asia/Phnom_Penh",
            "الصين": "Asia/Shanghai",
            "جورجيا": "Asia/Tbilisi",
            "الهند": "Asia/Kolkata",
            "اندونيسيا": "Asia/Jakarta",
            "ايران": "Asia/Tehran",
            "اليابان": "Asia/Tokyo",
            "كازاخستان": "Asia/Almaty",
            "كوريا الشمالية": "Asia/Pyongyang",
            "كوريا الجنوبية": "Asia/Seoul",
            "قيرغيزستان": "Asia/Bishkek",
            "لاوس": "Asia/Vientiane",
            "ماليزيا": "Asia/Kuala_Lumpur",
            "جزر المالديف": "Indian/Maldives",
            "منغوليا": "Asia/Ulaanbaatar",
            "ميانمار": "Asia/Yangon",
            "نيبال": "Asia/Kathmandu",
            "باكستان": "Asia/Karachi",
            "الفلبين": "Asia/Manila",
            "سنغافورة": "Asia/Singapore",
            "سريلانكا": "Asia/Colombo",
            "تايوان": "Asia/Taipei",
            "طاجيكستان": "Asia/Dushanbe",
            "تايلاند": "Asia/Bangkok",
            "تركيا": "Europe/Istanbul",
            "تركمانستان": "Asia/Ashgabat",
            "اوزبكستان": "Asia/Tashkent",
            "فيتنام": "Asia/Ho_Chi_Minh",

            // امريكا الشمالية
            "كندا": "America/Toronto",
            "المكسيك": "America/Mexico_City",
            "امريكا": "America/New_York",
            "كوبا": "America/Havana",
            "جامايكا": "America/Jamaica",
            "هايتي": "America/Port-au-Prince",
            "جزر البهاما": "America/Nassau",
            "باربادوس": "America/Barbados",
            "كوستاريكا": "America/Costa_Rica",
            "السلفادور": "America/El_Salvador",
            "غواتيمالا": "America/Guatemala",
            "هندوراس": "America/Tegucigalpa",
            "نيكاراغوا": "America/Managua",
            "بنما": "America/Panama",

            // امريكا الجنوبية
            "الارجنتين": "America/Argentina/Buenos_Aires",
            "بوليفيا": "America/La_Paz",
            "البرازيل": "America/Sao_Paulo",
            "تشيلي": "America/Santiago",
            "كولومبيا": "America/Bogota",
            "الاكوادور": "America/Guayaquil",
            "غيانا": "America/Guyana",
            "باراغواي": "America/Asuncion",
            "بيرو": "America/Lima",
            "سورينام": "America/Paramaribo",
            "اوروغواي": "America/Montevideo",
            "فنزويلا": "America/Caracas",

            // افريقيا
            "انغولا": "Africa/Luanda",
            "بوتسوانا": "Africa/Gaborone",
            "بوركينا فاسو": "Africa/Ouagadougou",
            "بوروندي": "Africa/Bujumbura",
            "الكاميرون": "Africa/Douala",
            "الراس الاخضر": "Atlantic/Cape_Verde",
            "افريقيا الوسطى": "Africa/Bangui",
            "تشاد": "Africa/Ndjamena",
            "الكونغو": "Africa/Brazzaville",
            "الكونغو الديمقراطية": "Africa/Kinshasa",
            "ساحل العاج": "Africa/Abidjan",
            "غينيا الاستوائية": "Africa/Malabo",
            "اريتريا": "Africa/Asmara",
            "اثيوبيا": "Africa/Addis_Ababa",
            "الغابون": "Africa/Libreville",
            "غامبيا": "Africa/Banjul",
            "غانا": "Africa/Accra",
            "غينيا": "Africa/Conakry",
            "غينيا بيساو": "Africa/Bissau",
            "كينيا": "Africa/Nairobi",
            "ليسوتو": "Africa/Maseru",
            "ليبيريا": "Africa/Monrovia",
            "مدغشقر": "Indian/Antananarivo",
            "مالاوي": "Africa/Blantyre",
            "مالي": "Africa/Bamako",
            "النيجر": "Africa/Niamey",
            "نيجيريا": "Africa/Lagos",
            "رواندا": "Africa/Kigali",
            "ساو تومي": "Africa/Sao_Tome",
            "السنغال": "Africa/Dakar",
            "سيشل": "Indian/Mahe",
            "سيراليون": "Africa/Freetown",
            "جنوب افريقيا": "Africa/Johannesburg",
            "جنوب السودان": "Africa/Juba",
            "تنزانيا": "Africa/Dar_es_Salaam",
            "توجو": "Africa/Lome",
            "اوغندا": "Africa/Kampala",
            "زامبيا": "Africa/Lusaka",
            "زيمبابوي": "Africa/Harare",

            // اوقيانوسيا
            "استراليا": "Australia/Sydney",
            "نيوزيلندا": "Pacific/Auckland",
            "فيجي": "Pacific/Fiji",
            "بابوا غينيا": "Pacific/Port_Moresby",
            "جزر سليمان": "Pacific/Guadalcanal",
            "فانواتو": "Pacific/Efate",
            "كاليدونيا الجديدة": "Pacific/Noumea",
            "بولينيزيا الفرنسية": "Pacific/Tahiti",
            "ساموا": "Pacific/Apia",
            "تونغا": "Pacific/Tongatapu",
            "كيريباتي": "Pacific/Tarawa",
            "جزر مارشال": "Pacific/Majuro",
            "ميكرونيزيا": "Pacific/Chuuk",
            "بالاو": "Pacific/Palau"
        };

        // البحث عن الدولة (حتى لو كتبت بدون تشكيل)
        let foundCountry = null;
        let foundTimezone = null;

        for (const [name, timezone] of Object.entries(countries)) {
            if (name.includes(country) || country.includes(name)) {
                foundCountry = name;
                foundTimezone = timezone;
                break;
            }
        }

        if (!foundTimezone) {
            return reply("*❌ الـدولـة غـيـر مـوجـودة*\n\n*📝 الـدول الـمـتـوفـرة:*\nاكتب دولة من 150+ دولة حول العالم");
        }

try {
    // استخدام API بديل
    const timeResponse = await fetch(`https://timeapi.io/api/Time/current/zone?timeZone=${foundTimezone}`);
    
    let time, date;
    
    if (!timeResponse.ok) {
        // لو فشل الأول، جرب API تاني
        const backupResponse = await fetch(`http://worldtimeapi.org/api/timezone/${foundTimezone}`);
        if (!backupResponse.ok) {
            throw new Error("All APIs failed");
        }
        const backupData = await backupResponse.json();
        const datetime = new Date(backupData.datetime);
        time = datetime.toLocaleTimeString('en-EG');
        date = datetime.toLocaleDateString('en-EG');
    } else {
        const timeData = await timeResponse.json();
        time = new Date(timeData.dateTime).toLocaleTimeString('en-EG');
        date = new Date(timeData.dateTime).toLocaleDateString('en-EG');
    }

            const resultMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🕒 الـوقـت فـي ${foundCountry}*

*───━━━⊱  ⏰  ⊰━━━───*

*📅 الـتـاريـخ:* ⦓ *${date}* ⦔

*⏰ الـوقـت:* ⦓ *${time}* ⦔

*🌍 الـمـنـطـقـة:* ⦓ *${foundTimezone.split('/')[1].replace('_', ' ')}* ⦔

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await bot.sendMessage(jid, { text: resultMsg }, { quoted: message });

        } catch (error) {
            console.error("❌ خطأ في جلب الوقت:", error);
            await reply("*❌ فـشـل جـلـب الـوقـت*");
        }
    }
};