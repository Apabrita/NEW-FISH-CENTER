const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}
const files = walk(path.join(process.cwd(), 'src'));
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('useEffect(')) {
    if (!content.includes('React.useEffect(')) {
      if (!content.match(/import.*useEffect.*from/)) {
        console.log('MISSING IMPORT:', f);
      }
    }
  }
});
