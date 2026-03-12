import fs from 'fs/promises';
import path from 'path';

// المسار الكامل لملف الكونفج
const configPath = path.resolve(process.cwd(), 'config.js');

// دوال قراءة وكتابة الكونفج (تبقى كما هي)
async function readConfig() {
    try {
        const { config } = await import(`file://${configPath}?v=${Date.now()}`);
        return config;
    } catch (error) {
        console.error('خطأ في قراءة ملف الكونفج:', error);
        return null;
    }
}
async function writeConfig(newConfig) {
    try {
        const fileContent = await fs.readFile(configPath, 'utf8');
        const newDevelopersArrayString = JSON.stringify(newConfig.DEVELOPERS, null, 4);
        const updatedContent = fileContent.replace(
            /DEVELOPERS\s*:\s*\[[^\]]*\]/,
            `DEVELOPERS: ${newDevelopersArrayString}`
        );
        await fs.writeFile(configPath, updatedContent, 'utf8');
        return true;
    } catch (error) {
        console.error('خطأ في كتابة ملف الكونفج:', error);
        return false;
    }
}

export default {
    name: "مطور",
    aliases: ["developer"],
    description: "إدارة قائمة مطوري البوت (إضافة، حذف، عرض).",
    category: "developer",
    
    developer: true, 
    group: true,

    async run({ m, args, reply, sock, userJid }) {
        const subCommand = args[0]?.toLowerCase();

        if (!subCommand) {
            const helpMessage = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*👑 إدارة الـمـطـوريـن*
*───━━━⊱  📋  ⊰━━━───*

*📌 الأوامـر الـمـتـوفـرة:*

*🔹*.مطور عرض* - لـعـرض قـائـمـة الـمـطـوريـن*

*🔹*.مطور اضف* - لـإضـافـة مـطـور جـديـد (رد/مـنـشـن)*

*🔹*.مطور حذف* - لـحـذف مـطـور (رد/مـنـشـن/رقـم)*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;
            return reply(helpMessage.trim());
        }

        const contextInfo = m.message?.extendedTextMessage?.contextInfo;
        const quotedSender = contextInfo?.participant;
        const mentionedJid = contextInfo?.mentionedJid || [];

        // ✨✨ [الحل النهائي الحقيقي باستخراج البيانات الخام] ✨✨
        const getRealIdsFromMetadata = async (targetId) => {
            try {
                const metadata = await sock.groupMetadata(m.key.remoteJid);
                const participant = metadata.participants.find(p => p.id === targetId);
                
                if (!participant) return null;

                // 1. الـ JID الحقيقي هو phoneNumber
                const realJid = participant.phoneNumber;

                // 2. الـ LID الحقيقي هو id، فقط إذا كان ينتهي بـ @lid
                const realLid = participant.id.endsWith('@lid') ? participant.id : null;

                // إذا لم نجد JID حقيقي، نستخدم خطة بديلة
                if (!realJid) {
                    const cleanNum = targetId.split('@')[0].split(':')[0];
                    return { jid: `${cleanNum}@s.whatsapp.net`, lid: realLid };
                }
                
                return { jid: realJid, lid: realLid };

            } catch (e) {
                console.error("فشل في الحصول على بيانات المجموعة:", e);
                return null;
            }
        };

        switch (subCommand) {
case "عرض": {
    const config = await readConfig();
    if (!config) return reply('*❌ حـدث خـطأ أثـنـاء قـراءة الإعـدادات*');
    
    const developers = config.DEVELOPERS.filter(jid => jid.endsWith('@s.whatsapp.net')).map(jid => jid.split('@')[0]);
    
    if (developers.length === 0) {
        return reply('*📭 لا يـوجـد مـطـوريـن فـي الـقـائـمـة حـالـيـاً*');
    }

    let devList = '';
    developers.forEach((dev, index) => {
        // تحويل الرقم لصيغة +كود الدولة
        let formattedNumber = dev;
        
        // الدول العربية (22 دولة)
        if (dev.startsWith('20')) formattedNumber = `+20 ${dev.slice(2, 4)} ${dev.slice(4)}`; // مصر
        else if (dev.startsWith('966')) formattedNumber = `+966 ${dev.slice(3, 5)} ${dev.slice(5)}`; // السعودية
        else if (dev.startsWith('971')) formattedNumber = `+971 ${dev.slice(3, 5)} ${dev.slice(5)}`; // الإمارات
        else if (dev.startsWith('974')) formattedNumber = `+974 ${dev.slice(3, 5)} ${dev.slice(5)}`; // قطر
        else if (dev.startsWith('965')) formattedNumber = `+965 ${dev.slice(3, 5)} ${dev.slice(5)}`; // الكويت
        else if (dev.startsWith('973')) formattedNumber = `+973 ${dev.slice(3, 5)} ${dev.slice(5)}`; // البحرين
        else if (dev.startsWith('968')) formattedNumber = `+968 ${dev.slice(3, 5)} ${dev.slice(5)}`; // عمان
        else if (dev.startsWith('967')) formattedNumber = `+967 ${dev.slice(3, 5)} ${dev.slice(5)}`; // اليمن
        else if (dev.startsWith('970')) formattedNumber = `+970 ${dev.slice(3, 5)} ${dev.slice(5)}`; // فلسطين
        else if (dev.startsWith('972')) formattedNumber = `+972 ${dev.slice(3, 5)} ${dev.slice(5)}`; // إسرائيل (فلسطين المحتلة)
        else if (dev.startsWith('964')) formattedNumber = `+964 ${dev.slice(3, 5)} ${dev.slice(5)}`; // العراق
        else if (dev.startsWith('963')) formattedNumber = `+963 ${dev.slice(3, 5)} ${dev.slice(5)}`; // سوريا
        else if (dev.startsWith('962')) formattedNumber = `+962 ${dev.slice(3, 4)} ${dev.slice(4)}`; // الأردن
        else if (dev.startsWith('961')) formattedNumber = `+961 ${dev.slice(3, 5)} ${dev.slice(5)}`; // لبنان
        else if (dev.startsWith('218')) formattedNumber = `+218 ${dev.slice(3, 5)} ${dev.slice(5)}`; // ليبيا
        else if (dev.startsWith('216')) formattedNumber = `+216 ${dev.slice(3, 5)} ${dev.slice(5)}`; // تونس
        else if (dev.startsWith('213')) formattedNumber = `+213 ${dev.slice(3, 5)} ${dev.slice(5)}`; // الجزائر
        else if (dev.startsWith('212')) formattedNumber = `+212 ${dev.slice(3, 5)} ${dev.slice(5)}`; // المغرب
        else if (dev.startsWith('222')) formattedNumber = `+222 ${dev.slice(3, 5)} ${dev.slice(5)}`; // موريتانيا
        else if (dev.startsWith('249')) formattedNumber = `+249 ${dev.slice(3, 5)} ${dev.slice(5)}`; // السودان
        else if (dev.startsWith('211')) formattedNumber = `+211 ${dev.slice(3, 5)} ${dev.slice(5)}`; // جنوب السودان
        else if (dev.startsWith('252')) formattedNumber = `+252 ${dev.slice(3, 5)} ${dev.slice(5)}`; // الصومال
        else if (dev.startsWith('253')) formattedNumber = `+253 ${dev.slice(3, 5)} ${dev.slice(5)}`; // جيبوتي
        else if (dev.startsWith('269')) formattedNumber = `+269 ${dev.slice(3, 5)} ${dev.slice(5)}`; // جزر القمر
        
        // آسيا
        else if (dev.startsWith('93')) formattedNumber = `+93 ${dev.slice(2, 4)} ${dev.slice(4)}`; // أفغانستان
        else if (dev.startsWith('374')) formattedNumber = `+374 ${dev.slice(3, 5)} ${dev.slice(5)}`; // أرمينيا
        else if (dev.startsWith('994')) formattedNumber = `+994 ${dev.slice(3, 5)} ${dev.slice(5)}`; // أذربيجان
        else if (dev.startsWith('880')) formattedNumber = `+880 ${dev.slice(3, 5)} ${dev.slice(5)}`; // بنغلاديش
        else if (dev.startsWith('975')) formattedNumber = `+975 ${dev.slice(3, 5)} ${dev.slice(5)}`; // بوتان
        else if (dev.startsWith('855')) formattedNumber = `+855 ${dev.slice(3, 5)} ${dev.slice(5)}`; // كمبوديا
        else if (dev.startsWith('86')) formattedNumber = `+86 ${dev.slice(2, 5)} ${dev.slice(5)}`; // الصين
        else if (dev.startsWith('995')) formattedNumber = `+995 ${dev.slice(3, 5)} ${dev.slice(5)}`; // جورجيا
        else if (dev.startsWith('91')) formattedNumber = `+91 ${dev.slice(2, 5)} ${dev.slice(5)}`; // الهند
        else if (dev.startsWith('62')) formattedNumber = `+62 ${dev.slice(2, 5)} ${dev.slice(5)}`; // إندونيسيا
        else if (dev.startsWith('98')) formattedNumber = `+98 ${dev.slice(2, 5)} ${dev.slice(5)}`; // إيران
        else if (dev.startsWith('81')) formattedNumber = `+81 ${dev.slice(2, 4)} ${dev.slice(4)}`; // اليابان
        else if (dev.startsWith('7')) formattedNumber = `+7 ${dev.slice(1, 4)} ${dev.slice(4)}`; // روسيا/كازاخستان
        else if (dev.startsWith('850')) formattedNumber = `+850 ${dev.slice(3, 5)} ${dev.slice(5)}`; // كوريا الشمالية
        else if (dev.startsWith('82')) formattedNumber = `+82 ${dev.slice(2, 4)} ${dev.slice(4)}`; // كوريا الجنوبية
        else if (dev.startsWith('996')) formattedNumber = `+996 ${dev.slice(3, 5)} ${dev.slice(5)}`; // قيرغيزستان
        else if (dev.startsWith('856')) formattedNumber = `+856 ${dev.slice(3, 5)} ${dev.slice(5)}`; // لاوس
        else if (dev.startsWith('60')) formattedNumber = `+60 ${dev.slice(2, 4)} ${dev.slice(4)}`; // ماليزيا
        else if (dev.startsWith('960')) formattedNumber = `+960 ${dev.slice(3, 5)} ${dev.slice(5)}`; // المالديف
        else if (dev.startsWith('976')) formattedNumber = `+976 ${dev.slice(3, 5)} ${dev.slice(5)}`; // منغوليا
        else if (dev.startsWith('95')) formattedNumber = `+95 ${dev.slice(2, 4)} ${dev.slice(4)}`; // ميانمار
        else if (dev.startsWith('977')) formattedNumber = `+977 ${dev.slice(3, 5)} ${dev.slice(5)}`; // نيبال
        else if (dev.startsWith('92')) formattedNumber = `+92 ${dev.slice(2, 5)} ${dev.slice(5)}`; // باكستان
        else if (dev.startsWith('63')) formattedNumber = `+63 ${dev.slice(2, 5)} ${dev.slice(5)}`; // الفلبين
        else if (dev.startsWith('65')) formattedNumber = `+65 ${dev.slice(2, 3)} ${dev.slice(3)}`; // سنغافورة
        else if (dev.startsWith('94')) formattedNumber = `+94 ${dev.slice(2, 4)} ${dev.slice(4)}`; // سريلانكا
        else if (dev.startsWith('886')) formattedNumber = `+886 ${dev.slice(3, 5)} ${dev.slice(5)}`; // تايوان
        else if (dev.startsWith('992')) formattedNumber = `+992 ${dev.slice(3, 5)} ${dev.slice(5)}`; // طاجيكستان
        else if (dev.startsWith('66')) formattedNumber = `+66 ${dev.slice(2, 4)} ${dev.slice(4)}`; // تايلاند
        else if (dev.startsWith('993')) formattedNumber = `+993 ${dev.slice(3, 5)} ${dev.slice(5)}`; // تركمانستان
        else if (dev.startsWith('998')) formattedNumber = `+998 ${dev.slice(3, 5)} ${dev.slice(5)}`; // أوزبكستان
        else if (dev.startsWith('84')) formattedNumber = `+84 ${dev.slice(2, 4)} ${dev.slice(4)}`; // فيتنام
        else if (dev.startsWith('852')) formattedNumber = `+852 ${dev.slice(3, 5)} ${dev.slice(5)}`; // هونغ كونغ
        else if (dev.startsWith('90')) formattedNumber = `+90 ${dev.slice(2, 4)} ${dev.slice(4)}`; // تركيا
        
        // أوروبا
        else if (dev.startsWith('30')) formattedNumber = `+30 ${dev.slice(2, 4)} ${dev.slice(4)}`; // اليونان
        else if (dev.startsWith('31')) formattedNumber = `+31 ${dev.slice(2, 3)} ${dev.slice(3)}`; // هولندا
        else if (dev.startsWith('32')) formattedNumber = `+32 ${dev.slice(2, 3)} ${dev.slice(3)}`; // بلجيكا
        else if (dev.startsWith('33')) formattedNumber = `+33 ${dev.slice(2, 3)} ${dev.slice(3)}`; // فرنسا
        else if (dev.startsWith('34')) formattedNumber = `+34 ${dev.slice(2, 3)} ${dev.slice(3)}`; // إسبانيا
        else if (dev.startsWith('36')) formattedNumber = `+36 ${dev.slice(2, 4)} ${dev.slice(4)}`; // المجر
        else if (dev.startsWith('39')) formattedNumber = `+39 ${dev.slice(2, 3)} ${dev.slice(3)}`; // إيطاليا
        else if (dev.startsWith('40')) formattedNumber = `+40 ${dev.slice(2, 4)} ${dev.slice(4)}`; // رومانيا
        else if (dev.startsWith('41')) formattedNumber = `+41 ${dev.slice(2, 4)} ${dev.slice(4)}`; // سويسرا
        else if (dev.startsWith('43')) formattedNumber = `+43 ${dev.slice(2, 3)} ${dev.slice(3)}`; // النمسا
        else if (dev.startsWith('44')) formattedNumber = `+44 ${dev.slice(2, 5)} ${dev.slice(5)}`; // بريطانيا
        else if (dev.startsWith('45')) formattedNumber = `+45 ${dev.slice(2, 4)} ${dev.slice(4)}`; // الدنمارك
        else if (dev.startsWith('46')) formattedNumber = `+46 ${dev.slice(2, 4)} ${dev.slice(4)}`; // السويد
        else if (dev.startsWith('47')) formattedNumber = `+47 ${dev.slice(2, 3)} ${dev.slice(3)}`; // النرويج
        else if (dev.startsWith('48')) formattedNumber = `+48 ${dev.slice(2, 5)} ${dev.slice(5)}`; // بولندا
        else if (dev.startsWith('49')) formattedNumber = `+49 ${dev.slice(2, 5)} ${dev.slice(5)}`; // ألمانيا
        else if (dev.startsWith('350')) formattedNumber = `+350 ${dev.slice(3, 5)} ${dev.slice(5)}`; // جبل طارق
        else if (dev.startsWith('351')) formattedNumber = `+351 ${dev.slice(3, 5)} ${dev.slice(5)}`; // البرتغال
        else if (dev.startsWith('352')) formattedNumber = `+352 ${dev.slice(3, 4)} ${dev.slice(4)}`; // لوكسمبورغ
        else if (dev.startsWith('353')) formattedNumber = `+353 ${dev.slice(3, 5)} ${dev.slice(5)}`; // أيرلندا
        else if (dev.startsWith('354')) formattedNumber = `+354 ${dev.slice(3, 4)} ${dev.slice(4)}`; // آيسلندا
        else if (dev.startsWith('355')) formattedNumber = `+355 ${dev.slice(3, 5)} ${dev.slice(5)}`; // ألبانيا
        else if (dev.startsWith('356')) formattedNumber = `+356 ${dev.slice(3, 5)} ${dev.slice(5)}`; // مالطا
        else if (dev.startsWith('357')) formattedNumber = `+357 ${dev.slice(3, 5)} ${dev.slice(5)}`; // قبرص
        else if (dev.startsWith('358')) formattedNumber = `+358 ${dev.slice(3, 5)} ${dev.slice(5)}`; // فنلندا
        else if (dev.startsWith('359')) formattedNumber = `+359 ${dev.slice(3, 5)} ${dev.slice(5)}`; // بلغاريا
        else if (dev.startsWith('370')) formattedNumber = `+370 ${dev.slice(3, 5)} ${dev.slice(5)}`; // ليتوانيا
        else if (dev.startsWith('371')) formattedNumber = `+371 ${dev.slice(3, 5)} ${dev.slice(5)}`; // لاتفيا
        else if (dev.startsWith('372')) formattedNumber = `+372 ${dev.slice(3, 5)} ${dev.slice(5)}`; // إستونيا
        else if (dev.startsWith('373')) formattedNumber = `+373 ${dev.slice(3, 5)} ${dev.slice(5)}`; // مولدوفا
        else if (dev.startsWith('374')) formattedNumber = `+374 ${dev.slice(3, 5)} ${dev.slice(5)}`; // أرمينيا
        else if (dev.startsWith('375')) formattedNumber = `+375 ${dev.slice(3, 5)} ${dev.slice(5)}`; // بيلاروسيا
        else if (dev.startsWith('376')) formattedNumber = `+376 ${dev.slice(3, 5)} ${dev.slice(5)}`; // أندورا
        else if (dev.startsWith('377')) formattedNumber = `+377 ${dev.slice(3, 5)} ${dev.slice(5)}`; // موناكو
        else if (dev.startsWith('378')) formattedNumber = `+378 ${dev.slice(3, 5)} ${dev.slice(5)}`; // سان مارينو
        else if (dev.startsWith('379')) formattedNumber = `+379 ${dev.slice(3, 5)} ${dev.slice(5)}`; // الفاتيكان
        else if (dev.startsWith('380')) formattedNumber = `+380 ${dev.slice(3, 5)} ${dev.slice(5)}`; // أوكرانيا
        else if (dev.startsWith('381')) formattedNumber = `+381 ${dev.slice(3, 5)} ${dev.slice(5)}`; // صربيا
        else if (dev.startsWith('382')) formattedNumber = `+382 ${dev.slice(3, 5)} ${dev.slice(5)}`; // الجبل الأسود
        else if (dev.startsWith('383')) formattedNumber = `+383 ${dev.slice(3, 5)} ${dev.slice(5)}`; // كوسوفو
        else if (dev.startsWith('385')) formattedNumber = `+385 ${dev.slice(3, 5)} ${dev.slice(5)}`; // كرواتيا
        else if (dev.startsWith('386')) formattedNumber = `+386 ${dev.slice(3, 5)} ${dev.slice(5)}`; // سلوفينيا
        else if (dev.startsWith('387')) formattedNumber = `+387 ${dev.slice(3, 5)} ${dev.slice(5)}`; // البوسنة
        else if (dev.startsWith('389')) formattedNumber = `+389 ${dev.slice(3, 5)} ${dev.slice(5)}`; // مقدونيا
        else if (dev.startsWith('420')) formattedNumber = `+420 ${dev.slice(3, 5)} ${dev.slice(5)}`; // التشيك
        else if (dev.startsWith('421')) formattedNumber = `+421 ${dev.slice(3, 5)} ${dev.slice(5)}`; // سلوفاكيا
        else if (dev.startsWith('423')) formattedNumber = `+423 ${dev.slice(3, 5)} ${dev.slice(5)}`; // ليختنشتاين
        
        // أمريكا الشمالية
        else if (dev.startsWith('1')) formattedNumber = `+1 ${dev.slice(1, 4)} ${dev.slice(4)}`; // الولايات المتحدة/كندا
        else if (dev.startsWith('52')) formattedNumber = `+52 ${dev.slice(2, 4)} ${dev.slice(4)}`; // المكسيك
        else if (dev.startsWith('53')) formattedNumber = `+53 ${dev.slice(2, 4)} ${dev.slice(4)}`; // كوبا
        else if (dev.startsWith('54')) formattedNumber = `+54 ${dev.slice(2, 4)} ${dev.slice(4)}`; // الأرجنتين
        else if (dev.startsWith('55')) formattedNumber = `+55 ${dev.slice(2, 4)} ${dev.slice(4)}`; // البرازيل
        else if (dev.startsWith('56')) formattedNumber = `+56 ${dev.slice(2, 4)} ${dev.slice(4)}`; // تشيلي
        else if (dev.startsWith('57')) formattedNumber = `+57 ${dev.slice(2, 4)} ${dev.slice(4)}`; // كولومبيا
        else if (dev.startsWith('58')) formattedNumber = `+58 ${dev.slice(2, 4)} ${dev.slice(4)}`; // فنزويلا
        else if (dev.startsWith('500')) formattedNumber = `+500 ${dev.slice(3, 5)} ${dev.slice(5)}`; // جزر فوكلاند
        else if (dev.startsWith('501')) formattedNumber = `+501 ${dev.slice(3, 5)} ${dev.slice(5)}`; // بليز
        else if (dev.startsWith('502')) formattedNumber = `+502 ${dev.slice(3, 5)} ${dev.slice(5)}`; // غواتيمالا
        else if (dev.startsWith('503')) formattedNumber = `+503 ${dev.slice(3, 5)} ${dev.slice(5)}`; // السلفادور
        else if (dev.startsWith('504')) formattedNumber = `+504 ${dev.slice(3, 5)} ${dev.slice(5)}`; // هندوراس
        else if (dev.startsWith('505')) formattedNumber = `+505 ${dev.slice(3, 5)} ${dev.slice(5)}`; // نيكاراغوا
        else if (dev.startsWith('506')) formattedNumber = `+506 ${dev.slice(3, 5)} ${dev.slice(5)}`; // كوستاريكا
        else if (dev.startsWith('507')) formattedNumber = `+507 ${dev.slice(3, 5)} ${dev.slice(5)}`; // بنما
        else if (dev.startsWith('508')) formattedNumber = `+508 ${dev.slice(3, 5)} ${dev.slice(5)}`; // سان بيير
        else if (dev.startsWith('509')) formattedNumber = `+509 ${dev.slice(3, 5)} ${dev.slice(5)}`; // هايتي
        else if (dev.startsWith('590')) formattedNumber = `+590 ${dev.slice(3, 5)} ${dev.slice(5)}`; // غوادلوب
        else if (dev.startsWith('591')) formattedNumber = `+591 ${dev.slice(3, 5)} ${dev.slice(5)}`; // بوليفيا
        else if (dev.startsWith('592')) formattedNumber = `+592 ${dev.slice(3, 5)} ${dev.slice(5)}`; // غيانا
        else if (dev.startsWith('593')) formattedNumber = `+593 ${dev.slice(3, 5)} ${dev.slice(5)}`; // الإكوادور
        else if (dev.startsWith('594')) formattedNumber = `+594 ${dev.slice(3, 5)} ${dev.slice(5)}`; // غويانا الفرنسية
        else if (dev.startsWith('595')) formattedNumber = `+595 ${dev.slice(3, 5)} ${dev.slice(5)}`; // باراغواي
        else if (dev.startsWith('596')) formattedNumber = `+596 ${dev.slice(3, 5)} ${dev.slice(5)}`; // مارتينيك
        else if (dev.startsWith('597')) formattedNumber = `+597 ${dev.slice(3, 5)} ${dev.slice(5)}`; // سورينام
        else if (dev.startsWith('598')) formattedNumber = `+598 ${dev.slice(3, 5)} ${dev.slice(5)}`; // أوروغواي
        else if (dev.startsWith('599')) formattedNumber = `+599 ${dev.slice(3, 5)} ${dev.slice(5)}`; // كوراساو
        
        // أوقيانوسيا
        else if (dev.startsWith('61')) formattedNumber = `+61 ${dev.slice(2, 3)} ${dev.slice(3)}`; // أستراليا
        else if (dev.startsWith('64')) formattedNumber = `+64 ${dev.slice(2, 4)} ${dev.slice(4)}`; // نيوزيلندا
        else if (dev.startsWith('670')) formattedNumber = `+670 ${dev.slice(3, 5)} ${dev.slice(5)}`; // تيمور الشرقية
        else if (dev.startsWith('672')) formattedNumber = `+672 ${dev.slice(3, 5)} ${dev.slice(5)}`; // نورفولك
        else if (dev.startsWith('673')) formattedNumber = `+673 ${dev.slice(3, 5)} ${dev.slice(5)}`; // بروناي
        else if (dev.startsWith('674')) formattedNumber = `+674 ${dev.slice(3, 5)} ${dev.slice(5)}`; // ناورو
        else if (dev.startsWith('675')) formattedNumber = `+675 ${dev.slice(3, 5)} ${dev.slice(5)}`; // بابوا غينيا
        else if (dev.startsWith('676')) formattedNumber = `+676 ${dev.slice(3, 5)} ${dev.slice(5)}`; // تونغا
        else if (dev.startsWith('677')) formattedNumber = `+677 ${dev.slice(3, 5)} ${dev.slice(5)}`; // جزر سليمان
        else if (dev.startsWith('678')) formattedNumber = `+678 ${dev.slice(3, 5)} ${dev.slice(5)}`; // فانواتو
        else if (dev.startsWith('679')) formattedNumber = `+679 ${dev.slice(3, 5)} ${dev.slice(5)}`; // فيجي
        else if (dev.startsWith('680')) formattedNumber = `+680 ${dev.slice(3, 5)} ${dev.slice(5)}`; // بالاو
        else if (dev.startsWith('681')) formattedNumber = `+681 ${dev.slice(3, 5)} ${dev.slice(5)}`; // والس وفوتونا
        else if (dev.startsWith('682')) formattedNumber = `+682 ${dev.slice(3, 5)} ${dev.slice(5)}`; // جزر كوك
        else if (dev.startsWith('683')) formattedNumber = `+683 ${dev.slice(3, 5)} ${dev.slice(5)}`; // نييوي
        else if (dev.startsWith('685')) formattedNumber = `+685 ${dev.slice(3, 5)} ${dev.slice(5)}`; // ساموا
        else if (dev.startsWith('686')) formattedNumber = `+686 ${dev.slice(3, 5)} ${dev.slice(5)}`; // كيريباتي
        else if (dev.startsWith('687')) formattedNumber = `+687 ${dev.slice(3, 5)} ${dev.slice(5)}`; // كاليدونيا
        else if (dev.startsWith('688')) formattedNumber = `+688 ${dev.slice(3, 5)} ${dev.slice(5)}`; // توفالو
        else if (dev.startsWith('689')) formattedNumber = `+689 ${dev.slice(3, 5)} ${dev.slice(5)}`; // بولينيزيا
        else if (dev.startsWith('690')) formattedNumber = `+690 ${dev.slice(3, 5)} ${dev.slice(5)}`; // توكيلاو
        else if (dev.startsWith('691')) formattedNumber = `+691 ${dev.slice(3, 5)} ${dev.slice(5)}`; // ميكرونيزيا
        else if (dev.startsWith('692')) formattedNumber = `+692 ${dev.slice(3, 5)} ${dev.slice(5)}`; // جزر مارشال
        
        // أفريقيا (إضافية)
        else if (dev.startsWith('27')) formattedNumber = `+27 ${dev.slice(2, 4)} ${dev.slice(4)}`; // جنوب أفريقيا
        else if (dev.startsWith('220')) formattedNumber = `+220 ${dev.slice(3, 5)} ${dev.slice(5)}`; // غامبيا
        else if (dev.startsWith('221')) formattedNumber = `+221 ${dev.slice(3, 5)} ${dev.slice(5)}`; // السنغال
        else if (dev.startsWith('223')) formattedNumber = `+223 ${dev.slice(3, 5)} ${dev.slice(5)}`; // مالي
        else if (dev.startsWith('224')) formattedNumber = `+224 ${dev.slice(3, 5)} ${dev.slice(5)}`; // غينيا
        else if (dev.startsWith('225')) formattedNumber = `+225 ${dev.slice(3, 5)} ${dev.slice(5)}`; // ساحل العاج
        else if (dev.startsWith('226')) formattedNumber = `+226 ${dev.slice(3, 5)} ${dev.slice(5)}`; // بوركينا فاسو
        else if (dev.startsWith('227')) formattedNumber = `+227 ${dev.slice(3, 5)} ${dev.slice(5)}`; // النيجر
        else if (dev.startsWith('228')) formattedNumber = `+228 ${dev.slice(3, 5)} ${dev.slice(5)}`; // توجو
        else if (dev.startsWith('229')) formattedNumber = `+229 ${dev.slice(3, 5)} ${dev.slice(5)}`; // بنين
        else if (dev.startsWith('230')) formattedNumber = `+230 ${dev.slice(3, 5)} ${dev.slice(5)}`; // موريشيوس
        else if (dev.startsWith('231')) formattedNumber = `+231 ${dev.slice(3, 5)} ${dev.slice(5)}`; // ليبيريا
        else if (dev.startsWith('232')) formattedNumber = `+232 ${dev.slice(3, 5)} ${dev.slice(5)}`; // سيراليون
        else if (dev.startsWith('233')) formattedNumber = `+233 ${dev.slice(3, 5)} ${dev.slice(5)}`; // غانا
        else if (dev.startsWith('234')) formattedNumber = `+234 ${dev.slice(3, 5)} ${dev.slice(5)}`; // نيجيريا
        else if (dev.startsWith('235')) formattedNumber = `+235 ${dev.slice(3, 5)} ${dev.slice(5)}`; // تشاد
        else if (dev.startsWith('236')) formattedNumber = `+236 ${dev.slice(3, 5)} ${dev.slice(5)}`; // أفريقيا الوسطى
        else if (dev.startsWith('237')) formattedNumber = `+237 ${dev.slice(3, 5)} ${dev.slice(5)}`; // الكاميرون
        else if (dev.startsWith('238')) formattedNumber = `+238 ${dev.slice(3, 5)} ${dev.slice(5)}`; // الرأس الأخضر
        else if (dev.startsWith('239')) formattedNumber = `+239 ${dev.slice(3, 5)} ${dev.slice(5)}`; // ساو تومي
        else if (dev.startsWith('240')) formattedNumber = `+240 ${dev.slice(3, 5)} ${dev.slice(5)}`; // غينيا الاستوائية
        else if (dev.startsWith('241')) formattedNumber = `+241 ${dev.slice(3, 5)} ${dev.slice(5)}`; // الغابون
        else if (dev.startsWith('242')) formattedNumber = `+242 ${dev.slice(3, 5)} ${dev.slice(5)}`; // الكونغو
        else if (dev.startsWith('243')) formattedNumber = `+243 ${dev.slice(3, 5)} ${dev.slice(5)}`; // الكونغو الديمقراطية
        else if (dev.startsWith('244')) formattedNumber = `+244 ${dev.slice(3, 5)} ${dev.slice(5)}`; // أنغولا
        else if (dev.startsWith('245')) formattedNumber = `+245 ${dev.slice(3, 5)} ${dev.slice(5)}`; // غينيا بيساو
        else if (dev.startsWith('246')) formattedNumber = `+246 ${dev.slice(3, 5)} ${dev.slice(5)}`; // إقليم المحيط الهندي
        else if (dev.startsWith('247')) formattedNumber = `+247 ${dev.slice(3, 5)} ${dev.slice(5)}`; // جزيرة أسينشين
        else if (dev.startsWith('248')) formattedNumber = `+248 ${dev.slice(3, 5)} ${dev.slice(5)}`; // سيشل
        else if (dev.startsWith('250')) formattedNumber = `+250 ${dev.slice(3, 5)} ${dev.slice(5)}`; // رواندا
        else if (dev.startsWith('251')) formattedNumber = `+251 ${dev.slice(3, 5)} ${dev.slice(5)}`; // إثيوبيا
        else if (dev.startsWith('254')) formattedNumber = `+254 ${dev.slice(3, 5)} ${dev.slice(5)}`; // كينيا
        else if (dev.startsWith('255')) formattedNumber = `+255 ${dev.slice(3, 5)} ${dev.slice(5)}`; // تنزانيا
        else if (dev.startsWith('256')) formattedNumber = `+256 ${dev.slice(3, 5)} ${dev.slice(5)}`; // أوغندا
        else if (dev.startsWith('257')) formattedNumber = `+257 ${dev.slice(3, 5)} ${dev.slice(5)}`; // بوروندي
        else if (dev.startsWith('258')) formattedNumber = `+258 ${dev.slice(3, 5)} ${dev.slice(5)}`; // موزمبيق
        else if (dev.startsWith('260')) formattedNumber = `+260 ${dev.slice(3, 5)} ${dev.slice(5)}`; // زامبيا
        else if (dev.startsWith('261')) formattedNumber = `+261 ${dev.slice(3, 5)} ${dev.slice(5)}`; // مدغشقر
        else if (dev.startsWith('262')) formattedNumber = `+262 ${dev.slice(3, 5)} ${dev.slice(5)}`; // ريونين/مايوت
        else if (dev.startsWith('263')) formattedNumber = `+263 ${dev.slice(3, 5)} ${dev.slice(5)}`; // زيمبابوي
        else if (dev.startsWith('264')) formattedNumber = `+264 ${dev.slice(3, 5)} ${dev.slice(5)}`; // ناميبيا
        else if (dev.startsWith('265')) formattedNumber = `+265 ${dev.slice(3, 5)} ${dev.slice(5)}`; // مالاوي
        else if (dev.startsWith('266')) formattedNumber = `+266 ${dev.slice(3, 5)} ${dev.slice(5)}`; // ليسوتو
        else if (dev.startsWith('267')) formattedNumber = `+267 ${dev.slice(3, 5)} ${dev.slice(5)}`; // بوتسوانا
        else if (dev.startsWith('268')) formattedNumber = `+268 ${dev.slice(3, 5)} ${dev.slice(5)}`; // إسواتيني
        else if (dev.startsWith('290')) formattedNumber = `+290 ${dev.slice(3, 5)} ${dev.slice(5)}`; // سانت هيلينا
        else if (dev.startsWith('291')) formattedNumber = `+291 ${dev.slice(3, 5)} ${dev.slice(5)}`; // إريتريا
        
        else {
            // إذا ما عرفنا البلد، نعرض الرقم عادي
            formattedNumber = `+${dev}`;
        }

        devList += `*${index + 1}.* ${formattedNumber}\n`;
    });

    const response = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*👑 قـائـمـة الـمـطـوريـن*
*───━━━⊱  📋  ⊰━━━───*


${devList}


*📊 عـدد الـمـطوࢪيـن:* ⦓ *${developers.length}* ⦔

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

    return reply(response.trim());
}

case "اضف": {
    const targetId = quotedSender || (mentionedJid.length > 0 ? mentionedJid[0] : null);
    if (!targetId) {
        return reply('*⚠️ يـجـب عـلـيـك الـرد عـلى رسـالـة شـخـص أو عـمـل مـنـشـن لـه*');
    }

    const userInfo = await getRealIdsFromMetadata(targetId);
    if (!userInfo) {
        return reply('*❌ لـم أتـمـكـن مـن الـعـثـور عـلى مـعـلـومـات هـذا الـمـسـتـخـدم فـي الـمـجـمـوعـة*');
    }

    const config = await readConfig();
    if (!config) return reply('*❌ حـدث خـطأ أثـنـاء قـراءة الإعـدادات*');

    const { jid, lid } = userInfo;
    const idsToAdd = [jid, lid].filter(Boolean);

    if (idsToAdd.some(id => config.DEVELOPERS.includes(id))) {
        return reply('*✅ هـذا الـمـسـتـخـدم مـطـور بـالـفـعـل*');
    }

    config.DEVELOPERS.push(...idsToAdd);

    const success = await writeConfig(config);
    if (success) {
        const successMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*✅ تـم إضـافـة مـطـور جـديـد*
*───━━━⊱  👑  ⊰━━━───*

*👤 الـمـطـوࢪ الـجـديـد:* ⦓ *@${jid.split('@')[0]}* ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*🔢 مـعـلـومـات الـتـخـزيـن:*

*┌─────────────────┐*
│ *JID:* \`${jid}\`
${lid ? `│ *LID:* \`${lid}\`` : ''}
*└─────────────────┘*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📊 إجـمـالـي الـمـطـوريـن:* ⦓ *${config.DEVELOPERS.filter(j => j.endsWith('@s.whatsapp.net')).length}* ⦔

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

        reply(successMsg, { mentions: [targetId] });
    } else {
        reply('*❌ فـشـلـت عـمـلـيـة تـحـديـث مـلـف الإعـدادات*');
    }
    break;
}

            case "حذف": {
                const config = await readConfig();
                if (!config) return reply('*❌ حـدث خـطأ أثـنـاء قـراءة الإعـدادات*');

                let targetId;
                const developers = config.DEVELOPERS.filter(j => j.endsWith('@s.whatsapp.net'));
                const textArg = args[1];

                if (quotedSender || mentionedJid.length > 0) {
                    targetId = quotedSender || mentionedJid[0];
                } else if (textArg && !isNaN(textArg)) {
                    const index = parseInt(textArg, 10) - 1;
                    if (index >= 0 && index < developers.length) {
                        targetId = developers[index];
                    } else {
                        return reply('*❌ الـرقـم الـذي أدخـلـتـه غـيـر صـالـح*');
                    }
                } else {
                    return reply('*⚠️ لـلـحـذف، قـم بـالـرد، أو عـمـل مـنـشـن، أو اكـتـب رقـم الـمـطـور مـن الـقـائـمـة*');
                }

                if (!targetId) return reply('*❌ لـم أتـمـكـن مـن تـحـديـد الـمـسـتـخـدم*');
                
                const userInfo = await getRealIdsFromMetadata(targetId);
                if (!userInfo) {
                    return reply('*❌ لـم أتـمـكـن مـن الـعـثـور عـلى مـعـلـومـات هـذا الـمـسـتـخـدم فـي الـمـجـمـوعـة*');
                }

                const { jid: jidToDelete, lid: lidToDelete } = userInfo;
                const idsToDelete = [jidToDelete, lidToDelete].filter(Boolean);

                if (!idsToDelete.some(id => config.DEVELOPERS.includes(id))) {
                    return reply('*ℹ️ هـذا الـمـسـتـخـدم لـيـس مـطـوراً أصـلاً*');
                }

                config.DEVELOPERS = config.DEVELOPERS.filter(dev => !idsToDelete.includes(dev));
                
                const success = await writeConfig(config);
                if (success) {
                    const deleteMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*🗑️ تـم حـذف مـطـور*
*───━━━⊱  ❌  ⊰━━━───*

*👤 الـمـطـور الـمـحـذوف:* ⦓ *@${jidToDelete.split('@')[0]}* ⦔

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

                    reply(deleteMsg, { mentions: [targetId] });
                } else {
                    reply('*❌ فـشـلـت عـمـلـيـة تـحـديـث مـلـف الإعـدادات*');
                }
                break;
            }

            default:
                reply(`*❌ الأمـر الـفـرعـي "${subCommand}" غـيـر مـعـروف*\n*📝 اكـتـب* *.مطور* *لـعـرض قـائـمـة الـمـسـاعـدة*`);
                break;
        }
    }
};