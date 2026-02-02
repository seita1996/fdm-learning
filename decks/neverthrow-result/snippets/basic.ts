import { err, ok, type Result } from 'neverthrow'

// #region snippet
type DomainError =
  | { readonly _tag: 'InvalidEmail'; readonly input: string }
  | { readonly _tag: 'EmptyName' }

type User = Readonly<{ name: string; email: string }>

const validateName = (name: string): Result<string, DomainError> =>
  name.trim().length === 0 ? err({ _tag: 'EmptyName' }) : ok(name.trim())

const validateEmail = (email: string): Result<string, DomainError> =>
  email.includes('@') ? ok(email) : err({ _tag: 'InvalidEmail', input: email })

export const createUser = (name: string, email: string): Result<User, DomainError> =>
  validateName(name).andThen((validName) =>
    validateEmail(email).map((validEmail) => ({
      name: validName,
      email: validEmail,
    })),
  )

export const toMessage = (r: Result<User, DomainError>) =>
  r.match(
    (u) => `Welcome, ${u.name}!`,
    (e) => `Error: ${e._tag}`,
  )
// #endregion snippet
