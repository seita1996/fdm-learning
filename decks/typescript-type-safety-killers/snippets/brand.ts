// #region snippet
type Brand<T, B extends string> = T & { readonly __brand: B }

type UserId = Brand<string, 'UserId'>
type OrderId = Brand<string, 'OrderId'>

const UserId = {
  parse: (s: string): UserId | null => (s.startsWith('u_') ? (s as UserId) : null),
} as const

const OrderId = {
  parse: (s: string): OrderId | null => (s.startsWith('o_') ? (s as OrderId) : null),
} as const

declare const getUser: (id: UserId) => void

const userId = UserId.parse('u_123')
const orderId = OrderId.parse('o_999')

if (userId) getUser(userId) // OK
// if (orderId) getUser(orderId) // コンパイルエラー（混ざらない）
// #endregion snippet
