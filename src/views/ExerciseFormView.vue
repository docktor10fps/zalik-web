<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { ApiError } from '@/api/client'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import TextField from '@/components/TextField.vue'
import TopBar from '@/components/TopBar.vue'
import { type ExerciseMetric, METRICS, useExercisesStore } from '@/stores/exercises'

const props = defineProps<{ id?: string }>()

const store = useExercisesStore()
const router = useRouter()

const isEdit = computed(() => props.id !== undefined)
const exerciseId = computed(() => Number(props.id))

const form = reactive({ name: '', description: '', metrics: [] as ExerciseMetric[] })
const fieldErrors = reactive({ name: '', metrics: '' })
const formError = ref('')
const submitting = ref(false)
const confirmingDelete = ref(false)
const state = ref<'loading' | 'ready' | 'missing'>(isEdit.value ? 'loading' : 'ready')

// the API has no GET /exercises/{id}, so the exercise comes from the list
onMounted(async () => {
  if (!isEdit.value) return

  try {
    await store.ensureLoaded()
  } catch {
    state.value = 'missing'
    return
  }

  const exercise = store.items.find((item) => item.id === exerciseId.value && item.user_id !== null)

  if (!exercise) {
    state.value = 'missing'
    return
  }

  form.name = exercise.name
  form.description = exercise.description ?? ''
  form.metrics = [...exercise.metrics]
  state.value = 'ready'
})

function validate() {
  fieldErrors.name = form.name.trim() ? '' : 'Введіть назву'
  fieldErrors.metrics = form.metrics.length ? '' : 'Виберіть хоча б один показник'

  return !fieldErrors.name && !fieldErrors.metrics
}

function errorText(error: unknown, conflict: string) {
  if (!(error instanceof ApiError) || error.status === 0) {
    return 'Не вдалося зʼєднатися із сервером. Спробуйте ще раз.'
  }

  return error.status === 409 ? conflict : 'Щось пішло не так. Спробуйте ще раз.'
}

async function submit() {
  formError.value = ''

  if (!validate()) return

  submitting.value = true

  const data = {
    name: form.name.trim(),
    description: form.description.trim() || null,
    metrics: METRICS.map((metric) => metric.value).filter((value) => form.metrics.includes(value)),
  }

  try {
    if (isEdit.value) await store.update(exerciseId.value, data)
    else await store.create(data)

    await router.push({ name: 'exercises' })
  } catch (error) {
    if (error instanceof ApiError && error.status === 422 && error.errors.name) {
      fieldErrors.name = 'У вас уже є вправа з такою назвою'
    } else {
      formError.value = errorText(
        error,
        'У вправи вже є записані результати, тому показники змінити не можна. Створіть нову вправу.',
      )
    }
  } finally {
    submitting.value = false
  }
}

async function remove() {
  formError.value = ''
  submitting.value = true

  try {
    await store.remove(exerciseId.value)
    await router.push({ name: 'exercises' })
  } catch (error) {
    formError.value = errorText(error, 'Цю вправу не можна видалити: вона є в плані або в історії тренувань.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <TopBar :title="isEdit ? 'Редагувати вправу' : 'Нова вправа'" :back="{ name: 'exercises' }" />

  <p v-if="state === 'loading'" class="notice">Завантаження…</p>
  <p v-else-if="state === 'missing'" class="notice">Не вдалося відкрити цю вправу.</p>

  <form v-else novalidate @submit.prevent="submit">
    <TextField v-model="form.name" label="Назва" maxlength="255" :error="fieldErrors.name" />
    <TextField v-model="form.description" label="Опис (необовʼязково)" maxlength="2000" />

    <fieldset>
      <legend>Що міряємо</legend>
      <div class="chips">
        <label v-for="metric in METRICS" :key="metric.value" class="chip">
          <input v-model="form.metrics" type="checkbox" :value="metric.value">
          <span class="icon check" aria-hidden="true">check</span>
          {{ metric.label }}
        </label>
      </div>
      <p v-if="fieldErrors.metrics" class="error">{{ fieldErrors.metrics }}</p>
      <p class="hint">Жим — повтори й вага, біг — дистанція й час, планка — час.</p>
    </fieldset>

    <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

    <button class="btn btn-filled" type="submit" :disabled="submitting">
      {{ submitting ? 'Зачекай…' : 'Зберегти' }}
    </button>
    <button
      v-if="isEdit"
      class="btn btn-text danger"
      type="button"
      :disabled="submitting"
      @click="confirmingDelete = true"
    >
      <span class="icon" aria-hidden="true">delete</span>
      Видалити вправу
    </button>
  </form>

  <ConfirmDialog
    v-model:open="confirmingDelete"
    title="Видалити вправу?"
    :text="`«${form.name}» зникне з твого списку вправ.`"
    confirm-label="Видалити"
    @confirm="remove"
  />
</template>

<style scoped>
.notice {
  margin-top: 24px;
  color: var(--on-surface-variant);
  text-align: center;
}

form {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}

fieldset {
  min-width: 0;
  margin: 8px 0 0;
  padding: 0;
  border: 0;
}

legend {
  margin-bottom: 8px;
  padding: 0 4px;
  color: var(--on-surface-variant);
  font-size: 14px;
  font-weight: 600;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* filter chips: outlined until chosen, then filled with a check */
.chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--outline);
  border-radius: var(--shape-s);
  color: var(--on-surface-variant);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 150ms linear,
    border-color 150ms linear;
}

.chip input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.chip .check {
  display: none;
  font-size: 18px;
}

.chip:has(input:checked) {
  border-color: transparent;
  background: var(--secondary-container);
  color: var(--on-secondary-container);
  padding-left: 10px;
}

.chip:has(input:checked) .check {
  display: inline;
}

.chip:has(input:focus-visible) {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
}

.error {
  margin: 8px 4px 0;
  color: var(--error);
  font-size: 13px;
}

.hint {
  margin: 8px 4px 0;
  color: var(--on-surface-variant);
  font-size: 13px;
}

.form-error {
  padding: 12px 16px;
  border-radius: var(--shape-m);
  background: var(--error-container);
  color: var(--on-error-container);
  font-size: 14px;
}

form .btn-filled {
  margin-top: 12px;
}

.danger {
  min-height: 56px;
  color: var(--error);
}
</style>
