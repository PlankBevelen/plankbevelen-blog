export function setRem() {
  // 基准大小，与 nuxt.config.ts 中的 rootValue 保持一致
  const baseSize = 24
  const baseWidth = 1920 // 设计稿宽度

  // 获取视口宽度
  const width = Math.min(document.documentElement.clientWidth, window.innerWidth || 0)
  
  // 移动端适配 (768px以下)
  if (width < 768) {
    // 移动端按比例缩放，假设移动端设计稿为 375 或 750
    // 这里保持一定的最小值，防止字体过小
    const scale = width / 375
    // 限制缩放范围，避免过大或过小
    const finalSize = baseSize * Math.min(Math.max(scale, 0.8), 1.2)
    document.documentElement.style.fontSize = `${finalSize}px`
  } else {
    // PC 端/平板端固定为 20px，确保 1rem = 20px
    // 这样 1280px (64rem) 的容器就会准确显示为 1280px
    document.documentElement.style.fontSize = `${baseSize}px`
  }
}
