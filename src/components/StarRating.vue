<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('cancel')">
      <div class="rating-card">
        <div class="rating-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>请评价我们的服务</span>
        </div>

        <div class="rating-stars">
          <button
            v-for="i in 5"
            :key="i"
            class="star-btn"
            :class="{ active: hoverStar >= i || selectedStar >= i }"
            @click="selectStar(i)"
            @mouseenter="hoverStar = i"
            @mouseleave="hoverStar = 0"
          >
            <svg viewBox="0 0 24 24" :fill="(hoverStar || selectedStar) >= i ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        </div>

        <div class="rating-labels">
          <span v-if="selectedStar === 0">点击星星评分</span>
          <span v-else-if="selectedStar <= 2">不满意</span>
          <span v-else-if="selectedStar === 3">一般</span>
          <span v-else-if="selectedStar === 4">满意</span>
          <span v-else>非常满意</span>
        </div>

        <textarea
          v-model="comment"
          class="rating-comment"
          placeholder="留下您的建议（选填）"
          rows="2"
        ></textarea>

        <div class="rating-footer">
          <button class="btn-skip" @click="$emit('cancel')">下次再说</button>
          <button
            class="btn-submit"
            :disabled="selectedStar === 0"
            @click="handleSubmit"
          >
            提交评价
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit', 'cancel'])

const selectedStar = ref(0)
const hoverStar = ref(0)
const comment = ref('')

function selectStar(star) {
  selectedStar.value = star
}

function handleSubmit() {
  if (selectedStar.value === 0) return
  emit('submit', selectedStar.value, comment.value)
}
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
}

.rating-card {
  background: white;
  border-radius: $radius-md;
  padding: 28px 24px;
  width: 340px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.25s ease;
}

.rating-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 20px;

  svg {
    width: 20px;
    height: 20px;
    color: $brand-warning;
  }
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.star-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: $gray-300;
  cursor: pointer;
  transition: all $transition-fast;
  padding: 4px;

  svg {
    width: 100%;
    height: 100%;
  }

  &.active {
    color: $brand-warning;
    transform: scale(1.1);
  }

  &:hover {
    transform: scale(1.15);
  }
}

.rating-labels {
  text-align: center;
  font-size: 13px;
  color: $text-hint;
  margin-bottom: 16px;
  height: 20px;
}

.rating-comment {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  font-size: 13px;
  font-family: inherit;
  resize: none;
  outline: none;
  margin-bottom: 18px;
  line-height: 1.5;
  color: $text-primary;

  &:focus {
    border-color: $brand-primary;
  }

  &::placeholder {
    color: $text-hint;
  }
}

.rating-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-skip,
.btn-submit {
  padding: 8px 20px;
  border-radius: $radius-sm;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all $transition-fast;
  font-family: inherit;
}

.btn-skip {
  background: $gray-100;
  color: $text-secondary;
  &:hover { background: $gray-200; }
}

.btn-submit {
  background: $brand-primary;
  color: white;
  &:hover:not(:disabled) { background: $brand-primary-dark; }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
