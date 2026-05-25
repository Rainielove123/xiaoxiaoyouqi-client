import { createRouter, createWebHistory } from 'vue-router'
import FrontLayout from '@/views/layout.vue'

const routes = [
  {
    path: '/home',
    component: FrontLayout,
    children: [{ path: '', component: () => import('@/views/front/home.vue') }]
  },
  {
    path: '/browse',
    component: FrontLayout,
    children: [{ path: '', component: () => import('@/views/front/browse.vue') }]
  },
  {
    path: '/search',
    component: FrontLayout,
    children: [{ path: '', component: () => import('@/views/front/browse.vue') }]
  },
  {
    path: '/player/:videoId',
    component: FrontLayout,
    children: [{ path: '', component: () => import('@/views/front/player.vue') }]
  },
  {
    path: '/my',
    component: FrontLayout,
    children: [{ path: '', component: () => import('@/views/front/user.vue') }]
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue')
  },
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
