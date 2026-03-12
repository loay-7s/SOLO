import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = process.cwd();

export default {
  name: "ملفات",
  description: "نظام إدارة ملفات شامل (عرض/فتح/عرض-محتوى/إضافة/حذف/تعديل/تغيير/إنشاء/تحديث)",
  usage: ".ملفات [قائمة|فتح|عرض|اضافه|حذف|تعديل|تغيير|انشاء|تحديث] ...",
  developer: true,
  async run({ message, reply, args, handler, downloadMedia, sock }) {
    try {
      const sub = (args && args[0]) ? args[0].toLowerCase() : 'قائمة';

      // ----- مساعدات ----- //
      const human = (n) => n; // ممكن تحسين الترميز لاحقاً
      const safeStat = async (p) => {
        try { return await fsp.stat(p); } catch(e) { return null; }
      };

      // يبني لائحة مرقمة شاملة لكل الملفات/المجلدات في جذر البوت
      async function buildIndex(base = ROOT) {
        const items = [];
        async function walk(dir, prefix = '') {
          const names = await fsp.readdir(dir, { withFileTypes: true });
          for (const d of names) {
            const full = path.join(dir, d.name);
            items.push({ path: full, name: d.name, isDir: d.isDirectory(), parent: dir });
          }
        }
        await walk(base);
        // ترتيب: مجلدات أولاً ثم ملفات (اختياري)
        return items;
      }

      // تبسيط: نقرأ root level (مجلدات وملفات مباشرة) لعرض القائمة الأساسية
      async function listRoot() {
        const names = await fsp.readdir(ROOT, { withFileTypes: true });
        let out = `📁 محتويات جذر البوت (${ROOT}):\n\n`;
        let i = 1;
        for (const n of names) {
          out += `${i++} - ${n.name} ${n.isDirectory() ? '(مجلد)' : '(ملف)'}\n`;
        }
        out += `\nاستخدم:\n• ملفات فتح <رقم المجلد>\n• ملفات عرض <مجلد/رقم_ملف> (مثال: ملفات عرض 3/2)\n• ملفات اضافه <رقم_المجلد> <اسم_الملف>\n• ملفات حذف <رقم> أو <رقم_مجلد/رقم_ملف>\n• ملفات تعديل <مجلد/رقم_ملف> (رد على رسالة)\n• ملفات تغيير <رقم> <اسم_جديد>\n• ملفات انشاء <اسم_المجلد>\n• ملفات تحديث\n`;
        return out;
      }

      // يحول رقم (index) من قائمة الجذر إلى path
      async function resolveIndex(num) {
        const names = await fsp.readdir(ROOT, { withFileTypes: true });
        const idx = parseInt(num) - 1;
        if (isNaN(idx) || idx < 0 || idx >= names.length) return null;
        const entry = names[idx];
        return { path: path.join(ROOT, entry.name), name: entry.name, isDir: entry.isDirectory() };
      }

      // يحل ترقيم داخلي: arg مثل "3/5" => مجلد رقم 3 داخل جذر ثم ملف رقم 5 داخل ذلك المجلد
      async function resolveCompound(arg) {
        const parts = String(arg).split('/');
        if (parts.length === 1) {
          const rootResolved = await resolveIndex(parts[0]);
          return { type: rootResolved ? (rootResolved.isDir ? 'dir' : 'file') : null, resolved: rootResolved };
        }
        if (parts.length === 2) {
          const folder = await resolveIndex(parts[0]);
          if (!folder || !folder.isDir) return { type: null };
          const names = await fsp.readdir(folder.path, { withFileTypes: true });
          const idx = parseInt(parts[1]) - 1;
          if (isNaN(idx) || idx < 0 || idx >= names.length) return { type: null };
          const entry = names[idx];
          return { type: entry.isDirectory() ? 'dir' : 'file', resolved: { path: path.join(folder.path, entry.name), name: entry.name, parent: folder.path } };
        }
        return { type: null };
      }

      // قائمة ملفات داخل مجلد مرقمة (فتح)
      async function openFolderByIndex(num) {
        const res = await resolveIndex(num);
        if (!res) return `❌ المجلد برقم ${num} غير موجود.`;
        if (!res.isDir) return `❌ العنصر رقم ${num} ليس مجلداً.`;
        const names = await fsp.readdir(res.path, { withFileTypes: true });
        if (names.length === 0) return `📂 المجلد فارغ: ${res.name}`;
        let out = `📂 محتويات ${res.name}:\n\n`;
        let i = 1;
        for (const n of names) {
          out += `${i++} - ${n.name} ${n.isDirectory() ? '(مجلد)' : '(ملف)'}\n`;
        }
        out += `\nالاستخدام: ملفات عرض ${num}/<رقم_الملف>\n`;
        return out;
      }

      // يعرض محتوى ملف نصي أو يرسل وسائط
      async function viewFile(spec) {
        // spec إما '3' (ملف في الجذر) أو '3/5'
        const parts = String(spec).split('/');
        if (parts.length === 1) {
          const root = await resolveIndex(parts[0]);
          if (!root) return `❌ العنصر رقم ${spec} غير موجود.`;
          if (root.isDir) return `❌ العنصر رقم ${spec} مجلد. استخدم ملفات فتح ${spec}`;
          // عرض الملف
          const ext = path.extname(root.name).toLowerCase();
          if (['.js', '.json', '.txt', '.md', '.html', '.css', '.json5'].includes(ext)) {
            const txt = await fsp.readFile(root.path, 'utf8');
            return `📄 عرض الملف: ${root.name}\n\n\`\`\`\n${txt.slice(0, 4000)}\n\`\`\``; // tranche
          } else {
            // وسائط: نرسل الملف
            await sock.sendMessage(message.key.remoteJid, { document: { url: root.path }, fileName: root.name }, { quoted: message });
            return `✅ تم إرسال الملف: ${root.name}`;
          }
        } else {
          // مجلد/ملف
          const out = await resolveCompound(spec);
          if (!out || !out.resolved) return `❌ المسار ${spec} غير موجود.`;
          const resolved = out.resolved;
          if (out.type === 'dir') {
            // اعرض محتويات المجلد
            const names = await fsp.readdir(resolved.path, { withFileTypes: true });
            let txt = `📂 محتويات ${resolved.name}:\n\n`;
            let i = 1;
            for (const n of names) txt += `${i++} - ${n.name} ${n.isDirectory() ? '(مجلد)' : '(ملف)'}\n`;
            return txt;
          } else {
            const ext = path.extname(resolved.name).toLowerCase();
            if (['.js', '.json', '.txt', '.md', '.html', '.css', '.json5'].includes(ext)) {
              const txt = await fsp.readFile(resolved.path, 'utf8');
              return `📄 عرض الملف: ${resolved.name}\n\n\`\`\`\n${txt.slice(0, 4000)}\n\`\`\``;
            } else {
              await sock.sendMessage(message.key.remoteJid, { document: { url: resolved.path }, fileName: resolved.name }, { quoted: message });
              return `✅ تم إرسال الملف: ${resolved.name}`;
            }
          }
        }
      }

      // اضافة ملف نصي أو وسائط
      async function addFile(cmdArgs) {
        // صيغة: ملفات اضافه <رقم_المجلد> <اسم_الملف>
        const folderIndex = cmdArgs[0];
        const fileNameArg = cmdArgs[1];
        if (!folderIndex || !fileNameArg) return `❌ الاستخدام: ملفات اضافه <رقم_المجلد> <اسم_الملف>`;
        const folder = await resolveIndex(folderIndex);
        if (!folder) return `❌ المجلد رقم ${folderIndex} غير موجود.`;
        if (!folder.isDir) return `❌ العنصر رقم ${folderIndex} ليس مجلداً.`;

        // تحديد الامتداد التلقائي
        let ext = path.extname(fileNameArg);
        let fileName = fileNameArg;
        if (!ext) {
          // افتراض حسب المجلد
          const lname = folder.name.toLowerCase();
          if (lname.includes('plugin') || lname.includes('plugins')) ext = '.js';
          else if (lname.includes('data')) ext = '.json';
          else ext = '.js';
          fileName = fileNameArg + ext;
        }

        const filePath = path.join(folder.path, fileName);

        // محتوى من الرد
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let content = null;
        if (quoted) {
          if (quoted.conversation) content = quoted.conversation;
          else if (quoted.extendedTextMessage?.text) content = quoted.extendedTextMessage.text;
        }

        // إذا الرد كان وسائط، نحمّل الوسيط وحفظه كملف
        if (!content && message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
          // حاول تحميل بواسطة downloadMedia
          const buf = await downloadMedia(message);
          if (buf) {
            await fsp.writeFile(filePath, buf);
            return `✅ تم إضافة ملف وسائط: ${fileName} في ${folder.name}`;
          }
        }

        // إذا لا يوجد محتوى نصي، أنشئ ملف فارغ
        if (!content) content = '';

        // كتابة الملف
        await fsp.writeFile(filePath, content, 'utf8');
        return `✅ تم إنشاء الملف: ${fileName} في ${folder.name}`;
      }

      // تعديل ملف: يستبدل المحتوى بالمحتوى المردود عليه
      async function editFile(spec) {
        // spec: "3" أو "3/5"
        const parts = String(spec).split('/');
        let resolved;
        if (parts.length === 1) {
          const root = await resolveIndex(parts[0]);
          if (!root) return `❌ العنصر رقم ${spec} غير موجود.`;
          if (root.isDir) return `❌ العنصر مجلد. استخدم ملفات فتح.`;
          resolved = root;
        } else {
          const out = await resolveCompound(spec);
          if (!out || !out.resolved) return `❌ المسار ${spec} غير موجود.`;
          resolved = out.resolved;
        }
        // يجب أن يكون رد على رسالة نصية أو وسائط
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) return `❌ الرجاء الرد على رسالة تحتوي المحتوى الجديد.`;
        // نصي؟
        let content = null;
        if (quoted.conversation) content = quoted.conversation;
        else if (quoted.extendedTextMessage?.text) content = quoted.extendedTextMessage.text;

        if (content !== null) {
          await fsp.writeFile(resolved.path, content, 'utf8');
          return `✅ تم تعديل الملف: ${resolved.name}`;
        } else {
          // محاولة تحميل الوسيط
          const buf = await downloadMedia(message);
          if (!buf) return `❌ فشل تحميل الوسائط للتعديل.`;
          await fsp.writeFile(resolved.path, buf);
          return `✅ تم تعديل الملف (وسائط): ${resolved.name}`;
        }
      }

      // حذف ملف أو مجلد
      async function deleteSpec(spec) {
        // spec: "3" أو "3/5"
        const parts = String(spec).split('/');
        let resolved;
        if (parts.length === 1) {
          const root = await resolveIndex(parts[0]);
          if (!root) return `❌ العنصر رقم ${spec} غير موجود.`;
          resolved = root;
        } else {
          const out = await resolveCompound(spec);
          if (!out || !out.resolved) return `❌ المسار ${spec} غير موجود.`;
          resolved = out.resolved;
        }
        // إذا مجلد -> حذف مجلد
        const stat = await safeStat(resolved.path);
        if (!stat) return `❌ المسار غير موجود.`;
        if (stat.isDirectory()) {
          // Danger: حذف مجلد كامل
          await fsp.rm(resolved.path, { recursive: true, force: true });
          return `✅ تم حذف المجلد: ${resolved.name}`;
        } else {
          await fsp.unlink(resolved.path);
          return `✅ تم حذف الملف: ${resolved.name}`;
        }
      }

      // تغيير اسم ملف أو مجلد
      async function renameSpec(spec, newName) {
        const parts = String(spec).split('/');
        let resolved;
        if (parts.length === 1) {
          const root = await resolveIndex(parts[0]);
          if (!root) return `❌ العنصر رقم ${spec} غير موجود.`;
          resolved = root;
        } else {
          const out = await resolveCompound(spec);
          if (!out || !out.resolved) return `❌ المسار ${spec} غير موجود.`;
          resolved = out.resolved;
        }
        const newPath = path.join(path.dirname(resolved.path), newName);
        await fsp.rename(resolved.path, newPath);
        return `✅ تم تغيير الاسم إلى: ${newName}`;
      }

      // إنشاء مجلد جديد في الجذر أو داخل مجلد محدد
      async function createFolder(args) {
        // صيغة: ملفات انشاء <اسم> أو ملفات انشاء <رقم_مجلد> <اسم>
        if (!args || args.length === 0) return `❌ الاستخدام: ملفات انشاء <اسم> أو ملفات انشاء <رقم_المجلد> <اسم>`;
        if (args.length === 1) {
          const name = args[0];
          const p = path.join(ROOT, name);
          if (fs.existsSync(p)) return `❌ هذا المسار موجود بالفعل.`;
          await fsp.mkdir(p, { recursive: true });
          return `✅ تم إنشاء المجلد في الجذر: ${name}`;
        } else {
          const idx = args[0];
          const folder = await resolveIndex(idx);
          if (!folder || !folder.isDir) return `❌ المجلد ${idx} غير موجود.`;
          const name = args.slice(1).join(' ');
          const p = path.join(folder.path, name);
          if (fs.existsSync(p)) return `❌ هذا المسار موجود بالفعل.`;
          await fsp.mkdir(p, { recursive: true });
          return `✅ تم إنشاء المجلد: ${name} داخل ${folder.name}`;
        }
      }

      // تحديث (reload) البلجنات أو حفظ التغييرات
      async function updateAll() {
        // محاولة استخدام دوال الهاندلر
        if (handler && typeof handler.reloadAllPlugins === 'function') {
          await handler.reloadAllPlugins();
          return `✅ تم تحديث/إعادة تحميل البلجنات عبر handler.reloadAllPlugins()`;
        } else if (handler && typeof handler.loadPlugins === 'function') {
          await handler.loadPlugins();
          return `✅ تم تشغيل handler.loadPlugins()`;
        } else {
          return `⚠️ لا يوجد دالة تحديث متوفرة في الهاندلر.`;
        }
      }

      // ----- تنفيذ الأوامر الفرعية ----- //
      switch (sub) {
        case 'قائمة':
        case '': {
          const out = await listRoot();
          return reply(out);
        }

        case 'فتح': {
          const num = args[1];
          if (!num) return reply('❌ استخدم: ملفات فتح <رقم المجلد>');
          const out = await openFolderByIndex(num);
          return reply(out);
        }

        case 'عرض': {
          const spec = args[1];
          if (!spec) return reply('❌ استخدم: ملفات عرض <رقم> أو ملفات عرض <مجلد/رقم>');
          const out = await viewFile(spec);
          return reply(out);
        }

        case 'اضافه':
        case 'اضافة': {
          const rest = args.slice(1);
          if (rest.length < 2) return reply('❌ استخدم: ملفات اضافه <رقم_المجلد> <اسم_الملف> (ورِد على رسالة تحتوي المحتوى أو وسائط)');
          const out = await addFile(rest);
          return reply(out);
        }

        case 'تعديل': {
          const spec = args[1];
          if (!spec) return reply('❌ استخدم: ملفات تعديل <رقم> أو <مجلد/رقم> (ورد على رسالة تحتوي الكود أو الوسائط)');
          const out = await editFile(spec);
          return reply(out);
        }

        case 'حذف': {
          const spec = args[1];
          if (!spec) return reply('❌ استخدم: ملفات حذف <رقم> أو <مجلد/رقم>');
          const out = await deleteSpec(spec);
          return reply(out);
        }

        case 'تغيير': {
          const spec = args[1];
          const newName = args.slice(2).join(' ');
          if (!spec || !newName) return reply('❌ استخدم: ملفات تغيير <رقم> <الاسم_الجديد>');
          const out = await renameSpec(spec, newName);
          return reply(out);
        }

        case 'انشاء':
        case 'إنشاء': {
          const out = await createFolder(args.slice(1));
          return reply(out);
        }

        case 'تحديث': {
          const out = await updateAll();
          return reply(out);
        }

        default:
          return reply('❌ أمر فرعي غير معروف. الخيارات: قائمة | فتح | عرض | اضافه | تعديل | حذف | تغيير | انشاء | تحديث');
      }

    } catch (err) {
      console.error("ملفات command error:", err);
      return reply("❌ حدث خطأ أثناء تنفيذ أمر الملفات: " + err.message);
    }
  }
};