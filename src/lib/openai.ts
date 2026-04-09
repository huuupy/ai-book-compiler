import OpenAI from 'openai';

// OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Q&A 生成 Prompt
const QA_GENERATION_PROMPT = `你是一个专业的知识整理助手。请根据以下文本内容，生成 3-5 个深刻的问题及其详细答案。

要求：
1. 问题要有深度，能够考察对核心概念的理解
2. 答案要详细完整，包含具体例子或解释
3. 以 JSON 格式输出，包含 "qa_pairs" 数组
4. 每个 QA 对包含 "question" 和 "answer" 字段
5. 如果文本内容不足 50 字符，返回空的 qa_pairs 数组

输出格式：
{
  "qa_pairs": [
    {
      "question": "问题内容",
      "answer": "详细答案内容"
    }
  ]
}

文本内容：
`;

// 生成 Q&A 对
export async function generateQAFromText(text: string): Promise<{
  question: string;
  answer: string;
}[]> {
  // 如果没有配置 API Key，返回空
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not configured, using simple Q&A generation');
    return generateSimpleQA(text);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的知识整理助手，擅长从文本中提取关键信息并生成深刻的问题和答案。',
        },
        {
          role: 'user',
          content: QA_GENERATION_PROMPT + text.slice(0, 2000), // 限制文本长度
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || '';
    
    // 解析 JSON 响应
    try {
      const result = JSON.parse(content);
      return result.qa_pairs || [];
    } catch {
      // 如果 JSON 解析失败，尝试提取
      const match = content.match(/```json\n([\s\S]*?)\n```/) ||
                   content.match(/```\n([\s\S]*?)\n```/) ||
                   content.match(/\{[\s\S]*\}/);
      if (match) {
        const result = JSON.parse(match[1] || match[0]);
        return result.qa_pairs || [];
      }
      return [];
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateSimpleQA(text);
  }
}

// 简单的 Q&A 生成（备用方案）
function generateSimpleQA(text: string): { question: string; answer: string }[] {
  const qaPairs: { question: string; answer: string }[] = [];
  
  // 分割句子
  const sentences = text.split(/[。！？\n]+/).filter(s => s.trim().length > 15);
  
  // 按段落分组
  const paragraphs: string[] = [];
  let currentParagraph = '';
  
  for (const sentence of sentences) {
    currentParagraph += sentence + '。';
    if (currentParagraph.length > 100 || sentences.indexOf(sentence) === sentences.length - 1) {
      if (currentParagraph.trim()) {
        paragraphs.push(currentParagraph.trim());
      }
      currentParagraph = '';
    }
  }
  
  // 为每个段落生成 Q&A
  for (const paragraph of paragraphs.slice(0, 5)) {
    if (paragraph.length > 30) {
      // 提取关键词作为问题
      const words = paragraph.split(/[,，、]/).filter(w => w.length > 2);
      const keyword = words[0] || paragraph.slice(0, 20);
      
      qaPairs.push({
        question: `请解释：${keyword.slice(0, 30)}...`,
        answer: paragraph,
      });
    }
  }
  
  return qaPairs;
}

// 生成文本摘要
export async function generateSummary(text: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return text.slice(0, 200) + '...';
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的知识整理助手，擅长总结文本的核心内容。',
        },
        {
          role: 'user',
          content: `请用 50-100 字总结以下文本的核心内容：\n\n${text.slice(0, 1500)}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || text.slice(0, 200);
  } catch (error) {
    console.error('Summary generation error:', error);
    return text.slice(0, 200) + '...';
  }
}

// 检查 OpenAI 是否配置
export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}
