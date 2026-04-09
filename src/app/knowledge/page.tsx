'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileUploader, type UploadedFile } from '@/components/ui/FileUploader';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { AgentConfig } from '@/components/AgentConfig';
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
  Copy,
  ChevronDown,
  ChevronUp,
  Play,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import type { Agent } from '@/types';
import { multiAgentAnalyze } from '@/lib/multiAgent';

interface ParseResult {
  id: string;
  fileName: string;
  fileType?: string;
  status: 'pending' | 'uploading' | 'parsing' | 'completed' | 'error';
  textLength?: number;
  chunks?: number;
  qaPairs?: number;
  text?: string;
  blobUrl?: string;
  error?: string;
}

interface AnalysisResult {
  agentName: string;
  icon: string;
  color: string;
  result: string;
}

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [results, setResults] = useState<ParseResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [knowledgeBaseName, setKnowledgeBaseName] = useState('');
  const [showQAPreview, setShowQAPreview] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0, agentName: '' });
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});

  // 配置状态
  const [configStatus, setConfigStatus] = useState<{
    supabase: boolean;
    openai: boolean;
    blob: boolean;
  }>({ supabase: false, openai: false, blob: true });

  useEffect(() => {
    fetch('/api/knowledge/config')
      .then(res => res.json())
      .then(data => setConfigStatus(data))
      .catch(() => {});
  }, []);

  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
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
    setAnalysisResults([]);
    setShowAnalysis(false);

    // 逐个处理文件
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      setResults(prev => prev.map(r => 
        r.id === file.id ? { ...r, status: 'uploading' as const } : r
      ));

      try {
        const formData = new FormData();
        formData.append('file', file.file);
        formData.append('knowledgeBaseName', knowledgeBaseName);

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
              text: data.textPreview,
              blobUrl: data.blobUrl,
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

  const handleAnalyze = async () => {
    const completedResults = results.filter(r => r.status === 'completed');
    if (completedResults.length === 0) {
      alert('请先完成至少一个文件的解析');
      return;
    }

    const textToAnalyze = completedResults
      .map(r => `[${r.fileName}]\n`)
      .join('\n');

    setSelectedText(textToAnalyze);
    setIsAnalyzing(true);
    setAnalysisResults([]);
    setShowAnalysis(true);

    try {
      const results = await multiAgentAnalyze(
        agents,
        textToAnalyze,
        (agentName, index, total) => {
          setAnalysisProgress({ current: index, total, agentName });
        }
      );
      setAnalysisResults(results);
    } catch (error) {
      console.error('Analysis error:', error);
    }

    setIsAnalyzing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleResultExpand = (fileId: string) => {
    setExpandedResults(prev => ({ ...prev, [fileId]: !prev[fileId] }));
  };

  const completedCount = results.filter(r => r.status === 'completed').length;
  const totalTextLength = results.reduce((sum, r) => sum + (r.textLength || 0), 0);
  const totalQAPairs = results.reduce((sum, r) => sum + (r.qaPairs || 0), 0);
  const errorCount = results.filter(r => r.status === 'error').length;
  const hasAnalysis = analysisResults.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Brain className="w-4 h-4" />
            知识库构建 & RAG 平台
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            上传文档，智能分析
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            支持多格式文档解析 + 多智能体深度分析 + Q&A 自动生成
          </p>

          <div className="flex justify-center gap-3 mt-4">
            <Badge variant={configStatus.openai ? 'success' : 'warning'}>
              {configStatus.openai ? '✓' : '⚠'} OpenAI
            </Badge>
            <Badge variant={configStatus.supabase ? 'success' : 'warning'}>
              {configStatus.supabase ? '✓' : '⚠'} Supabase
            </Badge>
            <Badge variant="success">✓ Vercel Blob</Badge>
          </div>
        </div>

        {/* Multi-Agent Config */}
        <div className="mb-6">
          <AgentConfig onAgentsChange={setAgents} />
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
              同一知识库下的文件将共享知识库
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

        {/* Process Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
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
                解析文件
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={handleAnalyze}
            disabled={completedCount === 0 || isAnalyzing || agents.filter(a => a.enabled).length === 0}
            className="px-8 py-4 text-lg shadow-lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                {analysisProgress.agentName} ({analysisProgress.current}/{analysisProgress.total})
              </>
            ) : (
              <>
                <Brain className="w-6 h-6 mr-2" />
                多智能体分析
                <Play className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Multi-Agent Results */}
        {showAnalysis && (
          <Card className="mb-6 border-2 border-purple-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  多智能体分析结果
                </h2>
                <Badge variant="secondary">{agents.filter(a => a.enabled).length} 个智能体</Badge>
              </div>
              {isAnalyzing && (
                <div className="mt-2 bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">
                      正在让 {analysisProgress.agentName} 分析文本... ({analysisProgress.current}/{analysisProgress.total})
                    </span>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!isAnalyzing && analysisResults.length === 0 && (
                <p className="text-slate-500 text-center py-8">
                  点击「多智能体分析」按钮开始分析
                </p>
              )}
              
              {!isAnalyzing && analysisResults.map((result, index) => {
                const colorBg: Record<string, string> = {
                  blue: 'bg-blue-50 border-blue-200',
                  purple: 'bg-purple-50 border-purple-200',
                  green: 'bg-green-50 border-green-200',
                  orange: 'bg-orange-50 border-orange-200',
                };
                
                return (
                  <div 
                    key={index} 
                    className={`mb-4 p-4 rounded-lg border ${colorBg[result.color] || 'bg-slate-50 border-slate-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{result.icon}</span>
                      <span className="font-semibold text-slate-900">{result.agentName}</span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-white/50 rounded-lg p-3 font-sans">
                        {result.result}
                      </pre>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(result.result)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        复制
                      </Button>
                    </div>
                  </div>
                );
              })}

              {hasAnalysis && !isAnalyzing && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" onClick={() => setShowAnalysis(false)}>
                    收起分析结果
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* File Results */}
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
                    {result.status === 'completed' && (
                      <button
                        onClick={() => toggleResultExpand(result.id)}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        {expandedResults[result.id] ? (
                          <ChevronUp className="w-5 h-5 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-500" />
                        )}
                      </button>
                    )}
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
                  <p className="text-slate-500">配置后可以使用 GPT 生成更智能的分析和 Q&A。</p>
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
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
