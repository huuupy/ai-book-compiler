import { NextRequest, NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { generateQAFromText } from '@/lib/openai';
import { saveQAPair, isSupabaseConfigured } from '@/lib/vectorStore';

// 背景处理 Q&A 生成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { knowledgeBaseId, fileName, chunks } = body;

    console.log(`Processing Q&A for ${fileName}, ${chunks?.length || 0} chunks`);

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({ success: true, qaPairsGenerated: 0 });
    }

    let qaPairsGenerated = 0;

    // 为每个文本块生成 Q&A
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        const qaPairs = await generateQAFromText(chunk);
        
        // 保存到数据库（如果已配置）
        if (isSupabaseConfigured() && knowledgeBaseId) {
          for (const qa of qaPairs) {
            await saveQAPair(knowledgeBaseId, fileName, qa.question, qa.answer);
          }
        }
        
        qaPairsGenerated += qaPairs.length;
      } catch (error) {
        console.error(`Error generating Q&A for chunk ${i}:`, error);
      }
    }

    console.log(`Generated ${qaPairsGenerated} Q&A pairs for ${fileName}`);

    return NextResponse.json({
      success: true,
      qaPairsGenerated,
      fileName,
    });
  } catch (error) {
    console.error('Background processing error:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}
