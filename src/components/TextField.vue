<script setup lang="ts">
import { computed, ref, useId } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    label: string
    type?: string
    error?: string
  }>(),
  { type: 'text', error: '' },
)

const model = defineModel<string>({ required: true })

const id = useId()
const revealed = ref(false)
const isPassword = computed(() => props.type === 'password')
const inputType = computed(() => (isPassword.value && revealed.value ? 'text' : props.type))
</script>

<template>
  <div class="text-field" :class="{ invalid: error }">
    <div class="box">
      <input
        v-bind="$attrs"
        :id="id"
        v-model="model"
        :type="inputType"
        placeholder=" "
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? `${id}-error` : undefined"
      />
      <label :for="id">{{ label }}</label>
      <button
        v-if="isPassword"
        type="button"
        class="toggle"
        :aria-label="revealed ? 'Сховати пароль' : 'Показати пароль'"
        @click="revealed = !revealed"
      >
        <span class="icon" aria-hidden="true">{{ revealed ? 'visibility_off' : 'visibility' }}</span>
      </button>
    </div>
    <p v-if="error" :id="`${id}-error`" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.box {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--surface-container-highest);
  border-radius: var(--shape-m);
  outline: 2px solid transparent;
  outline-offset: -2px;
  transition: outline-color 150ms linear;
}

.box:focus-within {
  outline-color: var(--primary);
}

.invalid .box {
  outline-color: var(--error);
}

input {
  width: 100%;
  min-height: 60px;
  padding: 24px 16px 8px;
  border: 0;
  background: transparent;
  color: var(--on-surface);
  font: inherit;
  outline: 0;
}

label {
  position: absolute;
  top: 18px;
  left: 16px;
  color: var(--on-surface-variant);
  pointer-events: none;
  transform-origin: left top;
  transition:
    transform 200ms var(--emphasized),
    color 150ms linear;
}

input:focus + label,
input:not(:placeholder-shown) + label {
  transform: translateY(-9px) scale(0.75);
}

input:focus + label {
  color: var(--primary);
}

.invalid label,
.invalid input:focus + label {
  color: var(--error);
}

.toggle {
  flex: none;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-right: 6px;
  border: 0;
  border-radius: var(--shape-full);
  background: transparent;
  color: var(--on-surface-variant);
  cursor: pointer;
}

.error {
  margin: 4px 16px 0;
  color: var(--error);
  font-size: 13px;
}
</style>
