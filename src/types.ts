import type { JsonObject, Simplify, UnionToIntersection } from 'type-fest'

export type AvenueConfig = {
  /**
   * Path to the routes.ts file.
   */
  routesPath?: string

  /**
   * Automatically generate the route.ts file.
   */
  autogenerate: boolean
}

export type RouteSegment = {
  type: number
  name: string
}

export type SerializedRoutes = readonly SerializedRoute[]
export type SegmentValue = number | string

export type SerializedRoute = {
  readonly name?: string
  readonly pattern: string
  readonly methods: Readonly<string[]>
  readonly params: Readonly<RouteSegment[]>
}

export interface RoutesList {}
export type InferRoutes<Routes extends SerializedRoutes> = { routes: Routes[number] }

declare global {
  namespace globalThis {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    var __avenue__: {
      routes: SerializedRoutes
      current: string
    }
  }
}

// UTILS
type IsNever<T> = [T] extends [never] ? true : false

type SetTupleType<Tuple extends [...any[]], Type> = {
  [Index in keyof Tuple]: Type
}

type IsEmptyTuple<T> = T extends readonly [any, ...any[]] ? false : true

type LastOfUnion<T> =
  UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never

type UnionToTuple<T, L = LastOfUnion<T>> =
  IsNever<T> extends false ? [...UnionToTuple<Exclude<T, L>>, L] : []

// ROUTES

/**
 * Assert a route has a name.
 */
export type NamedRoutes<Routes extends SerializedRoute> = Routes extends {
  name: string
}
  ? Routes
  : never

export type RoutePatterns<Routes extends SerializedRoute> = Routes['pattern']
export type RouteNames<Routes extends SerializedRoute> = NamedRoutes<Routes>['name']

export type RequiresParams<Routes extends SerializedRoute> =
  IsEmptyTuple<Routes['params']> extends true ? true : false

/**
 * Extracts route by name.
 */
export type RouteByName<
  Routes extends SerializedRoute,
  Name extends RouteNames<Routes> = RouteNames<Routes>,
> = Extract<Routes, { name: Name }>

/**
 * Extracts route by pattern.
 */
export type RouteByPattern<
  Routes extends SerializedRoute,
  Pattern extends RoutePatterns<Routes> = RoutePatterns<Routes>,
> = Extract<Routes, { pattern: Pattern }>

export type RouteParamsArray<Routes extends SerializedRoute> =
  IsEmptyTuple<Routes['params']> extends true
    ? []
    : [SetTupleType<UnionToTuple<Routes['params'][number]['name']>, SegmentValue>]

export type RouteParamsObject<Routes extends SerializedRoute> =
  IsEmptyTuple<Routes['params']> extends true
    ? [JsonObject]
    : [
        {
          [key in Routes['params'][number]['name']]: SegmentValue
        } & JsonObject,
      ]

export type RouteParams<Routes extends SerializedRoute> = Simplify<
  RouteParamsObject<Routes> | RouteParamsArray<Routes>
>
