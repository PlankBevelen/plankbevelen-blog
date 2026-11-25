import { renderMarkdown } from '../../utils/markdown'

/** 渲染规则变更时加一。详情读到旧版本会按原文重算并写回。 */
export const RENDERER_VERSION = 2

const EXCERPT_LENGTH = 160
const PREVIEW_HTML_LENGTH = 1600

export type ArticleTocItem = {
  level: number
  title: string
}

export type ArticleReading = {
  html: string
  previewHtml: string
  excerpt: string
  cover: string | null
  toc: ArticleTocItem[]
  rendererVersion: number
}

function inlineText(raw: string): string {
  return raw
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_~]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isSkippableLine(line: string): boolean {
  const text = line.trim()
  if (!text) return false
  if (text.startsWith('|')) return true
  if (/^([-*_])\1{2,}$/.test(text)) return true
  return false
}

function excerptOf(source: string): string {
  const withoutFence = source.replace(/```[\s\S]*?```/g, ' ')
  const lines = withoutFence.split('\n').flatMap((line) => {
    if (isSkippableLine(line)) return []
    return [
      line
        .replace(/^#{1,6}\s+/, '')
        .replace(/^>\s?/, '')
        .replace(/^\s*([-*+]|\d+\.)\s+/, '')
    ]
  })
  const text = inlineText(lines.join(' '))
  if (text.length <= EXCERPT_LENGTH) return text
  return text.slice(0, EXCERPT_LENGTH).trimEnd()
}

function coverOf(source: string): string | null {
  const markdown = source.match(/!\[[^\]]*\]\((https?:\/\/[^)\s]+|\/uploads\/[^)\s]+)\)/)
  if (markdown?.[1]) return markdown[1].trim()
  const html = source.match(/<img[^>]+src=["'](https?:\/\/[^"']+|\/uploads\/[^"']+)["']/i)
  if (html?.[1]) return html[1].trim()
  return null
}

function tocOf(source: string): ArticleTocItem[] {
  const items: ArticleTocItem[] = []
  let inFence = false
  for (const line of source.split('\n')) {
    if (/^[ \t]*```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const matched = line.match(/^(#{1,6})\s+(\S.*)$/)
    if (!matched?.[1] || !matched[2]) continue
    const title = inlineText(matched[2])
    if (!title) continue
    items.push({ level: matched[1].length, title })
    if (items.length >= 100) break
  }
  return items
}

/** 从已经渲好的正文里截一段完整块，给列表卡片用。不再单独跑一套渲染器。 */
function previewHtmlOf(html: string): string {
  if (html.length <= PREVIEW_HTML_LENGTH) return html
  const slice = html.slice(0, PREVIEW_HTML_LENGTH)
  const closers = ['</p>', '</pre>', '</ul>', '</ol>', '</blockquote>', '</h1>', '</h2>', '</h3>', '</h4>']
  let end = -1
  for (const tag of closers) {
    const at = slice.lastIndexOf(tag)
    if (at > end) end = at + tag.length
  }
  const tableAt = slice.lastIndexOf('<table')
  if (tableAt >= 0 && tableAt > end) {
    const close = html.indexOf('</table>', tableAt)
    if (close !== -1 && close - tableAt < 4000) return html.slice(0, close + '</table>'.length)
    return slice.slice(0, tableAt)
  }
  if (end > 0) return slice.slice(0, end)
  const gt = slice.lastIndexOf('>')
  return gt > 0 ? slice.slice(0, gt + 1) : ''
}

/** 由 Markdown 原文生成详情 HTML、列表预览、摘要、封面和目录。 */
export function compileArticle(source: string): ArticleReading {
  const content = String(source || '')
  const html = renderMarkdown(content)
  return {
    html,
    previewHtml: previewHtmlOf(html),
    excerpt: excerptOf(content),
    cover: coverOf(content),
    toc: tocOf(content),
    rendererVersion: RENDERER_VERSION,
  }
}

export function readingIsCurrent(doc: { html?: unknown; rendererVersion?: unknown } | null | undefined): boolean {
  return !!doc && typeof doc.html === 'string' && doc.rendererVersion === RENDERER_VERSION
}
