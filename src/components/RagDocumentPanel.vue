<template>
  <Teleport to="body">
    <div class="rag-overlay" @click.self="$emit('close')">
      <div class="rag-panel" @click.stop>
        <!-- 头部 -->
        <div class="rag-header">
          <div class="rag-header-left">
            <svg class="rag-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <div>
              <span class="rag-header-title">知识库管理</span>
              <span class="rag-header-subtitle">上传内部文档以增强 AI 答复</span>
            </div>
          </div>
          <button class="rag-close-btn" @click="$emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- 上传区域 -->
        <div
          class="rag-upload-zone"
          :class="{ dragging, uploading }"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input
            ref="fileInput"
            type="file"
            accept=".pdf,.md,.markdown"
            class="rag-file-input"
            @change="handleFileChange"
          />
          <svg class="rag-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <template v-if="!uploading">
            <p class="rag-upload-text">拖拽文件到此处，或<span class="rag-upload-link">点击上传</span></p>
            <p class="rag-upload-hint">支持 PDF、Markdown（.md）文件</p>
          </template>
          <template v-else>
            <div class="rag-upload-spinner"></div>
            <p class="rag-upload-text">正在上传并索引...</p>
          </template>
        </div>

        <!-- 状态提示 -->
        <div v-if="statusMsg" class="rag-status" :class="`rag-status-${statusType}`">
          {{ statusMsg }}
        </div>

        <!-- 操作栏 -->
        <div class="rag-toolbar">
          <span class="rag-doc-count">共 {{ documents.length }} 个文档</span>
          <button
            class="rag-reindex-btn"
            :disabled="reindexing || documents.length === 0"
            @click="handleReindex"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <span>{{ reindexing ? '索引中...' : '重新索引' }}</span>
          </button>
        </div>

        <!-- 文档列表 -->
        <div class="rag-doc-list" v-if="documents.length > 0">
          <div
            v-for="doc in documents"
            :key="doc.id"
            class="rag-doc-item"
          >
            <div class="rag-doc-icon">
              <svg v-if="isPdf(doc.fileName)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div class="rag-doc-info">
              <span class="rag-doc-name" :title="doc.fileName">{{ doc.fileName }}</span>
              <span class="rag-doc-meta">
                {{ formatFileSize(doc.fileSize) }}
                <template v-if="doc.chunkCount != null"> · {{ doc.chunkCount }} 分段</template>
                <template v-if="doc.indexedAt"> · {{ formatDate(doc.indexedAt) }}</template>
              </span>
            </div>
            <button
              class="rag-doc-delete"
              :disabled="deletingId === doc.id"
              title="删除文档"
              @click="handleDelete(doc)"
            >
              <svg v-if="deletingId !== doc.id" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span v-else class="rag-deleting-spinner"></span>
            </button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="rag-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
          <p>暂无文档</p>
          <span>上传 PDF 或 Markdown 文件来构建知识库</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import {
  uploadRagDocument,
  listRagDocuments,
  deleteRagDocument,
  reindexRagDocuments,
} from '../api/chat.js'

const emit = defineEmits(['close', 'documentsChanged'])

// 文档列表
const documents = ref([])

// 上传状态
const fileInput = ref(null)
const dragging = ref(false)
const uploading = ref(false)

// 删除状态
const deletingId = ref(null)

// 重索引状态
const reindexing = ref(false)

// 状态提示
const statusMsg = ref('')
const statusType = ref('info') // 'info' | 'success' | 'error'

/** 触发表单文件选择 */
function triggerFileInput() {
  if (uploading.value) return
  fileInput.value?.click()
}

/** 处理文件选择 */
async function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  await uploadFile(file)
  // 重置 input 以支持重复上传同名文件
  if (fileInput.value) fileInput.value.value = ''
}

/** 处理拖拽上传 */
async function handleDrop(e) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  await uploadFile(file)
}

/** 上传文件并刷新列表 */
async function uploadFile(file) {
  // 校验文件类型
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['pdf', 'md', 'markdown'].includes(ext)) {
    showStatus('仅支持 PDF 和 Markdown（.md）文件', 'error')
    return
  }

  // 校验文件大小（限制 50MB）
  if (file.size > 50 * 1024 * 1024) {
    showStatus('文件大小不能超过 50MB', 'error')
    return
  }

  uploading.value = true
  clearStatus()
  try {
    const result = await uploadRagDocument(file)
    if (result.indexed) {
      showStatus(`"${result.fileName}" 上传并索引成功（${result.chunkCount ?? 0} 个分段）`, 'success')
    } else {
      showStatus(`"${file.name}" 上传成功但索引失败：${result.message || '未知错误'}`, 'error')
    }
    await refreshDocuments()
    emit('documentsChanged')
  } catch (err) {
    showStatus(err.message || '上传失败，请稍后重试', 'error')
  } finally {
    uploading.value = false
  }
}

/** 刷新文档列表 */
async function refreshDocuments() {
  try {
    documents.value = await listRagDocuments()
  } catch {
    // 静默处理
  }
}

/** 删除文档 */
async function handleDelete(doc) {
  if (deletingId.value) return
  deletingId.value = doc.id
  clearStatus()
  try {
    await deleteRagDocument(doc.id)
    showStatus(`"${doc.fileName}" 已删除`, 'success')
    await refreshDocuments()
    emit('documentsChanged')
  } catch (err) {
    showStatus(err.message || '删除失败', 'error')
  } finally {
    deletingId.value = null
  }
}

/** 重新索引全部文档 */
async function handleReindex() {
  if (reindexing.value) return
  reindexing.value = true
  clearStatus()
  try {
    const result = await reindexRagDocuments()
    showStatus(`重索引完成：${result.indexed} 成功 / ${result.failed} 失败（共 ${result.total} 个文档）`, result.failed > 0 ? 'error' : 'success')
    await refreshDocuments()
    emit('documentsChanged')
  } catch (err) {
    showStatus(err.message || '重索引失败', 'error')
  } finally {
    reindexing.value = false
  }
}

/** 显示状态提示 */
function showStatus(msg, type = 'info') {
  statusMsg.value = msg
  statusType.value = type
  // 3 秒后自动清除
  setTimeout(() => {
    if (statusMsg.value === msg) {
      statusMsg.value = ''
    }
  }, 4000)
}

function clearStatus() {
  statusMsg.value = ''
}

/** 是否 PDF 文件 */
function isPdf(fileName) {
  return fileName?.toLowerCase().endsWith('.pdf')
}

/** 格式化文件大小 */
function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

/** 格式化日期 */
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 初始化加载
refreshDocuments()

defineExpose({ refreshDocuments })
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

// ========== 遮罩 ==========
.rag-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ragFadeIn 0.2s ease;
}

// ========== 面板主体 ==========
.rag-panel {
  width: 480px;
  max-width: 90vw;
  max-height: 80vh;
  background: white;
  border-radius: $radius-lg;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ragScaleIn 0.2s ease;
}

// ========== 头部 ==========
.rag-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, $brand-primary, $brand-primary-dark);
  color: white;
  flex-shrink: 0;
}

.rag-header-left {
  display: flex;
  align-items: center;
  gap: 10px;

  .rag-header-icon {
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: $radius-sm;
    padding: 5px;
  }

  .rag-header-title {
    display: block;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
  }

  .rag-header-subtitle {
    display: block;
    font-size: 11px;
    opacity: 0.75;
  }
}

.rag-close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-radius: $radius-sm;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background $transition-fast;

  svg { width: 16px; height: 16px; }

  &:hover { background: rgba(255, 255, 255, 0.3); }
}

// ========== 上传区域 ==========
.rag-upload-zone {
  margin: 16px 20px 0;
  padding: 24px 20px;
  border: 2px dashed $gray-300;
  border-radius: $radius-md;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all $transition-fast;
  position: relative;
  flex-shrink: 0;

  &:hover {
    border-color: $brand-primary;
    background: rgba($brand-primary, 0.03);
  }

  &.dragging {
    border-color: $brand-primary;
    background: rgba($brand-primary, 0.06);
    box-shadow: 0 0 0 3px rgba($brand-primary, 0.15);
  }

  &.uploading {
    cursor: default;
    pointer-events: none;
  }
}

.rag-file-input {
  display: none;
}

.rag-upload-icon {
  width: 32px;
  height: 32px;
  color: $gray-400;
}

.rag-upload-text {
  font-size: 13px;
  color: $text-secondary;

  .rag-upload-link {
    color: $brand-primary;
    font-weight: 500;
  }
}

.rag-upload-hint {
  font-size: 11px;
  color: $text-hint;
}

.rag-upload-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid $gray-200;
  border-top-color: $brand-primary;
  border-radius: 50%;
  animation: ragSpin 0.8s linear infinite;
}

// ========== 状态提示 ==========
.rag-status {
  margin: 10px 20px 0;
  padding: 8px 12px;
  border-radius: $radius-sm;
  font-size: 12px;
  line-height: 1.5;
  flex-shrink: 0;

  &.rag-status-info {
    background: #e8f4fd;
    color: #1a6fb5;
  }

  &.rag-status-success {
    background: #e8f8f0;
    color: #1b7a4a;
  }

  &.rag-status-error {
    background: #fde8ea;
    color: #b71c2c;
  }
}

// ========== 工具栏 ==========
.rag-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 8px;
  flex-shrink: 0;
}

.rag-doc-count {
  font-size: 13px;
  color: $text-secondary;
  font-weight: 500;
}

.rag-reindex-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: 1px solid $gray-300;
  background: white;
  border-radius: $radius-sm;
  font-size: 12px;
  color: $text-secondary;
  cursor: pointer;
  transition: all $transition-fast;
  font-family: inherit;

  svg { width: 14px; height: 14px; }

  &:hover:not(:disabled) {
    border-color: $brand-primary;
    color: $brand-primary;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

// ========== 文档列表 ==========
.rag-doc-list {
  margin: 0 20px;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.rag-doc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: $radius-sm;
  transition: background $transition-fast;

  &:hover {
    background: $gray-50;
  }
}

.rag-doc-icon {
  width: 36px;
  height: 36px;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
    color: #e74c3c; // PDF red
  }
}

.rag-doc-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.rag-doc-name {
  font-size: 13px;
  font-weight: 500;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rag-doc-meta {
  font-size: 11px;
  color: $text-hint;
  margin-top: 2px;
}

.rag-doc-delete {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: $radius-sm;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-hint;
  transition: all $transition-fast;
  flex-shrink: 0;

  svg { width: 15px; height: 15px; }

  &:hover:not(:disabled) {
    background: rgba($brand-danger, 0.08);
    color: $brand-danger;
  }

  &:disabled {
    cursor: not-allowed;
  }
}

.rag-deleting-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid $gray-200;
  border-top-color: $brand-danger;
  border-radius: 50%;
  display: inline-block;
  animation: ragSpin 0.8s linear infinite;
}

// ========== 空状态 ==========
.rag-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  color: $text-hint;

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
    opacity: 0.4;
  }

  p {
    font-size: 14px;
    color: $text-secondary;
    margin-bottom: 4px;
  }

  span {
    font-size: 12px;
  }
}

// ========== 动画 ==========
@keyframes ragFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes ragScaleIn {
  from { opacity: 0; transform: scale(0.92) translateY(16px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes ragSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
