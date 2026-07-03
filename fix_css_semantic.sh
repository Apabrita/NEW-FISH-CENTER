#!/bin/bash
cat << 'CSS_EOF' > src/index.css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap");

@import "tailwindcss";

@theme {
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
  --font-mono: "SF Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  
  --color-panel: var(--panel);
  --color-panel-hover: var(--panel-hover);
  --color-panel-dark: var(--panel-dark);
  --color-main: var(--text-main);
  --color-muted: var(--text-muted);
  --color-faint: var(--text-faint);
  --color-divider: var(--border-divider);
  --color-input-bg: var(--input-bg);
  --color-app-bg: var(--app-bg);
}

@layer base {
  :root, :root.dark, :root.theme-dark {
    --panel: rgba(28, 28, 30, 0.65);
    --panel-hover: rgba(44, 44, 46, 0.8);
    --panel-dark: rgba(0, 0, 0, 0.6);
    --text-main: #ffffff;
    --text-muted: rgba(235, 235, 245, 0.6);
    --text-faint: rgba(235, 235, 245, 0.3);
    --border-divider: rgba(255, 255, 255, 0.1);
    --input-bg: rgba(255, 255, 255, 0.05);
    --app-bg: #000000;
    
    background-color: var(--app-bg);
    color: var(--text-main);
  }
  :root.light, :root.theme-light {
    --panel: rgba(255, 255, 255, 0.7);
    --panel-hover: rgba(255, 255, 255, 0.9);
    --panel-dark: rgba(242, 242, 247, 0.8);
    --text-main: #000000;
    --text-muted: rgba(60, 60, 67, 0.6);
    --text-faint: rgba(60, 60, 67, 0.3);
    --border-divider: rgba(0, 0, 0, 0.1);
    --input-bg: rgba(0, 0, 0, 0.05);
    --app-bg: #f2f2f7;
    
    background-color: var(--app-bg);
    color: var(--text-main);
  }

  body {
    background-image: none !important;
    background-color: var(--app-bg) !important;
    color: var(--text-main);
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

  .bg-panel, .bg-panel-dark {
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--border-divider);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  }
}

/* Global button smoothing */
button {
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}
button:active {
  transform: scale(0.96);
}

/* Inputs */
input:not([type="checkbox"]), textarea {
  background-color: var(--input-bg);
  border: 1px solid var(--border-divider);
  border-radius: 12px;
  color: inherit;
  transition: all 0.2s ease;
}
input:not([type="checkbox"]):focus, textarea:focus {
  background-color: var(--input-bg);
  border-color: rgba(10, 132, 255, 0.5);
  outline: none;
  box-shadow: 0 0 0 4px rgba(10, 132, 255, 0.15);
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
  background: var(--text-faint);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
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
  .bg-panel, .bg-panel-dark, .bg-panel-hover {
    background-color: transparent !important;
    border: none !important;
  }
}
CSS_EOF
