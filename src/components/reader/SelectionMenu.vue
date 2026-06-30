<template>
  <transition name="float-up" @after-leave="afterLeave">
    <div v-if="visible" class="selection-overlay" @click.self="handleClose">
      <div class="selection-card">
        <!-- Accent bar at top -->
        <div class="accent-bar" :style="{ background: selectedColor }"></div>

        <!-- Selected text preview - quote style -->
        <div class="quote-block">
          <div class="quote-mark">&ldquo;</div>
          <p class="quote-text">{{ displayText }}</p>
          <div class="quote-mark end">&rdquo;</div>
        </div>

        <!-- Comment input -->
        <div class="comment-section">
          <textarea
            :value="comment"
            placeholder="写下你的想法..."
            :rows="2"
            class="comment-input"
            @input="onCommentInput"
          />
        </div>

        <!-- Color picker -->
        <div class="color-strip">
          <button
            v-for="c in colors"
            :key="c.value"
            :class="['color-dot', { active: selectedColor === c.value }]"
            :style="{
              '--dot-color': c.value,
              transform: selectedColor === c.value ? 'scale(1.3)' : 'scale(1)'
            }"
            :title="c.label"
            @click="handleColorChange(c.value)"
          >
            <span v-if="selectedColor === c.value" class="dot-inner"></span>
          </button>
        </div>

        <!-- Save button -->
        <button class="save-btn" @click="handleSave">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>保存</span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  visible: boolean;
  text: string;
  comment: string;
  selectedColor?: string;
}>();

const emit = defineEmits<{
  save: [];
  close: [];
  'update:comment': [value: string];
  'update:selectedColor': [value: string];
}>();

const displayText = computed(() => {
  return props.text?.trim() || '选中了一段文字';
});

const colors = [
  { value: '#ffe082', label: '淡黄' },
  { value: '#a5d6a7', label: '淡绿' },
  { value: '#90caf9', label: '淡蓝' },
  { value: '#f48fb1', label: '淡粉' },
  { value: '#ce93d8', label: '淡紫' },
  { value: '#ffab91', label: '淡橙' },
];

const handleColorChange = (color: string) => {
  emit('update:selectedColor', color);
};

const onCommentInput = (e: Event) => {
  emit('update:comment', (e.target as HTMLTextAreaElement).value);
};

const handleSave = () => {
  emit('save');
};

const handleClose = () => {
  emit('close');
};

const afterLeave = () => {
  // 动画结束时清理（可选）
};
</script>

<style scoped lang="less">
.selection-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: auto;
}

// ── Card ──

.selection-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  max-height: 70vh;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 28px 28px 0 0;
  padding: 0 24px 32px;
  overflow-y: auto;
  overscroll-behavior: contain;
  box-shadow:
    0 -8px 40px rgba(0, 0, 0, 0.08),
    0 -2px 12px rgba(0, 0, 0, 0.04);
}

// ── Accent bar ──

.accent-bar {
  width: 48px;
  height: 4px;
  border-radius: 2px;
  margin: 12px auto 0;
  opacity: 0.6;
  transition: background 0.3s;
}

// ── Quote block ──

.quote-block {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 20px 4px 16px;

  .quote-mark {
    font-size: 28px;
    line-height: 1;
    color: #cbd5e1;
    font-family: Georgia, 'Times New Roman', serif;
    user-select: none;
    flex-shrink: 0;

    &.end {
      align-self: flex-end;
      margin-top: auto;
    }
  }

  .quote-text {
    flex: 1;
    margin: 0;
    font-size: 16px;
    line-height: 1.7;
    color: #1e293b;
    font-weight: 500;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
    letter-spacing: 0.01em;
  }
}

// ── Comment input ──

.comment-section {
  margin-bottom: 18px;
}

.comment-input {
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
  background: rgba(0, 0, 0, 0.03);
  resize: none;
  outline: none;
  font-family: inherit;
  transition: background 0.2s;
  box-sizing: border-box;

  &:focus {
    background: rgba(0, 0, 0, 0.06);
  }

  &::placeholder {
    color: #94a3b8;
  }
}

// ── Color strip ──

.color-strip {
  display: flex;
  gap: 14px;
  justify-content: center;
  padding: 4px 0 20px;
}

.color-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  outline: none;
  background: var(--dot-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s;
  position: relative;

  &:hover {
    transform: scale(1.2);
  }

  &.active {
    border-color: #1e293b;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--dot-color) 30%, transparent);
  }

  .dot-inner {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.15);
    pointer-events: none;
  }
}

// ── Save button ──

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #1e293b, #334155);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(30, 41, 59, 0.2);
  letter-spacing: 0.02em;

  &:active {
    transform: scale(0.97);
    box-shadow: 0 2px 8px rgba(30, 41, 59, 0.15);
  }

  svg {
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: scale(1.15);
  }
}

// ── Float-up Animation ──
// 入场：从底部弹出（弹簧动效）
// 离场：向底部滑出

.float-up-enter-active {
  transition: transform 0.45s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.25s ease;
}

.float-up-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.18s ease;
}

.float-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.float-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

// ── Dark Mode ──

html.ion-palette-dark {
  .selection-card {
    background: rgba(30, 41, 59, 0.9);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow:
      0 -8px 40px rgba(0, 0, 0, 0.3),
      0 -2px 12px rgba(0, 0, 0, 0.15);
  }

  .quote-mark {
    color: #475569;
  }

  .quote-text {
    color: #e2e8f0;
  }

  .comment-input {
    color: #e2e8f0;
    background: rgba(255, 255, 255, 0.05);

    &:focus {
      background: rgba(255, 255, 255, 0.08);
    }
  }

  .color-dot.active {
    border-color: #e2e8f0;
  }

  .save-btn {
    background: linear-gradient(135deg, #475569, #64748b);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
}
</style>
