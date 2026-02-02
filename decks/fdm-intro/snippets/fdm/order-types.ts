import type { Money } from './money'
import type { OrderId, ProductId } from './types'

// #region snippet
export type OrderStatus = 'Draft' | 'Placed'

export type OrderLine = Readonly<{
  productId: ProductId
  unitPrice: Money
  quantity: number
}>

export type OrderState = Readonly<{
  id: OrderId
  currency: Money['currency']
  status: OrderStatus
  lines: ReadonlyArray<OrderLine>
  total: Money
}>

export type OrderCommand =
  | {
      readonly _tag: 'AddLine'
      readonly productId: ProductId
      readonly unitPriceAmount: number
      readonly quantity: number
    }
  | { readonly _tag: 'PlaceOrder' }

export type OrderEvent =
  | { readonly _tag: 'LineAdded'; readonly line: OrderLine; readonly lineTotal: Money }
  | { readonly _tag: 'OrderPlaced' }
// #endregion snippet

