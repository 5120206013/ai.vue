/**
 * useChat — 聊天核心逻辑组合式函数
 * 包装 Pinia store，为组件提供更便捷的接口
 */
import { useChatStore } from '../stores/chatStore.js'

export function useChat() {
  const store = useChatStore()

  return {
    // 状态
    messages: store.messages,
    isStreaming: store.isStreaming,
    isTransferring: store.isTransferring,

    // 操作
    send: store.sendMessage,
    cancel: store.cancelMessage,
    sendQuestion: store.sendQuickQuestion,
  }
}
