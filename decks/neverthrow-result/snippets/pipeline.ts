import { err, ok, type Result } from 'neverthrow'

// #region snippet
type DomainError =
  | { readonly _tag: 'EmptyName' }
  | { readonly _tag: 'InvalidEmail'; readonly input: string }
  | { readonly _tag: 'NotCompanyEmail'; readonly input: string }

type CreateUserInput = Readonly<{ name: string; email: string }>
type Validated = Readonly<{ name: string; email: string }>
type User = Readonly<{ name: string; email: string }>

const validateName = (name: string): Result<string, DomainError> =>
  name.trim().length === 0 ? err({ _tag: 'EmptyName' }) : ok(name.trim())

const validateEmail = (email: string): Result<string, DomainError> =>
  email.includes('@') ? ok(email) : err({ _tag: 'InvalidEmail', input: email })

const ensureCompanyEmail = (email: string): Result<string, DomainError> =>
  email.endsWith('@example.com') ? ok(email) : err({ _tag: 'NotCompanyEmail', input: email })

const validateInput = (input: CreateUserInput): Result<Validated, DomainError> =>
  validateName(input.name).andThen((name) =>
    validateEmail(input.email)
      .andThen(ensureCompanyEmail)
      .map((email) => ({ name, email })),
  )

const create = (v: Validated): Result<User, DomainError> => ok({ name: v.name, email: v.email })

export const createUser = (input: CreateUserInput): Result<User, DomainError> => validateInput(input).andThen(create)
// #endregion snippet

