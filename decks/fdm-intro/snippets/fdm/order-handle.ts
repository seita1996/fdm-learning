import type { DomainError } from './domain-errors'
import type { OrderCommand, OrderState } from './order-types'
import { decide } from './order-decision'
import { evolve } from './order-evolution'
import type { Result } from 'neverthrow'

// #region snippet
export const handle = (state: OrderState, command: OrderCommand): Result<OrderState, DomainError> =>
  decide(state, command).map((event) => evolve(state, event))
// #endregion snippet

