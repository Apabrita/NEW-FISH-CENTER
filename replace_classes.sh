#!/bin/bash
find src -name '*.tsx' -exec sed -i \
  -e 's/bg-zinc-950\/80/bg-panel-dark/g' \
  -e 's/bg-zinc-950/bg-panel-dark/g' \
  -e 's/bg-zinc-900\/50\/60/bg-panel/g' \
  -e 's/bg-zinc-900\/50/bg-panel/g' \
  -e 's/bg-zinc-900\/40/bg-panel/g' \
  -e 's/bg-zinc-900/bg-panel/g' \
  -e 's/bg-zinc-800\/50/bg-panel-hover/g' \
  -e 's/bg-zinc-800\/80/bg-panel-hover/g' \
  -e 's/bg-zinc-800/bg-panel-hover/g' \
  -e 's/border-white\/5\/80/border-divider/g' \
  -e 's/border-white\/5\/60/border-divider/g' \
  -e 's/border-white\/5/border-divider/g' \
  -e 's/border-white\/10/border-divider/g' \
  -e 's/border-zinc-800\/80/border-divider/g' \
  -e 's/border-zinc-800/border-divider/g' \
  -e 's/border-zinc-900/border-divider/g' \
  -e 's/text-zinc-100/text-main/g' \
  -e 's/text-zinc-200/text-main/g' \
  -e 's/text-zinc-300/text-main/g' \
  -e 's/text-zinc-400/text-muted/g' \
  -e 's/text-zinc-500/text-faint/g' \
  -e 's/text-zinc-600/text-faint/g' \
  -e 's/glass-panel/bg-panel/g' \
  {} +
