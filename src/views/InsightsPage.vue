<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="insight-toolbar">
        <ion-title class="ion-text-center">阅读洞察</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="insight-content">
      <!-- Dynamic background -->
      <BgOrbs color1="#a78bfa" color2="#f59e0b" color3="#34d399" />

      <div class="insight-container">
        <!-- Hero section -->
        <div class="hero-section">
          <div class="hero-greeting">
            <span class="greeting-icon">📖</span>
            <div class="greeting-text">
              <p class="greeting-line1">{{ greeting }}</p>
              <p class="greeting-line2">共 {{ libraryStore.books.length }} 本书</p>
            </div>
          </div>
        </div>

        <!-- Summary grid -->
        <div class="summary-grid stagger-items">
          <div class="summary-card" v-for="card in summaryCards" :key="card.label">
            <div class="sc-icon" :style="{ background: card.gradient }">
              <Icon :icon="card.icon" />
            </div>
            <div class="sc-body">
              <span class="sc-value">{{ card.value }}</span>
              <span class="sc-label">{{ card.label }}</span>
            </div>
          </div>
        </div>

        <!-- Progress + Stats row -->
        <div class="dual-section stagger-items">
          <!-- Progress ring -->
          <div class="ring-card">
            <h3 class="section-title">阅读进度</h3>
            <div class="ring-wrapper">
              <svg viewBox="0 0 140 140" class="progress-ring">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#a78bfa" />
                    <stop offset="100%" stop-color="#f59e0b" />
                  </linearGradient>
                </defs>
                <circle cx="70" cy="70" r="60" fill="none" stroke="currentColor" class="ring-bg" stroke-width="10" />
                <circle
                  cx="70" cy="70" r="60"
                  fill="none"
                  stroke="url(#ringGrad)"
                  stroke-width="10"
                  stroke-linecap="round"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="ringOffset"
                  transform="rotate(-90 70 70)"
                  class="ring-arc"
                />
                <text x="70" y="58" text-anchor="middle" class="ring-value" fill="#1e293b">
                  {{ Math.round(averageProgress) }}%
                </text>
                <text x="70" y="80" text-anchor="middle" class="ring-label" fill="#64748b">
                  平均进度
                </text>
              </svg>
            </div>
            <div class="legend-strip">
              <div class="legend-item">
                <span class="lg-dot" style="background:#a78bfa"></span>
                <span>已完成 {{ completedBooksCount }}</span>
              </div>
              <div class="legend-item">
                <span class="lg-dot" style="background:#f59e0b"></span>
                <span>阅读中 {{ readingBooksCount }}</span>
              </div>
              <div class="legend-item">
                <span class="lg-dot" style="background:#94a3b8"></span>
                <span>未开始 {{ unreadBooksCount }}</span>
              </div>
            </div>
          </div>

          <!-- By the numbers -->
          <div class="stats-grid">
            <div class="stat-cell">
              <span class="stat-num">{{ totalBookmarks }}</span>
              <span class="stat-label">书签</span>
            </div>
            <div class="stat-cell">
              <span class="stat-num">{{ totalNotes }}</span>
              <span class="stat-label">笔记</span>
            </div>
            <div class="stat-cell">
              <span class="stat-num">{{ libraryStore.books.length }}</span>
              <span class="stat-label">藏书</span>
            </div>
            <div class="stat-cell">
              <span class="stat-num">{{ displaySize.split(' ')[0] }}</span>
              <span class="stat-label">{{ displaySize.split(' ')[1] }}</span>
            </div>
          </div>
        </div>

        <!-- Recent reading -->
        <div class="recent-section">
          <div class="section-header">
            <h3 class="section-title">最近阅读</h3>
            <button class="see-all-btn" @click="router.push('/tabs/home')">
              查看全部
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          <div v-if="recentBooks.length === 0" class="empty-state">
            <div class="empty-icon">📚</div>
            <p>暂无阅读记录</p>
            <span>开启您的阅读之旅吧</span>
          </div>

          <div v-else class="recent-list">
            <div
              v-for="(book, i) in recentBooks"
              :key="book.id"
              class="recent-card"
              :style="{ '--i': i }"
              @click="openBook(book)"
            >
              <div class="rc-cover">
                <img
                  v-if="book.cover && !brokenCovers.has(book.id)"
                  :src="book.cover"
                  :alt="book.title"
                  @error="onCoverError(book.id)"
                  @load="onCoverLoad"
                />
                <div v-else class="rc-default" :class="book.format">
                  <Icon
                    :icon="book.format === 'pdf' ? 'solar:file-pdf-linear' : (book.format === 'epub' ? 'solar:notebook-linear' : 'solar:document-text-linear')"
                  />
                </div>
              </div>
              <div class="rc-body">
                <div class="rc-top">
                  <h4 class="rc-title">{{ book.title }}</h4>
                  <span class="rc-tag" :class="book.format">{{ book.format.toUpperCase() }}</span>
                </div>
                <p class="rc-meta">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {{ formatTime(book.lastReadAt) }}
                </p>
                <div class="rc-bar">
                  <div class="rc-bar-fill" :style="{ width: book.progress + '%' }"></div>
                </div>
                <span class="rc-pct">{{ Math.round(book.progress) }}%</span>
              </div>
            </div>
          </div>
        </div>
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
import { useLibraryStore, type Book } from '@/stores/library';
import { useRouter } from 'vue-router';
import BgOrbs from '@/components/BgOrbs.vue';

const libraryStore = useLibraryStore();
const router = useRouter();

const brokenCovers = ref(new Set<string>());
const onCoverError = (id: string) => {
  brokenCovers.value = new Set([...brokenCovers.value, id]);
};
const onCoverLoad = (e: Event) => {
  (e.target as HTMLElement).classList.add('loaded');
};

onMounted(async () => {
  await libraryStore.initStore();
  // Stagger entry
  requestAnimationFrame(() => {
    document.querySelectorAll('.stagger-items').forEach((el, i) => {
      (el as HTMLElement).style.setProperty('--delay', String(i * 0.1));
    });
  });
});

// ── Greeting ──
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了，还在读书';
  if (hour < 9) return '早安，新的一天';
  if (hour < 12) return '上午好，适合读书';
  if (hour < 14) return '中午好，小憩一下';
  if (hour < 18) return '下午好，继续阅读';
  return '晚上好，放松一下';
});

// ── Stats ──
const completedBooksCount = computed(() =>
  libraryStore.books.filter(b => b.progress >= 99).length
);
const readingBooksCount = computed(() =>
  libraryStore.books.filter(b => b.progress > 0 && b.progress < 99).length
);
const unreadBooksCount = computed(() =>
  libraryStore.books.filter(b => b.progress === 0).length
);

const totalBookmarks = computed(() => libraryStore.totalBookmarks);
const totalNotes = computed(() => libraryStore.totalNotes);

const averageProgress = computed(() => {
  if (libraryStore.books.length === 0) return 0;
  const total = libraryStore.books.reduce((acc, b) => acc + b.progress, 0);
  return total / libraryStore.books.length;
});

// ── Summary cards ──
const displaySize = computed(() => libraryStore.formatSize(libraryStore.totalSize));
const summaryCards = computed(() => [
  { label: '藏书总量', value: libraryStore.books.length, icon: 'solar:box-linear', gradient: 'linear-gradient(135deg, #a78bfa20, #7c3aed20)' },
  { label: '已读完', value: completedBooksCount.value, icon: 'solar:check-circle-linear', gradient: 'linear-gradient(135deg, #34d39920, #10b98120)' },
  { label: '阅读中', value: readingBooksCount.value, icon: 'solar:book-linear', gradient: 'linear-gradient(135deg, #fbbf2420, #f59e0b20)' },
  { label: '笔记总数', value: totalNotes.value, icon: 'solar:pen-new-square-linear', gradient: 'linear-gradient(135deg, #f472b620, #ec489920)' },
]);

// ── SVG Ring ──
const circumference = 2 * Math.PI * 60; // r=60
const ringOffset = computed(() => {
  const pct = Math.min(averageProgress.value, 100);
  return circumference - (circumference * pct) / 100;
});

// ── Recent books ──
const recentBooks = computed(() => {
  return [...libraryStore.books]
    .filter((b: Book) => b.lastReadAt)
    .sort((a: Book, b: Book) => (b.lastReadAt || 0) - (a.lastReadAt || 0))
    .slice(0, 5);
});

const openBook = (book: Book) => {
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
</script>

<style scoped lang="less">
// ── Toolbar ──
.insight-toolbar {
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
.insight-content {
  --background: #f8f6f3;

  &.ion-palette-dark {
    --background: #0c0a1a;
  }
}

// ── Container ──
.insight-container {
  position: relative;
  z-index: 1;
  padding: 0 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// ── Hero ──
.hero-section {
  padding: 24px 0 8px;
  transition: transform 0.1s linear, opacity 0.1s linear;
}

.hero-greeting {
  display: flex;
  align-items: center;
  gap: 14px;

  .greeting-icon {
    font-size: 36px;
    line-height: 1;
  }

  .greeting-text {
    .greeting-line1 {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      color: #1e293b;
      letter-spacing: -0.02em;
    }
    .greeting-line2 {
      margin: 4px 0 0;
      font-size: 14px;
      color: #94a3b8;
      font-weight: 500;
    }
  }
}

// ── Summary Cards ──
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  animation: fadeUp 0.5s ease both;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:active {
    transform: scale(0.97);
  }

  .sc-icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 20px;
    color: #475569;
  }

  .sc-body {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .sc-value {
      font-size: 24px;
      font-weight: 800;
      color: #1e293b;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }
    .sc-label {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 500;
    }
  }
}

// ── Dual Section ──
.dual-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeUp 0.5s ease both;
}

.section-title {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 700;
  color: #334155;
  letter-spacing: 0.01em;
}

// ── Ring Card ──
.ring-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 22px 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.ring-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.progress-ring {
  width: 140px;
  height: 140px;

  .ring-bg {
    color: #e5e7eb;
  }

  .ring-arc {
    transition: stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .ring-value { font-size: 26px; font-weight: 800; }
  .ring-label { font-size: 11px; letter-spacing: 0.02em; }
}

.legend-strip {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #64748b;
    font-weight: 500;

    .lg-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
  }
}

// ── Stats Grid ──
.stats-grid {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 18px 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.stat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 6px;
  border-radius: 12px;

  .stat-num {
    font-size: 26px;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 2px;
    font-weight: 500;
  }
}

// ── Recent Section ──
.recent-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;

    .section-title { margin-bottom: 0; }
  }

  .see-all-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    font-size: 13px;
    font-weight: 600;
    color: #a78bfa;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 8px;
    transition: background 0.2s;

    &:active {
      background: rgba(167, 139, 250, 0.1);
    }
  }
}

.empty-state {
  text-align: center;
  padding: 48px 20px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);

  .empty-icon { font-size: 48px; margin-bottom: 12px; }
  p { margin: 0; font-weight: 600; color: #475569; font-size: 15px; }
  span { font-size: 13px; color: #94a3b8; }
}

// ── Recent Cards ──
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-card {
  display: flex;
  gap: 16px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  animation: fadeUp 0.4s ease both;
  animation-delay: calc(var(--i, 0) * 0.06s + 0.3s);

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }
}

.rc-cover {
  width: 52px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.4s ease;

    &.loaded { opacity: 1; }
  }

  .rc-default {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;

    &.epub { background: #f0fdf4; color: #166534; }
    &.pdf  { background: #fef2f2; color: #991b1b; }
    &.txt  { background: #fffbeb; color: #854d0e; }
  }
}

.rc-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  position: relative;

  .rc-top {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rc-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rc-tag {
    font-size: 9px;
    font-weight: 800;
    padding: 1px 6px;
    border-radius: 4px;
    flex-shrink: 0;
    letter-spacing: 0.5px;

    &.txt  { background: #fffbeb; color: #b45309; }
    &.epub { background: #f0fdf4; color: #166534; }
    &.pdf  { background: #fef2f2; color: #991b1b; }
  }

  .rc-meta {
    margin: 0;
    font-size: 11px;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .rc-bar {
    width: 100%;
    height: 4px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 2px;
  }

  .rc-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #a78bfa, #f59e0b);
    border-radius: 4px;
    transition: width 0.4s ease;
  }

  .rc-pct {
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: 11px;
    font-weight: 700;
    color: #a78bfa;
  }
}

// ── Animations ──
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}</style>

<style lang="less">
/* ── Dark Mode (non-scoped, 全局生效) ── */

html.ion-palette-dark .insight-toolbar {
  --color: #e2e8f0;
  --background: rgba(12, 10, 26, 0.95);
}

html.ion-palette-dark .insight-content {
  --background: #0c0a1a;
}

html.ion-palette-dark .hero-greeting .greeting-text .greeting-line1 {
  color: #e2e8f0;
}

html.ion-palette-dark .hero-greeting .greeting-text .greeting-line2 {
  color: #64748b;
}

html.ion-palette-dark .summary-card {
  background: rgba(30, 30, 50, 0.7);
  border-color: rgba(255, 255, 255, 0.06);
}
html.ion-palette-dark .summary-card .sc-value { color: #e2e8f0; }
html.ion-palette-dark .summary-card .sc-label { color: #64748b; }

html.ion-palette-dark .ring-card {
  background: rgba(30, 30, 50, 0.7);
  border-color: rgba(255, 255, 255, 0.06);
}

html.ion-palette-dark .stats-grid {
  background: rgba(30, 30, 50, 0.7);
  border-color: rgba(255, 255, 255, 0.06);
}

html.ion-palette-dark .empty-state {
  background: rgba(30, 30, 50, 0.7);
  border-color: rgba(255, 255, 255, 0.06);
}

html.ion-palette-dark .recent-card {
  background: rgba(30, 30, 50, 0.7);
  border-color: rgba(255, 255, 255, 0.06);
}

html.ion-palette-dark .legend-strip .legend-item {
  color: #64748b;
}

html.ion-palette-dark .section-title {
  color: #e2e8f0;
}

html.ion-palette-dark .progress-ring .ring-bg {
  color: #1e1e38;
}

html.ion-palette-dark .ring-value {
  fill: #e2e8f0 !important;
}

html.ion-palette-dark .ring-label {
  fill: #94a3b8 !important;
}

html.ion-palette-dark .stat-cell .stat-num {
  color: #e2e8f0;
}

html.ion-palette-dark .stat-cell .stat-label {
  color: #64748b;
}

html.ion-palette-dark .recent-card .rc-body .rc-title {
  color: #e2e8f0;
}

html.ion-palette-dark .recent-card .rc-body .rc-meta {
  color: #64748b;
}

html.ion-palette-dark .recent-card .rc-body .rc-bar {
  background: #1e1e38;
}

html.ion-palette-dark .recent-card .rc-body .rc-pct {
  color: #a78bfa;
}

html.ion-palette-dark .recent-card .rc-cover .rc-default.txt {
  background: #1a1400; color: #f59e0b;
}
html.ion-palette-dark .recent-card .rc-cover .rc-default.epub {
  background: #001a0e; color: #34d399;
}
html.ion-palette-dark .recent-card .rc-cover .rc-default.pdf {
  background: #1a0000; color: #f87171;
}

html.ion-palette-dark .recent-card .rc-body .rc-tag.txt {
  background: #1a1400; color: #f59e0b;
}
html.ion-palette-dark .recent-card .rc-body .rc-tag.epub {
  background: #001a0e; color: #34d399;
}
html.ion-palette-dark .recent-card .rc-body .rc-tag.pdf {
  background: #1a0000; color: #f87171;
}

html.ion-palette-dark .bg-orb-1 { opacity: 0.08; }
html.ion-palette-dark .bg-orb-2 { opacity: 0.08; }
html.ion-palette-dark .bg-orb-3 { opacity: 0.05; }

html.ion-palette-dark .see-all-btn { color: #a78bfa; }

html.ion-palette-dark .empty-state p { color: #cbd5e1; }
html.ion-palette-dark .empty-state span { color: #64748b; }
</style>
