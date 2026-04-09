import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import JSZip from 'jszip';

// 解析 PDF
export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (error) {
    console.error('PDF parse error:', error);
    return '';
  }
}

// 解析 Word 文档
export async function parseWord(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error) {
    console.error('Word parse error:', error);
    return '';
  }
}

// 解析 PPT/PPTX 文件
export async function parsePPTX(buffer: Buffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const slideTexts: string[] = [];
    
    // 遍历所有幻灯片文件
    const slideFiles = Object.keys(zip.files)
      .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort();
    
    for (const slideFile of slideFiles) {
      const slideContent = await zip.file(slideFile)?.async('string');
      if (slideContent) {
        // 提取文本内容
        const textMatches = slideContent.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
        if (textMatches) {
          const slideText = textMatches
            .map(match => match.replace(/<a:t[^>]*>([^<]*)<\/a:t>/, '$1'))
            .filter(t => t.trim())
            .join(' ');
          
          if (slideText.trim()) {
            slideTexts.push(`[幻灯片 ${slideTexts.length + 1}] ${slideText}`);
          }
        }
      }
    }
    
    // 也尝试从 ppt/notesSlides/ 中提取备注
    const notesFiles = Object.keys(zip.files)
      .filter(name => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(name));
    
    for (const notesFile of notesFiles) {
      const notesContent = await zip.file(notesFile)?.async('string');
      if (notesContent) {
        const textMatches = notesContent.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
        if (textMatches) {
          const notesText = textMatches
            .map(match => match.replace(/<a:t[^>]*>([^<]*)<\/a:t>/, '$1'))
            .filter(t => t.trim())
            .join(' ');
          
          if (notesText.trim()) {
            slideTexts.push(`[备注] ${notesText}`);
          }
        }
      }
    }
    
    return slideTexts.join('\n\n');
  } catch (error) {
    console.error('PPTX parse error:', error);
    return '';
  }
}

// 解析纯文本
export async function parseText(buffer: Buffer): Promise<string> {
  try {
    return buffer.toString('utf-8');
  } catch (error) {
    console.error('Text parse error:', error);
    return '';
  }
}

// 智能解析文件
export async function parseFile(
  buffer: Buffer,
  fileName: string
): Promise<{ text: string; fileType: string }> {
  const name = fileName.toLowerCase();
  
  if (name.endsWith('.pdf')) {
    return { text: await parsePDF(buffer), fileType: 'PDF' };
  }
  
  if (name.endsWith('.docx')) {
    return { text: await parseWord(buffer), fileType: 'Word' };
  }
  
  if (name.endsWith('.doc')) {
    return { text: await parseWord(buffer), fileType: 'Word' };
  }
  
  if (name.endsWith('.pptx') || name.endsWith('.ppt')) {
    return { text: await parsePPTX(buffer), fileType: 'PPT' };
  }
  
  if (name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.markdown')) {
    return { text: await parseText(buffer), fileType: 'Text' };
  }
  
  if (name.endsWith('.zip')) {
    // 尝试解析 zip 中的文本文件
    return { text: await parseZipContent(buffer), fileType: 'ZIP' };
  }
  
  // 默认尝试作为文本解析
  return { text: await parseText(buffer), fileType: 'Unknown' };
}

// 解析 ZIP 文件内容
async function parseZipContent(buffer: Buffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const texts: string[] = [];
    
    for (const [name, file] of Object.entries(zip.files)) {
      if (!file.dir) {
        const ext = name.toLowerCase();
        if (ext.endsWith('.txt') || ext.endsWith('.md') || ext.endsWith('.json')) {
          const content = await file.async('string');
          texts.push(`[${name}]\n${content}`);
        }
      }
    }
    
    return texts.join('\n\n---\n\n');
  } catch (error) {
    console.error('ZIP parse error:', error);
    return '';
  }
}

// 清理文本
export function cleanText(text: string): string {
  return text
    // 移除多余空白
    .replace(/\s+/g, ' ')
    // 移除特殊字符
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // 规范化引号
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // 规范化破折号
    .replace(/[–—]/g, '-')
    .trim();
}

// 文本分块
export function chunkText(text: string, chunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  const clean = cleanText(text);
  
  // 先按段落分割
  const paragraphs = clean.split(/[。！？\n]+/).filter(p => p.trim().length > 10);
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    
    if (currentChunk.length + trimmed.length <= chunkSize) {
      currentChunk += (currentChunk ? '。' : '') + trimmed;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk + '。');
      }
      // 如果单段落超过 chunkSize，再按句子分割
      if (trimmed.length > chunkSize) {
        const sentences = trimmed.split(/[,，、；;]/);
        for (const sentence of sentences) {
          if (sentence.length > chunkSize) {
            // 按字符数硬分割
            for (let i = 0; i < sentence.length; i += chunkSize) {
              chunks.push(sentence.slice(i, i + chunkSize));
            }
          } else {
            currentChunk = sentence;
          }
        }
      } else {
        currentChunk = trimmed;
      }
    }
  }
  
  // 添加最后一块
  if (currentChunk) {
    chunks.push(currentChunk + '。');
  }
  
  return chunks;
}

// 获取文件信息
export function getFileInfo(fileName: string) {
  const name = fileName.toLowerCase();
  
  const types: Record<string, string> = {
    pdf: 'PDF',
    doc: 'Word',
    docx: 'Word',
    ppt: 'PPT',
    pptx: 'PPT',
    txt: '文本',
    md: 'Markdown',
    markdown: 'Markdown',
    zip: '压缩包',
  };
  
  const icons: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    ppt: '📊',
    pptx: '📊',
    txt: '📃',
    md: '📋',
    zip: '📦',
  };
  
  const ext = name.split('.').pop() || '';
  return {
    type: types[ext] || '未知',
    icon: icons[ext] || '📄',
    extension: ext,
  };
}
