import { ref, watch, onMounted } from 'vue'

type Theme = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'theme-preference'

// Shared state across all component instances
const currentTheme = ref<Theme>('system')
const isDark = ref(false)

export function useTheme() {
  // Get system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Apply theme to document
  const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Determine which theme to apply
    const effectiveTheme = theme === 'system' ? getSystemTheme() : theme
    
    // Add theme class with transition
    root.classList.add('theme-transitioning')
    root.classList.add(effectiveTheme)
    
    // Update isDark state
    isDark.value = effectiveTheme === 'dark'
    
    // Remove transition class after animation completes
    setTimeout(() => {
      root.classList.remove('theme-transitioning')
    }, 300)
  }

  // Set theme
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    applyTheme(theme)
  }

  // Toggle between light and dark (skips system)
  const toggleTheme = () => {
    if (currentTheme.value === 'light') {
      setTheme('dark')
    } else if (currentTheme.value === 'dark') {
      setTheme('light')
    } else {
      // If on system, toggle to opposite of current system preference
      const systemTheme = getSystemTheme()
      setTheme(systemTheme === 'dark' ? 'light' : 'dark')
    }
  }

  // Cycle through all theme options: light -> dark -> system
  const cycleTheme = () => {
    if (currentTheme.value === 'light') {
      setTheme('dark')
    } else if (currentTheme.value === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  // Initialize theme on mount
  onMounted(() => {
    // Get saved preference or default to light
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    const initialTheme = savedTheme || 'light'
    
    currentTheme.value = initialTheme
    applyTheme(initialTheme)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      if (currentTheme.value === 'system') {
        applyTheme('system')
      }
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange)
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange)
      } else {
        mediaQuery.removeListener(handleSystemThemeChange)
      }
    }
  })

  return {
    currentTheme,
    isDark,
    setTheme,
    toggleTheme,
    cycleTheme,
    getSystemTheme
  }
}
