import { ApplicationService } from '@adonisjs/core/types'
import { AvenueConfig, SerializedRoutes } from '../src/types.js'
import { serializeRouter } from '../src/utils/routes.js'
import { generateRoutes } from '../src/generate_routes.js'

export default class AvenueProvider {
  constructor(protected app: ApplicationService) {}

  async ready() {
    const config = this.app.config.get<AvenueConfig>('avenue')
    const router = await this.app.container.make('router')
    const routes = serializeRouter(router)

    await this.#registerEdgePlugin(routes)
    this.#injectSSRRoutes(routes)

    if (!this.app.inProduction && config.autogenerate) {
      const logger = await this.app.container.make('logger')
      await generateRoutes(router, config.routesPath)
      logger.info(`Inertia Router file generated successfully.`)
    }
  }

  /**
   * Register Edge.js plugin used to inject routes.
   */
  async #registerEdgePlugin(routes: SerializedRoutes) {
    if (!this.app.usingEdgeJS) return

    const { default: edge } = await import('edge.js')
    const { edgePlugin } = await import('../src/plugins/edge.js')
    edge.use(edgePlugin(routes))
  }

  /**
   * Injects routes globally for SSR.
   */
  #injectSSRRoutes(routes: SerializedRoutes) {
    globalThis.__avenue__ = {
      routes: routes,
      current: '',
    }
  }
}
