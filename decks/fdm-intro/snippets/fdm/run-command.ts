import { errAsync, type ResultAsync } from 'neverthrow'
import type { DomainError } from './domain-errors'
import type { OrderCommand, OrderState } from './order-types'
import { handle } from './order-handle'
import type { InfraError, OrderRepository } from './ports'
import type { OrderId } from './types'

// #region snippet
export type RunCommandError = DomainError | InfraError

export const runOrderCommand = (deps: { repo: OrderRepository }) => {
  return (id: OrderId, command: OrderCommand): ResultAsync<OrderState, RunCommandError> =>
    deps.repo.load(id).andThen((state) =>
      handle(state, command).match(
        (next) => deps.repo.save(next).map(() => next),
        (e) => errAsync(e),
      ),
    )
}
// #endregion snippet

