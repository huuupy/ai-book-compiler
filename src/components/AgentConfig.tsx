'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { 
  Bot, 
  Plus, 
  Trash2, 
  Sparkles, 
  GripVertical,
  Wand2,
  Save,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { Agent, TopicType, TOPIC_CONFIGS } from '@/types';
import { AGENTS_STORAGE_KEY, DEFAULT_AGENTS } from '@/types';

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  pink: 'bg-pink-100 text-pink-700 border-pink-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

interface AgentConfigProps {
  onAgentsChange: (agents: Agent[]) => void;
}

export function AgentConfig({ onAgentsChange }: AgentConfigProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicType>('general');

  // 加载保存的配置
  useEffect(() => {
    const saved = localStorage.getItem(AGENTS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAgents(parsed);
        onAgentsChange(parsed);
      } catch {
        initDefaultAgents();
      }
    } else {
      initDefaultAgents();
    }
  }, []);

  const initDefaultAgents = () => {
    const defaultAgents: Agent[] = DEFAULT_AGENTS.map((a, index) => ({
      ...a,
      id: `agent-${Date.now()}-${index}`,
      enabled: true,
      order: index,
    }));
    setAgents(defaultAgents);
    onAgentsChange(defaultAgents);
    localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(defaultAgents));
  };

  const saveAgents = (newAgents: Agent[]) => {
    setAgents(newAgents);
    localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(newAgents));
    onAgentsChange(newAgents);
  };

  const toggleAgent = (id: string) => {
    const newAgents = agents.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    saveAgents(newAgents);
  };

  const deleteAgent = (id: string) => {
    const newAgents = agents.filter(a => a.id !== id);
    saveAgents(newAgents);
  };

  const updateAgent = (updated: Agent) => {
    const newAgents = agents.map(a => 
      a.id === updated.id ? updated : a
    );
    saveAgents(newAgents);
    setEditingAgent(null);
  };

  const addAgent = (agent: Omit<Agent, 'id' | 'order'>) => {
    const newAgent: Agent = {
      ...agent,
      id: `agent-${Date.now()}`,
      order: agents.length,
    };
    const newAgents = [...agents, newAgent];
    saveAgents(newAgents);
    setShowAddForm(false);
  };

  const resetToDefault = () => {
    initDefaultAgents();
  };

  const autoConfigureForTopic = (topic: TopicType) => {
    const configs: Record<TopicType, string[]> = {
      technology: ['事实确认', '应用迁移', '批判性思维'],
      science: ['事实确认', '逻辑拆解', '应用迁移'],
      business: ['事实确认', '逻辑拆解', '批判性思维'],
      philosophy: ['逻辑拆解', '批判性思维', '应用迁移'],
      history: ['事实确认', '批判性思维', '应用迁移'],
      psychology: ['事实确认', '逻辑拆解', '应用迁移'],
      education: ['应用迁移', '事实确认', '批判性思维'],
      health: ['事实确认', '批判性思维', '应用迁移'],
      arts: ['批判性思维', '应用迁移', '逻辑拆解'],
      general: ['事实确认', '逻辑拆解', '应用迁移', '批判性思维'],
    };

    const enabledNames = configs[topic];
    const newAgents = agents.map(a => ({
      ...a,
      enabled: enabledNames.includes(a.name),
    }));
    saveAgents(newAgents);
    setSelectedTopic(topic);
  };

  const moveAgent = (index: number, direction: 'up' | 'down') => {
    const newAgents = [...agents];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newAgents.length) return;
    
    [newAgents[index], newAgents[targetIndex]] = [newAgents[targetIndex], newAgents[index]];
    newAgents.forEach((a, i) => a.order = i);
    saveAgents(newAgents);
  };

  const enabledAgents = agents.filter(a => a.enabled).sort((a, b) => a.order - b.order);

  return (
    <Card>
      <CardHeader className="cursor-pointer">
        <div className="flex items-center justify-between" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-slate-900">多智能体配置</h2>
            <Badge variant="secondary">{enabledAgents.length} 个启用</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => { e.stopPropagation(); resetToDefault(); }}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              重置
            </Button>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* 智能推荐 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-slate-900">AI 智能配置</span>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              根据内容类型自动推荐最合适的智能体组合
            </p>
            <div className="flex flex-wrap gap-2">
              {(['general', 'technology', 'science', 'business', 'philosophy', 'education'] as TopicType[]).map(topic => (
                <button
                  key={topic}
                  onClick={() => autoConfigureForTopic(topic)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedTopic === topic
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {topic === 'general' && '📝 通用'}
                  {topic === 'technology' && '💻 科技'}
                  {topic === 'science' && '🔬 科学'}
                  {topic === 'business' && '📈 商业'}
                  {topic === 'philosophy' && '🤔 哲学'}
                  {topic === 'education' && '📚 教育'}
                </button>
              ))}
            </div>
          </div>

          {/* 智能体列表 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-700">已配置的智能体</h3>
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-1" />
                添加自定义
              </Button>
            </div>

            {agents.sort((a, b) => a.order - b.order).map((agent, index) => (
              <div
                key={agent.id}
                className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                  agent.enabled 
                    ? 'bg-white border-slate-200' 
                    : 'bg-slate-50 border-slate-100 opacity-60'
                }`}
              >
                {/* 拖拽手柄 */}
                <div className="flex flex-col gap-1 pt-1">
                  <button 
                    onClick={() => moveAgent(index, 'up')}
                    disabled={index === 0}
                    className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  </button>
                  <GripVertical className="w-4 h-4 text-slate-300" />
                  <button 
                    onClick={() => moveAgent(index, 'down')}
                    disabled={index === agents.length - 1}
                    className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* 智能体信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{agent.icon}</span>
                    <span className="font-medium text-slate-900">{agent.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${colorMap[agent.color]}`}>
                      {agent.color}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {agent.systemPrompt.slice(0, 100)}...
                  </p>
                </div>

                {/* 操作 */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={agent.enabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleAgent(agent.id)}
                  >
                    {agent.enabled ? '已启用' : '启用'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingAgent(agent)}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAgent(agent.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* 添加/编辑表单 */}
          {showAddForm && (
            <AgentForm
              onSubmit={addAgent}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {editingAgent && (
            <AgentForm
              agent={editingAgent}
              onSubmit={(data) => updateAgent({ ...editingAgent, ...data })}
              onCancel={() => setEditingAgent(null)}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}

// 智能体表单组件
interface AgentFormProps {
  agent?: Agent;
  onSubmit: (data: Omit<Agent, 'id' | 'order'>) => void;
  onCancel: () => void;
}

function AgentForm({ agent, onSubmit, onCancel }: AgentFormProps) {
  const [name, setName] = useState(agent?.name || '');
  const [icon, setIcon] = useState(agent?.icon || '🤖');
  const [color, setColor] = useState(agent?.color || 'blue');
  const [systemPrompt, setSystemPrompt] = useState(agent?.systemPrompt || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !systemPrompt.trim()) return;
    onSubmit({ name, icon, color, systemPrompt, enabled: true });
  };

  const colorOptions = [
    { value: 'blue', label: '蓝色' },
    { value: 'purple', label: '紫色' },
    { value: 'green', label: '绿色' },
    { value: 'orange', label: '橙色' },
    { value: 'red', label: '红色' },
    { value: 'pink', label: '粉色' },
    { value: 'indigo', label: '靛蓝' },
  ];

  const iconOptions = ['🤖', '📌', '🔗', '🎯', '⚡', '💡', '🎓', '🔍', '📊', '🧩', '✨', '🛠️'];

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 rounded-lg p-4 space-y-4 border border-slate-200">
      <h4 className="font-medium text-slate-900">{agent ? '编辑智能体' : '添加自定义智能体'}</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">名称</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="智能体名称"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">图标</label>
          <div className="flex flex-wrap gap-1">
            {iconOptions.map(i => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`w-8 h-8 rounded flex items-center justify-center text-lg ${
                  icon === i ? 'bg-purple-100 ring-2 ring-purple-400' : 'bg-white hover:bg-slate-100'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">颜色标签</label>
        <div className="flex gap-2">
          {colorOptions.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                color === c.value ? colorMap[c.value] + ' ring-2 ring-offset-2 ring-' + c.value + '-400' : 'bg-slate-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">系统提示词</label>
        <Textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="输入智能体的系统提示词，定义其角色和行为..."
          rows={6}
          required
        />
        <p className="text-xs text-slate-500 mt-1">
          定义智能体如何分析和处理文本内容
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-1" />
          保存
        </Button>
      </div>
    </form>
  );
}
