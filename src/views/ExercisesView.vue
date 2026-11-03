<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import TopBar from '@/components/TopBar.vue'
import { metricsLabel, useExercisesStore } from '@/stores/exercises'

const store = useExercisesStore()
const { items, loaded } = storeToRefs(store)

const query = ref('')
const failed = ref(false)

const found = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase('uk')

  return needle
    ? items.value.filter((exercise) => exercise.name.toLocaleLowerCase('uk').includes(needle))
    : items.value
})

const own = computed(() => found.value.filter((exercise) => exercise.user_id !== null))
const catalog = computed(() => found.value.filter((exercise) => exercise.user_id === null))

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
  <TopBar title="Вправи" :back="{ name: 'plans' }" />

  <label class="search">
    <span class="icon" aria-hidden="true">search</span>
    <input v-model="query" type="search" placeholder="Пошук вправ" aria-label="Пошук вправ">
  </label>

  <div v-if="failed" class="notice">
    <p>Не вдалося завантажити вправи.</p>
    <button class="btn btn-text" type="button" @click="load">Спробувати ще раз</button>
  </div>

  <p v-else-if="!loaded" class="notice">Завантаження…</p>

  <template v-else>
    <p v-if="query && !found.length" class="notice">Нічого не знайдено.</p>

    <section v-if="own.length || !query">
      <h2>Мої вправи</h2>
      <ul v-if="own.length" class="list">
        <li v-for="exercise in own" :key="exercise.id">
          <RouterLink class="row" :to="{ name: 'exercise-edit', params: { id: exercise.id } }">
            <span class="row-text">
              <strong>{{ exercise.name }}</strong>
              <small>{{ metricsLabel(exercise.metrics) }}</small>
            </span>
            <span class="icon" aria-hidden="true">chevron_right</span>
          </RouterLink>
        </li>
      </ul>
      <p v-else class="hint">Своїх вправ ще немає. Створи першу кнопкою внизу.</p>
    </section>

    <section v-if="catalog.length">
      <h2>Каталог</h2>
      <ul class="list">
        <li v-for="exercise in catalog" :key="exercise.id">
          <div class="row">
            <span class="row-text">
              <strong>{{ exercise.name }}</strong>
              <small>{{ metricsLabel(exercise.metrics) }}</small>
            </span>
          </div>
        </li>
      </ul>
    </section>
  </template>

  <RouterLink class="fab" :to="{ name: 'exercise-create' }">
    <span class="icon" aria-hidden="true">add</span>
    Нова вправа
  </RouterLink>
</template>

<style scoped>
.search {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 56px;
  margin-top: 16px;
  padding: 0 20px;
  border-radius: var(--shape-full);
  background: var(--surface-container-high);
  color: var(--on-surface-variant);
  outline: 2px solid transparent;
  outline-offset: -2px;
  transition: outline-color 150ms linear;
}

.search:focus-within {
  outline-color: var(--primary);
}

.search input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  background: transparent;
  color: var(--on-surface);
  font: inherit;
  outline: 0;
}

.notice {
  margin-top: 24px;
  color: var(--on-surface-variant);
  text-align: center;
}

h2 {
  margin: 24px 0 8px;
  padding: 0 4px;
  color: var(--primary);
  font-size: 14px;
  font-weight: 600;
}

/* grouped rows like Pixel settings: tight inner corners, round outer ones */
.list {
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 64px;
  padding: 10px 16px 10px 20px;
  border-radius: 4px;
  background: var(--surface-container);
  text-decoration: none;
  transition: background-color 150ms linear;
}

li:first-child .row {
  border-top-left-radius: var(--shape-l);
  border-top-right-radius: var(--shape-l);
}

li:last-child .row {
  border-bottom-left-radius: var(--shape-l);
  border-bottom-right-radius: var(--shape-l);
}

a.row:hover {
  background: var(--surface-container-high);
}

.row-text {
  flex: 1;
  min-width: 0;
}

.row strong,
.row small {
  display: block;
  overflow-wrap: anywhere;
}

.row strong {
  font-weight: 600;
}

.row small {
  color: var(--on-surface-variant);
  font-size: 14px;
}

.hint {
  padding: 20px;
  border-radius: var(--shape-l);
  background: var(--surface-container-low);
  color: var(--on-surface-variant);
  font-size: 14px;
}

/* sticks above the bottom nav while the list scrolls, rests under the list at the end */
.fab {
  position: sticky;
  bottom: calc(96px + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
  min-height: 56px;
  margin: 24px 0 0 auto;
  padding: 0 20px 0 16px;
  border-radius: var(--shape-m);
  background: var(--primary-container);
  color: var(--on-primary-container);
  font-weight: 600;
  text-decoration: none;
  box-shadow:
    0 4px 8px 3px rgb(0 0 0 / 0.15),
    0 1px 3px rgb(0 0 0 / 0.3);
  transition: border-radius 240ms var(--spring);
}

.fab:active {
  border-radius: var(--shape-l);
}

@media (min-width: 840px) {
  .fab {
    bottom: 24px;
  }
}
</style>
