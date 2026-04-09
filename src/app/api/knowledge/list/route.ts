import { NextResponse } from 'next/server';
import { isSupabaseConfigured, getAllKnowledgeBases, getQAPairs } from '@/lib/vectorStore';

// 获取所有知识库
export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        configured: false,
        knowledgeBases: [],
        message: '请在环境变量中配置 Supabase'
      });
    }

    const knowledgeBases = await getAllKnowledgeBases();
    
    return NextResponse.json({
      configured: true,
      knowledgeBases,
    });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json(
      { error: '获取知识库列表失败' },
      { status: 500 }
    );
  }
}
