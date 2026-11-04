<script setup lang="ts">
import { type ExerciseMetric, METRICS } from '@/stores/exercises'

withDefaults(defineProps<{ error?: string }>(), { error: '' })

const model = defineModel<ExerciseMetric[]>({ required: true })
</script>

<template>
  <fieldset>
    <legend>Що міряємо</legend>
    <div class="chips">
      <label v-for="metric in METRICS" :key="metric.value" class="chip">
        <input v-model="model" type="checkbox" :value="metric.value">
        <span class="icon check" aria-hidden="true">check</span>
        {{ metric.label }}
      </label>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
    <p class="hint">Жим — повтори й вага, біг — дистанція й час, планка — час.</p>
  </fieldset>
</template>

<style scoped>
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

/* the checkbox stays for keyboard and screen readers, the chip is its visible face */
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
</style>
