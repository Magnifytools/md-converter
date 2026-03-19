import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Download, Check, Eye, Code, ChevronDown, ChevronRight, X, Package, AlertCircle } from 'lucide-react';

function ResultCard({ result, onUpdate, onRemove, defaultExpanded }) {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState('raw');
  const [filename, setFilename] = useState(result.filename || 'converted');
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'converted'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (result.error) {
    return (
      <div className="border border-red-500/30 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-surface">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle size={16} />
            <span className="text-sm font-medium">{result.filename}</span>
          </div>
          <button onClick={() => onRemove(result.id)} className="text-neutral-500 hover:text-neutral-300 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="px-4 py-3 text-sm text-red-400">{result.error}</div>
      </div>
    );
  }

  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-neutral-800">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-neutral-300 hover:text-cream transition-colors"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <div className="flex items-center gap-1 text-sm">
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent text-cream focus:outline-none w-40"
              placeholder="nombre"
            />
            <span className="text-neutral-500">.md</span>
          </div>
          {result.source && (
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 bg-surface-light px-2 py-0.5 rounded">
              {result.source}
            </span>
          )}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-400 hover:text-accent rounded transition-colors"
          >
            {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-400 hover:text-accent rounded transition-colors"
          >
            <Download size={14} />
            Descargar
          </button>
          <button
            onClick={() => onRemove(result.id)}
            className="px-2 py-1 text-neutral-500 hover:text-red-400 rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <>
          {/* View toggle */}
          <div className="flex gap-1 px-4 py-2 border-b border-neutral-800">
            <button
              onClick={() => setView('raw')}
              className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                view === 'raw' ? 'bg-surface-light text-accent' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Code size={14} />
              Raw
            </button>
            <button
              onClick={() => setView('preview')}
              className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                view === 'preview' ? 'bg-surface-light text-accent' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Eye size={14} />
              Preview
            </button>
            <button
              onClick={() => setView('split')}
              className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                view === 'split' ? 'bg-surface-light text-accent' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Split
            </button>
          </div>

          {/* Content */}
          <div className={`${view === 'split' ? 'grid grid-cols-2 divide-x divide-neutral-800' : ''}`} style={{ minHeight: '300px', maxHeight: '500px' }}>
            {(view === 'raw' || view === 'split') && (
              <textarea
                value={result.markdown}
                onChange={(e) => onUpdate(result.id, e.target.value)}
                className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-dark text-neutral-200"
                style={{ minHeight: '300px', maxHeight: '500px' }}
              />
            )}
            {(view === 'preview' || view === 'split') && (
              <div className="p-4 prose prose-sm max-w-none overflow-auto prose-dark" style={{ minHeight: '300px', maxHeight: '500px' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result.markdown}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function MarkdownPreview({ results, onUpdateResult, onRemoveResult }) {
  const validResults = results.filter(r => r.markdown || r.error);

  const handleDownloadAll = useCallback(async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const usedNames = new Set();

    for (const r of results) {
      if (!r.markdown) continue;
      let name = `${r.filename || 'converted'}.md`;
      let i = 2;
      while (usedNames.has(name)) {
        name = `${r.filename || 'converted'}-${i}.md`;
        i++;
      }
      usedNames.add(name);
      zip.file(name, r.markdown);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-files.zip';
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  if (validResults.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header bar — only when 2+ results */}
      {validResults.length > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-400">
            {validResults.length} resultados
          </span>
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-dark rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <Package size={16} />
            Descargar todo (.zip)
          </button>
        </div>
      )}

      {/* Result cards */}
      {validResults.map((result, i) => (
        <ResultCard
          key={result.id}
          result={result}
          onUpdate={onUpdateResult}
          onRemove={onRemoveResult}
          defaultExpanded={validResults.length === 1 || i === 0}
        />
      ))}
    </div>
  );
}
