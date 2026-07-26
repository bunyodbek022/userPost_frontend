const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-\[#0f0f0f\]/gi, replace: 'bg-[#0F172A]' },
  { regex: /bg-\[#0f0e0d\]/gi, replace: 'bg-[#0F172A]' },
  { regex: /bg-\[#161616\]/gi, replace: 'bg-[#1E293B]' },
  { regex: /bg-\[#16120E\]/gi, replace: 'bg-[#1E293B]' },
  { regex: /bg-\[#2a2a2a\]/gi, replace: 'bg-[#334155]' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { regex, replace } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory('./app');
processDirectory('./components');
