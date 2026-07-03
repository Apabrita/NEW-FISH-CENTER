#!/bin/bash
sed -i 's/<meta name="theme-color" content="#010b14" \/>/<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f2f2f7" \/>\n    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" \/>/g' index.html
