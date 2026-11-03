<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const items = [
  { name: 'home', label: 'Головна', icon: 'home' },
  { name: 'plans', label: 'Плани', icon: 'checklist' },
  { name: 'history', label: 'Історія', icon: 'history' },
  { name: 'profile', label: 'Профіль', icon: 'person' },
]

const route = useRoute()

// nested screens like plans/exercises keep their parent tab highlighted
const activeTab = computed(() => route.meta.tab ?? route.name)
</script>

<template>
  <div class="app">
    <main class="page">
      <RouterView />
    </main>

    <nav class="nav" aria-label="Основна навігація">
      <RouterLink
        v-for="item in items"
        :key="item.name"
        :to="{ name: item.name }"
        class="nav-item"
        :class="{ active: activeTab === item.name }"
      >
        <span class="indicator">
          <span class="icon" aria-hidden="true">{{ item.icon }}</span>
        </span>
        <span class="label">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px calc(112px + env(safe-area-inset-bottom));
}

.nav {
  position: fixed;
  inset: auto 0 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 12px 8px calc(16px + env(safe-area-inset-bottom));
  background: var(--surface-container);
}

.nav-item {
  display: grid;
  justify-items: center;
  gap: 4px;
  color: var(--on-surface-variant);
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
}

.indicator {
  display: grid;
  place-items: center;
  width: 64px;
  height: 32px;
  border-radius: var(--shape-full);
  transition:
    background-color 200ms var(--emphasized),
    width 300ms var(--spring);
}

.active {
  color: var(--on-surface);
  font-weight: 700;
}

.active .indicator {
  background: var(--secondary-container);
  color: var(--on-secondary-container);
  --icon-fill: 1;
}

@media (min-width: 840px) {
  .page {
    padding: 40px 32px;
  }

  .app {
    padding-left: 96px;
  }

  .nav {
    inset: 0 auto 0 0;
    grid-template-columns: 96px;
    align-content: center;
    gap: 16px;
    padding: 16px 0;
  }
}
</style>
