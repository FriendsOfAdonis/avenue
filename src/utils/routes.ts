import { MatchItRouteToken, RouteJSON } from '@adonisjs/core/types/http'
import { SerializedRoute } from '../types.js'
import { JsonValue } from 'type-fest'
import matchit from '@poppinss/matchit'
import qs from 'qs'
import { Router } from '@adonisjs/core/http'

/**
 * Serialize routes from Adonis Router.
 */
export function serializeRouter(router: Router) {
  return Object.values(router.toJSON()).flatMap((route) => serializeRoutes(route))
}

/**
 * Serialize routes.
 */
export function serializeRoutes(routes: RouteJSON[]): SerializedRoute[] {
  return routes.map((route) => serializeRoute(route))
}

/**
 * Serialize a route from a RouteJSON.
 */
export function serializeRoute(route: RouteJSON): SerializedRoute {
  const segments = matchit.parse(route.pattern) as MatchItRouteToken[]

  return {
    name: route.name,
    pattern: route.pattern,
    methods: route.methods.filter((method) => method !== 'HEAD'),
    params: segments.filter((s) => s.type !== 0).map(({ type, val: name }) => ({ type, name })),
  }
}

/**
 * Generates a pathname from a route and params.
 *
 * @see https://github.com/adonisjs/http-server/blob/7.x/src/router/lookup_store/url_builder.ts
 */
export function generatePathname(
  route: SerializedRoute,
  params: JsonValue[] | Record<string, JsonValue> = []
): string {
  const segments = []
  const tokens = matchit.parse(route.pattern) as MatchItRouteToken[]

  const { paramsArray, paramsObject } = Array.isArray(params)
    ? { paramsArray: params, paramsObject: null }
    : { paramsObject: params as Partial<Record<string, JsonValue>>, paramsArray: null }

  let paramsIndex = 0
  for (const token of tokens) {
    if (token.type === 0) {
      segments.push(token.val === '/' ? '' : `${token.val}${token.end}`)
    } else if (token.type === 2) {
      let values: JsonValue[]
      if (paramsArray) {
        values = paramsArray.slice(paramsIndex)
      } else {
        const wildcardValue = paramsObject['*']

        if (wildcardValue === undefined) {
          throw new Error(`The '*' parameter is present multiple time in the pattern`)
        }

        values = Array.isArray(wildcardValue) ? wildcardValue : [wildcardValue]
        delete paramsObject['*']
      }

      segments.push(`${values.join('/')}${token.end}`)
      break
    } else {
      const paramName = token.val
      let value: JsonValue
      if (paramsArray) {
        value = paramsArray[paramsIndex]
      } else {
        const val = paramsObject[paramName]
        if (val === undefined) {
          throw new Error(`The '${paramName}' parameter is present multiple time in the pattern`)
        }

        value = val
        delete paramsObject[paramName]
      }

      paramsIndex++

      segments.push(`${value}${token.end}`)
    }
  }

  let pathname = `/${segments.join('/')}`

  if (paramsObject && Object.keys(paramsObject).length) {
    pathname += `?${qs.stringify(paramsObject)}`
  }

  return pathname
}
