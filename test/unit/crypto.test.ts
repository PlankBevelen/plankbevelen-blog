import { describe, expect, it } from 'vitest'
import { randomTokenHex, safeEqualString, sha256Hex } from '../../server/core/crypto-safe'
import * as utilsCrypto from '../../server/utils/crypto-safe'
import { hashAdminPassword, verifyAdminPassword } from '../../server/core/password'
import { resolveSessionMaxAge } from '../../server/core/session'

const ABC_SHA256 = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
const WEEK_SECONDS = 60 * 60 * 24 * 7

describe('sha256Hex', () => {
  it('matches the known digest of abc', () => {
    expect(sha256Hex('abc')).toBe(ABC_SHA256)
  })

  it('agrees with the utils copy used by the auth middleware', () => {
    expect(utilsCrypto.sha256Hex('abc')).toBe(sha256Hex('abc'))
    expect(utilsCrypto.safeEqualString('same', 'same')).toBe(true)
    expect(utilsCrypto.safeEqualString('same', 'diff')).toBe(false)
  })
})

describe('safeEqualString', () => {
  it('returns true for equal values, including empty strings', () => {
    expect(safeEqualString('token', 'token')).toBe(true)
    expect(safeEqualString('', '')).toBe(true)
    expect(safeEqualString('é', 'é')).toBe(true)
  })

  it('returns false for a different value of the same length', () => {
    expect(safeEqualString('token', 'tokEn')).toBe(false)
  })

  it('returns false for different lengths without throwing', () => {
    expect(safeEqualString('short', 'longer')).toBe(false)
    expect(safeEqualString('', 'x')).toBe(false)
  })
})

describe('randomTokenHex', () => {
  it('returns twice as many hex characters as the requested bytes', () => {
    expect(randomTokenHex(16)).toMatch(/^[0-9a-f]{32}$/)
    expect(randomTokenHex()).toMatch(/^[0-9a-f]{64}$/)
  })

  it('does not repeat a 16-byte token across a small sample', () => {
    const tokens = new Set(Array.from({ length: 20 }, () => randomTokenHex(16)))
    expect(tokens.size).toBe(20)
  })
})

describe('verifyAdminPassword', () => {
  it('accepts an argon2id hash and rejects a different password', async () => {
    const stored = await hashAdminPassword('correct horse')
    expect(stored.startsWith('$argon2')).toBe(true)
    expect(await verifyAdminPassword('correct horse', stored)).toBe(true)
    expect(await verifyAdminPassword('wrong horse', stored)).toBe(false)
  })

  it('still accepts a legacy sha256 hex digest', async () => {
    const stored = sha256Hex('legacy-secret')
    expect(await verifyAdminPassword('legacy-secret', stored)).toBe(true)
    expect(await verifyAdminPassword('other-secret', stored)).toBe(false)
  })

  it('rejects an empty store and a malformed argon2 string', async () => {
    expect(await verifyAdminPassword('x', '')).toBe(false)
    expect(await verifyAdminPassword('x', '$argon2not-a-hash')).toBe(false)
  })
})

describe('resolveSessionMaxAge', () => {
  it('uses the expiration window when the session is remembered', () => {
    expect(resolveSessionMaxAge(true, 43200, 604800)).toBe(43200)
  })

  it('uses the keep-alive window otherwise', () => {
    expect(resolveSessionMaxAge(false, 43200, 604800)).toBe(604800)
  })

  it.each([0, -1, Number.NaN, 'nope', null])('falls back to 7 days for %j', (value) => {
    expect(resolveSessionMaxAge(true, value, 10)).toBe(WEEK_SECONDS)
    expect(resolveSessionMaxAge(false, 10, value)).toBe(WEEK_SECONDS)
  })
})
