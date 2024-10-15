import { test } from '@japa/runner'
import {
  NamedRoutes,
  RouteNames,
  RouteParamsArray,
  RouteParamsObject,
  RoutePatterns,
  SegmentValue,
} from '../src/types.js'
import { routes, Routes } from './fixtures/routes.js'
import { JsonValue } from 'type-fest'

test('NamedRoutes', ({ expectTypeOf }) => {
  expectTypeOf<NamedRoutes<Routes>['name']>().toMatchTypeOf<
    'home' | 'posts.show' | 'posts.comments.show'
  >()
})

test('RoutePatterns', ({ expectTypeOf }) => {
  expectTypeOf<RoutePatterns<Routes>>().toMatchTypeOf<
    '/' | '/unnamed' | '/posts/:id' | '/posts/:id/comments/:commentId'
  >()
})

test('RouteNames', ({ expectTypeOf }) => {
  expectTypeOf<RouteNames<Routes>>().toMatchTypeOf<'home' | 'posts.show' | 'posts.comments.show'>()
})

test('RouteParamsArray', ({ expectTypeOf }) => {
  expectTypeOf<RouteParamsArray<(typeof routes)[0]>>().toMatchTypeOf<[]>()
  expectTypeOf<RouteParamsArray<(typeof routes)[0]>>().not.toMatchTypeOf<[[SegmentValue]]>()

  expectTypeOf<RouteParamsArray<(typeof routes)[2]>>().toMatchTypeOf<[[SegmentValue]]>()

  expectTypeOf<RouteParamsArray<(typeof routes)[3]>>().toMatchTypeOf<
    [[SegmentValue, SegmentValue]]
  >()
})

test('RouteParamsObject', ({ expectTypeOf }) => {
  expectTypeOf<RouteParamsObject<(typeof routes)[0]>>().toMatchTypeOf<[{}]>()

  expectTypeOf<RouteParamsObject<(typeof routes)[2]>>().toMatchTypeOf<[{ id: SegmentValue }]>()

  expectTypeOf<RouteParamsObject<(typeof routes)[3]>>().toMatchTypeOf<
    [
      {
        id: JsonValue
        commentId: JsonValue
      },
    ]
  >()
})
