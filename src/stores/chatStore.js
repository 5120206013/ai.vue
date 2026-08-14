import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sendChatMessage, listSessions, getSessionHistory, clearSession, submitRating, requestHumanService, analyzeDatabase, queryNl2sql } from '../api/chat.js'

export const useChatStore = defineStore('chat', () => {
  // ========== 状态 ==========
  const messages = ref([])
  const sessionId = ref('')
  const isStreaming = ref(false)
  const showTransfer = ref(false)
  const showRating = ref(false)
  const isTransferring = ref(false)
  const hasRated = ref(false)
  const isInternalDataMode = ref(false)
  const showRagPanel = ref(false)

  let abortController = null

  // ========== 会话列表（来自后端） ==========
  const sessions = ref([])

  /** 从后端拉取会话列表 */
  async function refreshSessions() {
    const list = await listSessions()
    if (list.length > 0) {
      sessions.value = list.map(s => ({
        sessionId: s.sessionId,
        title: s.title || '未命名对话',
        createdAt: s.createdAt,
      })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }
  }

  /** 删除会话（调后端清除 + 刷新列表） */
  async function removeSession(sid) {
    await clearSession(sid)
    if (sid === sessionId.value) {
      sessionId.value = ''
      messages.value = []
      persist()
    }
    await refreshSessions()
  }

  /** 当前会话标题 */
  const currentTitle = computed(() => {
    const s = sessions.value.find(s => s.sessionId === sessionId.value)
    return s ? s.title : '新对话'
  })

  // ========== 初始化 ==========
  async function init() {
    // 1. 从后端拉取会话列表
    await refreshSessions()

    // 2. 恢复上次的 sessionId 和消息（localStorage）
    const saved = localStorage.getItem('lakala_cs_session')
    let savedSessionId = ''
    let savedMessages = []

    if (saved) {
      try {
        const data = JSON.parse(saved)
        savedSessionId = data.sessionId || ''
        savedMessages = data.messages || []
        hasRated.value = data.hasRated || false
      } catch { /* ignore */ }
    }

    // 3. 有 sessionId 则拉取服务端历史
    if (savedSessionId) {
      sessionId.value = savedSessionId
      const history = await getSessionHistory(savedSessionId)
      if (history.length > 0) {
        messages.value = history.map(m => ({
          role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
          content: m.content || m.reply || '',
          timestamp: m.timestamp || Date.now(),
        }))
        persist()
        return
      }
    }

    // 4. 如果没有后端历史但有本地缓存，恢复本地消息
    if (savedMessages.length > 0) {
      messages.value = savedMessages
    } else {
      messages.value = []
    }

    // 5. 如果后端有会话但没有恢复出 sessionId，用最近的一个
    if (!sessionId.value && sessions.value.length > 0) {
      // 不自动切换，保持欢迎页
    }
  }

  // ========== 持久化（当前会话消息） ==========
  function persist() {
    localStorage.setItem(
      'lakala_cs_session',
      JSON.stringify({
        sessionId: sessionId.value,
        messages: messages.value.slice(-50),
        hasRated: hasRated.value,
      })
    )
  }

  // ========== 消息操作 ==========
  function addMessage(message) {
    messages.value.push({
      ...message,
      timestamp: message.timestamp || Date.now(),
    })
    persist()
  }

  // ========== 发送消息 ==========
  async function sendMessage(content) {
    if (!content.trim() || isStreaming.value) return

    const isFirstInSession = messages.value.length === 0
    addMessage({ role: 'user', content: content.trim() })

    abortController = new AbortController()
    const aiMsg = { role: 'assistant', content: '', timestamp: Date.now() }
    addMessage(aiMsg)
    isStreaming.value = true

    try {
      // 内部数据模式：路由到 NL2SQL 接口
      if (isInternalDataMode.value) {
        const query = content.trim()

        // 显式命令前缀区分：/分析 或 /analyze → 数据库结构分析；否则 → 数据查询
        const analyzeMatch = query.match(/^\/(分析|analyze)\s*/i)
        const isAnalyzeQuery = !!analyzeMatch
        const actualQuery = isAnalyzeQuery ? query.slice(analyzeMatch[0].length).trim() || query : query

        const { reply } = isAnalyzeQuery
          ? await analyzeDatabase(actualQuery)
          : await queryNl2sql(actualQuery)

        const last = messages.value[messages.value.length - 1]
        if (last && last.role === 'assistant') {
          last.content = reply || '抱歉，未查询到相关数据。'
          last.isHtml = !isAnalyzeQuery  // 查询结果含 HTML 表格，分析结果不含
        }
      } else {
        // 普通客服模式
        const { reply, sessionId: backendId } = await sendChatMessage(
          content.trim(),
          sessionId.value || '',
          { signal: abortController.signal }
        )

        if (backendId) {
          sessionId.value = backendId
        }

        // 新会话 — 刷新会话列表以展示在后端
        if (isFirstInSession || !sessionId.value) {
          await refreshSessions()
        }

        const last = messages.value[messages.value.length - 1]
        if (last && last.role === 'assistant') {
          last.content = reply || '抱歉，我暂时无法回答这个问题。'
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        const last = messages.value[messages.value.length - 1]
        if (last && last.role === 'assistant' && !last.content) {
          last.content = '(已取消)'
        }
      } else {
        const last = messages.value[messages.value.length - 1]
        if (last && last.role === 'assistant') {
          last.content = '抱歉，网络出现问题，请稍后重试。'
        }
        console.error('发送消息失败:', err)
      }
    } finally {
      isStreaming.value = false
      abortController = null
      persist()
    }
  }

  function cancelMessage() {
    if (abortController) abortController.abort()
  }

  function sendQuickQuestion(question) {
    sendMessage(question)
  }

  // ========== 转人工 ==========
  function toggleTransfer() {
    showTransfer.value = !showTransfer.value
  }

  async function confirmTransfer() {
    showTransfer.value = false
    isTransferring.value = true
    addMessage({ role: 'system', content: '正在为您转接人工客服，请稍候...' })
    try {
      await requestHumanService(sessionId.value)
      addMessage({ role: 'system', content: '已成功转接人工客服，客服将尽快为您服务。' })
    } catch {
      addMessage({ role: 'system', content: '当前人工客服繁忙，请稍后再试或先咨询智能客服。' })
    } finally {
      isTransferring.value = false
      persist()
    }
  }

  // ========== 评价 ==========
  function toggleRating() {
    showRating.value = !showRating.value
  }

  async function confirmRating(rating, comment) {
    showRating.value = false
    hasRated.value = true
    try {
      await submitRating(sessionId.value, rating, comment)
      addMessage({ role: 'system', content: '感谢您的评价！我们会继续努力提供更好的服务。' })
    } catch {
      console.error('提交评价失败')
    }
    persist()
  }

  // ========== 切换会话 ==========
  async function switchSession(sid) {
    persist()
    sessionId.value = sid
    hasRated.value = false

    const history = await getSessionHistory(sid)
    if (history.length > 0) {
      messages.value = history.map(m => ({
        role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
        content: m.content || m.reply || '',
        timestamp: m.timestamp || Date.now(),
      }))
    } else {
      messages.value = []
    }
    persist()
  }

  // ========== 刷新当前会话历史 ==========
  async function refreshHistory() {
    if (!sessionId.value) return
    await refreshSessions()
    const history = await getSessionHistory(sessionId.value)
    if (history.length > 0) {
      messages.value = history.map(m => ({
        role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
        content: m.content || m.reply || '',
        timestamp: m.timestamp || Date.now(),
      }))
      persist()
    }
  }

  // ========== 清除当前会话 ==========
  async function clearServerSession() {
    if (sessionId.value) {
      await clearSession(sessionId.value)
      await refreshSessions()
    }
    sessionId.value = ''
    messages.value = []
    hasRated.value = false
    persist()
  }

  // ========== 新建对话 ==========
  function newChat() {
    persist()
    sessionId.value = ''
    messages.value = []
    hasRated.value = false
    persist()
  }

  /** 切换内部数据查询模式 */
  function toggleInternalDataMode() {
    isInternalDataMode.value = !isInternalDataMode.value
    if (isInternalDataMode.value) {
      addMessage({ role: 'system', content: '已切换到内部数据查询模式。直接输入问题即可查询数据；输入 /分析 开头可查看数据库表结构与字段信息。' })
    } else {
      addMessage({ role: 'system', content: '已退出内部数据查询模式，回到智能客服模式。' })
    }
  }

  /** 切换知识库管理面板 */
  function toggleRagPanel() {
    showRagPanel.value = !showRagPanel.value
  }

  return {
    messages, sessionId, isStreaming,
    showTransfer, showRating, isTransferring,
    hasRated, isInternalDataMode,
    sessions, currentTitle,
    init,
    sendMessage, cancelMessage, sendQuickQuestion,
    toggleTransfer, confirmTransfer,
    toggleRating, confirmRating,
    switchSession, refreshHistory, clearServerSession, newChat,
    removeSession, refreshSessions,
    toggleInternalDataMode,
    showRagPanel, toggleRagPanel,
  }
})
