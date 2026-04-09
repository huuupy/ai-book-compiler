# AI Book Compiler

[中文](README.md) | English

A simple and efficient web application that collects AI responses and articles, organizes them into well-structured documents, and exports to beautiful PDF with one click.

🌐 **Live Demo**: https://ai-book-compiler-x1yz.vercel.app/

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## Features

### 📚 AI Book Compiler
| Feature | Description |
|---------|-------------|
| 📝 **Multi-article** | Add multiple AI responses into one book |
| 🎨 **Markdown** | Full Markdown format support |
| 📑 **TOC** | Auto-generated table of contents |
| 🖨️ **Two-column** | Single/two-column layout support |
| 📄 **Export** | High-quality PDF export |

### 🧠 Knowledge Base & RAG Platform
| Feature | Description |
|---------|-------------|
| 📂 **Multi-format** | Support PDF, Word, PPT, TXT, Markdown, ZIP |
| 📊 **Smart Parsing** | Automatic text extraction |
| ❓ **Q&A Generation** | Auto-generate Q&A pairs from documents |
| 🔍 **Vector Search** | Semantic-based knowledge retrieval (requires Supabase) |
| 🤖 **AI Generation** | Use GPT for high-quality Q&A (requires OpenAI) |

## Quick Start

### Install dependencies

```bash
npm install
```

### Start dev server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

### Build for production

```bash
npm run build
npm start
```

## Advanced Configuration

### OpenAI API (Recommended for smart Q&A)

1. Get API Key: [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `.env.local`:
```
OPENAI_API_KEY=sk-your-api-key
```

### Supabase Vector Database (Optional for knowledge persistence)

1. Create project: [Supabase](https://supabase.com)
2. Run `supabase-setup.sql` to create tables
3. Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

### Upstash QStash (Optional for background tasks)

1. Create project: [Upstash QStash](https://console.upstash.com/qstash)
2. Add to `.env.local`:
```
QSTASH_TOKEN=your-token
QSTASH_CURRENT_SIGNING_KEY=your-key
QSTASH_VERIFIER_SIGNING_KEY=your-key
```

## Workflow

### AI Book Compiler
```
1. Input → Paste AI responses, add titles
2. Organize → Select content, reorder
3. Settings → Paper size, layout, margins
4. Preview & Export → Preview and export PDF
```

### Knowledge Base
```
1. Enter knowledge base name
2. Upload documents (drag & drop supported)
3. Click "Start Parsing"
4. View generated Q&A
```

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **File Storage**: Vercel Blob
- **Vector Database**: Supabase (optional)
- **AI**: OpenAI GPT (optional)
- **Task Queue**: Upstash QStash (optional)

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Home page
│   ├── process/           # Editor page
│   ├── settings/          # Settings page
│   ├── knowledge/         # Knowledge base page
│   └── api/
│       ├── crawl/         # Web crawler
│       └── knowledge/      # Knowledge API
├── components/
│   └── ui/               # UI components
└── lib/
    ├── fileParser.ts      # File parser
    ├── openai.ts          # OpenAI integration
    └── vectorStore.ts     # Vector storage
```

## License

MIT
