<template>
  <header class="chat-header" :class="{ 'mode-internal': isInternalDataMode }">
    <div class="header-left">
      <button class="icon-btn" title="展开侧边栏" @click="$emit('toggleSidebar')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div class="header-title-wrap">
        <span class="header-title">{{ title }}</span>
        <span class="header-status">
          <span class="status-dot" :class="{ online: !isTransferring, internal: isInternalDataMode }"></span>
          {{ isTransferring ? '转接中...' : (isInternalDataMode ? '数据查询' : '在线') }}
        </span>
      </div>
    </div>

    <div class="header-actions">
      <!-- 模式切换 -->
      <button
        class="chip-btn"
        :class="{ active: isInternalDataMode }"
        title="内部数据查询"
        @click="$emit('toggleInternalData')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
        <span>内部数据</span>
      </button>

      <!-- 知识库 -->
      <button
        class="chip-btn"
        :class="{ active: showRag }"
        title="知识库管理"
        @click="$emit('toggleRag')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span>知识库</span>
      </button>

      <!-- 更多 -->
      <button
        class="icon-btn"
        title="更多"
        @click="$emit('toggleMore')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, default: '新对话' },
  isTransferring: { type: Boolean, default: false },
  isInternalDataMode: { type: Boolean, default: false },
  showRag: { type: Boolean, default: false },
})

defineEmits(['toggleSidebar', 'toggleInternalData', 'toggleRag', 'toggleMore'])
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.chat-header {
  height: $topbar-height;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $bg-white;
  border-bottom: 1px solid $border-color;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.header-title-wrap {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.2;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 240px;
}

.header-status {
  font-size: 11px;
  color: $text-hint;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 1px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ccc;

  &.online {
    background: $brand-success;
    box-shadow: 0 0 0 2px rgba($brand-success, 0.3);
  }

  &.internal {
    background: #f9ca24;
    box-shadow: 0 0 0 2px rgba(249, 202, 36, 0.4);
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: $text-secondary;
  border-radius: $radius-sm;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-fast;

  svg { width: 18px; height: 18px; }

  &:hover {
    background: $gray-100;
    color: $text-primary;
  }
}

.chip-btn {
  height: 36px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid $border-color;
  background: $bg-white;
  color: $text-secondary;
  border-radius: $radius-md;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-fast;
  font-family: inherit;

  svg { width: 15px; height: 15px; }

  &:hover {
    border-color: $brand-primary;
    color: $brand-primary;
    background: $brand-primary-light;
  }

  &.active {
    background: $brand-primary;
    border-color: $brand-primary;
    color: white;
  }
}
</style>
