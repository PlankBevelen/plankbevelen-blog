import { describe, expect, it } from 'vitest'
import { isPinned, resolvePinFields, sortPinnedFirst } from '../../server/utils/article-pin'
import { compileArticle, readingIsCurrent, RENDERER_VERSION } from '../../server/modules/article/reading'
import { clampPage, clampPageSize, toArticleListItem } from '../../server/modules/article/payload'

const now = new Date('2026-11-25T00:00:00.000Z')
const earlier = new Date('2026-01-01T00:00:00.000Z')

describe('resolvePinFields', () => {
  it('stamps pinnedAt when an article becomes pinned', () => {
    expect(resolvePinFields(false, null, true, now)).toEqual({ pinned: true, pinnedAt: now })
  })

  it('keeps the original pinnedAt when it stays pinned', () => {
    expect(resolvePinFields(true, earlier, true, now)).toEqual({ pinned: true, pinnedAt: earlier })
  })

  it('clears pinnedAt when it is unpinned', () => {
    expect(resolvePinFields(true, earlier, false, now)).toEqual({ pinned: false, pinnedAt: null })
  })

  it('ignores a non-boolean pin flag and keeps the current state', () => {
    expect(resolvePinFields(true, earlier, 'yes', now)).toEqual({ pinned: true, pinnedAt: earlier })
    expect(resolvePinFields(false, earlier, undefined, now)).toEqual({ pinned: false, pinnedAt: null })
  })

  it('fills pinnedAt when a pinned article has none', () => {
    expect(resolvePinFields(true, null, true, now)).toEqual({ pinned: true, pinnedAt: now })
    expect(resolvePinFields(true, undefined, undefined, now)).toEqual({ pinned: true, pinnedAt: null })
  })

  it('only treats a real boolean true as pinned', () => {
    expect(isPinned(true)).toBe(true)
    expect(isPinned('true')).toBe(false)
    expect(isPinned(1)).toBe(false)
  })

  it('sorts pinned articles ahead of the caller sort', () => {
    expect(sortPinnedFirst({ createTime: -1 })).toEqual({
      pinnedRank: -1,
      pinnedAt: -1,
      createTime: -1,
    })
  })
})

describe('clampPage', () => {
  it.each([
    [undefined, 1],
    [0, 1],
    [-4, 1],
    ['abc', 1],
    [3, 3],
    ['8', 8],
  ])('clampPage(%j) is %s', (input, expected) => {
    expect(clampPage(input)).toBe(expected)
  })
})

describe('clampPageSize', () => {
  it.each([
    [undefined, 10],
    ['', 10],
    [0, 10],
    ['0', 10],
    ['abc', 10],
    [-5, 1],
    [1, 1],
    [50, 50],
    [99999, 50],
    ['20', 20],
  ])('clampPageSize(%j) is %s', (input, expected) => {
    expect(clampPageSize(input)).toBe(expected)
  })
})

describe('toArticleListItem', () => {
  it('coerces missing fields and refuses a non-boolean pin', () => {
    expect(toArticleListItem({
      id: 12,
      title: null,
      tags: 'vue',
      cover: '',
      pinned: 'true',
    })).toEqual({
      id: '12',
      title: '',
      tags: [],
      category: '',
      excerpt: '',
      previewHtml: '',
      cover: null,
      createTime: '',
      updateTime: '',
      pinned: false,
    })
  })

  it('stringifies tag entries', () => {
    expect(toArticleListItem({ tags: ['vue', 1] }).tags).toEqual(['vue', '1'])
  })
})

describe('compileArticle', () => {
  it('keeps fenced code out of the excerpt and the toc', () => {
    const reading = compileArticle([
      '开头',
      '```js',
      'secret token inside fence',
      '# not a heading',
      '```',
      '# 真正的标题',
      '结尾',
    ].join('\n'))

    expect(reading.excerpt).toContain('开头')
    expect(reading.excerpt).toContain('结尾')
    expect(reading.excerpt).not.toContain('secret')
    expect(reading.excerpt).not.toContain('not a heading')
    expect(reading.toc).toEqual([{ level: 1, title: '真正的标题' }])
  })

  it('strips script from the rendered html', () => {
    const reading = compileArticle('<script>alert(1)</script>\n\nhello')
    expect(reading.html.toLowerCase()).not.toContain('<script')
    expect(reading.html).toContain('hello')
    expect(reading.rendererVersion).toBe(RENDERER_VERSION)
  })

  it('uses the first safe markdown image as the cover', () => {
    const reading = compileArticle('![a](https://cdn.example/a.png)\n![b](/uploads/b.jpg)')
    expect(reading.cover).toBe('https://cdn.example/a.png')
  })

  it('falls back to an uploads img and ignores a javascript image', () => {
    expect(compileArticle('![a](images/local.png)\n<img src="/uploads/c.webp">').cover).toBe('/uploads/c.webp')
    expect(compileArticle('![a](javascript:alert(1))').cover).toBeNull()
  })

  it('skips a heading whose text disappears after inline cleanup', () => {
    const reading = compileArticle('## ![](https://cdn.example/a.png)\n### **目录**')
    expect(reading.toc).toEqual([{ level: 3, title: '目录' }])
  })

  it('caps the toc at 100 entries', () => {
    const source = Array.from({ length: 101 }, (_, index) => `# h${index}`).join('\n')
    expect(compileArticle(source).toc).toHaveLength(100)
  })

  it('truncates the excerpt at 160 code units', () => {
    expect(compileArticle('字'.repeat(200)).excerpt).toHaveLength(160)
    expect(compileArticle('短').excerpt).toBe('短')
  })

  it('stores a rendered preview and keeps table markup out of the excerpt', () => {
    const reading = compileArticle('| 服务 | 角色 |\n| --- | --- |\n| api | 网关 |\n\n**加粗**一段说明')
    expect(reading.previewHtml).toContain('<table')
    expect(reading.previewHtml).toContain('<strong>')
    expect(reading.excerpt).not.toContain('|')
    expect(reading.excerpt).toContain('加粗')
  })
})

describe('readingIsCurrent', () => {
  it('requires a string html field and the current renderer version', () => {
    expect(readingIsCurrent(null)).toBe(false)
    expect(readingIsCurrent({ html: '<p></p>' })).toBe(false)
    expect(readingIsCurrent({ html: '<p></p>', rendererVersion: 0 })).toBe(false)
    expect(readingIsCurrent({ html: null, rendererVersion: RENDERER_VERSION })).toBe(false)
    expect(readingIsCurrent({ html: '<p></p>', rendererVersion: RENDERER_VERSION })).toBe(true)
  })
})
