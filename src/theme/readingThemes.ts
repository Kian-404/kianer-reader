/**
 * 阅读器主题预设定义
 * 每个主题定义一套完整的 CSS 变量值
 */

export interface ReadingTheme {
  /** 主题唯一标识 */
  name: ThemeName;
  /** 主题中文标签 */
  label: string;
  /** 主题描述 */
  desc: string;
  /** 主题色（选择器圆形颜色） */
  swatch: string;
  /** CSS 变量键值对 */
  vars: Record<string, string>;
}

export type ThemeName =
  | 'day'
  | 'parchment'
  | 'green'
  | 'gray'
  | 'night'
  | 'ink';

export const READING_THEMES: Record<ThemeName, ReadingTheme> = {
  day: {
    name: 'day',
    label: '明亮白',
    desc: '纯净白底，清晰阅读',
    swatch: '#ffffff',
    vars: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f8fafc',
      '--text-primary': '#333333',
      '--text-secondary': '#64748b',
      '--border-color': '#e2e8f0',
      '--accent-color': '#409eff',
      '--shadow-color': 'rgba(0, 0, 0, 0.08)',
    },
  },
  parchment: {
    name: 'parchment',
    label: '羊皮纸',
    desc: '暖黄纸页，护眼柔和',
    swatch: '#f4ecd8',
    vars: {
      '--bg-primary': '#f4ecd8',
      '--bg-secondary': '#ede3c9',
      '--text-primary': '#5b4636',
      '--text-secondary': '#8b7355',
      '--border-color': '#e0d5b8',
      '--accent-color': '#c9a96e',
      '--shadow-color': 'rgba(91, 70, 54, 0.08)',
    },
  },
  green: {
    name: 'green',
    label: '护眼绿',
    desc: '柔绿底色，缓解疲劳',
    swatch: '#c7edcc',
    vars: {
      '--bg-primary': '#c7edcc',
      '--bg-secondary': '#b8e3be',
      '--text-primary': '#3a5a3e',
      '--text-secondary': '#6a8a6e',
      '--border-color': '#a8d4ae',
      '--accent-color': '#5b9f61',
      '--shadow-color': 'rgba(58, 90, 62, 0.08)',
    },
  },
  gray: {
    name: 'gray',
    label: '极简灰',
    desc: '素净灰调，低调优雅',
    swatch: '#ececec',
    vars: {
      '--bg-primary': '#ececec',
      '--bg-secondary': '#e2e2e2',
      '--text-primary': '#3a3a3a',
      '--text-secondary': '#7a7a7a',
      '--border-color': '#d4d4d4',
      '--accent-color': '#6b7280',
      '--shadow-color': 'rgba(0, 0, 0, 0.06)',
    },
  },
  night: {
    name: 'night',
    label: '深色暗黑',
    desc: '纯黑底色，夜间沉浸',
    swatch: '#1a1a1a',
    vars: {
      '--bg-primary': '#1a1a1a',
      '--bg-secondary': '#252525',
      '--text-primary': '#e0e0e0',
      '--text-secondary': '#888888',
      '--border-color': '#333333',
      '--accent-color': '#60a5fa',
      '--shadow-color': 'rgba(0, 0, 0, 0.3)',
    },
  },
  ink: {
    name: 'ink',
    label: '墨绿黑',
    desc: '深绿基底，沉浸护眼',
    swatch: '#1a2b22',
    vars: {
      '--bg-primary': '#1a2b22',
      '--bg-secondary': '#22382b',
      '--text-primary': '#d4e0d8',
      '--text-secondary': '#8a9e92',
      '--border-color': '#2d4434',
      '--accent-color': '#6abf7a',
      '--shadow-color': 'rgba(0, 0, 0, 0.4)',
    },
  },
};

/** 按顺序排列的主题名称列表（UI 展示顺序） */
export const THEME_ORDER: ThemeName[] = [
  'day',
  'parchment',
  'green',
  'gray',
  'night',
  'ink',
];

/** 获取所有主题的扁平数组（按 UI 顺序） */
export function getThemes(): ReadingTheme[] {
  return THEME_ORDER.map((name) => READING_THEMES[name]);
}

/** 判断是否为深色主题 */
export function isDarkTheme(name: ThemeName): boolean {
  return name === 'night' || name === 'ink';
}
