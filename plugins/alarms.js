import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

const alarmsPath = path.join(process.cwd(), 'data', 'alarms.json');

export async function loadSavedAlarms(sock) {
    try {
        if (!await fs.pathExists(alarmsPath)) return;
        
        const alarms = await fs.readJson(alarmsPath);
        const now = Date.now();
        let loaded = 0;
        
        for (const [id, alarm] of Object.entries(alarms)) {
            const delay = alarm.time - now;
            
            if (delay <= 0) {
                // وقت المنبه فات، نرسله فوراً
                await sendAlarmNow(id, alarm.chatId, alarm.sender, alarm.message, alarm.quotedKey, sock);
                loaded++;
            } else {
                // نضبط مؤقت جديد
                setTimeout(async () => {
                    await sendAlarmNow(id, alarm.chatId, alarm.sender, alarm.message, alarm.quotedKey, sock);
                }, delay);
                loaded++;
            }
        }
        
        console.log(chalk.green(`✅ Loaded ${loaded} saved alarms`));
    } catch (error) {
        console.error(chalk.red('❌ Error loading saved alarms:'), error.message);
    }
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

        // حذف المنبه من الملف بعد إرساله
        const alarms = await fs.readJson(alarmsPath);
        delete alarms[alarmId];
        await fs.writeJson(alarmsPath, alarms, { spaces: 2 });

    } catch (error) {
        console.error('❌ Error sending alarm:', error.message);
    }
}