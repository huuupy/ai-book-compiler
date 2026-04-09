// PDF 导出工具 - 优化版
'use client';

import katex from 'katex';

interface Article {
  id: string;
  title: string;
  content: string;
  source?: string;
  summary?: string;
  selected?: boolean;
}

interface ExtendedPrintSettings {
  paperSize: 'A4' | 'Letter' | 'A3' | 'Legal';
  orientation: 'portrait' | 'landscape';
  duplex: boolean;
  copies: number;
  quality: 'high' | 'medium' | 'low';
  colorMode: 'color' | 'grayscale';
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  bindingMargin: number;
  layout: 'single' | 'double';
  columns: number;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  primaryColor: string;
  showCover: boolean;
  showToc: boolean;
  showPageNumber: boolean;
  showHeader: boolean;
  headerText: string;
  showFooter: boolean;
  footerText: string;
  firstPageNumber: number;
  pageNumberPosition: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
  enableHyphenation: boolean;
  enableOrphansControl: boolean;
}

// LaTeX 转 HTML
function renderLatex(text: string): string {
  if (!text) return '';
  
  let result = text;
  
  // 渲染块级公式 $$...$$
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    try {
      return `<div class="katex-block">${katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false,
        output: 'html',
      })}</div>`;
    } catch {
      return `<div class="katex-error">公式错误: ${formula}</div>`;
    }
  });
  
  // 渲染行内公式 $...$
  result = result.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula.trim(), {
        displayMode: false,
        throwOnError: false,
        output: 'html',
      });
    } catch {
      return `<span class="katex-error">${formula}</span>`;
    }
  });
  
  return result;
}

// Markdown 转 HTML
function markdownToHtml(text: string): string {
  if (!text) return '';
  
  // 先处理 LaTeX 公式（保护公式不被 Markdown 处理破坏）
  const latexMap: Record<string, string> = {};
  let latexIndex = 0;
  
  let processed = text.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
    const placeholder = `%%LATEX_BLOCK_${latexIndex}%%`;
    latexMap[placeholder] = renderLatex(match);
    latexIndex++;
    return placeholder;
  });
  
  processed = processed.replace(/\$[^\$\n]+?\$/g, (match) => {
    const placeholder = `%%LATEX_INLINE_${latexIndex}%%`;
    latexMap[placeholder] = renderLatex(match);
    latexIndex++;
    return placeholder;
  });
  
  let html = processed
    // 转义
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // 代码块（放在 LaTeX 保护之后）
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 加粗
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // 斜体
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // 四级标题
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    // 三级标题
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // 二级标题
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // 一级标题
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // 水平线
    .replace(/^---$/gm, '<hr>')
    // 引用
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // 无序列表
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // 有序列表
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // 包装列表
  html = html.replace(/(<li>.*<\/li>)+/gs, '<ul>$&</ul>');
  // 包装引用
  html = html.replace(/(<blockquote>.*<\/blockquote>)+/gs, '<blockquote>$&</blockquote>');
  // 段落
  html = html.replace(/\n\n+/g, '</p><p>');
  // 换行
  html = html.replace(/\n/g, '<br>');
  
  if (!html.startsWith('<')) {
    html = '<p>' + html + '</p>';
  }
  
  // 恢复 LaTeX 公式
  for (const [placeholder, latexHtml] of Object.entries(latexMap)) {
    html = html.replace(placeholder, latexHtml);
  }

  return html;
}

// 生成报告 HTML
export function generateReportHTML(
  articles: Article[],
  bookTitle: string,
  settings: ExtendedPrintSettings,
  bookDescription?: string
): string {
  const validArticles = articles.filter(a => a.content?.trim());

  // 纸张尺寸
  const paperSizes: Record<string, { width: string; height: string }> = {
    A4: { width: '210mm', height: '297mm' },
    Letter: { width: '215.9mm', height: '279.4mm' },
    A3: { width: '297mm', height: '420mm' },
    Legal: { width: '215.9mm', height: '355.6mm' },
  };

  const paper = paperSizes[settings.paperSize];
  const isLandscape = settings.orientation === 'landscape';
  const themeColor = settings.primaryColor;

  // 页边距
  const margin = {
    top: `${settings.marginTop}mm`,
    bottom: `${settings.marginBottom + 10}mm`,
    left: `${settings.marginLeft}mm`,
    right: `${settings.marginRight}mm`,
  };

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${bookTitle}</title>
  <style>
    @page {
      size: ${isLandscape ? `${paper.height} ${paper.width}` : `${paper.width} ${paper.height}`};
      margin: ${settings.showHeader ? `30mm ${margin.right} ${margin.bottom} ${margin.left}` : `${margin.top} ${margin.right} ${margin.bottom} ${margin.left}`};
    }
    
    * { box-sizing: border-box; }
    
    body {
      font-family: ${settings.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: ${settings.fontSize}pt;
      line-height: ${settings.lineHeight};
      color: #333;
      margin: 0;
      padding: 0;
    }
    
    .page-break { page-break-after: always; }
    .keep-with-next { page-break-before: avoid; }
    
    /* 封面 */
    .cover {
      text-align: center;
      padding: 0;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    
    .cover .book-title {
      font-size: 32pt;
      font-weight: bold;
      color: ${themeColor};
      margin-bottom: 20px;
      line-height: 1.3;
    }
    
    .cover .book-desc {
      font-size: 14pt;
      color: #666;
      margin-top: 20px;
      max-width: 80%;
    }
    
    .cover .divider {
      width: 100px;
      height: 3px;
      background: ${themeColor};
      margin: 30px 0;
    }
    
    .cover .stats {
      font-size: 12pt;
      color: #999;
      margin-top: 40px;
    }
    
    .cover .date {
      font-size: 11pt;
      color: #bbb;
      margin-top: 60px;
    }
    
    /* 目录 */
    .toc {
      page-break-after: always;
    }
    
    .toc-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid ${themeColor};
    }
    
    .toc-header h1 {
      font-size: 26pt;
      color: ${themeColor};
      margin: 0;
      letter-spacing: 8px;
    }
    
    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .toc-item {
      display: flex;
      align-items: baseline;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
      font-size: 12pt;
    }
    
    .toc-item:hover {
      background: #f8f9fa;
    }
    
    .toc-number {
      width: 30px;
      color: ${themeColor};
      font-weight: bold;
      font-size: 12pt;
      flex-shrink: 0;
    }
    
    .toc-title {
      flex-shrink: 0;
      max-width: 60%;
      color: #333;
      word-break: break-all;
      white-space: pre-wrap;
    }
    
    .toc-dots {
      flex: 1;
      min-width: 20px;
      border-bottom: 1px dotted #ccc;
      margin: 0 8px 3px;
    }
    
    .toc-page {
      color: ${themeColor};
      font-size: 11pt;
      min-width: 25px;
      text-align: right;
      flex-shrink: 0;
    }
    
    /* 内容页 */
    .article {
      margin-bottom: 30px;
    }
    
    .article-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid ${themeColor};
    }
    
    .article-number {
      width: 32px;
      height: 32px;
      background: ${themeColor};
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14pt;
      margin-right: 12px;
      flex-shrink: 0;
    }
    
    .article-title {
      font-size: 18pt;
      color: ${themeColor};
      font-weight: bold;
      margin: 0;
    }
    
    .article-source {
      font-size: 10pt;
      color: #888;
      margin-top: 5px;
    }
    
    .article-content {
      text-align: justify;
    }
    
    .article-content h1 {
      font-size: 20pt;
      color: ${themeColor};
      margin: 20px 0 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid ${themeColor};
    }
    
    .article-content h2 {
      font-size: 16pt;
      color: ${themeColor};
      margin: 18px 0 12px;
    }
    
    .article-content h3 {
      font-size: 14pt;
      color: #555;
      margin: 15px 0 10px;
      font-weight: bold;
    }
    
    .article-content h4 {
      font-size: 12pt;
      color: #666;
      margin: 12px 0 8px;
    }
    
    .article-content p {
      margin: 10px 0;
    }
    
    .article-content ul, .article-content ol {
      margin: 10px 0;
      padding-left: 25px;
    }
    
    .article-content li {
      margin: 5px 0;
    }
    
    .article-content blockquote {
      margin: 15px 0;
      padding: 10px 15px;
      border-left: 4px solid ${themeColor};
      background: #f8f9fa;
      color: #555;
    }
    
    .article-content pre {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      font-size: 10pt;
      margin: 15px 0;
    }
    
    .article-content code {
      font-family: 'Consolas', 'Monaco', monospace;
      background: #f5f5f5;
      padding: 2px 5px;
      border-radius: 3px;
      font-size: 10pt;
    }
    
    .article-content pre code {
      background: none;
      padding: 0;
    }
    
    .article-content hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 20px 0;
    }
    
    .article-content strong {
      font-weight: bold;
      color: #222;
    }
    
    .article-content em {
      font-style: italic;
    }
    
    /* 双栏布局 */
    .two-column {
      column-count: 2;
      column-gap: 25mm;
      column-rule: 1px solid #eee;
    }
    
    .two-column .article {
      break-inside: avoid;
      margin-bottom: 20px;
    }
    
    .two-column .article-header {
      margin-bottom: 10px;
      padding-bottom: 8px;
    }
    
    .two-column .article-number {
      width: 24px;
      height: 24px;
      font-size: 11pt;
    }
    
    .two-column .article-title {
      font-size: 14pt;
    }
    
    .two-column .article-content {
      font-size: 10pt;
    }
    
    .two-column .article-content h1 {
      font-size: 14pt;
    }
    
    .two-column .article-content h2 {
      font-size: 12pt;
    }
    
    .two-column .article-content h3 {
      font-size: 11pt;
    }
    
    /* KaTeX 公式样式 */
    .katex { font-size: 1.1em; }
    .katex-block { 
      margin: 1em 0; 
      padding: 0.5em 0; 
      text-align: center; 
      overflow-x: auto;
    }
    .katex-block .katex { font-size: 1.3em; }
    .katex-error { 
      color: #dc2626; 
      background: #fef2f2; 
      padding: 0.2em 0.4em; 
      border-radius: 0.2em;
      font-size: 0.9em;
    }
    
    /* 单栏布局优化 */
    .single-column .article-content {
      max-width: 100%;
    }
    
    /* 页码 */
    .page-number {
      position: fixed;
      bottom: ${margin.bottom};
      font-size: 10pt;
      color: #999;
    }
    
    .page-number.bottom-center { left: 50%; transform: translateX(-50%); }
    .page-number.bottom-right { right: ${margin.right}; }
    
    /* 打印优化 */
    @media print {
      .no-print { display: none !important; }
      .article { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
`;

  // 封面
  if (settings.showCover) {
    html += `
  <div class="cover">
    <div class="book-title">${bookTitle}</div>
    ${bookDescription ? `<div class="book-desc">${bookDescription}</div>` : ''}
    <div class="divider"></div>
    <div class="stats">
      共收录 ${validArticles.length} 篇内容
    </div>
    <div class="date">
      整理于 ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
    </div>
  </div>
`;
  }

  // 目录
  if (settings.showToc) {
    html += `
  <div class="toc">
    <div class="toc-header">
      <h1>目 录</h1>
    </div>
    <ol class="toc-list">
`;
    validArticles.forEach((article, index) => {
      const displayTitle = article.title || `内容 ${index + 1}`;
      const source = article.source ? ` — ${article.source}` : '';
      html += `
      <li class="toc-item">
        <span class="toc-number">${index + 1}</span>
        <span class="toc-title">${displayTitle}${source}</span>
        <span class="toc-dots"></span>
        <span class="toc-page"></span>
      </li>
`;
    });
    html += `
    </ol>
  </div>
`;
  }

  // 内容
  const isDoubleColumn = settings.layout === 'double';
  const contentClass = isDoubleColumn ? 'two-column' : 'single-column';
  
  html += `<div class="${contentClass}">\n`;
  
  validArticles.forEach((article, index) => {
    const contentHtml = markdownToHtml(article.content);
    const displayTitle = article.title || `内容 ${index + 1}`;
    const sourceHtml = article.source ? `<div class="article-source">来源：${article.source}</div>` : '';

    html += `
  <div class="article">
    <div class="article-header">
      <div class="article-number">${index + 1}</div>
      <div>
        <h2 class="article-title">${displayTitle}</h2>
        ${sourceHtml}
      </div>
    </div>
    <div class="article-content">
${contentHtml}
    </div>
  </div>
`;
  });
  
  html += `</div>\n`;

  // 页码和页眉页脚
  const pageNumberHtml = `
  <script>
    // 页码和页眉页脚处理
    document.addEventListener('DOMContentLoaded', function() {
      const pageNumber = document.querySelector('.page-number');
      const footerText = document.querySelector('.footer-text');
      
      // 监听打印事件设置页码
      window.onbeforeprint = function() {
        updatePageNumbers();
      };
      
      function updatePageNumbers() {
        // 页码更新逻辑由浏览器自动处理
      }
    });
  </script>`;

  // 页码
  if (settings.showPageNumber) {
    html += `
  <div class="page-number bottom-center"></div>
`;
  }

  // 页眉
  if (settings.showHeader && settings.headerText) {
    const headerContent = settings.headerText
      .replace('{title}', bookTitle)
      .replace('{date}', new Date().toLocaleDateString('zh-CN'));
    html = html.replace('</style>', `
    
    /* 页眉 */
    .header {
      position: fixed;
      top: ${margin.top};
      left: ${margin.left};
      right: ${margin.right};
      font-size: 10pt;
      color: #999;
      text-align: right;
      padding-bottom: 5mm;
      border-bottom: 1px solid #eee;
    }
  </style>`);
    html = html.replace('<body>', `
  <div class="header">${headerContent}</div>
<body>`);
  }

  // 页脚
  if (settings.showFooter && settings.footerText) {
    const footerContent = settings.footerText
      .replace('{page}', '<!--page-->')
      .replace('{total}', validArticles.length.toString());
    html = html.replace('</style>', `
    
    /* 页脚 */
    .footer {
      position: fixed;
      bottom: ${margin.bottom};
      left: ${margin.left};
      right: ${margin.right};
      font-size: 10pt;
      color: #999;
      text-align: center;
      padding-top: 5mm;
      border-top: 1px solid #eee;
    }
  </style>`);
    html = html.replace('<body>', `
  <div class="footer">${footerContent}</div>
<body>`);
  }

  html += `
</body>
</html>`;

  return html;
}

// 导出 PDF
export async function exportToPDF(
  articles: Article[],
  bookTitle: string,
  settings: ExtendedPrintSettings,
  bookDescription?: string
): Promise<void> {
  const html = generateReportHTML(articles, bookTitle, settings, bookDescription);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    throw new Error('无法创建打印框架');
  }

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  // 等待加载后打印
  await new Promise(resolve => setTimeout(resolve, 500));

  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();

  // 清理
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
}

// 打印预览
export function printPreview(
  articles: Article[],
  bookTitle: string,
  settings: ExtendedPrintSettings,
  bookDescription?: string
): void {
  const html = generateReportHTML(articles, bookTitle, settings, bookDescription);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('请允许弹出窗口以查看打印预览');
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();
}
