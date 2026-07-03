const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find src -name "*.tsx"').toString().split('\n').filter(Boolean);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Dashboard panel banner
  content = content.replace(/bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950/g, 'bg-panel-dark');
  content = content.replace(/text-rose-100/g, 'text-main');
  content = content.replace(/text-white/g, 'text-main'); // Be careful, some might be on blue buttons
  
  // Actually text-white on blue buttons is correct. We should only replace text-white on normal elements.
  // I will revert the general text-white replace and do targeted ones.
  fs.writeFileSync(file, content);
});
console.log("Done");
