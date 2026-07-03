#!/bin/bash
sed -i 's/.bg-panel, .bg-panel-dark {/.glass-effect {/g' src/index.css
find src -name '*.tsx' -exec sed -i 's/bg-panel/bg-panel backdrop-blur-[24px]/g' {} +
