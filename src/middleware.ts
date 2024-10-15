import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

/**
 * Injects current path for serverside rendering.
 */
export default class InertiaRouterMiddleware {
  handle({ request }: HttpContext, next: NextFn) {
    const { pathname } = new URL(request.completeUrl())
    globalThis.__avenue__.current = pathname
    return next()
  }
}
