import fs from "fs";

let content = fs.readFileSync("src/index.css", "utf-8");

// We'll replace the light theme colors with stark black/white for daylight contrast
content = content.replace(/color: #0c4a6e !important;/g, "color: #000000 !important; font-weight: 700;");
content = content.replace(/color: #075985 !important;/g, "color: #000000 !important; font-weight: 700;");
content = content.replace(/color: #0369a1 !important;/g, "color: #111111 !important; font-weight: 700;");
content = content.replace(/color: #082f49 !important;/g, "color: #000000 !important; font-weight: 800;");

fs.writeFileSync("src/index.css", content);
console.log("Updated light mode contrast");
