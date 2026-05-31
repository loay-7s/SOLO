export default {
    name: "حوم",
    aliases: ["rock", "paper", "scissors"],
    description: "لعبة حجرة ورقة مقص ضد البوت ✊✋✌️",
    category: "game",
    developer: false,
    group: false,
    private: false,

    async run({ bot, message, args, reply, react }) {
        const jid = message.key.remoteJid;
        const userChoice = args[0]?.toLowerCase();

        // خيارات اللعبة
        const choices = {
            حجر: { name: "🗻 حجر", beats: "مقص", emoji: "✊" },
            ورقة: { name: "📄 ورقة", beats: "حجر", emoji: "✋" },
            مقص: { name: "✂️ مقص", beats: "ورقة", emoji: "✌️" }
        };

        const validChoices = ["حجر", "ورقة", "مقص", "حج", "ورق", "قص"];

        // التحقق من الاختيار
        let finalChoice = null;
        if (args[0]) {
            if (args[0] === "حجر" || args[0] === "حج") finalChoice = "حجر";
            else if (args[0] === "ورقة" || args[0] === "ورق") finalChoice = "ورقة";
            else if (args[0] === "مقص") finalChoice = "مقص";
        }

        if (!finalChoice) {
            await react("🎮");
            return reply(`*╭─━━━━━━━━━━━━━━━─╮*
*│ 🎮 لـعـبـة حـجـرة ورقـة مـقـص 🎮*
*╰─━━━━━━━━━━━━━━━─╯*

*📝 اختر واحدة:*
*│ ✊ .حوم حجر*
*│ ✋ .حوم ورقة*
*│ ✌️ .حوم مقص*

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*𝑺𝑶𝑳𝑶 𝑩𝑶𝑻*~`);
        }

        await react("🤔");

        // اختيار البوت العشوائي
        const botChoices = ["حجر", "ورقة", "مقص"];
        const botChoice = botChoices[Math.floor(Math.random() * 3)];
        const botEmoji = choices[botChoice].emoji;

        // تحديد الفائز
        let result = "";
        let resultEmoji = "";
        let resultColor = "";

        if (finalChoice === botChoice) {
            result = "🤝 *تـعـادل* 🤝";
            resultEmoji = "🤝";
        } 
        else if (choices[finalChoice].beats === botChoice) {
            result = "🏆 *فـزت يـا بـطـل!* 🎉";
            resultEmoji = "🏆";
        } 
        else {
            result = "💀 *خـسـرت يـا خـسـارة!* 😈";
            resultEmoji = "💀";
        }

        // رسالة النتيجة
        const resultMsg = `*╭─━━━━━━━━━━━━━━━─╮*
*│ 🎮 لـعـبـة حـجـرة ورقـة مـقـص 🎮*
*╰─━━━━━━━━━━━━━━━─╯*

*│ اخـتـيـاࢪك: ${choices[finalChoice].emoji} ${choices[finalChoice].name}*

*│  اخـتـيـاࢪ الـبـوت: ${botEmoji} ${choices[botChoice].name}*

*├━━━━━━━━━━━━━━━┫*

*│ ${resultEmoji} ${result}*

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*𝑩𝒀 𝑺𝑶𝑳𝑶 𝑩𝑶𝑻 🥀*~`;

        await bot.sendMessage(jid, { text: resultMsg }, { quoted: message });

        // تفاعل حسب النتيجة
        if (resultEmoji === "🏆") await react("🎉");
        else if (resultEmoji === "💀") await react("😈");
        else await react("🤝");
    }
};