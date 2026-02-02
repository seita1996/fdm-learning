// #region snippet
// 悪い：! で宣誓（崩れると例外）
export const getUserIdUnsafe = (userId?: string) => userId!

// 良い：分岐で表現する（呼び出し側に扱わせる）
export const getUserIdOrNull = (userId?: string): string | null => (userId ? userId : null)

// 良い：境界で落とす（“必須” なら明示的に失敗させる）
export const getUserIdOrThrow = (userId?: string): string => {
  if (!userId) throw new Error('Missing userId')
  return userId
}
// #endregion snippet
