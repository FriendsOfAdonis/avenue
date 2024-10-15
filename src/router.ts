/* eslint-disable @typescript-eslint/no-shadow */
import {
  RouteByName,
  RouteByPattern,
  RouteNames,
  RouteParams,
  RoutePatterns,
  RoutesList,
  SerializedRoute,
  SerializedRoutes,
} from './types.js'
import { generatePathname } from './utils/routes.js'

type Routes = RoutesList extends { routes: SerializedRoute }
  ? RoutesList['routes']
  : SerializedRoute

export function routes(): SerializedRoutes {
  // @ts-ignore
  return (globalThis || window).__avenue__.routes
}

function named<
  Name extends RouteNames<Routes>,
  Route extends RouteByName<Routes, Name> = RouteByName<Routes, Name>,
>(name: Name, params?: RouteParams<Route>): string {
  const route = routes().find((r) => r.name === name)
  if (!route) {
    throw new Error(`No route found with the name '${name}'`)
  }

  return generatePathname(route, params)
}

function pattern<
  Pattern extends RoutePatterns<Routes>,
  Route extends RouteByPattern<Routes, Pattern> = RouteByPattern<Routes, Pattern>,
>(pattern: Pattern, params?: RouteParams<Route>): string {
  const route = routes().find((r) => r.pattern === pattern)
  if (!route) {
    throw new Error(`No route found with the pattern '${pattern}'`)
  }

  return generatePathname(route, params)
}

/**
 * Generates a pathname by name or pattern.
 */
export function route<
  Pattern extends RoutePatterns<Routes>,
  Route extends RouteByPattern<Routes, Pattern>,
>(pattern: Pattern, ...params: RouteParams<Route>): string
export function route<Name extends RouteNames<Routes>, Route extends RouteByName<Routes, Name>>(
  name: Name,
  ...params: RouteParams<Route>
): string
export function route(nameOrPattern: string, params?: any): string {
  if (nameOrPattern.startsWith('/')) {
    return pattern(nameOrPattern as never, params)
  }

  return named(nameOrPattern as never, params)
}
