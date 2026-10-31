const ICONFONT_ID = '5241973'
const ICONFONT_SRC = `https://at.alicdn.com/t/c/font_${ICONFONT_ID}_u4iud1tdxha.js`
const SPRITE_STRING_KEY = `_iconfont_svg_string_${ICONFONT_ID}`
const SAMPLE_SYMBOL_ID = 'icon-calendar'

function rewriteFillsInMarkup(markup: string) {
  return markup.replace(/fill="(?!none"|currentColor")[^"]*"/gi, 'fill="currentColor"')
}

function rewriteFillsInDom(root: ParentNode) {
  root.querySelectorAll('[fill]').forEach((el) => {
    const fill = el.getAttribute('fill')
    if (!fill) return
    const value = fill.trim().toLowerCase()
    if (value === 'none' || value === 'currentcolor') return
    el.setAttribute('fill', 'currentColor')
  })
}

function findIconfontSprite() {
  return document.getElementById(SAMPLE_SYMBOL_ID)?.closest('svg') ?? null
}

function normalizeIconfontColors() {
  const store = window as Window & Record<string, unknown>
  const svgString = store[SPRITE_STRING_KEY]
  if (typeof svgString === 'string') {
    store[SPRITE_STRING_KEY] = rewriteFillsInMarkup(svgString)
  }

  const sprite = findIconfontSprite()
  if (!sprite) return false
  rewriteFillsInDom(sprite)
  return true
}

function waitForSprite() {
  if (normalizeIconfontColors()) return

  const observer = new MutationObserver(() => {
    if (normalizeIconfontColors()) observer.disconnect()
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })
  window.setTimeout(() => observer.disconnect(), 8000)
}

export default defineNuxtPlugin(() => {
  if (document.querySelector(`script[data-iconfont="${ICONFONT_ID}"]`)) {
    waitForSprite()
    return
  }

  const script = document.createElement('script')
  script.src = ICONFONT_SRC
  script.async = true
  script.dataset.iconfont = ICONFONT_ID
  script.addEventListener('load', waitForSprite)
  document.head.appendChild(script)
})
