<script setup lang="ts">
const SIZE = 100
const LOBES = 9
const STEPS = 180

const points = Array.from({ length: STEPS }, (_, index) => {
  const angle = (index / STEPS) * Math.PI * 2
  const radius = 44 + 4 * Math.cos(LOBES * angle)
  const x = SIZE / 2 + radius * Math.cos(angle)
  const y = SIZE / 2 + radius * Math.sin(angle)

  return `${x.toFixed(2)},${y.toFixed(2)}`
}).join(' ')
</script>

<template>
  <span class="logo" aria-hidden="true">
    <svg :viewBox="`0 0 ${SIZE} ${SIZE}`"><polygon :points="points" /></svg>
    <span class="icon mark">fitness_center</span>
  </span>
</template>

<style scoped>
.logo {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 88px;
  height: 88px;
}

svg {
  position: absolute;
  inset: 0;
  fill: var(--primary-container);
  animation: spin 40s linear infinite;
}

.mark {
  position: relative;
  color: var(--on-primary-container);
  font-size: 44px;
  --icon-fill: 1;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
