<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { ApiError } from '@/api/client'
import MetricChips from '@/components/MetricChips.vue'
import SearchField from '@/components/SearchField.vue'
import TextField from '@/components/TextField.vue'
import {
  type Exercise,
  type ExerciseMetric,
  filterByName,
  metricsLabel,
  orderMetrics,
  useExercisesStore,
} from '@/stores/exercises'

// ids already in the plan: shown as added, not selectable again
const props = defineProps<{ added: number[] }>()

const emit = defineEmits<{ pick: [exercises: Exercise[]] }>()

const open = defineModel<boolean>('open', { required: true })

const store = useExercisesStore()
const { items, loaded } = storeToRefs(store)
const dialog = ref<HTMLDialogElement>()

const query = ref('')
const selected = ref<number[]>([])
const failed = ref(false)

const creating = ref(false)
const draft = reactive({ name: '', metrics: [] as ExerciseMetric[] })
const draftErrors = reactive({ name: '', metrics: '' })
const draftError = ref('')
const saving = ref(false)

const groups = computed(() => {
  const found = filterByName(items.value, query.value)

  return [
    { title: 'Мої вправи', exercises: found.filter((exercise) => exercise.user_id !== null) },
    { title: 'Каталог', exercises: found.filter((exercise) => exercise.user_id === null) },
  ].filter((group) => group.exercises.length)
})

// every opening starts clean: empty search, nothing selected, the list view
watch(open, async (value) => {
  if (!value) {
    dialog.value?.close()
    return
  }

  query.value = ''
  selected.value = []
  creating.value = false
  dialog.value?.showModal()

  await load()
})

async function load() {
  failed.value = false

  try {
    await store.ensureLoaded()
  } catch {
    failed.value = true
  }
}

function toggle(exercise: Exercise) {
  selected.value = selected.value.includes(exercise.id)
    ? selected.value.filter((id) => id !== exercise.id)
    : [...selected.value, exercise.id]
}

// the plan gets the exercises in the order they were tapped
function confirm() {
  emit(
    'pick',
    selected.value.map((id) => items.value.find((exercise) => exercise.id === id)!),
  )
  open.value = false
}

function startCreating() {
  draft.name = query.value.trim()
  draft.metrics = []
  draftErrors.name = ''
  draftErrors.metrics = ''
  draftError.value = ''
  creating.value = true
}

async function create() {
  draftError.value = ''
  draftErrors.name = draft.name.trim() ? '' : 'Введіть назву'
  draftErrors.metrics = draft.metrics.length ? '' : 'Виберіть хоча б один показник'

  if (draftErrors.name || draftErrors.metrics) return

  saving.value = true

  try {
    const exercise = await store.create({
      name: draft.name.trim(),
      description: null,
      metrics: orderMetrics(draft.metrics),
    })

    // back to the list with the new exercise already ticked
    selected.value = [...selected.value, exercise.id]
    query.value = ''
    creating.value = false
  } catch (error) {
    if (error instanceof ApiError && error.status === 422 && error.errors.name) {
      draftErrors.name = 'У вас уже є вправа з такою назвою'
    } else if (!(error instanceof ApiError) || error.status === 0) {
      draftError.value = 'Не вдалося зʼєднатися із сервером. Спробуйте ще раз.'
    } else {
      draftError.value = 'Щось пішло не так. Спробуйте ще раз.'
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <dialog ref="dialog" class="picker" aria-labelledby="picker-title" @close="open = false">
    <div class="sheet">
      <header>
        <button
          v-if="creating"
          class="icon-btn"
          type="button"
          aria-label="Назад до списку"
          @click="creating = false"
        >
          <span class="icon" aria-hidden="true">arrow_back</span>
        </button>
        <button v-else class="icon-btn" type="button" aria-label="Закрити" @click="open = false">
          <span class="icon" aria-hidden="true">close</span>
        </button>
        <h2 id="picker-title">{{ creating ? 'Нова вправа' : 'Додати вправи' }}</h2>
      </header>

      <form v-if="creating" class="body create" novalidate @submit.prevent="create">
        <TextField v-model="draft.name" label="Назва" maxlength="255" :error="draftErrors.name" />
        <MetricChips v-model="draft.metrics" :error="draftErrors.metrics" />
        <p v-if="draftError" class="form-error" role="alert">{{ draftError }}</p>
        <button class="btn btn-filled" type="submit" :disabled="saving">
          {{ saving ? 'Зачекай…' : 'Створити' }}
        </button>
      </form>

      <template v-else>
        <div class="body">
          <SearchField v-model="query" label="Пошук вправ" />

          <button class="create-row" type="button" @click="startCreating">
            <span class="icon" aria-hidden="true">add</span>
            {{ query.trim() ? `Створити «${query.trim()}»` : 'Створити свою вправу' }}
          </button>

          <div v-if="failed" class="notice">
            <p>Не вдалося завантажити вправи.</p>
            <button class="btn btn-text" type="button" @click="load">Спробувати ще раз</button>
          </div>
          <p v-else-if="!loaded" class="notice">Завантаження…</p>
          <p v-else-if="!groups.length" class="notice">Нічого не знайдено.</p>

          <template v-else>
            <section v-for="group in groups" :key="group.title">
              <h3 class="section-title">{{ group.title }}</h3>
              <ul class="group">
                <li v-for="exercise in group.exercises" :key="exercise.id">
                  <button
                    class="group-row"
                    :class="{ selected: selected.includes(exercise.id) }"
                    type="button"
                    :disabled="props.added.includes(exercise.id)"
                    :aria-pressed="selected.includes(exercise.id)"
                    @click="toggle(exercise)"
                  >
                    <span class="group-row-text">
                      <strong>{{ exercise.name }}</strong>
                      <small>
                        {{ props.added.includes(exercise.id) ? 'Вже в плані' : metricsLabel(exercise.metrics) }}
                      </small>
                    </span>
                    <span class="icon check" aria-hidden="true">check</span>
                  </button>
                </li>
              </ul>
            </section>
          </template>
        </div>

        <footer>
          <button class="btn btn-filled" type="button" :disabled="!selected.length" @click="confirm">
            {{ selected.length ? `Додати (${selected.length})` : 'Вибери вправи' }}
          </button>
        </footer>
      </template>
    </div>
  </dialog>
</template>

<style scoped>
/* full screen on a phone, a centered window on wider screens */
.picker {
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: var(--surface);
  color: var(--on-surface);
}

.picker[open] {
  animation: rise 250ms var(--emphasized);
}

.picker::backdrop {
  background: rgb(0 0 0 / 0.4);
}

@media (min-width: 600px) {
  .picker {
    width: calc(100% - 48px);
    max-width: 560px;
    height: calc(100% - 48px);
    max-height: 760px;
    margin: auto;
    border-radius: var(--shape-l);
  }
}

.sheet {
  display: flex;
  flex-direction: column;
  height: 100%;
}

header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px 8px 8px;
}

h2 {
  font-size: 22px;
  font-weight: 600;
}

.body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px 24px;
}

.create {
  display: grid;
  align-content: start;
  gap: 12px;
}

.create .btn-filled {
  margin-top: 12px;
}

.create-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 56px;
  margin-top: 12px;
  padding: 0 20px;
  border: 0;
  border-radius: var(--shape-l);
  background: var(--secondary-container);
  color: var(--on-secondary-container);
  font: inherit;
  font-weight: 600;
  text-align: start;
  cursor: pointer;
  overflow-wrap: anywhere;
}

.group-row .check {
  visibility: hidden;
  color: var(--on-primary-container);
}

.group-row.selected,
.group-row.selected:hover {
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.group-row.selected small {
  color: inherit;
}

.group-row.selected .check {
  visibility: visible;
}

.group-row:disabled {
  opacity: 0.5;
  cursor: default;
}

footer {
  padding: 12px 16px calc(16px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--surface-container-highest);
}

footer .btn {
  width: 100%;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}
</style>
