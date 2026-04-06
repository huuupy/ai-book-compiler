import { NextRequest, NextResponse } from 'next/server';

interface CrawlResult {
  url: string;
  title: string;
  content: string;
  status: 'success' | 'error';
  error?: string;
  summary?: string;
}

// 支持直接抓取的网站
const SUPPORTED_SITES = {
  'jianshu.com': { name: '简书', favicon: '✍️' },
  'csdn.net': { name: 'CSDN', favicon: '💻' },
  'juejin.cn': { name: '掘金', favicon: '💎' },
  'github.com': { name: 'GitHub', favicon: '🐙' },
  'medium.com': { name: 'Medium', favicon: '📝' },
  'bilibili.com': { name: 'B站', favicon: '📺' },
};

// 被屏蔽的网站
const BLOCKED_SITES = {
  'xiaohongshu.com': { name: '小红书' },
  'douyin.com': { name: '抖音' },
  'weibo.com': { name: '微博' },
  'taobao.com': { name: '淘宝' },
  'tmall.com': { name: '天猫' },
  'jd.com': { name: '京东' },
  'pinduoduo.com': { name: '拼多多' },
  'toutiao.com': { name: '今日头条' },
  'douban.com': { name: '豆瓣' },
  'zhihu.com': { name: '知乎' },
};

// 检测网站类型
function detectSite(url: string) {
  const lowerUrl = url.toLowerCase();
  for (const [domain, info] of Object.entries(SUPPORTED_SITES)) {
    if (lowerUrl.includes(domain)) return { type: 'supported', ...info };
  }
  for (const [domain, info] of Object.entries(BLOCKED_SITES)) {
    if (lowerUrl.includes(domain)) return { type: 'blocked', ...info };
  }
  return { type: 'unknown' };
}

// 抓取网页内容
async function fetchContent(url: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'zh-CN,zh;q=0.9',
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html = await res.text();

  // 提取标题
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s*[-_].*$/, '').trim() : '文章';

  // 提取 meta 描述
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const metaDesc = descMatch ? descMatch[1].trim() : '';

  // 清理 HTML
  let clean = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // 提取正文
  let body = '';
  const patterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class=["'][^"']*(?:content|post|entry|article)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match) {
      body = Array.isArray(match) ? match[1] || match[0] : match;
      break;
    }
  }

  if (!body) body = clean;

  // HTML 转文本
  let text = (body as string)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();

  // 清理页脚
  const footerIdx = text.search(/ICP备|Copyright|All Rights Reserved/);
  if (footerIdx > 0 && footerIdx < text.length * 0.9) text = text.substring(0, footerIdx);

  return { title, content: metaDesc ? `${metaDesc}\n\n${text}` : text };
}

// 生成总结
async function generateSummary(content: string, apiConfig: any, requirement?: string) {
  if (!apiConfig?.deepseekApiKey) {
    const words = content.split(/\s+/).filter(w => w.length > 0).length;
    const sentences = content.replace(/\n/g, ' ').split(/[.。!！?？]+/).filter(s => s.trim().length > 15);
    return `## 内容摘要

- 原文长度：约 ${words} 字

### 内容预览
${content.slice(0, 1000)}${content.length > 1000 ? '\n...(内容已截断)' : ''}

### 关键信息
${sentences.slice(0, 3).map((s, i) => `${i + 1}. ${s.trim()}`).join('\n')}

---
💡 配置 DeepSeek API 可获得更智能的总结`;
  }

  const maxTokens = Math.min(Math.max(apiConfig.maxTokens || 2000, 1), 65536);
  const reqContext = requirement ? `\n\n【用户需求】${requirement}\n请重点总结相关内容。` : '';

  try {
    const res = await fetch(`${apiConfig.deepseekApiUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiConfig.deepseekApiKey}` },
      body: JSON.stringify({
        model: apiConfig.model || 'deepseek-chat',
        messages: [{ role: 'user', content: `用中文总结以下内容：${reqContext}\n\n${content.slice(0, 4000)}\n\n格式：\n## 核心主题\n## 详细内容\n## 关键要点（列出3点）\n## 重要结论` }],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content || '总结生成失败';
    }
  } catch (e) {
    return `总结生成失败`;
  }

  return `## 基础摘要\n\n${content.slice(0, 1500)}...`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, urls, content, title, apiConfig, requirement } = body;

    // 手动输入模式
    if (type === 'manual') {
      if (!content?.trim()) return NextResponse.json({ success: false, error: '请输入内容' }, { status: 400 });
      const summary = await generateSummary(content, apiConfig, requirement);
      return NextResponse.json({
        success: true,
        results: [{ url: 'manual', title: title || '手动输入', content: content.slice(0, 5000), status: 'success', summary }],
      });
    }

    // URL 模式
    if (type === 'url') {
      if (!urls?.length) return NextResponse.json({ success: false, error: '请输入URL' }, { status: 400 });

      const results: CrawlResult[] = [];
      for (const url of urls.filter(u => u?.trim())) {
        const site = detectSite(url);

        // 被屏蔽的网站
        if (site.type === 'blocked') {
          results.push({
            url, title: `⚠️ ${site.name} 无法抓取`, content: '', status: 'error',
            summary: `## ${site.name} 无法直接抓取\n\n**原因：** 该平台有反爬机制\n\n### 解决方案\n\n**最可靠的方法：手动复制**\n1. 在浏览器打开链接\n2. 手动复制文章正文\n3. 回到本页面 → 选择「手动输入」模式\n4. 粘贴内容 → 开始处理\n\n**使用阅读工具**\n- Chrome 扩展「简悦 SimpRead」\n- Chrome 扩展「收趣稍后读」`,
          });
          continue;
        }

        // 尝试抓取
        try {
          const { title: t, content: c } = await fetchContent(url);
          if (!c || c.length < 100) throw new Error('内容太少');
          const summary = await generateSummary(c, apiConfig, requirement);
          results.push({ url, title: t, content: c.slice(0, 5000), status: 'success', summary });
        } catch (e: any) {
          results.push({
            url, title: '抓取失败', content: '', status: 'error', error: e.message,
            summary: `## 抓取失败\n\n**错误：** ${e.message}\n\n**建议：** 手动复制内容，选择「手动输入」模式`,
          });
        }
      }

      const ok = results.filter(r => r.status === 'success').length;
      return NextResponse.json({
        success: true, results,
        message: `${ok} 篇成功，${results.length - ok} 篇需手动处理`,
      });
    }

    return NextResponse.json({ success: false, error: '无效类型' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    supported: Object.entries(SUPPORTED_SITES).map(([d, i]) => ({ domain: d, ...i })),
    blocked: Object.entries(BLOCKED_SITES).map(([d, i]) => ({ domain: d, ...i })),
  });
}
