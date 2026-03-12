import ms from 'ms';
import fs from 'fs-extra';
import path from 'path';

const alarmsPath = path.join(process.cwd(), 'data', 'alarms.json');

export default {
    name: "منبه",
    aliases: ["تنبيه", "ذكرني", "remind"],
    category: "utility",

    async run({ sock, m, text, args, handler }) {
        const chatId = m.key.remoteJid;
        const sender = m.sender || m.key.participant || "";
        const senderId = sender ? sender.split('@')[0] : "User";

        // التحقق من المدخلات
        if (!text || !args[0]) {
            const helpMsg = `
*╭─━━━  𝐒𝐎𝐋𝐎 𝐑𝐄𝐌𝐈𝐍𝐃  ━━━─╮*
*│ ◈ طـريـقـة اسـتـخدام المـنبه: ◈*
*│*
*│ ⏳ لضبط منبه جديد:*
*│ ⦓ .منبه + الوقت + الرسالة ⦔*
*│*
*│ 💡 مـثال:*
*│ ⦓ .منبه 10m وقت المذاكرة ⦔*
*│*
*│ 🕒 الوحدات المتاحة:*
*│ (s) ثانية | (m) دقيقة | (h) ساعة*
*╰─━━━━━━━━━━━━━━━━━━─╯*`.trim();
            return await sock.sendMessage(chatId, { text: helpMsg }, { quoted: m });
        }

        const duration = args[0];
        const message = args.slice(1).join(' ');

        if (!message) return await sock.sendMessage(chatId, { text: "*⚠️ يرجى كتابة نص التذكير بعد الوقت.*" }, { quoted: m });

        try {
            const timeInMs = ms(duration);
            if (!timeInMs) return await sock.sendMessage(chatId, { text: "*❌ تنسيق الوقت غير صحيح (مثال: 30s, 10m, 1h)*" }, { quoted: m });

            const alarmTime = Date.now() + timeInMs;
            const alarmId = `alarm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

            // رسالة التأكيد
            await sock.sendMessage(chatId, { react: { text: "⏰", key: m.key } });
            const confirmMsg = `
*╭─━━━━━━  𝐒𝐎𝐋𝐎  ━━━━━━─╮*
*│ ✅ تم ضبط المنبه بنجاح !*
*│*
*│ 📝 المهمة: ${message}*
*│ ⏳ بعد: ${duration}*
*│ 🆔 المعرف: ${alarmId.slice(0, 8)}*
*╰─━━━━━━━━━━━━━━━━━━─╯*`.trim();
            await sock.sendMessage(chatId, { text: confirmMsg, mentions: [sender] }, { quoted: m });

            // حفظ المنبه في ملف JSON
            const alarms = await loadAlarms();
            alarms[alarmId] = {
                id: alarmId,
                chatId: chatId,
                sender: sender,
                message: message,
                time: alarmTime,
                createdAt: Date.now()
            };
            await saveAlarms(alarms);

            // ضبط المؤقت
            scheduleAlarm(alarmId, alarmTime, chatId, sender, message, m.key, sock);

        } catch (e) {
            console.error('❌ Alarm error:', e);
            return await sock.sendMessage(chatId, { text: "*❌ حدث خطأ غير متوقع.*" }, { quoted: m });
        }
    }
};

// ========== دوال مساعدة للتعامل مع الملفات ==========

async function loadAlarms() {
    try {
        await fs.ensureDir(path.dirname(alarmsPath));
        if (await fs.pathExists(alarmsPath)) {
            return await fs.readJson(alarmsPath);
        }
        return {};
    } catch (error) {
        console.error('❌ Error loading alarms:', error);
        return {};
    }
}

async function saveAlarms(alarms) {
    try {
        await fs.writeJson(alarmsPath, alarms, { spaces: 2 });
        return true;
    } catch (error) {
        console.error('❌ Error saving alarms:', error);
        return false;
    }
}

// دالة جدولة المنبه
function scheduleAlarm(alarmId, alarmTime, chatId, sender, message, quotedKey, sock) {
    const now = Date.now();
    const delay = alarmTime - now;

    if (delay <= 0) {
        // إذا كان الوقت قد فات، نرسل فوراً
        sendAlarmNow(alarmId, chatId, sender, message, quotedKey, sock);
        return;
    }

    setTimeout(async () => {
        await sendAlarmNow(alarmId, chatId, sender, message, quotedKey, sock);
    }, delay);
}

async function sendAlarmNow(alarmId, chatId, sender, message, quotedKey, sock) {
    try {
        const senderId = sender.split('@')[0];
        const alarmMsg = `
*╭─━━━━  𝐒𝐎𝐋𝐎 𝐀𝐋𝐀𝐑𝐌  ━━━━─╮*
*│ ⏰ حـان الـوقـت يـا : ⦓ @${senderId} ⦔*
*│*
*│ 📌 تذكيرك: ⦓ ${message} ⦔*
*╰─━━━━━━━━━━━━━━━━━━─╯*`.trim();

        await sock.sendMessage(chatId, { 
            text: alarmMsg, 
            mentions: [sender] 
        });

        await sock.sendMessage(chatId, { react: { text: "🔔", key: quotedKey } });

        // حذف المنبه من الملف بعد إرساله
        const alarms = await loadAlarms();
        delete alarms[alarmId];
        await saveAlarms(alarms);

    } catch (error) {
        console.error('❌ Error sending alarm:', error);
    }
}