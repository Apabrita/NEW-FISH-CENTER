const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

// iOS Button Active State
content = content.replace(/button:active \{\s*transform: scale\(0\.96\);\s*\}/, 'button:active {\n  transform: scale(0.97);\n  opacity: 0.8;\n}');

// iOS Toggle Switches (if any) or standard shadows
content = content.replace(/box-shadow: 0 4px 24px rgba\(0, 0, 0, 0\.04\)/g, 'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08)');

// Adjust scrollbars to look more like iOS (hidden by default, round)
// Wait, we can't easily do true iOS scrollbars in CSS, but we can make them thinner and more transparent
content = content.replace(/::-webkit-scrollbar \{\s*width: 6px;\s*height: 6px;\s*\}/, '::-webkit-scrollbar {\n  width: 4px;\n  height: 4px;\n}');
content = content.replace(/background: var\(--text-faint\);/g, 'background: rgba(150, 150, 150, 0.3);');
content = content.replace(/background: var\(--text-muted\);/g, 'background: rgba(150, 150, 150, 0.5);');

fs.writeFileSync('src/index.css', content);
