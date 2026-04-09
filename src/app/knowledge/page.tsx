'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileUploader, type UploadedFile } from '@/components/ui/FileUploader';
import { Input } from '@/components/ui/Input';
import { 
  Database, 
  Sparkles, 
  FileText, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

interface ParseResult {
  id: string;
  fileName: string;
  status: 'pending' | 'parsing' | 'completed' | 'error';
  textLength?: number;
  chunks?: number;
  qaPairs?: number;
  error?: string;
}

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [results, setResults] = useState<ParseResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [knowledgeBaseName, setKnowledgeBaseName] = useState('');

  const handleStartParsing = async () => {
    if (files.length === 0 || !knowledgeBaseName.trim()) {
      alert('请先上传文件并填写知识库名称');
      return;
    }

    setIsProcessing(true);
    
    // 初始化结果状态
    const initialResults: ParseResult[] = files.map(f => ({
      id: f.id,
      fileName: f.name,
      status: 'pending' as const
    }));
    setResults(initialResults);

    // 逐个处理文件
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 更新状态为解析中
      setResults(prev => prev.map(r => 
        r.id === file.id ? { ...r, status: 'parsing' as const } : r
      ));

      try {
        // 创建 FormData
        const formData = new FormData();
        formData.append('file', file.file);
        formData.append('knowledgeBaseName', knowledgeBaseName);

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
              textLength: data.textLength,
              chunks: data.chunks,
              qaPairs: data.qaPairs
            } : r
          ));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Database className="w-4 h-4" />
            知识库构建
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            上传文档，生成 Q&A
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            支持 PDF、Word、PPT 等格式，自动解析文本内容并生成问答对
          </p>
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
              placeholder="输入知识库名称，例如：Python 教程"
              value={knowledgeBaseName}
              onChange={(e) => setKnowledgeBaseName(e.target.value)}
              className="text-lg"
            />
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
              onFilesChange={setFiles}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
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
        </div>

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900">
                处理结果
              </h2>
            </CardHeader>
            <CardContent>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{completedCount}</div>
                  <div className="text-sm text-slate-600">已完成</div>
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
                      </p>
                      <p className="text-sm text-slate-500">
                        {result.status === 'pending' && '等待处理...'}
                        {result.status === 'parsing' && '正在解析文本...'}
                        {result.status === 'completed' && (
                          <>
                            文本 {result.textLength?.toLocaleString()} 字符 | 
                            生成 {result.qaPairs} 个问答对
                          </>
                        )}
                        {result.status === 'error' && result.error}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* All Completed */}
              {completedCount === results.length && results.length > 0 && (
                <div className="mt-6 text-center">
                  <Link href="/process">
                    <Button size="lg">
                      <BookOpen className="w-5 h-5 mr-2" />
                      前往整理页面
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
