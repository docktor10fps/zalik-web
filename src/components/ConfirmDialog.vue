<script setup lang="ts">
import { ref, watch } from 'vue'

defineProps<{ title: string; text: string; confirmLabel: string }>()

const emit = defineEmits<{ confirm: [] }>()

const open = defineModel<boolean>('open', { required: true })
const dialog = ref<HTMLDialogElement>()

// the native <dialog> gives the dark backdrop, focus trap and Esc for free
watch(open, (value) => {
  if (value) dialog.value?.showModal()
  else dialog.value?.close()
})

function confirm() {
  open.value = false
  emit('confirm')
}
</script>

<template>
  <!-- a click that lands on the dialog itself, not its content, is a click on the backdrop -->
  <dialog ref="dialog" class="dialog" @close="open = false" @click.self="open = false">
    <div class="content">
      <h2>{{ title }}</h2>
      <p>{{ text }}</p>
      <div class="actions">
        <button class="btn btn-text" type="button" @click="open = false">Скасувати</button>
        <button class="btn btn-text" type="button" @click="confirm">{{ confirmLabel }}</button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.dialog {
  width: calc(100% - 48px);
  max-width: 400px;
  padding: 0;
  border: 0;
  border-radius: var(--shape-l);
  background: var(--surface-container-high);
  color: var(--on-surface);
}

.dialog[open] {
  animation: pop 200ms var(--emphasized);
}

.dialog::backdrop {
  background: rgb(0 0 0 / 0.4);
}

.content {
  padding: 24px 24px 20px;
}

h2 {
  font-size: 24px;
  font-weight: 600;
}

p {
  margin-top: 16px;
  color: var(--on-surface-variant);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
}
</style>
