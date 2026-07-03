const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find src -name "*.tsx"').toString().split('\n').filter(Boolean);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Revert button text-mains back to text-white where it makes sense:
  // e.g., bg-teal-500 text-main -> bg-teal-500 text-white
  content = content.replace(/bg-teal-500([a-zA-Z0-9\-\/\s]+)text-main/g, 'bg-teal-500$1text-white');
  content = content.replace(/bg-indigo-600([a-zA-Z0-9\-\/\s]+)text-main/g, 'bg-indigo-600$1text-white');
  content = content.replace(/bg-sky-500([a-zA-Z0-9\-\/\s]+)text-main/g, 'bg-sky-500$1text-white');
  content = content.replace(/bg-rose-500([a-zA-Z0-9\-\/\s]+)text-main/g, 'bg-rose-500$1text-white');
  
  // It's safer to just do a `git checkout` or similar if I had git, but I don't.
  // Wait, I can restore from git? The workspace doesn't have git enabled yet.
  
  // Let's just manually fix the specific text-main where it should be white.
  // If it's a primary button, it should be text-white.
  
  fs.writeFileSync(file, content);
});
console.log("Done");
