/**
 * useSession — 会话管理
 */
import { useChatStore } from '../stores/chatStore.js'

export function useSession() {
  const store = useChatStore()

  return {
    sessionId: store.sessionId,
    hasRated: store.hasRated,
    newChat: store.newChat,
    clearSession: store.clearServerSession,
  }
}
