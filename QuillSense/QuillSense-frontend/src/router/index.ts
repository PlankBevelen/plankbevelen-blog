import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import DefaultLayout from '@/components/Layouts/DefaultLayout.vue'
import HomeView from '../views/home/index.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView
      },
      {
        path: '/solve',
        name: 'solve',
        component: () => import('@/views/solve/index.vue')
      },
      {
        path: '/history',
        name: 'history',
        component: () => import('@/views/history/index.vue')
      },
      {
        path: '/toolbox',
        name: 'toolbox',
        component: () => import('@/views/toolbox/index.vue')
      },
      {
        path: '/help',
        name: 'help',
        component: () => import('@/views/help/index.vue')
      },
      {
        path: '/profile',
        name: 'profile',
        component: () => import('@/views/profile/index.vue')
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
