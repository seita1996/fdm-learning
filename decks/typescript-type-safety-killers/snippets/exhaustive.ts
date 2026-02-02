// #region snippet
type Role = 'admin' | 'user'

const assertNever = (x: never): never => {
  throw new Error(`Unexpected: ${String(x)}`)
}

export const label = (role: Role) => {
  switch (role) {
    case 'admin':
      return '管理者'
    case 'user':
      return '一般'
  }
  // Roleが増えたらここがコンパイルエラーになる
  return assertNever(role)
}
// #endregion snippet

