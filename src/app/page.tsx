'use client';

import { Navigation } from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, Sparkles, FileText, ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            简单 · 高效 · 专业
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            AI Book Compiler
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            将多个 AI 回复整理为条理清晰的书册
            <br />
            支持 Markdown 格式，一键导出精美 PDF
          </p>
          
          <Link href="/process">
            <Button size="lg" className="text-lg px-8 py-6 shadow-lg">
              <BookOpen className="w-6 h-6 mr-2" />
              开始整理
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">多篇整理</h3>
            <p className="text-slate-600 text-sm">
              支持添加多条 AI 回复，统一整理到一个书册中
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Markdown 支持</h3>
            <p className="text-slate-600 text-sm">
              完美支持 Markdown 格式，包括标题、列表、代码块等
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <Download className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">精美导出</h3>
            <p className="text-slate-600 text-sm">
              一键导出为排版精美的 PDF，支持多种纸张和布局
            </p>
          </Card>
        </div>

        {/* How to use */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            使用方法
          </h2>
          
          <div className="space-y-6">
            {[
              { step: '1', title: '复制 AI 回复', desc: '从 AI 对话中复制回复内容' },
              { step: '2', title: '粘贴到系统', desc: '在「整理内容」页面添加多条回复' },
              { step: '3', title: '设置书册信息', desc: '填写书册标题和简介' },
              { step: '4', title: '导出 PDF', desc: '设置打印参数，导出精美书册' },
            ].map((item, index) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute left-6 mt-12 ml-[-2px] w-0.5 h-8 bg-slate-200" style={{ position: 'relative' }} />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/process">
              <Button size="lg">
                <BookOpen className="w-5 h-5 mr-2" />
                立即开始
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
