import { ref, watch, onMounted } from 'vue'
import { useAuthentication } from '@/composables/useAuthentication'

type Theme = 'light' | 'dark'

export function useTheme() {
  const { getTheme, setTheme } = useAuthentication()
  const currentTheme = ref<Theme>('light')
  if (typeof window !== 'undefined') {
    const saved = getTheme() as Theme | null
    if (saved === 'light' || saved === 'dark') {
      currentTheme.value = saved
    }
  }

  const applyTheme = (theme: Theme) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (theme === 'dark') {
      root.setAttribute('theme', 'dark')
    } else {
      root.removeAttribute('theme')
    }
    if (typeof window !== 'undefined') {
      setTheme(theme)
    }
  }

  return {
    currentTheme,
    applyTheme,
  }
}
