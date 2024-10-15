import { Router } from '@adonisjs/core/http'
import { serializeRouter } from './utils/routes.js'
import { rm, writeFile } from 'node:fs/promises'

export async function generateRoutes(router: Router, path?: string) {
  const routes = serializeRouter(router)

  path = path ?? new URL('../routes.json', import.meta.url).pathname

  await rm(path).catch(() => {})
  await writeFile(path, `export default ${JSON.stringify(routes)} as const`)
}
