export type DomainError =
  | {
      readonly _tag: 'InvalidMoney'
      readonly amount: number
      readonly currency: string
      readonly reason: 'negative' | 'not-integer'
    }
  | { readonly _tag: 'CurrencyMismatch'; readonly left: string; readonly right: string }
  | { readonly _tag: 'InvalidQuantity'; readonly quantity: number }
  | { readonly _tag: 'EmptyOrderLines' }
  | { readonly _tag: 'InvalidOrderTransition'; readonly from: OrderStatus; readonly to: OrderStatus }

export type OrderStatus = 'Draft' | 'Placed'
