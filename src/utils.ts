export type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>
}

export type Falsy = false | null | undefined | 0 | -0 | 0n | ''

export type Truthy<X> = Exclude<X, Falsy>

export type FalsyFiltered<T> = {
  [P in keyof T]: Exclude<T[P], Falsy>
}

export const filterFalsy = <T>(obj: T): FalsyFiltered<T> =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => isTruthy(v))
  ) as FalsyFiltered<T>

type T<X> = Truthy<X> | Falsy

export function isTruthy<X>(condition: X): condition is Truthy<X> {
  return !!condition
}

export function isFalsy<X>(condition: T<X>): condition is Falsy {
  return !condition
}
