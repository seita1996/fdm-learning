import { err, ok, type Result } from 'neverthrow'
import type { DomainError } from './domain-errors'

export type Currency = 'JPY' | 'USD'

export class Money {
  private constructor(
    readonly amount: number,
    readonly currency: Currency,
  ) {}

  static create(amount: number, currency: Currency): Result<Money, DomainError> {
    if (!Number.isInteger(amount)) {
      return err({ _tag: 'InvalidMoney', amount, currency, reason: 'not-integer' })
    }
    if (amount < 0) {
      return err({ _tag: 'InvalidMoney', amount, currency, reason: 'negative' })
    }
    return ok(new Money(amount, currency))
  }

  add(other: Money): Result<Money, DomainError> {
    if (this.currency !== other.currency) {
      return err({ _tag: 'CurrencyMismatch', left: this.currency, right: other.currency })
    }
    return Money.create(this.amount + other.amount, this.currency)
  }

  multiply(n: number): Result<Money, DomainError> {
    if (!Number.isInteger(n)) {
      return err({ _tag: 'InvalidMoney', amount: n, currency: this.currency, reason: 'not-integer' })
    }
    return Money.create(this.amount * n, this.currency)
  }
}
