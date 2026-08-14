<template>
  <div class="message-item" :class="[`role-${message.role}`, { streaming: isStreaming }]">
    <!-- AI 头像（仅 AI 消息） -->
    <div v-if="message.role === 'assistant'" class="msg-avatar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </div>

    <!-- 系统消息 -->
    <div v-if="message.role === 'system'" class="msg-system">
      {{ message.content }}
    </div>

    <!-- 用户 / AI 消息 -->
    <div v-else class="msg-body">
      <div v-if="message.role === 'assistant'" class="msg-text assistant-text" v-html="renderContent(message.content, message.isHtml)"></div>
      <div v-else class="msg-bubble">
        <span class="msg-text" v-html="renderContent(message.content, message.isHtml)"></span>
      </div>
      <!-- 流式光标 -->
      <span v-if="isStreaming && message.role === 'assistant'" class="streaming-cursor">|</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: { type: Object, required: true },
  isStreaming: { type: Boolean, default: false },
})

/**
 * 内容渲染：处理换行和链接，支持 isHtml 标记跳过转义
 */
function renderContent(content, isHtml) {
  if (!content) return ''
  // NL2SQL 等已格式化 HTML 直接返回
  if (isHtml) return content
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>'
    )
}
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.message-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 20px;

  &.role-user {
    justify-content: flex-end;
  }

  &.role-system {
    justify-content: center;
    margin-bottom: 12px;
  }
}

.msg-avatar {
  width: $avatar-size;
  height: $avatar-size;
  border-radius: 10px;
  background: linear-gradient(135deg, $brand-primary, $brand-primary-dark);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg { width: 18px; height: 18px; }
}

.msg-body {
  max-width: calc(100% - 60px);
  min-width: 0;
}

.msg-system {
  text-align: center;
  font-size: 12px;
  color: $text-hint;
  padding: 5px 14px;
  background: $gray-100;
  border-radius: 20px;
  display: inline-block;
}

// AI 回复：无气泡，纯文本
.assistant-text {
  font-size: 15px;
  line-height: 1.75;
  color: $text-primary;
  word-break: break-word;
  padding-top: 4px;
}

// 用户消息：品牌蓝气泡
.msg-bubble {
  padding: 10px 16px;
  border-radius: 16px;
  background: $brand-primary;
  color: white;
  border-top-right-radius: 4px;
  display: inline-block;

  .msg-text {
    font-size: 15px;
    line-height: 1.6;
    word-break: break-word;
  }
}

.msg-text {
  :deep(a) {
    color: inherit;
    text-decoration: underline;
  }
}

.streaming-cursor {
  display: inline;
  animation: blink 0.8s infinite;
  font-weight: 300;
  color: $brand-primary;
  margin-left: 2px;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>
