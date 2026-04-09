import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { generateId } from '@/lib/utils';

// 文本分块
function chunkText(text: string, chunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

// 从文本生成 Q&A 对（简单实现）
function generateQAFromChunk(chunk: string): { question: string; answer: string }[] {
  const qaPairs: { question: string; answer: string }[] = [];
  
  // 简单的句子分割
  const sentences = chunk.split(/[。！？\n]+/).filter(s => s.trim().length > 20);
  
  // 每3句话生成一个 Q&A
  for (let i = 0; i < sentences.length; i += 3) {
    const group = sentences.slice(i, i + 3);
    if (group.length >= 2) {
      const answer = group.join('。') + '。';
      const question = `请解释以下内容：${group[0].slice(0, 20)}...`;
      qaPairs.push({ question, answer });
    }
  }
  
  return qaPairs;
}

// 解析 PDF
async function parsePDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

// 解析 Word
async function parseWord(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const knowledgeBaseName = formData.get('knowledgeBaseName') as string;

    if (!file) {
      return NextResponse.json({ error: '没有上传文件' }, { status: 400 });
    }

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 解析文件内容
    let text = '';
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      text = await parsePDF(buffer);
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      text = await parseWord(buffer);
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      text = buffer.toString('utf-8');
    } else {
      // 对于 PPT 等其他格式，先尝试提取文本
      text = buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ');
    }

    // 清理文本
    text = text.replace(/\s+/g, ' ').trim();

    // 分块
    const chunks = chunkText(text);
    
    // 生成 Q&A
    const allQAPairs: { question: string; answer: string }[] = [];
    for (const chunk of chunks) {
      const qaPairs = generateQAFromChunk(chunk);
      allQAPairs.push(...qaPairs);
    }

    // 保存到 Vercel Blob
    const fileId = generateId();
    const blob = await put(
      `${knowledgeBaseName}/${fileId}_${file.name}`,
      buffer,
      { addRandomSuffix: true, access: 'public' }
    );

    // 在实际项目中，这里应该将 Q&A 对保存到数据库
    // 目前返回结果供前端显示

    return NextResponse.json({
      success: true,
      fileName: file.name,
      textLength: text.length,
      chunks: chunks.length,
      qaPairs: allQAPairs.length,
      blobUrl: blob.url,
      qaPreview: allQAPairs.slice(0, 3) // 返回前3个 Q&A 预览
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: '文件处理失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
