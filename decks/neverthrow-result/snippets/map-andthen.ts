import { err, ok, type Result } from 'neverthrow'

// #region snippet
type E = { readonly _tag: 'TooSmall' } | { readonly _tag: 'NotEven' }

const ensureAtLeast10 = (n: number): Result<number, E> => (n >= 10 ? ok(n) : err({ _tag: 'TooSmall' }))
const ensureEven = (n: number): Result<number, E> => (n % 2 === 0 ? ok(n) : err({ _tag: 'NotEven' }))

export const flow = (n: number) =>
  ok(n)
    .map((x) => x + 1) // 加工（失敗しない）
    .andThen(ensureAtLeast10) // 失敗しうる処理の接続
    .andThen(ensureEven)
// #endregion snippet

