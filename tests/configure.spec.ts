import { IgnitorFactory } from '@adonisjs/core/factories'
import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import Configure from '@adonisjs/core/commands/configure'

const BASE_URL = new URL('./tmp/', import.meta.url)

test.group('Configure', (group) => {
  group.each.setup(({ context }) => {
    context.fs.baseUrl = BASE_URL
    context.fs.basePath = fileURLToPath(BASE_URL)
  })

  group.each.disableTimeout()

  test('create config file and register provider', async ({ fs, assert }) => {
    const ignitor = new IgnitorFactory()
      .withCoreProviders()
      .withCoreConfig()
      .create(BASE_URL, {
        importer: (filePath) => {
          if (filePath.startsWith('./') || filePath.startsWith('../')) {
            return import(new URL(filePath, BASE_URL).href)
          }

          return import(filePath)
        },
      })

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()

    await fs.createJson('tsconfig.json', {})
    await fs.create('adonisrc.ts', `export default defineConfig({})`)
    await fs.create('start/kernel.ts', `router.use([])`)
    await fs.create('inertia/app/app.ts', ``)
    await fs.create('package.json', JSON.stringify({ dependencies: { '@adonisjs/inertia': '*' } }))

    const ace = await app.container.make('ace')

    const command = await ace.create(Configure, ['../../index.js'])
    await command.exec()

    command.assertSucceeded()

    await assert.fileExists('adonisrc.ts')
    await assert.fileContains('adonisrc.ts', '@foadonis/avenue/commands')
    await assert.fileContains('adonisrc.ts', '@foadonis/avenue/avenue_provider')

    await assert.fileExists('config/avenue.ts')
    await assert.fileContains('config/avenue.ts', 'defineConfig({')

    await assert.fileExists('start/kernel.ts')
    await assert.fileContains('start/kernel.ts', '@foadonis/avenue/avenue_middleware')

    await assert.fileExists('inertia/app/app.ts')
    await assert.fileContains('inertia/app/app.ts', '../../config/avenue.ts')
  })
})
