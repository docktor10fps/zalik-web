import { createRouter, createWebHistory } from 'vue-router'

import { setUnauthorizedHandler } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    auth?: boolean
    guest?: boolean
    // the bottom nav tab that stays highlighted on a nested screen
    tab?: string
  }
}

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
          component: () => import('@/views/PlansView.vue'),
          meta: { title: 'Плани' },
        },
        {
          path: 'plans/new',
          name: 'plan-create',
          component: () => import('@/views/PlanFormView.vue'),
          meta: { title: 'Новий план', tab: 'plans' },
        },
        {
          path: 'plans/:id(\\d+)',
          name: 'plan-edit',
          component: () => import('@/views/PlanFormView.vue'),
          props: true,
          meta: { title: 'Редагувати план', tab: 'plans' },
        },
        {
          path: 'plans/exercises',
          name: 'exercises',
          component: () => import('@/views/ExercisesView.vue'),
          meta: { title: 'Вправи', tab: 'plans' },
        },
        {
          path: 'plans/exercises/new',
          name: 'exercise-create',
          component: () => import('@/views/ExerciseFormView.vue'),
          meta: { title: 'Нова вправа', tab: 'plans' },
        },
        {
          path: 'plans/exercises/:id(\\d+)',
          name: 'exercise-edit',
          component: () => import('@/views/ExerciseFormView.vue'),
          props: true,
          meta: { title: 'Редагувати вправу', tab: 'plans' },
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
