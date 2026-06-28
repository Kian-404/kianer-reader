<template>
  <div class="settings-content">
    <!-- ═══ 背景主题 ═══ -->
    <div class="setting-item theme-section">
      <span class="label">背景主题</span>
      <div class="theme-grid">
        <button
          v-for="t in themes"
          :key="t.name"
          :class="['theme-card', { active: readerStore.theme === t.name }]"
          :style="{
            '--card-bg': t.vars['--bg-primary'],
            '--card-text': t.vars['--text-primary'],
            '--card-border': t.vars['--border-color'],
            '--card-accent': t.vars['--accent-color'],
          }"
          :aria-label="`切换到${t.label}主题`"
          @click="handleThemeChange(t.name)"
        >
          <!-- 缩略预览 -->
          <div class="theme-preview">
            <div class="preview-text-line" style="width: 70%"></div>
            <div class="preview-text-line" style="width: 50%"></div>
            <div class="preview-text-line preview-accent"></div>
          </div>
          <div class="theme-meta">
            <span class="theme-label">{{ t.label }}</span>
            <span class="theme-swatch" :style="{ background: t.swatch }"></span>
          </div>
        </button>
      </div>
    </div>

    <!-- ═══ 翻页方式 ═══ -->
    <div class="setting-item">
      <span class="label">翻页方式</span>
      <el-radio-group 
        v-model="readerStore.paginationMode" 
        size="small" 
        @change="$emit('pagination-change')"
      >
        <el-radio-button value="horizontal">仿真左右</el-radio-button>
        <el-radio-button value="vertical">连续上下</el-radio-button>
      </el-radio-group>
    </div>

    <!-- ═══ 字体调整 ═══ -->
    <div class="setting-item">
      <span class="label">{{ isPdf ? 'PDF 缩放' : '字体大小' }}</span>
      <div class="font-size-ctrl">
        <el-button 
          circle 
          size="small" 
          :disabled="isPdf ? readerStore.pdfScale <= 0.5 : readerStore.fontSize <= 12"
          @click="changeFontSize(-1)"
        >
          <template #icon>
            <Icon icon="solar:minus-circle-linear" style="font-size: 18px" />
          </template>
        </el-button>
        <span class="size-val">{{ isPdf ? Math.round(readerStore.pdfScale * 100) + '%' : readerStore.fontSize }}</span>
        <el-button 
          circle 
          size="small" 
          :disabled="isPdf ? readerStore.pdfScale >= 3.0 : readerStore.fontSize >= 40"
          @click="changeFontSize(1)"
        >
          <template #icon>
            <Icon icon="solar:add-circle-linear" style="font-size: 18px" />
          </template>
        </el-button>
      </div>
    </div>

    <!-- ═══ 字体选择 ═══ -->
    <div v-if="!isPdf" class="setting-item font-family-item">
      <span class="label">阅读字体</span>
      <div class="font-family-picker">
        <button
          v-for="f in fonts" 
          :key="f.value" 
          :class="['font-opt', { active: readerStore.fontFamily === f.value }]"
          :style="{ fontFamily: f.value }"
          :aria-label="`选择${f.label}字体`"
          @click="changeFontFamily(f.value)"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- ═══ 屏幕亮度 ═══ -->
    <div class="setting-item">
      <span class="label">屏幕亮度</span>
      <div class="brightness-ctrl">
        <Icon icon="solar:sun-linear" class="sun-icon" style="font-size: 20px" />
        <el-slider 
          v-model="readerStore.brightness" 
          :min="30" 
          :max="100" 
          :step="5"
          :show-tooltip="false"
          @input="handleBrightnessChange"
        />
        <span class="brightness-value">{{ readerStore.brightness }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useReaderStore } from '@/stores/reader';
import { getThemes, type ThemeName } from '@/theme/readingThemes';
import { Icon } from '@iconify/vue';

const props = defineProps<{
  bookFormat?: string;
}>();

const readerStore = useReaderStore();

const isPdf = computed(() => props.bookFormat === 'pdf');

/** 主题列表（按 UI 顺序） */
const themes = getThemes();

/** 字体配置 */
const fonts = [
  { label: '系统', value: 'system-ui' },
  { label: '衬线', value: 'serif' },
  { label: '无衬线', value: 'sans-serif' },
  { label: '等宽', value: 'monospace' },
];

const emit = defineEmits<{
  (e: 'pagination-change'): void;
  (e: 'size-change'): void;
}>();

const handleThemeChange = (themeName: ThemeName) => {
  if (readerStore.theme === themeName) return;
  readerStore.setTheme(themeName);
};

const changeFontSize = (delta: number) => {
  if (isPdf.value) {
    const newZoom = Math.round((readerStore.pdfScale + delta * 0.1) * 10) / 10;
    if (newZoom >= 0.5 && newZoom <= 3.0) {
      (readerStore as any).pdfScale = newZoom;
      emit('size-change');
    }
  } else {
    const newSize = readerStore.fontSize + delta;
    if (newSize >= 12 && newSize <= 40) {
      readerStore.fontSize = newSize;
      emit('size-change');
    }
  }
};

const changeFontFamily = (font: string) => {
  readerStore.fontFamily = font;
};

const handleBrightnessChange = (value: number) => {
  if (value < 30) readerStore.brightness = 30;
  else if (value > 100) readerStore.brightness = 100;
};
</script>

<style scoped lang="less">
.settings-content {
  padding: 6px 5px 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 40px;

  .label {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
    flex-shrink: 0;
  }
}

/* ═══ 主题网格 ═══ */
.theme-section {
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  min-height: 0;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
}

.theme-card {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  padding: 0;
  background: transparent;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &.active {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.15);
  }

  /* 缩略预览区域 */
  .theme-preview {
    background: var(--card-bg);
    padding: 12px 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-height: 44px;
    justify-content: center;
  }

  .preview-text-line {
    height: 4px;
    border-radius: 2px;
    background: var(--card-text);
    opacity: 0.35;

    &.preview-accent {
      width: 30%;
      background: var(--card-accent);
      opacity: 0.6;
    }
  }

  /* 底部标签栏 */
  .theme-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    background: color-mix(in srgb, var(--card-bg) 85%, #000 15%);
  }

  .theme-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--card-text);
    opacity: 0.75;
  }

  .theme-swatch {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.08);
    flex-shrink: 0;
  }
}

/* ═══ 字体调整 ═══ */
.font-size-ctrl {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.03);
  padding: 3px 10px;
  border-radius: 20px;

  .size-val {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    min-width: 28px;
    text-align: center;
  }

  :deep(.el-button) {
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.font-family-item {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-height: 0;
}

.font-family-picker {
  display: flex;
  gap: 8px;
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  .font-opt {
    flex: 1;
    min-width: 70px;
    text-align: center;
    padding: 6px 0;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    transition: all 0.2s;
    border: 1px solid transparent;
    cursor: pointer;

    &:hover {
      background: rgba(64, 158, 255, 0.06);
    }

    &.active {
      background: rgba(64, 158, 255, 0.1);
      color: #409eff;
      border-color: rgba(64, 158, 255, 0.3);
      font-weight: 700;
    }
  }
}

.brightness-ctrl {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  max-width: 220px;

  .sun-icon {
    color: #f39c12;
    font-size: 18px;
    flex-shrink: 0;
  }

  .brightness-value {
    font-size: 12px;
    color: #64748b;
    font-weight: 600;
    min-width: 32px;
    text-align: right;
    flex-shrink: 0;
  }

  :deep(.el-slider) {
    --el-slider-main-bg-color: #f39c12;
    flex: 1;

    .el-slider__runway {
      background: linear-gradient(to right, rgba(243, 156, 18, 0.2), rgba(243, 156, 18, 0.4));
    }

    .el-slider__bar {
      background: linear-gradient(to right, #f39c12, #f1c40f);
    }

    .el-slider__button {
      border-color: #f39c12;
    }
  }
}

/* ═══ 深色模式适配 ═══ */
html.ion-palette-dark {
  .settings-content {
    .label {
      color: #cbd5e1;
    }

    .theme-card.active {
      border-color: #60a5fa;
      box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
    }
  }

  .font-size-ctrl {
    background: rgba(255, 255, 255, 0.05);

    .size-val {
      color: #f1f5f9;
    }
  }

  .font-family-picker {
    .font-opt {
      background: rgba(255, 255, 255, 0.05);
      color: #cbd5e1;

      &:hover {
        background: rgba(64, 158, 255, 0.1);
      }

      &.active {
        background: rgba(64, 158, 255, 0.2);
        color: #60a5fa;
        border-color: rgba(96, 165, 250, 0.3);
      }
    }
  }

  .brightness-ctrl {
    .sun-icon {
      color: #fbbf24;
    }

    .brightness-value {
      color: #cbd5e1;
    }

    :deep(.el-slider) {
      --el-slider-main-bg-color: #fbbf24;

      .el-slider__button {
        border-color: #fbbf24;
      }
    }
  }
}
</style>
