const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

content = content.replace(
  /<button\s+onClick=\{\(\) => onClose\(\)\}\s+className="p-1\.5 glass-panel rounded-\[24px\] text-muted hover:text-main hover:bg-panel-hover cursor-pointer transition"\s+>\s+<X className="w-4 h-4" \/>\s+<\/button>/,
  `<div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-panel-dark p-1 rounded-full border border-divider">
              <button
                type="button"
                onClick={() => setScaleFactor((prev) => Math.max(0.2, prev - 0.1))}
                className="w-6 h-6 flex items-center justify-center rounded-full text-muted hover:text-main hover:bg-panel-hover transition"
                title="Zoom Out"
              >
                -
              </button>
              <span className="text-[10px] font-mono w-10 text-center text-main font-bold">
                {Math.round(scaleFactor * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setScaleFactor((prev) => Math.min(2.0, prev + 0.1))}
                className="w-6 h-6 flex items-center justify-center rounded-full text-muted hover:text-main hover:bg-panel-hover transition"
                title="Zoom In"
              >
                +
              </button>
            </div>
            <button
              onClick={() => onClose()}
              className="p-1.5 glass-panel rounded-[24px] text-muted hover:text-main hover:bg-panel-hover cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>`
);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
