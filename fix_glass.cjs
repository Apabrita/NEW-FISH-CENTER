const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find src -name "*.tsx"').toString().split('\n').filter(Boolean);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/glass-panel\/[0-9]+/g, 'bg-panel-dark');
  fs.writeFileSync(file, content);
});
console.log("Done");
