type Brand<T, B extends string> = T & { readonly __brand: B }

export type OrderId = Brand<string, 'OrderId'>
export type ProductId = Brand<string, 'ProductId'>

