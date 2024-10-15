export const routes = [
  {
    name: 'home',
    pattern: '/',
    methods: ['GET'],
    params: [],
  },
  {
    pattern: '/unnamed',
    methods: [],
    params: [],
  },
  {
    name: 'posts.show',
    pattern: '/posts/:id',
    methods: ['GET'],
    params: [
      {
        name: 'id',
        type: 1,
      },
    ],
  },
  {
    name: 'posts.comments.show',
    pattern: '/posts/:id/comments/:commentId',
    methods: ['GET'],
    params: [
      {
        name: 'id',
        type: 1,
      },
      {
        name: 'commentId',
        type: 1,
      },
    ],
  },
] as const

// @ts-ignore
;(globalThis || window).__avenue__ = {
  routes: routes,
}

declare module '../../src/types.js' {
  export interface RoutesList extends InferRoutes<typeof routes> {}
}

export type Routes = (typeof routes)[number]
