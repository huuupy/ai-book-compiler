'use client';

import { useState, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { PrintSettingsPanel, type ExtendedPrintSettings } from '@/components/ui/PrintSettingsPanel';
import { cn } from '@/lib/utils';
import { exportToPDF, printPreview } from '@/lib/pdfExport';
import { renderLatexWithHtml, hasLatex, countLatexFormulas } from '@/lib/latex';
import {
  FileText, Settings2, Loader2,
  Eye, Download, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp,
  BookOpen, Sparkles, ArrowUp, ArrowDown, Wand2, ClipboardPaste, Image,
  Upload, Sigma,
} from 'lucide-react';

interface ReplyItem {
  id: string;
  title: string;
  content: string;
  source?: string;
  order: number;
  selected?: boolean;
  category?: string;
}

const DEFAULT_SETTINGS: ExtendedPrintSettings = {
  paperSize: 'A4',
  orientation: 'portrait',
  duplex: false,
  copies: 1,
  quality: 'high',
  colorMode: 'color',
  marginTop: 25,
  marginBottom: 25,
  marginLeft: 20,
  marginRight: 20,
  bindingMargin: 15,
  layout: 'single',
  columns: 1,
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 11,
  lineHeight: 1.6,
  primaryColor: '#2563eb',
  showCover: true,
  showToc: true,
  showPageNumber: true,
  showHeader: false,
  headerText: '',
  showFooter: false,
  footerText: '',
  firstPageNumber: 1,
  pageNumberPosition: 'bottom-center',
  enableHyphenation: true,
  enableOrphansControl: true,
};

export default function ProcessPage() {
  const [step, setStep] = useState<'input' | 'organize' | 'settings' | 'preview'>('input');
  
  // 回复列表
  const [replies, setReplies] = useState<ReplyItem[]>([
    { id: '1', title: '', content: '', order: 1, selected: true }
  ]);
  
  // 书册信息
  const [bookTitle, setBookTitle] = useState('AI 回复整理');
  const [bookDescription, setBookDescription] = useState('');
  
  // 打印设置
  const [printSettings, setPrintSettings] = useState<ExtendedPrintSettings>(DEFAULT_SETTINGS);
  
  // UI 状态
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedReply, setExpandedReply] = useState<string | null>('1');
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  const [latexPreviewId, setLatexPreviewId] = useState<string | null>(null);

  // 添加新回复
  const addReply = useCallback(() => {
    const newId = Date.now().toString();
    setReplies(prev => [...prev, {
      id: newId,
      title: '',
      content: '',
      order: prev.length + 1,
      selected: true,
    }]);
    setExpandedReply(newId);
  }, []);

  // 删除回复
  const removeReply = useCallback((id: string) => {
    if (replies.length <= 1) return;
    setReplies(prev => prev.filter(r => r.id !== id).map((r, i) => ({ ...r, order: i + 1 })));
  }, [replies.length]);

  // 更新回复
  const updateReply = useCallback((id: string, field: 'title' | 'content' | 'source', value: string) => {
    setReplies(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }, []);

  // 重置
  const handleReset = useCallback(() => {
    setReplies([{ id: '1', title: '', content: '', order: 1, selected: true }]);
    setBookTitle('AI 回复整理');
    setBookDescription('');
    setStep('input');
  }, []);

  // 切换回复选择状态
  const toggleReplySelection = useCallback((id: string) => {
    setReplies(prev => prev.map(r => 
      r.id === id ? { ...r, selected: !r.selected } : r
    ));
  }, []);

  // 手动排序
  const moveReply = useCallback((id: string, direction: 'up' | 'down') => {
    setReplies(prev => {
      const idx = prev.findIndex(r => r.id === id);
      if (idx === -1) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === prev.length - 1) return prev;
      
      const newReplies = [...prev];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      [newReplies[idx], newReplies[swapIdx]] = [newReplies[swapIdx], newReplies[idx]];
      return newReplies.map((r, i) => ({ ...r, order: i + 1 }));
    });
  }, []);

  // 由浅入深排序（根据内容复杂度：长度、标题中的问号数量等）
  const sortByDepth = useCallback(() => {
    setReplies(prev => {
      const sorted = [...prev].sort((a, b) => {
        // 计算复杂度分数
        const calcScore = (item: ReplyItem) => {
          let score = 0;
          const title = item.title.toLowerCase();
          const content = item.content;
          
          // 标题中包含疑问词/问号的优先靠后（更深）
          if (title.includes('为什么') || title.includes('如何') || 
              title.includes('怎么') || title.includes('?') || title.includes('？')) {
            score += 3;
          }
          if (title.includes('分析') || title.includes('解释') || title.includes('原理')) {
            score += 2;
          }
          if (title.includes('概念') || title.includes('定义') || title.includes('是什么')) {
            score -= 2;
          }
          
          // 内容长度越长越靠后
          score += Math.min(content.length / 1000, 5);
          
          // 代码块多说明更深入
          const codeBlocks = (content.match(/```/g) || []).length;
          score += codeBlocks * 0.5;
          
          return score;
        };
        
        return calcScore(a) - calcScore(b);
      });
      
      return sorted.map((r, i) => ({ ...r, order: i + 1 }));
    });
  }, []);

  // 从剪贴板粘贴并智能识别 Q&A
  const pasteAndDetectQA = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) return;
      
      // 智能识别 Q&A 模式
      // 模式1: Q: ... A: ... 或 问题: ... 回答: ...
      // 模式2: 问：... 答：...
      // 模式3: 数字编号的问题（1. xxx 2. xxx）
      
      const qaPairs: { title: string; content: string }[] = [];
      
      // 尝试模式1: Q: / 问题: / 问：
      const qaPattern1 = /(?:Q:|问题:|问：)\s*([^\n]+)\n(?:A:|回答:|答：)?\s*([\s\S]*?)(?=(?:Q:|问题:|问：)\s*[^\n]+|$)/gi;
      let match;
      while ((match = qaPattern1.exec(text)) !== null) {
        qaPairs.push({
          title: match[1].trim(),
          content: match[2].trim()
        });
      }
      
      // 尝试模式2: 数字编号的问题
      if (qaPairs.length === 0) {
        const numPattern = /(?:\d+[.、])\s*([^\n?]+[？?])?\n*([\s\S]*?)(?=(?:\d+[.、])|$)/gi;
        while ((match = numPattern.exec(text)) !== null) {
          const title = match[1]?.trim() || `问题 ${qaPairs.length + 1}`;
          const content = match[2]?.trim() || '';
          if (content && content.length > 10) {
            qaPairs.push({ title, content });
          }
        }
      }
      
      // 如果识别到 Q&A
      if (qaPairs.length > 0) {
        const newReplies = qaPairs.map((qa, i) => ({
          id: `qa-${Date.now()}-${i}`,
          title: qa.title,
          content: qa.content,
          order: replies.length + i + 1,
          selected: true,
        }));
        setReplies(prev => [...prev, ...newReplies]);
        alert(`识别到 ${qaPairs.length} 个问题-答案对，已自动添加`);
      } else {
        // 没有识别到 Q&A，把整个内容作为一个回复添加
        const newId = Date.now().toString();
        setReplies(prev => [...prev, {
          id: newId,
          title: '粘贴内容',
          content: text,
          order: prev.length + 1,
          selected: true,
        }]);
        alert('未识别到明确的问题-答案格式，已作为单条内容添加');
      }
    } catch (error) {
      alert('无法访问剪贴板，请手动粘贴内容');
    }
  }, [replies.length]);

  // 截图 OCR 识别
  const handleScreenCaptureOCR = useCallback(async () => {
    setIsProcessing(true);
    setOcrStatus('正在初始化 OCR...');
    
    try {
      // 尝试读取剪贴板中的图片
      const items = await navigator.clipboard.read();
      let imageBlob: Blob | null = null;
      
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            imageBlob = await item.getType(type);
            break;
          }
        }
        if (imageBlob) break;
      }
      
      if (!imageBlob) {
        alert('剪贴板中没有图片，请先截图（Win+Shift+S）然后粘贴');
        setIsProcessing(false);
        setOcrStatus('');
        return;
      }
      
      setOcrStatus('正在识别文字，请稍候...');
      
      // 动态导入 Tesseract
      const Tesseract = await import('tesseract.js');
      
      const result = await Tesseract.recognize(imageBlob, 'chi_sim+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrStatus(`识别中... ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      const recognizedText = result.data.text.trim();
      
      if (!recognizedText) {
        alert('未能从图片中识别到文字');
        setIsProcessing(false);
        setOcrStatus('');
        return;
      }
      
      // 添加识别结果
      const newId = Date.now().toString();
      setReplies(prev => [...prev, {
        id: newId,
        title: '截图识别',
        content: recognizedText,
        order: prev.length + 1,
        selected: true,
      }]);
      
      alert(`识别成功！识别到 ${recognizedText.length} 个字符`);
      setExpandedReply(newId);
      
    } catch (error: any) {
      console.error('OCR Error:', error);
      if (error.name === 'NotAllowedError') {
        alert('需要授权访问剪贴板，请在浏览器设置中允许此网站的剪贴板访问');
      } else {
        alert('OCR 识别失败，请确保已安装 tesseract.js 依赖');
      }
    }
    
    setIsProcessing(false);
    setOcrStatus('');
  }, []);

  // 触发文件选择
  const triggerFileUpload = useCallback(() => {
    if (fileInputRef) {
      fileInputRef.click();
    }
  }, [fileInputRef]);

  // 文件上传 OCR 识别
  const handleFileUploadOCR = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查是否是图片文件
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setIsProcessing(true);
    setOcrStatus('正在识别文字，请稍候...');

    try {
      // 动态导入 Tesseract
      const Tesseract = await import('tesseract.js');

      const result = await Tesseract.recognize(file, 'chi_sim+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrStatus(`识别中... ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      const recognizedText = result.data.text.trim();

      if (!recognizedText) {
        alert('未能从图片中识别到文字');
        setIsProcessing(false);
        setOcrStatus('');
        return;
      }

      // 添加识别结果
      const newId = Date.now().toString();
      setReplies(prev => [...prev, {
        id: newId,
        title: `图片识别 - ${file.name}`,
        content: recognizedText,
        order: prev.length + 1,
        selected: true,
      }]);

      alert(`识别成功！识别到 ${recognizedText.length} 个字符`);
      setExpandedReply(newId);

    } catch (error: any) {
      console.error('OCR Error:', error);
      alert('OCR 识别失败，请确保已安装 tesseract.js 依赖');
    }

    setIsProcessing(false);
    setOcrStatus('');
    
    // 清空 input 以便重复选择同一文件
    if (fileInputRef) {
      fileInputRef.value = '';
    }
  }, [fileInputRef]);

  // 导出 PDF
  const handleExportPDF = useCallback(async () => {
    const validReplies = replies.filter(r => r.content.trim() && r.selected);
    if (validReplies.length === 0) {
      alert('请至少选中一条回复内容');
      return;
    }

    setIsProcessing(true);
    try {
      await exportToPDF(validReplies, bookTitle, printSettings);
    } catch (error: any) {
      alert('导出失败：' + error.message);
    }
    setIsProcessing(false);
  }, [replies, bookTitle, printSettings]);

  // 打印预览
  const handlePrintPreview = useCallback(() => {
    const validReplies = replies.filter(r => r.content.trim() && r.selected);
    if (validReplies.length === 0) {
      alert('请至少选中一条回复内容');
      return;
    }
    printPreview(validReplies, bookTitle, printSettings);
  }, [replies, bookTitle, printSettings]);

  const validRepliesCount = replies.filter(r => r.content.trim()).length;
  const selectedCount = replies.filter(r => r.selected).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-600" />
            AI 回复整理器
          </h1>
          <p className="text-slate-600">将多个 AI 回复整理为条理清晰的书册</p>
        </div>

        {/* 步骤导航 */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {[
            { id: 'input', label: '输入内容', icon: FileText },
            { id: 'organize', label: '整理内容', icon: BookOpen },
            { id: 'settings', label: '打印设置', icon: Settings2 },
            { id: 'preview', label: '预览导出', icon: Eye },
          ].map((item, index) => {
            const Icon = item.icon;
            const isActive = step === item.id;
            const stepOrder = ['input', 'organize', 'settings', 'preview'];
            const isPast = stepOrder.indexOf(step) > index;
            return (
              <div key={item.id} className="flex items-center">
                <button
                  onClick={() => setStep(item.id as typeof step)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full transition-all font-medium',
                    isActive && 'bg-blue-600 text-white shadow-md',
                    isPast && 'bg-green-100 text-green-700 hover:bg-green-200',
                    !isActive && !isPast && 'bg-slate-200 text-slate-500'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
                {index < 3 && (
                  <span className={cn('mx-2', isPast ? 'text-green-500' : 'text-slate-300')}>&#8250;</span>
                )}
              </div>
            );
          })}
        </div>

        {/* 步骤1: 输入内容 */}
        {step === 'input' && (
          <div className="space-y-6">
            {/* 书册信息 */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  书册信息
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    书册标题
                  </label>
                  <Input
                    placeholder="例如：2024年AI技术发展趋势分析"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    简介（可选）
                  </label>
                  <textarea
                    placeholder="简要说明这本册子的内容..."
                    value={bookDescription}
                    onChange={(e) => setBookDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 回复列表 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    AI 回复内容
                    <span className="text-sm font-normal text-slate-500">
                      ({validRepliesCount} 条有效内容)
                    </span>
                  </h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={pasteAndDetectQA} disabled={isProcessing}>
                      <ClipboardPaste className="w-4 h-4 mr-1" />
                      粘贴识别
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleScreenCaptureOCR} disabled={isProcessing}>
                      <Image className="w-4 h-4 mr-1" />
                      截图识别
                    </Button>
                    <Button variant="outline" size="sm" onClick={triggerFileUpload} disabled={isProcessing}>
                      <Upload className="w-4 h-4 mr-1" />
                      图片上传
                    </Button>
                    <input
                      type="file"
                      ref={setFileInputRef}
                      accept="image/*"
                      onChange={handleFileUploadOCR}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" onClick={addReply}>
                      <Plus className="w-4 h-4 mr-1" />
                      添加回复
                    </Button>
                  </div>
                </div>
                {ocrStatus && (
                  <div className="mt-2 flex items-center gap-2 text-blue-600 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {ocrStatus}
                  </div>
                )}
                <CardDescription>
                  粘贴 AI 回复内容，或使用「粘贴识别」自动拆分，「截图识别」从剪贴板图片提取文字，「图片上传」选择本地文件识别
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {replies.map((reply, index) => (
                  <div
                    key={reply.id}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                  >
                    {/* 回复头部 */}
                    <div
                      className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => setExpandedReply(expandedReply === reply.id ? null : reply.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={reply.selected}
                          onChange={() => toggleReplySelection(reply.id)}
                        />
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-medium">
                          {reply.order}
                        </span>
                        <span className="font-medium text-slate-700">
                          {reply.title || `回复 ${reply.order}`}
                        </span>
                        {reply.content.trim() && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            {reply.content.length} 字
                          </span>
                        )}
                        {hasLatex(reply.content) && (
                          <span className="formula-badge">
                            <Sigma className="w-3 h-3" />
                            {countLatexFormulas(reply.content)} 个公式
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {replies.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeReply(reply.id);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        {expandedReply === reply.id ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* 回复内容 */}
                    {expandedReply === reply.id && (
                      <div className="p-4 space-y-3 border-t border-slate-100">
                        <Input
                          placeholder="回复标题（如：问题1、关于XXX的分析）"
                          value={reply.title}
                          onChange={(e) => updateReply(reply.id, 'title', e.target.value)}
                        />
                        <textarea
                          placeholder="粘贴 AI 回复内容在这里...

支持以下格式：
- Markdown 格式（## 标题、**加粗**、列表等）
- LaTeX 公式（$E=mc^2$ 行内，$$...$$ 块级）
- 纯文本
- 代码块"
                          value={reply.content}
                          onChange={(e) => updateReply(reply.id, 'content', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                          rows={10}
                        />
                        
                        {/* LaTeX 公式预览 */}
                        {hasLatex(reply.content) && (
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              variant={latexPreviewId === reply.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setLatexPreviewId(latexPreviewId === reply.id ? null : reply.id)}
                            >
                              <Sigma className="w-4 h-4 mr-1" />
                              {latexPreviewId === reply.id ? '收起预览' : `预览公式 (${countLatexFormulas(reply.content)})`}
                            </Button>
                          </div>
                        )}
                        
                        {latexPreviewId === reply.id && (
                          <div className="mt-3 p-4 bg-white border border-slate-200 rounded-lg">
                            <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                              <Sigma className="w-3 h-3" />
                              公式预览
                            </div>
                            <div 
                              className="latex-renderer prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: renderLatexWithHtml(reply.content) }}
                            />
                          </div>
                        )}
                        <Input
                          placeholder="来源（可选，如：ChatGPT、Claude、文心一言）"
                          value={reply.source || ''}
                          onChange={(e) => updateReply(reply.id, 'source', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {replies.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>点击「添加回复」开始整理内容</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button
                onClick={() => setStep('organize')}
                disabled={validRepliesCount === 0}
                className="flex-1 py-3"
                size="lg"
              >
                下一步：整理内容
                <ChevronDown className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                重置
              </Button>
            </div>
          </div>
        )}

        {/* 步骤2: 整理内容 */}
        {step === 'organize' && (
          <div className="space-y-6">
            {/* 内容排序 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    内容排序
                    <span className="text-sm font-normal text-slate-500">
                      ({selectedCount} / {replies.length} 条已选中)
                    </span>
                  </h2>
                  <Button variant="outline" size="sm" onClick={sortByDepth}>
                    <Wand2 className="w-4 h-4 mr-1" />
                    由浅入深
                  </Button>
                </div>
                <CardDescription>
                  拖动调整顺序，或点击「由浅入深」自动排序，选中要包含的内容
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {replies.map((reply, index) => (
                  <div
                    key={reply.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border transition-all',
                      reply.selected
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    )}
                  >
                    {/* 选中复选框 */}
                    <Checkbox
                      checked={reply.selected}
                      onChange={() => toggleReplySelection(reply.id)}
                    />

                    {/* 序号 */}
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-medium flex-shrink-0">
                      {reply.order}
                    </span>

                    {/* 标题 */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 truncate">
                        {reply.title || `回复 ${reply.order}`}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {reply.content.slice(0, 50)}...
                      </p>
                    </div>

                    {/* 上下移动按钮 */}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveReply(reply.id, 'up')}
                        disabled={index === 0}
                        className="p-1"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveReply(reply.id, 'down')}
                        disabled={index === replies.length - 1}
                        className="p-1"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button onClick={() => setStep('input')} variant="outline" className="py-3">
                <ChevronDown className="w-5 h-5 mr-2 rotate-180" />
                返回修改
              </Button>
              <Button onClick={() => setStep('settings')} className="flex-1 py-3" size="lg">
                下一步：打印设置
                <ChevronDown className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* 步骤3: 打印设置 */}
        {step === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-blue-600" />
                  书册信息确认
                </h2>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-lg text-slate-900">{bookTitle || '未命名'}</h3>
                  {bookDescription && (
                    <p className="text-slate-600">{bookDescription}</p>
                  )}
                  <p className="text-sm text-slate-500">
                    共 {selectedCount} 条回复内容
                  </p>
                </div>
              </CardContent>
            </Card>

            <PrintSettingsPanel
              settings={printSettings}
              onChange={setPrintSettings}
            />

            <div className="flex gap-3">
              <Button onClick={() => setStep('organize')} variant="outline" className="py-3">
                <ChevronDown className="w-5 h-5 mr-2 rotate-180" />
                返回整理
              </Button>
              <Button onClick={() => setStep('preview')} className="flex-1 py-3" size="lg">
                下一步：预览导出
                <ChevronDown className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* 步骤4: 预览导出 */}
        {step === 'preview' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  预览确认
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-slate-900">{bookTitle || '未命名'}</h3>
                    {bookDescription && (
                      <p className="text-slate-600 mt-1">{bookDescription}</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-sm text-slate-500">
                        共 {selectedCount} 条已选中 · {printSettings.paperSize} · {
                          printSettings.orientation === 'landscape' ? '横向' : '纵向'
                        } · {
                          printSettings.layout === 'double' ? '双栏' : '单栏'
                        } · {
                          printSettings.duplex ? '双面' : '单面'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                      内容预览
                    </div>
                    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                      {replies.filter(r => r.content.trim() && r.selected).map((reply, index) => (
                        <div key={reply.id} className="border-b border-slate-100 pb-3 last:border-0">
                          <p className="font-medium text-slate-800">
                            {index + 1}. {reply.title || `回复 ${reply.order}`}
                          </p>
                          <p className="text-sm text-slate-500 line-clamp-2">
                            {reply.content.slice(0, 100)}{reply.content.length > 100 ? '...' : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => setStep('settings')}
                className="py-6 text-lg"
              >
                <Settings2 className="w-5 h-5 mr-2" />
                修改设置
              </Button>
              <Button
                onClick={handlePrintPreview}
                variant="outline"
                className="py-6 text-lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                打印预览
              </Button>
            </div>

            <Button
              onClick={handleExportPDF}
              disabled={isProcessing}
              className="w-full py-6 text-lg shadow-lg"
              size="lg"
            >
              {isProcessing ? (
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              ) : (
                <Download className="w-6 h-6 mr-2" />
              )}
              导出 PDF
            </Button>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                重新开始
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
