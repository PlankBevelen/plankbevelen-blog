// 根据用户代理和用户屏幕大小判断用户device：
// 1. 如果用户代理包含 'mobile' 或 'android' 或 'ios'，则判断为移动设备
// 2. 如果用户屏幕宽度小于等于 768px，则判断为移动设备
// 3. 如果在768到1024px之间，则判断为平板设备
// 4. 否则判断为桌面设备

export function useUserAgent() {
  const userAgent = navigator.userAgent.toLowerCase()
  const screenWidth = window.innerWidth

  if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('ios')) {
    return 'mobile'
  } else if (screenWidth <= 768) {
    return 'mobile'
  } else if (screenWidth <= 1024) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}