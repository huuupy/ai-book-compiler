// 文章状态类型
export type ArticleStatus = 'pending' | 'processing' | 'completed' | 'failed';

// 文章类型
export interface Article {
  id: string;
  title: string;
  content: string;
  source?: string;
  sourceUrl?: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
}

// 合集类型
export interface Collection {
  id: string;
  name: string;
  articleIds: string[];
  template: 'simple' | 'magazine' | 'academic' | 'custom';
  settings: PrintSettings;
  createdAt: string;
  updatedAt: string;
}

// 采集任务类型
export interface CrawlJob {
  id: string;
  url: string;
  title?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: {
    title?: string;
    content?: string;
  };
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// 导出任务类型
export interface ExportJob {
  id: string;
  collectionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  fileUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// 打印设置类型
export interface PrintSettings {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  margin: number;
  layout: 'single' | 'double';
  showToc: boolean;
  showCover: boolean;
  showPageNumber: boolean;
  pageSize: 'A4' | 'A5' | 'Letter';
  primaryColor: string;
  duplex?: boolean;
  grayscale?: boolean;
}

// 排版模板类型
export interface PrintTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  settings: PrintSettings;
}

// 预设智能体配置
export interface Agent {
  id: string;
  name: string;
  icon: string;
  color: string;
  systemPrompt: string;
  enabled: boolean;
  order: number;
}

// 四层级分析配置
export const DEFAULT_AGENTS: Omit<Agent, 'id' | 'enabled' | 'order'>[] = [
  {
    name: '事实确认',
    icon: '📌',
    color: 'blue',
    systemPrompt: `你是一个严格的事实核查专家。请根据以下文本内容：

1. 提取核心定义（精确定义，不超过3句话）
2. 列出主要论点（每个不超过20字）
3. 识别关键数据、日期、术语
4. 标注需要进一步核实的信息

输出格式：
## 核心定义
[定义内容]

## 主要论点
- [论点1]
- [论点2]
- [论点3]

## 关键术语
- [术语1]: [解释]
- [术语2]: [解释]

## 待核实
- [需要核实的信息]`
  },
  {
    name: '逻辑拆解',
    icon: '🔗',
    color: 'purple',
    systemPrompt: `你是一个逻辑分析专家。请根据以下文本内容：

1. 分析因果关系链条（因为...所以...）
2. 识别论证结构（演绎/归纳/类比）
3. 评估论据与结论的关联强度
4. 找出潜在的逻辑漏洞

输出格式：
## 因果链条
[因果关系分析]

## 论证结构
[结构类型和分析]

## 论据评估
- 强论据：[内容]
- 弱论据：[内容]

## 逻辑漏洞
- [漏洞1]
- [漏洞2]`
  },
  {
    name: '应用迁移',
    icon: '🎯',
    color: 'green',
    systemPrompt: `你是一个应用实践专家。请根据以下文本内容：

1. 提供3个现实应用场景
2. 为初学者设计一个类比解释
3. 列出实践步骤清单
4. 预测常见误解并给出纠正方法

输出格式：
## 应用场景
1. [场景1]
2. [场景2]
3. [场景3]

## 类比解释
[用简单类比解释核心概念]

## 实践步骤
1. [步骤1]
2. [步骤2]
3. [步骤3]

## 常见误解
- 误解：[内容] → 纠正：[内容]`
  },
  {
    name: '批判性思维',
    icon: '⚡',
    color: 'orange',
    systemPrompt: `你是一个批判性思维专家。请根据以下文本内容：

1. 分析该理论的局限性
2. 提供反例或对立的观点
3. 与其他相关理论进行对比
4. 指出适用边界和使用注意事项

输出格式：
## 理论局限
- [局限1]
- [局限2]

## 反例与对立观点
- [反例/对立观点]

## 相关理论对比
| 维度 | 本理论 | 相关理论 |
|------|--------|----------|
| [维度1] | [对比] | [对比] |

## 适用边界
- 适用于：[场景]
- 不适用于：[场景]`
  }
];

// 智能体配置存储键
export const AGENTS_STORAGE_KEY = 'ai-book-compiler-agents';

// 主题类型
export type TopicType = 
  | 'technology'    // 科技技术
  | 'science'        // 自然科学
  | 'business'       // 商业经济
  | 'philosophy'     // 哲学思想
  | 'history'        // 历史人文
  | 'psychology'     // 心理学
  | 'education'      // 教育学习
  | 'health'         // 健康医学
  | 'arts'           // 文化艺术
  | 'general';       // 通用

// 主题推荐配置
export const TOPIC_CONFIGS: Record<TopicType, { name: string; icon: string; suggestedAgents: string[] }> = {
  technology: {
    name: '科技技术',
    icon: '💻',
    suggestedAgents: ['事实确认', '应用迁移', '批判性思维']
  },
  science: {
    name: '自然科学',
    icon: '🔬',
    suggestedAgents: ['事实确认', '逻辑拆解', '应用迁移']
  },
  business: {
    name: '商业经济',
    icon: '📈',
    suggestedAgents: ['事实确认', '逻辑拆解', '批判性思维']
  },
  philosophy: {
    name: '哲学思想',
    icon: '🤔',
    suggestedAgents: ['逻辑拆解', '批判性思维', '应用迁移']
  },
  history: {
    name: '历史人文',
    icon: '📜',
    suggestedAgents: ['事实确认', '批判性思维', '应用迁移']
  },
  psychology: {
    name: '心理学',
    icon: '🧠',
    suggestedAgents: ['事实确认', '逻辑拆解', '应用迁移']
  },
  education: {
    name: '教育学习',
    icon: '📚',
    suggestedAgents: ['应用迁移', '事实确认', '批判性思维']
  },
  health: {
    name: '健康医学',
    icon: '🏥',
    suggestedAgents: ['事实确认', '批判性思维', '应用迁移']
  },
  arts: {
    name: '文化艺术',
    icon: '🎨',
    suggestedAgents: ['批判性思维', '应用迁移', '逻辑拆解']
  },
  general: {
    name: '通用',
    icon: '📝',
    suggestedAgents: ['事实确认', '逻辑拆解', '应用迁移', '批判性思维']
  }
};
