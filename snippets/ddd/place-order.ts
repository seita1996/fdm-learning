import { errAsync, type ResultAsync } from 'neverthrow'
import type { DomainError } from './domain-errors'
import { Order, type OrderId, type ProductId } from './order'
import type { Currency } from './money'
import type { InfraError, InventoryService, OrderRepository, PaymentService } from './ports'

export type PlaceOrderError = DomainError | InfraError

export type PlaceOrderInput = Readonly<{
  id: OrderId
  currency: Currency
  lines: ReadonlyArray<{ productId: ProductId; unitPriceAmount: number; quantity: number }>
}>

export const placeOrder = (deps: {
  repo: OrderRepository
  inventory: InventoryService
  payment: PaymentService
}) => {
  return (input: PlaceOrderInput): ResultAsync<Order, PlaceOrderError> => {
    // ドメイン生成・検証（同期）
    const draftR = Order.draft(input)

    // I/Oは ResultAsync で合成（同期Resultは okAsync/errAsync に持ち上げる）
    return draftR.match(
      (draft) =>
        deps.inventory
          .reserve(draft)
          .andThen(() => deps.payment.charge(draft))
          .andThen(() =>
            draft.place().match(
              (placed) => deps.repo.save(placed).map(() => placed),
              (e) => errAsync(e),
            ),
          ),
      (e) => errAsync(e),
    )
  }
}
