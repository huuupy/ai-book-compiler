// 用户偏好设置
export interface UserSettings {
  apiKey: string;
  apiEndpoint: string;
  defaultTemplate: 'simple' | 'magazine' | 'academic' | 'custom';
  autoProcess: boolean;
  requestInterval: number;
  maxConcurrency: number;
  theme: 'light' | 'dark' | 'system';
}

// 文章状态枚举
export type ArticleStatus = 'pending' | 'processing' | 'completed' | 'failed';

// 文章接口
export interface Article {
  id: string;
  url: string;
  title: string;
  author?: string;
  publishDate?: string;
  summary: string;
  content: string; // Markdown格式
  tags: string[];
  coverImage?: string;
  source: string;
  status: ArticleStatus;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// 合集接口
export interface Collection {
  id: string;
  name: string;
  description?: string;
  articleIds: string[];
  template: 'simple' | 'magazine' | 'academic' | 'custom';
  settings: PrintSettings;
  createdAt: string;
  updatedAt: string;
}

// 打印设置
export interface PrintSettings {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  margin: number;
  layout: 'single' | 'double';
  showToc: boolean;
  showCover: boolean;
  showPageNumber: boolean;
  pageSize: 'A4' | 'Letter';
  primaryColor: string;
}

// 采集任务状态
export interface CrawlJob {
  id: string;
  urls: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  currentUrl?: string;
  results: CrawlResult[];
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// 采集结果
export interface CrawlResult {
  url: string;
  success: boolean;
  article?: Article;
  error?: string;
}

// 导出任务状态
export interface ExportJob {
  id: string;
  collectionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  filePath?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// 排版模板预设
export interface PrintTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  settings: PrintSettings;
}

// 仪表盘统计数据
export interface DashboardStats {
  totalArticles: number;
  processedArticles: number;
  exportedPdfs: number;
  totalCollections: number;
}

// 任务日志
export interface TaskLog {
  id: string;
  jobId: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

// API响应格式
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
