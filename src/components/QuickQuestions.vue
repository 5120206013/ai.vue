<template>
  <div class="quick-questions">
    <p class="quick-label">{{ label }}</p>
    <div class="quick-grid">
      <button
        v-for="q in questions"
        :key="q"
        class="quick-card"
        @click="$emit('select', q)"
        :disabled="disabled"
      >
        {{ q }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  disabled: { type: Boolean, default: false },
  label: { type: String, default: '你可以这样问' },
  questions: {
    type: Array,
    default: () => [
      '如何查询交易记录？',
      '手续费是多少？',
      '如何联系人工客服？',
      '退款需要多长时间？',
    ],
  },
})

defineEmits(['select'])
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.quick-questions {
  width: 100%;
}

.quick-label {
  font-size: 13px;
  color: $text-hint;
  margin-bottom: 12px;
  text-align: center;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.quick-card {
  padding: 14px 16px;
  border-radius: $radius-md;
  border: 1px solid $border-color;
  background: $bg-white;
  color: $text-primary;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: all $transition-fast;
  font-family: inherit;
  line-height: 1.5;

  &:hover:not(:disabled) {
    border-color: $brand-primary;
    color: $brand-primary;
    background: $brand-primary-light;
    box-shadow: $shadow-card;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
