<script setup lang="ts">
import { computed } from 'vue'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const today = new Intl.DateTimeFormat('uk-UA', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date())

const firstName = computed(() => auth.user?.name.split(' ')[0] ?? '')
</script>

<template>
  <p class="date">{{ today }}</p>
  <h1>Привіт, {{ firstName }}</h1>

  <section class="hero">
    <h2>Час тренуватися</h2>
    <p>Вибери план і записуй кожен підхід.</p>
    <RouterLink class="btn btn-filled" :to="{ name: 'plans' }">
      <span class="icon" aria-hidden="true">play_arrow</span>
      До планів
    </RouterLink>
  </section>

  <RouterLink class="tile" :to="{ name: 'history' }">
    <span class="tile-icon"><span class="icon" aria-hidden="true">history</span></span>
    <span>
      <strong>Історія</strong>
      <small>Усі твої тренування</small>
    </span>
  </RouterLink>
</template>

<style scoped>
.date {
  color: var(--on-surface-variant);
}

.date::first-letter {
  text-transform: uppercase;
}

h1 {
  font-size: 40px;
  font-weight: 700;
  font-stretch: 110%;
  line-height: 1.15;
  letter-spacing: -0.01em;
  overflow-wrap: anywhere;
}

.hero {
  margin-top: 24px;
  padding: 28px 24px;
  border-radius: var(--shape-xl);
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.hero h2 {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.hero p {
  margin: 8px 0 24px;
}

.tile {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  padding: 16px;
  border-radius: var(--shape-l);
  background: var(--surface-container);
  text-decoration: none;
}

.tile-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: var(--shape-m);
  background: var(--tertiary-container);
  color: var(--on-tertiary-container);
}

.tile strong,
.tile small {
  display: block;
}

.tile small {
  color: var(--on-surface-variant);
  font-size: 14px;
}
</style>
