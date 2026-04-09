-- Supabase Database Setup for AI Book Compiler
-- 运行此 SQL 来创建所需的表

-- 启用向量扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 知识库表
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 文档块表
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Q&A 对表
CREATE TABLE IF NOT EXISTS qa_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_document_chunks_kb ON document_chunks(knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_qa_pairs_kb ON qa_pairs(knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_created ON knowledge_bases(created_at DESC);

-- RLS 策略 (Row Level Security)
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_pairs ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（生产环境应限制）
CREATE POLICY "Allow all for knowledge_bases" ON knowledge_bases FOR ALL USING (true);
CREATE POLICY "Allow all for document_chunks" ON document_chunks FOR ALL USING (true);
CREATE POLICY "Allow all for qa_pairs" ON qa_pairs FOR ALL USING (true);

-- 向量搜索函数 (pgvector)
CREATE OR REPLACE FUNCTION match_document_chunks(
  knowledge_base_id_param UUID,
  query_embedding_param VECTOR(1536),
  match_count_param INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  file_name TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.file_name,
    1 - (dc.embedding <=> query_embedding_param) AS similarity
  FROM document_chunks dc
  WHERE dc.knowledge_base_id = knowledge_base_id_param
  ORDER BY dc.embedding <=> query_embedding_param
  LIMIT match_count_param;
END;
$$;

-- 统计函数
CREATE OR REPLACE FUNCTION get_knowledge_base_stats(kb_id UUID)
RETURNS TABLE (
  total_files BIGINT,
  total_chunks BIGINT,
  total_qa_pairs BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT dc.file_name)::BIGINT,
    COUNT(dc.id)::BIGINT,
    COUNT(qa.id)::BIGINT
  FROM knowledge_bases kb
  LEFT JOIN document_chunks dc ON dc.knowledge_base_id = kb.id
  LEFT JOIN qa_pairs qa ON qa.knowledge_base_id = kb.id
  WHERE kb.id = kb_id
  GROUP BY kb.id;
END;
$$;
