# Changelog

## [1.0.0] — 2026-06-25

### ✨ 新功能

- **阅读器**：支持 EPUB / PDF / TXT 三种格式渲染引擎
- **阅读主题**：明亮、护眼（羊皮纸）、深色三种主题，无闪烁切换
- **阅读设置**：字体大小、行高、字体族、屏幕亮度调节
- **翻页模式**：仿真左右翻页、连续上下滚动
- **全文搜索**：EPUB 逐章节检索、PDF 逐页检索、TXT 全文检索（带正则防护）
- **目录导航**：EPUB 内建目录、PDF 大纲、TXT 章节正则检测
- **书签系统**：支持 EPUB CFI / PDF 页码 / TXT 位置
- **笔记与高亮**：6 种高亮颜色，EPUB 内联高亮持久化
- **阅读进度**：实时保存与恢复，进度条跳转
- **沉浸模式**：自动隐藏状态栏

- **图书管理**：批量导入（格式智能检测）四维排序、重复文件检测
- **数据备份**：完整导出（含书籍文件）gzip 压缩，支持 Android Share 分享；导入自动检测压缩格式
- **阅读洞察**：藏书统计、格式分布、进度环、最近阅读记录
- **个人中心**：夜间模式开关、存储空间显示、数据管理

- **TXT**：中文编码自动检测（BOM→UTF-8→GBK→GB18030）、分页虚拟滚动防 OOM
- **EPUB**：epubjs 主题系统修复（类名作用域 CSS）、字体/行高注入、分页模式切换复用 Book 对象
- **PDF**：缩放独立控制、滚动防抖渲染、智能页码范围、大纲提取

### 🐛 修复

- EPUB 切换主题 2-3 次后失效（CSS 堆积 + DOM 顺序问题 → 类名作用域 CSS 重写）
- EPUB 翻页后高亮丢失（每次 rendered 事件从 IndexedDB 恢复）
- EPUB 首次打开字体大小不生效（started + rendered 双钩子）
- EPUB 分页模式切换太慢（复用 epubBook 对象，提速 ~6x）
- TXT 中文文件乱码（三级编码检测）
- TXT 大文件 OOM（3000 字符/页 + 虚拟滚动）
- TXT 选中事件翻页后监听器堆积（清理 + onUnmounted）
- PDF 缩放与字号耦合（独立 pdfScale 控制）
- PDF 滚动反复渲染（100ms 防抖）
- Android 导出备份 `writeFile` 失败（gzip 压缩绕开 Binder 1MB 限制）
- Capacitor Share 同时传 `text` + `files` 导致 Android 崩溃
- 阅读器 night 主题与 App 深色模式不同步（watch 联动）
- 设置抽屉自适应高度（el-drawer 内联 height: 30% → auto）
- 设置抽屉关闭按钮深色模式不可见
- 元素 Plus 全局导入肥大（按需加载，构建从 ~24s 降到 ~14s）
- 搜索关键词含特殊字符崩溃（正则转义）
- 搜索结果每章闪屏（批量赋值）
- 搜索大书 OOM（MAX_RESULTS = 100 上限）
- 系统右键菜单干扰选中弹框（iframes 内 + wrapper 上双重阻止）
- `delete (window as any).pdfDoc` 污染（onUnmounted 清理）
- 路由命名 `tab2`/`tab3` → 语义化 `home`/`insights`/`profile`
- CI lint + test + build 流程修复

### 🎨 UI/UX

- 毛玻璃（Glassmorphism）全局设计语言
- 底部弹出选中菜单（SelectionMenu），6 色标记
- 方向感知圆角抽屉（ltr/rtl/btt）
- 进度环 SVG 动画
- 简洁三 Tab 导航（书架 / 洞察 / 我的）

### ⚙️ 工程化

- Vue 3 + TypeScript 6 + Ionic 8 + Capacitor 8 + Vite 8 + Bun
- Pinia 状态管理 + localforage (IndexedDB) 持久化
- Element Plus 按需加载（unplugin）
- Vitest + jsdom 单元测试
- ESLint 10 flat config
- GitHub Actions CI（lint → test → build）
- 双语文档（README.md + README_ZH.md）

---

## [0.0.1] — 2026-06

- 项目初始化，基础阅读器框架搭建
