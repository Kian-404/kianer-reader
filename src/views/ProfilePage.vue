<template>
  <ion-page>
    <ion-header :translucent="true" class="ion-no-border">
      <ion-toolbar class="profile-toolbar">
        <ion-title>个人中心</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="profile-content">
      <div class="glass-background"></div>
      
      <div class="profile-container">
        <!-- Summary Cards -->
        <div class="summary-grid">
          <div class="summary-card glass-card">
            <Icon icon="solar:library-linear" class="card-icon-top" />
            <span class="card-value">{{ libraryStore.books.length }}</span>
            <span class="card-label">藏书</span>
          </div>
          <div class="summary-card glass-card">
            <Icon icon="solar:check-circle-linear" class="card-icon-top" />
            <span class="card-value">{{ completedCount }}</span>
            <span class="card-label">已读完</span>
          </div>
          <div class="summary-card glass-card">
            <Icon icon="solar:pen-new-square-linear" class="card-icon-top" />
            <span class="card-value">{{ totalNotesCount }}</span>
            <span class="card-label">笔记</span>
          </div>
          <div class="summary-card glass-card">
            <Icon icon="solar:bookmark-opened-linear" class="card-icon-top" />
            <span class="card-value">{{ totalBookmarksCount }}</span>
            <span class="card-label">书签</span>
          </div>
        </div>

        <!-- Format Distribution -->
        <div class="insight-section glass-card">
          <h3>藏书构成</h3>
          <div class="format-list">
            <div v-for="fmt in formatStats" :key="fmt.format" class="format-row">
              <div class="format-left">
                <span class="format-dot" :class="fmt.format"></span>
                <span class="format-name">{{ fmt.label }}</span>
              </div>
              <div class="format-bar-wrap">
                <div class="format-bar-bg">
                  <div
                    class="format-bar-fill" :class="fmt.format"
                    :style="{ width: fmt.percent + '%' }"
                  ></div>
                </div>
              </div>
              <span class="format-num">{{ fmt.count }}</span>
            </div>
          </div>
        </div>

        <!-- Recently Read -->
        <div v-if="recentBooks.length > 0" class="insight-section glass-card">
          <h3>最近阅读</h3>
          <div class="recent-list">
            <div
              v-for="book in recentBooks"
              :key="book.id"
              class="recent-item"
              @click="openBook(book)"
            >
              <div class="recent-cover" :class="book.format">
                <Icon
                  :icon="book.format === 'pdf' ? 'solar:file-pdf-linear' : (book.format === 'epub' ? 'solar:notebook-linear' : 'solar:document-text-linear')"
                  class="recent-icon"
                />
              </div>
              <div class="recent-info">
                <span class="recent-title">{{ book.title }}</span>
                <span class="recent-meta">{{ Math.round(book.progress) }}% · {{ formatTime(book.lastReadAt) }}</span>
                <div class="recent-progress">
                  <div class="recent-bar" :style="{ width: book.progress + '%' }"></div>
                </div>
              </div>
              <Icon icon="solar:alt-arrow-right-linear" class="recent-arrow" />
            </div>
          </div>
        </div>

        <!-- App Settings -->
        <div class="settings-group">
          <h3>应用设置</h3>
          <div class="settings-list glass-card">
            <div class="setting-row">
              <div class="row-left">
                <Icon icon="solar:moon-linear" style="font-size: 20px" />
                <span>夜间模式</span>
              </div>
              <el-switch v-model="isAppDarkMode" />
            </div>
            <div class="setting-row">
              <div class="row-left">
                <Icon icon="solar:info-circle-linear" style="font-size: 20px" />
                <span>关于 Kianer Reader</span>
              </div>
              <span class="version-tag">v1.0.0</span>
            </div>
          </div>
        </div>

        <!-- Data Management -->
        <div class="settings-group">
          <h3>数据管理</h3>
          <div class="settings-list glass-card">
            <div class="setting-row" @click="exportData">
              <div class="row-left">
                <Icon icon="solar:export-linear" style="font-size: 20px" />
                <span>导出数据备份</span>
              </div>
              <Icon icon="solar:alt-arrow-right-linear" class="row-arrow" />
            </div>
            <div class="setting-row" @click="triggerImport">
              <div class="row-left">
                <Icon icon="solar:import-linear" style="font-size: 20px" />
                <span>导入数据备份</span>
              </div>
              <Icon icon="solar:alt-arrow-right-linear" class="row-arrow" />
            </div>
            <div class="setting-row danger-row" @click="confirmClearData">
              <div class="row-left">
                <Icon icon="solar:trash-bin-trash-linear" style="font-size: 20px" />
                <span>清理所有数据</span>
              </div>
              <Icon icon="solar:alt-arrow-right-linear" class="row-arrow" />
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
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent 
} from '@ionic/vue';
import { Icon } from '@iconify/vue';
import { useLibraryStore } from '@/stores/library';
import { ElMessageBox, ElMessage } from 'element-plus';
import localforage from 'localforage';
import { useDark } from '@vueuse/core';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { useRouter } from 'vue-router';

const libraryStore = useLibraryStore();
const router = useRouter();
const importInput = ref<HTMLInputElement | null>(null);
const isExporting = ref(false);
const isAppDarkMode = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'ion-palette-dark',
  valueLight: '',
});

onMounted(async () => {
  await libraryStore.initStore();
});

const completedCount = computed(() =>
  libraryStore.books.filter(b => b.progress >= 99).length
);

const totalNotesCount = computed(() =>
  libraryStore.books.reduce((acc, b) => acc + (b.notes?.length || 0), 0)
);

const totalBookmarksCount = computed(() =>
  libraryStore.books.reduce((acc, b) => acc + (b.bookmarks?.length || 0), 0)
);

const recentBooks = computed(() =>
  [...libraryStore.books]
    .filter(b => b.lastReadAt)
    .sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0))
    .slice(0, 3)
);

const formatStats = computed(() => {
  const total = libraryStore.books.length || 1;
  const counts: Record<string, number> = { txt: 0, epub: 0, pdf: 0 };
  for (const b of libraryStore.books) counts[b.format]++;
  return [
    { format: 'txt', label: 'TXT 文本', count: counts.txt, percent: (counts.txt / total) * 100 },
    { format: 'epub', label: 'EPUB', count: counts.epub, percent: (counts.epub / total) * 100 },
    { format: 'pdf', label: 'PDF', count: counts.pdf, percent: (counts.pdf / total) * 100 },
  ];
});

const openBook = (book: any) => {
  router.push(`/reader/${book.id}`);
};

const formatTime = (timestamp?: number) => {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
  return new Date(timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

const exportData = async () => {
  if (isExporting.value) return;
  isExporting.value = true;

  try {
    ElMessage.info('正在打包数据...');
    const books = libraryStore.books;
    const exportData: any = {
      version: 1,
      exportedAt: Date.now(),
      app: 'Kianer Reader',
      books: [],
    };

    for (const book of books) {
      const raw = await localforage.getItem<any>(`book-data-${book.id}`);
      let base64 = '';
      if (raw) {
        const bytes = raw instanceof Blob ? new Uint8Array(await raw.arrayBuffer()) : new Uint8Array(raw);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        base64 = btoa(binary);
      }
      exportData.books.push({ ...book, _fileDataBase64: base64 });
    }

    const jsonStr = JSON.stringify(exportData, null, 2);
    const fileName = `kianer-backup-${new Date().toISOString().slice(0, 10)}.json`;

    if (Capacitor.isNativePlatform()) {
      await Filesystem.writeFile({ path: fileName, data: jsonStr, directory: Directory.Cache });
      const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
      await Share.share({ title: 'Kianer Reader 备份', text: `共 ${books.length} 本书`, files: [uri], dialogTitle: '保存备份' });
    } else {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    ElMessage.success(`已导出 ${books.length} 本书`);
  } catch (e) {
    console.error('Export failed:', e);
    ElMessage.error('导出失败');
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
    const text = await file.text();
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
      const { _fileDataBase64, ...meta } = b;
      return meta;
    });

    for (const bookData of data.books) {
      const { _fileDataBase64 } = bookData;
      if (_fileDataBase64) {
        const binaryStr = atob(_fileDataBase64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
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

const confirmClearData = async () => {
  const confirmed = await ElMessageBox.confirm(
    '确定要清理所有数据吗？此操作不可恢复！',
    '警告',
    { confirmButtonText: '确认清理', cancelButtonText: '取消', type: 'warning', roundButton: true, customClass: 'glass-message-box', confirmButtonClass: 'el-button--danger' }
  ).catch(() => false);
  if (!confirmed) return;

  for (const book of libraryStore.books) await localforage.removeItem(`book-data-${book.id}`);
  await localforage.removeItem('kianer-library-metadata');
  libraryStore.books = [];
  ElMessage.success('所有数据已清理');
};
</script>

<style scoped lang="less">
.profile-toolbar {
  --background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
}

.profile-content {
  --background: #f4f7f6;
  position: relative;
  .glass-background {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
    opacity: 0.12;
    z-index: -1;
  }
}

.profile-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.07);
}

/* ── Summary Grid ── */

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  .summary-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 18px 10px 16px;
  }

  .card-icon-top {
    font-size: 28px;
    color: #409eff;
    opacity: 0.6;
    margin-bottom: 2px;
  }

  .card-value {
    font-size: 26px;
    font-weight: 800;
    color: #1e293b;
    line-height: 1.1;
  }

  .card-label {
    font-size: 12px;
    color: #64748b;
    font-weight: 500;
  }
}

/* ── Insight Section ── */

.insight-section {
  padding: 18px 20px;

  h3 {
    margin: 0 0 14px 0;
    font-size: 15px;
    font-weight: 700;
    color: #334155;
  }
}

/* ── Format Distribution ── */

.format-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .format-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .format-left {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 80px;
  }

  .format-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    &.txt  { background: #f59e0b; }
    &.epub { background: #10b981; }
    &.pdf  { background: #ef4444; }
  }

  .format-name {
    font-size: 13px;
    color: #475569;
    font-weight: 500;
  }

  .format-bar-wrap {
    flex: 1;
  }

  .format-bar-bg {
    height: 6px;
    background: #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
  }

  .format-bar-fill {
    height: 100%;
    border-radius: 6px;
    transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    &.txt  { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    &.epub { background: linear-gradient(90deg, #10b981, #34d399); }
    &.pdf  { background: linear-gradient(90deg, #ef4444, #f87171); }
  }

  .format-num {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    min-width: 20px;
    text-align: right;
  }
}

/* ── Recent List ── */

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .recent-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    cursor: pointer;
    transition: background 0.2s;
    border-radius: 12px;
    margin: 0 -8px;
    padding: 10px 8px;

    &:active {
      background: rgba(0, 0, 0, 0.03);
    }
  }

  .recent-cover {
    width: 40px;
    height: 52px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: #e2e8f0;
    color: #64748b;

    &.epub { background: #f0fdf4; color: #166534; }
    &.pdf  { background: #fef2f2; color: #991b1b; }
    &.txt  { background: #fffbeb; color: #854d0e; }
  }

  .recent-icon { font-size: 20px; }

  .recent-info {
    flex: 1;
    min-width: 0;
  }

  .recent-title {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .recent-meta {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 2px;
    display: block;
  }

  .recent-progress {
    height: 3px;
    background: #e5e7eb;
    border-radius: 3px;
    margin-top: 5px;
    overflow: hidden;

    .recent-bar {
      height: 100%;
      background: linear-gradient(90deg, #409eff, #60a5fa);
      border-radius: 3px;
      transition: width 0.4s ease;
    }
  }

  .recent-arrow {
    color: #cbd5e1;
    font-size: 18px;
    flex-shrink: 0;
  }
}

/* ── Settings Group ── */

.settings-group {
  h3 {
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    margin: 0 0 10px 14px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .settings-list {
    overflow: hidden;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    cursor: pointer;
    transition: background 0.2s;

    & + .setting-row {
      border-top: 1px solid rgba(0, 0, 0, 0.04);
    }

    &:active {
      background: rgba(0, 0, 0, 0.03);
    }

    .row-left {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #334155;
      font-size: 14px;
      font-weight: 500;
    }

    .row-arrow {
      color: #94a3b8;
      font-size: 18px;
    }
  }

  .danger-row .row-left {
    color: #ef4444;
  }

  .version-tag {
    font-size: 12px;
    color: #94a3b8;
    background: rgba(0, 0, 0, 0.04);
    padding: 2px 10px;
    border-radius: 10px;
  }

  .danger-hint {
    font-size: 12px;
    color: #94a3b8;
    margin: 10px 14px 0;
    line-height: 1.5;
  }
}

/* ── Dark Mode ── */
html.ion-palette-dark {
  .profile-toolbar { --background: rgba(30, 30, 30, 0.7); }
  .profile-content { --background: #121212; }
  .profile-content .glass-background {
    background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
    opacity: 0.3;
  }
  .glass-card {
    background: rgba(40, 40, 40, 0.7);
    border-color: rgba(255, 255, 255, 0.08);
  }
  .summary-card .card-icon-top { opacity: 0.5; }
  .summary-card .card-value { color: #e2e8f0; }
  .summary-card .card-label { color: #94a3b8; }
  .insight-section h3 { color: #e2e8f0; }
  .format-name { color: #94a3b8; }
  .format-bar-bg { background: #334155; }
  .format-num { color: #e2e8f0; }
  .recent-item:active { background: rgba(255, 255, 255, 0.05); }
  .recent-cover { background: #1e1e1e; }
  .recent-title { color: #e2e8f0; }
  .recent-meta { color: #64748b; }
  .recent-progress { background: #334155; }
  .recent-arrow { color: #475569; }
  .settings-group h3 { color: #94a3b8; }
  .setting-row { border-color: rgba(255, 255, 255, 0.04); }
  .setting-row .row-left { color: #e2e8f0; }
  .setting-row:active { background: rgba(255, 255, 255, 0.05); }
  .row-arrow { color: #64748b; }
  .danger-row .row-left { color: #f87171; }
  .version-tag { color: #64748b; background: rgba(255, 255, 255, 0.08); }
  .danger-hint { color: #64748b; }
}
</style>
