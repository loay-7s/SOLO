import fs from 'fs-extra';

export class MessageSystem {
    constructor(bot) {
        this.bot = bot;
        this.messageCount = 0;
        this.errorLog = []; // تخزين آخر 50 خطأ فقط (بدون console)
        
        // بدء أنظمة السرعة
        this.startSpeedSystems();
    }

    async handleMessage(m) {
        try {
            const message = m.messages[0];
            if (!message || !message.message || message.key.fromMe) return;

            const userJid = message.key.participant || message.key.remoteJid;
            const groupJid = message.key.remoteJid;

            // ✅ نظام الكتم (بصمت تام)
            if (groupJid.endsWith('@g.us')) {
                const mutePath = './data/muted.json';
                if (fs.existsSync(mutePath)) {
                    try {
                        const mutedDB = fs.readJsonSync(mutePath, { throws: false }) || {};
                        const muteKey = `${groupJid}_${userJid}`;
                        
                        if (mutedDB[muteKey]) {
                            // محاولة المسح بصمت
                            try {
                                await this.bot.sock.sendMessage(groupJid, {
                                    delete: {
                                        remoteJid: groupJid,
                                        fromMe: false,
                                        id: message.key.id,
                                        participant: userJid
                                    }
                                });
                            } catch (e) {
                                // صمت تام
                            }
                            return; // منع معالجة الرسالة
                        }
                    } catch (e) {
                        // صمت تام
                    }
                }
            }

            this.messageCount++;
            
            // ✅ تحديث آخر نشاط للمستخدم (بدون console)
            try {
                const userDataPath = './data/users.json';
                let userDB = fs.readJsonSync(userDataPath, { throws: false }) || {};
                if (!userDB[userJid]) {
                    userDB[userJid] = { messages: 0, lastSeen: Date.now() };
                }
                userDB[userJid].messages = (userDB[userJid].messages || 0) + 1;
                userDB[userJid].lastSeen = Date.now();
                // حفظ مرة كل 10 رسائل عشان نقلل الكتابة
                if (this.messageCount % 10 === 0) {
                    fs.writeJsonSync(userDataPath, userDB, { spaces: 2 });
                }
            } catch (e) {
                this.logError('User data update', e);
            }

            // معالجة الأوامر
            await this.bot.handler.handleMessage(message);

        } catch (error) {
            this.logError('handleMessage', error);
        }
    }

    // ✅ تسجيل الأخطاء بدون console (في ملف محدود)
    logError(place, error) {
        this.errorLog.push({
            place,
            message: error.message,
            time: Date.now()
        });
        // احتفظ بآخر 50 خطأ بس
        if (this.errorLog.length > 50) {
            this.errorLog = this.errorLog.slice(-50);
        }
        // حفظ الأخطاء مرة كل 10 أخطاء
        if (this.errorLog.length % 10 === 0) {
            try {
                fs.writeJsonSync('./data/errors.json', this.errorLog, { spaces: 2 });
            } catch (e) {
                // صمت تام
            }
        }
    }

    isMediaMessage(message) {
        const msg = message.message;
        return !!(
            msg.imageMessage ||
            msg.videoMessage ||
            msg.audioMessage ||
            msg.documentMessage ||
            msg.stickerMessage
        );
    }

    async handleMediaMessage(message) {
        // سرعة قصوى - صمت تام
        try {
            const msg = message.message;
            if (msg.imageMessage || msg.videoMessage || msg.audioMessage) {
                // تحديث إحصائيات الوسائط (بدون console)
                const mediaPath = './data/media.json';
                let mediaDB = fs.readJsonSync(mediaPath, { throws: false }) || { total: 0 };
                mediaDB.total = (mediaDB.total || 0) + 1;
                // حفظ مرة كل 50 وسائط
                if (mediaDB.total % 50 === 0) {
                    fs.writeJsonSync(mediaPath, mediaDB, { spaces: 2 });
                }
            }
        } catch (error) {
            // صمت تام
        }
    }

    extractText(message) {
        const msg = message.message;
        return msg.conversation || 
               msg.extendedTextMessage?.text || 
               msg.imageMessage?.caption || 
               msg.videoMessage?.caption || '';
    }

    getMessageStats() {
        return {
            totalMessages: this.messageCount,
            errors: this.errorLog.length
        };
    }

    async broadcastToGroups(message, groupJids = null) {
        try {
            let targets = groupJids;
            
            if (!targets) {
                const groups = await this.bot.sock.groupFetchAllParticipating();
                targets = Object.keys(groups);
            }

            let successCount = 0;

            // بث فائق السرعة
            for (const jid of targets) {
                try {
                    await this.bot.sendMessage(jid, message);
                    successCount++;
                } catch (error) {
                    // تجاهل سريع للأخطاء
                }
            }

            return { success: successCount, total: targets.length };

        } catch (error) {
            return { success: 0, total: 0 };
        }
    }

    async sendToUser(userJid, message) {
        try {
            await this.bot.sendMessage(userJid, message);
            return true;
        } catch (error) {
            return false;
        }
    }

    async replyToMessage(originalMessage, replyContent) {
        try {
            await this.bot.sendMessage(originalMessage.key.remoteJid, replyContent, {
                quoted: originalMessage
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    // نظام دعم السرعة
    startSpeedSystems() {
        this.optimizePerformance();
        this.startMemoryOptimizer();
        this.startSessionCleaner();
        this.startConnectionOptimizer();
        this.startErrorSaver(); // حفظ الأخطاء كل 5 دقائق
    }

    // تحسين الأداء الأساسي
    optimizePerformance() {
        // إعدادات السرعة القصوى
        process.setMaxListeners(0);
        
        if (this.bot.sock?.ws) {
            this.bot.sock.ws.binaryType = 'arraybuffer';
        }

        // تقليل السجلات غير الضرورية
        console.debug = () => {};
        
        // تحسين إعدادات البوت
        if (this.bot.sock) {
            this.bot.sock.maxRetries = 3;
            this.bot.sock.connectTimeoutMs = 30000;
        }
    }

    // منظف الذاكرة التلقائي
    startMemoryOptimizer() {
        setInterval(() => {
            this.optimizeMemory();
        }, 2 * 60 * 1000); // كل دقيقتين
    }

    optimizeMemory() {
        try {
            if (global.gc) global.gc();
            
            if (global.cache) {
                const now = Date.now();
                for (const [key, value] of global.cache) {
                    if (value.expire && value.expire < now) {
                        global.cache.delete(key);
                    }
                }
            }
        } catch (error) {
            // تجاهل
        }
    }

    // منظف الجلسة السريع
    startSessionCleaner() {
        setInterval(() => {
            this.cleanSessionFiles();
        }, 30 * 60 * 1000); // كل 30 دقيقة
    }

    cleanSessionFiles() {
        try {
            const sessionDir = './session';
            if (!fs.existsSync(sessionDir)) return;

            const files = fs.readdirSync(sessionDir);
            files.forEach(file => {
                if (file !== 'creds.json') {
                    fs.removeSync(`${sessionDir}/${file}`);
                }
            });
        } catch (error) {
            // تجاهل
        }
    }

    // محسن الاتصال
    startConnectionOptimizer() {
        setInterval(() => {
            this.optimizeConnection();
        }, 5 * 60 * 1000); // كل 5 دقائق
    }

    optimizeConnection() {
        try {
            if (this.bot.sock?.ws?.readyState === 1) {
                this.bot.sock.ws.ping();
            }
        } catch (error) {
            // تجاهل
        }
    }

    // ✅ حفظ الأخطاء دورياً
    startErrorSaver() {
        setInterval(() => {
            if (this.errorLog.length > 0) {
                try {
                    fs.writeJsonSync('./data/errors.json', this.errorLog, { spaces: 2 });
                } catch (e) {
                    // صمت
                }
            }
        }, 5 * 60 * 1000); // كل 5 دقائق
    }

    // إرسال فائق السرعة
    async ultraFastSend(jid, content, options = {}) {
        try {
            await this.bot.sendMessage(jid, content, {
                ...options,
                upload: false,
                mediaUploadTimeoutMs: 5000,
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    // بث فائق السرعة
    async ultraFastBroadcast(message, groupJids = null) {
        try {
            let targets = groupJids;
            
            if (!targets) {
                const groups = await this.bot.sock.groupFetchAllParticipating();
                targets = Object.keys(groups);
            }

            const promises = targets.map(jid => 
                this.ultraFastSend(jid, message).catch(() => false)
            );

            const results = await Promise.allSettled(promises);
            const successCount = results.filter(result => result.value).length;

            return { success: successCount, total: targets.length };

        } catch (error) {
            return { success: 0, total: 0 };
        }
    }

    // معالجة وسائط سريعة
    async fastMediaProcessing(message) {
        return this.isMediaMessage(message);
    }

    // الحصول على إحصائيات السرعة
    getSpeedStats() {
        const memoryUsage = process.memoryUsage();
        return {
            totalMessages: this.messageCount,
            memoryUsage: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
            uptime: Math.round(process.uptime()) + 's',
            connectionStatus: this.bot.sock?.ws?.readyState === 1 ? 'Connected' : 'Disconnected',
            errors: this.errorLog.length
        };
    }

    // إعادة تعيين سريعة
    quickReset() {
        this.messageCount = 0;
        this.errorLog = [];
    }

    // تحميل سريع للبيانات
    async fastDataLoad() {
        try {
            if (this.bot.config) {
                const configPath = `./config.js?update=${Date.now()}`;
                const { config } = await import(configPath);
                this.bot.config = { ...this.bot.config, ...config };
            }
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default MessageSystem;