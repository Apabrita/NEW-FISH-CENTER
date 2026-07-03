#!/bin/bash
# Replaces specific styling inside App.tsx to fit the Apple design
sed -i 's/rounded-2xl/rounded-3xl/g' src/App.tsx
sed -i 's/bg-black\/40/glass-panel/g' src/App.tsx
sed -i 's/bg-zinc-900\/50/glass-panel/g' src/App.tsx
sed -i 's/border-white\/10/border-none/g' src/App.tsx
sed -i 's/shadow-2xl/shadow-2xl shadow-black\/50/g' src/App.tsx
