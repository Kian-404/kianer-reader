import ePub from 'epubjs';
import * as pdfjsLib from 'pdfjs-dist';

const createEpub = ePub as unknown as (data: ArrayBuffer) => any;

// Set up PDF.js worker using the local file we copied to public
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

export interface BookMetadata {
  title: string;
  author: string;
  cover?: string;
}

export const extractMetadata = async (file: File, format: 'txt' | 'epub' | 'pdf'): Promise<BookMetadata> => {
  const metadata: BookMetadata = {
    title: file.name.replace(/\.[^/.]+$/, ''),
    author: '未知作者'
  };

  try {
    if (format === 'epub') {
      const book = createEpub(await file.arrayBuffer());
      const meta = await book.loaded.metadata;
      metadata.title = meta.title || metadata.title;
      metadata.author = meta.creator || metadata.author;
      
      const coverUrl = await book.coverUrl();
      if (coverUrl) {
        // coverUrl from epubjs is often a blob: URL, which is destroyed on page reload.
        // We must convert it to a base64 Data URL for persistent storage in IndexedDB.
        try {
          const response = await fetch(coverUrl);
          const blob = await response.blob();
          metadata.cover = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.error('Failed to convert EPUB cover blob to base64', e);
          metadata.cover = coverUrl; // fallback
        }
      }
    } else if (format === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const info = await pdf.getMetadata();
      
      if (info.info) {
        metadata.title = (info.info as any).Title || metadata.title;
        metadata.author = (info.info as any).Author || metadata.author;
      }

      // Extract first page as cover (JPEG for smaller storage)
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.8 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        await page.render({ canvasContext: context, viewport, canvas }).promise;
        metadata.cover = canvas.toDataURL('image/jpeg', 0.75);
      }
    }
  } catch (error) {
    console.error('Metadata extraction failed:', error);
  }

  return metadata;
};

type BookFormat = 'txt' | 'epub' | 'pdf';

/**
 * 根据文件名扩展名检测格式（轻量，Wi-Fi 传书用）
 */
export function detectFormatByName(name: string): BookFormat | null {
  const lower = name.toLowerCase().trim();
  if (lower.endsWith('.txt')) return 'txt';
  if (lower.endsWith('.epub')) return 'epub';
  if (lower.endsWith('.pdf')) return 'pdf';
  return null;
}

/**
 * 综合检测文件格式：Magic number → 扩展名 → MIME type 三级兜底
 * 用于文件导入（用户可能无扩展名或 MIME 不准确）
 */
export async function detectFormat(file: File): Promise<BookFormat | null> {
  const fileName = (file.name || '').toLowerCase().trim();

  // 1. 扩展名快速判断
  const byExt = detectFormatByName(fileName);
  if (byExt) return byExt;

  // 2. Magic number 嗅探
  try {
    const headerBlob = file.slice(0, 4);
    const headerBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(headerBlob);
    });
    const view = new Uint8Array(headerBuffer);
    if (view[0] === 0x25 && view[1] === 0x50 && view[2] === 0x44 && view[3] === 0x46) return 'pdf';
    if (view[0] === 0x50 && view[1] === 0x4b) return 'epub';
  } catch {
    // 降级
  }

  // 3. MIME type 兜底
  const mime = (file.type || '').toLowerCase();
  if (mime === 'text/plain' || mime.includes('text/') || mime.includes('json')) return 'txt';
  if (mime === 'application/epub+zip' || mime === 'application/zip' || mime === 'application/x-zip-compressed') return 'epub';
  if (mime === 'application/pdf' || mime === 'application/x-pdf') return 'pdf';
  if (mime === 'application/octet-stream') {
    if (fileName.includes('epub') || !fileName.includes('.')) return 'epub';
  }

  return null;
}
