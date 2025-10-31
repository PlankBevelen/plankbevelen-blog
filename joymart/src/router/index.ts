import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('../components/Layout/DefaultLayout.vue'),
    children: [{
      path: '',
      component: () => import('../components/Home/HomeIndex.vue')
    }]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
