import type { PluginFn, TagContract } from 'edge.js/types'
import { SerializedRoutes } from '../types.js'

/**
 * The @routes Edge.js tag.
 */
const routesTag: TagContract = {
  block: false,
  tagName: 'routes',
  seekable: true,
  compile(_, buffer, token) {
    buffer.writeExpression(
      `out += state.inertiaRouterScript(state.cspNonce, state.request.url())`,
      token.filename,
      token.loc.start.line
    )
  },
}

/**
 * Inertia Router Edge.js plugin.
 */
export function edgePlugin(routes: SerializedRoutes): PluginFn<never> {
  return (edge) => {
    edge.global('inertiaRouterScript', (cspNonce: string, url: string) => {
      return `<script${cspNonce ? ` nonce="${cspNonce}"` : ''}>
  (globalThis||window).__avenue__ = {
    routes: ${JSON.stringify(routes)},
    current: ${JSON.stringify(url)}
  }
</script>`
    })

    console.log('testes')
    edge.registerTag(routesTag)
  }
}
