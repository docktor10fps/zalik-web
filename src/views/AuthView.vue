<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { ApiError } from '@/api/client'
import LogoMark from '@/components/LogoMark.vue'
import TextField from '@/components/TextField.vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ mode: 'login' | 'register' }>()

const auth = useAuthStore()
const router = useRouter()

const form = reactive({ name: '', email: '', password: '', passwordConfirmation: '' })
const fieldErrors = reactive({ name: '', email: '', password: '', passwordConfirmation: '' })
const formError = ref('')
const submitting = ref(false)

const isRegister = computed(() => props.mode === 'register')

function validate() {
  fieldErrors.name = isRegister.value && !form.name.trim() ? 'Введіть імʼя' : ''
  fieldErrors.email = /^\S+@\S+\.\S+$/.test(form.email.trim()) ? '' : 'Введіть коректний email'
  fieldErrors.password = !form.password
    ? 'Введіть пароль'
    : isRegister.value && form.password.length < 8
      ? 'Щонайменше 8 символів'
      : ''
  fieldErrors.passwordConfirmation =
    isRegister.value && form.password !== form.passwordConfirmation ? 'Паролі не збігаються' : ''

  return !Object.values(fieldErrors).some(Boolean)
}

function handleError(error: unknown) {
  if (!(error instanceof ApiError) || error.status === 0) {
    formError.value = 'Не вдалося зʼєднатися із сервером. Спробуйте ще раз.'
  } else if (error.status === 429) {
    formError.value = 'Забагато спроб. Зачекайте хвилину.'
  } else if (error.status === 401) {
    formError.value = 'Неправильний email або пароль.'
  } else if (error.status === 422 && error.errors.email) {
    fieldErrors.email = 'Цей email уже зареєстрований'
  } else {
    formError.value = 'Щось пішло не так. Спробуйте ще раз.'
  }
}

async function submit() {
  formError.value = ''

  if (!validate()) return

  submitting.value = true

  try {
    if (isRegister.value) {
      await auth.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.passwordConfirmation,
      })
    } else {
      await auth.login(form.email.trim(), form.password)
    }

    await router.push({ name: 'home' })
  } catch (error) {
    handleError(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="auth">
    <div class="content">
      <LogoMark />

      <h1>{{ isRegister ? 'Створи акаунт' : 'З поверненням' }}</h1>
      <p class="subtitle">
        {{ isRegister ? 'Кожен підхід рахується.' : 'Увійди, щоб продовжити щоденник.' }}
      </p>

      <form novalidate @submit.prevent="submit">
        <TextField
          v-if="isRegister"
          v-model="form.name"
          label="Імʼя"
          autocomplete="name"
          :error="fieldErrors.name"
        />
        <TextField
          v-model="form.email"
          label="Email"
          type="email"
          autocomplete="email"
          inputmode="email"
          :error="fieldErrors.email"
        />
        <TextField
          v-model="form.password"
          label="Пароль"
          type="password"
          :autocomplete="isRegister ? 'new-password' : 'current-password'"
          :error="fieldErrors.password"
        />
        <TextField
          v-if="isRegister"
          v-model="form.passwordConfirmation"
          label="Повтори пароль"
          type="password"
          autocomplete="new-password"
          :error="fieldErrors.passwordConfirmation"
        />

        <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

        <button class="btn btn-filled" type="submit" :disabled="submitting">
          {{ submitting ? 'Зачекай…' : isRegister ? 'Зареєструватися' : 'Увійти' }}
        </button>
      </form>

      <p class="switch">
        {{ isRegister ? 'Вже є акаунт?' : 'Ще немає акаунта?' }}
        <RouterLink :to="{ name: isRegister ? 'login' : 'register' }">
          {{ isRegister ? 'Увійти' : 'Зареєструватися' }}
        </RouterLink>
      </p>
    </div>
  </main>
</template>

<style scoped>
.auth {
  display: grid;
  place-items: center;
  min-height: 100dvh;
  padding: 32px 16px calc(32px + env(safe-area-inset-bottom));
}

.content {
  width: 100%;
  max-width: 400px;
}

h1 {
  margin-top: 24px;
  font-size: 40px;
  font-weight: 700;
  font-stretch: 110%;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.subtitle {
  margin-top: 8px;
  color: var(--on-surface-variant);
}

form {
  display: grid;
  gap: 12px;
  margin-top: 32px;
}

form .btn {
  margin-top: 12px;
}

.switch {
  margin-top: 24px;
  color: var(--on-surface-variant);
  text-align: center;
}

.switch a {
  color: var(--primary);
  font-weight: 600;
}
</style>
