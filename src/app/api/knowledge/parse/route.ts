import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@upstash/qstash';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';

// QStash 客户端
const qstash = new Client({
  token: process.env.QSTASH_TOKEN || '',
});

// 提交解析任务到队列
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileUrl, knowledgeBaseId, fileName, chunks } = body;

    // 如果没有配置 QStash，直接处理
    if (!process.env.QSTASH_TOKEN) {
      return NextResponse.json({
        success: true,
        message: 'Background processing skipped (QStash not configured)',
        fileUrl,
        fileName,
      });
    }

    // 提交到队列
    const response = await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/knowledge/process`,
      body: {
        fileUrl,
        knowledgeBaseId,
        fileName,
        chunks,
      },
      retries: 3,
    });

    return NextResponse.json({
      success: true,
      jobId: response.messageId,
    });
  } catch (error) {
    console.error('Queue error:', error);
    return NextResponse.json(
      { error: 'Failed to queue task' },
      { status: 500 }
    );
  }
}

// 获取任务状态
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId || !process.env.QSTASH_TOKEN) {
    return NextResponse.json({ status: 'unknown' });
  }

  try {
    const messages = await qstash.messages.get(jobId);
    return NextResponse.json({
      messageId: messages.messageId,
      state: messages.state,
    });
  } catch (error) {
    return NextResponse.json({ status: 'unknown' });
  }
}
