<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-card">
        <div class="modal-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>转接人工客服</span>
        </div>
        <div class="modal-body">
          <p>确定要转接人工客服吗？</p>
          <p class="modal-hint">当前在线客服 3 人，预计等待时间约 2 分钟</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="$emit('cancel')">取消</button>
          <button class="btn-confirm" @click="$emit('confirm')">确认转接</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
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
  width: 320px;
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
    color: $brand-primary;
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
