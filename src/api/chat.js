/**
 * 拉卡拉智能客服 API 封装
 *
 * 后端接口（统一 POST）：
 *   POST /api/chat                       发送消息
 *   POST /api/chat/sessions              获取所有会话列表
 *   POST /api/chat/{sessionId}/history   获取历史
 *   POST /api/chat/{sessionId}/clear     清除会话
 */

const API_BASE = '/api'
/**
 * 发送聊天消息
 * POST /api/chat
 * Body: { message, sessionId? }
 * Returns: { reply, sessionId, responseTimeMs }
 */
export async function sendChatMessage(message, sessionId, options = {}) {
  const { signal } = options

  const body = { message }
  if (sessionId) body.sessionId = sessionId

  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    const err = await response.text().catch(() => '')
    console.error('发送消息失败:', response.status, err)
    throw new Error(`API 请求失败 (${response.status})`)
  }

  const data = await response.json()
  return {
    reply: data.reply || '',
    sessionId: data.sessionId || '',
  }
}

/**
 * 获取所有活跃会话列表
 * POST /api/chat/sessions
 * Returns: [{ sessionId, title, createdAt, ... }]
 */
export async function listSessions() {
  const response = await fetch(`${API_BASE}/chat/sessions`, {
    method: 'POST',
  })

  if (!response.ok) {
    console.error('获取会话列表失败:', response.status)
    return []
  }

  const data = await response.json()
  return Array.isArray(data) ? data : []
}

/**
 * 获取会话历史
 * POST /api/chat/{sessionId}/history
 * 后端返回纯文本格式：
 *   [USER]: 用户消息
 *   [ASSISTANT]: AI回复
 */
export async function getSessionHistory(sessionId) {
  if (!sessionId) return []

  const response = await fetch(`${API_BASE}/chat/${sessionId}/history`, {
    method: 'POST',
  })

  if (!response.ok) {
    console.error('获取历史失败:', response.status)
    return []
  }

  const text = await response.text()
  if (!text.trim()) return []

  // 纯文本格式：逐行解析 [USER]: / [ASSISTANT]:
  const lines = text.split('\n')
  const result = []
  let currentRole = null
  let currentContent = []

  for (const line of lines) {
    const userMatch = line.match(/^\[USER\]:?\s*(.*)/i)
    const assistantMatch = line.match(/^\[ASSISTANT\]:?\s*(.*)/i)
    const systemMatch = line.match(/^\[SYSTEM\]:?\s*(.*)/i)

    if (userMatch || assistantMatch || systemMatch) {
      // 保存上一段
      if (currentRole && currentContent.length > 0) {
        result.push({
          role: currentRole,
          content: currentContent.join('\n').trim(),
          timestamp: Date.now() - (result.length + 1) * 1000,
        })
      }

      if (userMatch) {
        currentRole = 'user'
        currentContent = userMatch[1] ? [userMatch[1]] : []
      } else if (assistantMatch) {
        currentRole = 'assistant'
        currentContent = assistantMatch[1] ? [assistantMatch[1]] : []
      } else {
        currentRole = 'system'
        currentContent = systemMatch[1] ? [systemMatch[1]] : []
      }
    } else {
      // 续行
      if (currentRole && line.trim()) {
        currentContent.push(line.trim())
      }
    }
  }

  // 最后一段
  if (currentRole && currentContent.length > 0) {
    result.push({
      role: currentRole,
      content: currentContent.join('\n').trim(),
      timestamp: Date.now() - result.length * 1000,
    })
  }

  // 如果正则没匹配到任何内容，把整段当作 conversation 退回空数组
  return result.length > 0 ? result : []
}

/**
 * 清除服务端会话
 * POST /api/chat/{sessionId}/clear
 */
export async function clearSession(sessionId) {
  if (!sessionId) return

  const response = await fetch(`${API_BASE}/chat/${sessionId}/clear`, {
    method: 'POST',
  })

  if (!response.ok) {
    console.error('清除会话失败:', response.status)
  }
}

/**
 * 提交满意度评价
 */
export async function submitRating(sessionId, rating, comment = '') {
  const response = await fetch(`${API_BASE}/rating`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, rating, comment }),
  })
  return response.json()
}

/**
 * 请求转人工客服
 */
export async function requestHumanService(sessionId) {
  const response = await fetch(`${API_BASE}/transfer-human`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  })
  return response.json()
}

// ============================================================
//  内部数据查询（NL2SQL）
// ============================================================

/**
 * 分析数据库表结构与关系
 * POST /api/nl2sql/analyze
 * Body: { question }
 * Response: { sessionId, analysis, responseTimeMs }
 */
export async function analyzeDatabase(question = '') {
  const body = {}
  if (question) body.question = question

  const response = await fetch(`${API_BASE}/nl2sql/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.text().catch(() => '')
    console.error('数据库分析失败:', response.status, err)
    throw new Error(`数据库分析请求失败 (${response.status})`)
  }

  const data = await response.json()
  return {
    reply: data.analysis || data.reply || data.result || '',
    sessionId: data.sessionId || '',
  }
}

/**
 * NL2SQL 自然语言查询数据库
 * POST /api/nl2sql
 * Body: { question }
 * Response: { sessionId, generatedSql, columns, rows, rowCount, explanation, responseTimeMs }
 */
export async function queryNl2sql(question) {
  const response = await fetch(`${API_BASE}/nl2sql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })

  if (!response.ok) {
    const err = await response.text().catch(() => '')
    console.error('NL2SQL 查询失败:', response.status, err)
    throw new Error(`数据查询失败 (${response.status})`)
  }

  const data = await response.json()
  return {
    reply: formatQueryResult(data),
    sessionId: data.sessionId || '',
  }
}

/**
 * 将 NL2SQL 查询结果格式化为 HTML 表格
 */
function formatQueryResult(data) {
  if (typeof data === 'string') return data
  // 兼容纯文本响应
  const reply = data.analysis || data.reply || data.result
  if (reply && !data.columns) return reply

  if (!data.columns || !data.columns.length) {
    return data.explanation || data.analysis || JSON.stringify(data)
  }

  let html = ''

  // 数据表格
  html += `<div class="nl2sql-table-wrap">
    <table class="nl2sql-table">
      <thead><tr>${data.columns.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>
      <tbody>${(data.rows || []).map(row =>
        `<tr>${data.columns.map(c => `<td>${escapeHtml(String(row[c] ?? ''))}</td>`).join('')}</tr>`
      ).join('')}</tbody>
    </table>
  </div>`

  // 附带行数
  html += `<div class="nl2sql-row-count">共 ${data.rowCount ?? data.rows?.length ?? 0} 条</div>`

  return html
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// ============================================================
//  RAG 知识库文档管理
// ============================================================

/**
 * 上传 PDF/Markdown 文档到知识库
 * POST /api/rag/documents/upload (multipart/form-data)
 * Returns: { fileName, fileSize, indexed, chunkCount, message, timestamp }
 */
export async function uploadRagDocument(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/rag/documents/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const err = await response.text().catch(() => '')
    console.error('文档上传失败:', response.status, err)
    throw new Error(`文档上传失败 (${response.status})`)
  }

  return response.json()
}

/**
 * 获取知识库已索引文档列表
 * POST /api/rag/documents/list
 * Returns: [{ id, fileName, fileSize, indexedAt, chunkCount, ... }]
 */
export async function listRagDocuments() {
  const response = await fetch(`${API_BASE}/rag/documents/list`, {
    method: 'POST',
  })

  if (!response.ok) {
    console.error('获取文档列表失败:', response.status)
    return []
  }

  const data = await response.json()
  return Array.isArray(data) ? data : []
}

/**
 * 删除知识库中的指定文档
 * DELETE /api/rag/documents/{id}
 * Returns: { success, message }
 */
export async function deleteRagDocument(documentId) {
  const response = await fetch(`${API_BASE}/rag/documents/${encodeURIComponent(documentId)}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const err = await response.text().catch(() => '')
    console.error('删除文档失败:', response.status, err)
    throw new Error(`删除文档失败 (${response.status})`)
  }

  return response.json()
}

/**
 * 重新索引知识库中的所有文档
 * POST /api/rag/reindex
 * Returns: { success, total, indexed, failed, details }
 */
export async function reindexRagDocuments() {
  const response = await fetch(`${API_BASE}/rag/reindex`, {
    method: 'POST',
  })

  if (!response.ok) {
    const err = await response.text().catch(() => '')
    console.error('重索引失败:', response.status, err)
    throw new Error(`重索引请求失败 (${response.status})`)
  }

  return response.json()
}
