<script setup lang="ts">
defineProps<{ label: string }>()

const model = defineModel<string>({ required: true })
</script>

<template>
  <label class="search">
    <span class="icon" aria-hidden="true">search</span>
    <input v-model="model" type="search" :placeholder="label" :aria-label="label">
  </label>
</template>

<style scoped>
.search {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 56px;
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

input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  background: transparent;
  color: var(--on-surface);
  font: inherit;
  outline: 0;
}
</style>
