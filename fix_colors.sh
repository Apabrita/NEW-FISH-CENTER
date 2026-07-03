#!/bin/bash
cat << 'CSS_EOF' > src/index.css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap");

@import "tailwindcss";

@theme {
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
  --font-mono: "SF Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  
  --color-zinc-50: var(--zinc-50);
  --color-zinc-100: var(--zinc-100);
  --color-zinc-200: var(--zinc-200);
  --color-zinc-300: var(--zinc-300);
  --color-zinc-400: var(--zinc-400);
  --color-zinc-500: var(--zinc-500);
  --color-zinc-600: var(--zinc-600);
  --color-zinc-700: var(--zinc-700);
  --color-zinc-800: var(--zinc-800);
  --color-zinc-900: var(--zinc-900);
  --color-zinc-950: var(--zinc-950);
  
  --color-white: var(--color-white-override);
  --color-black: var(--color-black-override);
}

@layer base {
  /* DARK MODE (Default Apple-like Dark) */
  :root, :root.theme-dark, :root.dark {
    --zinc-50: #fafafa;
    --zinc-100: #f4f4f5;
    --zinc-200: #e4e4e7;
    --zinc-300: #d4d4d8;
    --zinc-400: #a1a1aa;
    --zinc-500: #71717a;
    --zinc-600: #525252;
    --zinc-700: #3f3f46;
    --zinc-800: rgba(44, 44, 46, 0.8);
    --zinc-900: rgba(28, 28, 30, 0.65);
    --zinc-950: rgba(0, 0, 0, 0.6);
    --color-white-override: #ffffff;
    --color-black-override: #000000;
    
    background-color: #000000;
    color: #ffffff;
  }

  /* LIGHT MODE (Apple-like Light) */
  :root.theme-light, :root.light {
    --zinc-950: #f2f2f7; /* Often used as deepest background */
    --zinc-900: rgba(255, 255, 255, 0.7); /* Often used as panels */
    --zinc-800: rgba(255, 255, 255, 0.9); /* Panel hover */
    --zinc-700: rgba(0, 0, 0, 0.05); /* Borders/dividers */
    --zinc-600: rgba(0, 0, 0, 0.1);
    --zinc-500: rgba(60, 60, 67, 0.6);
    --zinc-400: rgba(60, 60, 67, 0.6);
    --zinc-300: #3c3c43;
    --zinc-200: #1c1c1e;
    --zinc-100: #000000;
    --zinc-50: #000000;
    --color-white-override: #ffffff;
    --color-black-override: #000000;
    
    background-color: #f2f2f7;
    color: #000000;
  }

  body {
    overscroll-behavior-y: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
}

@layer utilities {
  .rounded-2xl, .rounded-\[24px\] {
    border-radius: 20px !important;
  }
  .rounded-xl, .rounded-\[16px\] {
    border-radius: 16px !important;
  }
  .rounded-lg, .rounded-\[12px\] {
    border-radius: 12px !important;
  }

  /* Blur overrides to ensure Apple glass feel */
  .bg-zinc-900, .bg-zinc-950, .bg-zinc-800 {
    backdrop-filter: blur(24px) !important;
    -webkit-backdrop-filter: blur(24px) !important;
    border: 1px solid rgba(128, 128, 128, 0.15) !important;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04) !important;
  }
}

/* Global button smoothing */
button {
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1) !important;
}
button:active {
  transform: scale(0.96) !important;
}

/* Inputs */
input, textarea {
  background-color: rgba(128, 128, 128, 0.1) !important;
  border: 1px solid rgba(128, 128, 128, 0.2) !important;
  border-radius: 12px !important;
  color: inherit !important;
  transition: all 0.2s ease !important;
}
input:focus, textarea:focus {
  background-color: rgba(128, 128, 128, 0.15) !important;
  border-color: rgba(10, 132, 255, 0.5) !important;
  outline: none !important;
  box-shadow: 0 0 0 4px rgba(10, 132, 255, 0.15) !important;
}

/* Scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.3);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 128, 128, 0.5);
}

@media print {
  body, .theme-dark body, .theme-light body {
    background-color: white !important;
    color: black !important;
  }
  * {
    color: black !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }
}
CSS_EOF
