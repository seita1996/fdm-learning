// #region snippet
// 悪い：anyが境界から中に漏れると、型が崩れやすい
const fromOutsideAny = (): any => ({ count: '10' })

export const bad = () => {
  const v = fromOutsideAny()
  // countがstringでもコンパイルが通る（実行時に事故）
  return v.count + 1
}

// 良い：unknownで受けて狭める
const fromOutsideUnknown = (): unknown => ({ count: '10' })

export const good = () => {
  const v = fromOutsideUnknown()
  if (typeof v !== 'object' || v === null) return 0
  const o = v as Record<string, unknown>
  return typeof o.count === 'number' ? o.count + 1 : 0
}
// #endregion snippet

