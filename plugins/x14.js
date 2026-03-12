import fs from 'fs-extra';

export default {
    name: "المتجر",
    aliases: ["متجر", "السوق", "شراء"],
    category: "economy",

    async run({ sock, m, text, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';

        try {
            await sock.sendMessage(chatId, { react: { text: "🏪", key: m.key } });

            const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};

            if (!bankDB[cleanId]) bankDB[cleanId] = { money: 0, rank: "عضو مكافح 🌱", inventory: [] };
            if (!bankDB[cleanId].inventory) bankDB[cleanId].inventory = [];
            let userData = bankDB[cleanId];

            const storeItems = [
                { id: 1, name: "عابر سبيل 👣", price: 200 },
                { id: 2, name: "هاوي قتالات 🥊", price: 400 },
                { id: 3, name: "مغامر ناشئ 🎒", price: 600 },
                { id: 4, name: "صائد عملات 🪙", price: 800 },
                { id: 5, name: "مرتزق مأجور 🔫", price: 1000 },
                { id: 6, name: "قائد عصابة 🐺", price: 1200 },
                { id: 7, name: "منفذ غامض 🕶️", price: 1400 },
                { id: 8, name: "تاجر سوق سوداء 📦", price: 1600 },
                { id: 9, name: "زعيم المحطة 🚉", price: 1800 },
                { id: 10, name: "بطل الظلال 🌑", price: 2000 },
                { id: 11, name: "قنبلة التصفير 💣", price: 2000 },
                { id: 12, name: "حقنة الحظ 💉", price: 3000 },
                { id: 13, name: "درع الكيفلار 🛡️", price: 3000 },
                { id: 14, name: "الخزنة الحديدية 🗄️", price: 20000 },
                { id: 15, name: "شراب الطاقة ⚡", price: 2000 },
                { id: 16, name: "جهاز التشويش 📡", price: 3500 },
                { id: 17, name: "فيروس التشفير 🦠", price: 4000 },
                { id: 18, name: "صندوق الحظ الأسود 📦", price: 4000 },
                { id: 19, name: "رادار التعقب 🔍", price: 3500 },
                { id: 20, name: "مجمع التعدين ⛏️", price: 15000 },
                { id: 21, name: "بطاقة التاجر 💳", price: 13000 },
                { id: 22, name: "عقد الرعاية 🤝", price: 6000 }
            ];

            const args = text.trim().split(/\s+/);
            const choice = parseInt(args[0]);

            if (!choice || isNaN(choice)) {
                const formattedMoney = (userData.money || 0).toLocaleString('en-US');
                let menu = `*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 🇱 𝐎 ⌯╎⊰─┄┄⎔*\n\n*★┇ سـوق الـنـخـبـة الـإمـبـراطـوري 💎 ┇★*\n\n*⎔┄┄─── ⊱╎⌯ 🛒 ⌯╎⊰ ───┄┄⎔*\n\n*❑ الـألـقـاب والـرتب الـرسمـيـة ↯*\n`;
                
                for (let i = 0; i < 10; i++) {
                    menu += `*║ ${storeItems[i].id.toString().padStart(2, '0')} ❯ ${storeItems[i].name} ⦓ ${storeItems[i].price} ⦔*\n`;
                }
                menu += `*┛── 💡 للتبديل بين ألقابك المملوكة: .تبديل*\n`;

                menu += `\n*⎔┄┄─── ⊱╎⌯ 🌑 ⌯⦎ الـتـرسـانـة الـإجـرامـيـة ⦎ ⌯ ⊰ ───┄┄⎔*\n\n`;
                menu += `*║ 11 ❯ قـنـبـلـة الـتـصـفـيـر 💣 ⦓ 2000 ⦔*\n*┛── ℹ️ تـحـذف رتـبـة الـخـصـم وتـعـيـده (عـضـو مـكـافـح).* \n*💡 الـتـفـعـيـل : .قنبلة (بـالـرد)*\n\n`;
                menu += `*║ 12 ❯ حـقـنـة الـحـظ 💉 ⦓ 3000 ⦔*\n*┛── ℹ️ تـرفـع نـسـبـة نـجـاح الـرهـان والـقـمـار إلـى 70%.*\n*💡 الـتـفـعـيـل : تـفـعـيـل تـلـقـائـي عـنـد الـرهـان.*\n\n`;
                menu += `*║ 13 ❯ درع الـكيـفـلار 🛡️ ⦓ 3000 ⦔*\n*┛── ℹ️ تـصـدي تـلـقـائـي لـمـحـاولات الـسـرقـة ونـفـاد الـدرع.*\n*💡 الـتـفـع_يـل : حـمـايـة تـلـقـائـيـة صـامـتـة.*\n\n`;
                menu += `*║ 14 ❯ الـخـزنـة الـحـديـديـة 🗄️ ⦓ 20000 ⦔*\n*┛── ℹ️ تـأمـيـن 10,000 عـمـلـة مـن رصـيـدك ضـد الـسـرقـة.*\n*💡 الـتـفـعـيـل : دائـمـة بـمـجـرد الـشـراء.*\n\n`;
                menu += `*║ 15 ❯ شـراب الـطـاقـة ⚡ ⦓ 2000 ⦔*\n*┛── ℹ️ إلـغـاء وقـت انـتـظـار الـسـرقـة والـراتـب فـوراً.*\n*💡 الـتـفـعـيـل : .اشرب*\n\n`;
                menu += `*║ 16 ❯ جـهـاز الـتـشـويـش 📡 ⦓ 3500 ⦔*\n*┛── ℹ️ تـعـطـيـل حـقـيـبـة وسـرقـة الخـصـم لـمـدة 6 سـاعـات.*\n*💡 الـتـفـعـيـل : .تشويش (بـالـرد)*\n\n`;
                menu += `*║ 17 ❯ فـيـروس الـتـشـفـيـر 🦠 ⦓ 4000 ⦔*\n*┛── ℹ️ تـشـفـيـر رصـيـد الخـصـم و ࢪفـع نـسـبـة فـشـلـه فـي الـسـࢪقـة لـلـضـعـف يـعـمـل لـمـدة 24 ساعةـ.*\n*💡 الـتـفـعـيـل : .فيروس (بـالـرد)*\n\n`;
                menu += `*║ 18 ❯ صـنـدوق الحـظ 📦 ⦓ 4000 ⦔*\n*┛── ℹ️ سـرقـة 15% مـن ثـري عـشـوائـي أو خـسـارة 10%.*\n*💡 الـتـفـعـيـل : .حظ*\n\n`;
                menu += `*║ 19 ❯ رادار الـتـعـقـب 🔍 ⦓ 3500 ⦔*\n*┛── ℹ️ كـشـف قـائـمـة بـأغـنـى 5 حـيـتـان فـي الـمـجـمـوعـة.*\n*💡 الـتـفـعـيـل : .رادار*\n\n`;

                menu += `*⎔┄┄─── ⊱╎⌯ 💰 ⌯⦎ حـقـيـبـة الـإسـتـثـمـار ⦎ ⌯ ⊰ ───┄┄⎔*\n\n`;
                menu += `*║ 20 ❯ مـجـمـع الـتـعـديـن ⛏️ ⦓ 15000 ⦔*\n*┛── ℹ️ إنـتـاج 250 عـمـلـة تـلـقـائـيـاً كـل 4 سـاعـات.*\n*💡 الـتـفـعـيـل : .تعدين*\n\n`;
                menu += `*║ 21 ❯ بـطـاقـة الـتـاجـر 💳 ⦓ 13000 ⦔*\n*┛── ℹ️ خـصـم دائـم 15% عـلـى جـمـيـع مـشـتـريات الـمـتـجـر.*\n*💡 الـتـفـعـيـل : تـعـمـل تـلـقـائـيـاً عـنـد الـشـراء.*\n\n`;
                menu += `*║ 22 ❯ عـقـد الـرعـايـة 🤝 ⦓ 6000 ⦔*\n*┛── ℹ️ مـضـاعـفـة الـراتـب الـيـومـي (x2) بـشـكـل دائـم.*\n*💡 الـتـفـعـيـل : مـدمـج مـع أمـر .راتب.*\n\n`;
                
                menu += `*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*\n\n*💰 رصـيـدك : ⦓ ${formattedMoney} 🪙 ⦔*\n*🛍️ لـلـشـراء أرسـل : .المتجر + رقـم الـسـلـعـة*\n\n*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`;
                return await sock.sendMessage(chatId, { text: menu }, { quoted: m });
            }

            const selected = storeItems.find(i => i.id === choice);
            if (!selected) return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *عـذراً، هـذا الـرقـم غـيـر مـوجـود!*" });
            
            let finalPrice = selected.price;
            if (userData.inventory.includes("بطاقة التاجر 💳") && choice !== 21) {
                finalPrice = Math.floor(selected.price * 0.85);
            }

            if (userData.money < finalPrice) return await sock.sendMessage(chatId, { text: `｢ ❌ ｣ *رصـيـدك لـا يـكـفـي لـشـراء [ ${selected.name} ]*` });
            
            if (userData.inventory.includes(selected.name)) {
                return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *أنـت تـمـلـك هـذا الـغـرض بـالـفـعـل فـي حـقـيـبـتـك!*" });
            }

            userData.money -= finalPrice;
            userData.inventory.push(selected.name);
            
            bankDB[cleanId] = userData;
            fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });

            await sock.sendMessage(chatId, { react: { text: "✅", key: m.key } });

            const invoiceTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 🇱 𝐎 ⌯╎⊰─┄┄⎔*
*★┇ فـاتـورة مـشـتـريـات الـنـخـبـة 🛍️ ┇★*
*⎔┄┄─── ⊱╎⌯ 🏷️ ⌯╎⊰ ───┄┄⎔*
*❑ تـمـت عـمـلـيـة الـشـراء بـنـجـاح ↯*

*👤 الـمـشـتـري : ⦓ @${userJid.split('@')[0]} ⦔*

*🛒 الـسـلـعـة : ⦓ ${selected.name} ⦔*

*💰 الـثـمـن : ⦓ ${finalPrice.toLocaleString()} 🪙 ⦔*
*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*
*🏦 الـرصـيـد الـمـتـبـقـي : ⦓ ${userData.money.toLocaleString()} 🪙 ⦔*

*📦 حـالـة الـمـخـزن : تـم إيـداع الـغـرض بـنـجـاح*
*💡 ملحوظة: إذا كانت السلعة لقب يمكنك التبديل بين القابك التي اشتريتها عن طريق الأمر .تبديل*
*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            return await sock.sendMessage(chatId, { text: invoiceTemplate, mentions: [userJid] }, { quoted: m });

        } catch (e) { console.error(e); }
    }
};