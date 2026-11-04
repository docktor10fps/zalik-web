<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { type Workout, useWorkoutsStore } from '@/stores/workouts'
import { plural } from '@/utils/plural'

const store = useWorkoutsStore()
const { items, loaded } = storeToRefs(store)

const failed = ref(false)

function summary(workout: Workout) {
  const exercises = workout.exercises.length
  const sets = workout.exercises.reduce((total, item) => total + item.planned_sets, 0)

  return `${exercises} ${plural(exercises, ['вправа', 'вправи', 'вправ'])} · ${sets} ${plural(sets, ['підхід', 'підходи', 'підходів'])}`
}

function preview(workout: Workout) {
  return workout.exercises.map((item) => item.exercise.name).join(' · ')
}

async function load() {
  failed.value = false

  try {
    await store.load()
  } catch {
    failed.value = true
  }
}

onMounted(load)
</script>

<template>
  <h1>Плани</h1>

  <RouterLink class="tile" :to="{ name: 'exercises' }">
    <span class="tile-icon"><span class="icon" aria-hidden="true">fitness_center</span></span>
    <span class="tile-text">
      <strong>Вправи</strong>
      <small>Каталог і твої власні вправи</small>
    </span>
    <span class="icon" aria-hidden="true">chevron_right</span>
  </RouterLink>

  <h2 class="section-title">Мої плани</h2>

  <div v-if="failed" class="notice">
    <p>Не вдалося завантажити плани.</p>
    <button class="btn btn-text" type="button" @click="load">Спробувати ще раз</button>
  </div>

  <p v-else-if="!loaded" class="notice">Завантаження…</p>

  <ul v-else-if="items.length" class="plans">
    <li v-for="workout in items" :key="workout.id">
      <RouterLink class="plan" :to="{ name: 'plan-edit', params: { id: workout.id } }">
        <strong>{{ workout.name }}</strong>
        <span class="summary">{{ summary(workout) }}</span>
        <small>{{ preview(workout) }}</small>
      </RouterLink>
    </li>
  </ul>

  <p v-else class="empty-hint">Планів ще немає. Створи перший кнопкою внизу.</p>

  <RouterLink class="fab" :to="{ name: 'plan-create' }">
    <span class="icon" aria-hidden="true">add</span>
    Новий план
  </RouterLink>
</template>

<style scoped>
h1 {
  font-size: 40px;
  font-weight: 700;
  font-stretch: 110%;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.tile {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px 20px 16px 16px;
  border-radius: var(--shape-l);
  background: var(--surface-container);
  text-decoration: none;
  transition: background-color 150ms linear;
}

.tile:hover {
  background: var(--surface-container-high);
}

.tile-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: var(--shape-m);
  background: var(--secondary-container);
  color: var(--on-secondary-container);
}

.tile-text {
  flex: 1;
  min-width: 0;
}

.tile strong,
.tile small {
  display: block;
}

.tile small {
  color: var(--on-surface-variant);
  font-size: 14px;
}

.plans {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.plan {
  display: grid;
  gap: 4px;
  padding: 20px 24px;
  border-radius: var(--shape-l);
  background: var(--surface-container-low);
  outline: 1px solid var(--surface-container-highest);
  outline-offset: -1px;
  text-decoration: none;
  transition: background-color 150ms linear;
}

.plan:hover {
  background: var(--surface-container);
}

.plan strong {
  font-size: 20px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.summary {
  color: var(--primary);
  font-size: 14px;
  font-weight: 600;
}

/* exercise names: two lines at most, the rest fades into an ellipsis */
.plan small {
  display: -webkit-box;
  overflow: hidden;
  color: var(--on-surface-variant);
  font-size: 14px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
</style>
