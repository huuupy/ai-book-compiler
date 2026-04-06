'use client';

import { useState, useMemo } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { StatusBadge, Modal } from '@/components/ui/Badge';
import { Modal as CustomModal } from '@/components/ui/Modal';
import { useAppStore } from '@/stores/appStore';
import { formatRelativeTime, truncate, extractDomain } from '@/lib/utils';
import type { Article } from '@/types';
import { 
  Search, 
  Trash2, 
  Eye, 
  Download, 
  MoreVertical,
  ExternalLink,
  Tag,
  Calendar,
  Globe,
  X,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function ArticlesPage() {
  const { articles, selectedArticles, toggleArticleSelection, selectAllArticles, clearSelection, deleteArticle } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 12;

  // 过滤和搜索
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [articles, searchQuery, statusFilter]);

  // 分页
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = () => {
    if (selectedArticles.length === paginatedArticles.length) {
      clearSelection();
    } else {
      selectAllArticles();
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">文章库</h1>
            <p className="text-slate-600">共 {articles.length} 篇文章</p>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedArticles.length > 0 && (
              <>
                <span className="text-sm text-slate-600">
                  已选择 {selectedArticles.length} 篇
                </span>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  取消选择
                </Button>
                <Button variant="destructive" size="sm" onClick={() => {
                  selectedArticles.forEach(id => deleteArticle(id));
                  clearSelection();
                }}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  批量删除
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="搜索文章标题、摘要或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                />
              </div>
              
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: '全部状态' },
                  { value: 'pending', label: '待处理' },
                  { value: 'processing', label: '处理中' },
                  { value: 'completed', label: '已完成' },
                  { value: 'failed', label: '失败' },
                ]}
                className="w-full md:w-40"
              />
              
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Articles Grid */}
        {paginatedArticles.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">没有找到文章</h3>
              <p className="text-slate-500 mb-4">
                {articles.length === 0 
                  ? '开始采集您的第一篇文章吧' 
                  : '尝试调整搜索条件'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Select All Card */}
              <Card hover className="cursor-pointer border-dashed border-2 border-slate-300 bg-slate-50/50" onClick={handleSelectAll}>
                <CardContent className="p-6 flex items-center justify-center h-full min-h-[180px]">
                  <div className="text-center">
                    <Checkbox 
                      checked={selectedArticles.length === paginatedArticles.length && paginatedArticles.length > 0}
                      className="mx-auto mb-2"
                    />
                    <p className="text-sm text-slate-600">
                      {selectedArticles.length === paginatedArticles.length ? '取消全选' : '全选本页'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {paginatedArticles.map((article) => (
                <Card key={article.id} hover className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Article Header */}
                    <div className="p-4 border-b border-slate-100">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Checkbox
                          checked={selectedArticles.includes(article.id)}
                          onChange={() => toggleArticleSelection(article.id)}
                        />
                        <StatusBadge status={article.status} />
                      </div>
                      
                      <h3 
                        className="font-semibold text-slate-900 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setPreviewArticle(article)}
                      >
                        {article.title}
                      </h3>
                      
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                        {article.summary}
                      </p>
                    </div>
                    
                    {/* Article Meta */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {extractDomain(article.url)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatRelativeTime(article.createdAt)}
                        </span>
                      </div>
                      
                      {article.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {article.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="text-xs text-slate-400">
                              +{article.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="px-4 py-3 bg-slate-50 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewArticle(article)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        预览
                      </Button>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(article.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteArticle(article.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Preview Modal */}
        <CustomModal
          isOpen={!!previewArticle}
          onClose={() => setPreviewArticle(null)}
          title="文章预览"
          size="xl"
        >
          {previewArticle && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {previewArticle.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <a 
                    href={previewArticle.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    <Globe className="w-4 h-4" />
                    {extractDomain(previewArticle.url)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatRelativeTime(previewArticle.createdAt)}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-700 mb-2">摘要</h3>
                <p className="text-slate-600 bg-slate-50 p-4 rounded-xl">
                  {previewArticle.summary}
                </p>
              </div>

              {previewArticle.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {previewArticle.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">正文内容</h3>
                <div 
                  className="prose prose-slate max-w-none p-6 bg-white border border-slate-200 rounded-xl"
                  dangerouslySetInnerHTML={{ __html: previewArticle.content }}
                />
              </div>
            </div>
          )}
        </CustomModal>
      </main>
    </div>
  );
}
