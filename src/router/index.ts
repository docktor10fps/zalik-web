import { createRouter, createWebHistory } from 'vue-router'

import { setUnauthorizedHandler } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/AuthView.vue'),
      props: { mode: 'login' },
      meta: { guest: true, title: 'Вхід' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/AuthView.vue'),
      props: { mode: 'register' },
      meta: { guest: true, title: 'Реєстрація' },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { auth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
          meta: { title: 'Головна' },
        },
        {
          path: 'plans',
          name: 'plans',
          component: () => import('@/views/ComingSoonView.vue'),
          props: { title: 'Плани', icon: 'checklist' },
          meta: { title: 'Плани' },
        },
        {
          path: 'history',
          name: 'history',
          component: () => import('@/views/ComingSoonView.vue'),
          props: { title: 'Історія', icon: 'history' },
          meta: { title: 'Історія' },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/ProfileView.vue'),
          meta: { title: 'Профіль' },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  await auth.restore()

  if (to.meta.auth && !auth.isAuthenticated) return { name: 'login' }
  if (to.meta.guest && auth.isAuthenticated) return { name: 'home' }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Zalik` : 'Zalik'
})

setUnauthorizedHandler(() => {
  useAuthStore().forget()
  router.push({ name: 'login' })
})

export default router
