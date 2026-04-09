import OpenAI from 'openai';
import type { Agent } from '@/types';

// OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// 单个智能体分析文本
export async function agentAnalyze(
  agent: Agent,
  text: string
): Promise<{ agentName: string; result: string }> {
  // 如果没有配置 API Key，返回基础分析
  if (!process.env.OPENAI_API_KEY) {
    return {
      agentName: agent.name,
      result: simpleAnalysis(agent.name, text),
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: agent.systemPrompt,
        },
        {
          role: 'user',
          content: `请分析以下文本内容：\n\n${text.slice(0, 3000)}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return {
      agentName: agent.name,
      result: response.choices[0]?.message?.content || '分析失败',
    };
  } catch (error) {
    console.error(`Agent ${agent.name} error:`, error);
    return {
      agentName: agent.name,
      result: `分析失败: ${(error as Error).message}`,
    };
  }
}

// 多智能体并行分析
export async function multiAgentAnalyze(
  agents: Agent[],
  text: string,
  onProgress?: (agentName: string, index: number, total: number) => void
): Promise<{ agentName: string; icon: string; color: string; result: string }[]> {
  const enabledAgents = agents.filter(a => a.enabled).sort((a, b) => a.order - b.order);
  
  if (enabledAgents.length === 0) {
    return [];
  }

  const results: { agentName: string; icon: string; color: string; result: string }[] = [];

  // 并行执行所有智能体分析
  const promises = enabledAgents.map(async (agent, index) => {
    onProgress?.(agent.name, index + 1, enabledAgents.length);
    const result = await agentAnalyze(agent, text);
    return {
      agentName: result.agentName,
      icon: agent.icon,
      color: agent.color,
      result: result.result,
    };
  });

  const settled = await Promise.allSettled(promises);
  
  settled.forEach((promise, index) => {
    if (promise.status === 'fulfilled') {
      results.push(promise.value);
    } else {
      const agent = enabledAgents[index];
      results.push({
        agentName: agent.name,
        icon: agent.icon,
        color: agent.color,
        result: `分析失败: ${promise.reason}`,
      });
    }
  });

  return results;
}

// 简单的本地分析（无 API 时使用）
function simpleAnalysis(agentName: string, text: string): string {
  const sentences = text.split(/[。！？\n]+/).filter(s => s.trim().length > 10);

  switch (agentName) {
    case '事实确认':
      return `## 核心定义
基于文本提取的关键概念定义。

## 主要论点
${sentences.slice(0, 3).map((s, i) => `- ${s.trim().slice(0, 50)}...`).join('\n')}

## 关键术语
- 核心概念: ${sentences[0]?.trim().slice(0, 30) || '未找到'}...
- 扩展内容: ${sentences[1]?.trim().slice(0, 30) || '未找到'}...

## 待核实
- 请配置 OpenAI API 以获取准确的事实核查`;

    case '逻辑拆解':
      return `## 因果链条
文本中存在以下潜在因果关系：
${sentences.slice(0, 2).map(s => `- ${s.trim().slice(0, 60)}...`).join('\n')}

## 论证结构
基于文本分析，呈现出归纳式论证结构。

## 论据评估
- 强论据: ${sentences[0]?.trim().slice(0, 50) || '未找到'}...
- 弱论据: 需要更多数据支持

## 逻辑漏洞
- 需要更多上下文信息才能准确评估
- 请配置 OpenAI API 以获取详细分析`;

    case '应用迁移':
      return `## 应用场景
1. 教育培训场景
2. 知识整理场景
3. 实际工作场景

## 类比解释
核心概念类似于...（需要 API 生成精确类比）

## 实践步骤
1. 理解核心定义
2. 识别关键论点
3. 应用于实际场景

## 常见误解
- 误解: 过度简化概念 → 纠正: 需要理解完整的上下文`;

    case '批判性思维':
      return `## 理论局限
- 适用范围有限
- 需要更多案例验证
- 可能有上下文依赖性

## 反例与对立观点
需要更多对比信息才能提供完整的反例分析。

## 相关理论对比
| 维度 | 本理论 | 其他理论 |
|------|--------|----------|
| 深度 | 待评估 | 待对比 |

## 适用边界
- 适用于: 初步了解场景
- 不适用于: 专业决策场景`;

    default:
      return `## 分析结果
${sentences.slice(0, 5).join('\n\n')}`;
  }
}

// 生成 Q&A 对（保持原有功能）
export async function generateQAFromText(text: string): Promise<{
  question: string;
  answer: string;
}[]> {
  if (!process.env.OPENAI_API_KEY) {
    return generateSimpleQA(text);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `你是一个专业的知识整理助手。请根据文本内容生成 3-5 个深刻的问题及其详细答案。

要求：
1. 问题要有深度，能够考察对核心概念的理解
2. 答案要详细完整
3. 以 JSON 格式输出，包含 "qa_pairs" 数组
4. 每个 QA 对包含 "question" 和 "answer" 字段

输出格式：
{
  "qa_pairs": [
    {"question": "问题内容", "answer": "详细答案内容"}
  ]
}`,
        },
        {
          role: 'user',
          content: text.slice(0, 2000),
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || '';
    
    try {
      const result = JSON.parse(content);
      return result.qa_pairs || [];
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        const result = JSON.parse(match[0]);
        return result.qa_pairs || [];
      }
      return [];
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateSimpleQA(text);
  }
}

// 简单的 Q&A 生成
function generateSimpleQA(text: string): { question: string; answer: string }[] {
  const qaPairs: { question: string; answer: string }[] = [];
  const sentences = text.split(/[。！？\n]+/).filter(s => s.trim().length > 15);
  
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
  
  for (const paragraph of paragraphs.slice(0, 5)) {
    if (paragraph.length > 30) {
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

// 检查 OpenAI 是否配置
export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}
