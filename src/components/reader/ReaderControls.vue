<template>
  <transition name="fade">
    <div v-if="show" class="controls-overlay">
      <!-- Top Bar -->
      <div class="top-bar">
        <el-button circle @click="$emit('back')" class="glass-btn">
          <Icon icon="solar:alt-arrow-left-linear" width="28" height="28" />
        </el-button>
        <div class="book-title">{{ title }}</div>
        <!-- Spacer for alignment -->
        <div style="width: 32px"></div> 
      </div>

      <!-- Bottom Bar -->
      <div class="bottom-bar">
        <div class="progress-section">
          <span class="progress-text">进度: {{ Math.round(progress) }}%</span>
          <el-slider 
            v-model="internalProgress" 
            :min="0" 
            :max="100" 
            :show-tooltip="false"
            @change="$emit('progress-change', $event)" 
            class="progress-slider"
          />
        </div>
        
        <div class="bottom-actions">
          <div class="action-item" @click="$emit('toggle-toc')">
            <Icon icon="solar:list-arrow-down-linear" style="font-size: 24px" />
          </div>
          <div class="action-item" @click="$emit('toggle-bookmarks')">
            <Icon icon="solar:bookmark-opened-linear" style="font-size: 24px" />
          </div>
          <div class="action-item" @click="$emit('toggle-notes')">
            <Icon icon="solar:pen-new-square-linear" style="font-size: 24px" />
          </div>
          <div class="action-item" @click="$emit('toggle-search')">
            <Icon icon="solar:magnifer-linear" style="font-size: 24px" />
          </div>
          <div class="action-item" @click="$emit('toggle-settings')">
            <Icon icon="solar:settings-linear" style="font-size: 24px" />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps<{
  show: boolean;
  title?: string;
  progress: number;
}>();

defineEmits<{
  (e: 'back'): void;
  (e: 'progress-change', val: number): void;
  (e: 'toggle-search'): void;
  (e: 'toggle-notes'): void;
  (e: 'toggle-bookmarks'): void;
  (e: 'toggle-toc'): void;
  (e: 'toggle-settings'): void;
}>();

const internalProgress = ref(props.progress);

watch(() => props.progress, (newVal) => {
  internalProgress.value = newVal;
});
</script>

<style scoped lang="less">
.controls-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1000;
  pointer-events: none;

  .top-bar, .bottom-bar {
    pointer-events: auto;
    background: color-mix(in srgb, var(--bg-secondary, #f8fafc) 72%, transparent);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow: 0 4px 30px var(--shadow-color, rgba(0, 0, 0, 0.08));
    /* 与阅读区域形成层级区分 */
    border-color: color-mix(in srgb, var(--border-color, #e2e8f0) 60%, transparent);
  }

  .top-bar {
    position: absolute; top: 0; left: 0; right: 0;
    padding: 15px 20px;
    padding-top: calc(env(safe-area-inset-top, 0px) + 15px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid color-mix(in srgb, var(--border-color, #e2e8f0) 50%, transparent);

    .book-title {
      font-weight: 700;
      font-size: 16px;
      color: var(--text-primary, #1e293b);
      flex: 1;
      text-align: center;
      margin: 0 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .bottom-bar {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 15px 25px 20px 25px;
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 20px);
    display: flex;
    flex-direction: column;
    gap: 15px;
    border-top: 1px solid color-mix(in srgb, var(--border-color, #e2e8f0) 50%, transparent);
    border-radius: 24px 24px 0 0;

    .progress-section {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 15px;

      .progress-text {
        font-size: 12px;
        color: var(--text-secondary, #64748b);
        font-weight: 600;
        min-width: 60px;
      }

      .progress-slider {
        flex: 1;
      }
    }

    .bottom-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px;

      .action-item {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        color: var(--text-secondary, #475569);
        cursor: pointer;
        transition: all 0.2s;

        &:active {
          transform: scale(0.9);
          background: color-mix(in srgb, var(--accent-color, #409eff) 15%, transparent);
          color: var(--accent-color, #409eff);
        }

        .el-icon {
          font-size: 24px;
        }
      }
    }
  }
}

.glass-btn {
  background: color-mix(in srgb, var(--bg-secondary, #f8fafc) 55%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--border-color, #e2e8f0) 40%, transparent) !important;
  color: var(--text-secondary, #475569) !important;
  width: 44px !important;
  height: 44px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  &:hover {
    background: color-mix(in srgb, var(--bg-secondary, #f8fafc) 80%, transparent) !important;
    color: var(--accent-color, #409eff) !important;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  .top-bar { transform: translateY(-100%); }
  .bottom-bar { transform: translateY(100%); }
}
</style>
