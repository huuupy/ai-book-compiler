import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 向量维度（text-embedding-3-small 使用 1536 维）
export const EMBEDDING_DIMENSION = 1536;

// 延迟创建 Supabase 客户端
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }
  
  return supabaseInstance;
}

// 知识库表类型
export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// 文档块表类型
export interface DocumentChunk {
  id: string;
  knowledge_base_id: string;
  file_name: string;
  content: string;
  chunk_index: number;
  created_at: string;
}

// Q&A 对表类型
export interface QAPair {
  id: string;
  knowledge_base_id: string;
  file_name: string;
  question: string;
  answer: string;
  created_at: string;
}

// 创建知识库
export async function createKnowledgeBase(name: string, description?: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('knowledge_bases')
    .insert({ name, description })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// 保存文档块
export async function saveDocumentChunk(
  knowledgeBaseId: string,
  fileName: string,
  content: string,
  chunkIndex: number
) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('document_chunks')
    .insert({
      knowledge_base_id: knowledgeBaseId,
      file_name: fileName,
      content,
      chunk_index: chunkIndex,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// 保存 Q&A 对
export async function saveQAPair(
  knowledgeBaseId: string,
  fileName: string,
  question: string,
  answer: string
) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('qa_pairs')
    .insert({
      knowledge_base_id: knowledgeBaseId,
      file_name: fileName,
      question,
      answer,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// 搜索相似内容（用于 RAG）
export async function searchSimilarContent(
  knowledgeBaseId: string,
  queryEmbedding: number[],
  matchCount: number = 5
) {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .rpc('match_document_chunks', {
      knowledge_base_id_param: knowledgeBaseId,
      query_embedding_param: queryEmbedding,
      match_count_param: matchCount,
    });
  
  if (error) {
    console.error('Vector search error:', error);
    return [];
  }
  
  return data;
}

// 获取知识库中的 Q&A 对
export async function getQAPairs(knowledgeBaseId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('qa_pairs')
    .select('*')
    .eq('knowledge_base_id', knowledgeBaseId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// 获取所有知识库
export async function getAllKnowledgeBases() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('knowledge_bases')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// 检查 Supabase 是否配置
export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}
