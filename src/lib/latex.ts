'use client';

import { useMemo } from 'react';
import katex from 'katex';

/**
 * 渲染包含 LaTeX 公式的文本
 * 支持 $...$ 行内公式和 $$...$$ 块级公式
 */
export function renderLatexWithHtml(text: string): string {
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
      return `<div class="katex-error">公式解析错误: ${formula}</div>`;
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

/**
 * 检测文本中是否包含 LaTeX 公式
 */
export function hasLatex(text: string): boolean {
  if (!text) return false;
  return /\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$/.test(text);
}

/**
 * 提取 LaTeX 公式数量
 */
export function countLatexFormulas(text: string): number {
  if (!text) return 0;
  const blockMatches = (text.match(/\$\$[\s\S]*?\$\$/g) || []).length;
  const inlineMatches = (text.match(/\$[^\$\n]+?\$/g) || []).length;
  return blockMatches + inlineMatches;
}

/**
 * LaTeX 渲染组件
 */
interface LatexRendererProps {
  content: string;
  className?: string;
}

export function LatexRenderer({ content, className = '' }: LatexRendererProps) {
  const html = useMemo(() => renderLatexWithHtml(content), [content]);
  
  if (!content) return null;
  
  return (
    <div 
      className={`latex-renderer ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
