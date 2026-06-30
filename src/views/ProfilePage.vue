<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="profile-toolbar">
        <ion-title class="ion-text-center">个人中心</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="profile-content">
      <!-- Background orbs -->
      <BgOrbs color1="#a78bfa" color2="#60a5fa" color3="#34d399" />

      <div class="profile-container">
        <!-- App Hero -->
        <div class="app-hero">
          <div class="app-icon-wrap">
            <div class="app-icon-bg">
              <Icon icon="solar:book-linear" />
            </div>
            <div class="app-icon-ring"></div>
          </div>
          <div class="app-info">
            <h2 class="app-name">Kianer Reader</h2>
            <p class="app-motto">让文字温暖生活</p>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-cell" @click="router.push('/tabs/insights')">
            <span class="stat-num">{{ libraryStore.books.length }}</span>
            <span class="stat-label">藏书</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-cell">
            <span class="stat-num">{{ totalNotesCount }}</span>
            <span class="stat-label">笔记</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-cell">
            <span class="stat-num">{{ totalBookmarksCount }}</span>
            <span class="stat-label">书签</span>
          </div>
        </div>

        <!-- Storage -->
        <div class="card-section">
          <h3 class="section-label">存储空间</h3>
          <div class="storage-card">
            <div class="storage-bar-track">
              <div class="storage-bar-fill" :style="{ width: storageBarWidth + '%' }"></div>
            </div>
            <div class="storage-meta">
              <span class="storage-used">{{ libraryStore.formatSize(libraryStore.totalSize) }}</span>
              <span class="storage-count">{{ libraryStore.books.length }} 本书</span>
            </div>
            <div class="storage-tags">
              <span v-for="item in formatBreakdown" :key="item.format" class="fmt-badge" :class="item.format">
                {{ item.label }} {{ item.count }}
              </span>
            </div>
          </div>
        </div>

        <!-- App Settings -->
        <div class="card-section">
          <h3 class="section-label">应用设置</h3>
          <div class="settings-card">
            <div class="setting-row">
              <div class="row-left">
                <span class="row-icon moon-icon">
                  <Icon icon="solar:moon-linear" />
                </span>
                <span>夜间模式</span>
              </div>
              <el-switch v-model="isAppDarkMode" class="custom-switch" />
            </div>
            <div class="setting-row">
              <div class="row-left">
                <span class="row-icon info-icon">
                  <Icon icon="solar:info-circle-linear" />
                </span>
                <span>关于 Kianer Reader</span>
              </div>
              <span class="version-badge">v{{ version }}</span>
            </div>
          </div>
        </div>

        <!-- Data Management -->
        <div class="card-section">
          <h3 class="section-label">数据管理</h3>
          <div class="settings-card">
            <div class="setting-row" @click="exportData">
              <div class="row-left">
                <span class="row-icon export-icon">
                  <Icon icon="solar:export-linear" />
                </span>
                <span>导出数据备份</span>
              </div>
              <span class="row-action">
                <Icon icon="solar:alt-arrow-right-linear" />
              </span>
            </div>
            <div class="setting-row" @click="triggerImport">
              <div class="row-left">
                <span class="row-icon import-icon">
                  <Icon icon="solar:import-linear" />
                </span>
                <span>导入数据备份</span>
              </div>
              <span class="row-action">
                <Icon icon="solar:alt-arrow-right-linear" />
              </span>
            </div>
            <div class="setting-row danger-row" @click="confirmClearData">
              <div class="row-left">
                <span class="row-icon danger-icon">
                  <Icon icon="solar:trash-bin-trash-linear" />
                </span>
                <span>清理所有数据</span>
              </div>
              <span class="row-action">
                <Icon icon="solar:alt-arrow-right-linear" />
              </span>
            </div>
          </div>
          <p class="danger-hint">清理将删除所有书籍、笔记和阅读进度，且不可恢复。建议先导出备份。</p>
        </div>

        <!-- Hidden Import Input -->
        <input
          type="file"
          ref="importInput"
          accept=".json"
          style="display: none"
          @change="handleImport"
        />
      </div>

      <!-- 清理数据确认弹框 -->
      <ConfirmSheet
        :visible="showClearConfirm"
        title="清理所有数据"
        message="确定要清理所有数据吗？此操作不可恢复！建议先导出备份。"
        confirm-text="确认清理"
        cancel-text="取消"
        icon="solar:trash-bin-trash-linear"
        :danger="true"
        @confirm="handleClearConfirm"
        @cancel="handleClearCancel"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/vue';
import { Icon } from '@iconify/vue';
import { useLibraryStore, type Book } from '@/stores/library';
import { ElMessageBox, ElMessage } from 'element-plus';
import localforage from 'localforage';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import pako from 'pako';
import { Share } from '@capacitor/share';
import { useRouter } from 'vue-router';
import { version } from '../../package.json';
import BgOrbs from '@/components/BgOrbs.vue';
import ConfirmSheet from '@/components/ConfirmSheet.vue';

const libraryStore = useLibraryStore();
const router = useRouter();
const importInput = ref<HTMLInputElement | null>(null);
const isExporting = ref(false);

/** 确认清理数据弹框状态 */
const showClearConfirm = ref(false);

/** 暗色模式：仅读写 localStorage，由 App.vue 的 useDark watch 同步 class */
const isAppDarkMode = ref(
  localStorage.getItem('vueuse/dark') === 'true'
);
watch(isAppDarkMode, (val) => {
  localStorage.setItem('vueuse/dark', String(val));
  // 同步 class 以防 App.vue 的 useDark watch 在同一 tick 内未触发
  document.documentElement.classList.toggle('ion-palette-dark', val);
});

onMounted(async () => {
  await libraryStore.initStore();
});

const totalNotesCount = computed(() => libraryStore.totalNotes);

const totalBookmarksCount = computed(() => libraryStore.totalBookmarks);

// ── Storage ──

const MAX_STORAGE = 500 * 1024 * 1024;
const storageBarWidth = computed(() => Math.min(100, (libraryStore.totalSize / MAX_STORAGE) * 100));

interface FormatItem { format: string; label: string; count: number }

const formatBreakdown = computed((): FormatItem[] => {
  const counts: Record<string, number> = { txt: 0, epub: 0, pdf: 0 };
  for (const b of libraryStore.books) counts[b.format] = (counts[b.format] || 0) + 1;
  return [
    { format: 'txt', label: 'TXT', count: counts.txt },
    { format: 'epub', label: 'EPUB', count: counts.epub },
    { format: 'pdf', label: 'PDF', count: counts.pdf },
  ].filter(i => i.count > 0);
});

// ── Export / Import / Clear ──

const exportData = async () => {
  if (isExporting.value) return;
  isExporting.value = true;

  try {
    ElMessage.info('正在打包数据...');
    const booksData = libraryStore.books;
    interface ExportBook extends Book { _fileDataBase64: string; }
    interface ExportData {
      version: number;
      exportedAt: number;
      app: string;
      books: ExportBook[];
    }
    const exportData: ExportData = {
      version: 1,
      exportedAt: Date.now(),
      app: 'Kianer Reader',
      books: [],
    };

    for (const book of booksData) {
      const raw: unknown = await localforage.getItem(`book-data-${book.id}`);
      let base64 = '';
      if (raw) {
        const blob = raw instanceof Blob ? raw : new Blob([raw as ArrayBuffer]);
        base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(blob);
        });
      }
      exportData.books.push({ ...book, _fileDataBase64: base64 });
    }

    const jsonStr = JSON.stringify(exportData, null, 2);
    const fileName = `kianer-backup-${new Date().toISOString().slice(0, 10)}.json`;

    if (Capacitor.isNativePlatform()) {
      const compressed = pako.gzip(jsonStr);
      const blob = new Blob([compressed]);
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      });

      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
      await Share.share({
        title: 'Kianer Reader 备份',
        files: [uri],
        dialogTitle: `导出 ${booksData.length} 本书的备份`,
      });
    } else {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    }
    ElMessage.success(`已导出 ${booksData.length} 本书`);
  } catch (e) {
    console.error('Export failed:', e);
    const msg = e instanceof Error ? e.message : String(e);
    ElMessage.error(`导出失败: ${msg}`);
  } finally {
    isExporting.value = false;
  }
};

const triggerImport = () => importInput.value?.click();

const handleImport = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let text: string;

    if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
      text = pako.ungzip(bytes, { to: 'string' });
    } else if (bytes.length > 0 && bytes[0] === 0x7b) {
      text = new TextDecoder().decode(bytes);
    } else {
      const base64Str = new TextDecoder().decode(bytes);
      const decoded = atob(base64Str);
      const decodedBytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
      if (decodedBytes.length >= 2 && decodedBytes[0] === 0x1f && decodedBytes[1] === 0x8b) {
        text = pako.ungzip(decodedBytes, { to: 'string' });
      } else {
        text = base64Str;
      }
    }

    const data = JSON.parse(text);
    if (!data.version || !Array.isArray(data.books)) {
      ElMessage.error('无效的备份文件格式');
      return;
    }

    const confirmed = await ElMessageBox.confirm(
      `将导入 ${data.books.length} 本书籍数据${data.books.some((b: any) => b.notes?.length) ? '（含笔记）' : ''}`,
      '导入确认',
      { confirmButtonText: '确定导入', cancelButtonText: '取消', type: 'info', roundButton: true, customClass: 'glass-message-box' }
    ).catch(() => false);
    if (!confirmed) return;

    ElMessage.info('正在恢复数据...');
    const cleanBooks = data.books.map((b: any) => {
      const meta = { ...b };
      delete meta._fileDataBase64;
      return meta;
    });

    for (const bookData of data.books) {
      const { _fileDataBase64 } = bookData;
      if (_fileDataBase64) {
        const binaryStr = atob(_fileDataBase64);
        const bytes = Uint8Array.from(binaryStr, c => c.charCodeAt(0));
        await localforage.setItem(`book-data-${bookData.id}`, bytes.buffer);
      }
    }

    libraryStore.books = cleanBooks;
    await localforage.setItem('kianer-library-metadata', cleanBooks);
    ElMessage.success(`成功恢复 ${data.books.length} 本书`);
  } catch (e) {
    console.error('Import failed:', e);
    ElMessage.error('导入失败，请检查备份文件');
  } finally {
    target.value = '';
  }
};

const confirmClearData = () => {
  showClearConfirm.value = true;
};

const handleClearConfirm = async () => {
  showClearConfirm.value = false;
  for (const book of libraryStore.books) await localforage.removeItem(`book-data-${book.id}`);
  await localforage.removeItem('kianer-library-metadata');
  libraryStore.books = [];
  ElMessage.success('所有数据已清理');
};

const handleClearCancel = () => {
  showClearConfirm.value = false;
};
</script>

<style scoped lang="less">
// ── Toolbar ──
.profile-toolbar {
  --background: rgba(248, 246, 243, 0.95);
  --color: #1e293b;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  ion-title {
    font-weight: 700;
    font-size: 18px;
    padding: 0 16px;
  }
}

// ── Content ──
.profile-content {
  --background: #f8f6f3;
}

// ── Background orbs ──
// ── Container ──
.profile-container {
  position: relative;
  z-index: 1;
  padding: 0 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// ── Card section header ──
.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  margin: 0 0 10px 4px;
  letter-spacing: 0.5px;
}

// ── App Hero ──
.app-hero {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 28px 0 8px;
}

.app-icon-wrap {
  position: relative;
  flex-shrink: 0;
}

.app-icon-bg {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: linear-gradient(135deg, #a78bfa, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 30px;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.25);
}

.app-icon-ring {
  position: absolute;
  inset: -4px;
  border-radius: 22px;
  border: 2px solid rgba(167, 139, 250, 0.2);
  animation: pulseRing 3s ease-in-out infinite;
}

@keyframes pulseRing {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.08); opacity: 0; }
}

.app-info {
  flex: 1;
  min-width: 0;

  .app-name {
    margin: 0 0 4px;
    font-size: 22px;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.02em;
  }

  .app-motto {
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
    font-weight: 500;
  }
}

// ── Stats Row ──
.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 18px 8px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  animation: fadeUp 0.5s ease both;
}

.stat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  transition: transform 0.2s;
  -webkit-tap-highlight-color: transparent;

  &:active { transform: scale(0.95); }

  .stat-num {
    font-size: 24px;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.02em;
  }

  .stat-label {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 500;
  }
}

.stat-divider {
  width: 1px;
  height: 34px;
  background: rgba(0, 0, 0, 0.06);
}

// ── Storage Card ──
.storage-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 18px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  animation: fadeUp 0.5s ease both;
  animation-delay: 0.05s;
}

.storage-bar-track {
  height: 8px;
  background: #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.storage-bar-fill {
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(90deg, #a78bfa, #60a5fa);
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.storage-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  .storage-used {
    font-size: 18px;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.02em;
  }

  .storage-count {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 500;
  }
}

.storage-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.fmt-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 8px;
  letter-spacing: 0.3px;

  &.txt  { background: #fffbeb; color: #b45309; }
  &.epub { background: #f0fdf4; color: #166534; }
  &.pdf  { background: #fef2f2; color: #991b1b; }
}

// ── Settings Card ──
.settings-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: fadeUp 0.5s ease both;
  animation-delay: 0.1s;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  cursor: pointer;
  transition: background 0.2s;
  -webkit-tap-highlight-color: transparent;

  & + .setting-row {
    border-top: 1px solid rgba(0, 0, 0, 0.04);
  }

  &:active {
    background: rgba(0, 0, 0, 0.025);
  }

  .row-left {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #334155;
    font-size: 14px;
    font-weight: 500;

    .row-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;

      &.moon-icon   { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
      &.info-icon   { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
      &.export-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
      &.import-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
      &.danger-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    }
  }

  .row-action {
    color: #94a3b8;
    font-size: 18px;
    display: flex;
    align-items: center;
  }
}

.danger-hint {
  font-size: 12px;
  color: #94a3b8;
  margin: 10px 4px 0;
  line-height: 1.5;
}

.version-badge {
  font-size: 12px;
  color: #94a3b8;
  background: rgba(0, 0, 0, 0.04);
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 600;
}

.card-section {
  display: flex;
  flex-direction: column;
}

// ── Animations ──
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<style lang="less">
/* ── Dark Mode (non-scoped) ── */

html.ion-palette-dark .profile-toolbar {
  --color: #e2e8f0;
  --background: rgba(12, 10, 26, 0.95);
}

html.ion-palette-dark .profile-content {
  --background: #0c0a1a;
}

html.ion-palette-dark .bg-orb-1 { opacity: 0.08; }
html.ion-palette-dark .bg-orb-2 { opacity: 0.08; }
html.ion-palette-dark .bg-orb-3 { opacity: 0.05; }

html.ion-palette-dark .app-info .app-name { color: #e2e8f0; }
html.ion-palette-dark .app-info .app-motto { color: #64748b; }

html.ion-palette-dark .app-icon-ring { border-color: rgba(167, 139, 250, 0.15); }

html.ion-palette-dark .stats-row {
  background: rgba(30, 30, 50, 0.7);
  border-color: rgba(255, 255, 255, 0.06);
}
html.ion-palette-dark .stat-cell .stat-num { color: #e2e8f0; }
html.ion-palette-dark .stat-cell .stat-label { color: #64748b; }
html.ion-palette-dark .stat-divider { background: rgba(255, 255, 255, 0.08); }

html.ion-palette-dark .storage-card {
  background: rgba(30, 30, 50, 0.7);
  border-color: rgba(255, 255, 255, 0.06);
}
html.ion-palette-dark .storage-bar-track { background: #1e1e38; }
html.ion-palette-dark .storage-meta .storage-used { color: #e2e8f0; }
html.ion-palette-dark .storage-meta .storage-count { color: #64748b; }

html.ion-palette-dark .fmt-badge.txt  { background: rgba(251, 191, 36, 0.12); color: #fbbf24; }
html.ion-palette-dark .fmt-badge.epub { background: rgba(52, 211, 153, 0.12); color: #34d399; }
html.ion-palette-dark .fmt-badge.pdf  { background: rgba(248, 113, 113, 0.12); color: #f87171; }

html.ion-palette-dark .settings-card {
  background: rgba(30, 30, 50, 0.7);
  border-color: rgba(255, 255, 255, 0.06);
}
html.ion-palette-dark .setting-row .row-left { color: #e2e8f0; }
html.ion-palette-dark .setting-row + .setting-row { border-color: rgba(255, 255, 255, 0.04); }
html.ion-palette-dark .setting-row:active { background: rgba(255, 255, 255, 0.04); }
html.ion-palette-dark .setting-row .row-action { color: #64748b; }
html.ion-palette-dark .section-label { color: #64748b; }
html.ion-palette-dark .version-badge { color: #64748b; background: rgba(255, 255, 255, 0.06); }
html.ion-palette-dark .danger-row .row-left { color: #f87171; }
html.ion-palette-dark .danger-row .row-left .danger-icon { background: rgba(239, 68, 68, 0.12); }
html.ion-palette-dark .danger-hint { color: #64748b; }
</style>
