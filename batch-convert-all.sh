#!/bin/bash

# Batch convert all Vue files to use theme-aware classes
echo "Starting batch conversion of all Vue files..."

# Array of files to convert
files=(
  # Public pages
  "src/views/user/ResetPassword.vue"
)

# Convert each file
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Converting $file..."
    ./convert-theme.sh "$file"
  else
    echo "Skipping $file (not found)"
  fi
done

echo ""
echo "Batch conversion complete!"
echo "Please review the changes and test the application."
echo "Backups have been saved with .backup extension."
