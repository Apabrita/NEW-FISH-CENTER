const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

content = content.replace(/:root, :root\.dark, :root\.theme-dark/g, ':root, .dark, .theme-dark');
content = content.replace(/:root\.light, :root\.theme-light/g, '.light, .theme-light');

fs.writeFileSync('src/index.css', content);
