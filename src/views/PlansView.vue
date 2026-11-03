<template>
  <h1>Плани</h1>

  <RouterLink class="tile" :to="{ name: 'exercises' }">
    <span class="tile-icon"><span class="icon" aria-hidden="true">fitness_center</span></span>
    <span class="tile-text">
      <strong>Вправи</strong>
      <small>Каталог і твої власні вправи</small>
    </span>
    <span class="icon" aria-hidden="true">chevron_right</span>
  </RouterLink>

  <section class="empty">
    <p>Плани тренувань зʼявляться в наступній частині.</p>
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

.tile {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px 20px 16px 16px;
  border-radius: var(--shape-l);
  background: var(--surface-container);
  text-decoration: none;
  transition: background-color 150ms linear;
}

.tile:hover {
  background: var(--surface-container-high);
}

.tile-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: var(--shape-m);
  background: var(--secondary-container);
  color: var(--on-secondary-container);
}

.tile-text {
  flex: 1;
  min-width: 0;
}

.tile strong,
.tile small {
  display: block;
}

.tile small {
  color: var(--on-surface-variant);
  font-size: 14px;
}

.empty {
  margin-top: 12px;
  padding: 32px 24px;
  border-radius: var(--shape-xl);
  background: var(--surface-container-low);
  color: var(--on-surface-variant);
  text-align: center;
}
</style>
