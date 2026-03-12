import fs from 'fs-extra';
import os from 'os';
import { performance } from 'perf_hooks';

export default {
    name: "احصائيات_البوت",
    aliases: ["stats", "botstats", "حالة_البوت"],
    description: "عرض إحصائيات متقدمة عن البوت",
    developer: true,

    async run({ sock, m, reply, handler }) {
        const chatId = m.key.remoteJid;
        const startTime = performance.now();
        
        try {
            await sock.sendMessage(chatId, { react: { text: "📊", key: m.key } });

            // 1. إحصائيات الأوامر الشاملة
            const commands = handler?.getAllCommands?.() || [];
            const commandsByCategory = {};
            const commandsByPlugin = {};
            let totalCommandsRun = 0;
            let totalCommandsRegistered = commands.length;
            
            commands.forEach(cmd => {
                const cat = cmd.category || 'general';
                if (!commandsByCategory[cat]) commandsByCategory[cat] = 0;
                commandsByCategory[cat]++;
                
                const plugin = cmd.plugin || 'unknown';
                if (!commandsByPlugin[plugin]) commandsByPlugin[plugin] = 0;
                commandsByPlugin[plugin]++;
                
                totalCommandsRun += cmd.usageCount || 0;
            });

            // 2. أكثر الأوامر استخداماً
            const topCommands = handler?.getCommandUsage?.() || [];

            // 3. إحصائيات النظام المتقدمة
            const uptime = process.uptime();
            const uptimeDays = Math.floor(uptime / 86400);
            const uptimeHours = Math.floor((uptime % 86400) / 3600);
            const uptimeMinutes = Math.floor((uptime % 3600) / 60);
            const uptimeSeconds = Math.floor(uptime % 60);
            const uptimeTotalHours = (uptime / 3600).toFixed(2);

            // الذاكرة التفصيلية
            const memory = process.memoryUsage();
            const memoryRSS = (memory.rss / 1024 / 1024).toFixed(2);
            const memoryHeapTotal = (memory.heapTotal / 1024 / 1024).toFixed(2);
            const memoryHeapUsed = (memory.heapUsed / 1024 / 1024).toFixed(2);
            const memoryExternal = (memory.external / 1024 / 1024).toFixed(2);
            const memoryArrayBuffers = (memory.arrayBuffers / 1024 / 1024).toFixed(2);
            const memoryHeapPercent = ((memory.heapUsed / memory.heapTotal) * 100).toFixed(1);
            const memoryTotalPercent = ((memory.rss / os.totalmem()) * 100).toFixed(1);

            // المعالج التفصيلي
            const cpus = os.cpus();
            const cpuCores = cpus.length;
            const cpuModel = cpus[0]?.model || 'غير معروف';
            const cpuSpeed = cpus[0]?.speed || 0;
            
            const loadAvg1 = os.loadavg()[0]?.toFixed(2) || '0.00';
            const loadAvg5 = os.loadavg()[1]?.toFixed(2) || '0.00';
            const loadAvg15 = os.loadavg()[2]?.toFixed(2) || '0.00';

            // معلومات النظام الشاملة
            const platform = os.platform();
            const arch = os.arch();
            const hostname = os.hostname();
            const osType = os.type();
            const osRelease = os.release();
            const osVersion = os.version ? os.version() : 'غير معروف';
            const osUptime = os.uptime();
            const osUptimeDays = Math.floor(osUptime / 86400);
            const osUptimeHours = Math.floor((osUptime % 86400) / 3600);
            
            // معلومات الذاكرة الكلية
            const totalMemoryGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
            const freeMemoryGB = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
            const usedMemoryGB = (totalMemoryGB - freeMemoryGB).toFixed(2);
            const memoryPercentSystem = ((1 - os.freemem() / os.totalmem()) * 100).toFixed(1);

            // معلومات الشبكة
            const networkInterfaces = os.networkInterfaces();
            let ipAddresses = [];
            Object.values(networkInterfaces).forEach(iface => {
                iface.forEach(addr => {
                    if (addr.family === 'IPv4' && !addr.internal) {
                        ipAddresses.push(addr.address);
                    }
                });
            });

            // 4. إحصائيات المجموعات المتقدمة
            const groupsData = await sock.groupFetchAllParticipating();
            const groups = Object.entries(groupsData);
            const totalGroups = groups.length;
            
            let totalMembers = 0;
            let totalAdmins = 0;
            let totalSuperAdmins = 0;
            let groupsBySize = { small: 0, medium: 0, large: 0, huge: 0 };
            let oldestGroup = null;
            let oldestGroupDate = Infinity;
            let newestGroup = null;
            let newestGroupDate = 0;
            let totalGroupMessages = 0;
            
            groups.forEach(([id, g]) => {
                const participants = g.participants || [];
                const memberCount = participants.length;
                totalMembers += memberCount;
                
                // تصنيف المجموعات حسب الحجم
                if (memberCount < 50) groupsBySize.small++;
                else if (memberCount < 200) groupsBySize.medium++;
                else if (memberCount < 500) groupsBySize.large++;
                else groupsBySize.huge++;
                
                // المشرفين والمالكين
                totalAdmins += participants.filter(p => p.admin === 'admin').length;
                totalSuperAdmins += participants.filter(p => p.admin === 'superadmin').length;
                
                // أقدم وأحدث مجموعة
                if (g.creation && g.creation < oldestGroupDate) {
                    oldestGroupDate = g.creation;
                    oldestGroup = { name: g.subject, id, date: g.creation };
                }
                if (g.creation && g.creation > newestGroupDate) {
                    newestGroupDate = g.creation;
                    newestGroup = { name: g.subject, id, date: g.creation };
                }
                
                totalGroupMessages += g.announce ? 1 : 0;
            });

            const avgMembers = totalGroups > 0 ? Math.round(totalMembers / totalGroups) : 0;

            // 5. إحصائيات الملفات المتقدمة
            const dataDir = './data';
            let dataFiles = 0;
            let dataSize = 0;
            let fileTypes = {};
            let largestFile = { name: '', size: 0 };
            let oldestFile = { name: '', time: Infinity };
            let newestFile = { name: '', time: 0 };
            let fileCreationTimes = [];

            if (fs.existsSync(dataDir)) {
                const files = fs.readdirSync(dataDir);
                dataFiles = files.length;
                
                files.forEach(file => {
                    const filePath = `${dataDir}/${file}`;
                    const stat = fs.statSync(filePath);
                    dataSize += stat.size;
                    
                    // أكبر ملف
                    if (stat.size > largestFile.size) {
                        largestFile = { name: file, size: stat.size };
                    }
                    
                    // أقدم ملف
                    if (stat.birthtimeMs < oldestFile.time) {
                        oldestFile = { name: file, time: stat.birthtimeMs };
                    }
                    
                    // أحدث ملف
                    if (stat.mtimeMs > newestFile.time) {
                        newestFile = { name: file, time: stat.mtimeMs };
                    }
                    
                    fileCreationTimes.push(stat.birthtimeMs);
                    
                    const ext = file.split('.').pop() || 'noext';
                    fileTypes[ext] = (fileTypes[ext] || 0) + 1;
                });
            }
            
            const dataSizeMB = (dataSize / 1024 / 1024).toFixed(2);
            const dataSizeKB = (dataSize / 1024).toFixed(2);
            const dataSizeGB = (dataSize / 1024 / 1024 / 1024).toFixed(4);
            
            // متوسط عمر الملفات
            const avgFileAge = fileCreationTimes.length > 0 
                ? Math.floor((Date.now() - (fileCreationTimes.reduce((a, b) => a + b, 0) / fileCreationTimes.length)) / (1000 * 60 * 60 * 24))
                : 0;

            // 6. سرعة البوت
            const endTime = performance.now();
            const responseTime = (endTime - startTime).toFixed(2);

            // 7. إحصائيات البوت الشاملة
            const botJid = sock.user?.id || 'غير معروف';
            const botNumber = botJid.split('@')[0];
            const botName = sock.user?.name || 'SOLO BOT';
            
            // وقت بدء التشغيل
            const now = new Date();
            const startDate = new Date(handler?.stats?.startTime || Date.now());
            const daysRunning = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
            const startTimeFormatted = startDate.toLocaleString('ar-EG');
            
            // إحصائيات الجلسة
            const sessionDir = './session';
            let sessionFiles = 0;
            let sessionSize = 0;
            if (fs.existsSync(sessionDir)) {
                const files = fs.readdirSync(sessionDir);
                sessionFiles = files.length;
                files.forEach(file => {
                    const stat = fs.statSync(`${sessionDir}/${file}`);
                    sessionSize += stat.size;
                });
            }
            const sessionSizeMB = (sessionSize / 1024 / 1024).toFixed(2);

            // 8. معلومات الإصدارات
            const nodeVer = process.version;
            const platformVer = `${platform} ${arch}`;

            // 9. إحصائيات إضافية
            const messageCount = handler?.stats?.messagesProcessed || 0;
            const errorCount = handler?.stats?.errors || 0;
            const successRate = messageCount > 0 ? (((messageCount - errorCount) / messageCount) * 100).toFixed(1) : '100';

            // ✅ بناء الاستمارة النهائية (الأشمل)
            let statsMsg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

   *⌬ إحـصـائـيـات الـبـوت الـشـامـلـة ⌬*

*───━━━⊱  📊  ⊰━━━───*

*⌠⚡⌡ سـرعـة الـبـوت*
*┌─────────────────────────────────┐*
*│ وقـت الـتـجـاويـب : ⦓ ${responseTime} ms ⦔*

*│ نـسـبـة الـنـجـاح : ⦓ ${successRate}% ⦔*

*│ عـدد الـرسـائـل : ⦓ ${messageCount.toLocaleString()} ⦔*

*│ الأخطـاء : ⦓ ${errorCount} ⦔*
*└─────────────────────────────────┘*

*⌠🤖⌡ مـعـلـومـات الـبـوت*
*┌─────────────────────────────────┐*
*│ الاسـم : ⦓ ${botName} ⦔*

*│ الـرقـم : ⦓ ${botNumber} ⦔*

*│ تـاريـخ الـتـشـغـيـل : ⦓ ${startTimeFormatted} ⦔*

*│ مـدة الـتـشـغـيـل : ⦓ ${uptimeDays}ي ${uptimeHours}س ${uptimeMinutes}د ${uptimeSeconds}ث ⦔*

*│ إجـمـالـي سـاعـات : ⦓ ${uptimeTotalHours} سـاعـة ⦔*

*│ أيـام الـتـشـغـيـل : ⦓ ${daysRunning} يـوم ⦔*

*│ الأوامـر الـمـسـجـلـة : ⦓ ${totalCommandsRegistered} ⦔*

*│ الأوامـر الـمـنـفـذة : ⦓ ${totalCommandsRun.toLocaleString()} ⦔*

*│ مـتـوسـط يـومـي : ⦓ ${totalCommandsRun > 0 ? (totalCommandsRun / (daysRunning || 1)).toFixed(1) : 0} ⦔*
*└─────────────────────────────────┘*

*⌠💻⌡ مـعـلـومـات الـسـيـرفـر*
*┌─────────────────────────────────┐*
*│ الـمـعـالـج : ⦓ ${cpuModel.substring(0, 30)}... ⦔*

*│ الأنـويـة : ⦓ ${cpuCores} ⦔*

*│ سـرعـة الـمـعـالـج : ⦓ ${cpuSpeed} MHz ⦔*

*│ CPU Load (1/5/15) : ⦓ ${loadAvg1}/${loadAvg5}/${loadAvg15} ⦔*
*│*

*│ الـذاكـرة التفصيلية (MB):*

*│   • RSS : ⦓ ${memoryRSS} ⦔*

*│   • Heap Total : ⦓ ${memoryHeapTotal} ⦔*

*│   • Heap Used : ⦓ ${memoryHeapUsed} (${memoryHeapPercent}%) ⦔*

*│   • External : ⦓ ${memoryExternal} ⦔*

*│   • Array Buffers : ⦓ ${memoryArrayBuffers} ⦔*

*│   • مـن RAM : ⦓ ${memoryTotalPercent}% ⦔*
*│*

*│ الـنـظـام : ⦓ ${osType} ⦔*

*│ الإصـدار : ⦓ ${osRelease} ⦔*

*│ الـمـضـيـف : ⦓ ${hostname} ⦔*

*│ IP : ⦓ ${ipAddresses[0] || 'غير معروف'} ⦔*
*│*

*│ RAM الـكـلـي : ⦓ ${totalMemoryGB} GB ⦔*

*│ RAM الـمـسـتـخـدم : ⦓ ${usedMemoryGB} GB (${memoryPercentSystem}%) ⦔*

*│ RAM الـمـتـبـقـي : ⦓ ${freeMemoryGB} GB ⦔*

*│ وقـت تـشـغـيـل OS : ⦓ ${osUptimeDays}ي ${osUptimeHours}س ⦔*
*└─────────────────────────────────┘*

*⌠👥⌡ إحـصـائـيـات الـمـجـمـوعـات*
*┌─────────────────────────────────┐*
*│ عـدد الـمـجـمـوعـات : ⦓ ${totalGroups} ⦔*

*│ إجـمـالـي الأعـضـاء : ⦓ ${totalMembers.toLocaleString()} ⦔*

*│ مـتـوسـط الأعـضـاء : ⦓ ${avgMembers} ⦔*

*│ عـدد الـمـشـرفـيـن : ⦓ ${totalAdmins} ⦔*

*│ عـدد المـالـكـيـن : ⦓ ${totalSuperAdmins} ⦔*

*│*

*│   • صـغـيرة (<50) : ⦓ ${groupsBySize.small} ⦔*

*│   • مـتـوسـطة (<200) : ⦓ ${groupsBySize.medium} ⦔*

*│   • كـبـيرة (<500) : ⦓ ${groupsBySize.large} ⦔*

*│   • عـمـلاقة (500+) : ⦓ ${groupsBySize.huge} ⦔*`;

            if (oldestGroup) {
                const oldestDate = new Date(oldestGroup.date * 1000).toLocaleDateString('ar-EG');
                statsMsg += `\n*│*
*│ أقـدم مـجـمـوعـة : ⦓ ${oldestGroup.name} ⦔*
*│   • تـاريـخ : ⦓ ${oldestDate} ⦔*`;
            }
            
            if (newestGroup) {
                const newestDate = new Date(newestGroup.date * 1000).toLocaleDateString('ar-EG');
                statsMsg += `\n*│*
*│ أحـدث مـجـمـوعـة : ⦓ ${newestGroup.name} ⦔*
*│   • تـاريـخ : ⦓ ${newestDate} ⦔*`;
            }

            statsMsg += `\n*└─────────────────────────────────┘*

*⌠📁⌡ إحـصـائـيـات الـمـلـفـات*
*┌─────────────────────────────────┐*
*│ عـدد مـلـفـات الـبـيـانـات : ⦓ ${dataFiles} ⦔*

*│ حـجـم الـبـيـانـات : ⦓ ${dataSizeMB} MB ⦔*
*⦓ (${dataSizeKB} KB) ⦔*

*│ بـالـجـيـجـابـايت : ⦓ ${dataSizeGB} GB ⦔*`;

            if (largestFile.name) {
                const largestSize = (largestFile.size / 1024 / 1024).toFixed(2);
                statsMsg += `\n*│*
*│ أكـبـر مـلـف : ⦓ ${largestFile.name} (${largestSize} MB) ⦔*`;
            }

            if (Object.keys(fileTypes).length > 0) {
                statsMsg += `\n*│*
*│ أنـواع الـمـلـفـات :*`;
                const sortedTypes = Object.entries(fileTypes).sort((a, b) => b[1] - a[1]).slice(0, 5);
                sortedTypes.forEach(([ext, count]) => {
                    statsMsg += `\n*│   • ${ext} : ⦓ ${count} ⦔*`;
                });
            }
            
            statsMsg += `\n*│*
*│ مـتـوسـط عـمـر الـمـلـفـات : ⦓ ${avgFileAge} يـوم ⦔*`;

            statsMsg += `\n*└─────────────────────────────────┘*

*⌠🔐⌡ مـعـلـومـات الـجـلـسـة*
*┌─────────────────────────────────┐*
*│ عـدد مـلـفـات الـجـلـسـة : ⦓ ${sessionFiles} ⦔*

*│ حـجـم الـجـلـسـة : ⦓ ${sessionSizeMB} MB ⦔*
*└─────────────────────────────────┘*

*⌠📦⌡ مـعـلـومـات الإصـدارات*
*┌─────────────────────────────────┐*
*│ NODE JS : ⦓ ${nodeVer} ⦔*

*│ الـمـنـصـة : ⦓ ${platformVer} ⦔*
*└─────────────────────────────────┘*

*⌠📊⌡ تـصـنـيـف الأوامـر*
*┌─────────────────────────────────┐*`;

            for (const [cat, count] of Object.entries(commandsByCategory)) {
                const catName = cat === 'general' ? 'عـام' : 
                               cat === 'admin' ? 'مـشـرفـيـن' :
                               cat === 'economy' ? 'اقـتـصـاد' :
                               cat === 'mythology' ? 'أسـاطـيـر' :
                               cat === 'utility' ? 'أدوات' : cat;
                statsMsg += `\n*│ ${catName} : ⦓ ${count} ⦔*`;
            }

            statsMsg += `\n*└─────────────────────────────────┘*`;

            if (topCommands.length > 0) {
                statsMsg += `
*⌠🏆⌡ أكـثـر 10 أوامـر اسـتـخـدامـاً*
*┌─────────────────────────────────┐*`;
                topCommands.slice(0, 10).forEach((cmd, i) => {
                    const percent = totalCommandsRun > 0 ? ((cmd.usageCount / totalCommandsRun) * 100).toFixed(1) : '0';
                    statsMsg += `\n*│ ${i+1}. ${cmd.name} : ⦓ ${cmd.usageCount} (${percent}%) ⦔*`;
                });
                statsMsg += `\n*└─────────────────────────────────┘*`;
            }

            statsMsg += `
*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;

            await sock.sendMessage(chatId, { 
                text: statsMsg
            }, { quoted: m });

        } catch (error) {
            console.error("Error in 'احصائيات_البوت' command:", error);
            await reply(`❌ *حدث خطأ:*\n${error.message}`);
        }
    }
};