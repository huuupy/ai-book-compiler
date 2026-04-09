import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, getQAPairs } from '@/lib/vectorStore';

// 获取知识库的 Q&A 对
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const knowledgeBaseId = searchParams.get('id');

    if (!knowledgeBaseId) {
      return NextResponse.json({ error: '缺少知识库 ID' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        configured: false,
        qaPairs: [],
        message: '请在环境变量中配置 Supabase'
      });
    }

    const qaPairs = await getQAPairs(knowledgeBaseId);
    
    return NextResponse.json({
      configured: true,
      qaPairs,
      total: qaPairs.length,
    });
  } catch (error) {
    console.error('Q&A fetch error:', error);
    return NextResponse.json(
      { error: '获取 Q&A 失败' },
      { status: 500 }
    );
  }
}
