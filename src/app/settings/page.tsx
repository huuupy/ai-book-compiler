'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  Key, 
  Globe, 
  Database,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

export default function SettingsPage() {
  const { printSettings, updatePrintSettings } = useAppStore();
  
  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('https://api.deepseek.com/v1');
  const [autoProcess, setAutoProcess] = useState(true);
  const [requestInterval, setRequestInterval] = useState(3);
  const [maxConcurrency, setMaxConcurrency] = useState(2);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // 保存设置到本地存储
    const settings = {
      apiKey,
      apiEndpoint,
      autoProcess,
      requestInterval,
      maxConcurrency,
    };
    localStorage.setItem('app-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportData = () => {
    const data = {
      articles: useAppStore.getState().articles,
      collections: useAppStore.getState().collections,
      settings: useAppStore.getState().printSettings,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sanple-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.articles) useAppStore.setState({ articles: data.articles });
          if (data.collections) useAppStore.setState({ collections: data.collections });
          if (data.settings) useAppStore.setState({ printSettings: data.settings });
          alert('数据导入成功！');
        } catch {
          alert('数据格式错误，请检查文件内容');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">设置</h1>
          <p className="text-slate-600">配置系统参数和API设置</p>
        </div>

        <div className="space-y-6">
          {/* API Settings */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                API设置
              </h2>
              <CardDescription>
                配置AI模型接口以进行内容处理
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  API Provider
                </label>
                <Select
                  options={[
                    { value: 'deepseek', label: 'DeepSeek' },
                    { value: 'openai', label: 'OpenAI' },
                    { value: 'anthropic', label: 'Anthropic' },
                    { value: 'custom', label: '自定义' },
                  ]}
                  value="deepseek"
                  onChange={() => {}}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  API Endpoint
                </label>
                <Input
                  placeholder="https://api.deepseek.com/v1"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  icon={<Globe className="w-5 h-5" />}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  API Key
                </label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="sk-xxxxxxxxxxxxxxxx"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    icon={<Key className="w-5 h-5" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700"
                  >
                    {showApiKey ? '隐藏' : '显示'}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  您的API密钥将安全存储在本地浏览器中
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">使用本地模型</p>
                    <p>
                      您也可以配置使用 Ollama 等本地模型服务，
                      只需将 Endpoint 设置为您的本地地址（如 http://localhost:11434）
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Crawl Settings */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                采集设置
              </h2>
              <CardDescription>
                配置爬虫行为和请求参数
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="请求间隔（秒）"
                  value={requestInterval.toString()}
                  onChange={(e) => setRequestInterval(Number(e.target.value))}
                  options={[
                    { value: '1', label: '1秒' },
                    { value: '2', label: '2秒' },
                    { value: '3', label: '3秒' },
                    { value: '5', label: '5秒' },
                    { value: '10', label: '10秒' },
                  ]}
                />
                
                <Select
                  label="最大并发数"
                  value={maxConcurrency.toString()}
                  onChange={(e) => setMaxConcurrency(Number(e.target.value))}
                  options={[
                    { value: '1', label: '1个' },
                    { value: '2', label: '2个' },
                    { value: '3', label: '3个' },
                    { value: '5', label: '5个' },
                  ]}
                />
              </div>

              <Checkbox
                label="采集后自动进行AI处理"
                checked={autoProcess}
                onChange={(e) => setAutoProcess(e.target.checked)}
              />
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                数据管理
              </h2>
              <CardDescription>
                导出和导入您的数据
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  导出数据
                </Button>
                
                <label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                  <Button variant="outline" as="span" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    导入数据
                  </Button>
                </label>
              </div>
              
              <p className="text-xs text-slate-500">
                导出的数据包含所有文章、合集和设置信息
              </p>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <h2 className="font-semibold text-red-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                危险区域
              </h2>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">清除所有数据</p>
                  <p className="text-sm text-slate-500">
                    此操作将删除所有文章、合集和设置，且不可恢复
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm('确定要清除所有数据吗？此操作不可撤销！')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清除数据
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                设置已保存
              </span>
            )}
            <Button onClick={handleSave}>
              保存设置
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
