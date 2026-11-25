import { describe, expect, it } from 'vitest'
import { isSafeHttpUrl as coreIsSafeHttpUrl } from '../../server/core/url-safe'
import { isSafeHttpUrl } from '../../server/utils/url-safe'
import { sanitizeHtmlText as coreSanitizeHtmlText } from '../../server/core/html-sanitize'
import { sanitizeHtmlText } from '../../server/utils/html-sanitize'
import { renderMarkdown } from '../../server/utils/markdown'
import { normalizeUploadsInContent } from '../../server/utils/content'
import { normalizeUrl, validateFriendLinkInput } from '../../server/utils/friend-links'
import { normalizeCaptchaText } from '../../server/utils/captcha'

describe('isSafeHttpUrl', () => {
  it.each([
    'http://example.com',
    'https://example.com/a?b=1#c',
    'HTTPS://EXAMPLE.COM',
  ])('accepts %j', (value) => {
    expect(isSafeHttpUrl(value)).toBe(true)
  })

  it.each([
    '',
    '   ',
    'javascript:alert(1)',
    ' javascript:alert(1)',
    'data:text/html,hi',
    'file:///etc/passwd',
    '//example.com',
    '/uploads/a.png',
    'http://',
    'not a url',
  ])('rejects %j', (value) => {
    expect(isSafeHttpUrl(value)).toBe(false)
  })

  it('matches the core copy used by site content', () => {
    const samples = ['https://example.com', 'javascript:alert(1)', '']
    for (const sample of samples) {
      expect(coreIsSafeHttpUrl(sample)).toBe(isSafeHttpUrl(sample))
    }
  })
})

describe('sanitizeHtmlText', () => {
  it('drops script tags and keeps paragraph text', () => {
    const html = sanitizeHtmlText('<script>alert(1)</script><p>hello</p>')
    expect(html.toLowerCase()).not.toContain('<script')
    expect(html).toContain('hello')
    expect(html).toContain('<p>')
  })

  it('drops event handlers and javascript URLs', () => {
    const html = sanitizeHtmlText(
      '<img src="https://cdn.example/a.png" onerror="alert(1)"><a href="javascript:alert(1)">x</a>'
    )
    expect(html).toContain('https://cdn.example/a.png')
    expect(html.toLowerCase()).not.toContain('onerror')
    expect(html.toLowerCase()).not.toContain('javascript:')
  })

  it('matches the core copy', () => {
    const sample = '<p onclick="alert(1)">ok</p>'
    expect(coreSanitizeHtmlText(sample)).toBe(sanitizeHtmlText(sample))
  })
})

describe('renderMarkdown', () => {
  it('opens external links in a new tab with a safe rel', () => {
    const html = renderMarkdown('[docs](https://example.com/docs)')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('leaves same-site links without a new-tab rel', () => {
    const html = renderMarkdown('[about](/about)')
    expect(html).not.toContain('noopener')
    expect(html).not.toContain('target="_blank"')
  })

  it('lazy-loads images and strips raw script html', () => {
    const html = renderMarkdown('![cover](https://cdn.example/a.png)\n\n<script>alert(1)</script>')
    expect(html).toContain('loading="lazy"')
    expect(html.toLowerCase()).not.toContain('<script')
  })
})

describe('normalizeUploadsInContent', () => {
  it('prefixes bare uploads paths in markdown and html', () => {
    const source = '![a](uploads/a.png) ![b](uploads\\b.png) <img src="uploads/c.png">'
    expect(normalizeUploadsInContent(source)).toBe(
      '![a](/uploads/a.png) ![b](/uploads/b.png) <img src="/uploads/c.png">'
    )
  })

  it('leaves an already rooted uploads path unchanged', () => {
    const source = '![a](/uploads/a.png)'
    expect(normalizeUploadsInContent(source)).toBe(source)
  })
})

describe('friend links', () => {
  it('normalizes protocol, host, and a trailing slash', () => {
    expect(normalizeUrl('HTTPS://Example.COM/a/')).toBe('https://example.com/a')
  })

  it('strips tags, trims the url, and keeps an empty avatar', () => {
    const result = validateFriendLinkInput({
      name: '  <b>木板</b>  ',
      url: ' https://example.com/blog ',
      description: '<i>一条说明</i>',
      avatar: '',
    })
    expect(result).toEqual({
      ok: true,
      value: {
        name: '木板',
        url: 'https://example.com/blog',
        description: '一条说明',
        avatar: '',
      },
    })
  })

  it.each([
    [{ name: '', url: 'https://example.com' }, '站点名称不能为空'],
    [{ name: '<b></b>', url: 'https://example.com' }, '站点名称不能为空'],
    [{ name: '木'.repeat(51), url: 'https://example.com' }, '站点名称不能超过 50 字'],
    [{ name: '木板', url: '' }, '站点地址不能为空'],
    [{ name: '木板', url: 'javascript:alert(1)' }, '站点地址仅支持 http/https 协议'],
    [{ name: '木板', url: 'https://example.com', avatar: 'data:image/png,xx' }, '头像地址仅支持 http/https 协议'],
  ])('rejects %j', (input, message) => {
    expect(validateFriendLinkInput(input)).toEqual({ ok: false, msg: message })
  })

  it('truncates a description to 200 characters after stripping tags', () => {
    const result = validateFriendLinkInput({
      name: '木板',
      url: 'https://example.com',
      description: `<b>${'说'.repeat(201)}</b>`,
    })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.description).toHaveLength(200)
  })
})

describe('normalizeCaptchaText', () => {
  it('lowercases and removes whitespace', () => {
    expect(normalizeCaptchaText(' Ab C ')).toBe('abc')
    expect(normalizeCaptchaText('')).toBe('')
  })
})
