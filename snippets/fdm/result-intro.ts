import { err, ok, type Result } from 'neverthrow'

type ParseError = { readonly _tag: 'ParseError'; readonly input: string }
type DivisionByZero = { readonly _tag: 'DivisionByZero' }

const parseIntR = (input: string): Result<number, ParseError> => {
  const n = Number.parseInt(input, 10)
  return Number.isNaN(n) ? err({ _tag: 'ParseError', input }) : ok(n)
}

const reciprocal = (n: number): Result<number, DivisionByZero> =>
  n === 0 ? err({ _tag: 'DivisionByZero' }) : ok(1 / n)

export const program = (input: string) => parseIntR(input).andThen(reciprocal)

