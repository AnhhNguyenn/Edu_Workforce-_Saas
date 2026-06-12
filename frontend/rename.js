const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app');
const adminDir = path.join(srcDir, '(admin)');
const teacherDir = path.join(srcDir, '(teacher)');

if (!fs.existsSync(adminDir)) fs.mkdirSync(adminDir);
if (!fs.existsSync(teacherDir)) fs.mkdirSync(teacherDir);

try {
  fs.renameSync(path.join(srcDir, 'center-admin'), path.join(adminDir, 'ops'));
  console.log('Moved center-admin to (admin)/ops');
} catch (e) { console.error(e); }

try {
  fs.renameSync(path.join(srcDir, 'teacher'), path.join(teacherDir, 'me'));
  console.log('Moved teacher to (teacher)/me');
} catch (e) { console.error(e); }
