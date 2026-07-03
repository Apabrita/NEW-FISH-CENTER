const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find src -name "*.tsx"').toString().split('\n').filter(Boolean);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/text-teal-400/g, 'text-teal-500');
  content = content.replace(/text-sky-400/g, 'text-sky-500');
  content = content.replace(/text-emerald-400/g, 'text-emerald-500');
  content = content.replace(/text-indigo-400/g, 'text-indigo-500');
  fs.writeFileSync(file, content);
});
console.log("Done");
