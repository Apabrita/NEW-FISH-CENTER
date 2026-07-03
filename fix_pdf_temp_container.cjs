const fs = require('fs');
let content = fs.readFileSync('src/utils/pdf.ts', 'utf8');

// Change tempContainer to not be restricted by 100vh
content = content.replace(
  'tempContainer.style.position = "fixed";',
  'tempContainer.style.position = "absolute";'
);
content = content.replace(
  'tempContainer.style.width = "100vw";',
  'tempContainer.style.width = "794px";'
);
content = content.replace(
  'tempContainer.style.height = "100vh";',
  'tempContainer.style.height = "auto";\n  tempContainer.style.minHeight = "100vh";'
);
content = content.replace(
  'tempContainer.style.overflow = "auto"; // allow it to scroll its content natively',
  'tempContainer.style.overflow = "visible"; // must be visible for html-to-image to capture full height!'
);

// We should also push it out of view so we don't flash the user with a huge scrolling page
// Actually, fixed + zIndex is fine if we make it hidden, but Safari sometimes culls hidden elements.
// The best trick is: left: -9999px, top: 0, position: absolute
content = content.replace(
  'tempContainer.style.left = "0";',
  'tempContainer.style.left = "-9999px";'
);

fs.writeFileSync('src/utils/pdf.ts', content);
