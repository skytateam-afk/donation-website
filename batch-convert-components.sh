#!/bin/bash

# Batch convert all component files to use theme-aware classes
echo "Starting batch conversion of component files..."

# Array of component files to convert
files=(
  # Main components
  "src/components/NavLink.vue"
  "src/components/MobileNavLink.vue"
  "src/components/MobileMenu.vue"
  "src/components/BackButton.vue"
  "src/components/ExportButton.vue"
  "src/components/ConfirmDialog.vue"
  "src/components/CommandMenu.vue"
  "src/components/AppBreadcrumb.vue"
  "src/components/AppNavigation.vue"
  
  # Modal components
  "src/components/CreateCodeModal.vue"
  "src/components/CreateCampaignModal.vue"
  "src/components/CreateOrganizationModal.vue"
  "src/components/CreateLinkModal.vue"
  "src/components/QRCodeModal.vue"
  "src/components/LinkAnalyticsModal.vue"
  
  # Analytics components
  "src/components/analytics/TopPerformersChart.vue"
  "src/components/analytics/UsageChart.vue"
  "src/components/analytics/BarChart.vue"
  "src/components/analytics/LineChart.vue"
  "src/components/analytics/PlatformChart.vue"
  
  # UI components
  "src/components/ui/dialog/DialogContent.vue"
  "src/components/ui/dialog/DialogScrollContent.vue"
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
echo "Component conversion complete!"
echo "Please review the changes and test the application."
echo "Backups have been saved with .backup extension."
