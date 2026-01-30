import { err, ok, type Result } from 'neverthrow'
import type { DomainError, OrderStatus } from './domain-errors'
import { Money, type Currency } from './money'

type Brand<T, B extends string> = T & { readonly __brand: B }
export type OrderId = Brand<string, 'OrderId'>
export type ProductId = Brand<string, 'ProductId'>

export type OrderLine = Readonly<{
  productId: ProductId
  unitPrice: Money
  quantity: number
}>

export class Order {
  private constructor(
    readonly id: OrderId,
    readonly status: OrderStatus,
    readonly lines: ReadonlyArray<OrderLine>,
    readonly total: Money,
  ) {}

  static draft(params: {
    id: OrderId
    currency: Currency
    lines: ReadonlyArray<{ productId: ProductId; unitPriceAmount: number; quantity: number }>
  }): Result<Order, DomainError> {
    if (params.lines.length === 0) return err({ _tag: 'EmptyOrderLines' })

    const linesR = params.lines.reduce<Result<OrderLine[], DomainError>>(
      (accR, l) =>
        accR.andThen((acc) =>
          Money.create(l.unitPriceAmount, params.currency).andThen((unitPrice) => {
            if (!Number.isInteger(l.quantity) || l.quantity <= 0) {
              return err({ _tag: 'InvalidQuantity', quantity: l.quantity })
            }
            return ok([...acc, { productId: l.productId, unitPrice, quantity: l.quantity }])
          }),
        ),
      ok([]),
    )

    return linesR.andThen((lines) =>
      Order.computeTotal(lines, params.currency).map((total) => new Order(params.id, 'Draft', lines, total)),
    )
  }

  place(): Result<Order, DomainError> {
    if (this.status !== 'Draft') {
      return err({ _tag: 'InvalidOrderTransition', from: this.status, to: 'Placed' })
    }
    return ok(new Order(this.id, 'Placed', this.lines, this.total))
  }

  private static computeTotal(lines: ReadonlyArray<OrderLine>, currency: Currency): Result<Money, DomainError> {
    return Money.create(0, currency).andThen((zero) =>
      lines.reduce<Result<Money, DomainError>>(
        (totalR, line) =>
          totalR.andThen((total) =>
            line.unitPrice.multiply(line.quantity).andThen((lineTotal) => total.add(lineTotal)),
          ),
        ok(zero),
      ),
    )
  }
}

