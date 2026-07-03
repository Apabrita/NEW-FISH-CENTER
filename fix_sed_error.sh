#!/bin/bash
find src -name '*.tsx' -exec sed -i 's/bg-panel backdrop-blur-\[24px\]-hover/bg-panel-hover/g' {} +
find src -name '*.tsx' -exec sed -i 's/bg-panel backdrop-blur-\[24px\]-dark/bg-panel-dark/g' {} +
