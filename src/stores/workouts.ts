import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { api } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import type { Exercise } from '@/stores/exercises'

// a "plan" on screen is a "workout" in the API

export interface WorkoutExercise {
  id: number
  position: number
  planned_sets: number
  exercise: Exercise
}

export interface Workout {
  id: number
  name: string
  exercises: WorkoutExercise[]
}

export interface WorkoutData {
  name: string
  // the API stores positions from the order of this list
  exercises: { exercise_id: number; planned_sets: number }[]
}

export const useWorkoutsStore = defineStore('workouts', () => {
  const auth = useAuthStore()
  const items = ref<Workout[]>([])
  const loaded = ref(false)

  // after logout and a new login the previous account's plans must not show up
  watch(
    () => auth.user?.id,
    () => {
      items.value = []
      loaded.value = false
    },
  )

  async function load() {
    items.value = (await api.get<{ workouts: Workout[] }>('/workouts')).workouts
    loaded.value = true
  }

  async function fetchOne(id: number) {
    return (await api.get<{ workout: Workout }>(`/workouts/${id}`)).workout
  }

  async function create(data: WorkoutData) {
    const { workout } = await api.post<{ workout: Workout }>('/workouts', data)
    // newest first, the same order the API lists them in
    items.value = [workout, ...items.value]

    return workout
  }

  async function update(id: number, data: WorkoutData) {
    const { workout } = await api.put<{ workout: Workout }>(`/workouts/${id}`, data)
    items.value = items.value.map((item) => (item.id === id ? workout : item))

    return workout
  }

  async function remove(id: number) {
    await api.delete(`/workouts/${id}`)
    items.value = items.value.filter((item) => item.id !== id)
  }

  return { items, loaded, load, fetchOne, create, update, remove }
})
