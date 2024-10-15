import ConfigureCommand from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'
import { readFile, writeFile } from 'node:fs/promises'

export async function configure(command: ConfigureCommand) {
  if (!(await hasInertia(command))) {
    command.logger.error(
      'Inertia is required to use the Inertia Router.\n- https://docs.adonisjs.com/guides/views-and-templates/inertia'
    )
    command.exitCode = 1
    return
  }

  await runCodemods(command)
  await insertTypeReference(command)
}

async function hasInertia(command: ConfigureCommand) {
  const pkgPath = command.app.makePath('package.json')
  const pkgContent = await readFile(pkgPath)

  return pkgContent.includes('@adonisjs/inertia')
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
    command.logger.error(error)
    command.logger.error(
      `An error occured when inserting Inerta Router types, it must be done manually.`
    )
  }
}
