<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="lib-toolbar">
        <ion-title class="ion-text-center">我的书架</ion-title>
        <ion-buttons slot="end">
          <button class="tb-btn" @click="goWifiTransfer" title="Wi-Fi 传书">
            <Icon icon="solar:notebook-square-broken" width="22" height="22" />
          </button>
          <button class="tb-btn tb-btn-primary" @click="triggerFileInput" title="导入书籍">
            <Icon icon="solar:import-linear" width="22" height="22" />
          </button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="lib-content">
      <!-- Background orbs -->
      <BgOrbs color1="#c084fc" color2="#60a5fa" color3="#34d399" />

      <div class="lib-container">
        <!-- Search + Sort -->
        <div class="top-bar">
          <div class="search-wrap">
            <Icon icon="solar:magnifer-linear" class="search-icon" />
            <input
              v-model="searchQuery"
              placeholder="搜索书名或作者..."
              class="search-input"
            />
            <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
              <Icon icon="solar:close-circle-linear" width="18" height="18" />
            </button>
          </div>
          <div class="sort-row">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              :class="['sort-chip', { active: sortBy === opt.value }]"
              @click="sortBy = opt.value"
            >{{ opt.label }}</button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="libraryStore.books.length === 0" class="empty-state">
          <div class="empty-visual">
            <div class="empty-orb"></div>
            <Icon icon="solar:library-linear" class="empty-icon" />
          </div>
          <h3>开启您的阅读之旅</h3>
          <p>导入您的第一本 TXT、EPUB 或 PDF<br/>让文字温暖您的生活</p>
          <button class="import-cta" @click="triggerFileInput">
            <Icon icon="solar:import-linear" width="20" height="20" />
            立即导入书籍
          </button>
        </div>

        <!-- Book Grid -->
        <div v-else class="book-grid">
          <div
            v-for="book in sortedBooks"
            :key="book.id"
            class="book-card"
            :style="{ '--i': sortedBooks.indexOf(book) }"
          >
            <div class="cover-wrap" @click="openBook(book)">
              <img
                v-if="book.cover && !brokenCovers.has(book.id)"
                :src="book.cover"
                :alt="book.title"
                @error="onCoverError(book.id)"
                @load="onCoverLoad"
              />
              <div v-else class="default-cover" :class="book.format">
                <Icon
                  :icon="book.format === 'pdf' ? 'solar:file-pdf-linear' : (book.format === 'epub' ? 'solar:notebook-linear' : 'solar:document-text-linear')"
                  class="dc-icon"
                />
                <span class="dc-label">{{ book.format.toUpperCase() }}</span>
              </div>
              <div class="cover-progress" :style="{ width: book.progress + '%' }"></div>
              <button class="cover-delete" @click.stop="confirmDelete(book)">
                <Icon icon="solar:trash-bin-trash-linear" width="16" height="16" />
              </button>
            </div>
            <div class="book-meta">
              <h4 class="book-title">{{ book.title }}</h4>
              <p class="book-author">{{ book.author || '未知作者' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Hidden File Input -->
      <input
        type="file"
        ref="fileInput"
        style="display: none"
        multiple
        accept=".txt,.epub,.pdf,text/plain,application/pdf,application/epub+zip,application/octet-stream"
        @change="handleFileChange"
      />
    </ion-content>

    <!-- Import Loading -->
    <el-dialog
      v-model="importing"
      title="正在导入..."
      width="80%"
      :show-close="false"
      :close-on-click-modal="false"
      align-center
      class="glass-dialog"
    >
      <div class="loading-content">
        <el-progress type="circle" :percentage="importProgress" />
        <p>请稍候，正在解析书籍内容...</p>
      </div>
    </el-dialog>

    <!-- 删除确认弹框 -->
    <ConfirmSheet
      :visible="showDeleteConfirm"
      title="删除书籍"
      :message="`确定要从书架删除《${bookToDelete?.title || ''}》吗？`"
      confirm-text="删除"
      cancel-text="取消"
      icon="solar:trash-bin-trash-linear"
      :danger="true"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons
} from '@ionic/vue';
import { Icon } from '@iconify/vue';
import { useLibraryStore, type Book } from '../stores/library';
import { extractMetadata, detectFormat } from '../utils/parser';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { isWifiTransferAvailable } from '@/utils/wifiTransfer';
import BgOrbs from '@/components/BgOrbs.vue';
import ConfirmSheet from '@/components/ConfirmSheet.vue';

const libraryStore = useLibraryStore();
const router = useRouter();
const searchQuery = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

/** 确认删除弹框状态 */
const showDeleteConfirm = ref(false);
const bookToDelete = ref<Book | null>(null);

const brokenCovers = ref(new Set<string>());
const onCoverError = (id: string) => {
  brokenCovers.value = new Set([...brokenCovers.value, id]);
};
const onCoverLoad = (e: Event) => {
  (e.target as HTMLElement).classList.add('loaded');
};

const goWifiTransfer = () => {
  if (!isWifiTransferAvailable()) {
    ElMessage.info('Wi-Fi 传书功能仅支持 Android 设备');
    return;
  }
  router.push('/wifi-transfer');
};

const filteredBooks = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return libraryStore.books;
  return libraryStore.books.filter(book =>
    book.title.toLowerCase().includes(query) ||
    (book.author && book.author.toLowerCase().includes(query))
  );
});

type SortType = 'recent' | 'title' | 'progress' | 'import';
const sortBy = ref<SortType>('recent');
const sortOptions = [
  { value: 'recent' as SortType, label: '最近' },
  { value: 'title' as SortType, label: '书名' },
  { value: 'progress' as SortType, label: '进度' },
  { value: 'import' as SortType, label: '导入' },
];
const sortedBooks = computed(() => {
  const list = [...filteredBooks.value];
  switch (sortBy.value) {
    case 'title':
      return list.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
    case 'progress':
      return list.sort((a, b) => b.progress - a.progress);
    case 'import':
      return list.sort((a, b) => b.addedAt - a.addedAt);
    case 'recent':
    default:
      return list.sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0));
  }
});

const importing = ref(false);
const importProgress = ref(0);

onMounted(async () => {
  await libraryStore.initStore();
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const importSingleBook = async (file: File, format: 'txt' | 'epub' | 'pdf'): Promise<boolean> => {
  const meta = await extractMetadata(file, format);
  const book: Book = {
    id: crypto.randomUUID(),
    title: meta.title,
    author: meta.author,
    cover: meta.cover,
    format,
    size: file.size,
    progress: 0,
    addedAt: Date.now(),
    bookmarks: [],
    notes: []
  };
  const fileData = await file.arrayBuffer();
  await libraryStore.addBook(book, fileData);
  return true;
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  importing.value = true;
  importProgress.value = 0;

  const totalFiles = files.length;
  let successCount = 0;
  let failCount = 0;
  let firstError = '';

  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    importProgress.value = Math.round((i / totalFiles) * 100);

    try {
      const format = await detectFormat(file);
      if (!format) {
        failCount++;
        if (!firstError) firstError = `不支持: ${file.name || '无名'}`;
        continue;
      }

      const isDuplicate = libraryStore.books.some(b =>
        (b.title === file.name.replace(/\.[^/.]+$/, "")) &&
        (b.size === file.size)
      );
      if (isDuplicate) continue;

      await Promise.race([
        importSingleBook(file, format),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 15000))
      ]);

      successCount++;
    } catch (err: any) {
      failCount++;
      if (!firstError) firstError = err.message === 'TIMEOUT' ? `${file.name} 导入超时` : `${file.name} 导入失败`;
    }
  }

  importProgress.value = 100;
  setTimeout(() => {
    importing.value = false;
    if (successCount > 0) {
      ElMessage.success(`成功导入 ${successCount} 本${failCount > 0 ? `，${failCount} 本失败` : ''}`);
    } else if (failCount > 0) {
      ElMessage.error(firstError || '全部导入失败');
    }
    target.value = '';
  }, 500);
};

const openBook = (book: Book) => {
  router.push(`/reader/${book.id}`);
};

const confirmDelete = (book: Book) => {
  bookToDelete.value = book;
  showDeleteConfirm.value = true;
};

const handleDeleteConfirm = () => {
  if (bookToDelete.value) {
    libraryStore.removeBook(bookToDelete.value.id);
    ElMessage.success('已删除');
  }
  bookToDelete.value = null;
  showDeleteConfirm.value = false;
};

const handleDeleteCancel = () => {
  bookToDelete.value = null;
  showDeleteConfirm.value = false;
};
</script>

<style scoped lang="less">
// ── Toolbar ──
.lib-toolbar {
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

.tb-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 6px;

  &:active { transform: scale(0.92); }

  &-primary {
    background: rgba(167, 139, 250, 0.12);
    color: #7c3aed;
  }
}

// ── Content ──
.lib-content {
  --background: #f8f6f3;
}

// ── Container ──
.lib-container {
  position: relative;
  z-index: 1;
  padding: 0 16px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

// ── Top Bar (Search + Sort) ──
.top-bar {
  padding: 12px 0 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.2s;

  &:focus-within {
    box-shadow: 0 4px 20px rgba(167, 139, 250, 0.12);
  }

  .search-icon {
    font-size: 18px;
    color: #94a3b8;
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    font-family: inherit;
    color: #1e293b;
    background: transparent;

    &::placeholder { color: #94a3b8; }
  }

  .search-clear {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 2px;
    display: flex;
    transition: color 0.2s;

    &:hover { color: #64748b; }
  }
}

.sort-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.sort-chip {
  font-size: 12px;
  padding: 5px 14px;
  border-radius: 14px;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  color: #94a3b8;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  backdrop-filter: blur(8px);

  &:hover {
    background: rgba(167, 139, 250, 0.1);
    color: #7c3aed;
  }

  &.active {
    background: rgba(167, 139, 250, 0.15);
    color: #7c3aed;
    font-weight: 600;
  }
}

// ── Empty State ──
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 65vh;
  text-align: center;
  animation: fadeUp 0.6s ease both;

  .empty-visual {
    position: relative;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 28px;
  }

  .empty-orb {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(96, 165, 250, 0.1));
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    animation: morph 8s ease-in-out infinite;
  }

  .empty-icon {
    font-size: 60px;
    color: #a78bfa;
    z-index: 1;
    filter: drop-shadow(0 8px 16px rgba(167, 139, 250, 0.25));
  }

  h3 {
    margin: 0 0 10px;
    font-size: 20px;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.02em;
  }

  p {
    margin: 0 0 32px;
    font-size: 14px;
    color: #94a3b8;
    line-height: 1.6;
  }

  .import-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 32px;
    border-radius: 16px;
    border: none;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #a78bfa, #7c3aed);
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.25);
    transition: transform 0.2s, box-shadow 0.2s;
    font-family: inherit;

    &:active {
      transform: scale(0.97);
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
    }
  }
}

@keyframes morph {
  0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
  34% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
  67% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; }
  100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
}

// ── Book Grid ──
.book-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px 10px;
  padding-top: 4px;
}

.book-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  animation: fadeUp 0.5s ease both;
  animation-delay: calc(var(--i, 0) * 0.05s);
  min-width: 0;

  &:active .cover-wrap {
    transform: scale(0.97);
  }
}

.cover-wrap {
  position: relative;
  aspect-ratio: 2 / 3;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  z-index: 1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    opacity: 0;
    transition: opacity 0.4s ease;

    &.loaded { opacity: 1; }
  }

  .default-cover {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .dc-icon {
      font-size: 44px;
      opacity: 0.8;
    }

    .dc-label {
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 2px;
      opacity: 0.9;
    }

    &.epub { background: linear-gradient(135deg, #f0fdf4, #bbf7d0); color: #166534; }
    &.pdf  { background: linear-gradient(135deg, #fef2f2, #fecaca); color: #991b1b; }
    &.txt  { background: linear-gradient(135deg, #fffbeb, #fef08a); color: #854d0e; }
  }

  .cover-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 5px;
    background: linear-gradient(90deg, #a78bfa, #7c3aed);
    transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    border-radius: 0 3px 0 0;
  }

  .cover-delete {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 30px;
    height: 30px;
    border-radius: 10px;
    border: none;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f87171;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 10;
    cursor: pointer;

    &:active {
      transform: scale(0.9);
      background: #fee2e2;
    }
  }

  &:hover .cover-delete {
    opacity: 1;
    transform: scale(1);
  }
}

.book-meta {
  padding: 8px 2px 0;

  .book-title {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.35;
  }

  .book-author {
    margin: 3px 0 0;
    font-size: 11px;
    color: #94a3b8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }
}

// ── Import Loading ──
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
}

// ── Animations ──
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<style lang="less">
/* ── Dark Mode ── */

html.ion-palette-dark .lib-toolbar {
  --color: #e2e8f0;
  --background: rgba(12, 10, 26, 0.95);
}

html.ion-palette-dark .tb-btn {
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;

  &-primary {
    background: rgba(167, 139, 250, 0.15);
    color: #a78bfa;
  }
}

html.ion-palette-dark .lib-content {
  --background: #0c0a1a;
}

html.ion-palette-dark .bg-orb-1 { opacity: 0.08; }
html.ion-palette-dark .bg-orb-2 { opacity: 0.08; }
html.ion-palette-dark .bg-orb-3 { opacity: 0.05; }

html.ion-palette-dark .search-wrap {
  background: rgba(30, 30, 50, 0.7);
  border-color: rgba(255, 255, 255, 0.06);
}
html.ion-palette-dark .search-input { color: #e2e8f0; }

html.ion-palette-dark .sort-chip {
  background: rgba(30, 30, 50, 0.5);
  color: #64748b;
}
html.ion-palette-dark .sort-chip:hover {
  background: rgba(167, 139, 250, 0.12);
  color: #a78bfa;
}
html.ion-palette-dark .sort-chip.active {
  background: rgba(167, 139, 250, 0.18);
  color: #a78bfa;
}

html.ion-palette-dark .empty-state h3 { color: #e2e8f0; }
html.ion-palette-dark .empty-state p { color: #64748b; }
html.ion-palette-dark .empty-orb {
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(96, 165, 250, 0.08));
}

html.ion-palette-dark .cover-wrap {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}
html.ion-palette-dark .book-meta .book-title { color: #e2e8f0; }
html.ion-palette-dark .book-meta .book-author { color: #64748b; }

html.ion-palette-dark .default-cover {
  &.epub { background: linear-gradient(135deg, #064e3b, #065f46); color: #6ee7b7; }
  &.pdf  { background: linear-gradient(135deg, #7f1d1d, #991b1b); color: #fca5a5; }
  &.txt  { background: linear-gradient(135deg, #78350f, #92400e); color: #fde047; }
}

html.ion-palette-dark .cover-delete {
  background: rgba(30, 30, 50, 0.9);
}
</style>
