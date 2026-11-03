<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth'
import { type Theme, useThemeStore } from '@/stores/theme'

const THEMES: { value: Theme; label: string; icon: string }[] = [
  { value: 'system', label: 'Системна', icon: 'brightness_auto' },
  { value: 'light', label: 'Світла', icon: 'light_mode' },
  { value: 'dark', label: 'Темна', icon: 'dark_mode' },
]

const auth = useAuthStore()
const { theme } = storeToRefs(useThemeStore())
const router = useRouter()
const leaving = ref(false)

const initial = computed(() => auth.user?.name.charAt(0).toUpperCase() ?? '')

async function logout() {
  leaving.value = true

  try {
    await auth.logout()
  } catch {
    // the local session is already gone, so the failed request changes nothing for the user
  }

  await router.push({ name: 'login' })
}
</script>

<template>
  <h1>Профіль</h1>

  <section class="card">
    <span class="avatar" aria-hidden="true">{{ initial }}</span>
    <div class="identity">
      <h2>{{ auth.user?.name }}</h2>
      <p>{{ auth.user?.email }}</p>
    </div>
  </section>

  <section class="settings">
    <h2 id="theme-label">Тема</h2>
    <div class="segmented" role="radiogroup" aria-labelledby="theme-label">
      <label v-for="option in THEMES" :key="option.value" class="segment">
        <input v-model="theme" type="radio" name="theme" :value="option.value">
        <span class="icon" aria-hidden="true">{{ option.icon }}</span>
        {{ option.label }}
      </label>
    </div>
  </section>

  <button class="btn btn-tonal logout" type="button" :disabled="leaving" @click="logout">
    <span class="icon" aria-hidden="true">logout</span>
    Вийти
  </button>
</template>

<style scoped>
h1 {
  font-size: 40px;
  font-weight: 700;
  font-stretch: 110%;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.card {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 20px;
  border-radius: var(--shape-xl);
  background: var(--surface-container);
}

.avatar {
  display: grid;
  flex: none;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: var(--shape-full);
  background: var(--primary-container);
  color: var(--on-primary-container);
  font-size: 32px;
  font-weight: 700;
}

.identity {
  min-width: 0;
}

.identity h2 {
  font-size: 22px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.identity p {
  color: var(--on-surface-variant);
  overflow-wrap: anywhere;
}

.settings {
  margin-top: 12px;
  padding: 20px;
  border-radius: var(--shape-xl);
  background: var(--surface-container);
}

.settings h2 {
  margin-bottom: 12px;
  color: var(--on-surface-variant);
  font-size: 14px;
  font-weight: 600;
}

/* connected buttons: outer corners round, inner ones tight; the chosen one becomes a full pill */
.segmented {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2px;
}

.segment {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 4px;
  padding: 14px 8px;
  border-radius: var(--shape-s);
  background: var(--surface-container-highest);
  color: var(--on-surface-variant);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-radius 240ms var(--spring),
    background-color 150ms linear,
    color 150ms linear;
}

.segment:first-child {
  border-radius: var(--shape-l) var(--shape-s) var(--shape-s) var(--shape-l);
}

.segment:last-child {
  border-radius: var(--shape-s) var(--shape-l) var(--shape-l) var(--shape-s);
}

.segment:has(input:checked) {
  border-radius: var(--shape-l);
  background: var(--primary);
  color: var(--on-primary);
  --icon-fill: 1;
}

.segment:has(input:focus-visible) {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
}

/* the radio stays for keyboard and screen readers, the whole tile is its visible face */
.segment input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.logout {
  width: 100%;
  margin-top: 12px;
}
</style>
