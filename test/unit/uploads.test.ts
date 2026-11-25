import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveUploadPath, uploadMimeType } from '../../server/utils/uploads'
import { assertSafeTempId, resolveTempDir } from '../../server/utils/temp-id'

const root = path.join(path.parse(process.cwd()).root, 'plankbevelen-upload-fixture')

function staysInside(fullPath: string) {
  const rel = path.relative(path.resolve(root), fullPath)
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

describe('resolveUploadPath', () => {
  it('resolves a nested image inside the upload root', () => {
    expect(resolveUploadPath(root, '2024/a.png')).toEqual({
      ok: true,
      fullPath: path.resolve(root, '2024/a.png'),
    })
  })

  it('strips a leading .. traversal and keeps the remainder inside the root', () => {
    expect(resolveUploadPath(root, 'foo/../../outside.txt')).toEqual({
      ok: true,
      fullPath: path.resolve(root, 'outside.txt'),
    })
    const nested = resolveUploadPath(root, '../../windows/system32/config')
    expect(nested.ok).toBe(true)
    if (nested.ok) expect(staysInside(nested.fullPath)).toBe(true)
  })

  it.each(['/etc/passwd', path.join(path.parse(root).root, 'windows', 'system32', 'config')])(
    'rejects an absolute path %j',
    (input) => {
      expect(resolveUploadPath(root, input)).toEqual({
        ok: false,
        statusCode: 403,
        statusMessage: 'Access denied',
      })
    }
  )

  it('rejects an empty path as missing', () => {
    expect(resolveUploadPath(root, '')).toEqual({
      ok: false,
      statusCode: 404,
      statusMessage: 'File not found',
    })
  })

  it('does not decode percent-encoding itself', () => {
    const decision = resolveUploadPath(root, '%2e%2e/%2e%2e/etc/passwd')
    expect(decision.ok).toBe(true)
    if (decision.ok) expect(staysInside(decision.fullPath)).toBe(true)
  })
})

describe('uploadMimeType', () => {
  it.each([
    ['a.png', 'image/png'],
    ['a.PNG', 'image/png'],
    ['a.jpg', 'image/jpeg'],
    ['a.jpeg', 'image/jpeg'],
    ['a.gif', 'image/gif'],
    ['a.webp', 'image/webp'],
  ])('allows %s', (filename, mime) => {
    expect(uploadMimeType(filename)).toBe(mime)
  })

  it.each(['x.svg', 'clip.mp4', 'readme.txt', 'noext'])('rejects %s', (filename) => {
    expect(uploadMimeType(filename)).toBeNull()
  })
})

describe('temp id', () => {
  it.each([
    ['abcd1234', true],
    ['a'.repeat(64), true],
    ['abc_DEF-1', true],
    ['a'.repeat(7), false],
    ['a'.repeat(65), false],
    ['../abcd1234', false],
    ['abcd1234/../x', false],
    ['abcd.1234', false],
    ['', false],
  ])('assertSafeTempId(%j) is %s', (value, expected) => {
    expect(assertSafeTempId(value)).toBe(expected)
  })

  it('resolves a valid id under the dev uploads/temp directory', () => {
    const previous = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    try {
      expect(resolveTempDir('abcd1234')).toBe(
        path.resolve(process.cwd(), 'public', 'uploads', 'temp', 'abcd1234')
      )
    } finally {
      if (previous === undefined) delete process.env.NODE_ENV
      else process.env.NODE_ENV = previous
    }
  })

  it('throws before touching the filesystem for an unsafe id', () => {
    expect(() => resolveTempDir('../abcd1234')).toThrow('非法 tempId')
    expect(() => resolveTempDir('short')).toThrow('非法 tempId')
  })
})
