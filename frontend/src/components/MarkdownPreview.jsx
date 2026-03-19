import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Download, Check, Eye, Code } from 'lucide-react';

export default function MarkdownPreview({ markdown, onChange }) {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState('split');
  const [filename, setFilename] = useState('converted');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'converted'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-neutral-800">
        <div className="flex gap-1">
          <button
            onClick={() => setView('raw')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              view === 'raw' ? 'bg-surface-light text-accent' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Code size={14} />
            Raw
          </button>
          <button
            onClick={() => setView('preview')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              view === 'preview' ? 'bg-surface-light text-accent' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            onClick={() => setView('split')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              view === 'split' ? 'bg-surface-light text-accent' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Split
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 border border-neutral-700 rounded text-sm">
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-32 focus:outline-none bg-transparent text-cream"
              placeholder="nombre"
            />
            <span className="text-neutral-500">.md</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-400 hover:text-accent rounded transition-colors"
          >
            {copied ? <Check size={16} className="text-accent" /> : <Copy size={16} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-400 hover:text-accent rounded transition-colors"
          >
            <Download size={16} />
            Descargar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`${view === 'split' ? 'grid grid-cols-2 divide-x divide-neutral-800' : ''}`} style={{ minHeight: '400px' }}>
        {(view === 'raw' || view === 'split') && (
          <textarea
            value={markdown}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-dark text-neutral-200"
            style={{ minHeight: '400px' }}
          />
        )}
        {(view === 'preview' || view === 'split') && (
          <div className="p-4 prose prose-sm max-w-none overflow-auto prose-dark" style={{ minHeight: '400px' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
