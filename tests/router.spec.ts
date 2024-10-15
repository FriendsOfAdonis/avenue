import { test } from '@japa/runner'
import { route } from '../src/router.js'

test.group('Router', () => {
  test('using route name', ({ assert }) => {
    assert.equal(route('posts.show', { id: 4 }), '/posts/4')
  })

  test('using route pattern', ({ assert }) => {
    assert.equal(route('/posts/:id', { id: 4 }), '/posts/4')
  })
})
