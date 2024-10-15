import { BaseCommand, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { generateRoutes } from '../src/generate_routes.js'
import { AvenueConfig } from '../src/types.js'

export default class RoutesCommand extends BaseCommand {
  static commandName = 'inertia:routes'
  static description = 'Generates Inertia Routes types'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string({ name: 'path', description: 'Path where the file will be generated' })
  declare path: string

  async run(): Promise<any> {
    const router = await this.app.container.make('router')
    const config = this.app.config.get<AvenueConfig>('avenue')

    router.commit()

    await generateRoutes(router, this.path ?? config.routesPath)
    this.logger.success(`Inertia Router file has been generated successfully.`)
  }
}
