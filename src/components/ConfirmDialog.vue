<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-card">
        <div class="modal-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>{{ title }}</span>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
          <p v-if="hint" class="modal-hint">{{ hint }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="$emit('cancel')">{{ cancelText }}</button>
          <button class="btn-confirm" :class="{ danger }" @click="$emit('confirm')">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  title: { type: String, default: '提示' },
  message: { type: String, default: '' },
  hint: { type: String, default: '' },
  confirmText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
  danger: { type: Boolean, default: false },
})

defineEmits(['confirm', 'cancel'])
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
}

.modal-card {
  background: white;
  border-radius: $radius-md;
  padding: 24px;
  width: 340px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.25s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 16px;

  svg {
    width: 20px;
    height: 20px;
    color: $brand-warning;
  }
}

.modal-body {
  font-size: 14px;
  color: $text-secondary;
  line-height: 1.6;
  margin-bottom: 20px;

  .modal-hint {
    margin-top: 8px;
    font-size: 12px;
    color: $text-hint;
  }
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm {
  padding: 8px 20px;
  border-radius: $radius-sm;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all $transition-fast;
  font-family: inherit;
}

.btn-cancel {
  background: $gray-100;
  color: $text-secondary;
  &:hover { background: $gray-200; }
}

.btn-confirm {
  background: $brand-primary;
  color: white;
  &:hover { background: $brand-primary-dark; }

  &.danger {
    background: $brand-danger;
    &:hover { opacity: 0.9; }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
