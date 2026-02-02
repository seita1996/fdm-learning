import { err, ok, type Result } from 'neverthrow'

// #region snippet
type State = Readonly<{ status: 'Draft' | 'Placed'; lines: number }>
type Command = { readonly _tag: 'AddLine' } | { readonly _tag: 'PlaceOrder' }
type DomainError = { readonly _tag: 'AlreadyPlaced' } | { readonly _tag: 'CannotPlaceEmptyOrder' }
type Event = { readonly _tag: 'LineAdded' } | { readonly _tag: 'OrderPlaced' }

const decide = (state: State, command: Command): Result<Event, DomainError> => {
  if (state.status === 'Placed') return err({ _tag: 'AlreadyPlaced' })

  switch (command._tag) {
    case 'AddLine':
      return ok({ _tag: 'LineAdded' })
    case 'PlaceOrder':
      return state.lines === 0 ? err({ _tag: 'CannotPlaceEmptyOrder' }) : ok({ _tag: 'OrderPlaced' })
  }
}

const evolve = (state: State, event: Event): State => {
  switch (event._tag) {
    case 'LineAdded':
      return { ...state, lines: state.lines + 1 }
    case 'OrderPlaced':
      return { ...state, status: 'Placed' }
  }
}

export const handle = (state: State, command: Command): Result<State, DomainError> =>
  decide(state, command).map((event) => evolve(state, event))
// #endregion snippet

