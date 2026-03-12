import fs from 'fs/promises';
import path from 'path';

// المسار الكامل لملف الكونفج
const configPath = path.resolve(process.cwd(), 'config.js');

// دالة لقراءة وكتابة الكونفج
async function updateConfigMode(newMode) {
    try {
        let fileContent = await fs.readFile(configPath, 'utf8');
        
        // استخدام تعبير نمطي (Regex) لتحديث قيمة MODE
        const updatedContent = fileContent.replace(
            /MODE\s*:\s*['"](public|private)['"]/,
            `MODE: "${newMode}"`
        );

        if (updatedContent === fileContent) {
            console.log("لم يتم العثور على سطر MODE");
            return false;
        }

        await fs.writeFile(configPath, updatedContent, 'utf8');
        return true;
    } catch (error) {
        console.error('❌ خطأ في تحديث ملف الكونفج:', error);
        return false;
    }
}

export default {
    name: "mode",
    description: "تغيير وضع البوت (عام/مطورين) وحفظه بشكل دائم.",
    aliases: ["وضع", "مود"],
    category: "developer",
    developer: true,
    
    async run({ bot, m, args, reply }) {
        const currentMode = bot.config.MODE === 'private' ? '*🔒 الـمـطـوريـن فـقـط*' : '*🌍 الـوضـع الـعـام*';

        if (args.length === 0) {
            const helpMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*⚙️ الـوضـع الـحـالـي*
*───━━━⊱  📊  ⊰━━━───*

*📋 الـوضـع:* ⦓ ${currentMode} ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📝 الأوامـر الـمـتـوفـرة:*

*🔹* \`${bot.config.PREFIX}mode on\` - *لـتـفـعـيـل وضـع الـمـطـوريـن فـقـط*

*🔹* \`${bot.config.PREFIX}mode off\` - *لـتـفـعـيـل الـوضـع الـعـام لـلـجـمـيـع*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            return reply(helpMsg);
        }

        const requestedMode = args[0].toLowerCase();
        let newModeValue = null;
        let successMsg = '';

        if (requestedMode === 'on' || requestedMode === 'private') {
            if (bot.config.MODE === 'private') {
                return reply('*✅ وضـع الـمـطـوريـن مـفـعـل بـالـفـعـل*');
            }
            newModeValue = 'private';
            successMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*🔒 تـم تـفـعـيـل وضـع الـمـطـوريـن*
*───━━━⊱  ✅  ⊰━━━───*

*📋 الـوضـع الـجـديـد:* ⦓ *مـطـوريـن فـقـط* ⦔

*✅ الـبـوت الآن يـسـتـجـيـب لـلـمـطـوريـن فـقـط*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;
        } else if (requestedMode === 'off' || requestedMode === 'public') {
            if (bot.config.MODE === 'public') {
                return reply('*✅ الـوضـع الـعـام مـفـعـل بـالـفـعـل*');
            }
            newModeValue = 'public';
            successMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*🌍 تـم تـفـعـيـل الـوضـع الـعـام*
*───━━━⊱  ✅  ⊰━━━───*

*📋 الـوضـع الـجـديـد:* ⦓ *الـوضـع الـعـام* ⦔

*✅ الـبـوت الآن يـسـتـجـيـب لـلـجـمـيـع*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;
        } else {
            return reply(`*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*❌ اسـتـخـدام خـاطـئ*
*───━━━⊱  ⚠️  ⊰━━━───*

*📝 الـطـريـقـة الـصـحـيـحـة:*

*•* \`${bot.config.PREFIX}mode on\` - *وضـع الـمـطـوريـن*

*•* \`${bot.config.PREFIX}mode off\` - *الـوضـع الـعـام*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`);
        }

        // تحديث الكونفج في الذاكرة المؤقتة أولاً
        bot.config.MODE = newModeValue;

        // تحديث الملف الفعلي
        const success = await updateConfigMode(newModeValue);

        if (success) {
            await reply(successMsg);
        } else {
            // إذا فشل الحفظ، تراجع عن التغيير في الذاكرة
            bot.config.MODE = currentMode.includes('العام') ? 'public' : 'private';
            await reply(`*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*❌ فـشـل تـحـديـث الـمـلـف*

*───━━━⊱  ⚠️  ⊰━━━───*

*📋 لـم يـتـم حـفـظ الـتـغـيـيـر*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`);
        }
    }
};