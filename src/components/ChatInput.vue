<template>
  <div class="chat-input-wrapper">
    <div class="chat-input-box">
      <textarea
        ref="inputRef"
        v-model="text"
        class="chat-textarea"
        :placeholder="placeholder"
        :disabled="disabled"
        rows="1"
        @keydown.enter.exact.prevent="handleSend"
        @input="autoResize"
      ></textarea>

      <button
        v-if="isStreaming"
        class="send-btn stop-btn"
        @click="$emit('cancel')"
        title="停止生成"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      </button>
      <button
        v-else
        class="send-btn"
        :class="{ active: text.trim() }"
        :disabled="!text.trim() || disabled"
        @click="handleSend"
        title="发送"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
    <p class="input-hint">内容由 AI 生成，仅供参考</p>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  isStreaming: { type: Boolean, default: false },
  placeholder: { type: String, default: '输入您的问题...' },
})

const emit = defineEmits(['send', 'cancel'])

const text = ref('')
const inputRef = ref(null)

function autoResize() {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
      inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 160) + 'px'
    }
  })
}

function handleSend() {
  if (!text.value.trim() || props.disabled) return
  emit('send', text.value)
  text.value = ''
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
    }
  })
}
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.chat-input-wrapper {
  flex-shrink: 0;
  padding: 12px 24px 10px;
  background: $bg-white;
}

.chat-input-box {
  max-width: $input-max-width;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  background: $bg-white;
  border: 1px solid $gray-200;
  border-radius: 16px;
  padding: 12px 14px;
  box-shadow: $shadow-card;
  transition: border-color $transition-fast, box-shadow $transition-fast;

  &:focus-within {
    border-color: $brand-primary;
    box-shadow: 0 0 0 3px rgba($brand-primary, 0.12);
  }
}

.chat-textarea {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  resize: none;
  font-size: 14px;
  line-height: 1.6;
  font-family: inherit;
  color: $text-primary;
  max-height: 160px;

  &::placeholder {
    color: $text-hint;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: $gray-100;
  color: $gray-400;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all $transition-fast;

  svg {
    width: 17px;
    height: 17px;
  }

  &.active {
    background: $brand-primary;
    color: white;

    &:hover {
      background: $brand-primary-dark;
    }
  }

  &.stop-btn {
    background: $brand-danger;
    color: white;

    &:hover {
      background: darken($brand-danger, 8%);
    }
  }
}

.input-hint {
  max-width: $input-max-width;
  margin: 8px auto 0;
  text-align: center;
  font-size: 11px;
  color: $gray-300;
}
</style>
