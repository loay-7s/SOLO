import fs from 'fs-extra';

export default {
    name: "تبادل",
    aliases: ["تحويل_طاقة", "كيمياء"],
    category: "mythology",

    async run({ sock, m, userJid, args }) {
        const chatId = m.key.remoteJid;
        const soulsPath = './data/souls.json';
        const bankPath = './data/bank.json';

        try {
            const senderId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let soulsDB = fs.readJsonSync(soulsPath, { throws: false }) || {};
            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};
            const senderSoul = soulsDB[senderId];
            const now = Date.now();

            // ⭐ فحص الصلاحية (الكيميائي الأصلي أو الأثير المستحوذ)
            const isAlchemist = senderSoul?.name.includes("الكيميائي");
            const isEtherWithAlchemist = senderSoul?.name.includes("الأثير") && 
                                        senderSoul?.copiedAbility?.includes("الكيميائي") && 
                                        now < senderSoul?.copyExpiry;

            if (!senderSoul || (!isAlchemist && !isEtherWithAlchemist)) {
                return await sock.sendMessage(chatId, { text: "*⚠️ هـذا الأمـر يـتـطـلـب مـعـرفـة بـأسرار الـكـيـمـيـاء.. وحـده [ الـكـيـمـيـائـي 🧪 ] مـن يـسـتـطـيـع تـحـويـل الـطـاقـة لـمـال!*" }, { quoted: m });
            }

            // فحص التجميد (القفل الجليدي)
            if (senderSoul.isFrozen && now < senderSoul.freezeExpiry) {
                const minutesLeft = Math.ceil((senderSoul.freezeExpiry - now) / (60 * 1000));
                await sock.sendMessage(chatId, { react: { text: "🧊", key: m.key } });
                return await sock.sendMessage(chatId, { 
                    text: `*｢ 🧊 ｣ روحـك مـتـجـمـدة ومـسـلـوبـة الـقـوة..*\n\n*⚠️ لـا يـمـكـنـك تـفـعـيـل الـكـيـمـيـاء الـآن.. انـتـظـر ⦓ ${minutesLeft} ⦔ دقـيـقـة لـيـذوب الـجـلـيـد.*` 
                }, { quoted: m });
            }

            // 2. التحقق من المدخلات
            const amountXP = parseInt(args[0]);
            if (isNaN(amountXP) || amountXP <= 0) {
                return await sock.sendMessage(chatId, { text: "*🧪 يـرجـى تـحـديـد كـمـيـة الـ XP الـتـي تـريـد تـحـويـلـهـا..*\n*مثال: .تبادل 10*" }, { quoted: m });
            }

            if (senderSoul.xp < amountXP) {
                return await sock.sendMessage(chatId, { text: `*❌ لـا تـمـلـك طـاقـة كـافـيـة.. رصـيـدك الـحـالـي: ⦓ ${senderSoul.xp} ⦔ XP*` }, { quoted: m });
            }

            // 3. عملية التبادل
            const coinsGained = amountXP * 3;
            senderSoul.xp -= amountXP;

            if (!bankDB[senderId]) bankDB[senderId] = { money: 0 };
            bankDB[senderId].money = (bankDB[senderId].money || 0) + coinsGained;

            // حفظ البيانات
            fs.writeJsonSync(soulsPath, soulsDB, { spaces: 2 });
            fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });

            const masterId = senderId.split('@')[0];
            await sock.sendMessage(chatId, { react: { text: "🧪", key: m.key } });

            // بناء الاستمارة بنصوصك الأصلية
            const exchangeTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*
*🧪┇ تـحـويـل كـيـمـيـائـي مـالـي ┇🧪*
*⎔┄┄─── ⊱╎⌯ ⚗️ ⌯╎⊰ ───┄┄⎔*

*👤 الـكـيـمـيـائـي : ⦓ @${masterId} ⦔*

*📉 الـمُـقـايـضـة : ⦓ ${amountXP} ⦔ نـقـاط XP*
*📈 الـنـاتـج الـبـنـكـي : ⦓ ${coinsGained} ⦔ عـمـلـة*

*⎔┄┄─── ⊱╎⌯ 🛡️ ⌯╎⊰ ───┄┄⎔*

*📊 طـاقـتـك الـمـتـبـقـيـة : ⦓ ${senderSoul.xp} ⦔ XP*
*💰 رصـيـدك فـي الـبـنـك : ⦓ ${bankDB[senderId].money} ⦔ عـمـلـة*

*⎔┄┄─── ⊱╎⌯ 🏮 ⌯╎⊰ ───┄┄⎔*

*💠 " كـمـا تـتـحـول الـمـعـادن إلـى ذهـب، تـتـحـول طـاقـتـك الآن إلـى ثـروة فـي بـنـك الـظـلـال! "*

~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

            return await sock.sendMessage(chatId, { 
                text: exchangeTemplate, 
                mentions: [senderId] 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(chatId, { text: "*❌ فـشـلـت الـتـجـربـة.. تـأكـد مـن صـحـة مـلـفـات الـبـيـانـات.*" });
        }
    }
};