'use client';

import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TaskProgress } from '@/components/ui/Badge';
import { useAppStore } from '@/stores/appStore';
import { formatRelativeTime } from '@/lib/utils';
import { 
  FileText, 
  CheckCircle2, 
  FileDown, 
  Plus, 
  Download,
  ArrowRight,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { articles, collections, crawlJobs, exportJobs } = useAppStore();

  const stats = {
    totalArticles: articles.length,
    processedArticles: articles.filter(a => a.status === 'completed').length,
    exportedPdfs: exportJobs.filter(e => e.status === 'completed').length,
    totalCollections: collections.length,
  };

  const recentCrawlJobs = crawlJobs.slice(-5).reverse();
  const recentExportJobs = exportJobs.slice(-5).reverse();

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            欢迎使用智能采集系统
          </h1>
          <p className="text-slate-600">
            自动采集、智能整理、精美排版、一键导出PDF，打造您的个人知识库
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/crawl" className="block">
            <Card hover className="cursor-pointer h-full">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">快速采集</h3>
                  <p className="text-sm text-slate-500">输入URL开始采集文章</p>
                </div>
                <ArrowRight className="ml-auto w-5 h-5 text-slate-400" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/articles" className="block">
            <Card hover className="cursor-pointer h-full">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">管理文章</h3>
                  <p className="text-sm text-slate-500">查看和编辑已采集的文章</p>
                </div>
                <ArrowRight className="ml-auto w-5 h-5 text-slate-400" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/export" className="block">
            <Card hover className="cursor-pointer h-full">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Download className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">导出PDF</h3>
                  <p className="text-sm text-slate-500">生成排版精美的PDF文档</p>
                </div>
                <ArrowRight className="ml-auto w-5 h-5 text-slate-400" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalArticles}</p>
                  <p className="text-sm text-slate-500">采集文章</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.processedArticles}</p>
                  <p className="text-sm text-slate-500">处理完成</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <FileDown className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.exportedPdfs}</p>
                  <p className="text-sm text-slate-500">已导PDF</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalCollections}</p>
                  <p className="text-sm text-slate-500">知识合集</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Crawl Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                最近采集任务
              </h2>
              <Link href="/crawl">
                <Button variant="ghost" size="sm">
                  查看全部
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentCrawlJobs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无采集任务</p>
                  <Link href="/crawl">
                    <Button variant="outline" size="sm" className="mt-3">
                      开始采集
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentCrawlJobs.map((job) => (
                    <div key={job.id} className="p-4 rounded-xl bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          {job.urls.length} 个URL
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatRelativeTime(job.updatedAt)}
                        </span>
                      </div>
                      <TaskProgress
                        status={job.status}
                        progress={job.progress}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Export Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-accent" />
                最近导出任务
              </h2>
              <Link href="/export">
                <Button variant="ghost" size="sm">
                  查看全部
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentExportJobs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无导出任务</p>
                  <Link href="/export">
                    <Button variant="outline" size="sm" className="mt-3">
                      创建导出
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentExportJobs.map((job) => (
                    <div key={job.id} className="p-4 rounded-xl bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          {job.collectionId || '未命名'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatRelativeTime(job.updatedAt)}
                        </span>
                      </div>
                      <TaskProgress
                        status={job.status}
                        progress={job.progress}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
