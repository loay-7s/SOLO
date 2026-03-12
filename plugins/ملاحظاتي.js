import fs from 'fs-extra';

export default {
    name: "ملاحظاتي",
    aliases: ["ملاحظة", "notes"],
    description: "تخزين وعرض وإدارة ملاحظاتك الشخصية",
    category: "tools",
    group: true,

    async run({ bot, message, args, isGroup, userJid, reply, react }) {
        const jid = message.key.remoteJid;
        const notesPath = './data/notes.json';

        if (!isGroup) {
            return reply("*❌ هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        // قراءة ملف الملاحظات
        let notesDB = fs.readJsonSync(notesPath, { throws: false }) || {};
        
        // التأكد من وجود مصفوفة ملاحظات للمستخدم
        if (!notesDB[userJid]) {
            notesDB[userJid] = [];
        }

        const subCommand = args[0]?.toLowerCase();

        // عرض المساعدة
        if (!subCommand) {
            const helpMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*📝 نـظـام الـمـلاحـظـات*

*───━━━⊱  📋  ⊰━━━───*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📌 الأوامـر الـمـتـوفـرة:*

*🔹*.ملاحظاتي عرض* - *لـعـرض جـمـيـع مـلاحـظـاتـك*

*🔹*.ملاحظاتي اضافة [النص]* - *لإضـافـة مـلاحـظـة جـديـدة*

*🔹*.ملاحظاتي حذف [الرقم]* - *لـحـذف مـلاحـظـة مـعـيـنـة*

*🔹*.ملاحظاتي مسح* - *لـمـسـح جـمـيـع الـمـلاحـظـات*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📝 أمـثـلـة:*
*.ملاحظاتي اضافة اشتري حليب*
*.ملاحظاتي عرض*
*.ملاحظاتي حذف 2*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            return reply(helpMsg);
        }

        await react("📝");

        // عرض الملاحظات
        if (subCommand === "عرض" || subCommand === "list") {
            const notes = notesDB[userJid];
            
            if (!notes || notes.length === 0) {
                return reply("*📭 لـيـس لـديـك أي مـلاحـظـات بـعـد*");
            }

            let notesList = '';
            notes.forEach((note, index) => {
                const date = new Date(note.date).toLocaleDateString('ar-EG');
                notesList += `*${index + 1}.* ${note.text}\n   └─ 📅 ${date}\n\n`;
            });

            const notesMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*📝 مـلاحـظـاتـك*

*───━━━⊱  📋  ⊰━━━───*

*👤 الـمـسـتـخـدم:* ⦓ *@${userJid.split('@')[0]}* ⦔

*📊 الـعـدد:* ⦓ *${notes.length}* ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

${notesList}

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            return reply(notesMsg);
        }

        // إضافة ملاحظة جديدة
        if (subCommand === "اضافة" || subCommand === "add") {
            const noteText = args.slice(1).join(" ").trim();
            
            if (!noteText) {
                return reply("*⚠️ يـجـب كـتـابـة نـص الـمـلاحـظـة*\n*مـثـال:* `.ملاحظاتي اضافة اشتري حليب`");
            }

            if (noteText.length > 200) {
                return reply("*⚠️ الـمـلاحـظـة طـويـلـة جـداً (الـحـد الأقـصـى 200 حـرف)*");
            }

            notesDB[userJid].push({
                text: noteText,
                date: Date.now()
            });

            fs.writeJsonSync(notesPath, notesDB, { spaces: 2 });

            const addMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*✅ تـم إضـافـة الـمـلاحـظـة*

*───━━━⊱  📝  ⊰━━━───*

*📋 الـنـص:* 
${noteText}

*📊 عـدد الـمـلاحـظـات:* ⦓ *${notesDB[userJid].length}* ⦔

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            return reply(addMsg);
        }

        // حذف ملاحظة محددة
        if (subCommand === "حذف" || subCommand === "delete") {
            const noteIndex = parseInt(args[1]) - 1;
            
            if (isNaN(noteIndex)) {
                return reply("*⚠️ يـجـب إدخـال رقـم الـمـلاحـظـة*\n*مـثـال:* `.ملاحظاتي حذف 2`");
            }

            const notes = notesDB[userJid];
            
            if (!notes || noteIndex < 0 || noteIndex >= notes.length) {
                return reply("*❌ رقـم مـلاحـظـة غـيـر صـحـيـح*");
            }

            const deletedNote = notes[noteIndex];
            notes.splice(noteIndex, 1);
            
            fs.writeJsonSync(notesPath, notesDB, { spaces: 2 });

            const deleteMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🗑️ تـم حـذف الـمـلاحـظـة*

*───━━━⊱  ✅  ⊰━━━───*

*📋 الـنـص الـمـحـذوف:* 
${deletedNote.text}

*📊 الـعـدد الـمـتـبـقـي:* ⦓ *${notes.length}* ⦔

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            return reply(deleteMsg);
        }

        // مسح جميع الملاحظات
        if (subCommand === "مسح" || subCommand === "clear") {
            notesDB[userJid] = [];
            fs.writeJsonSync(notesPath, notesDB, { spaces: 2 });

            const clearMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🧹 تـم مـسـح جـمـيـع الـمـلاحـظـات*

*───━━━⊱  ✅  ⊰━━━───*

*📊 الـعـدد الـحـالـي:* ⦓ *0* ⦔

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            return reply(clearMsg);
        }

        // أمر غير معروف
        return reply("*⚠️ أمـر غـيـر مـعـروف*\n*اكـتـب* `.ملاحظاتي` *لـعـرض الـمـسـاعـدة*");
    }
};