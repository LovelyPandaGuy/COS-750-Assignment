import { describe, it, expect } from 'vitest'
import {
  BALANCE_FACTOR_ORDER,
  BALANCE_RANGE,
  balanceFactor,
  isOutOfBalance,
  leanOf,
} from '../src/engine/conventions'
import { conventionsWording } from '../src/content/modules/conventionsWording'

// Spec: add-modules-c2-c3 / conventions. Decisions D2, D19.

describe('D2 balance-factor order and range are exported', () => {
  it('order agrees with balanceFactor', () => {
    expect([...BALANCE_FACTOR_ORDER]).toEqual(['left', 'right'])
    expect(balanceFactor(1, -1)).toBe(2)
  })

  it('range agrees with isOutOfBalance', () => {
    for (let n = -3; n <= 3; n++) {
      expect((BALANCE_RANGE as readonly number[]).includes(n), String(n)).toBe(!isOutOfBalance(n))
    }
  })
})

describe('D19 sign and lean wording comes from the conventions', () => {
  it('formula follows the order', () => {
    const lr = conventionsWording(['left', 'right']).formula
    const rl = conventionsWording(['right', 'left']).formula
    expect(lr.indexOf('left')).toBeGreaterThanOrEqual(0)
    expect(lr.indexOf('left')).toBeLessThan(lr.indexOf('right'))
    expect(rl.indexOf('right')).toBeLessThan(rl.indexOf('left'))
  })

  it('default wording uses the exported order', () => {
    expect(conventionsWording().formula).toBe(conventionsWording(BALANCE_FACTOR_ORDER).formula)
  })

  it('lean phrase names the side leanOf returns', () => {
    const w = conventionsWording()
    for (const bf of [2, -2]) {
      const side = leanOf(bf) === 'left-heavy' ? 'left' : 'right'
      const other = side === 'left' ? 'right' : 'left'
      expect(w.leanPhrase(bf)).toContain(side)
      expect(w.leanPhrase(bf)).not.toContain(other)
    }
  })
})
