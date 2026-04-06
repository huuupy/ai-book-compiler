'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Upload, 
  FileText, 
  FileImage, 
  Presentation, 
  X, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  preview?: string;
}

interface FileUploaderProps {
  onFilesChange: (files: UploadedFile[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
}

const fileTypeIcons: Record<string, React.ReactNode> = {
  'application/pdf': <FileText className="w-5 h-5 text-red-500" />,
  'application/msword': <FileText className="w-5 h-5 text-blue-500" />,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': <FileText className="w-5 h-5 text-blue-500" />,
  'application/vnd.ms-powerpoint': <Presentation className="w-5 h-5 text-orange-500" />,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': <Presentation className="w-5 h-5 text-orange-500" />,
  'image/jpeg': <FileImage className="w-5 h-5 text-green-500" />,
  'image/png': <FileImage className="w-5 h-5 text-green-500" />,
  'image/gif': <FileImage className="w-5 h-5 text-green-500" />,
  'image/webp': <FileImage className="w-5 h-5 text-green-500" />,
};

const defaultAcceptedTypes = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
].join(',');

export function FileUploader({
  onFilesChange,
  accept = defaultAcceptedTypes,
  maxFiles = 10,
  maxSize = 50,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const processFiles = useCallback((newFiles: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(newFiles);
    
    if (files.length + fileArray.length > maxFiles) {
      setError(`最多只能上传 ${maxFiles} 个文件`);
      return;
    }

    const processedFiles: UploadedFile[] = fileArray.map((file) => {
      // Generate preview for images
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      return {
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        status: 'pending' as const,
        preview,
      };
    });

    const updatedFiles = [...files, ...processedFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [files, maxFiles, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const removeFile = useCallback((id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [files, onFilesChange]);

  const getFileIcon = (file: UploadedFile) => {
    const icon = fileTypeIcons[file.type];
    if (icon) return icon;
    // Default icon based on extension
    if (file.name.endsWith('.pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) return <Presentation className="w-5 h-5 text-orange-500" />;
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
        )}
      >
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className={cn(
            'w-10 h-10 mx-auto mb-3',
            isDragging ? 'text-primary' : 'text-slate-400'
          )} />
          <p className="text-slate-700 font-medium mb-1">
            拖放文件到此处，或 <span className="text-primary">点击选择</span>
          </p>
          <p className="text-sm text-slate-500">
            支持 PDF、Word、PPT、图片等格式，单个文件最大 {maxSize}MB
          </p>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              已上传 {files.length} 个文件
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                    {getFileIcon(file)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {file.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  )}
                  {file.status === 'uploaded' && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supported Formats */}
      <div className="text-xs text-slate-500 flex flex-wrap gap-2">
        <span className="font-medium">支持格式：</span>
        <span className="px-1.5 py-0.5 bg-slate-100 rounded">PDF</span>
        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">Word</span>
        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">PPT</span>
        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">图片</span>
      </div>
    </div>
  );
}
