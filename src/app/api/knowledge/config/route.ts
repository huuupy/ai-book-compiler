import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.SUPABASE_SERVICE_KEY
    ),
    openai: Boolean(process.env.OPENAI_API_KEY),
    blob: true, // Vercel Blob 总是可用
    qstash: Boolean(process.env.QSTASH_TOKEN),
  });
}
