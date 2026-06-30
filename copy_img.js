const fs = require('fs');
const path = require('path');
const src = 'C:\\Users\\anhnt\\.gemini\\antigravity-ide\\brain\\05cdb802-552c-42a8-95d6-b16174ec2c5a\\laptop_dashboard_mockup_1782795594457.png';
const destDir = path.join(__dirname, 'frontend', 'public', 'images');
const dest = path.join(destDir, 'login-mockup.png');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}
fs.copyFileSync(src, dest);
console.log('Copied successfully!');
