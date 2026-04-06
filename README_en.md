# Smart Article Collector & PDF Generator

[English](README_en.md) | [简体中文](README.md)

A modern web application that automates the complete workflow of "auto-retrieval, organization, typesetting, and PDF output". Users can collect web content through a visual interface, have it intelligently cleaned and organized, customize layout styles, and export beautifully formatted PDFs with one click.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📥 **Multi-mode Collection** | Support single URL and batch URL import |
| 🤖 **AI Processing** | Automatic content cleaning, summary generation, tag extraction |
| 🎨 **Flexible Layout** | Multiple templates with high customization |
| 👁️ **Real-time Preview** | WYSIWYG layout preview |
| 📄 **One-click Export** | Generate high-quality PDF documents |
| 💾 **Local Storage** | Data stored in browser localStorage, privacy protected |

## 🚀 Quick Start

### Requirements

- Node.js 18+
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sanple-generate-model.git
cd sanple-generate-model

# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

| Module | Technology | Description |
|--------|------------|-------------|
| Framework | Next.js 14 | App Router architecture |
| UI | React 18 | Component-based development |
| Styling | Tailwind CSS 3.4 | Atomic CSS |
| State | Zustand | Lightweight state management |
| PDF | @react-pdf/renderer | React-native PDF generation |
| Icons | Lucide React | Open-source icon library |

## 📁 Project Structure

```
sanple-generate-model/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Dashboard
│   │   ├── articles/          # Article library
│   │   ├── crawl/             # Crawl tasks
│   │   ├── export/            # Export center
│   │   ├── settings/          # Settings
│   │   └── api/               # API routes
│   │
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   └── Navigation.tsx
│   │
│   ├── stores/
│   │   └── appStore.ts        # Zustand store
│   │
│   ├── lib/
│   │   └── utils.ts
│   │
│   └── types/
│       └── index.ts
│
├── crawlee/                   # Optional: Advanced crawler module
├── SPEC.md
├── LICENSE
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is MIT licensed - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Lucide](https://lucide.dev/)
- [@react-pdf/renderer](https://react-pdf.org/)

---

If you find this project helpful, please give it a ⭐️!
