import { describe, expect, it } from 'vitest'
import {
  ADMIN_EXEMPT_PATHS,
  GUARDED_MUTATION_PREFIXES,
  headerHost,
  isCrossSiteWrite,
  isGuardedRoute,
  normalizeRequestPath,
} from '../../server/core/request-guard'

describe('normalizeRequestPath', () => {
  it.each([
    ['', '/'],
    ['/api//article', '/api/article'],
    ['/api///tag//sync', '/api/tag/sync'],
    ['/api/%61rticle', '/api/article'],
    ['/%', '/%'],
  ])('normalizes %j to %j', (input, expected) => {
    expect(normalizeRequestPath(input)).toBe(expected)
  })

  it('decodes a path once and leaves a second encoding layer intact', () => {
    expect(normalizeRequestPath('/api/%252e%252e')).toBe('/api/%2e%2e')
  })
})

describe('isGuardedRoute', () => {
  it.each(GUARDED_MUTATION_PREFIXES)('guards POST %s and a child path', (prefix) => {
    expect(isGuardedRoute(prefix, 'POST')).toBe(true)
    expect(isGuardedRoute(`${prefix}/1`, 'post')).toBe(true)
  })

  it.each(GUARDED_MUTATION_PREFIXES)('leaves GET and a longer sibling of %s open', (prefix) => {
    expect(isGuardedRoute(prefix, 'GET')).toBe(false)
    expect(isGuardedRoute(prefix, 'HEAD')).toBe(false)
    expect(isGuardedRoute(`${prefix}-extra`, 'POST')).toBe(false)
  })

  it('does not guard the public tag collection', () => {
    expect(isGuardedRoute('/api/tag', 'POST')).toBe(false)
    expect(isGuardedRoute('/api/tag/sync', 'POST')).toBe(true)
  })

  it.each(ADMIN_EXEMPT_PATHS)('leaves %s open', (path) => {
    expect(isGuardedRoute(path, 'POST')).toBe(false)
    expect(isGuardedRoute(path, 'GET')).toBe(false)
  })

  it('guards other admin routes, including reads', () => {
    expect(isGuardedRoute('/api/admin/site/settings', 'GET')).toBe(true)
    expect(isGuardedRoute('/api/admin/site/settings', 'PUT')).toBe(true)
  })

  it('does not treat a longer login path as the login exemption', () => {
    expect(isGuardedRoute('/api/admin/login/extra', 'POST')).toBe(true)
  })

  it('guards a write whose path is percent-encoded', () => {
    expect(isGuardedRoute('/api/article/%2e%2e', 'POST')).toBe(true)
  })

  it('matches paths case-sensitively', () => {
    expect(isGuardedRoute('/api/Article', 'POST')).toBe(false)
    expect(isGuardedRoute('/API/admin/site', 'GET')).toBe(false)
  })
})

describe('isCrossSiteWrite', () => {
  const host = 'blog.local:3000'

  it('rejects a write with neither Origin nor Referer', () => {
    expect(isCrossSiteWrite(host, '', '')).toBe(true)
  })

  it('accepts an Origin on the same host and port', () => {
    expect(isCrossSiteWrite(host, 'http://blog.local:3000', '')).toBe(false)
  })

  it('prefers a hostile Origin over a same-site Referer', () => {
    expect(isCrossSiteWrite(host, 'https://evil.test', 'http://blog.local:3000/editor')).toBe(true)
  })

  it('falls back to Referer when Origin is missing or not a URL', () => {
    expect(isCrossSiteWrite(host, '', 'http://blog.local:3000/editor')).toBe(false)
    expect(isCrossSiteWrite(host, 'not a url', 'http://blog.local:3000/editor')).toBe(false)
  })

  it('treats a different port as a different host', () => {
    expect(headerHost('http://blog.local:3001')).toBe('blog.local:3001')
    expect(isCrossSiteWrite(host, 'http://blog.local:3001', '')).toBe(true)
  })

  it('ignores the default https port when comparing hosts', () => {
    expect(headerHost('https://blog.local')).toBe('blog.local')
    expect(isCrossSiteWrite('blog.local', 'https://blog.local:443', '')).toBe(false)
  })
})
