<template>
  <transition name="float-up" @after-leave="$emit('closed')">
    <div v-if="visible" class="confirm-overlay" @click.self="$emit('cancel')">
      <div class="confirm-card">
        <!-- 顶部装饰条 -->
        <div class="accent-bar" :class="{ danger: danger }"></div>

        <!-- 标题 -->
        <div class="title-row">
          <span class="title-icon" v-if="icon">
            <Icon :icon="icon" width="22" height="22" />
          </span>
          <h3 class="title-text">{{ title }}</h3>
        </div>

        <!-- 消息 -->
        <p class="message">{{ message }}</p>

        <!-- 操作按钮 -->
        <div class="actions">
          <button class="btn btn-cancel" @click="$emit('cancel')">
            {{ cancelText }}
          </button>
          <button class="btn btn-confirm" :class="{ danger: danger }" @click="$emit('confirm')">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

defineProps<{
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
  danger?: boolean;
}>();

defineEmits<{
  confirm: [];
  cancel: [];
  closed: [];
}>();
</script>

<style scoped lang="less">
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: auto;
}

.confirm-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 28px 28px 0 0;
  padding: 0 24px 36px;
  box-shadow:
    0 -8px 40px rgba(0, 0, 0, 0.08),
    0 -2px 12px rgba(0, 0, 0, 0.04);
}

// ── Accent bar ──

.accent-bar {
  width: 48px;
  height: 4px;
  border-radius: 2px;
  background: #cbd5e1;
  margin: 12px auto 0;
  transition: background 0.3s;

  &.danger {
    background: #f87171;
  }
}

// ── Title ──

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 4px 0;
}

.title-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.04);
  color: #475569;
  flex-shrink: 0;
}

.title-text {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.01em;
}

// ── Message ──

.message {
  margin: 10px 4px 24px;
  font-size: 15px;
  line-height: 1.6;
  color: #64748b;
  font-weight: 500;
}

// ── Actions ──

.actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 14px;
  border-radius: 16px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  letter-spacing: 0.02em;

  &:active {
    transform: scale(0.97);
  }

  &-cancel {
    color: #64748b;
    background: rgba(0, 0, 0, 0.04);

    &:active {
      background: rgba(0, 0, 0, 0.08);
    }
  }

  &-confirm {
    color: #fff;
    background: linear-gradient(135deg, #1e293b, #334155);
    box-shadow: 0 4px 16px rgba(30, 41, 59, 0.2);

    &.danger {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.25);
    }
  }
}

// ── Animation ──

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
  .confirm-card {
    background: rgba(30, 41, 59, 0.9);
    box-shadow:
      0 -8px 40px rgba(0, 0, 0, 0.3),
      0 -2px 12px rgba(0, 0, 0, 0.15);
  }

  .title-text {
    color: #e2e8f0;
  }

  .title-icon {
    background: rgba(255, 255, 255, 0.06);
    color: #94a3b8;
  }

  .message {
    color: #94a3b8;
  }

  .btn-cancel {
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.06);

    &:active {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .btn-confirm {
    background: linear-gradient(135deg, #475569, #64748b);

    &.danger {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }
  }
}
</style>
