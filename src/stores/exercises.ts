import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { api } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

export type ExerciseMetric = 'reps' | 'weight_kg' | 'distance_m' | 'duration_seconds'

export interface Exercise {
  id: number
  user_id: number | null
  name: string
  description: string | null
  metrics: ExerciseMetric[]
}

export type ExerciseData = Pick<Exercise, 'name' | 'description' | 'metrics'>

// the order and wording every screen uses for metrics
export const METRICS: { value: ExerciseMetric; label: string }[] = [
  { value: 'reps', label: 'Повтори' },
  { value: 'weight_kg', label: 'Вага' },
  { value: 'distance_m', label: 'Дистанція' },
  { value: 'duration_seconds', label: 'Час' },
]

export function metricsLabel(metrics: ExerciseMetric[]) {
  return METRICS.filter((metric) => metrics.includes(metric.value))
    .map((metric) => metric.label)
    .join(' · ')
}

// chips are ticked in any order, the API gets them in the METRICS order
export function orderMetrics(metrics: ExerciseMetric[]) {
  return METRICS.map((metric) => metric.value).filter((value) => metrics.includes(value))
}

export function filterByName(exercises: Exercise[], query: string) {
  const needle = query.trim().toLocaleLowerCase('uk')

  return needle
    ? exercises.filter((exercise) => exercise.name.toLocaleLowerCase('uk').includes(needle))
    : exercises
}

function byName(a: Exercise, b: Exercise) {
  return a.name.localeCompare(b.name, 'uk')
}

export const useExercisesStore = defineStore('exercises', () => {
  const auth = useAuthStore()
  const items = ref<Exercise[]>([])
  const loaded = ref(false)

  // after logout and a new login the previous account's exercises must not show up
  watch(
    () => auth.user?.id,
    () => {
      items.value = []
      loaded.value = false
    },
  )

  async function load() {
    items.value = (await api.get<{ exercises: Exercise[] }>('/exercises')).exercises
    loaded.value = true
  }

  async function ensureLoaded() {
    if (!loaded.value) await load()
  }

  async function create(data: ExerciseData) {
    const { exercise } = await api.post<{ exercise: Exercise }>('/exercises', data)
    items.value = [...items.value, exercise].sort(byName)

    return exercise
  }

  async function update(id: number, data: ExerciseData) {
    const { exercise } = await api.put<{ exercise: Exercise }>(`/exercises/${id}`, data)
    items.value = items.value.map((item) => (item.id === id ? exercise : item)).sort(byName)

    return exercise
  }

  async function remove(id: number) {
    await api.delete(`/exercises/${id}`)
    items.value = items.value.filter((item) => item.id !== id)
  }

  return { items, loaded, load, ensureLoaded, create, update, remove }
})
