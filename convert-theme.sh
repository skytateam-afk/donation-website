#!/bin/bash

# Script to convert hardcoded colors to theme-aware classes
# Usage: ./convert-theme.sh <file-path>

if [ -z "$1" ]; then
    echo "Usage: $0 <file-path>"
    exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
    echo "File not found: $FILE"
    exit 1
fi

echo "Converting $FILE to use theme-aware classes..."

# Create backup
cp "$FILE" "$FILE.backup"

# Perform replacements
sed -i '' \
    -e 's/bg-slate-950\/60/bg-card\/60/g' \
    -e 's/bg-slate-950\/40/bg-card\/40/g' \
    -e 's/bg-slate-950\/70/bg-card\/70/g' \
    -e 's/bg-slate-950/bg-card/g' \
    -e 's/bg-slate-900\/95/bg-card\/95/g' \
    -e 's/bg-slate-900\/70/bg-card\/70/g' \
    -e 's/bg-slate-900\/60/bg-card\/60/g' \
    -e 's/bg-slate-900\/50/bg-card\/50/g' \
    -e 's/bg-slate-900\/40/bg-card\/40/g' \
    -e 's/bg-slate-900/bg-card/g' \
    -e 's/bg-slate-800/bg-muted/g' \
    -e 's/bg-slate-700/bg-muted/g' \
    -e 's/bg-slate-600/bg-muted/g' \
    -e 's/bg-slate-500/bg-muted/g' \
    -e 's/bg-slate-100/bg-secondary/g' \
    -e 's/bg-slate-50/bg-background/g' \
    -e 's/bg-gray-950/bg-card/g' \
    -e 's/bg-gray-900/bg-card/g' \
    -e 's/bg-gray-800/bg-muted/g' \
    -e 's/bg-gray-700/bg-muted/g' \
    -e 's/bg-gray-100/bg-secondary/g' \
    -e 's/bg-gray-50/bg-background/g' \
    -e 's/text-white/text-foreground/g' \
    -e 's/text-slate-400/text-muted-foreground/g' \
    -e 's/text-slate-300/text-secondary-foreground/g' \
    -e 's/text-slate-200/text-foreground/g' \
    -e 's/text-slate-100/text-foreground/g' \
    -e 's/text-slate-500/text-muted-foreground/g' \
    -e 's/text-slate-600/text-muted-foreground/g' \
    -e 's/text-slate-700/text-muted-foreground/g' \
    -e 's/text-gray-900/text-foreground/g' \
    -e 's/text-gray-800/text-foreground/g' \
    -e 's/text-gray-700/text-muted-foreground/g' \
    -e 's/text-gray-600/text-muted-foreground/g' \
    -e 's/text-gray-500/text-muted-foreground/g' \
    -e 's/text-gray-400/text-muted-foreground/g' \
    -e 's/text-gray-300/text-secondary-foreground/g' \
    -e 's/border-slate-800\/60/border-border\/60/g' \
    -e 's/border-slate-800/border-border/g' \
    -e 's/border-slate-700/border-border/g' \
    -e 's/border-slate-600/border-border/g' \
    -e 's/border-gray-800/border-border/g' \
    -e 's/border-gray-700/border-border/g' \
    -e 's/border-gray-300/border-border/g' \
    -e 's/border-gray-200/border-border/g' \
    -e 's/bg-white\/10/bg-accent/g' \
    -e 's/bg-white\/5/bg-secondary/g' \
    -e 's/bg-white/bg-background/g' \
    -e 's/hover:bg-white\/10/hover:bg-accent/g' \
    -e 's/hover:bg-white\/5/hover:bg-accent/g' \
    -e 's/hover:bg-white/hover:bg-accent/g' \
    -e 's/hover:text-white/hover:text-foreground/g' \
    -e 's/ring-white\/10/ring-ring/g' \
    -e 's/ring-white\/20/ring-ring\/80/g' \
    -e 's/bg-indigo-600/bg-primary/g' \
    -e 's/hover:bg-indigo-500/hover:bg-primary\/90/g' \
    -e 's/text-indigo-600/text-primary/g' \
    -e 's/focus:ring-indigo-500/focus:ring-ring/g' \
    -e 's/focus:border-indigo-500/focus:border-ring/g' \
    -e 's/focus-visible:ring-indigo-500/focus-visible:ring-ring/g' \
    -e 's/placeholder-slate-400/placeholder-muted-foreground/g' \
    -e 's/placeholder-gray-400/placeholder-muted-foreground/g' \
    "$FILE"

# Fix primary button text colors (must be done after other replacements)
# Replace text-foreground with text-primary-foreground when bg-primary is present on same line
sed -i '' -E 's/(bg-primary[^"]*)(text-foreground)/\1text-primary-foreground/g' "$FILE"

echo "Conversion complete! Backup saved as $FILE.backup"
echo "Please review the changes and test the file."
