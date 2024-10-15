import { test } from '@japa/runner'
import { generatePathname, serializeRoute } from '../src/utils/routes.js'
import { AppFactory } from '@adonisjs/core/factories/app'
import { Route } from '@adonisjs/core/http'
import { routes } from './fixtures/routes.js'

const BASE_URL = new URL('./app/', import.meta.url)

test.group('serializeRoute', () => {
  test('no parameters', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)

    const route = new Route(app, [], {
      pattern: '/hello/world',
      methods: ['GET', 'HEAD', 'POST'],
      handler() {},
      globalMatchers: {},
    })

    const res = serializeRoute(route.toJSON())

    assert.equal(res.name, undefined)
    assert.equal(res.pattern, '/hello/world')
    assert.lengthOf(res.methods, 2)
    assert.equal(res.methods[0], 'GET')
    assert.equal(res.methods[1], 'POST')
    assert.lengthOf(res.params, 0)
  })

  test('single parameter', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)

    const route = new Route(app, [], {
      pattern: '/:id',
      methods: ['GET'],
      handler() {},
      globalMatchers: {},
    })

    const res = serializeRoute(route.toJSON())

    assert.equal(res.name, undefined)
    assert.equal(res.pattern, '/:id')
    assert.lengthOf(res.methods, 1)
    assert.equal(res.methods[0], 'GET')
    assert.lengthOf(res.params, 1)
    assert.equal(res.params[0].name, 'id')
    assert.equal(res.params[0].type, 1)
  })

  test('multiple parameter', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)

    const route = new Route(app, [], {
      pattern: '/hello/:id/:hey?/*',
      methods: ['GET'],
      handler() {},
      globalMatchers: {},
    }).as('test.route')

    const res = serializeRoute(route.toJSON())

    assert.equal(res.name, 'test.route')
    assert.equal(res.pattern, '/hello/:id/:hey?/*')
    assert.lengthOf(res.methods, 1)
    assert.equal(res.methods[0], 'GET')
    assert.lengthOf(res.params, 3)
    assert.equal(res.params[0].name, 'id')
    assert.equal(res.params[0].type, 1)
    assert.equal(res.params[1].name, 'hey')
    assert.equal(res.params[1].type, 3)
    assert.equal(res.params[2].name, '*')
    assert.equal(res.params[2].type, 2)
  })
})

test.group('generatePathname', () => {
  test('no parameters', ({ assert }) => {
    assert.equal(generatePathname(routes[0]), '/')
    assert.equal(generatePathname(routes[1]), '/unnamed')
  })

  test('with parameters', ({ assert }) => {
    assert.equal(generatePathname(routes[2], [4]), '/posts/4')
    assert.equal(generatePathname(routes[2], { id: 4 }), '/posts/4')
    assert.equal(generatePathname(routes[3], [4, 'test']), '/posts/4/comments/test')
    assert.equal(
      generatePathname(routes[3], { id: 4, commentId: 'test' }),
      '/posts/4/comments/test'
    )
  })

  test('with query parameters', ({ assert }) => {
    assert.equal(
      generatePathname(routes[2], { id: 4, filter: 'published' }),
      '/posts/4?filter=published'
    )

    assert.equal(
      generatePathname(routes[3], { id: 4, commentId: 'test', filter: 'published', active: false }),
      '/posts/4/comments/test?filter=published&active=false'
    )
  })
})
