import sanitizeHtml from 'sanitize-html'

/**
 * 兜底 HTML 消毒工具（纵深防御）。
 * 当前正文为 Markdown、由前端 md-editor 过滤渲染，无活跃的服务端 HTML 出站路径；
 * 若未来启用 shortHtml/longHtml 或 site-content 中含 HTML 的字段，统一经此消毒。
 */
export function sanitizeHtmlText(html: string): string {
  return sanitizeHtml(String(html || ''), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr'
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      a: ['href', 'name', 'target', 'rel'],
      code: ['class'],
      pre: ['class'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  })
}
