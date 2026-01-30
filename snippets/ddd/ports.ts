import type { ResultAsync } from 'neverthrow'
import type { Order } from './order'

export type InfraError =
  | { readonly _tag: 'DbError'; readonly message: string }
  | { readonly _tag: 'PaymentGatewayError'; readonly message: string }
  | { readonly _tag: 'InventoryError'; readonly message: string }

export interface OrderRepository {
  save(order: Order): ResultAsync<void, InfraError>
}

export interface InventoryService {
  reserve(order: Order): ResultAsync<void, InfraError>
}

export interface PaymentService {
  charge(order: Order): ResultAsync<void, InfraError>
}

