<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineProps<{ title: string; back: RouteLocationRaw }>()
</script>

<template>
  <header class="top-bar">
    <RouterLink class="back" :to="back" aria-label="Назад">
      <span class="icon" aria-hidden="true">arrow_back</span>
    </RouterLink>
    <h1>{{ title }}</h1>
  </header>
</template>

<style scoped>
.top-bar {
  display: grid;
  gap: 8px;
}

.back {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin: -8px 0 0 -12px;
  border-radius: var(--shape-full);
  color: var(--on-surface);
  text-decoration: none;
  transition: background-color 150ms linear;
}

.back:hover {
  background: var(--surface-container-high);
}

h1 {
  font-size: 40px;
  font-weight: 700;
  font-stretch: 110%;
  line-height: 1.15;
  letter-spacing: -0.01em;
  overflow-wrap: anywhere;
}
</style>
