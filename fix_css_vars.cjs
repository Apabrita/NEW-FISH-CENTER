const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

// Dark Mode text colors
content = content.replace(/--text-muted: rgba\(235, 235, 245, 0.6\);/g, '--text-muted: rgba(235, 235, 245, 0.7);');
content = content.replace(/--text-faint: rgba\(235, 235, 245, 0.3\);/g, '--text-faint: rgba(235, 235, 245, 0.5);');

// Light Mode text colors
content = content.replace(/--text-muted: rgba\(60, 60, 67, 0.6\);/g, '--text-muted: rgba(60, 60, 67, 0.7);');
content = content.replace(/--text-faint: rgba\(60, 60, 67, 0.3\);/g, '--text-faint: rgba(60, 60, 67, 0.5);');

// Fix panels
content = content.replace(/--panel: rgba\(255, 255, 255, 0.7\);/g, '--panel: rgba(255, 255, 255, 0.85);');
content = content.replace(/--panel-dark: rgba\(242, 242, 247, 0.8\);/g, '--panel-dark: rgba(220, 220, 225, 0.8);');

fs.writeFileSync('src/index.css', content);
