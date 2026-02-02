// #region snippet
type User = Readonly<{ id: string; role: 'admin' | 'user' }>

// 悪い：asで“言い張る”（実行時に保証がない）
export const parseUserUnsafe = (raw: string): User => JSON.parse(raw) as User

// 良い：unknownで受けて、チェックしてから型を作る
const isUser = (v: unknown): v is User => {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return typeof o.id === 'string' && (o.role === 'admin' || o.role === 'user')
}

export const parseUserSafe = (raw: string): User | null => {
  const parsed: unknown = JSON.parse(raw)
  return isUser(parsed) ? parsed : null
}
// #endregion snippet

