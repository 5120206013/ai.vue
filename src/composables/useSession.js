/**
 * useSession — 会话管理
 */
import { useChatStore } from '../stores/chatStore.js'

export function useSession() {
  const store = useChatStore()

  return {
    sessionId: store.sessionId,
    clearMessages: store.clearMessages,
    hasRated: store.hasRated,
  }
}
