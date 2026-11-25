import { describe, expect, it } from 'vitest'
import { Snowflake } from '../../server/modules/id/snowflake'

describe('Snowflake', () => {
  it.each([
    [-1, 0, /workerId/],
    [32, 0, /workerId/],
    [0, -1, /datacenterId/],
    [0, 32, /datacenterId/],
  ] as const)('rejects worker %s and datacenter %s', (workerId, datacenterId, message) => {
    expect(() => new Snowflake(workerId, datacenterId)).toThrow(message)
  })

  it('embeds the worker and datacenter in the id', () => {
    const id = new Snowflake(7, 9).nextId()
    expect((id >> 12n) & 31n).toBe(7n)
    expect((id >> 17n) & 31n).toBe(9n)
    expect(id > 0n).toBe(true)
  })

  it('issues distinct ids in a burst', () => {
    const generator = new Snowflake(1, 2)
    const ids = new Set(Array.from({ length: 500 }, () => generator.nextId().toString()))
    expect(ids.size).toBe(500)
  })
})
