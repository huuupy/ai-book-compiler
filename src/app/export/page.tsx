'use client';

import { useState, useMemo } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Dropdown } from '@/components/ui/Dropdown';
import { Modal } from '@/components/ui/Modal';
import { TaskProgress } from '@/components/ui/Badge';
import { useAppStore, printTemplates } from '@/stores/appStore';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Article, PrintSettings } from '@/types';
import { 
  FileDown, 
  Settings2, 
  Eye, 
  Download,
  ChevronRight,
  BookOpen,
  Type,
  Ruler,
  Layout,
  Palette,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function ExportPage() {
  const { 
    articles, 
    collections, 
    selectedArticles, 
    toggleArticleSelection, 
    clearSelection,
    printSettings, 
    updatePrintSettings,
    applyTemplate,
    addCollection,
    addExportJob,
    updateExportJob,
  } = useAppStore();

  const [showSettings, setShowSettings] = useState(true);
  const [collectionName, setCollectionName] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  
  // 可选择的文章
  const availableArticles = articles.filter(a => a.status === 'completed');
  
  // 选中的文章对象
  const selectedArticleObjects = useMemo(() => {
    return articles.filter(a => selectedArticles.includes(a.id));
  }, [articles, selectedArticles]);

  const handleApplyTemplate = (templateId: string) => {
    applyTemplate(templateId);
  };

  const handleExport = async () => {
    if (selectedArticles.length === 0) return;
    
    setIsExporting(true);
    setExportProgress(0);
    
    // 创建合集
    const collection = addCollection(
      collectionName || `导出_${new Date().toLocaleDateString('zh-CN')}`,
      selectedArticles,
      'custom'
    );
    
    // 创建导出任务
    const job = addExportJob({
      collectionId: collection.id,
      status: 'running',
      progress: 0,
    });

    try {
      // 模拟导出过程
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setExportProgress(i);
        updateExportJob(job.id, { progress: i });
      }
      
      // 调用API生成PDF
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: selectedArticleObjects,
          settings: printSettings,
          collectionName: collection.name,
        }),
      });
      
      if (!response.ok) throw new Error('PDF生成失败');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collection.name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      updateExportJob(job.id, { status: 'completed', progress: 100 });
      clearSelection();
      setCollectionName('');
      
    } catch (error) {
      updateExportJob(job.id, { status: 'failed', error: error instanceof Error ? error.message : '未知错误' });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // 预览样式
  const previewStyles = `
    font-family: ${printSettings.fontFamily}, sans-serif;
    font-size: ${printSettings.fontSize}px;
    line-height: ${printSettings.lineHeight};
    color: #1e293b;
  `;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">导出中心</h1>
            <p className="text-slate-600">
              选择文章并自定义排版样式，导出精美PDF
            </p>
          </div>
          
          {selectedArticles.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">
                已选择 {selectedArticles.length} 篇文章
              </span>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                取消选择
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Settings */}
          <div className="space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  选择模板
                </h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {printTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleApplyTemplate(template.id)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-left',
                        'hover:border-primary/50 hover:shadow-md',
                        printSettings.fontFamily === template.settings.fontFamily
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200'
                      )}
                    >
                      <div className={cn('w-full h-16 rounded-lg mb-3', template.preview)} />
                      <h3 className="font-medium text-slate-900">{template.name}</h3>
                      <p className="text-xs text-slate-500">{template.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Typography Settings */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Type className="w-5 h-5 text-primary" />
                  排版设置
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="字体"
                  value={printSettings.fontFamily}
                  onChange={(e) => updatePrintSettings({ fontFamily: e.target.value })}
                  options={[
                    { value: 'Inter', label: 'Inter (现代感)' },
                    { value: 'Georgia', label: 'Georgia (经典)' },
                    { value: 'Times New Roman', label: 'Times New Roman (学术)' },
                    { value: 'system-ui', label: '系统默认' },
                  ]}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="字号"
                    value={printSettings.fontSize.toString()}
                    onChange={(e) => updatePrintSettings({ fontSize: Number(e.target.value) })}
                    options={[
                      { value: '12', label: '12pt (小)' },
                      { value: '14', label: '14pt (中)' },
                      { value: '16', label: '16pt (大)' },
                      { value: '18', label: '18pt (特大)' },
                    ]}
                  />
                  
                  <Select
                    label="行高"
                    value={printSettings.lineHeight.toString()}
                    onChange={(e) => updatePrintSettings({ lineHeight: Number(e.target.value) })}
                    options={[
                      { value: '1.4', label: '1.4 (紧凑)' },
                      { value: '1.6', label: '1.6 (标准)' },
                      { value: '1.8', label: '1.8 (宽松)' },
                      { value: '2.0', label: '2.0 (双倍)' },
                    ]}
                  />
                </div>

                <Select
                  label="页边距"
                  value={printSettings.margin.toString()}
                  onChange={(e) => updatePrintSettings({ margin: Number(e.target.value) })}
                  options={[
                    { value: '15', label: '15mm (窄)' },
                    { value: '20', label: '20mm (标准)' },
                    { value: '25', label: '25mm (宽)' },
                    { value: '30', label: '30mm (最宽)' },
                  ]}
                />
              </CardContent>
            </Card>

            {/* Layout Settings */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-primary" />
                  布局选项
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">布局</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => updatePrintSettings({ layout: 'single' })}
                      className={cn(
                        'flex-1 p-4 rounded-xl border-2 transition-all',
                        printSettings.layout === 'single'
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className="w-full h-12 border-2 border-current rounded mb-2" />
                      <p className="text-sm font-medium">单栏</p>
                    </button>
                    <button
                      onClick={() => updatePrintSettings({ layout: 'double' })}
                      className={cn(
                        'flex-1 p-4 rounded-xl border-2 transition-all',
                        printSettings.layout === 'double'
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className="w-full h-12 border-2 border-current rounded flex gap-1" />
                      <p className="text-sm font-medium">双栏</p>
                    </button>
                  </div>
                </div>

                <Select
                  label="纸张大小"
                  value={printSettings.pageSize}
                  onChange={(e) => updatePrintSettings({ pageSize: e.target.value as 'A4' | 'Letter' })}
                  options={[
                    { value: 'A4', label: 'A4 (210×297mm)' },
                    { value: 'Letter', label: 'Letter (8.5×11in)' },
                  ]}
                />

                <div className="space-y-2">
                  <Checkbox
                    label="显示目录"
                    checked={printSettings.showToc}
                    onChange={(e) => updatePrintSettings({ showToc: e.target.checked })}
                  />
                  <Checkbox
                    label="包含封面"
                    checked={printSettings.showCover}
                    onChange={(e) => updatePrintSettings({ showCover: e.target.checked })}
                  />
                  <Checkbox
                    label="显示页码"
                    checked={printSettings.showPageNumber}
                    onChange={(e) => updatePrintSettings({ showPageNumber: e.target.checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview & Articles */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  实时预览
                </h2>
              </CardHeader>
              <CardContent>
                <div 
                  className={cn(
                    'bg-white border border-slate-200 rounded-xl p-6 shadow-inner',
                    'min-h-[500px] transition-all duration-300'
                  )}
                  style={{
                    fontFamily: printSettings.fontFamily,
                    fontSize: printSettings.fontSize,
                    lineHeight: printSettings.lineHeight,
                    padding: `${printSettings.margin}mm`,
                    columnCount: printSettings.layout === 'double' ? 2 : 1,
                    columnGap: '2em',
                  }}
                >
                  {printSettings.showCover && (
                    <div className="text-center mb-8 pb-8 border-b border-slate-200">
                      <h1 className="text-2xl font-bold mb-4">
                        {collectionName || '文档标题'}
                      </h1>
                      <p className="text-sm text-slate-500">
                        {selectedArticles.length || 0} 篇文章 · {new Date().toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  )}

                  {printSettings.showToc && (
                    <div className="mb-8 pb-4 border-b border-slate-200">
                      <h2 className="text-lg font-semibold mb-2">目录</h2>
                      <ul className="space-y-1 text-sm">
                        {selectedArticleObjects.slice(0, 5).map((article, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-slate-400">{i + 1}.</span>
                            <span className="text-slate-700">{article.title}</span>
                          </li>
                        ))}
                        {selectedArticles.length > 5 && (
                          <li className="text-slate-400">... 共 {selectedArticles.length} 篇</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {selectedArticleObjects.slice(0, 2).map((article, i) => (
                    <div key={article.id} className="mb-6 avoid-break">
                      <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{article.summary}</p>
                      <div 
                        className="text-sm"
                        dangerouslySetInnerHTML={{ 
                          __html: article.content.substring(0, 200) + '...' 
                        }}
                      />
                    </div>
                  ))}

                  {selectedArticles.length === 0 && (
                    <div className="text-center text-slate-400 py-12">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>选择文章后预览效果</p>
                    </div>
                  )}

                  {printSettings.showPageNumber && (
                    <div className="mt-8 pt-4 border-t border-slate-200 text-center text-sm text-slate-400">
                      第 1 页
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Article Selection */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  选择文章 ({availableArticles.length} 篇可用)
                </h2>
              </CardHeader>
              <CardContent>
                {availableArticles.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p>暂无已完成的文章</p>
                    <p className="text-sm">请先采集并处理文章</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {availableArticles.map((article) => (
                      <div
                        key={article.id}
                        className={cn(
                          'p-3 rounded-xl border transition-all cursor-pointer',
                          selectedArticles.includes(article.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:border-slate-300'
                        )}
                        onClick={() => toggleArticleSelection(article.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedArticles.includes(article.id)}
                            onChange={() => toggleArticleSelection(article.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">{article.title}</p>
                            <p className="text-xs text-slate-500">{formatRelativeTime(article.createdAt)}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Export Button */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <Input
                    placeholder="输入合集名称（可选）"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                  />
                  
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleExport}
                    disabled={selectedArticles.length === 0 || isExporting}
                    loading={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        导出中 {exportProgress}%
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        导出PDF ({selectedArticles.length} 篇)
                      </>
                    )}
                  </Button>
                  
                  {isExporting && (
                    <TaskProgress 
                      status="running" 
                      progress={exportProgress} 
                      label="正在生成PDF" 
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
