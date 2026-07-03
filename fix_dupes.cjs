const fs = require('fs');
const glob = require('glob');

glob('src/**/*.tsx', (err, files) => {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Regex to find motion.div/motion.span/motion.button with multiple transition={{...}}
    // Since it's complex, we can just replace 'transition={{ type: "spring", stiffness: 400, damping: 30 }} ' if there's already another transition= in the same block.
    // Actually, it's easier to remove the one we injected IF there's another transition=.
    
    // Simpler approach: find `transition={{ type: "spring", stiffness: 400, damping: 30 }}` and remove it everywhere, then ONLY add it where `transition=` is missing!
    content = content.replace(/transition=\{\{\s*type:\s*"spring",\s*stiffness:\s*400,\s*damping:\s*30\s*\}\}\s*/g, "");
    fs.writeFileSync(file, content);
  });
});
