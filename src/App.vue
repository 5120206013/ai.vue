<template>
  <div class="app-shell">
    <!-- 侧边栏 -->
    <Sidebar
      :sessions="store.sessions"
      :active-id="store.sessionId"
      :collapsed="sidebarCollapsed"
      @new-chat="onNewChat"
      @switch="store.switchSession"
      @delete="store.removeSession"
      @collapse="sidebarCollapsed = true"
    />

    <!-- 主区域 -->
    <main class="main-area">
      <ChatHeader
        :title="store.isInternalDataMode ? '内部数据查询' : store.currentTitle"
        :is-transferring="store.isTransferring"
        :is-internal-data-mode="store.isInternalDataMode"
        :show-rag="store.showRagPanel"
        @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
        @toggle-internal-data="store.toggleInternalDataMode"
        @toggle-rag="store.toggleRagPanel"
        @toggle-more="showMore = !showMore"
      />

      <MessageList
        :messages="store.messages"
        :is-streaming="store.isStreaming"
        :empty-questions="quickQuestions"
        :welcome-title="welcomeTitle"
        :welcome-subtitle="welcomeSubtitle"
        :welcome-label="welcomeLabel"
        @quick="store.sendQuickQuestion"
      />

      <ChatInput
        :disabled="store.isStreaming || store.isTransferring"
        :is-streaming="store.isStreaming"
        :placeholder="store.isInternalDataMode ? '输入数据查询问题，如：查询所有用户...' : '输入您的问题...'"
        @send="store.sendMessage"
        @cancel="store.cancelMessage"
      />
    </main>

    <!-- 更多菜单 -->
    <MoreMenu
      v-if="showMore"
      :has-rated="store.hasRated"
      :is-transferring="store.isTransferring"
      :session-id="store.sessionId"
      @close="showMore = false"
      @rating="store.toggleRating"
      @transfer="store.toggleTransfer"
      @refresh-history="store.refreshHistory"
      @clear-session="store.clearServerSession"
    />

    <!-- 转人工弹窗 -->
    <TransferConfirm
      v-if="store.showTransfer"
      @confirm="store.confirmTransfer"
      @cancel="store.toggleTransfer"
    />

    <!-- 满意度评价弹窗 -->
    <StarRating
      v-if="store.showRating"
      @submit="store.confirmRating"
      @cancel="store.toggleRating"
    />

    <!-- 知识库管理面板 -->
    <RagDocumentPanel
      v-if="store.showRagPanel"
      @close="store.showRagPanel = false"
    />

    <!-- 新建对话二次确认 -->
    <ConfirmDialog
      v-if="store.showNewChatConfirm"
      title="新建对话"
      message="当前回复尚未完成，新建对话将中断本次回复，确定继续吗？"
      hint="之前的对话会保留在左侧会话列表中。"
      confirm-text="新建对话"
      cancel-text="取消"
      danger
      @confirm="store.confirmNewChat"
      @cancel="store.cancelNewChat"
    />

    <!-- 全局轻提示 -->
    <Transition name="toast">
      <div v-if="store.toast" class="toast">{{ store.toast }}</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useChatStore } from './stores/chatStore.js'
import Sidebar from './components/Sidebar.vue'
import ChatHeader from './components/ChatHeader.vue'
import MessageList from './components/MessageList.vue'
import ChatInput from './components/ChatInput.vue'
import MoreMenu from './components/MoreMenu.vue'
import TransferConfirm from './components/TransferConfirm.vue'
import StarRating from './components/StarRating.vue'
import RagDocumentPanel from './components/RagDocumentPanel.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'

const store = useChatStore()
const showMore = ref(false)
const sidebarCollapsed = ref(false)

function onNewChat() {
  showMore.value = false
  store.newChat()
}

// 客服模式快捷问题
const defaultQuestions = [
  '如何查询交易记录？',
  '手续费是多少？',
  '如何联系人工客服？',
  '退款需要多长时间？',
]

// 内部数据查询快捷问题（/分析 前缀走数据库分析接口，否则走数据查询接口）
const internalDataQuestions = [
  '/分析 数据库表结构',
  '/分析 有哪些数据表和字段？',
  '查询所有商户信息',
  '统计今日交易笔数',
]

const quickQuestions = computed(() =>
  store.isInternalDataMode ? internalDataQuestions : defaultQuestions
)

const welcomeTitle = computed(() =>
  store.isInternalDataMode ? '内部数据查询助手' : '您好，我是拉卡拉智能客服'
)

const welcomeSubtitle = computed(() =>
  store.isInternalDataMode
    ? '输入自然语言查询数据库，或使用 /分析 查看表结构与字段信息。'
    : '我可以帮您解答业务问题、查询交易记录、转接人工客服，或进行内部数据查询。'
)

const welcomeLabel = computed(() =>
  store.isInternalDataMode ? '你可以这样查询' : '你可以这样问'
)

onMounted(() => {
  store.init()
})
</script>

<style lang="scss" scoped>
@use './styles/variables' as *;

.app-shell {
  display: flex;
  width: 100%;
  height: 100%;
  background: $bg-white;
}

.main-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: $bg-white;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 96px;
  transform: translateX(-50%);
  background: rgba(30, 41, 59, 0.9);
  color: #fff;
  font-size: 13px;
  padding: 10px 18px;
  border-radius: 20px;
  z-index: 10001;
  pointer-events: none;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}
</style>
