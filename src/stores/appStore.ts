import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Article, Collection, CrawlJob, ExportJob, PrintSettings, PrintTemplate } from '@/types';
import { generateId } from '@/lib/utils';

// 默认打印设置
const defaultPrintSettings: PrintSettings = {
  fontFamily: 'Inter',
  fontSize: 14,
  lineHeight: 1.8,
  margin: 20,
  layout: 'single',
  showToc: true,
  showCover: true,
  showPageNumber: true,
  pageSize: 'A4',
  primaryColor: '#0ea5e9',
};

// 排版模板预设
export const printTemplates: PrintTemplate[] = [
  {
    id: 'simple',
    name: '简约风格',
    description: '简洁清晰，适合阅读',
    preview: 'bg-white text-slate-900',
    settings: {
      ...defaultPrintSettings,
      fontFamily: 'Inter',
      fontSize: 14,
      lineHeight: 1.8,
      margin: 25,
      primaryColor: '#334155',
    },
  },
  {
    id: 'magazine',
    name: '杂志风格',
    description: '双栏排版，视觉丰富',
    preview: 'bg-gradient-to-br from-slate-50 to-slate-100',
    settings: {
      ...defaultPrintSettings,
      fontFamily: 'Georgia',
      fontSize: 12,
      lineHeight: 1.6,
      margin: 15,
      layout: 'double',
      primaryColor: '#a855f7',
    },
  },
  {
    id: 'academic',
    name: '学术风格',
    description: '规范正式，适合论文',
    preview: 'bg-white',
    settings: {
      ...defaultPrintSettings,
      fontFamily: 'Times New Roman',
      fontSize: 12,
      lineHeight: 2,
      margin: 30,
      showToc: true,
      primaryColor: '#1e40af',
    },
  },
  {
    id: 'custom',
    name: '自定义',
    description: '自由设置所有参数',
    preview: 'bg-slate-200',
    settings: defaultPrintSettings,
  },
];

interface AppState {
  // 数据
  articles: Article[];
  collections: Collection[];
  crawlJobs: CrawlJob[];
  exportJobs: ExportJob[];
  
  // UI状态
  selectedArticles: string[];
  currentCollection: Collection | null;
  printSettings: PrintSettings;
  
  // 文章操作
  addArticle: (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => Article;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  getArticle: (id: string) => Article | undefined;
  
  // 采集任务操作
  addCrawlJob: (job: Omit<CrawlJob, 'id' | 'createdAt' | 'updatedAt'>) => CrawlJob;
  updateCrawlJob: (id: string, updates: Partial<CrawlJob>) => void;
  
  // 导出任务操作
  addExportJob: (job: Omit<ExportJob, 'id' | 'createdAt' | 'updatedAt'>) => ExportJob;
  updateExportJob: (id: string, updates: Partial<ExportJob>) => void;
  
  // 合集操作
  addCollection: (name: string, articleIds: string[], template?: string) => Collection;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  
  // 选择操作
  toggleArticleSelection: (id: string) => void;
  selectAllArticles: () => void;
  clearSelection: () => void;
  
  // 打印设置
  updatePrintSettings: (updates: Partial<PrintSettings>) => void;
  applyTemplate: (templateId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      articles: [],
      collections: [],
      crawlJobs: [],
      exportJobs: [],
      selectedArticles: [],
      currentCollection: null,
      printSettings: defaultPrintSettings,
      
      // 文章操作
      addArticle: (articleData) => {
        const article: Article = {
          ...articleData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ articles: [...state.articles, article] }));
        return article;
      },
      
      updateArticle: (id, updates) => {
        set((state) => ({
          articles: state.articles.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        }));
      },
      
      deleteArticle: (id) => {
        set((state) => ({
          articles: state.articles.filter((a) => a.id !== id),
          selectedArticles: state.selectedArticles.filter((sid) => sid !== id),
        }));
      },
      
      getArticle: (id) => {
        return get().articles.find((a) => a.id === id);
      },
      
      // 采集任务操作
      addCrawlJob: (jobData) => {
        const job: CrawlJob = {
          ...jobData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ crawlJobs: [...state.crawlJobs, job] }));
        return job;
      },
      
      updateCrawlJob: (id, updates) => {
        set((state) => ({
          crawlJobs: state.crawlJobs.map((j) =>
            j.id === id ? { ...j, ...updates, updatedAt: new Date().toISOString() } : j
          ),
        }));
      },
      
      // 导出任务操作
      addExportJob: (jobData) => {
        const job: ExportJob = {
          ...jobData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ exportJobs: [...state.exportJobs, job] }));
        return job;
      },
      
      updateExportJob: (id, updates) => {
        set((state) => ({
          exportJobs: state.exportJobs.map((j) =>
            j.id === id ? { ...j, ...updates, updatedAt: new Date().toISOString() } : j
          ),
        }));
      },
      
      // 合集操作
      addCollection: (name, articleIds, template = 'simple') => {
        const templateData = printTemplates.find((t) => t.id === template);
        const collection: Collection = {
          id: generateId(),
          name,
          articleIds,
          template: template as Collection['template'],
          settings: templateData?.settings || defaultPrintSettings,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ collections: [...state.collections, collection] }));
        return collection;
      },
      
      updateCollection: (id, updates) => {
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },
      
      deleteCollection: (id) => {
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        }));
      },
      
      // 选择操作
      toggleArticleSelection: (id) => {
        set((state) => ({
          selectedArticles: state.selectedArticles.includes(id)
            ? state.selectedArticles.filter((sid) => sid !== id)
            : [...state.selectedArticles, id],
        }));
      },
      
      selectAllArticles: () => {
        set((state) => ({
          selectedArticles: state.articles.map((a) => a.id),
        }));
      },
      
      clearSelection: () => {
        set({ selectedArticles: [] });
      },
      
      // 打印设置
      updatePrintSettings: (updates) => {
        set((state) => ({
          printSettings: { ...state.printSettings, ...updates },
        }));
      },
      
      applyTemplate: (templateId) => {
        const template = printTemplates.find((t) => t.id === templateId);
        if (template) {
          set({ printSettings: template.settings });
        }
      },
    }),
    {
      name: 'sample-app-storage',
      partialize: (state) => ({
        articles: state.articles,
        collections: state.collections,
        printSettings: state.printSettings,
      }),
    }
  )
);
