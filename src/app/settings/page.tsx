'use client';

import { useState, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import {
  Settings,
  Key,
  Globe,
  Bot,
  TestTube,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  RefreshCw,
} from 'lucide-react';

interface ApiConfig {
  deepseekApiUrl: string;
  deepseekApiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<ApiConfig>({
    deepseekApiUrl: 'https://api.deepseek.com/v1',
    deepseekApiKey: '',
    model: 'deepseek-chat',
    maxTokens: 2000,
    temperature: 0.7,
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState(false);

  // 保存配置到 localStorage
  const saveConfig = useCallback(() => {
    localStorage.setItem('api_config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [config]);

  // 加载保存的配置
  const loadConfig = useCallback(() => {
    const saved = localStorage.getItem('api_config');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  // 测试 API 连接
  const testApi = useCallback(async () => {
    if (!config.deepseekApiKey) {
      setTestResult({ success: false, message: '请输入 API Key' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`${config.deepseekApiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.deepseekApiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'user', content: '你好，请回复"API连接测试成功"' }
          ],
          max_tokens: 50,
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || '';
        setTestResult({ success: true, message: `连接成功！AI回复：${reply}` });
      } else {
        const error = await response.json();
        setTestResult({ success: false, message: `连接失败：${error.error?.message || response.statusText}` });
      }
    } catch (error: any) {
      setTestResult({ success: false, message: `连接错误：${error.message}` });
    }

    setTesting(false);
  }, [config]);

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Settings className="w-7 h-7" />
            API 设置
          </h1>
          <p className="text-slate-600">
            配置 AI 服务 API，支持 DeepSeek、OpenAI 等兼容接口
          </p>
        </div>

        {/* DeepSeek API 配置 */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              DeepSeek API 配置
            </h2>
            <CardDescription>
              请输入您的 DeepSeek API 密钥，支持 DeepSeek-V3 和 DeepSeek-Coder 模型
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                API 地址
              </label>
              <Input
                placeholder="https://api.deepseek.com/v1"
                value={config.deepseekApiUrl}
                onChange={(e) => setConfig({ ...config, deepseekApiUrl: e.target.value })}
              />
              <p className="text-xs text-slate-500">
                DeepSeek API 地址，默认为官方地址
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                API Key
              </label>
              <Input
                type="password"
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                value={config.deepseekApiKey}
                onChange={(e) => setConfig({ ...config, deepseekApiKey: e.target.value })}
              />
              <p className="text-xs text-slate-500">
                从 DeepSeek 平台获取的 API Key
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                模型名称
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'deepseek-chat', name: 'DeepSeek V3', desc: '通用对话' },
                  { id: 'deepseek-coder', name: 'DeepSeek Coder', desc: '代码生成' },
                  { id: 'deepseek-reasoner', name: 'DeepSeek R1', desc: '推理模型' },
                ].map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setConfig({ ...config, model: model.id })}
                    className={cn(
                      'p-3 rounded-xl border-2 text-left transition-all',
                      config.model === model.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <p className="font-medium text-sm">{model.name}</p>
                    <p className="text-xs text-slate-500">{model.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  最大Token数
                </label>
                <Input
                  type="number"
                  min={100}
                  max={64000}
                  value={config.maxTokens}
                  onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) || 2000 })}
                />
                <p className="text-xs text-slate-500">最大回复长度</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Temperature
                </label>
                <Input
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) || 0.7 })}
                />
                <p className="text-xs text-slate-500">创造性程度 (0-2)</p>
              </div>
            </div>

            {/* 测试结果 */}
            {testResult && (
              <div className={cn(
                'p-4 rounded-xl flex items-start gap-2',
                testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              )}>
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm">{testResult.message}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={testApi}
                disabled={testing || !config.deepseekApiKey}
              >
                {testing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />测试中...</>
                ) : (
                  <><TestTube className="w-4 h-4 mr-2" />测试连接</>
                )}
              </Button>
              <Button onClick={saveConfig}>
                {saved ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2" />已保存</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />保存配置</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 其他 API 配置 */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              其他 API 配置
            </h2>
            <CardDescription>
              支持 OpenAI 兼容格式的 API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">提示</p>
                  <ul className="text-sm text-amber-700 mt-1 space-y-1">
                    <li>• 支持任何兼容 OpenAI 格式的 API 服务</li>
                    <li>• 支持本地部署的 LLM 服务（如 Ollama）</li>
                    <li>• 修改 API 地址即可切换不同的 AI 服务</li>
                    <li>• API Key 仅保存在本地浏览器中</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              如何获取 DeepSeek API Key
            </h2>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium">1</span>
                <span>访问 <a href="https://platform.deepseek.com" target="_blank" className="text-primary hover:underline">DeepSeek 开放平台</a> 并注册账号</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium">2</span>
                <span>完成实名认证（个人开发者免费使用一定额度）</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium">3</span>
                <span>在「API Keys」页面创建新的 API Key</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium">4</span>
                <span>复制 API Key 并粘贴到上方配置框中</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium">5</span>
                <span>点击「测试连接」确保配置正确</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
