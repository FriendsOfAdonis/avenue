import ConfigureCommand from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'
import { readFile, writeFile } from 'node:fs/promises'

export async function configure(command: ConfigureCommand) {
  await runCodemods(command)
  await insertTypeReference(command)
}

async function runCodemods(command: ConfigureCommand) {
  const codemods = await command.createCodemods()

  await codemods.makeUsingStub(stubsRoot, 'config.stub', {})

  await codemods.updateRcFile((rcFile) => {
    rcFile.addCommand('@foadonis/avenue/commands')
    rcFile.addProvider('@foadonis/avenue/avenue_provider')
  })

  await codemods.registerMiddleware('router', [
    {
      path: '@foadonis/avenue/avenue_middleware',
    },
  ])
}

async function insertTypeReference(command: ConfigureCommand) {
  command.logger.info('Inserting Inertia Router types in inertia/app.ts')
  try {
    const path = command.app.makePath('inertia/app/app.ts')
    const content = await readFile(path)

    await writeFile(path, `/// <reference path="../../config/avenue.ts" />\n${content.toString()}`)
  } catch (error) {
    command.logger.warning(
      `It seems you are not using Inertia. Make sure to reference the types on the Frontend.`
    )
  }
}
