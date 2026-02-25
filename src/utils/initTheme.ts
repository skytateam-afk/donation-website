/**
 * Initialize theme before Vue app mounts to prevent flash of wrong theme
 * This should be called as early as possible in the app lifecycle
 */
export function initTheme() {
  const THEME_STORAGE_KEY = 'theme-preference'
  
  // Get saved theme preference
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | 'system' | null
  const theme = savedTheme || 'system'
  
  // Determine effective theme
  let effectiveTheme: 'light' | 'dark' = 'light'
  
  if (theme === 'system') {
    // Check system preference
    effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } else {
    effectiveTheme = theme
  }
  
  // Apply theme immediately to prevent flash
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(effectiveTheme)
  
  // Set color-scheme for native browser elements
  root.style.colorScheme = effectiveTheme
}
