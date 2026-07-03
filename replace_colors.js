import fs from "fs";

let content = fs.readFileSync("src/components/SettingsPanel.tsx", "utf-8");

content = content.replace(/#060a15/g, "#082f49"); // zinc-950-ish deep ocean
content = content.replace(/#1d2d52/g, "#0f355c"); // ocean border
content = content.replace(/#0a1125/g, "#0c4a6e"); // zinc-900-ish
content = content.replace(/#030611/g, "#082f49"); // deep background
content = content.replace(/#020409/g, "#010b14"); // darkest background
content = content.replace(/#131b2e/g, "#075985"); // zinc-800-ish
content = content.replace(/#1a2d52/g, "#0c4a6e");

fs.writeFileSync("src/components/SettingsPanel.tsx", content);
console.log("Replaced colors successfully");
