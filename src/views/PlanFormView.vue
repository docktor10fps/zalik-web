<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { ApiError } from '@/api/client'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ExercisePicker from '@/components/ExercisePicker.vue'
import TextField from '@/components/TextField.vue'
import TopBar from '@/components/TopBar.vue'
import { useDragSort } from '@/composables/useDragSort'
import { type Exercise, metricsLabel } from '@/stores/exercises'
import { useWorkoutsStore } from '@/stores/workouts'

// the same limits as WorkoutRequest on the API
const MIN_SETS = 1
const MAX_SETS = 50
const DEFAULT_SETS = 3

interface PlanItem {
  key: number
  exercise: Exercise
  sets: number
}

const props = defineProps<{ id?: string }>()

const store = useWorkoutsStore()
const router = useRouter()

const isEdit = computed(() => props.id !== undefined)
const workoutId = computed(() => Number(props.id))

const name = ref('')
const items = ref<PlanItem[]>([])
const fieldErrors = reactive({ name: '', items: '' })
const formError = ref('')
const submitting = ref(false)
const picking = ref(false)
const confirmingDelete = ref(false)
const state = ref<'loading' | 'ready' | 'missing'>(isEdit.value ? 'loading' : 'ready')

const addedIds = computed(() => items.value.map((item) => item.exercise.id))

// v-for needs a key that stays with the item while it moves up and down
let nextKey = 0

function addItem(exercise: Exercise, sets = DEFAULT_SETS) {
  items.value.push({ key: nextKey++, exercise, sets })
}

onMounted(async () => {
  if (!isEdit.value) return

  try {
    const workout = await store.fetchOne(workoutId.value)

    name.value = workout.name
    workout.exercises.forEach((item) => addItem(item.exercise, item.planned_sets))
    state.value = 'ready'
  } catch {
    state.value = 'missing'
  }
})

function pick(exercises: Exercise[]) {
  exercises.forEach((exercise) => addItem(exercise))
  fieldErrors.items = ''
}

// DOM elements of each item and its drag handle, by item key
const itemElements = new Map<number, HTMLElement>()
const handleElements = new Map<number, HTMLElement>()

function elementRef(elements: Map<number, HTMLElement>, key: number) {
  return (element: unknown) => {
    if (element instanceof HTMLElement) elements.set(key, element)
    else elements.delete(key)
  }
}

const { draggingIndex, dragOffset, startDrag } = useDragSort(items, (index) => {
  const item = items.value[index]

  return item && itemElements.get(item.key)
})

// keyboard alternative to dragging: arrow up and down on a focused handle
async function moveByKey(index: number, offset: -1 | 1) {
  const target = index + offset

  if (target < 0 || target >= items.value.length) return

  const [item] = items.value.splice(index, 1)
  items.value.splice(target, 0, item!)

  // moving the element in the DOM drops its focus, so give it back
  await nextTick()
  handleElements.get(item!.key)?.focus()
}

function removeItem(index: number) {
  items.value.splice(index, 1)
}

function changeSets(item: PlanItem, delta: -1 | 1) {
  item.sets = Math.min(MAX_SETS, Math.max(MIN_SETS, item.sets + delta))
}

function validate() {
  fieldErrors.name = name.value.trim() ? '' : 'Введіть назву'
  fieldErrors.items = items.value.length ? '' : 'Додайте хоча б одну вправу'

  return !fieldErrors.name && !fieldErrors.items
}

function errorText(error: unknown) {
  if (!(error instanceof ApiError) || error.status === 0) {
    return 'Не вдалося зʼєднатися із сервером. Спробуйте ще раз.'
  }

  return 'Щось пішло не так. Спробуйте ще раз.'
}

async function submit() {
  formError.value = ''

  if (!validate()) return

  submitting.value = true

  const data = {
    name: name.value.trim(),
    exercises: items.value.map((item) => ({ exercise_id: item.exercise.id, planned_sets: item.sets })),
  }

  try {
    if (isEdit.value) await store.update(workoutId.value, data)
    else await store.create(data)

    await router.push({ name: 'plans' })
  } catch (error) {
    formError.value = errorText(error)
  } finally {
    submitting.value = false
  }
}

async function removePlan() {
  formError.value = ''
  submitting.value = true

  try {
    await store.remove(workoutId.value)
    await router.push({ name: 'plans' })
  } catch (error) {
    formError.value = errorText(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <TopBar :title="isEdit ? 'Редагувати план' : 'Новий план'" :back="{ name: 'plans' }" />

  <p v-if="state === 'loading'" class="notice">Завантаження…</p>
  <p v-else-if="state === 'missing'" class="notice">Не вдалося відкрити цей план.</p>

  <form v-else novalidate @submit.prevent="submit">
    <TextField v-model="name" label="Назва плану" maxlength="255" :error="fieldErrors.name" />

    <h2 class="section-title">Вправи</h2>
    <p v-if="items.length > 1" id="reorder-hint" class="reorder-hint">
      Тягни вправу за ручку зліва, щоб змінити порядок, або стрілками вгору й вниз на клавіатурі.
    </p>

    <TransitionGroup v-if="items.length" tag="ol" name="reorder" class="items">
      <li
        v-for="(item, index) in items"
        :key="item.key"
        :ref="elementRef(itemElements, item.key)"
        class="item"
        :class="{ dragging: draggingIndex === index }"
        :style="draggingIndex === index ? { translate: `0 ${dragOffset}px` } : undefined"
      >
        <button
          :ref="elementRef(handleElements, item.key)"
          class="handle"
          type="button"
          :aria-label="`Порядок: «${item.exercise.name}», ${index + 1} з ${items.length}`"
          :aria-describedby="items.length > 1 ? 'reorder-hint' : undefined"
          @pointerdown="startDrag($event, index)"
          @keydown.up.prevent="moveByKey(index, -1)"
          @keydown.down.prevent="moveByKey(index, 1)"
        >
          <span class="icon" aria-hidden="true">drag_indicator</span>
        </button>

        <div class="item-body">
          <div class="item-head">
            <span class="position" aria-hidden="true">{{ index + 1 }}</span>
            <span class="item-text">
              <strong>{{ item.exercise.name }}</strong>
              <small>{{ metricsLabel(item.exercise.metrics) }}</small>
            </span>
            <button
              class="icon-btn"
              type="button"
              :aria-label="`Прибрати «${item.exercise.name}»`"
              @click="removeItem(index)"
            >
              <span class="icon" aria-hidden="true">close</span>
            </button>
          </div>

          <div class="item-controls">
            <span class="sets-label">Підходи</span>
            <div class="stepper">
              <button
                class="step"
                type="button"
                :disabled="item.sets <= MIN_SETS"
                aria-label="Менше підходів"
                @click="changeSets(item, -1)"
              >
                <span class="icon" aria-hidden="true">remove</span>
              </button>
              <output aria-live="polite">{{ item.sets }}</output>
              <button
                class="step"
                type="button"
                :disabled="item.sets >= MAX_SETS"
                aria-label="Більше підходів"
                @click="changeSets(item, 1)"
              >
                <span class="icon" aria-hidden="true">add</span>
              </button>
            </div>
          </div>
        </div>
      </li>
    </TransitionGroup>

    <p v-else class="empty-hint">Додай вправи, які робитимеш на цьому тренуванні.</p>
    <p v-if="fieldErrors.items" class="error">{{ fieldErrors.items }}</p>

    <button class="btn btn-tonal" type="button" @click="picking = true">
      <span class="icon" aria-hidden="true">add</span>
      Додати вправи
    </button>

    <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

    <button class="btn btn-filled save" type="submit" :disabled="submitting">
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
      Видалити план
    </button>
  </form>

  <ExercisePicker v-model:open="picking" :added="addedIds" @pick="pick" />

  <ConfirmDialog
    v-model:open="confirmingDelete"
    title="Видалити план?"
    text="Тренування, які ти вже записав за цим планом, залишаться в історії."
    confirm-label="Видалити"
    @confirm="removePlan"
  />
</template>

<style scoped>
form {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}

form .section-title {
  margin: 12px 0 -4px;
}

.items {
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.reorder-hint {
  margin-top: -4px;
  padding: 0 4px;
  color: var(--on-surface-variant);
  font-size: 13px;
}

.item {
  position: relative;
  display: flex;
  padding: 8px 8px 8px 0;
  border-radius: 4px;
  background: var(--surface-container);
  transition:
    translate 250ms var(--emphasized),
    border-radius 200ms var(--emphasized),
    box-shadow 200ms linear;
}

.item:first-child {
  border-top-left-radius: var(--shape-l);
  border-top-right-radius: var(--shape-l);
}

.item:last-child {
  border-bottom-left-radius: var(--shape-l);
  border-bottom-right-radius: var(--shape-l);
}

/* the lifted tile: follows the pointer without delay, so no translate transition here */
.item.dragging {
  z-index: 1;
  border-radius: var(--shape-l);
  background: var(--surface-container-high);
  box-shadow:
    0 8px 16px 2px rgb(0 0 0 / 0.16),
    0 2px 6px rgb(0 0 0 / 0.2);
  transition:
    border-radius 200ms var(--emphasized),
    box-shadow 200ms linear;
}

/* a tall strip on the left edge: easy to grab with a thumb; touch-action stops the page from scrolling instead */
.handle {
  display: grid;
  flex: none;
  place-items: center;
  width: 40px;
  padding: 0;
  border: 0;
  border-radius: var(--shape-m);
  background: transparent;
  color: var(--on-surface-variant);
  cursor: grab;
  touch-action: none;
}

.dragging .handle {
  cursor: grabbing;
}

.item-body {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
}

.item-head,
.item-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.position {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--shape-full);
  background: var(--secondary-container);
  color: var(--on-secondary-container);
  font-size: 14px;
  font-weight: 700;
}

.item-text {
  flex: 1;
  min-width: 0;
}

.item-text strong,
.item-text small {
  display: block;
  overflow-wrap: anywhere;
}

.item-text strong {
  font-weight: 600;
}

.item-text small {
  color: var(--on-surface-variant);
  font-size: 14px;
}

.item-controls {
  gap: 0;
  margin-top: 8px;
}

.sets-label {
  margin: 0 12px 0 auto;
  color: var(--on-surface-variant);
  font-size: 14px;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.step {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: var(--shape-full);
  background: var(--secondary-container);
  color: var(--on-secondary-container);
  cursor: pointer;
  transition:
    border-radius 240ms var(--spring),
    opacity 150ms linear;
}

.step:active:not(:disabled) {
  border-radius: var(--shape-s);
}

.step:disabled {
  opacity: 0.38;
  cursor: default;
}

output {
  min-width: 32px;
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

/* neighbours glide out of the way; translate is listed so a dropped tile still settles smoothly */
.reorder-move {
  transition:
    transform 300ms var(--spring),
    translate 250ms var(--emphasized);
}

/* the dragged tile must not glide: it is already where the pointer is */
.item.dragging.reorder-move {
  transition: none;
}

.reorder-enter-active {
  transition:
    opacity 200ms linear,
    transform 300ms var(--spring);
}

.reorder-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.error {
  margin: -4px 4px 0;
  color: var(--error);
  font-size: 13px;
}

.save {
  margin-top: 12px;
}

.danger {
  min-height: 56px;
  color: var(--error);
}
</style>
