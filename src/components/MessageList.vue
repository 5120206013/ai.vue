<template>
  <div class="message-list" ref="listRef">
    <div class="message-content">
      <!-- 欢迎态：尚无用户提问 -->
      <div v-if="isWelcome" class="welcome">
        <div class="welcome-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h1 class="welcome-title">{{ welcomeTitle }}</h1>
        <p class="welcome-subtitle">{{ welcomeSubtitle }}</p>
        <QuickQuestions
          :questions="emptyQuestions"
          :disabled="isStreaming"
          :label="welcomeLabel"
          @select="$emit('quick', $event)"
        />
      </div>

      <!-- 消息流 -->
      <template v-else>
        <MessageItem
          v-for="(msg, index) in messages"
          :key="msg.timestamp + '-' + index"
          :message="msg"
          :is-streaming="msg === messages[messages.length - 1] && isStreaming && msg.role === 'assistant'"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import MessageItem from './MessageItem.vue'
import QuickQuestions from './QuickQuestions.vue'

const props = defineProps({
  messages: { type: Array, default: () => [] },
  isStreaming: { type: Boolean, default: false },
  emptyQuestions: { type: Array, default: () => [] },
  welcomeTitle: { type: String, default: '您好，我是拉卡拉智能客服' },
  welcomeSubtitle: {
    type: String,
    default: '我可以帮您解答业务问题、查询交易记录、转接人工客服，或进行内部数据查询。',
  },
  welcomeLabel: { type: String, default: '你可以这样问' },
})

defineEmits(['quick'])

const listRef = ref(null)

// 欢迎态：尚未出现任何用户消息
const isWelcome = computed(() => !props.messages.some(m => m.role === 'user'))

function scrollToBottom(smooth = false) {
  nextTick(() => {
    if (listRef.value) {
      listRef.value.scrollTo({
        top: listRef.value.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant',
      })
    }
  })
}

watch(
  () => props.messages.length,
  () => scrollToBottom(true)
)

watch(
  () => {
    const last = props.messages[props.messages.length - 1]
    return last?.content?.length || 0
  },
  () => scrollToBottom(false)
)

onMounted(() => scrollToBottom())
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.message-list {
  flex: 1;
  overflow-y: auto;
  background: $bg-white;
}

.message-content {
  max-width: $content-max-width;
  margin: 0 auto;
  padding: 24px;
}

// ========== 欢迎态 ==========
.welcome {
  min-height: calc(100vh - #{$topbar-height} - 140px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-bottom: 24px;
}

.welcome-logo {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: linear-gradient(135deg, $brand-primary, $brand-primary-dark);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba($brand-primary, 0.3);

  svg { width: 32px; height: 32px; }
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 10px;
}

.welcome-subtitle {
  font-size: 14px;
  color: $text-secondary;
  max-width: 480px;
  line-height: 1.7;
  margin-bottom: 28px;
}

// ========== 消息流 ==========
</style>
