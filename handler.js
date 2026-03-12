import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs-extra';
import { pathToFileURL } from 'url';
import path from 'path';
import chalk from 'chalk';
import gradient from 'gradient-string';

class Handler {
    constructor(bot) {
        this.bot = bot;
        this.commands = new Map();
        this.aliases = new Map();
        this.plugins = new Map();
        this.pluginDir = './plugins';
        this.stats = {
            commandsExecuted: 0,
            messagesProcessed: 0,
            errors: 0,
            startTime: Date.now()
        };
        
        // أنظمة متقدمة محسنة
        this.cooldowns = new Map();
        this.userData = new Map();
        this.groupData = new Map();
        this.cache = new Map();
        this.sessions = new Map();
        this.continuousCommands = new Map();
        this.autoCommands = new Map();
        this.gameSessions = new Map(); 
        
        this.security = {
            blockedUsers: new Set(),
            spamDetection: new Map(),
            rateLimits: new Map(),
            commandPermissions: new Map()
        };

        this.messageQueue = [];
        this.isProcessing = false;
        this.responseCache = new Map();
        this.cacheTTL = 30000;

        this.watcher = null;
        this.isReloading = false;
        this.isInitialized = false;
        this.coreWatcher = null; 
        this.configWatcher = null; 
        this.ensureDirectories();
        this.loadData();
        this.startCleanupCycle();
        this.startPerformanceMonitor();
        
        console.log(gradient.rainbow(`
        
███████  ██████  ██      ██████
██       ██  ██  ██      ██  ██
███████  ██  ██  ██      ██  ██
     ██  ██  ██  ██      ██  ██
███████  ██████  ███████ ██████

        `));
    }

    ensureDirectories() {
        const dirs = [this.pluginDir, './data', './temp'];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    // ==================== نظام التخزين المحسن ====================
    saveData() {
        try {
            const data = {
                userData: Object.fromEntries(this.userData),
                groupData: Object.fromEntries(this.groupData),
                stats: this.stats,
                security: {
                    blockedUsers: Array.from(this.security.blockedUsers)
                }
            };
            fs.writeJSONSync('./data/bot_data.json', data, { spaces: 2 });
        } catch (error) {
            console.log(chalk.red('❌ Save data error:'), error.message);
        }
    }

    loadData() {
        try {
            if (fs.existsSync('./data/bot_data.json')) {
                const data = fs.readJSONSync('./data/bot_data.json');
                this.userData = new Map(Object.entries(data.userData || {}));
                this.groupData = new Map(Object.entries(data.groupData || {}));
                this.stats = { ...this.stats, ...data.stats };
                if (data.security) {
                    this.security.blockedUsers = new Set(data.security.blockedUsers || []);
                }
            }
        } catch (error) {
            console.log(chalk.red('❌ Load data error:'), error.message);
        }
    }

    // ==================== نظام المستخدمين المحسن ====================
    getUserData(userJid) {
        if (!this.userData.has(userJid)) {
            this.userData.set(userJid, {
                messageCount: 0,
                commandCount: 0,
                firstSeen: Date.now(),
                lastSeen: Date.now(),
                level: 1,
                exp: 0,
                permissions: {
                    isAdmin: false,
                    isPremium: false,
                    canUseAllCommands: true,
                    restrictedCommands: []
                },
                stats: {
                    gamesPlayed: 0,
                    downloads: 0,
                    queries: 0,
                    adminCommandsUsed: 0,
                    gameCommandsUsed: 0,
                    infoCommandsUsed: 0,
                    mediaCommandsUsed: 0
                }
            });
        }
        return this.userData.get(userJid);
    }

    // ==================== نظام التحقق من المطورين المحسن ====================
    isDeveloper(jid) {
        if (!jid || typeof jid !== 'string') return false;
        
        const ownerConfig = this.bot.config?.DEVELOPERS;
        if (!ownerConfig || !Array.isArray(ownerConfig)) return false;

        const cleanJidNumber = String(jid).split('@')[0].split(':')[0];

        for (const dev of ownerConfig) {
            if (!dev) continue;
            const cleanDevNumber = String(dev).split('@')[0].split(':')[0];
            if (cleanJidNumber === cleanDevNumber) return true;
        }

        const botId = this.bot.sock?.user?.id;
        if (botId) {
            const botNum = String(botId).split('@')[0].split(':')[0];
            if (cleanJidNumber === botNum) return true;
        }

        return false;
    }

    // ==================== نظام تحويل LID إلى JID ====================
    convertLidToJid(lid) {
        try {
            if (!lid || typeof lid !== 'string') return null;
            
            console.log(chalk.blue(`🔄 convertLidToJid input: ${lid}`));

            if (lid.includes('@s.whatsapp.net')) {
                return lid;
            }
            
            if (lid.includes('@lid')) {
                const numberPart = lid.split('@')[0];
                const cleanNumber = numberPart.split(':')[0];
                console.log(chalk.blue(`🔢 Extracted from LID: ${cleanNumber}`));
                return `${cleanNumber}@s.whatsapp.net`;
            }
            
            const cleanNumber = lid.replace(/[^0-9]/g, '');
            if (cleanNumber.length > 5) {
                return `${cleanNumber}@s.whatsapp.net`;
            }
            
            console.log(chalk.yellow(`⚠️ Cannot convert LID: ${lid}`));
            return null;
        } catch (error) {
            console.log(chalk.red('❌ convertLidToJid error:'), error);
            return null;
        }
    }

    // ==================== نظام التحقق من البوت في المجموعة ====================
    async checkBotInGroup(groupJid, sock) {
        try {
            const metadata = await sock.groupMetadata(groupJid);
            const botJid = sock.user?.id;
            
            console.log(chalk.blue(`🤖 Bot JID: ${botJid}`));
            console.log(chalk.blue(`👥 Participants count: ${metadata.participants.length}`));

            let botParticipant = metadata.participants.find(p => p.id === botJid);
            
            if (!botParticipant) {
                const botNumber = botJid.split('@')[0];
                console.log(chalk.blue(`🔍 Searching by number: ${botNumber}`));
                
                botParticipant = metadata.participants.find(p => {
                    const participantNumber = p.id.split('@')[0].split(':')[0];
                    return participantNumber === botNumber;
                });
            }

            if (!botParticipant) {
                console.log(chalk.blue(`🔍 Searching by LID conversion`));
                const botLid = this.convertLidToJid(botJid);
                if (botLid) {
                    botParticipant = metadata.participants.find(p => p.id === botLid);
                }
            }

            if (botParticipant) {
                console.log(chalk.green(`✅ Bot found in group: ${botParticipant.id} - Admin: ${botParticipant.admin}`));
                return {
                    found: true,
                    participant: botParticipant,
                    isAdmin: botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin',
                    jid: botParticipant.id
                };
            } else {
                console.log(chalk.red(`❌ Bot not found in participants list`));
                console.log(chalk.yellow(`📋 Participants sample:`, metadata.participants.slice(0, 3).map(p => p.id)));
                return { 
                    found: false, 
                    participant: null, 
                    isAdmin: false,
                    jid: botJid
                };
            }
            
        } catch (error) {
            console.log(chalk.red('❌ checkBotInGroup error:'), error);
            return { 
                found: false, 
                participant: null, 
                isAdmin: false,
                jid: sock.user?.id 
            };
        }
    }

    // ==================== نظام البحث في المشاركين مع تحويل LID ====================
    async findParticipantByAnyId(groupJid, targetId, sock) {
        try {
            const metadata = await sock.groupMetadata(groupJid);
            const participants = metadata.participants;
            
            console.log(chalk.blue(`🔍 Searching for: ${targetId} in ${participants.length} participants`));

            let participant = null;
            
            const searchMethods = [
                () => participants.find(p => p.id === targetId),
                
                () => {
                    const convertedJid = this.convertLidToJid(targetId);
                    if (convertedJid) {
                        return participants.find(p => p.id === convertedJid);
                    }
                    return null;
                },
                
                () => {
                    const targetNumber = targetId.split('@')[0].split(':')[0];
                    return participants.find(p => p.id.split('@')[0].split(':')[0] === targetNumber);
                },
                
                () => {
                    const searchTerm = targetId.split('@')[0];
                    return participants.find(p => p.id.includes(searchTerm));
                },
                
                () => {
                    const cleanNumber = targetId.replace(/[^0-9]/g, '');
                    if (cleanNumber.length > 5) {
                        return participants.find(p => {
                            const participantNumber = p.id.split('@')[0].replace(/[^0-9]/g, '');
                            return participantNumber === cleanNumber;
                        });
                    }
                    return null;
                }
            ];
            
            for (const method of searchMethods) {
                participant = method();
                if (participant) {
                    console.log(chalk.green(`✅ Participant found: ${participant.id}`));
                    return {
                        found: true,
                        participant: participant,
                        jid: participant.id,
                        displayName: participant.notify || participant.id.split('@')[0],
                        isAdmin: participant.admin === 'admin' || participant.admin === 'superadmin'
                    };
                }
            }
            
            console.log(chalk.yellow(`⚠️ Participant not found: ${targetId}`));
            return {
                found: false,
                participant: null,
                jid: this.convertLidToJid(targetId) || targetId,
                displayName: targetId.split('@')[0],
                isAdmin: false
            };
            
        } catch (error) {
            console.log(chalk.red('❌ findParticipantByAnyId error:'), error);
            return {
                found: false,
                participant: null,
                jid: this.convertLidToJid(targetId) || targetId,
                displayName: targetId.split('@')[0],
                isAdmin: false
            };
        }
    }

    // ==================== نظام معلومات المستخدم المحسن ====================
    async getUserInfo(sock, message, args = []) {
        try {
            const isGroup = message.key.remoteJid.endsWith('@g.us');
            const selfJid = sock.user?.id;
            
            console.log(chalk.blue(`🔍 getUserInfo called - Group: ${isGroup}, Args: ${args.length}`));

            let groupMetadata = null;
            let participants = [];
            if (isGroup) {
                try {
                    groupMetadata = await sock.groupMetadata(message.key.remoteJid);
                    participants = groupMetadata.participants || [];
                    console.log(chalk.blue(`👥 Group has ${participants.length} participants`));
                } catch (error) {
                    console.log(chalk.red('❌ Failed to get group metadata:'), error.message);
                }
            }

            let targetJid = null;
            let source = 'unknown';

            if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                targetJid = message.message.extendedTextMessage.contextInfo.participant;
                source = 'reply';
                
            }
            
            else if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetJid = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
                source = 'mention';
                
            }
            
            else if (args.length > 0) {
                const arg = args[0].replace('@', '').trim();
                if (arg.length > 5) {
                    targetJid = arg;
                    source = 'args';
                    
                }
            }
            
            if (!targetJid) {
                targetJid = message.key.participant || message.key.remoteJid;
                source = 'sender';
                
            }

            if (isGroup && participants.length > 0) {
                
                let participant = null;
                
                const searchMethods = [
                    () => participants.find(p => p.id === targetJid),
                    
                    () => {
                        const targetNumber = targetJid.split('@')[0];
                        return participants.find(p => p.id.split('@')[0] === targetNumber);
                    },
                    
                    () => {
                        const targetSearch = targetJid.split('@')[0];
                        return participants.find(p => p.id.includes(targetSearch));
                    },
                    
                    () => {
                        if (source === 'args') {
                            const cleanArg = targetJid.replace(/[^0-9]/g, '');
                            return participants.find(p => p.id.split('@')[0].includes(cleanArg));
                        }
                        return null;
                    }
                ];
                
                for (const method of searchMethods) {
                    participant = method();
                    if (participant) {
                        console.log(chalk.green(`✅ Found participant: ${participant.id}`));
                        const userData = this.getUserData(participant.id);
                        return {
                            jid: participant.id,
                            lid: participant.id,
                            displayName: participant.notify || participant.id.split('@')[0] || 'Unknown',
                            isAdmin: participant.admin === 'admin' || participant.admin === 'superadmin',
                            isBot: participant.id === selfJid,
                            isDeveloper: this.isDeveloper(participant.id),
                            userData: userData,
                            groupRole: participant.admin || 'member',
                            foundInGroup: true
                        };
                    }
                }
                
                console.log(chalk.yellow(`⚠️ Participant not found in group: ${targetJid}`));
            }

            let cleanJid = targetJid;
            if (!cleanJid.includes('@s.whatsapp.net') && !cleanJid.includes('@g.us') && !cleanJid.includes('@lid')) {
                cleanJid = `${cleanJid}@s.whatsapp.net`;
            }

            const userData = this.getUserData(cleanJid);
            const displayName = message.pushName || cleanJid.split('@')[0] || 'Unknown';
            
            console.log(chalk.cyan(`👤 Returning default user info: ${displayName} (${cleanJid})`));
            
            return {
                jid: cleanJid,
                lid: cleanJid,
                displayName: displayName,
                isAdmin: false,
                isBot: cleanJid === selfJid,
                isDeveloper: this.isDeveloper(cleanJid),
                userData: userData,
                groupRole: null,
                foundInGroup: false
            };

        } catch (error) {
            console.log(chalk.red('❌ getUserInfo error:'), error.message);
            return null;
        }
    }
        // ==================== نظام تحميل البلجنات المحسن ====================
    async loadPlugins() {
        try {
            console.log(chalk.cyan('🔄 Loading plugins...'));
            
            if (!fs.existsSync(this.pluginDir)) {
                console.log(chalk.yellow('📁 Creating plugins directory...'));
                fs.mkdirSync(this.pluginDir, { recursive: true });
                return;
            }

            const files = fs.readdirSync(this.pluginDir)
                .filter(file => file.endsWith('.js'));
            
            console.log(chalk.blue(`📁 Found ${files.length} plugin files`));
            
            let loadedCount = 0;
            
            for (const file of files) {
                try {
                    await this.loadSinglePlugin(file);
                    loadedCount++;
                } catch (error) {
                    console.log(chalk.red(`❌ Failed to load ${file}:`), error.message);
                }
            }
            
            console.log(gradient.rainbow(`✅ Loaded ${loadedCount} plugins with ${this.commands.size} commands`));
            
            this.showLoadedCommands();
            await this.startPluginWatcher();
            await this.startConfigWatcher(); 
            this.isInitialized = true;
            
        } catch (error) {
            console.log(chalk.red('❌ Plugin load error:'), error.message);
        }
    }

    async loadSinglePlugin(filename) {
        try {
            const cleanFilename = filename.replace(/[^\w\u0600-\u06FF\.\-\s]/g, '');
            
            const pluginPath = path.resolve(this.pluginDir, cleanFilename);

            if (!fs.existsSync(pluginPath)) {
                throw new Error(`File not found: ${cleanFilename}`);
            }

            const importPath = `${pathToFileURL(pluginPath).href}?v=${Date.now()}`;
            const pluginModule = await import(importPath);
            
            let plugin;

            if (pluginModule.default) {
                if (typeof pluginModule.default === 'function') {
                    plugin = pluginModule.default(this.bot);
                } else if (typeof pluginModule.default === 'object') {
                    plugin = pluginModule.default;
                } else {
                    throw new Error('Invalid default export type in plugin');
                }
            } else {
                throw new Error('Plugin has no default export');
            }

            if (!plugin || (!plugin.name && !plugin.commands)) {
                throw new Error('Invalid plugin structure: missing name or commands array');
            }

            await this.registerPlugin(plugin, cleanFilename);
            console.log(chalk.green(`✅ Loaded: ${plugin.name || cleanFilename}`));

        } catch (error) {
            console.log(chalk.red(`❌ Failed to load ${filename}:`), error.message);
            throw error;
        }
    }

    async registerPlugin(plugin, filename) {
        this.plugins.set(filename, {
            ...plugin,
            filename: filename,
            loadTime: Date.now()
        });
        
        if (plugin.commands && Array.isArray(plugin.commands)) {
            plugin.commands.forEach(cmd => {
                this.registerCommand(cmd, plugin.name);
            });
        } else if (plugin.run && typeof plugin.run === 'function' && plugin.name) {
            this.registerCommand({
                name: plugin.name,
                run: plugin.run,
                aliases: plugin.aliases || [],
                description: plugin.description || '',
                developer: plugin.developer || false,
                cooldown: plugin.cooldown || 2000
            }, plugin.name);
        }

        if (plugin.onLoad && typeof plugin.onLoad === 'function') {
            try {
                await plugin.onLoad();
            } catch (error) {
                console.log(chalk.red(`❌ Plugin onLoad failed: ${plugin.name}`), error.message);
            }
        }

        return true;
    }

    registerCommand(command, pluginName = 'unknown') {
        if (!command || !command.name || typeof command.run !== 'function') {
            return false;
        }

        const enhancedCommand = {
            ...command,
            plugin: pluginName,
            usageCount: 0,
            lastUsed: null,
            category: command.category || 'general',
            permissions: command.permissions || {
                group: command.group || false,
                admin: command.admin || false,
                developer: command.developer || false,
                private: command.private || false
            }
        };

        this.commands.set(command.name, enhancedCommand);
        
        if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach(alias => {
                this.aliases.set(alias, command.name);
            });
        }

        return true;
    }

    showLoadedCommands() {
        const commands = Array.from(this.commands.keys());
        if (commands.length > 0) {
            const commandList = commands.map(cmd => `${this.bot.config.PREFIX}${cmd}`).join(' | ');
            const title = chalk.cyan('✅ Loaded Commands:');
            const coloredCommands = gradient('lime', 'cyan')(commandList);
            console.log(`\n${title}\n${coloredCommands}\n`);
        }
    }

    // ==================== نظام معالجة متوازي كامل ====================
    async handleMessage(message) {
        if (!this.isInitialized || !message.message || !message.key.remoteJid) {
            return false;
        }

        // تنفيذ فوري بدون أي انتظار - كل أمر مستقل
        Promise.resolve().then(async () => {
            try {
                await this.processSingleMessage(message);
            } catch (error) {
                console.log(chalk.red('❌ Async processing error:'), error.message);
            }
        });

        return true;
    }

    // معالجة كل أمر في thread منفصل
    async processSingleMessage(message) {
        return new Promise((resolve) => {
            // بدء المعالجة في دورة event منفصلة
            setImmediate(async () => {
                let cmdName = '';
                try {
                    this.stats.messagesProcessed++;
                    
                    const userJid = this.getUserJid(message);

                    // --- نظام البلاك لست الفعلي الآمن ---
                    const blacklistPath = './data/blacklist.json';
                    try {
                        if (fs.existsSync(blacklistPath)) {
                            const blacklistData = fs.readFileSync(blacklistPath, 'utf8');
                            if (blacklistData) {
                                const blacklist = JSON.parse(blacklistData);
                                if (Array.isArray(blacklist) && blacklist.includes(userJid)) {
                                    resolve(false);
                                    return;
                                }
                            }
                        }
                    } catch (e) {
                        console.log("⚠️ Blacklist error:", e.message);
                    }
                    
                    const text = this.extractText(message);
                    if (!text) {
                        resolve(false);
                        return;
                    }

                    const isGroup = this.isGroup(message);
                    const isDev = this.isDeveloper(userJid);
                    const prefix = this.bot.config.PREFIX;
                    const hasPrefix = text.toLowerCase().startsWith(prefix.toLowerCase());

                    // --- [ نظام بنك سولو الإمبراطوري - الحفظ الدائم ] ---
                    try {
                        const bankPath = './data/bank.json';
                        const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
                        let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};
                        
                        if (!bankDB[cleanId]) {
                            bankDB[cleanId] = bankDB[userJid] || { money: 0, rank: "عضو مكافح 🌱", lastDaily: 0, inventory: [] };
                        }
                        
                        if (!bankDB[cleanId].inventory) bankDB[cleanId].inventory = [];

                        bankDB[cleanId].money = (bankDB[cleanId].money || 0) + 1;
                        const totalMoney = bankDB[cleanId].money;

                        const storeRanks = ["عابر سبيل 👣", "هاوي قتالات 🥊", "مغامر ناشئ 🎒", "صائد عملات 🪙", "مرتزق مأجور 🔫", "قائد عصابة 🐺", "منفذ غامض 🕶️", "تاجر سوق سوداء 📦", "زعيم المحطة 🚉", "بطل الظلال 🌑"];
                        
                        if (!storeRanks.includes(bankDB[cleanId].rank)) {
                            if (totalMoney >= 100000) {
                                bankDB[cleanId].rank = "حـاكـم الـكـوكـب 👑🌌";
                            } else if (totalMoney >= 70000) {
                                bankDB[cleanId].rank = "مـسـتـثـمـر عـالـمـي 💎";
                            } else if (totalMoney >= 50000) {
                                bankDB[cleanId].rank = "مـلـيـارديـر 💰";
                            } else if (totalMoney >= 30000) {
                                bankDB[cleanId].rank = "مـلـيـونـيـر 💸";
                            } else if (totalMoney >= 20000) {
                                bankDB[cleanId].rank = "رجل أعـمـال 💼";
                            } else if (totalMoney >= 10000) {
                                bankDB[cleanId].rank = "ثـري ✨";
                            } else {
                                bankDB[cleanId].rank = "عـضـو مـكـافـح 🌱";
                            }
                        }

                        fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });
                    } catch (e) {
                        console.log('⚠️ Bank System Error:', e.message);
                    }

                    // --- [ نظام الألعاب المطور: ريبلاي + استمارات فخمة + صح/خطأ ] ---
                    if (global.riddle && global.riddle[message.key.remoteJid]) {
                        const isReplyToBot = message.message?.extendedTextMessage?.contextInfo?.stanzaId === global.riddle[message.key.remoteJid].msgId;
                        
                        if (isReplyToBot) {
                            const correctAnswer = global.riddle[message.key.remoteJid].answer.trim();
                            const userAnswer = text.trim();
                            
                            if (userAnswer === correctAnswer) {
                                const successTemplate = `
*╭─━━━━━━━━━━━━━━━─╮*
       *◈ 𝐖𝐈𝐍𝐍𝐄𝐑 🏮 أحـسـنـت ◈*
*╰─━━━━━━━━━━━━━━━─╯*

*👤┇ الـفـائـز : ⦓ @${userJid.split('@')[0]} ⦔*

*✅┇ الإجـابة الصحيحة : ⦓ ${correctAnswer} ⦔*

*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

                                await this.sendMessage(message.key.remoteJid, { text: successTemplate, mentions: [userJid] }, { quoted: message });
                                
                                clearTimeout(global.riddle[message.key.remoteJid].timer);
                                delete global.riddle[message.key.remoteJid];
                                resolve(true);
                                return;
                            } else {
                                await this.sendMessage(message.key.remoteJid, { text: "❌ *إجابة خاطئة! حاول مرة أخرى.*" }, { quoted: message });
                                resolve(true);
                                return;
                            }
                        }
                    }
                    
                                        // --- [ نظام الكتابة السريعة (اكتب) ] ---
                    if (global.writing && global.writing[message.key.remoteJid]) {
                        const game = global.writing[message.key.remoteJid];
                        
                        // التحقق من الإجابة (بدون ريبلاي)
                        if (text.trim() === game.answer) {
                            // التأكد إن اللعبة لسه شغالة ولم يفز بها أحد
                            if (game.active && !game.winner) {
                                // تسجيل الفائز ومنع أي فائز آخر
                                game.winner = userJid;
                                game.active = false;
                                
                                const successTemplate = `
*╭─━━━━━━━━━━━━━━━─╮*
       *◈ 𝐖𝐈𝐍𝐍𝐄𝐑 🏮 أحـسـنـت ◈*
*╰─━━━━━━━━━━━━━━━─╯*

*👤┇ الـفـائـز : ⦓ @${userJid.split('@')[0]} ⦔*

*✅┇ الإجـابة الصحيحة : ⦓ ${game.answer} ⦔*

*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

                                await this.sendMessage(message.key.remoteJid, { 
                                    text: successTemplate, 
                                    mentions: [userJid] 
                                }, { quoted: message });
                                
                                // إلغاء المؤقت
                                if (game.timer) clearTimeout(game.timer);
                                
                                // مسح اللعبة
                                delete global.writing[message.key.remoteJid];
                                resolve(true);
                                return;
                            }
                        }
                        // لو الإجابة غلط، لا نرد حاجة
                    }
                    
                                      // --- [ نظام الأعلام (علم) - معدل ] ---
                    if (global.flag && global.flag[message.key.remoteJid]) {
                        const game = global.flag[message.key.remoteJid];
                        
                        // التحقق من الإجابة (أي رسالة بدون ريبلاي)
                        if (text.trim().toLowerCase() === game.answer.toLowerCase()) {
                            // التأكد إن اللعبة لسه شغالة ولم يفز بها أحد
                            if (game.active && !game.winner) {
                                // تسجيل الفائز ومنع أي فائز آخر
                                game.winner = userJid;
                                game.active = false;
                                
                                // إلغاء المؤقت
                                if (game.timer) clearTimeout(game.timer);
                                
                                const successTemplate = `
*╭─━━━━━━━━━━━━━━━─╮*
       *◈ 𝐖𝐈𝐍𝐍𝐄𝐑 🏮 أحـسـنـت ◈*
*╰─━━━━━━━━━━━━━━━─╯*

*👤┇ الـفـائـز : ⦓ @${userJid.split('@')[0]} ⦔*

*✅┇ الإجـابة الصحيحة : ⦓ ${game.answer} ⦔*

*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

                                await this.sendMessage(message.key.remoteJid, { 
                                    text: successTemplate, 
                                    mentions: [userJid] 
                                }, { quoted: message });
                                
                                // مسح اللعبة
                                delete global.flag[message.key.remoteJid];
                                resolve(true);
                                return;
                            }
                        }
                        // لو الإجابة غلط، لا نرد حاجة
                    }
                                        // --- [ نظام الكتابة السريعة (اكتب) ] ---
                    if (global.writing && global.writing[message.key.remoteJid]) {
                        const game = global.writing[message.key.remoteJid];
                        
                        // التحقق من الإجابة (بدون ريبلاي)
                        if (text.trim() === game.answer) {
                            // التأكد إن اللعبة لسه شغالة ولم يفز بها أحد
                            if (game.active && !game.winner) {
                                // تسجيل الفائز ومنع أي فائز آخر
                                game.winner = userJid;
                                game.active = false;
                                
                                const successTemplate = `
*╭─━━━━━━━━━━━━━━━─╮*
       *◈ 𝐖𝐈𝐍𝐍𝐄𝐑 🏮 أحـسـنـت ◈*
*╰─━━━━━━━━━━━━━━━─╯*

*👤┇ الـفـائـز : ⦓ @${userJid.split('@')[0]} ⦔*

*✅┇ الإجـابة الصحيحة : ⦓ ${game.answer} ⦔*

*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

                                await this.sendMessage(message.key.remoteJid, { 
                                    text: successTemplate, 
                                    mentions: [userJid] 
                                }, { quoted: message });
                                
                                // إلغاء المؤقت
                                if (game.timer) clearTimeout(game.timer);
                                
                                // مسح اللعبة
                                delete global.writing[message.key.remoteJid];
                                resolve(true);
                                return;
                            }
                        }
                        // لو الإجابة غلط، لا نرد حاجة
                    }
                    
                    // ==================== [ معالجة لعبة نبات (طعام) ] ====================
if (global.plantGame) {
    const chatId = message.key.remoteJid;
    const userJid = message.key.participant || message.key.remoteJid;
    
    // البحث عن لعبة نشطة في هذه المجموعة
    const game = global.plantGame[chatId];
    
    if (game && game.active && !game.winner && Date.now() < game.expiry) {
        const userAnswer = (message.message.conversation || message.message.extendedTextMessage?.text || '').trim().toLowerCase();
        const correctAnswer = game.answer.toLowerCase();
        
        // التحقق من الإجابة (بدون ريبلاي)
        if (userAnswer === correctAnswer) {
            // منع الفوز المزدوج
            game.winner = true;
            game.winnerJid = userJid;
            
            // إلغاء المؤقت القديم
            if (game.timer) clearTimeout(game.timer);
            
            // رسالة الفوز الأسطورية
            const winMsg = `*╭─━━━━━━━━━━━━━━━─╮*
       *◈ 𝐖𝐈𝐍𝐍𝐄𝐑 🏮 أحـسـنـت ◈*
*╰─━━━━━━━━━━━━━━━─╯*

*👤┇ الـفـائـز : ⦓ @${userJid.split('@')[0]} ⦔*

*✅┇ الإجـابة الصحيحة : ⦓ ${game.answer} ⦔*

*🌱┇ الـطـعـام : ${game.emoji || ''}*

*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;

            await bot.sendMessage(chatId, {
                text: winMsg,
                mentions: [userJid]
            });
            
            // حذف اللعبة بعد الفوز مباشرة
            delete global.plantGame[chatId];
            
            console.log(`🍽️ [نبات] فائز: ${userJid.split('@')[0]} - الإجابة: ${game.answer}`);
        }
        // لو الإجابة غلط، ما نردش حاجة (صمت تام)
    }
}

// ==================== [ رادار سولو الشامل - النسخة المتوافقة مع الهندلر ] ====================
if (isGroup && global.protectionStatus?.[message.key.remoteJid] && !isDev) {
    
// 1. التحقق المباشر من خاصية fromMe (لو الرسالة مرسلة من البوت)
if (message.key.fromMe) return;

// 2. التحقق الاحتياطي بمقارنة الأرقام فقط (لضمان استثناء البوت تماماً)
const botNumber = this.bot.sock?.user?.id?.split(':')[0]?.split('@')[0];
const senderNumber = userJid?.split(':')[0]?.split('@')[0];

if (botNumber === senderNumber) return;
    
    const textLower = (this.extractText(message) || "").toLowerCase();
    const chatId = message.key.remoteJid;

    const userData = this.getUserData(userJid);

    const groupMetadata = await this.bot.sock.groupMetadata(chatId);
    const participants = groupMetadata.participants;
    const user = participants.find(u => u.id === userJid);
    const isAdmin = user?.admin === 'admin' || user?.admin === 'superadmin';
    
const badWords = [
        "كسم", "كسمك", "المتناك", "المتناكة", "الشرموط", "الشرموطة", "شرموط", "شرموطة", "لبوة", "كسمينك",
        "كوسومك", "كوسمك", "خول", "الخول", "القحبة", "القحبه", "البضان", "يبضان", "لبوه", "اللبوه", "اللبوة",
        "العرث", "العرص", "المعرص", "المعرث", "المعرس", "المنكوع", "الكسم", "متناك", "متناكة", "متناكه",
        "النيك", "نيكه", "النيكه", "النيكة", "نيكة", "خولة", "كتفم", "كتفمك", "كسمين", "الكسيمات", "النيكات",
        "الزوبر", "زوبر", "ظوبر", "ظوبري", "زوبري", "الظوبر", "الكس", "كس", "كسك", "كسي", "اكساس", "طيز", "طياز", "طيزك",
        "سكس", "سكسي", "ass", "hot", "xxx", "xnxx", "porn", "pussy", "dick", "قضيب", "قضيبي", "pornhub",
        "بيتش", "bitch", "عاهرة", "عاهره", "نائك", "نائكة", "منيوك", "منيوكة", "عارية", "عاريه", "منيوكه", 
        "مص", "مصمص", "مصاص", "مصلي", "مصمصلي", "عاهر", "شرموطه", "الشرموطه", "مصو", "مصوا", "كسو", "كثو", "يكسو", "يكثو",
        "مصي", "الحس", "تلحس", "تلحسي", "الحسي", "طيزي", "تمص", "بضان", "بضاني", "بيضان", "بيضاني", "زبي", "زب", "يعرص", "يخول", "يمتناك", "يشرموط", "يقحبة", "يمقحب", "يمشرمط", "يمنيوك", "نيك", "منيكه", "المنيكة", "منيكة", "المنيكه", "القحبنه", "هنيكك", "هخرمك", "هنكحك", "هعاشرك", "تكسم", "يكس", "يزبي", "تيز", "تيزك", "زبك", "الزانية", "الزانيه", "زانيه", "زانية", "انيكك؟", "انيكك", "شرمطة", "شرمطه", "الشرمطه", "الشرمطة", "منيك", "fuck", "Fuck", "تتناك", "بتتناك", "بيتناك", "بيتمنيك", "زامل", "قواد", "يزامل", "يقواد", "عرص", "معرص", "تعريص","ايري","عيري","بورن","Bitch","Porn","الظوبر","انيك","لباوي","sex","ظبري","تتمنيك","تتمنيك؟","بيتمنيك","بيتشرمط","قحباوي","كسمه","بيتقحبن","جوني سنس","امتناكه","اكسمك","kosomk","يزبي","عزبي","انكحه","البورن","انيجك","انيج","امتناك","يطيز","يقحبة","يقحبه","يمتناكه","يشرموطه","يمتناكة","يشرموطة","يمنيكة","الزب","بزاز","بزك","بزازك","طيازك","احبنة","احبنه","سكسي","شراميط","منايك","منيوكين","منيوكات","متناكين","معرصين","خولات","تمص"];

    const badEmojis = ["👄", "🫦", "🖕", "🖕🏻", "🖕🏼", "🖕🏽", "🖕🏾", "🖕🏿", "👅", "🥵", "🏳️‍⚧️", "🏳️‍🌈"];
    
    const urlPattern = /([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?|https?:\/\/\S+|www\.\S+/gi;
    const hasUrl = urlPattern.test(textLower);
    const hasBadWord = badWords.some(word => new RegExp(`(^|\\s)${word}($|\\s|[!?.])`, 'i').test(textLower));
    const hasBadEmoji = badEmojis.some(emoji => textLower.includes(emoji));

    let triggerRadar = false;
    if (hasBadWord || hasBadEmoji) triggerRadar = true;
    if (hasUrl && !isAdmin) triggerRadar = true;

    if (triggerRadar) {
        const sender = userJid;
        userData.stats.queries = (userData.stats.queries || 0) + 1;
        const warningCount = userData.stats.queries;

        if (warningCount >= 4) {
            const kickMsg = `*╭─━━━  𝐒𝐎𝐋𝐎 𝐒𝐇𝐈𝐄𝐋𝐃  ━━━─╮*\n\n*│ ◈ الـقـࢪاࢪ : ⦓ طـرد نـهـائـي 🚫 ⦔*\n\n*│ ◈ الـعـاق : ⦓ @${sender.split('@')[0]} ⦔*\n\n*│ ◈ الـسـبـب : تـجـاوز الـقـوانـيـن 4 مـرات❌*\n*╰─━━━━━━━━━━━━━━━━━━─╯*`.trim();
            this.sendMessage(chatId, { text: kickMsg, mentions: [sender] }).then(() => {
                this.bot.sock.groupParticipantsUpdate(chatId, [sender], "remove").catch(() => {});
            });
            userData.stats.queries = 0;
        } else {
            const warnMsg = `*╭─━━  𝐒𝐎𝐋𝐎 𝐖𝐀𝐑𝐍𝐈𝐍𝐆  ━━─╮*\n\n*│ ◈ تـنـبـيه لـلـعـضـو: ⦓ @${sender.split('@')[0]} ⦔*\n\n*│ ◈ الإنـذار: ⦓ ${warningCount} / 4 ⦔*\n*│*\n*│ ◈ ⚠️ مـمـنـوع الـسـب، الـكـلام الـبـذئ، إرسال الـروابـط*\n\n*│ ◈ الـتـزم بـالـقـوانـيـن لـتـفـادي الـطـرد‼️*\n*╰─━━━━━━━━━━━━━━━━━━─╯*`.trim();
            this.sendMessage(chatId, { text: warnMsg, mentions: [sender] }).catch(() => {});
        }

        this.bot.sock.sendMessage(chatId, { delete: message.key }).catch(() => {});
        resolve(true);
        return;
    }
}
                    // --- [ نظام تفاعلي سولو: عداد يومي للمجموعات فقط ] ---
                    try {
                        const activityPath = './data/activity.json';
                        const chatId = message.key.remoteJid;
                        const isGroup = chatId.endsWith('@g.us');

                        if (isGroup) {
                            const today = new Date().toDateString();
                            const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";

                            if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
                            let activityDB = fs.readJsonSync(activityPath, { throws: false }) || { lastReset: today, users: {} };

                            if (activityDB.lastReset !== today) {
                                activityDB.users = {}; 
                                activityDB.lastReset = today;
                            }

                            if (!activityDB.users[cleanId]) {
                                activityDB.users[cleanId] = { count: 1 };
                            } else {
                                activityDB.users[cleanId].count += 1;
                            }

                            fs.writeJsonSync(activityPath, activityDB, { spaces: 2 });
                        }
                    } catch (e) {
                        console.log('⚠️ Activity System Error:', e.message);
                    }

// ==================== [ نظام سولو: المهام والخبرة - النسخة المطورة ] ====================
try {
    const soloPath = './data/SOLO_LEVELING.json';
    if (fs.existsSync(soloPath)) {
        let soloDB = fs.readJsonSync(soloPath, { throws: false }) || {};
        const userLid = message.key.participant || message.key.remoteJid;

        if (soloDB[userLid]) {
            let player = soloDB[userLid];
            let q = player.dailyQuests || { step: 1, msgCount: 0, cmdCount: 0, targetText: '' };

            player.msgCount = (player.msgCount || 0) + 1;
            if (player.msgCount >= 10) {
                player.xp = (player.xp || 0) + 1;
                player.msgCount = 0;
                
                // ✅ حساب مستوى الصياد (بدون تصفير خاطئ)
                let xpToNextLevel = (player.level || 1) * 100;
                while (player.xp >= xpToNextLevel) {
                    player.level = (player.level || 1) + 1;
                    player.xp -= xpToNextLevel;  // ✅ اخصم مش تصفير!
                    xpToNextLevel = (player.level || 1) * 100;
                }
            }

            // ==================== تحديث مهام النقابة ====================
            if (player) {
                // تأكد من وجود guild (نظام النقابة)
                if (!player.guild) {
                    player.guild = {
                        currentQuest: null,
                        questProgress: 0,
                        completedQuests: [],
                        lastReset: Date.now()
                    };
                }

                // ✅ التحقق من التجديد اليومي
                const oneDay = 24 * 60 * 60 * 1000;
                if (Date.now() - (player.guild.lastReset || 0) > oneDay) {
                    player.guild.currentQuest = null;
                    player.guild.questProgress = 0;
                    player.guild.completedQuests = [];
                    player.guild.lastReset = Date.now();
                }

                if (player.guild?.currentQuest) {
                    const questsByRank = {
                        "E": [
                            { id: "E1", type: "messages", target: 50 },
                            { id: "E2", type: "commands", target: 10 },
                            { id: "E3", type: "replies", target: 15 }
                        ],
                        "C": [
                            { id: "C1", type: "messages", target: 150 },
                            { id: "C2", type: "commands", target: 15 },
                            { id: "C3", type: "replies", target: 25 },
                            { id: "C4", type: "dungeon_open", target: 1 }
                        ],
                        "B": [
                            { id: "B1", type: "messages", target: 300 },
                            { id: "B2", type: "commands", target: 20 },
                            { id: "B3", type: "replies", target: 30 },
                            { id: "B4", type: "dungeon_open", target: 3 },
                            { id: "B5", type: "attack_use", target: 1 }
                        ],
                        "A": [
                            { id: "A1", type: "messages", target: 500 },
                            { id: "A2", type: "commands", target: 25 },
                            { id: "A3", type: "replies", target: 40 },
                            { id: "A4", type: "dungeon_open", target: 5 },
                            { id: "A5", type: "attack_win", target: 1 }
                        ],
                        "S": [
                            { id: "S1", type: "messages", target: 800 },
                            { id: "S2", type: "commands", target: 30 },
                            { id: "S3", type: "replies", target: 50 },
                            { id: "S4", type: "dungeon_open", target: 8 },
                            { id: "S5", type: "attack_win", target: 3 }
                        ],
                        "SS": [
                            { id: "SS1", type: "messages", target: 1200 },
                            { id: "SS2", type: "commands", target: 40 },
                            { id: "SS3", type: "replies", target: 60 },
                            { id: "SS4", type: "dungeon_open", target: 12 },
                            { id: "SS5", type: "attack_win", target: 5 }
                        ]
                    };

                    const rank = player.rank || "E";
                    const quests = questsByRank[rank] || questsByRank["E"];
                    const currentQuest = quests.find(q => q.id === player.guild.currentQuest);
                    
                    if (currentQuest) {
                        let progressUpdated = false;
                        
                        switch (currentQuest.type) {
                            case "messages":
                                player.guild.questProgress = Math.min(currentQuest.target, (player.guild.questProgress || 0) + 1);
                                progressUpdated = true;
                                break;
                                
                            case "commands":
                                if (hasPrefix) {
                                    player.guild.questProgress = Math.min(currentQuest.target, (player.guild.questProgress || 0) + 1);
                                    progressUpdated = true;
                                }
                                break;
                                
                            case "replies":
                                if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                                    player.guild.questProgress = Math.min(currentQuest.target, (player.guild.questProgress || 0) + 1);
                                    progressUpdated = true;
                                }
                                break;
                        }
                        
                        if (progressUpdated) {
                            // ✅ لا نزود XP هنا! المكافأة هتتاخد من أمر نقابة_الصيادين استلام
                            soloDB[userLid] = player;
                        }
                    }
                }
            }

            // ✅ دالة إعطاء المكافأة (بتزود XP وذهب)
            const giveReward = (xp, gold) => {
                player.xp = (player.xp || 0) + xp;
                player.gold = (player.gold || 0) + gold;
                
                // ✅ تحديث المستوى بعد إضافة XP
                let xpToNextLevel = (player.level || 1) * 100;
                while (player.xp >= xpToNextLevel) {
                    player.level = (player.level || 1) + 1;
                    player.xp -= xpToNextLevel;
                    xpToNextLevel = (player.level || 1) * 100;
                }
            };

            // ✅ المهمة الأولى: 100 رسالة
            if (q.step === 1) {
                q.msgCount = (q.msgCount || 0) + 1;
                if (q.msgCount >= 100) {
                    q.step = 2;
                    giveReward(5, 10);
                    this.sendMessage(message.key.remoteJid, { text: "｢ ✅ ｣ *تـمـت الـمـهـمـة الأولـى!*\n*الـجـائزة: 10 ذهـب + 5 XP*\n*الـتـالي: اخـتـبـار الـنـص الـمُـقـدس.* " }, { quoted: message });
                }
            }

            // ✅ المهمة الثانية: النص المقدس
            if (q.step === 2) {
                if (!q.targetText) {
                    const longTexts = [
                        "في أعماق الظلام، حيث لا يجرؤ أحد على الاقتراب، هناك كيان أسطوري ينتظر من يجرؤ على تحديه. إنه ملك الظلال، الذي حكم العالم السفلي لآلاف السنين، وجيشه من الموتى الأحياء ينتظرون أوامره. هل أنت مستعد لمواجهة هذا التحدي المصيري؟",
                        "عندما تنطفئ الأنوار وتخيم الظلمة على المكان، تبدأ قصة جديدة في عالم سولو ليفلينج. الصيادون الحقيقيون لا يخافون الظلام، بل يتخذونه حليفاً لهم في معاركهم ضد قوى الشر. تذكر دائماً أن القوة الحقيقية تأتي من الداخل.",
                        "في زنزانة منسية تحت الأرض، حيث لا يصل ضوء الشمس أبداً، هناك وحش أسطوري ينام منذ آلاف السنين. لقد حان الوقت لإيقاظه ومواجهته في معركة تحدد مصير البشرية جمعاء. استعد جيداً، فهذه المعركة لن تكون سهلة.",
                        "الضعفاء يخشون الموت، أما الأقوياء فيتخذون منه سلاحاً للسيطرة على ساحة المعركة. في عالم سولو ليفلينج، الموت ليس نهاية، بل بداية جديدة لمرحلة أقوى. استعد لمواجهة مصيرك بكل شجاعة وإصرار.",
                        "استيقظوا أيها الجنود، فالظلام هو حليفنا الوحيد في هذه الليلة السرمدية الطويلة جداً. علينا أن نتحضر للمعركة الكبرى التي ستغير مسار التاريخ. كل واحد منكم لديه دور مهم في هذه الملحمة الأسطورية.",
                        "أنا لست مجرد لاعب في هذا النظام، أنا من يضع القوانين ويقرر من يعيش ومن يموت. في عالم سولو ليفلينج، القوة هي كل شيء، والضعفاء مصيرهم الهلاك. اختر طريقك بحكمة، فكل قرار تتخذه سيحدد مصيرك.",
                        "الظلال التي تتبعني هي أرواح من تجرأوا على الوقوف في طريقي قبل أن يصبحوا خدامي المخلصين. كل ظل لدي قصة وحكاية، وكل واحد منهم كان بطلاً في حياته السابقة. الآن، هم جزء من جيشي الذي لا يقهر.",
                        "في أعماق الغابة المسحورة، حيث الأشجار تتحدث والحيوانات تفكر، هناك بوابة سرية تؤدي إلى عالم آخر. هذا العالم مليء بالأسرار والكنوز، ولكنه أيضاً مليء بالأخطار التي تهدد حياة كل من يجرؤ على دخوله.",
                        "عندما تشرق الشمس على أرض المعركة، يبدأ الصيادون رحلتهم اليومية بحثاً عن القوة والثروة. كل يوم هو فرصة جديدة لإثبات الذات وتحقيق الإنجازات التي ستخلد أسمائهم في التاريخ.",
                        "في مملكة الظلال، حيث لا قوانين تحكم سوى قانون القوة، هناك صياد واحد فقط يمكنه أن يصبح الملك. هذا الصياد هو من سيواجه أعتى الوحوش ويتحدى أقوى الأعداء ليصل إلى القمة.",
                        "الرحلة إلى القمة طويلة وشاقة، ولكنها تستحق كل جهد. في كل خطوة تخطوها، تتعلم شيئاً جديداً عن نفسك وعن العالم من حولك. الألم الذي تشعر به اليوم سيكون قوتك في الغد.",
                        "في عالم مليء بالأسرار والألغاز، المعرفة هي أعظم قوة يمكن أن تمتلكها. كل لغز تحله وكل سر تكتشفه يجعلك أقوى وأكثر حكمة. استمر في البحث والتعلم، فالمعرفة لا تنتهي.",
                        "عندما تواجه وحشاً في زنزانة مظلمة، تذكر أن هذا الوحش كان يوماً ما إنساناً مثلك. القوة المطلقة تفسد صاحبها، وقد تحول هذا المسكين إلى وحش بسبب جشعه وطمعه. لا تكرر نفس الخطأ.",
                        "الأصدقاء الحقيقيون هم من يقفون بجانبك في أصعب اللحظات. في رحلتك نحو القمة، ستواجه العديد من الصعاب، ولكن مع وجود أصدقاء مخلصين، كل شيء يصبح ممكناً.",
                        "النهاية هي مجرد بداية جديدة. عندما تظن أنك وصلت إلى القمة، تكتشف أن هناك قمماً أعلى تنتظرك. رحلة التطور لا تنتهي أبداً، وكل يوم هو فرصة جديدة لتصبح أفضل مما كنت عليه بالأمس."
                    ];
                    
                    q.targetText = longTexts[Math.floor(Math.random() * longTexts.length)];
                    
                    const talfeelMsg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
    *⌬ اخـتـبـار الـنـص الـمُـقـدس ⌬*
*───━━━⊱  📜  ⊰━━━───*

*⌠📜⌡ الـمـهـمـة الـثـانـيـة: اخـتـبـار الـنـص الـمُـقـدس*
*┌─────────────────────────────────┐*
*│ اكـتـب الـنـص الـتـالـي بـالـحـرف*
*│ الـواحـد لـتـكـمـل الـمـهـمـة*
*└─────────────────────────────────┘*

*⌠📝⌡ الـنـص الـمُـقـدس:*
\`\`\`
>${q.targetText}<
\`\`\`

*⌠⏳⌡ الـوقـت لـيـس مـهـمـاً، الـدقـة فـقـط*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

                    this.sendMessage(message.key.remoteJid, { text: talfeelMsg }, { quoted: message });
                }
            }

            // ✅ المهمة الثانية: التحقق من كتابة النص المقدس
            if (q.step === 2 && text && text.trim() === q.targetText) {
                q.step = 3;
                q.targetText = '';
                giveReward(5, 10);
                
                const completeMsg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
   *⌬ تـمـت الـمـهـمـة الـثـانـيـة ⌬*
*───━━━⊱  ✅  ⊰━━━───*

*⌠📜⌡ لـقـد أثـبـت جـدارتـك فـي كـتـابـة الـنـص الـمُـقـدس*
*💰 الـجـائـزة: 10 ذهـب + 5 XP*

*⌠⚔️⌡ الـمـهـمـة الـتـالـيـة: اسـتـخـدام 20 أمـر*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

                this.sendMessage(message.key.remoteJid, { text: completeMsg }, { quoted: message });
            }

            // ✅ المهمة الثالثة: استخدام 20 أمر
            if (q.step === 3 && hasPrefix) {
                q.cmdCount = (q.cmdCount || 0) + 1;
                if (q.cmdCount >= 20) {
                    q.step = 4;
                    giveReward(5, 10);
                    
                    this.sendMessage(message.key.remoteJid, { 
                        text: "｢ ✅ ｣ *تـمـت الـمـهـمـة الـثـالـثـة! (استخدام 20 أمر)*\n*الـجـائزة: 10 ذهـب + 5 XP*\n*الـتـالي: الـتـلـفـيـل (الارتـقـاء بـالـمـسـتـوى).*" 
                    }, { quoted: message });
                }
            }

            // ✅ المهمة الرابعة: التلفيل
            if (q.step === 4 && player.levelChanged) {
                q.step = 5;
                giveReward(5, 10);
                
                this.sendMessage(message.key.remoteJid, { 
                    text: "｢ ✅ ｣ *تـمـت الـمـهـمـة الـرابـعـة! (الـتـلـفـيـل)*\n*الـجـائزة: 10 ذهـب + 5 XP*\n*الـتـالي: تـطـهـيـر مـغـارة.*" 
                }, { quoted: message });
                
                player.levelChanged = false;
            }

            // ✅ المهمة الخامسة: الفوز في مغارة
            if (q.step === 5 && player.lastWinInDungeon) {
                q.step = 6;
                giveReward(100, 150);
                
                const finalMsg = `
*──━⊱ 🏆 𝐄𝐕𝐄𝐍𝐓 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄 ⊰━──*
*لـقـد أثـبـت جـدارتـك كـصـيـاد مـحـتـرف!*

*🎁 الـجـائـزة الـنـهـائـيـة:*
*💰 ذهـب : ⦓ +150 ⦔*
*✨ خـبـرة : ⦓ +100 ⦔*

*🌑 نـتـظـرك غـداً فـي مـهـام جـديـدة..*
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*`.trim();
                
                this.sendMessage(message.key.remoteJid, { text: finalMsg }, { quoted: message });
                
                player.lastWinInDungeon = false;
            }

            player.dailyQuests = q;
            soloDB[userLid] = player;
            fs.writeJsonSync(soloPath, soloDB, { spaces: 2 });
        }
    }
} catch (e) {
    console.log("❌ Quest Error:", e); 
}
// ==================== [ مـحـرك مـلاحـم الـمـغـارات - S O L O ] ====================
try {
    const dungeonPath = './data/active_dungeons.json';
    const soloPath = './data/SOLO_LEVELING.json';
    const chatId = message.key.remoteJid;

    if (fs.existsSync(dungeonPath)) {
        let dungeons = fs.readJsonSync(dungeonPath, { throws: false }) || {};
        const currentDungeon = dungeons[chatId];

        if (currentDungeon) {
            const isReplyToDungeon = message.message?.extendedTextMessage?.contextInfo?.stanzaId === currentDungeon.msgId;
            const isAcknowledge = text?.trim() === ".اقتحام";

            if (isReplyToDungeon && isAcknowledge) {
                if (userJid !== currentDungeon.playerId) {
                    resolve(false);
                    return;
                }

                let soloDB = fs.readJsonSync(soloPath, { throws: false }) || {};
                let p = soloDB[userJid];
                if (!p) {
                    resolve(false);
                    return;
                }

                const skills = {
                    "مـقـاتـل ⚔️☞": ["هياج الدماء 🩸", "الزلزال المدمر 🌋", "نصل الإمبراطور ⚔️"],
                    "سـاحـر 🔥☞": ["انفجار النجم ✨", "ثقب المانا الأسود 🌌", "استدعاء التنين 🐉"],
                    "مـغـتـال 🥷🏻☞": ["سكون الليل 🌑", "طعنة القلب 🗡️", "الخيال المتعدد 👥"],
                    "رامـي سـهـام 🏹☞": ["سهم البرق ⚡", "عين الصقر 👁️", "مطر النيازك 🌠"],
                    "مـعـالـج 🧬☞": ["درع الضوء 🛡️", "التجديد المقدس 🌕", "انفجار المانا 🌀"],
                    "مـسـتـحـضـر الأرواح 💀": ["نـهـوض الـفـرسـان 💀", "قـبـضـه الـظـلال 🌑", "صـرخـة الـمـوت 👻"]
                };

                const selectedSkill = (skills[p.class] || skills["مـقـاتـل ⚔️☞"])[Math.floor(Math.random() * 3)];
                let story = "";
                let win = false;
                let resultDetails = "";

                // ✅ قائمة المنتجات (الأسلحة والدروع)
                const products = [
                    { id: 1, name: "🗡️ سيف الظلام", power: 5, crit: 0 },
                    { id: 2, name: "⚔️ سيف كاسر العظام", power: 12, crit: 0 },
                    { id: 3, name: "🗡️◾ نصل الإمبراطور الأسود", power: 25, crit: 5 },
                    { id: 4, name: "🔮 عصا المانا", magic: 5, crit: 0 },
                    { id: 5, name: "✨ صولجان النجوم", magic: 12, crit: 0 },
                    { id: 6, name: "🔥◾ جوهرة التنين الأحمر", magic: 25, crit: 5 },
                    { id: 7, name: "🗡️ سكاكين الظل", power: 5, crit: 0 },
                    { id: 8, name: "🥷 خناجر الشبح", power: 12, crit: 0 },
                    { id: 9, name: "🌑◾ نصل العدم", power: 25, crit: 5 },
                    { id: 10, name: "🏹 قوس الصياد", power: 5, crit: 0 },
                    { id: 11, name: "🎯 قوس الرياح", power: 12, crit: 0 },
                    { id: 12, name: "🌪️◾ قوس العاصفة", power: 25, crit: 5 },
                    { id: 13, name: "🧬 طاقم الشفاء", heal: 5, crit: 0 },
                    { id: 14, name: "✨ صولجان الحياة", heal: 12, crit: 0 },
                    { id: 15, name: "💫◾ طاقم الخلود", heal: 25, crit: 5 },
                    { id: 16, name: "💀 كتاب الموتى", dark: 8, crit: 0 },
                    { id: 17, name: "🦴 صولجان العظام", dark: 18, crit: 0 },
                    { id: 18, name: "👑◾ تاج الظلال", dark: 35, crit: 10 },
                    { id: 19, name: "🧥 معطف المسافر", defense: 2 },
                    { id: 20, name: "🥼 درع الجلد", defense: 5 },
                    { id: 21, name: "⚜️ درع الفارس", defense: 12 },
                    { id: 22, name: "👑◾ درع الملك الظلام", defense: 25 }
                ];

                // ✅ حساب تأثير الأسلحة والدروع
                let critChance = 0;
                let defenseBonus = 0;

                if (p.equipped?.weapon) {
                    const weapon = products.find(w => w.id === p.equipped.weapon);
                    if (weapon?.crit) {
                        critChance = weapon.crit;
                        if (Math.random() * 100 < critChance) {
                            win = true;
                            console.log("💥 ضربة قاضية من السلاح!");
                        }
                    }
                }

                if (p.equipped?.armor) {
                    const armor = products.find(a => a.id === p.equipped.armor);
                    if (armor?.defense) {
                        defenseBonus = armor.defense;
                    }
                }

                // ✅ حساب نتيجة المعركة الأساسية
                if (!win) { // لو ما فازش بالضربة القاضية
                    if (currentDungeon.pIdx < currentDungeon.dIdx) {
                        win = false;
                    } else if (currentDungeon.pIdx === currentDungeon.dIdx) {
                        win = Math.random() > 0.4;
                    } else {
                        win = true;
                    }
                }

                if (win) {
                    const rewards = { 
                        "C": { gold: 50, xp: 100 }, "B": { gold: 150, xp: 300 }, "A": { gold: 500, xp: 500 }, 
                        "S": { gold: 1000, xp: 1000 }, "SS": { gold: 2000, xp: 2000 }, "SSS": { gold: 3000, xp: 5000 } 
                    };
                    const reward = rewards[currentDungeon.dRank] || { gold: 20, xp: 20 };
                    
                    p.gold = (p.gold || 0) + reward.gold;
                    p.xp = (p.xp || 0) + reward.xp;
                    
                    p.lastWinInDungeon = true; 

                    // ✅ تحديث مهام النقابة (الفوز في مغارة)
                    if (p.guild?.currentQuest) {
                        const dungeonWinQuests = ["B3", "A3", "S3", "SS3"]; // مهام الفوز في المغارة
                        if (dungeonWinQuests.includes(p.guild.currentQuest)) {
                            p.guild.questProgress = (p.guild.questProgress || 0) + 1;
                            console.log("✅ تم تحديث مهمة الفوز في مغارة:", p.guild.questProgress);
                            
                            // منع التجاوز عن الهدف
                            const rank = p.rank || "E";
                            const quests = getQuestsByRank(rank);
                            const quest = quests.find(q => q.id === p.guild.currentQuest);
                            if (quest && p.guild.questProgress > quest.target) {
                                p.guild.questProgress = quest.target;
                            }
                        }
                    }

                    story = `*───━━━⊱  ⚔️  ⊰━━━───*\n*✨ مـلـحـمـة الـنـصـر الـمـؤزر ✨*\n\n*انـفـجـرت طـاقـة الـمـانـا مـن جـسـدك! بـتـفـعـيـل مـهـارة ⦓ ${selectedSkill} ⦔، حـطـمـت دفـاعـات وحـش الـرتـبـة [ ${currentDungeon.dRank} ] وأجـبـرتـه عـلـى الـجـثـو أمـامـك قـبـل أن تـقـطـع رأسـه بـضـربـة واحـدة قـاتـلـة.*`;
                    
                    resultDetails = `\n*───━━━⊱ 💰 الـغـنـائـم ⊰━━━───*\n*💰 الـذهـب الـمُـكـتـسـب : ⦓ +${reward.gold} ⦔*\n*✨ نـقـاط الـخـبـرة (XP) : ⦓ +${reward.xp} ⦔*\n*⚔️ رتـبـة الـمـغـارة : ⦓ [ ${currentDungeon.dRank} ] ⦔*`;

                    if (p.class === "مـسـتـحـضـر الأرواح 💀" && ["S", "SS", "SSS"].includes(currentDungeon.dRank)) {
                        story += `\n\n*🌑   ｢ قِـــــــــيـــــــــام ｣   🌑*\n*تـصـاعد الـدخـان الأسـود مـن جـثـة الـوحـش، اهـتـزت الأرض وتـجـسـد ظـل عـمـلاق يـركـع تـحـت قـدمـيـك.. لـقـد انـضـم مـلـك الـمـغـارة إلـى جـيـش ظـلالـك!*`;
                        await this.bot.sock.sendMessage(chatId, { react: { text: "🌌", key: message.key } });
                    } else {
                        await this.bot.sock.sendMessage(chatId, { react: { text: "👑", key: message.key } });
                    }
                } else {
                    const oldLevel = p.level || 1;
                    let lostLevel = Math.max(1, oldLevel - 1);
                    let lostGold = Math.floor((p.gold || 0) * 0.10);
                    
                    // ✅ تطبيق تأثير الدرع على الخسارة
                    if (defenseBonus > 0) {
                        lostGold = Math.floor(lostGold * (1 - defenseBonus / 100));
                        lostLevel = Math.max(1, oldLevel - Math.max(1, Math.floor(defenseBonus / 10)));
                        console.log(`🛡️ الدرع قلل الخسارة: دفاع ${defenseBonus}%`);
                    }
                    
                    p.level = lostLevel;
                    p.gold -= lostGold;

                    story = `*───━━━⊱  🌑  ⊰━━━───*\n*🛑 مـشـهـد الـسـقـوط الـمـروع 🛑*\n\n*انـدفـعـت مـسـتـخـدمـاً ⦓ ${selectedSkill} ⦔، ولـكـن كـان الـفـارق فـي الـقـوة مـرعـبـاً! وحـش الـرتـبـة [ ${currentDungeon.dRank} ] سـحـق عـظـامـك بـضـربـة واحـدة وألـقـى بـك جـثـة هـامـدة خـارج الـبـوابـة بـيـنـمـا تـنـزف مـانـا ودمـاءً.*`;
                    
                    resultDetails = `\n*───━━━⊱ 📉 الـخـسـائـر ⊰━━━───*\n*🔻 الـمـسـتـوى : ⦓ ${oldLevel} ➔ ${p.level} ⦔*\n*💰 ضـريـبـة الـهـزيـمـة : ⦓ -${lostGold} ذهـب ⦔*\n*🩹 الـحـالـة : ⦓ مـصـاب بـجـروح بـالـغـة ⦔*`;
                    await this.bot.sock.sendMessage(chatId, { react: { text: "🩸", key: message.key } });
                }

                const finalMsg = `${story}\n${resultDetails}\n*──────────────────────*\n~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝐆』*~`;
                
                await this.bot.sock.sendMessage(chatId, { text: finalMsg, mentions: [userJid] }, { quoted: message });
                
                delete dungeons[chatId];
                fs.writeJsonSync(dungeonPath, dungeons);
                fs.writeJsonSync(soloPath, soloDB, { spaces: 2 });
                resolve(true);
                return;
            }
        }
    }
} catch (error) {
    console.error("خطأ في نظام المغارات:", error);
}
                    
                    // ==================== [ نظام لعبة XO ] ====================

// التحقق من الموافقة
if (global.xoGames && global.xoGames.pending) {
    const pending = global.xoGames.pending;
    const isReplyToRequest = message.message?.extendedTextMessage?.contextInfo?.stanzaId === pending.msgId;
    
    if (isReplyToRequest && pending.chatId === message.key.remoteJid) {
        const userJid = message.key.participant || message.key.remoteJid;
        const textLower = text.toLowerCase();
        
        // التحقق من الموافقة
        if (textLower === 'موافقة' || textLower === '.موافقة') {
            if (userJid !== pending.player2) {
                await this.sendMessage(message.key.remoteJid, { 
                    text: "*❌ هذا الطلب ليس لك.*" 
                }, { quoted: message });
                resolve(true);
                return;
            }
            
            // بدء اللعبة
            const game = {
                board: [
                    ['1', '2', '3'],
                    ['4', '5', '6'],
                    ['7', '8', '9']
                ],
                players: [pending.player1, pending.player2],
                turn: pending.player1, // المتحدي يبدأ
                moves: 0,
                status: 'playing',
                winner: null,
                msgId: null
            };
            
            global.xoGames[message.key.remoteJid] = game;
            delete global.xoGames.pending;
            
            // عرض لوحة اللعب
            await showXOBoard(this, message.key.remoteJid, game);
            resolve(true);
            return;
        }
    }
}

// معالجة حركة اللعب
if (global.xoGames && global.xoGames[message.key.remoteJid]) {
    const game = global.xoGames[message.key.remoteJid];
    const isReplyToGame = message.message?.extendedTextMessage?.contextInfo?.stanzaId === game.msgId;
    
    if (isReplyToGame && game.status === 'playing') {
        const userJid = message.key.participant || message.key.remoteJid;
        const choice = parseInt(text.trim());
        
        // التحقق من أن اللاعب هو صاحب الدور
        if (userJid !== game.turn) {
            await this.sendMessage(message.key.remoteJid, { 
                text: "*⌠⏳⌡ ليس دورك الآن!*" 
            }, { quoted: message });
            resolve(true);
            return;
        }

        // التحقق من الرقم
        if (isNaN(choice) || choice < 1 || choice > 9) {
            await this.sendMessage(message.key.remoteJid, { 
                text: "*❌ الرجاء اختيار رقم من 1 إلى 9.*" 
            }, { quoted: message });
            resolve(true);
            return;
        }

        // التحقق من الخلية
        const row = Math.floor((choice - 1) / 3);
        const col = (choice - 1) % 3;
        
        if (game.board[row][col] === 'X' || game.board[row][col] === 'O') {
            await this.sendMessage(message.key.remoteJid, { 
                text: "*❌ هذه الخلية محجوزة بالفعل!*" 
            }, { quoted: message });
            resolve(true);
            return;
        }

        // وضع العلامة
        const symbol = game.turn === game.players[0] ? 'X' : 'O';
        game.board[row][col] = symbol;
        game.moves++;

        // التحقق من الفوز (بكل الطرق)
        const winner = checkXOWinner(game.board);
        
        if (winner) {
            game.status = 'ended';
            game.winner = winner === 'X' ? game.players[0] : game.players[1];
            
            // عرض اللوحة النهائية
            await showXOBoard(this, message.key.remoteJid, game);
            
            // إرسال نتيجة الفوز
            await this.sendMessage(message.key.remoteJid, { 
                text: `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
      *⌬ فـاز فـي لـعـبـة XO ⌬*
*───━━━⊱  🏆  ⊰━━━───*

*👑 الـفـائـز : ⦓ @${game.winner.split('@')[0]} ⦔*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*💠 " لـعـبـة مـثـيـرة، أهـنـئـك عـلـى الـفـوز! "*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`,
                mentions: [game.winner]
            });
            
            delete global.xoGames[message.key.remoteJid];
            resolve(true);
            return;
            
        } else if (game.moves === 9) {
            // تعادل
            game.status = 'ended';
            
            // عرض اللوحة النهائية
            await showXOBoard(this, message.key.remoteJid, game);
            
            await this.sendMessage(message.key.remoteJid, { 
                text: `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
      *⌬ تـعـادل فـي XO ⌬*
*───━━━⊱  🤝  ⊰━━━───*

*👥 الـلاعـبـان :*
*│ @${game.players[0].split('@')[0]}*
*│ @${game.players[1].split('@')[0]}*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*💠 " لـعـبـة مـثـيـرة، اعـدوا الـكـرة! "*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`,
                mentions: game.players
            });
            
            delete global.xoGames[message.key.remoteJid];
            resolve(true);
            return;
            
        } else {
            // تبديل الدور
            game.turn = game.turn === game.players[0] ? game.players[1] : game.players[0];
            await showXOBoard(this, message.key.remoteJid, game);
            resolve(true);
            return;
        }
    }
}

// دالة التحقق من الفوز (بكل الطرق)
function checkXOWinner(board) {
    // جميع حالات الفوز الممكنة
    const winPatterns = [
        // أفقي
        [[0,0], [0,1], [0,2]],
        [[1,0], [1,1], [1,2]],
        [[2,0], [2,1], [2,2]],
        // عمودي
        [[0,0], [1,0], [2,0]],
        [[0,1], [1,1], [2,1]],
        [[0,2], [1,2], [2,2]],
        // قطري
        [[0,0], [1,1], [2,2]],
        [[0,2], [1,1], [2,0]]
    ];
    
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a[0]][a[1]] === board[b[0]][b[1]] && 
            board[b[0]][b[1]] === board[c[0]][c[1]]) {
            return board[a[0]][a[1]];
        }
    }
    
    return null;
}

// دالة عرض لوحة اللعب (بشكل محسن في المنتصف)
async function showXOBoard(handler, chatId, game) {
    const board = game.board;
    const currentPlayer = game.turn;
    
    // تصميم اللوحة بشكل جميل وفي المنتصف
    let boardDisplay = '';
    boardDisplay += '╔═══╤═══╤═══╗\n';
    
    board.forEach((row, i) => {
        boardDisplay += '║';
        row.forEach((cell, j) => {
            if (cell === 'X') boardDisplay += ' ❌ ';
            else if (cell === 'O') boardDisplay += ' ⭕ ';
            else boardDisplay += ` ${cell}  `;
            
            if (j < 2) boardDisplay += '│';
        });
        boardDisplay += '║\n';
        
        if (i < 2) {
            boardDisplay += '╟───┼───┼───╢\n';
        }
    });
    
    boardDisplay += '╚═══╧═══╧═══╝';

    const turnMsg = game.status === 'playing' 
        ? `\n*⌠🎮⌡ دور : ⦓ @${currentPlayer.split('@')[0]} ⦔ (${currentPlayer === game.players[0] ? '❌' : '⭕'})*`
        : '';

    // استخدام `` لضمان توسيط اللوحة
    const boardMsg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
      *⌬ لـعـبـة XO الـشـهـيـرة ⌬*
*───━━━⊱  🎮  ⊰━━━───*

\`\`\`
${boardDisplay}
\`\`\`
${turnMsg ? turnMsg + '\n' : ''}
*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;

    const mentions = game.status === 'playing' ? [currentPlayer] : game.players;
    const sentMsg = await handler.sendMessage(chatId, { 
        text: boardMsg, 
        mentions 
    });
    
    if (game.status === 'playing') {
        game.msgId = sentMsg.key.id;
    }
}

// نظام الكتم (مسح رسائل المکتومين) - يمسح كل شيء
if (isGroup) {
    const mutePath = './data/muted.json';
    if (fs.existsSync(mutePath)) {
        const mutedDB = fs.readJsonSync(mutePath, { throws: false }) || {};
        const muteKey = `${message.key.remoteJid}_${userJid}`;
        
        if (mutedDB[muteKey]) {
            try {
                // الطريقة الصحيحة لمسح أي نوع من الرسائل
                await bot.sock.sendMessage(message.key.remoteJid, {
                    delete: {
                        remoteJid: message.key.remoteJid,
                        fromMe: message.key.fromMe,
                        id: message.key.id,
                        participant: message.key.participant
                    }
                });
                
                // بصمت تام (مافيش رد)
                return;
            } catch (error) {
                console.error("❌ خطأ في مسح رسالة مكتوم:", error);
            }
        }
    }
}

                    if (hasPrefix) {
                        const result = await this.handlePrefixCommand(message, text, userJid, isGroup, isDev);
                        if (result) {
                            resolve(true);
                            return;
                        }
                    }

                    const autoResult = await this.handleAutoCommand(message, text, userJid, isGroup, isDev);
                    if (autoResult) {
                        resolve(true);
                        return;
                    }
                    
                    const continuousResult = await this.handleContinuousCommand(message, text, userJid);
                    if (continuousResult) {
                        resolve(true);
                        return;
                    }

                    resolve(false);
                } catch (error) {
                    this.stats.errors++;
                    console.log(chalk.red(`❌ Command error in [${cmdName || 'unknown'}]:`), error.message);
                    resolve(false);
                }
            });
        });
    }
    async handlePrefixCommand(message, text, userJid, isGroup, isDev) {
    const prefix = this.bot.config.PREFIX;
    const args = text.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    
    const command = this.commands.get(cmdName) || this.commands.get(this.aliases.get(cmdName));
    if (!command) return false;

    // ⚡ نظام تحقق سريع مع كاش
    const permissionCheck = await this.checkPermissions(command, userJid, isGroup, isDev, message);
    if (!permissionCheck.allowed) {
        if (permissionCheck.message && message) {
            await this.sendMessage(message.key.remoteJid, { text: permissionCheck.message });
        }
        return false;
    }

    console.log(gradient.mind(`🎯 Executing: ${command.name} from ${this.getSenderInfo(message)}`));

    const userData = this.getUserData(userJid);
    userData.commandCount++;
    command.usageCount = (command.usageCount || 0) + 1;
    command.lastUsed = Date.now();
    this.updateCooldown(command, message);

    this.updateCommandStats(userData, command.category);

    const runOptions = {
        bot: this.bot,
        sock: this.bot.sock,
        m: message,
        message: message,
        args: args,
        text: args.join(' '),
        handler: this,
        command: command.name,
        prefix: prefix,
        user: userData,
        userJid: userJid,
        isGroup: isGroup,
        isDeveloper: isDev,
        reply: (content, options = {}) => this.sendMessage(
            message.key.remoteJid,
            (typeof content === 'string' ? { text: content } : content),
            { quoted: message, ...options }
        ),
        react: (emoji) => this.react(message, emoji),
        sendMessage: (jid, content, options) => this.sendMessage(jid, content, options),
        getUserInfo: (targetArgs = args) => this.getUserInfo(this.bot.sock, message, targetArgs),
        getGroupInfo: () => this.getGroupInfo(message.key.remoteJid),
        startContinuous: (data = {}) => this.startContinuousCommand(userJid, command, data),
        endContinuous: () => this.endContinuousCommand(userJid),
        wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
        log: (msg, type = 'info') => {
            const colors = { info: chalk.blue, warn: chalk.yellow, error: chalk.red };
            console.log(colors[type](`[${command.name}]`), msg);
        },
        formatNumber: (num) => new Intl.NumberFormat().format(num),
        formatTime: (ms) => this.formatUptime(ms),
        downloadMedia: () => this.downloadMedia(message),
        sendMedia: (jid, buffer, type, options) => this.sendMedia(jid, buffer, type, options),
        createButtons: (buttons, text, title) => this.createButtons(buttons, text, title),
        createList: (sections, title, text) => this.createList(sections, title, text),
    };
    
    try {
        await command.run(runOptions);
        this.stats.commandsExecuted++;
        return true;
    } catch (error) {
        console.log(chalk.red(`❌ Command execution error [${command.name}]:`), error);
        await this.sendMessage(message.key.remoteJid, { 
            text: `❌ حدث خطأ أثناء تنفيذ الأمر: ${error.message}` 
        });
        return true;
    }
}

// 🎮 نظام جلسات الألعاب
createGameSession(userJid, gameType, initialData = {}) {
    const sessionId = `${userJid}_${gameType}_${Date.now()}`;
    const session = {
        id: sessionId,
        userJid: userJid,
        gameType: gameType,
        data: initialData,
        state: 'waiting',
        players: [userJid],
        createdAt: Date.now(),
        lastActivity: Date.now(),
        maxPlayers: initialData.maxPlayers || 10,
        settings: {
            private: initialData.private || false,
            password: initialData.password || null,
            timeLimit: initialData.timeLimit || 300000
        }
    };

    this.gameSessions.set(sessionId, session);
    
    setTimeout(() => {
        if (this.gameSessions.has(sessionId)) {
            this.endGameSession(sessionId);
        }
    }, session.settings.timeLimit);

    return session;
}

joinGameSession(sessionId, userJid, password = null) {
    const session = this.gameSessions.get(sessionId);
    if (!session) return { success: false, reason: 'SESSION_NOT_FOUND' };

    if (session.settings.private && session.settings.password !== password) {
        return { success: false, reason: 'INVALID_PASSWORD' };
    }

    if (session.players.length >= session.maxPlayers) {
        return { success: false, reason: 'SESSION_FULL' };
    }

    if (session.state !== 'waiting' && !session.settings.allowLateJoin) {
        return { success: false, reason: 'SESSION_STARTED' };
    }

    if (!session.players.includes(userJid)) {
        session.players.push(userJid);
        session.lastActivity = Date.now();
    }

    return { success: true, session: session };
}

endGameSession(sessionId) {
    const session = this.gameSessions.get(sessionId);
    if (session) {
        this.gameSessions.delete(sessionId);
        return true;
    }
    return false;
}

getActiveGameSessions(gameType = null) {
    const now = Date.now();
    const activeSessions = [];

    for (const [sessionId, session] of this.gameSessions) {
        if (now - session.lastActivity < 600000) {
            if (!gameType || session.gameType === gameType) {
                activeSessions.push(session);
            }
        } else {
            this.endGameSession(sessionId);
        }
    }

    return activeSessions;
}

// ==================== ✨ نظام التحقق من الصلاحيات (محسن مع Cache) ✨ ====================
async checkPermissions(command, userJid, isGroup, isDev, message) {
    if (this.bot.config?.MODE === 'private' && !isDev) return { allowed: false };
    
    if (command.developer && !isDev) return { allowed: false, message:'*❌ الأمـࢪ ده لـلـمـطـوࢪ بـس يـحـبـي.*' };

    if (command.group && !isGroup) return { allowed: false, message: '*❌ هـذا الأمـࢪ يـعـمـل فـي الـمـجـمـوعـات فـقـط.*' };
    
    if (command.private && isGroup) return { allowed: false, message: '❌ هذا الأمر للخاص فقط' };

    // لو مش محتاج صلاحيات مجموعة، نرجع على طول
    if (!isGroup || (!command.admin && !command.botAdmin)) {
        return { allowed: true };
    }

    // جلب بيانات المجموعة مرة واحدة فقط
    let groupMetadata;
    const groupJid = message.key.remoteJid;
    
    // نشوف لو في الكاش
    groupMetadata = this.cache.get(groupJid);
    if (!groupMetadata) {
        console.log(chalk.yellow(`[Cache] Miss for group: ${groupJid}`));
        try {
            groupMetadata = await this.bot.sock.groupMetadata(groupJid);
            this.cache.set(groupJid, groupMetadata);
        } catch (error) {
            console.log(chalk.red('❌ Failed to fetch group metadata:'), error.message);
            return { allowed: false, message: '*❌ فـشـل الـتـحـقـق مـن الـصـلـاحـيـات*' };
        }
    } else {
        console.log(chalk.green(`[Cache] Hit for group: ${groupJid}`));
    }

    // التحقق من صلاحية المشرفين
    if (command.admin) {
        const senderParticipant = groupMetadata.participants.find(p => p.id === userJid);
        if (!senderParticipant?.admin && !isDev) {
            return { allowed: false, message: '*❌ هـذا الأمـࢪ لـلـمـشـࢪفـيـن فـقـط.*' };
        }
    }
    
    // التحقق من صلاحية البوت كمشرف
    if (command.botAdmin) {
        const botJid = this.bot.sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const botParticipant = groupMetadata.participants.find(p => p.id === botJid);
        if (!botParticipant?.admin) {
            return { allowed: false, message: '*❌ يجب أن يكون البوت مشرفًا*' };
        }
    }

    return { allowed: true };
}

// ==================== نظام إدارة الجروبات المحسن ====================
async isGroupAdmin(groupJid, userJid) {
    try {
        const metadata = await this.bot.sock.groupMetadata(groupJid);
        const participant = metadata.participants.find(p => p.id === userJid);
        return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (error) {
        console.log(chalk.red('❌ Check group admin error:'), error.message);
        return false;
    }
}

async getGroupInfo(groupJid) {
    try {
        const metadata = await this.bot.sock.groupMetadata(groupJid);
        return {
            id: metadata.id,
            subject: metadata.subject,
            description: metadata.desc,
            size: metadata.participants.length,
            creation: metadata.creation,
            owner: metadata.owner,
            admins: metadata.participants.filter(p => p.admin).map(p => p.id),
            participants: metadata.participants
        };
    } catch (error) {
        console.log(chalk.red('❌ Get group info error:'), error.message);
        return null;
    }
}

// ==================== نظام الإحصائيات المحسن ====================
updateCommandStats(userData, category) {
    if (!userData.stats) return;

    const statMap = {
        admin: 'adminCommandsUsed',
        game: 'gameCommandsUsed',
        info: 'infoCommandsUsed',
        media: 'mediaCommandsUsed',
        download: 'downloads',
        tool: 'queries'
    };

    const statKey = statMap[category] || 'queries';
    userData.stats[statKey] = (userData.stats[statKey] || 0) + 1;
}

// ==================== نظام Cooldown المحسن ====================
checkCooldown(command, message) {
    const userJid = this.getUserJid(message);
    const cooldownKey = `${userJid}:${command.name}`;
    const now = Date.now();

    if (this.cooldowns.has(cooldownKey)) {
        const expirationTime = this.cooldowns.get(cooldownKey) + (command.cooldown || 2000);
        if (now < expirationTime) {
            const remaining = Math.ceil((expirationTime - now) / 1000);
            return { allowed: false, remaining };
        }
    }

    return { allowed: true, remaining: 0 };
}

updateCooldown(command, message) {
    const userJid = this.getUserJid(message);
    const cooldownKey = `${userJid}:${command.name}`;
    this.cooldowns.set(cooldownKey, Date.now());
}

// ==================== نظام الأوامر المستمرة ====================
startContinuousCommand(userJid, command, initialData = {}) {
    this.continuousCommands.set(userJid, {
        command,
        data: initialData,
        step: 0,
        timestamp: Date.now()
    });

    setTimeout(() => {
        if (this.continuousCommands.get(userJid)?.timestamp === Date.now() - 600000) {
            this.endContinuousCommand(userJid);
        }
    }, 600000);

    return true;
}

endContinuousCommand(userJid) {
    this.continuousCommands.delete(userJid);
    return true;
}

async handleContinuousCommand(message, text, userJid) {
    const continuousData = this.continuousCommands.get(userJid);
    if (!continuousData) return false;

    const { command, data, step } = continuousData;
    
    if (command.onContinue && typeof command.onContinue === 'function') {
        try {
            const result = await command.onContinue({
                bot: this.bot,
                sock: this.bot.sock,
                message: message,
                text: text,
                userJid: userJid,
                data: data,
                step: step,
                handler: this,
                reply: (content) => this.sendMessage(message.key.remoteJid, 
                    typeof content === 'string' ? { text: content } : content, 
                    { quoted: message }
                ),
                endContinuous: () => this.endContinuousCommand(userJid)
            });

            if (result === true || result === 'continue') {
                this.continuousCommands.set(userJid, {
                    command,
                    data: result.data || data,
                    step: step + 1,
                    timestamp: Date.now()
                });
            } else if (result === false || result === 'end') {
                this.endContinuousCommand(userJid);
            }

            return true;
        } catch (error) {
            console.log(chalk.red(`❌ Continuous command error:`), error.message);
            this.endContinuousCommand(userJid);
            return true;
        }
    }

    return false;
}

// ==================== نظام الأوامر التلقائية ====================
async handleAutoCommand(message, text, userJid, isGroup, isDev) {
    for (const [cmdName, command] of this.autoCommands.entries()) {
        if (this.textMatchesCommand(text, cmdName, command.aliases)) {
            const permissionCheck = await this.checkPermissions(command, userJid, isGroup, isDev, message);
            if (!permissionCheck.allowed) {
                continue;
            }

            const args = this.extractAutoCommandArgs(text, cmdName, command.aliases);
            
            console.log(gradient.mind(`🎯 Executing AUTO: ${command.name} from ${this.getSenderInfo(message)}`));

            const userData = this.getUserData(userJid);
            userData.messageCount++;
            userData.lastSeen = Date.now();
            command.usageCount = (command.usageCount || 0) + 1;
            command.lastUsed = Date.now();
            userData.commandCount++;
            this.updateCooldown(command, message);

            const runOptions = {
                bot: this.bot,
                sock: this.bot.sock,
                message: message,
                args: args,
                text: args.join(' '),
                handler: this,
                command: command.name,
                prefix: this.bot.config.PREFIX,
                user: userData,
                userJid: userJid,
                isGroup: isGroup,
                isDeveloper: isDev,
                isAuto: true,
                reply: (content, options = {}) => this.sendMessage(
                    message.key.remoteJid,
                    typeof content === 'string' ? { text: content } : content,
                    { quoted: message, ...options }
                ),
                react: (emoji) => this.react(message, emoji),
                sendMessage: (jid, content, options) => this.sendMessage(jid, content, options),
                getUserInfo: (targetArgs = args) => this.getUserInfo(this.bot.sock, message, targetArgs),
                startContinuous: (data = {}) => this.startContinuousCommand(userJid, command, data),
                endContinuous: () => this.endContinuousCommand(userJid)
            };
            
            await command.run(runOptions);
            this.stats.commandsExecuted++;
            return true;
        }
    }
    return false;
}

textMatchesCommand(text, cmdName, aliases = []) {
    const cleanText = text.toLowerCase().trim();
    const patterns = [cmdName.toLowerCase(), ...aliases.map(a => a.toLowerCase())];
    
    return patterns.some(pattern => {
        return cleanText === pattern || 
               cleanText.startsWith(pattern + ' ') ||
               cleanText.includes(' ' + pattern + ' ') ||
               cleanText.endsWith(' ' + pattern);
    });
}

extractAutoCommandArgs(text, cmdName, aliases = []) {
    const patterns = [cmdName, ...aliases].map(p => p.toLowerCase());
    let cleanText = text.toLowerCase();
    
    for (const pattern of patterns) {
        if (cleanText.includes(pattern)) {
            cleanText = cleanText.replace(pattern, '').trim();
            break;
        }
    }
    
    return cleanText.split(/ +/).filter(arg => arg.length > 0);
}

// ==================== دوال مساعدة محسنة ====================
getSenderInfo(message) {
    const jid = message.key.remoteJid;
    const name = message.pushName || 'Unknown';
    const isGroup = jid.endsWith('@g.us');
    const isFromMe = message.key.fromMe;
    
    if (isFromMe) return 'BOT';
    if (isGroup) return `${name} (Group)`;
    return name;
}

getUserJid(message) {
    return message.key.participant || message.key.remoteJid;
}

isGroup(message) {
    return message.key.remoteJid.endsWith('@g.us');
}

extractText(message) {
    const msg = message.message;
    if (msg.conversation) return msg.conversation;
    if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
    if (msg.imageMessage?.caption) return msg.imageMessage.caption;
    if (msg.videoMessage?.caption) return msg.videoMessage.caption;
    if (msg.buttonsResponseMessage?.selectedButtonId) return `button:${msg.buttonsResponseMessage.selectedButtonId}`;
    if (msg.listResponseMessage?.title) return `list:${msg.listResponseMessage.title}`;
    return null;
}
    // ==================== نظام الإرسال المحسن ====================
    async sendMessage(jid, content, options = {}) {
        try {
            if (typeof content === 'string') {
                content = { text: content };
            }

            const newOptions = { ...options };

            if (newOptions.quoted && newOptions.quoted.key) {
                newOptions.quoted = {
                    key: newOptions.quoted.key,
                    message: newOptions.quoted.message
                };
            }

            return await this.bot.sendMessage(jid, content, newOptions);

        } catch (error) {
            if (!error.message.includes('Invalid media type')) {
                console.log(chalk.red(`❌ Send message error: ${error.message}`));
            }
            return null;
        }
    }

    async react(message, emoji) {
        try {
            await this.bot.sendMessage(message.key.remoteJid, {
                react: {
                    text: emoji,
                    key: message.key
                }
            });
        } catch (error) {
            console.log(chalk.red(`❌ React error: ${error.message}`));
        }
    }

    // ==================== ✨ نظام الوسائط الفائق ====================
    async downloadMedia(message) {
        try {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const original = message.message;

            let type = null;
            let mediaMessage = null;

            if (quoted) {
                type = Object.keys(quoted)[0];
                mediaMessage = quoted[type];
            } else if (original) {
                type = Object.keys(original)[0];
                mediaMessage = original[type];
            }

            if (!mediaMessage || !type) {
                console.log(chalk.red('❌ Media message not found.'));
                return null;
            }
            
            const stream = await downloadContentFromMessage(mediaMessage, type.replace('Message', ''));
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            console.log(chalk.green(`✅ Media downloaded successfully (${(buffer.length / 1024).toFixed(2)} KB)`));
            return buffer;

        } catch (error) {
            console.log(chalk.red('❌ Media download error:'), error.message);
            return null;
        }
    }

    async sendMedia(jid, buffer, type, options = {}) {
        try {
            let mediaMessage = {};
            
            switch (type) {
                case 'image':
                    mediaMessage = { image: buffer, ...options };
                    break;
                case 'video':
                    mediaMessage = { video: buffer, ...options };
                    break;
                case 'audio':
                    mediaMessage = { audio: buffer, ...options };
                    break;
                case 'document':
                    mediaMessage = { document: buffer, ...options };
                    break;
                case 'sticker':
                    mediaMessage = { sticker: buffer, ...options };
                    break;
            }
            
            return await this.sendMessage(jid, mediaMessage);
        } catch (error) {
            console.log(chalk.red(`❌ Send media error: ${error.message}`));
            return null;
        }
    }

    // ==================== نظام الأزرار والقوائم المحسن ====================
    createButtons(buttons, text = 'اختر من الأزرار:', title = 'SOLO BOT') {
        return {
            text: text,
            footer: 'SOLO BOT - SUNG',
            title: title,
            buttons: buttons.map(btn => ({
                buttonId: btn.id,
                buttonText: { 
                    displayText: btn.text 
                },
                type: 1
            })),
            headerType: 1
        };
    }

    createList(sections, title = 'القائمة', text = 'اختر من القائمة:') {
        return {
            text: text,
            footer: 'SOLO BOT - SUNG',
            title: title,
            buttonText: 'عرض الخيارات',
            sections: Array.isArray(sections) ? sections : [sections]
        };
    }

    createSection(title, rows) {
        return {
            title: title,
            rows: rows.map(row => ({
                title: row.title,
                description: row.description || '',
                rowId: row.id || Math.random().toString(36).substring(7)
            }))
        };
    }

    // ==================== نظام مراقبة البلجنات المحسن ====================
    async startPluginWatcher() {
        try {
            const { default: chokidar } = await import('chokidar');
            
            if (this.watcher) await this.watcher.close();

            this.watcher = chokidar.watch(this.pluginDir, {
                persistent: true,
                ignoreInitial: true,
                atomic: true,
                awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 }
            });

            const handleFileEvent = async (filePath, eventType) => {
                if (this.isReloading || !filePath.endsWith('.js')) return;

                const filename = path.basename(filePath);
                
                try {
                    switch (eventType) {
                        case 'change':
                            console.log(chalk.yellow(`🔄 Plugin changed: ${filename}`));
                            await this.reloadPlugin(filename);
                            break;
                        case 'add':
                            console.log(chalk.green(`📁 New plugin: ${filename}`));
                            await this.loadSinglePlugin(filename);
                            this.showLoadedCommands();
                            break;
                        case 'unlink':
                            console.log(chalk.yellow(`🗑️ Plugin deleted: ${filename}`));
                            await this.unloadPlugin(filename);
                            this.showLoadedCommands();
                            break;
                    }
                } catch (error) {
                    console.log(chalk.red(`❌ Plugin ${eventType} failed for ${filename}:`), error.message);
                }
            };

            this.watcher
                .on('change', (filePath) => handleFileEvent(filePath, 'change'))
                .on('add', (filePath) => handleFileEvent(filePath, 'add'))
                .on('unlink', (filePath) => handleFileEvent(filePath, 'unlink'));

            console.log(chalk.cyan('👀 Plugin watcher V2 started successfully'));

        } catch (error) {
            console.log(chalk.red('❌ Plugin watch error:'), error.message);
        }
    }

    // ==================== ✨ نظام مراقبة الكونفج الجديد ✨ ====================
    async startConfigWatcher() {
        try {
            const { default: chokidar } = await import('chokidar');
            const configPath = path.resolve(process.cwd(), 'config.js');

            if (this.configWatcher) await this.configWatcher.close();

            this.configWatcher = chokidar.watch(configPath, {
                persistent: true,
                ignoreInitial: true,
                awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 100 }
            });

            this.configWatcher.on('change', async (filePath) => {
                console.log(chalk.yellow('🔄 Config file changed. Reloading configuration...'));
                try {
                    const { config: newConfig } = await import(`${pathToFileURL(filePath).href}?v=${Date.now()}`);
                    this.bot.config = newConfig;
                    console.log(chalk.green('✅ Config reloaded successfully!'));
                    
                    const devJid = this.bot.config.OWNERERROR || (this.bot.config.DEVELOPERS && this.bot.config.DEVELOPERS[0]);
                } catch (error) {
                    console.log(chalk.red('❌ Failed to reload config:'), error.message);
                }
            });

            console.log(chalk.cyan('⚙️ Config watcher started successfully'));

        } catch (error) {
            console.log(chalk.red('❌ Config watch error:'), error.message);
        }
    }

    // =================================================================
    // ✨ نظام مراقبة الملفات الأساسية (Hot Reloading) ✨
    // =================================================================
    async startCoreFileWatcher() {
        try {
            if (this.coreWatcher) await this.coreWatcher.close();

            const { default: chokidar } = await import('chokidar');
            const rootDir = process.cwd();
            
            const pathsToWatch = [
                path.join(rootDir, 'handler.js'),
                path.join(rootDir, 'index.js'),
                path.join(rootDir, 'console.js'),
                path.join(rootDir, 'messages.js')
            ];

            this.coreWatcher = chokidar.watch(pathsToWatch, {
                persistent: true,
                ignoreInitial: true,
                atomic: true,
                awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 }
            });

            this.coreWatcher.on('change', async (filePath) => {
                const filename = path.basename(filePath);
                console.log(chalk.magenta(`🚨 Core file (${filename}) changed. Triggering bot restart...`));
                
                const devJid = this.bot.config.OWNERERROR || this.bot.config.DEVELOPERS?.[0];
                if (devJid) {
                    try {
                        await this.bot.sendMessage(devJid, { text: `🚨 تم تعديل ملف أساسي (${filename}). سيتم إعادة تشغيل البوت الآن...` });
                    } catch (e) {
                        console.log(chalk.red('Could not send restart notification to developer.'));
                    }
                }

                if (typeof this.bot.restart === 'function') {
                    await this.bot.restart();
                } else {
                    console.log(chalk.red('  > Restart function not found on bot object. Exiting process...'));
                    process.exit(1);
                }
            });

            console.log(chalk.blueBright('👀 Core file watcher started successfully.'));

        } catch (error) {
            console.log(chalk.red('❌ Core file watch error:'), error.message);
        }
    }

    async reloadPlugin(pluginName) {
        let filename;
        
        for (const [loadedFilename, plugin] of this.plugins.entries()) {
            if (loadedFilename.replace('.js', '') === pluginName || 
                loadedFilename === pluginName ||
                (plugin.name && plugin.name === pluginName)) {
                filename = loadedFilename;
                break;
            }
        }
        
        if (!filename) {
            filename = pluginName.endsWith('.js') ? pluginName : `${pluginName}.js`;
            if (!this.plugins.has(filename)) {
                console.log(chalk.red(`❌ Reload failed: Plugin "${pluginName}" not found.`));
                console.log(chalk.yellow(`📁 Available plugins: ${Array.from(this.plugins.keys()).join(', ')}`));
                return false;
            }
        }

        const plugin = this.plugins.get(filename);
        console.log(chalk.cyan(`🔄 Reloading: ${filename} (${plugin.name})`));

        if (plugin.onUnload) {
            try {
                await plugin.onUnload();
            } catch (error) {
                console.log(chalk.red(`❌ Plugin onUnload failed: ${filename}`), error.message);
            }
        }

        if (plugin.commands && Array.isArray(plugin.commands)) {
            plugin.commands.forEach(cmd => {
                this.commands.delete(cmd.name);
                if (cmd.aliases) {
                    cmd.aliases.forEach(alias => this.aliases.delete(alias));
                }
            });
        } else if (plugin.name) {
            this.commands.delete(plugin.name);
            if (plugin.aliases) {
                plugin.aliases.forEach(alias => this.aliases.delete(alias));
            }
        }

        try {
            await this.loadSinglePlugin(filename);
            console.log(chalk.green(`✅ Successfully reloaded: ${filename}`));
            return true;
        } catch (error) {
            console.log(chalk.red(`❌ Failed to reload: ${filename}`), error.message);
            return false;
        }
    }

    async unloadPlugin(pluginName) {
        if (this.isReloading) return false;
        
        try {
            const plugin = this.plugins.get(pluginName);
            if (!plugin) return false;

            console.log(chalk.yellow(`🔄 Unloading: ${pluginName}`));

            if (plugin.onUnload) {
                try {
                    await plugin.onUnload();
                } catch (error) {
                    console.log(chalk.red(`❌ Plugin onUnload failed: ${pluginName}`), error.message);
                }
            }

            if (plugin.commands) {
                plugin.commands.forEach(cmd => {
                    this.commands.delete(cmd.name);
                    if (cmd.aliases) {
                        cmd.aliases.forEach(alias => {
                            this.aliases.delete(alias);
                        });
                    }
                });
            }

            this.plugins.delete(pluginName);
            console.log(chalk.green(`✅ Unloaded: ${pluginName}`));
            return true;
        } catch (error) {
            console.log(chalk.red(`❌ Unload plugin error: ${pluginName}`), error);
            return false;
        }
    }

    // ==================== نظام مراقبة الأداء ====================
    startPerformanceMonitor() {
        setInterval(() => {
            const memoryUsage = process.memoryUsage();
            const heapUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
            const heapTotal = Math.round(memoryUsage.heapTotal / 1024 / 1024);
            
            if (heapUsed > 500) {
                global.gc && global.gc();
            }
        }, 60000);
    }

    // ==================== نظام التنظيف المحسن ====================
    startCleanupCycle() {
        setInterval(() => {
            this.cleanupExpiredData();
        }, 300000);
    }

    cleanupExpiredData() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, timestamp] of this.cooldowns.entries()) {
            if (now - timestamp > 300000) {
                this.cooldowns.delete(key);
                cleaned++;
            }
        }
        
        for (const [key, data] of this.security.spamDetection.entries()) {
            if (now - data.lastMessage > 600000) {
                this.security.spamDetection.delete(key);
                cleaned++;
            }
        }
        
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheTTL) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            console.log(chalk.blue(`🧹 Cleaned ${cleaned} expired entries`));
        }
    }

    // ==================== دوال الاستعلام المحسنة ====================
    getAllPlugins() {
        return Array.from(this.plugins.values());
    }

    getAllCommands() {
        return Array.from(this.commands.values());
    }

    getCommandsByCategory(category) {
        return this.getAllCommands().filter(cmd => cmd.category === category);
    }

    getPlugin(name) {
        return this.plugins.get(name);
    }

    getCommand(name) {
        return this.commands.get(name) || this.commands.get(this.aliases.get(name));
    }

    getStats() {
        const uptime = Date.now() - this.stats.startTime;
        const memory = process.memoryUsage();
        
        return {
            ...this.stats,
            uptime: this.formatUptime(uptime),
            pluginsCount: this.plugins.size,
            commandsCount: this.commands.size,
            memory: Math.round(memory.heapUsed / 1024 / 1024) + 'MB',
            mode: this.bot.config?.MODE || 'public',
            gameSessions: this.gameSessions.size
        };
    }

    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const parts = [];
        if (days > 0) parts.push(`${days} يوم`);
        if (hours > 0) parts.push(`${hours} ساعة`);
        if (minutes > 0) parts.push(`${minutes} دقيقة`);
        if (secs > 0) parts.push(`${secs} ثانية`);

        return parts.join(' ') || '0 ثانية';
    }

    getCommandUsage() {
        const commands = this.getAllCommands();
        return commands
            .filter(cmd => cmd.usageCount > 0)
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 10)
            .map(cmd => ({
                name: cmd.name,
                usageCount: cmd.usageCount,
                plugin: cmd.plugin,
                category: cmd.category,
                lastUsed: cmd.lastUsed ? new Date(cmd.lastUsed).toLocaleString() : 'Never'
            }));
    }

    // ==================== نظام إعادة التحميل المحسن ====================
    async reloadAllPlugins() {
        console.log(chalk.yellow('🔄 Manual reload started...'));
        
        this.isReloading = true;
        try {
            const pluginNames = Array.from(this.plugins.keys());
            let successCount = 0;
            
            for (const pluginName of pluginNames) {
                try {
                    await this.unloadPlugin(pluginName);
                    successCount++;
                } catch (error) {
                    console.log(chalk.red(`❌ Failed to unload: ${pluginName}`));
                }
            }
            
            await this.loadPlugins();
            console.log(chalk.green(`✅ Reloaded ${successCount} plugins`));
            return successCount;
            
        } finally {
            this.isReloading = false;
        }
    }

    // ==================== الإغلاق المحسن ====================
    async close() {
        if (this.watcher) {
            await this.watcher.close();
        }
        this.saveData();
        this.isInitialized = false;
        console.log(chalk.yellow('🛑 Handler stopped'));
    }
}

export { Handler };