'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileUploader, type UploadedFile } from '@/components/ui/FileUploader';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Database, 
  Sparkles, 
  FileText, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  BookOpen,
  Brain,
  Upload,
  FileCode,
  Settings,
  Info,
  Copy
} from 'lucide-react';
import Link from 'next/link';

interface ParseResult {
  id: string;
  fileName: string;
  fileType?: string;
  status: 'pending' | 'uploading' | 'parsing' | 'completed' | 'error';
  textLength?: number;
  chunks?: number;
  qaPairs?: number;
  blobUrl?: string;
  error?: string;
}

interface QAPreview {
  question: string;
  answer: string;
}

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [results, setResults] = useState<ParseResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [knowledgeBaseName, setKnowledgeBaseName] = useState('');
  const [showQAPreview, setShowQAPreview] = useState(false);
  const [currentQAPreview, setCurrentQAPreview] = useState<QAPreview[]>([]);

  // 配置状态
  const [configStatus, setConfigStatus] = useState<{
    supabase: boolean;
    openai: boolean;
    blob: boolean;
  }>({ supabase: false, openai: false, blob: true });

  useEffect(() => {
    // 检查配置状态
    fetch('/api/knowledge/config')
      .then(res => res.json())
      .then(data => setConfigStatus(data))
      .catch(() => {});
  }, []);

  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    // 更新结果状态
    setResults(prev => {
      const existingIds = prev.map(r => r.id);
      const newResults = newFiles
        .filter(f => !existingIds.includes(f.id))
        .map(f => ({
          id: f.id,
          fileName: f.name,
          status: 'pending' as const,
        }));
      return [...prev.filter(r => newFiles.some(f => f.id === r.id)), ...newResults];
    });
  };

  const handleStartParsing = async () => {
    if (files.length === 0 || !knowledgeBaseName.trim()) {
      alert('请先上传文件并填写知识库名称');
      return;
    }

    setIsProcessing(true);
    setCurrentQAPreview([]);

    // 逐个处理文件
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 更新状态为上传中
      setResults(prev => prev.map(r => 
        r.id === file.id ? { ...r, status: 'uploading' as const } : r
      ));

      try {
        // 创建 FormData
        const formData = new FormData();
        formData.append('file', file.file);
        formData.append('knowledgeBaseName', knowledgeBaseName);

        // 更新状态为解析中
        setResults(prev => prev.map(r => 
          r.id === file.id ? { ...r, status: 'parsing' as const } : r
        ));

        const response = await fetch('/api/knowledge/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setResults(prev => prev.map(r => 
            r.id === file.id ? { 
              ...r, 
              status: 'completed' as const,
              fileType: data.fileType,
              textLength: data.textLength,
              chunks: data.chunks,
              qaPairs: data.qaPairs,
              blobUrl: data.blobUrl,
            } : r
          ));
          
          // 显示 Q&A 预览
          if (data.qaPreview && data.qaPreview.length > 0) {
            setCurrentQAPreview(data.qaPreview);
            setShowQAPreview(true);
          }
        } else {
          setResults(prev => prev.map(r => 
            r.id === file.id ? { 
              ...r, 
              status: 'error' as const,
              error: data.error || '解析失败'
            } : r
          ));
        }
      } catch (error) {
        setResults(prev => prev.map(r => 
          r.id === file.id ? { 
            ...r, 
            status: 'error' as const,
            error: '网络错误'
          } : r
        ));
      }
    }

    setIsProcessing(false);
  };

  const completedCount = results.filter(r => r.status === 'completed').length;
  const totalTextLength = results.reduce((sum, r) => sum + (r.textLength || 0), 0);
  const totalQAPairs = results.reduce((sum, r) => sum + (r.qaPairs || 0), 0);
  const errorCount = results.filter(r => r.status === 'error').length;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Brain className="w-4 h-4" />
            知识库构建 & RAG 平台
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            上传文档，生成 Q&A
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            支持 PDF、Word、PPT 等格式，自动解析文本内容并生成问答对
          </p>

          {/* Config Status */}
          <div className="flex justify-center gap-3 mt-4">
            <Badge variant={configStatus.openai ? 'success' : 'warning'}>
              {configStatus.openai ? '✓' : '⚠'} OpenAI
            </Badge>
            <Badge variant={configStatus.supabase ? 'success' : 'warning'}>
              {configStatus.supabase ? '✓' : '⚠'} Supabase
            </Badge>
            <Badge variant="success">
              ✓ Vercel Blob
            </Badge>
          </div>
        </div>

        {/* Knowledge Base Name */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              知识库设置
            </h2>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="输入知识库名称，例如：Python 教程、产品文档"
              value={knowledgeBaseName}
              onChange={(e) => setKnowledgeBaseName(e.target.value)}
              className="text-lg"
            />
            <p className="text-sm text-slate-500 mt-2">
              同一知识库下的文件将共享 Q&A 知识库
            </p>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              上传文档
            </h2>
          </CardHeader>
          <CardContent>
            <FileUploader
              onFilesChange={handleFilesChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.zip"
              maxFiles={20}
              maxSize={100}
            />
          </CardContent>
        </Card>

        {/* Process Button */}
        <div className="text-center mb-8">
          <Button
            size="lg"
            onClick={handleStartParsing}
            disabled={files.length === 0 || !knowledgeBaseName.trim() || isProcessing}
            className="px-8 py-4 text-lg shadow-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                正在处理...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-2" />
                开始解析并生成 Q&A
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
          
          {isProcessing && (
            <p className="text-sm text-slate-500 mt-2">
              处理大文件可能需要较长时间，请耐心等待...
            </p>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900">
                处理结果
              </h2>
            </CardHeader>
            <CardContent>
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{completedCount}</div>
                  <div className="text-sm text-slate-600">已完成</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                  <div className="text-sm text-slate-600">失败</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{(totalTextLength / 1000).toFixed(1)}K</div>
                  <div className="text-sm text-slate-600">字符数</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{totalQAPairs}</div>
                  <div className="text-sm text-slate-600">Q&A 对</div>
                </div>
              </div>

              {/* File List */}
              <div className="space-y-3">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      {result.status === 'pending' && (
                        <FileText className="w-6 h-6 text-slate-400" />
                      )}
                      {result.status === 'uploading' && (
                        <Upload className="w-6 h-6 text-blue-500 animate-pulse" />
                      )}
                      {result.status === 'parsing' && (
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      )}
                      {result.status === 'completed' && (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      )}
                      {result.status === 'error' && (
                        <AlertCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 truncate">
                        {result.fileName}
                        {result.fileType && (
                          <span className="ml-2 text-xs text-slate-400">({result.fileType})</span>
                        )}
                      </p>
                      <p className="text-sm text-slate-500">
                        {result.status === 'pending' && '等待处理...'}
                        {result.status === 'uploading' && '上传中...'}
                        {result.status === 'parsing' && '正在解析文本...'}
                        {result.status === 'completed' && (
                          <>
                            {result.textLength?.toLocaleString()} 字符 → 
                            {result.chunks} 块 → 
                            {result.qaPairs} 个问答对
                          </>
                        )}
                        {result.status === 'error' && result.error}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* All Completed */}
              {completedCount === results.length && results.length > 0 && errorCount === 0 && (
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/process">
                    <Button variant="outline" size="lg">
                      <BookOpen className="w-5 h-5 mr-2" />
                      前往整理页面
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setFiles([])}
                  >
                    <FileCode className="w-5 h-5 mr-2" />
                    上传更多文件
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Q&A Preview Modal */}
        {showQAPreview && currentQAPreview.length > 0 && (
          <Card className="mb-6 border-2 border-purple-200">
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Q&A 生成预览
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentQAPreview.map((qa, index) => (
                  <div key={index} className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center">
                        Q{index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{qa.question}</p>
                        <p className="text-slate-600 mt-2 text-sm">{qa.answer}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`Q: ${qa.question}\nA: ${qa.answer}`)}
                        className="p-1 hover:bg-purple-100 rounded"
                        title="复制"
                      >
                        <Copy className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={() => setShowQAPreview(false)}>
                  关闭预览
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup Guide */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-600" />
              配置说明
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700">基础功能（无需配置）</p>
                  <p className="text-slate-500">文件上传、解析、基础 Q&A 生成均可在无 API Key 的情况下使用。</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700">OpenAI API（可选，推荐）</p>
                  <p className="text-slate-500">配置后可以使用 GPT 生成更智能、更深刻的 Q&A 对。</p>
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded mt-1 inline-block">
                    OPENAI_API_KEY
                  </code>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700">Supabase（可选，推荐）</p>
                  <p className="text-slate-500">配置后可以持久化存储知识库，支持向量搜索。</p>
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded mt-1 inline-block">
                    NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_KEY
                  </code>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-yellow-800 text-xs">
                  💡 提示：复制 <code className="bg-yellow-100 px-1 rounded">.env.example</code> 到 <code className="bg-yellow-100 px-1 rounded">.env.local</code> 并填写配置，即可启用高级功能。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
