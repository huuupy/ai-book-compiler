# AI Book Compiler

[English](README_en.md) | 简体中文

一个简洁高效的 Web 应用，将多个 AI 回复整理为条理清晰的书册，一键导出精美 PDF。

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 功能特性

| 功能 | 描述 |
|------|------|
| 📝 **多篇整理** | 支持添加多条 AI 回复，统一整理到一个书册 |
| 🎨 **Markdown** | 完美支持 Markdown 格式 |
| 📑 **目录生成** | 自动生成精美目录 |
| 🖨️ **双栏布局** | 支持单栏/双栏布局 |
| 📄 **一键导出** | 生成高质量 PDF 文档 |

## 使用流程

```
1. 输入内容 → 粘贴 AI 回复，填写标题
2. 整理内容 → 勾选内容，调整顺序
3. 打印设置 → 选择纸张、布局、边距
4. 预览导出 → 预览效果，导出 PDF
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm start
```

## 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React

## 项目结构

```
src/
├── app/
│   ├── page.tsx          # 首页
│   ├── process/          # 整理页面
│   └── settings/         # 设置页面
├── components/
│   └── ui/               # UI 组件
└── lib/
    └── pdfExport.ts      # PDF 导出
```

## License

MIT
