import MarkdownIt from 'markdown-it'
import { sanitizeHtmlText } from './html-sanitize'

const markdown = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
})

const renderLinkOpen = markdown.renderer.rules.link_open
  || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))
const renderImage = markdown.renderer.rules.image
  || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  if (!token) return renderLinkOpen(tokens, idx, options, env, self)
  const href = token.attrGet('href') || ''
  if (/^https?:/i.test(href)) {
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
  }
  return renderLinkOpen(tokens, idx, options, env, self)
}

markdown.renderer.rules.image = (tokens, idx, options, env, self) => {
  tokens[idx]?.attrSet('loading', 'lazy')
  return renderImage(tokens, idx, options, env, self)
}

/** 把 Markdown 渲成可直接输出的 HTML。代码块保持纯文本，不加载高亮器。 */
export function renderMarkdown(source: string): string {
  return sanitizeHtmlText(markdown.render(String(source || '')))
}
