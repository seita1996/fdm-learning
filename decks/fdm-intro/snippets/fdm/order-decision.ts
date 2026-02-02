import { err, ok, type Result } from 'neverthrow'
import type { DomainError } from './domain-errors'
import { Money } from './money'
import type { OrderCommand, OrderEvent, OrderState } from './order-types'

// #region snippet
export const decide = (state: OrderState, command: OrderCommand): Result<OrderEvent, DomainError> => {
  if (state.status === 'Placed') return err({ _tag: 'OrderAlreadyPlaced' })

  switch (command._tag) {
    case 'AddLine': {
      if (!Number.isInteger(command.quantity) || command.quantity <= 0) {
        return err({ _tag: 'InvalidQuantity', quantity: command.quantity })
      }

      return Money.create(command.unitPriceAmount, state.currency).map((unitPrice) => {
        const line = { productId: command.productId, unitPrice, quantity: command.quantity }
        const lineTotal = Money.multiply(unitPrice, command.quantity)
        return { _tag: 'LineAdded', line, lineTotal } as const
      })
    }

    case 'PlaceOrder': {
      if (state.lines.length === 0) return err({ _tag: 'CannotPlaceEmptyOrder' })
      return ok({ _tag: 'OrderPlaced' } as const)
    }
  }
}
// #endregion snippet

