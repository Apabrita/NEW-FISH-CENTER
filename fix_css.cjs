const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

// Update Light Theme colors to make them clear
content = content.replace(/--panel: rgba\(255, 255, 255, 0.85\);/, '--panel: rgba(255, 255, 255, 0.95);');
content = content.replace(/--panel-dark: rgba\(220, 220, 225, 0.8\);/, '--panel-dark: rgba(242, 242, 247, 0.9);');
content = content.replace(/--text-muted: rgba\(60, 60, 67, 0.7\);/, '--text-muted: rgba(60, 60, 67, 0.8);');
content = content.replace(/--text-faint: rgba\(60, 60, 67, 0.5\);/, '--text-faint: rgba(60, 60, 67, 0.5);');
content = content.replace(/--app-bg: #f2f2f7;/, '--app-bg: #e5e5ea;'); // Slightly darker bg so white panels pop

// Wait, Apple's system light background is usually #F2F2F7 and cards are #FFFFFF.
content = content.replace(/--app-bg: #f2f2f7;/, '--app-bg: #f2f2f7;');
content = content.replace(/--panel: rgba\(255, 255, 255, 0.95\);/, '--panel: rgba(255, 255, 255, 1);');
content = content.replace(/--panel-dark: rgba\(242, 242, 247, 0.9\);/, '--panel-dark: rgba(255, 255, 255, 0.6);');

fs.writeFileSync('src/index.css', content);
