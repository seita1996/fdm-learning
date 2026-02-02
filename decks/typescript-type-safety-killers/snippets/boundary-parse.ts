// #region snippet
type User = Readonly<{ id: string; role: 'admin' | 'user' }>

type ParseOutcome =
  | { readonly ok: true; readonly value: User }
  | { readonly ok: false; readonly reason: string }

export const parseUser = (raw: string): ParseOutcome => {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, reason: 'invalid json' }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, reason: 'not an object' }
  }
  const o = parsed as Record<string, unknown>
  if (typeof o.id !== 'string') return { ok: false, reason: 'missing id' }
  if (o.role !== 'admin' && o.role !== 'user') return { ok: false, reason: 'invalid role' }

  return { ok: true, value: { id: o.id, role: o.role } }
}
// #endregion snippet

