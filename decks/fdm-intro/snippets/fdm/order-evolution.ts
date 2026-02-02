import { Money } from './money'
import type { OrderEvent, OrderState } from './order-types'

// #region snippet
export const evolve = (state: OrderState, event: OrderEvent): OrderState => {
  switch (event._tag) {
    case 'LineAdded':
      return {
        ...state,
        lines: [...state.lines, event.line],
        total: Money.add(state.total, event.lineTotal),
      }
    case 'OrderPlaced':
      return { ...state, status: 'Placed' }
  }
}
// #endregion snippet

