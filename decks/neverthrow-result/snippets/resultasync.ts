import { ResultAsync } from 'neverthrow'

// #region snippet
type InfraError = { readonly _tag: 'FetchError'; readonly message: string }

const fetchJson = (url: string) =>
  ResultAsync.fromPromise(
    fetch(url).then((r) => r.json()),
    (e) => ({ _tag: 'FetchError', message: String(e) }) as InfraError,
  )

export const program = (url: string) =>
  fetchJson(url).map((json) => ({ ok: true as const, json }))
// #endregion snippet

