#!/bin/bash
for file in src/components/SourcePanel.tsx src/components/SourcePaymentFlow.tsx src/components/SettingsPanel.tsx src/components/HistoryPanel.tsx; do
  if [ -f "$file" ]; then
    sed -i 's/bg-white/glass-panel/g' "$file"
    sed -i 's/bg-zinc-50/glass-panel/g' "$file"
    sed -i 's/bg-zinc-100/bg-panel-hover/g' "$file"
    sed -i 's/border-zinc-200/border-divider/g' "$file"
    sed -i 's/border-zinc-300/border-divider/g' "$file"
    sed -i 's/border-zinc-100/border-divider/g' "$file"
    sed -i 's/border-indigo-200/border-divider/g' "$file"
    sed -i 's/text-zinc-700/text-main/g' "$file"
    sed -i 's/text-zinc-800/text-main/g' "$file"
    sed -i 's/text-zinc-900/text-main/g' "$file"
    sed -i 's/text-zinc-500/text-muted/g' "$file"
    sed -i 's/text-zinc-600/text-muted/g' "$file"
    sed -i 's/text-indigo-700/text-indigo-500/g' "$file"
    sed -i 's/text-indigo-800/text-indigo-400/g' "$file"
  fi
done

# We should NOT replace bg-white in PdfExportView and HalkhataPanel receipt view. 
