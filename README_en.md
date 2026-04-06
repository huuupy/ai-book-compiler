# AI Book Compiler

[中文](README.md) | English

A simple and efficient web application that collects AI responses and articles, organizes them into well-structured documents, and exports to beautiful PDF with one click.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## Features

| Feature | Description |
|---------|-------------|
| 📝 **Multi-article** | Add multiple AI responses into one book |
| 🎨 **Markdown** | Full Markdown format support |
| 📑 **TOC** | Auto-generated table of contents |
| 🖨️ **Two-column** | Single/two-column layout support |
| 📄 **Export** | High-quality PDF export |

## Workflow

```
1. Input → Paste AI responses, add titles
2. Organize → Select content, reorder
3. Settings → Paper size, layout, margins
4. Preview & Export → Preview and export PDF
```

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

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Home page
│   ├── process/          # Editor page
│   └── settings/         # Settings page
├── components/
│   └── ui/               # UI components
└── lib/
    └── pdfExport.ts      # PDF export
```

## License

MIT
