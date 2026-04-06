# 智能文章采集与PDF生成系统 / Smart Article Collector & PDF Generator

[English](README_en.md) | 简体中文

一个现代化的Web应用，实现"自动检索、整理、排版、输出PDF"的全流程自动化。用户可以通过可视化界面采集网页内容、AI智能清洗整理、自定义排版风格、一键导出精美PDF。

![Preview](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ 功能特性

| 功能 | 描述 |
|------|------|
| 📥 **多模式采集** | 支持单URL采集和批量URL导入 |
| 🤖 **智能处理** | 自动AI内容清洗、摘要生成、标签提取 |
| 🎨 **灵活排版** | 多种模板可选，支持高度自定义 |
| 👁️ **实时预览** | 所见即所得的排版预览 |
| 📄 **一键导出** | 生成高质量PDF文档 |
| 💾 **本地存储** | 数据存储在浏览器本地，保护隐私 |

## 📸 截图预览

```
┌─────────────────────────────────────────────────────────────┐
│  仪表盘 - 统计概览                                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ 采集文章│ │ 处理完成│ │ 已导PDF │ │ 知识合集│           │
│  │   128   │ │   115   │ │    42   │ │    15   │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  导出中心 - 排版设置与实时预览                                 │
├───────────────────────────────┬─────────────────────────────┤
│  模板: [简约▼]                │  ┌──────────────────────┐   │
│  字体: [Inter▼]              │  │   PDF 实时预览       │   │
│  字号: [14pt▼]               │  │                      │   │
│  布局: ○单栏 ●双栏           │  │   标题               │   │
│  [✓] 目录  [✓] 封面         │  │                      │   │
│                              │  │   正文内容...         │   │
│                              │  │                      │   │
│  [导出PDF]                   │  └──────────────────────┘   │
└───────────────────────────────┴─────────────────────────────┘
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn 或 pnpm

### 安装运行

```bash
# 克隆项目
git clone https://github.com/yourusername/sanple-generate-model.git
cd sanple-generate-model

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 生产构建

```bash
npm run build
npm start
```

## 🛠️ 技术栈

| 模块 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 14 | App Router架构 |
| UI框架 | React 18 | 组件化开发 |
| 样式方案 | Tailwind CSS 3.4 | 原子化CSS |
| 状态管理 | Zustand | 轻量级状态管理 |
| PDF生成 | @react-pdf/renderer | React原生PDF渲染 |
| 图标 | Lucide React | 开源图标库 |

## 📁 项目结构

```
sanple-generate-model/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # 首页/仪表盘
│   │   ├── articles/          # 文章库页面
│   │   ├── crawl/             # 采集任务页面
│   │   ├── export/            # 导出中心页面
│   │   ├── settings/          # 设置页面
│   │   └── api/               # API路由
│   │       ├── crawl/         # 爬虫API
│   │       └── export/        # 导出API
│   │
│   ├── components/
│   │   ├── ui/                # 基础UI组件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   └── Navigation.tsx
│   │
│   ├── stores/
│   │   └── appStore.ts        # Zustand状态管理
│   │
│   ├── lib/
│   │   └── utils.ts           # 工具函数
│   │
│   └── types/
│       └── index.ts           # TypeScript类型定义
│
├── crawlee/                   # 可选：高级爬虫模块
├── SPEC.md                    # 项目规范文档
├── LICENSE                    # MIT许可证
└── README.md
```

## 📖 使用指南

### 1. 采集文章

1. 进入「采集任务」页面
2. 选择采集模式（单URL/批量）
3. 输入URL列表
4. 配置采集参数（间隔、并发等）
5. 点击「开始采集」

### 2. 管理文章

1. 进入「文章库」页面
2. 使用搜索和筛选功能查找文章
3. 点击文章卡片查看预览
4. 进行单篇或批量操作

### 3. 导出PDF

1. 进入「导出中心」页面
2. 选择要导出的文章
3. 选择排版模板（简约/杂志/学术/自定义）
4. 自定义排版设置
5. 实时预览效果
6. 点击「导出PDF」下载

## 🔧 配置说明

### AI API 配置

系统支持多种AI模型后端，在「设置」页面配置：

| 提供商 | Endpoint |
|--------|----------|
| DeepSeek | `https://api.deepseek.com/v1` |
| OpenAI | `https://api.openai.com/v1` |
| 本地Ollama | `http://localhost:11434` |

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [Lucide](https://lucide.dev/) - 图标库
- [@react-pdf/renderer](https://react-pdf.org/) - PDF生成

---

如果你觉得这个项目有帮助，请给我一个 ⭐️！
