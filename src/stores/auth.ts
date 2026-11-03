import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { api, clearToken, getToken, setToken } from '@/api/client'

export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
}

interface AuthResponse {
  token: string
  user: User
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => user.value !== null)

  let restored = false

  async function restore() {
    if (restored) return
    restored = true

    if (!getToken()) return

    try {
      user.value = (await api.get<{ user: User }>('/auth/me')).user
    } catch {
      user.value = null
    }
  }

  function applySession(session: AuthResponse) {
    setToken(session.token)
    user.value = session.user
  }

  async function login(email: string, password: string) {
    applySession(await api.post<AuthResponse>('/auth/login', { email, password }))
  }

  async function register(data: RegisterData) {
    applySession(await api.post<AuthResponse>('/auth/register', data))
  }

  function forget() {
    clearToken()
    user.value = null
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      forget()
    }
  }

  return { user, isAuthenticated, restore, login, register, logout, forget }
})
