import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { parseFile, chunkText, cleanText } from '@/lib/fileParser';
import { generateQAFromText } from '@/lib/openai';
import { isSupabaseConfigured, createKnowledgeBase, saveDocumentChunk, saveQAPair } from '@/lib/vectorStore';
import { generateId } from '@/lib/utils';

export const maxDuration = 60; // Vercel Pro 允许最长 60 秒

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const knowledgeBaseName = formData.get('knowledgeBaseName') as string;

    if (!file) {
      return NextResponse.json({ error: '没有上传文件' }, { status: 400 });
    }

    if (!knowledgeBaseName?.trim()) {
      return NextResponse.json({ error: '请填写知识库名称' }, { status: 400 });
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 解析文件
    const { text, fileType } = await parseFile(buffer, file.name);
    
    if (!text || text.trim().length < 20) {
      return NextResponse.json({ 
        error: '无法从文件中提取有效文本内容' 
      }, { status: 400 });
    }

    // 清理文本
    const cleanContent = cleanText(text);

    // 分块
    const chunks = chunkText(cleanContent);

    // 创建或获取知识库 ID
    let knowledgeBaseId = '';
    if (isSupabaseConfigured()) {
      try {
        const kb = await createKnowledgeBase(knowledgeBaseName);
        knowledgeBaseId = kb.id;
      } catch (error) {
        console.warn('Failed to create knowledge base:', error);
      }
    } else {
      // 未配置数据库时生成临时 ID
      knowledgeBaseId = generateId();
    }

    // 保存文档块到数据库
    if (isSupabaseConfigured()) {
      for (let i = 0; i < chunks.length; i++) {
        try {
          await saveDocumentChunk(knowledgeBaseId, file.name, chunks[i], i);
        } catch (error) {
          console.warn('Failed to save chunk:', error);
        }
      }
    }

    // 生成 Q&A 对（仅处理前 10 个块以节省 API 调用）
    const chunksForQA = chunks.slice(0, 10);
    const allQAPairs: { question: string; answer: string }[] = [];
    
    for (const chunk of chunksForQA) {
      try {
        const qaPairs = await generateQAFromText(chunk);
        allQAPairs.push(...qaPairs);
        
        // 保存 Q&A 到数据库
        if (isSupabaseConfigured()) {
          for (const qa of qaPairs) {
            try {
              await saveQAPair(knowledgeBaseId, file.name, qa.question, qa.answer);
            } catch (error) {
              console.warn('Failed to save QA pair:', error);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to generate QA for chunk:', error);
      }
    }

    // 保存原始文件到 Vercel Blob
    const fileId = generateId();
    let blobUrl = '';
    try {
      const blob = await put(
        `${knowledgeBaseName}/${fileId}_${file.name}`,
        buffer,
        { addRandomSuffix: true, access: 'public' }
      );
      blobUrl = blob.url;
    } catch (error) {
      console.warn('Failed to upload to Blob:', error);
    }

    // 提交后台任务处理剩余块（如果有）
    if (chunks.length > 10) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/knowledge/parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileUrl: blobUrl,
            knowledgeBaseId,
            fileName: file.name,
            chunks: chunks.slice(10),
          }),
        });
      } catch (error) {
        console.warn('Failed to submit background task:', error);
      }
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileType,
      textLength: cleanContent.length,
      chunks: chunks.length,
      qaPairs: allQAPairs.length,
      blobUrl,
      knowledgeBaseId,
      knowledgeBaseName,
      qaPreview: allQAPairs.slice(0, 5),
      storageInfo: {
        supabase: isSupabaseConfigured() ? 'connected' : 'not_configured',
        blob: blobUrl ? 'uploaded' : 'skipped',
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: '文件处理失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
