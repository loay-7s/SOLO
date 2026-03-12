// ملف: plugins/اعادة_تشغيل.js

export default {
    name: "اعادة_تشغيل",
    aliases: ["restart"],
    description: "إعادة تحميل جميع أنظمة البوت والاتصال (إعادة تشغيل ناعمة).",
    category: "المطور",
        
    // الصلاحيات: للمطور فقط
    developer: true,

    async run({ reply, bot }) {
        try {
            await reply("🔄 جارٍ إعادة تحميل الأنظمة والاتصال...");

            // استدعاء دالة softRestart الجديدة
            await bot.softRestart();

            // لا حاجة لإرسال رسالة نجاح هنا، لأن البوت سيعيد الاتصال
            // ويمكن أن يرسل رسالة "متصل" بنفسه.

        } catch (error) {
            console.error("Error in soft restart command:", error);
            await reply(`❌ حدث خطأ أثناء إعادة التشغيل الناعمة: ${error.message}`);
        }
    }
};