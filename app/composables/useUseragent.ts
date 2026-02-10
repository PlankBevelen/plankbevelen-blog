import { ref, onMounted, onUnmounted } from 'vue'

export function useUserAgent() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(true)
  const deviceType = ref<'mobile' | 'tablet' | 'desktop'>('desktop')

  const checkDevice = () => {
    if (typeof window === 'undefined') return

    const userAgent = navigator.userAgent.toLowerCase()
    const screenWidth = window.innerWidth

    if (screenWidth <= 768) {
      deviceType.value = 'mobile'
    } else if (screenWidth <= 1024) {
      deviceType.value = 'tablet'
    } else {
      deviceType.value = 'desktop'
    }

    isMobile.value = deviceType.value === 'mobile'
    isTablet.value = deviceType.value === 'tablet'
    isDesktop.value = deviceType.value === 'desktop'
  }

  onMounted(() => {
    checkDevice()
    window.addEventListener('resize', checkDevice)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkDevice)
  })

  return {
    deviceType,
    isMobile,
    isTablet,
    isDesktop
  }
}

