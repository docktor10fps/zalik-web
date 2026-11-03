<script setup lang="ts">
defineProps<{ title: string; icon: string }>()
</script>

<template>
  <h1>{{ title }}</h1>

  <section class="empty">
    <span class="badge"><span class="icon" aria-hidden="true">{{ icon }}</span></span>
    <p>Цей екран зʼявиться в наступній частині.</p>
  </section>
</template>

<style scoped>
h1 {
  font-size: 40px;
  font-weight: 700;
  font-stretch: 110%;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.empty {
  display: grid;
  justify-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 48px 24px;
  border-radius: var(--shape-xl);
  background: var(--surface-container-low);
  color: var(--on-surface-variant);
  text-align: center;
}

.badge {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: var(--shape-l);
  background: var(--secondary-container);
  color: var(--on-secondary-container);
}
</style>
