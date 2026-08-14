<template>
  <Teleport to="body">
    <div class="more-overlay" @click="$emit('close')">
      <div class="more-menu" @click.stop>
        <button class="more-item" @click="emit('rating'); emit('close')" :disabled="hasRated">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>评价客服</span>
        </button>

        <button class="more-item" @click="emit('transfer'); emit('close')" :disabled="isTransferring">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1711 21v-2a4 411 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>转人工客服</span>
        </button>

        <div class="more-divider"></div>

        <button class="more-item" @click="emit('refreshHistory'); emit('close')" :disabled="!sessionId">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>刷新历史</span>
        </button>

        <button class="more-item danger" @click="emit('clearSession'); emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span>清除当前会话</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  hasRated: { type: Boolean, default: false },
  isTransferring: { type: Boolean, default: false },
  sessionId: { type: String, default: '' },
})

const emit = defineEmits(['close', 'rating', 'transfer', 'refreshHistory', 'clearSession'])
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.more-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
}

.more-menu {
  position: fixed;
  top: 64px;
  right: 16px;
  width: 200px;
  background: white;
  border-radius: $radius-md;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid $border-color;
  padding: 6px;
  animation: fadeScale 0.15s ease;
}

.more-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border: none;
  background: transparent;
  border-radius: $radius-sm;
  font-size: 13px;
  color: $text-primary;  
  cursor: pointer;
  transition: background $transition-fast;
  font-family: inherit;

  svg { width: 16px; height: 16px; color: $text-secondary; }

  &:hover:not(:disabled) { background: $gray-50; }
  &:disabled { opacity: 0.35; cursor: not-allowed; }

  &.danger {
    color: $brand-danger;
    svg { color: $brand-danger; }
  }
}

.more-divider {
  height: 1px;
  background: $border-color;
  margin: 4px 8px;
}

@keyframes fadeScale {
  from { opacity: 0; transform: scale(0.9) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
