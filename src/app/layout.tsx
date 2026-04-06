import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '智能文章采集与PDF生成系统',
  description: '自动检索、整理、排版、输出PDF - 打造您的个人知识库',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
        {children}
      </body>
    </html>
  )
}
