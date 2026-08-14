<template>
  <aside class="sidebar" :class="{ collapsed }">
    <!-- 品牌区 -->
    <div class="sidebar-brand">
      <div class="brand-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <div class="brand-text">
        <span class="brand-name">拉卡拉智能客服</span>
        <span class="brand-sub">企业级 AI 助手</span>
      </div>
      <button class="sidebar-collapse" title="收起侧边栏" @click="$emit('collapse')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
      </button>
    </div>

    <!-- 新建对话 -->
    <button class="new-chat-btn" @click="$emit('newChat')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span>新建对话</span>
    </button>

    <!-- 会话列表 -->
    <div class="session-list">
      <div v-if="sessions.length === 0" class="session-empty">暂无历史对话</div>
      <div
        v-for="s in sessions"
        :key="s.sessionId"
        class="session-item"
        :class="{ active: s.sessionId === activeId }"
        @click="$emit('switch', s.sessionId)"
      >
        <div class="session-main">
          <span class="session-title" :title="s.title">{{ s.title }}</span>
          <span class="session-time">{{ formatTime(s.updatedAt) }}</span>
        </div>
        <button
          class="session-delete"
          title="删除此对话"
          @click.stop="$emit('delete', s.sessionId)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 底部用户区 -->
    <div class="sidebar-footer">
      <div class="user-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <div class="user-info">
        <span class="user-name">商户用户</span>
        <span class="user-role">企业版</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  sessions: { type: Array, default: () => [] },
  activeId: { type: String, default: '' },
  collapsed: { type: Boolean, default: false },
})

defineEmits(['newChat', 'switch', 'delete', 'collapse'])

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60_000) return '刚刚'
  if (diff < 3600_000) return Math.floor(diff / 60_000) + '分钟前'
  if (diff < 86400_000) return Math.floor(diff / 3600_000) + '小时前'
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.sidebar {
  width: $sidebar-width;
  height: 100%;
  background: $gray-50;
  border-right: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width $transition-normal, margin-left $transition-normal;
  overflow: hidden;

  &.collapsed {
    width: 0;
    border-right: none;
  }
}

.sidebar-brand {
  height: $topbar-height;
  padding: 0 12px 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.brand-logo {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, $brand-primary, $brand-primary-dark);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg { width: 18px; height: 18px; }
}

.brand-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.2;

  .brand-name {
    font-size: 14px;
    font-weight: 700;
    color: $text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .brand-sub {
    font-size: 11px;
    color: $text-hint;
    margin-top: 1px;
  }
}

.sidebar-collapse {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  border-radius: $radius-sm;
  color: $text-hint;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all $transition-fast;

  svg { width: 16px; height: 16px; }
  &:hover { background: $gray-100; color: $text-secondary; }
}

.new-chat-btn {
  margin: 4px 12px 12px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: $radius-md;
  background: $brand-primary;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background $transition-fast;
  flex-shrink: 0;

  svg { width: 16px; height: 16px; }

  &:hover { background: $brand-primary-dark; }
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
}

.session-empty {
  padding: 24px 12px;
  text-align: center;
  font-size: 13px;
  color: $text-hint;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: $radius-sm;
  cursor: pointer;
  transition: background $transition-fast;

  &:hover { background: $gray-100; }

  &.active {
    background: $brand-primary-light;
    .session-title { color: $brand-primary; font-weight: 600; }
  }
}

.session-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.session-title {
  font-size: 13px;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-time {
  font-size: 11px;
  color: $text-hint;
}

.session-delete {
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: $gray-300;
  flex-shrink: 0;
  opacity: 0;
  transition: all $transition-fast;

  svg { width: 13px; height: 13px; }

  .session-item:hover & { opacity: 1; }
  &:hover { background: $brand-danger; color: white; }
}

.sidebar-footer {
  height: 60px;
  padding: 0 16px;
  border-top: 1px solid $border-color;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: $gray-200;
  color: $text-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg { width: 18px; height: 18px; }
}

.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;

  .user-name {
    font-size: 13px;
    font-weight: 600;
    color: $text-primary;
  }

  .user-role {
    font-size: 11px;
    color: $text-hint;
    margin-top: 1px;
  }
}
</style>
