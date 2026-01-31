import { err, ok, type Result } from 'neverthrow'
import type { DomainError } from './domain-errors'

// #region snippet
export type Currency = 'JPY' | 'USD'
export type Money = Readonly<{ amount: number; currency: Currency }>

export const Money = {
  create(amount: number, currency: Currency): Result<Money, DomainError> {
    if (!Number.isInteger(amount)) {
      return err({ _tag: 'InvalidMoney', amount, currency, reason: 'not-integer' })
    }
    if (amount < 0) {
      return err({ _tag: 'InvalidMoney', amount, currency, reason: 'negative' })
    }
    return ok({ amount, currency })
  },

  add(a: Money, b: Money): Money {
    // Decision側で同一通貨に揃える前提（Evolutionを失敗させないため）
    return { amount: a.amount + b.amount, currency: a.currency }
  },

  multiply(money: Money, n: number): Money {
    return { amount: money.amount * n, currency: money.currency }
  },
} as const
// #endregion snippet
