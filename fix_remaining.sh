#!/bin/bash
find src -name '*.tsx' -exec sed -i \
  -e 's/bg-zinc-100/bg-panel-hover/g' \
  -e 's/bg-zinc-200/bg-panel-dark/g' \
  -e 's/bg-zinc-300/bg-panel-dark/g' \
  -e 's/border-zinc-200/border-divider/g' \
  -e 's/border-zinc-300/border-divider/g' \
  -e 's/border-zinc-100/border-divider/g' \
  {} +
