import type { ResultAsync } from 'neverthrow'
import type { OrderId } from './types'
import type { OrderState } from './order-types'

// #region snippet
export type InfraError = { readonly _tag: 'DbError'; readonly message: string }

export interface OrderRepository {
  load(id: OrderId): ResultAsync<OrderState, InfraError>
  save(state: OrderState): ResultAsync<void, InfraError>
}
// #endregion snippet

