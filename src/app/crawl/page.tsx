'use client';

import { useState, useRef } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { TaskProgress } from '@/components/ui/Badge';
import { useAppStore } from '@/stores/appStore';
import { isValidUrl, formatRelativeTime } from '@/lib/utils';
import { 
  Link2, 
  Play, 
  Pause, 
  Trash2, 
  Plus,
  Globe,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Copy,
  ClearAll
} from 'lucide-react';

type CrawlMode = 'single' | 'batch' | 'preset';

export default function CrawlPage() {
  const { addCrawlJob, updateCrawlJob, addArticle, updateArticle, crawlJobs } = useAppStore();
  
  const [mode, setMode] = useState<CrawlMode>('single');
  const [urls, setUrls] = useState('');
  const [singleUrl, setSingleUrl] = useState('');
  const [useProxy, setUseProxy] = useState(false);
  const [interval, setInterval] = useState(3);
  const [concurrency, setConcurrency] = useState(2);
  const [isCrawling, setIsCrawling] = useState(false);
  const [logs, setLogs] = useState<{ time: string; level: 'info' | 'success' | 'error'; message: string }[]>([]);
  const [currentJob, setCurrentJob] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (level: 'info' | 'success' | 'error', message: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { time, level, message }]);
  };

  const clearLogs = () => setLogs([]);

  const handleStartCrawl = async () => {
    const urlList = mode === 'single' 
      ? singleUrl.trim() ? [singleUrl.trim()] : []
      : urls.split('\n').map(u => u.trim()).filter(u => u && isValidUrl(u));
    
    if (urlList.length === 0) {
      addLog('error', '请输入有效的URL');
      return;
    }

    const invalidUrls = urlList.filter(u => !isValidUrl(u));
    if (invalidUrls.length > 0) {
      addLog('error', `以下URL格式无效: ${invalidUrls.slice(0, 3).join(', ')}${invalidUrls.length > 3 ? '...' : ''}`);
      return;
    }

    setIsCrawling(true);
    addLog('info', `开始采集 ${urlList.length} 个URL...`);

    // 创建采集任务
    const job = addCrawlJob({
      urls: urlList,
      status: 'running',
      progress: 0,
      results: [],
    });
    setCurrentJob(job.id);

    try {
      for (let i = 0; i < urlList.length; i++) {
        const url = urlList[i];
        updateCrawlJob(job.id, { currentUrl: url, progress: Math.round(((i + 1) / urlList.length) * 100) });
        addLog('info', `正在采集: ${url}`);

        try {
          // 模拟采集过程（实际项目中这里会调用爬虫API）
          const response = await fetch('/api/crawl', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, useProxy, interval }),
          });

          if (!response.ok) throw new Error('采集失败');

          const data = await response.json();
          
          // 添加到文章库
          const article = addArticle({
            url: data.url || url,
            title: data.title || '未命名文章',
            summary: data.summary || '',
            content: data.content || '',
            tags: data.tags || [],
            source: data.source || 'web',
            status: 'completed',
          });

          addLog('success', `✓ 采集完成: ${article.title}`);

          // 模拟AI处理
          updateArticle(article.id, { status: 'processing' });
          addLog('info', `正在进行AI内容处理...`);
          
          // 模拟处理延迟
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          updateArticle(article.id, { status: 'completed' });
          addLog('success', `✓ AI处理完成`);

        } catch (error) {
          addLog('error', `✗ 采集失败: ${url}`);
          
          // 添加失败的文章记录
          addArticle({
            url,
            title: url.split('/').pop() || '未知',
            summary: '',
            content: '',
            tags: [],
            source: 'web',
            status: 'failed',
            error: error instanceof Error ? error.message : '未知错误',
          });
        }

        // 采集间隔
        if (i < urlList.length - 1) {
          await new Promise(resolve => setTimeout(resolve, interval * 1000));
        }
      }

      updateCrawlJob(job.id, { status: 'completed', progress: 100 });
      addLog('success', `所有采集任务已完成！`);
    } catch (error) {
      updateCrawlJob(job.id, { status: 'failed', error: error instanceof Error ? error.message : '未知错误' });
      addLog('error', `采集过程中发生错误`);
    } finally {
      setIsCrawling(false);
      setCurrentJob(null);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setUrls(content);
        addLog('info', `已导入文件: ${file.name}`);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">文章采集</h1>
          <p className="text-slate-600">输入URL开始采集文章内容</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode Tabs */}
            <Card>
              <CardContent className="p-2">
                <div className="flex gap-2">
                  {[
                    { id: 'single', label: '单URL采集', icon: Link2 },
                    { id: 'batch', label: '批量URL导入', icon: Plus },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setMode(tab.id as CrawlMode)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                        mode === tab.id
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* URL Input */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900">
                  {mode === 'single' ? '输入文章URL' : '批量输入URL'}
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {mode === 'single' ? (
                  <Input
                    placeholder="https://example.com/article"
                    value={singleUrl}
                    onChange={(e) => setSingleUrl(e.target.value)}
                    icon={<Globe className="w-5 h-5" />}
                  />
                ) : (
                  <>
                    <Textarea
                      placeholder={`每行一个URL，例如：\nhttps://example.com/article1\nhttps://example.com/article2\nhttps://example.com/article3`}
                      value={urls}
                      onChange={(e) => setUrls(e.target.value)}
                      rows={8}
                    />
                    
                    <div className="flex items-center gap-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.csv"
                        onChange={handleFileImport}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        从文件导入
                      </Button>
                      
                      {urls && (
                        <Button variant="ghost" onClick={() => setUrls('')}>
                          <ClearAll className="w-4 h-4 mr-2" />
                          清空
                        </Button>
                      )}
                      
                      <span className="text-sm text-slate-500 ml-auto">
                        {urls.split('\n').filter(u => u.trim()).length} 个URL
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900">采集设置</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="请求间隔"
                    value={interval.toString()}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    options={[
                      { value: '1', label: '1秒' },
                      { value: '2', label: '2秒' },
                      { value: '3', label: '3秒' },
                      { value: '5', label: '5秒' },
                      { value: '10', label: '10秒' },
                    ]}
                  />
                  
                  <Select
                    label="并发数"
                    value={concurrency.toString()}
                    onChange={(e) => setConcurrency(Number(e.target.value))}
                    options={[
                      { value: '1', label: '1个' },
                      { value: '2', label: '2个' },
                      { value: '3', label: '3个' },
                      { value: '5', label: '5个' },
                    ]}
                  />
                </div>
                
                <Checkbox
                  label="使用代理服务器"
                  checked={useProxy}
                  onChange={(e) => setUseProxy(e.target.checked)}
                />
              </CardContent>
            </Card>

            {/* Start Button */}
            <Button
              size="lg"
              onClick={handleStartCrawl}
              loading={isCrawling}
              disabled={isCrawling}
              className="w-full"
            >
              {isCrawling ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  采集中...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  开始采集
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Logs & History */}
          <div className="space-y-6">
            {/* Logs */}
            <Card className="sticky top-24">
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  实时日志
                </h2>
                <Button variant="ghost" size="sm" onClick={clearLogs}>
                  清空
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-xl p-4 h-[400px] overflow-y-auto font-mono text-sm">
                  {logs.length === 0 ? (
                    <div className="text-slate-500 text-center py-8">
                      暂无日志
                    </div>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className="flex gap-3 mb-2">
                        <span className="text-slate-500 shrink-0">{log.time}</span>
                        <span className={
                          log.level === 'success' ? 'text-green-400' :
                          log.level === 'error' ? 'text-red-400' :
                          'text-slate-300'
                        }>
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Jobs */}
        {crawlJobs.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">采集历史</h2>
            <div className="space-y-3">
              {crawlJobs.slice(-5).reverse().map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {job.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {job.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                        {job.status === 'running' && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                        {job.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                        <div>
                          <p className="font-medium text-slate-900">
                            {job.urls.length} 个URL
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatRelativeTime(job.updatedAt)}
                          </p>
                        </div>
                      </div>
                      {job.status === 'running' && currentJob === job.id && (
                        <span className="text-sm text-primary font-medium">
                          {job.progress}%
                        </span>
                      )}
                    </div>
                    {job.status === 'running' && (
                      <TaskProgress status={job.status} progress={job.progress} />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
