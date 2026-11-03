import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type Theme = 'system' | 'light' | 'dark'

// index.html reads the same key before the app starts, so the page never flashes the wrong theme
const THEME_KEY = 'zalik_theme'

// --surface from theme.css: the phone browser paints its top bar in this color
const SURFACE = { light: '#f9faef', dark: '#12140e' }

function savedTheme(): Theme {
  const theme = localStorage.getItem(THEME_KEY)

  return theme === 'light' || theme === 'dark' ? theme : 'system'
}

function apply(theme: Theme) {
  const root = document.documentElement

  if (theme === 'system') delete root.dataset.theme
  else root.dataset.theme = theme

  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    const scheme = meta.media.includes('dark') ? 'dark' : 'light'
    meta.content = SURFACE[theme === 'system' ? scheme : theme]
  }
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>(savedTheme())

  watch(
    theme,
    (value) => {
      if (value === 'system') localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, value)

      apply(value)
    },
    { immediate: true },
  )

  return { theme }
})
