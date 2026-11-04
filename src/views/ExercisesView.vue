<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import SearchField from '@/components/SearchField.vue'
import TopBar from '@/components/TopBar.vue'
import { filterByName, metricsLabel, useExercisesStore } from '@/stores/exercises'

const store = useExercisesStore()
const { items, loaded } = storeToRefs(store)

const query = ref('')
const failed = ref(false)

const found = computed(() => filterByName(items.value, query.value))
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

  <SearchField v-model="query" class="search" label="Пошук вправ" />

  <div v-if="failed" class="notice">
    <p>Не вдалося завантажити вправи.</p>
    <button class="btn btn-text" type="button" @click="load">Спробувати ще раз</button>
  </div>

  <p v-else-if="!loaded" class="notice">Завантаження…</p>

  <template v-else>
    <p v-if="query && !found.length" class="notice">Нічого не знайдено.</p>

    <section v-if="own.length || !query">
      <h2 class="section-title">Мої вправи</h2>
      <ul v-if="own.length" class="group">
        <li v-for="exercise in own" :key="exercise.id">
          <RouterLink class="group-row" :to="{ name: 'exercise-edit', params: { id: exercise.id } }">
            <span class="group-row-text">
              <strong>{{ exercise.name }}</strong>
              <small>{{ metricsLabel(exercise.metrics) }}</small>
            </span>
            <span class="icon" aria-hidden="true">chevron_right</span>
          </RouterLink>
        </li>
      </ul>
      <p v-else class="empty-hint">Своїх вправ ще немає. Створи першу кнопкою внизу.</p>
    </section>

    <section v-if="catalog.length">
      <h2 class="section-title">Каталог</h2>
      <ul class="group">
        <li v-for="exercise in catalog" :key="exercise.id">
          <div class="group-row">
            <span class="group-row-text">
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
  margin-top: 16px;
}
</style>
