import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { Article, PrintSettings } from '@/types';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
// PDF 样式定义
const createStyles = (settings: PrintSettings) => StyleSheet.create({
  page: {
    padding: settings.margin,
    fontFamily: settings.fontFamily,
    fontSize: settings.fontSize,
    lineHeight: settings.lineHeight,
  },
  cover: {
    textAlign: 'center',
    marginBottom: 40,
    paddingBottom: 40,
    borderBottom: '1px solid #e2e8f0',
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e293b',
  },
  coverSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  toc: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '1px solid #e2e8f0',
  },
  tocTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e293b',
  },
  tocItem: {
    flexDirection: 'row',
    marginBottom: 6,
    fontSize: settings.fontSize,
    color: '#475569',
  },
  tocNumber: {
    width: 24,
    color: '#94a3b8',
  },
  articleContainer: {
    marginBottom: 30,
    breakInside: 'avoid' as const,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
  },
  articleMeta: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 12,
  },
  articleSummary: {
    fontSize: settings.fontSize,
    color: '#475569',
    marginBottom: 16,
    fontStyle: 'italic',
    paddingLeft: 12,
    borderLeft: '3px solid ' + settings.primaryColor,
  },
  articleContent: {
    fontSize: settings.fontSize,
    color: '#334155',
    lineHeight: settings.lineHeight,
  },
  paragraph: {
    marginBottom: 10,
  },
  heading2: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#1e293b',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 12,
  },
  bullet: {
    width: 12,
    color: settings.primaryColor,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#94a3b8',
  },
});

// PDF 文档组件
function PdfDocument({ articles, settings, collectionName }: { 
  articles: Article[]; 
  settings: PrintSettings;
  collectionName: string;
}) {
  const styles = createStyles(settings);

  return (
    <Document>
      <Page size={settings.pageSize} style={styles.page}>
        {/* 封面 */}
        {settings.showCover && (
          <View style={styles.cover}>
            <Text style={styles.coverTitle}>{collectionName}</Text>
            <Text style={styles.coverSubtitle}>
              {articles.length} 篇文章 · {new Date().toLocaleDateString('zh-CN')}
            </Text>
          </View>
        )}

        {/* 目录 */}
        {settings.showToc && (
          <View style={styles.toc} fixed>
            <Text style={styles.tocTitle}>目录</Text>
            {articles.map((article, index) => (
              <View key={article.id} style={styles.tocItem}>
                <Text style={styles.tocNumber}>{index + 1}.</Text>
                <Text>{article.title}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 文章列表 */}
        {articles.map((article) => (
          <View key={article.id} style={styles.articleContainer}>
            <Text style={styles.articleTitle}>{article.title}</Text>
            <Text style={styles.articleMeta}>
              来源: {article.source} | {new Date(article.createdAt).toLocaleDateString('zh-CN')}
            </Text>
            <Text style={styles.articleSummary}>{article.summary}</Text>
            <View style={styles.articleContent}>
              {/* 解析HTML内容为简单文本 */}
              <Text style={styles.paragraph}>{article.content.replace(/<[^>]*>/g, '').substring(0, 500)}...</Text>
            </View>
          </View>
        ))}

        {/* 页码 */}
        {settings.showPageNumber && (
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => 
            `第 ${pageNumber} 页 / 共 ${totalPages} 页`
          } fixed />
        )}
      </Page>
    </Document>
  );
}

export async function POST(request: NextRequest) {
  try {
    const { articles, settings, collectionName } = await request.json();

    if (!articles || articles.length === 0) {
      return NextResponse.json({ error: 'No articles to export' }, { status: 400 });
    }

    // 使用 @react-pdf/renderer 生成 PDF
    const pdfDocument = (
      <PdfDocument 
        articles={articles} 
        settings={settings} 
        collectionName={collectionName || '导出文档'} 
      />
    );

    const pdfBuffer = await pdf(pdfDocument).toBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${collectionName || 'export'}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
