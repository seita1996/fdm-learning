import { err, ok, type Result } from 'neverthrow'

// #region snippet
type InfraError = { readonly _tag: 'UnexpectedException'; readonly message: string }

export const fromThrowable = <T>(f: () => T): Result<T, InfraError> => {
  try {
    return ok(f())
  } catch (e) {
    return err({ _tag: 'UnexpectedException', message: String(e) })
  }
}
// #endregion snippet

