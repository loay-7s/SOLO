export default {
    name: "صور",
    aliases: ["pexels", "image"],
    category: "تحميل",

    async run({ sock, m, userJid, args }) {
        const chatId = m.key.remoteJid;
        
        if (!args.length) {
            await sock.sendMessage(chatId, { 
                text: "🖼️ *أمر الصور - Pexels*\n\n*ملاحظة:* هذا الأمر يجيب صور للطبيعة والأشياء الواقعية فقط (ليس للأنمي)\n\n*الاستخدام:*\n.صور [كلمة البحث]\n.صور [عدد] [كلمة البحث]\n\n*مثال:*\n.صور 3 غروب شمس\n.صور جبال\n.صور 5 ورود" 
            });
            return;
        }

        // تحليل المدخلات
        let limit = 3;
        let searchQuery = args.join(' ');
        
        if (!isNaN(args[0]) && args[0] > 0 && args[0] <= 5) {
            limit = parseInt(args[0]);
            searchQuery = args.slice(1).join(' ');
        }

        if (!searchQuery) {
            await sock.sendMessage(chatId, { text: "❌ *اكتب اسم الصور المطلوبة*\nمثال: .صور غروب شمس" });
            return;
        }

        // تفاعل
        await sock.sendMessage(chatId, { react: { text: "🖼️", key: m.key } });

        try {
            // رسالة الانتظار
            await sock.sendMessage(chatId, { 
                text: `🔍 *جاري البحث عن ${limit} صور لـ:*\n"${searchQuery}"` 
            });

            // استخدام Pexels API
            const apiKey = "Bcyh7UbOglGf7PFxZL2IeF5DpDj7Tzf85SLN1jMWGLVz6cQAhvv0vkov";
            const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=${limit}`;
            
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': apiKey
                }
            });
            
            const data = await response.json();
            const photos = data.photos || [];

            if (!photos.length) {
                await sock.sendMessage(chatId, { 
                    text: "❌ *لا توجد نتائج لهذا البحث*\nجرب كلمات أخرى" 
                });
                return;
            }

            // إرسال عدد الصور
            await sock.sendMessage(chatId, { 
                text: `✅ *تم العثور على ${photos.length} صورة*\n📤 *جاري الإرسال...*` 
            });

            // إرسال الصور
            for (let i = 0; i < photos.length; i++) {
                try {
                    const photo = photos[i];
                    const imageUrl = photo.src.medium || photo.src.large;
                    
                    // تحميل الصورة
                    const imgResponse = await fetch(imageUrl);
                    const buffer = await imgResponse.arrayBuffer();
                    
                    // إرسال مع كابشن
                    await sock.sendMessage(chatId, { 
                        image: Buffer.from(buffer),
                        caption: `🖼️ *${i + 1}/${photos.length}*\n📸 *تصوير:* ${photo.photographer}\n🌍 *مصدر:* Pexels`
                    });
                    
                    // انتظار قصير بين الصور
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (imgError) {
                    console.log(`❌ فشل إرسال الصورة ${i + 1}`);
                }
            }

            // رسالة النجاح
            await sock.sendMessage(chatId, { 
                text: `✨ *تم إرسال ${photos.length} صور بنجاح*\n👤 @${userJid.split('@')[0]}\n🌄 *جميع الصور من Pexels (صور طبيعية)*`,
                mentions: [userJid]
            });

            await sock.sendMessage(chatId, { react: { text: "✅", key: m.key } });

        } catch (error) {
            console.log("❌ Pexels Error:", error.message);
            await sock.sendMessage(chatId, { 
                text: "❌ *حدث خطأ في جلب الصور*\nحاول مرة أخرى لاحقاً" 
            });
        }
    }
};