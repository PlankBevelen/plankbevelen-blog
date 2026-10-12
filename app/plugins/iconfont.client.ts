const ICONFONT_SRC = 'https://at.alicdn.com/t/c/font_5241973_u4iud1tdxha.js'

export default defineNuxtPlugin(() => {
  if (document.querySelector('script[data-iconfont="5241973"]')) return

  const script = document.createElement('script')
  script.src = ICONFONT_SRC
  script.async = true
  script.dataset.iconfont = '5241973'
  document.head.appendChild(script)
})
