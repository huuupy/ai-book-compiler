'use client';

import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { 
  Printer,
  FileText,
  Palette,
  Maximize,
  Layers,
  Settings
} from 'lucide-react';

export interface ExtendedPrintSettings {
  // 基础设置
  paperSize: 'A4' | 'Letter' | 'A3' | 'Legal';
  orientation: 'portrait' | 'landscape';
  
  // 打印选项
  duplex: boolean;
  copies: number;
  quality: 'high' | 'medium' | 'low';
  colorMode: 'color' | 'grayscale';
  
  // 边距
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  bindingMargin: number;
  
  // 布局
  layout: 'single' | 'double';
  columns: number;
  
  // 样式
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  primaryColor: string;
  
  // 内容选项
  showCover: boolean;
  showToc: boolean;
  showPageNumber: boolean;
  showHeader: boolean;
  headerText: string;
  showFooter: boolean;
  footerText: string;
  
  // 页面设置
  firstPageNumber: number;
  pageNumberPosition: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
  
  // 高级
  enableHyphenation: boolean;
  enableOrphansControl: boolean;
}

interface PrintSettingsPanelProps {
  settings: ExtendedPrintSettings;
  onChange: (settings: ExtendedPrintSettings) => void;
  compact?: boolean;
}

const defaultSettings: ExtendedPrintSettings = {
  paperSize: 'A4',
  orientation: 'portrait',
  duplex: false,
  copies: 1,
  quality: 'high',
  colorMode: 'color',
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 20,
  marginRight: 20,
  bindingMargin: 15,
  layout: 'single',
  columns: 1,
  fontFamily: 'Inter',
  fontSize: 14,
  lineHeight: 1.8,
  primaryColor: '#0ea5e9',
  showCover: true,
  showToc: true,
  showPageNumber: true,
  showHeader: false,
  headerText: '',
  showFooter: false,
  footerText: '',
  firstPageNumber: 1,
  pageNumberPosition: 'bottom-center',
  enableHyphenation: true,
  enableOrphansControl: true,
};

export function PrintSettingsPanel({ 
  settings = defaultSettings, 
  onChange,
  compact = false 
}: PrintSettingsPanelProps) {
  const updateSetting = <K extends keyof ExtendedPrintSettings>(
    key: K,
    value: ExtendedPrintSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const resetToDefaults = () => {
    onChange(defaultSettings);
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {/* 快速设置 */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="纸张大小"
            value={settings.paperSize}
            onChange={(e) => updateSetting('paperSize', e.target.value as ExtendedPrintSettings['paperSize'])}
            options={[
              { value: 'A4', label: 'A4' },
              { value: 'Letter', label: 'Letter' },
              { value: 'A3', label: 'A3' },
              { value: 'Legal', label: 'Legal' },
            ]}
          />
          <Select
            label="方向"
            value={settings.orientation}
            onChange={(e) => updateSetting('orientation', e.target.value as ExtendedPrintSettings['orientation'])}
            options={[
              { value: 'portrait', label: '纵向' },
              { value: 'landscape', label: '横向' },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="打印质量"
            value={settings.quality}
            onChange={(e) => updateSetting('quality', e.target.value as ExtendedPrintSettings['quality'])}
            options={[
              { value: 'high', label: '高' },
              { value: 'medium', label: '中' },
              { value: 'low', label: '低' },
            ]}
          />
          <Select
            label="颜色模式"
            value={settings.colorMode}
            onChange={(e) => updateSetting('colorMode', e.target.value as ExtendedPrintSettings['colorMode'])}
            options={[
              { value: 'color', label: '彩色' },
              { value: 'grayscale', label: '灰度' },
            ]}
          />
        </div>
        <Checkbox
          label="双面打印"
          checked={settings.duplex}
          onChange={(e) => updateSetting('duplex', e.target.checked)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面设置 */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            页面设置
          </h3>
          <CardDescription>配置纸张和页面方向</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="纸张大小"
              value={settings.paperSize}
              onChange={(e) => updateSetting('paperSize', e.target.value as ExtendedPrintSettings['paperSize'])}
              options={[
                { value: 'A4', label: 'A4 (210×297mm)' },
                { value: 'Letter', label: 'Letter (8.5×11in)' },
                { value: 'A3', label: 'A3 (297×420mm)' },
                { value: 'Legal', label: 'Legal (8.5×14in)' },
              ]}
            />
            <Select
              label="打印方向"
              value={settings.orientation}
              onChange={(e) => updateSetting('orientation', e.target.value as ExtendedPrintSettings['orientation'])}
              options={[
                { value: 'portrait', label: '纵向' },
                { value: 'landscape', label: '横向' },
              ]}
            />
          </div>
          
          {/* Orientation Preview */}
          <div className="flex gap-3">
            <button
              onClick={() => updateSetting('orientation', 'portrait')}
              className={cn(
                'flex-1 p-4 rounded-xl border-2 transition-all',
                settings.orientation === 'portrait'
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <div className="w-8 h-12 mx-auto border-2 border-current rounded mb-2" />
              <p className="text-sm font-medium">纵向</p>
            </button>
            <button
              onClick={() => updateSetting('orientation', 'landscape')}
              className={cn(
                'flex-1 p-4 rounded-xl border-2 transition-all',
                settings.orientation === 'landscape'
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <div className="w-12 h-8 mx-auto border-2 border-current rounded mb-2" />
              <p className="text-sm font-medium">横向</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 打印选项 */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            打印选项
          </h3>
          <CardDescription>配置打印机的基本设置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="打印质量"
              value={settings.quality}
              onChange={(e) => updateSetting('quality', e.target.value as ExtendedPrintSettings['quality'])}
              options={[
                { value: 'high', label: '高 (300 DPI)' },
                { value: 'medium', label: '中 (150 DPI)' },
                { value: 'low', label: '低 (72 DPI)' },
              ]}
            />
            <Select
              label="颜色模式"
              value={settings.colorMode}
              onChange={(e) => updateSetting('colorMode', e.target.value as ExtendedPrintSettings['colorMode'])}
              options={[
                { value: 'color', label: '彩色' },
                { value: 'grayscale', label: '灰度' },
              ]}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="份数"
              type="number"
              min={1}
              max={100}
              value={settings.copies}
              onChange={(e) => updateSetting('copies', parseInt(e.target.value) || 1)}
            />
            <Select
              label="首页页码"
              value={settings.firstPageNumber.toString()}
              onChange={(e) => updateSetting('firstPageNumber', parseInt(e.target.value))}
              options={[
                { value: '1', label: '从 1 开始' },
                { value: '0', label: '从 0 开始' },
                { value: 'auto', label: '自动' },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Checkbox
              label="双面打印"
              checked={settings.duplex}
              onChange={(e) => updateSetting('duplex', e.target.checked)}
            />
            <p className="text-xs text-slate-500 pl-6">
              开启后将自动在纸张两面打印，需要打印机支持双面打印功能
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 边距设置 */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Maximize className="w-5 h-5 text-primary" />
            边距设置
          </h3>
          <CardDescription>调整页面边距和装订线</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="上边距 (mm)"
              type="number"
              min={0}
              max={50}
              value={settings.marginTop}
              onChange={(e) => updateSetting('marginTop', parseInt(e.target.value) || 0)}
            />
            <Input
              label="下边距 (mm)"
              type="number"
              min={0}
              max={50}
              value={settings.marginBottom}
              onChange={(e) => updateSetting('marginBottom', parseInt(e.target.value) || 0)}
            />
            <Input
              label="左边距 (mm)"
              type="number"
              min={0}
              max={50}
              value={settings.marginLeft}
              onChange={(e) => updateSetting('marginLeft', parseInt(e.target.value) || 0)}
            />
            <Input
              label="右边距 (mm)"
              type="number"
              min={0}
              max={50}
              value={settings.marginRight}
              onChange={(e) => updateSetting('marginRight', parseInt(e.target.value) || 0)}
            />
          </div>
          
          <Input
            label="装订边距 (mm)"
            type="number"
            min={0}
            max={50}
            value={settings.bindingMargin}
            onChange={(e) => updateSetting('bindingMargin', parseInt(e.target.value) || 0)}
          />
          <p className="text-xs text-slate-500 mt-1">
            装订边距用于在装订时留出足够的空间
          </p>
        </CardContent>
      </Card>

      {/* 内容选项 */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            内容选项
          </h3>
          <CardDescription>选择要包含的内容元素</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Checkbox
            label="包含封面"
            checked={settings.showCover}
            onChange={(e) => updateSetting('showCover', e.target.checked)}
          />
          <Checkbox
            label="显示目录"
            checked={settings.showToc}
            onChange={(e) => updateSetting('showToc', e.target.checked)}
          />
          <Checkbox
            label="显示页码"
            checked={settings.showPageNumber}
            onChange={(e) => updateSetting('showPageNumber', e.target.checked)}
          />
          <Checkbox
            label="显示页眉"
            checked={settings.showHeader}
            onChange={(e) => updateSetting('showHeader', e.target.checked)}
          />
          <Checkbox
            label="显示页脚"
            checked={settings.showFooter}
            onChange={(e) => updateSetting('showFooter', e.target.checked)}
          />

          {settings.showHeader && (
            <div className="pl-6">
              <Input
                placeholder="页眉文本（支持变量: {title}, {date}）"
                value={settings.headerText}
                onChange={(e) => updateSetting('headerText', e.target.value)}
              />
            </div>
          )}

          {settings.showFooter && (
            <div className="pl-6">
              <Input
                placeholder="页脚文本（支持变量: {page}, {total}）"
                value={settings.footerText}
                onChange={(e) => updateSetting('footerText', e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 布局设置 */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            布局与排版
          </h3>
          <CardDescription>调整文本布局和样式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="分栏布局"
            value={settings.layout}
            onChange={(e) => updateSetting('layout', e.target.value as ExtendedPrintSettings['layout'])}
            options={[
              { value: 'single', label: '单栏' },
              { value: 'double', label: '双栏' },
            ]}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="字体"
              value={settings.fontFamily}
              onChange={(e) => updateSetting('fontFamily', e.target.value)}
              options={[
                { value: 'Inter', label: 'Inter (现代感)' },
                { value: 'Georgia', label: 'Georgia (经典)' },
                { value: 'Times New Roman', label: 'Times New Roman (学术)' },
                { value: 'system-ui', label: '系统默认' },
              ]}
            />
            <Select
              label="字号"
              value={settings.fontSize.toString()}
              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
              options={[
                { value: '12', label: '12pt (小)' },
                { value: '14', label: '14pt (中)' },
                { value: '16', label: '16pt (大)' },
                { value: '18', label: '18pt (特大)' },
              ]}
            />
          </div>
          
          <Select
            label="行高"
            value={settings.lineHeight.toString()}
            onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
            options={[
              { value: '1.4', label: '1.4 (紧凑)' },
              { value: '1.6', label: '1.6 (标准)' },
              { value: '1.8', label: '1.8 (宽松)' },
              { value: '2.0', label: '2.0 (双倍)' },
            ]}
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              主题色
            </label>
            <div className="flex gap-2">
              {['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'].map((color) => (
                <button
                  key={color}
                  onClick={() => updateSetting('primaryColor', color)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    settings.primaryColor === color
                      ? 'border-slate-900 scale-110'
                      : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => updateSetting('primaryColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 高级设置 */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            高级设置
          </h3>
          <CardDescription>高级排版控制选项</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Checkbox
            label="启用断字处理"
            checked={settings.enableHyphenation}
            onChange={(e) => updateSetting('enableHyphenation', e.target.checked)}
          />
          <Checkbox
            label="启用孤行控制"
            checked={settings.enableOrphansControl}
            onChange={(e) => updateSetting('enableOrphansControl', e.target.checked)}
          />
          <p className="text-xs text-slate-500 pl-6">
            孤行控制可防止段落的第一行或最后一行单独出现在页面顶部或底部
          </p>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={resetToDefaults}>
          恢复默认设置
        </Button>
      </div>
    </div>
  );
}
