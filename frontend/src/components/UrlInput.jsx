import { useState } from 'react';
import { Globe, Code, Loader2, ArrowRight, List } from 'lucide-react';
import { convertUrl, convertUrls, convertHtml } from '../lib/api';

export default function UrlInput({ onResult, onError }) {
  const [mode, setMode] = useState('url');
  const [url, setUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConvertUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    onError('');

    try {
      const result = await convertUrl(url.trim());
      onResult(result.markdown);
    } catch (err) {
      onError(err.message);
      onResult('');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertBulk = async () => {
    const urls = bulkUrls.split('\n').map(u => u.trim()).filter(Boolean);
    if (urls.length === 0) return;
    setLoading(true);
    onError('');

    try {
      const result = await convertUrls(urls);
      const parts = result.results.map((r) => {
        if (r.error) {
          return `<!-- Error: ${r.url} - ${r.error} -->`;
        }
        return `<!-- Fuente: ${r.url} -->\n\n${r.markdown}`;
      });
      onResult(parts.join('\n\n---\n\n'));
    } catch (err) {
      onError(err.message);
      onResult('');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertHtml = async () => {
    if (!html.trim()) return;
    setLoading(true);
    onError('');

    try {
      const result = await convertHtml(html.trim());
      onResult(result.markdown);
    } catch (err) {
      onError(err.message);
      onResult('');
    } finally {
      setLoading(false);
    }
  };

  const urlCount = bulkUrls.split('\n').filter(u => u.trim()).length;

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('url')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'url'
              ? 'bg-accent/15 text-accent'
              : 'text-neutral-500 hover:bg-surface-light hover:text-neutral-300'
          }`}
        >
          <Globe size={16} />
          URL
        </button>
        <button
          onClick={() => setMode('bulk')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'bulk'
              ? 'bg-accent/15 text-accent'
              : 'text-neutral-500 hover:bg-surface-light hover:text-neutral-300'
          }`}
        >
          <List size={16} />
          URLs en bulk
        </button>
        <button
          onClick={() => setMode('html')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'html'
              ? 'bg-accent/15 text-accent'
              : 'text-neutral-500 hover:bg-surface-light hover:text-neutral-300'
          }`}
        >
          <Code size={16} />
          Pegar HTML
        </button>
      </div>

      {mode === 'url' ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ejemplo.com/pagina"
            className="flex-1 px-4 py-3 bg-dark border border-neutral-700 rounded-lg text-base placeholder-neutral-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
            onKeyDown={(e) => e.key === 'Enter' && handleConvertUrl()}
          />
          <button
            onClick={handleConvertUrl}
            disabled={loading || !url.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-dark rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
            Convertir
          </button>
        </div>
      ) : mode === 'bulk' ? (
        <div className="space-y-3">
          <textarea
            value={bulkUrls}
            onChange={(e) => setBulkUrls(e.target.value)}
            placeholder={"https://ejemplo.com/pagina-1\nhttps://ejemplo.com/pagina-2\nhttps://ejemplo.com/pagina-3"}
            rows={6}
            className="w-full px-4 py-3 bg-dark border border-neutral-700 rounded-lg text-base placeholder-neutral-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 font-mono text-sm resize-y"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">
              {urlCount} {urlCount === 1 ? 'URL' : 'URLs'}
            </span>
            <button
              onClick={handleConvertBulk}
              disabled={loading || urlCount === 0}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-dark rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
              Convertir {urlCount > 0 ? `${urlCount} URLs` : ''}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="Pega aqui el codigo HTML..."
            rows={8}
            className="w-full px-4 py-3 bg-dark border border-neutral-700 rounded-lg text-base placeholder-neutral-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 font-mono text-sm resize-y"
          />
          <button
            onClick={handleConvertHtml}
            disabled={loading || !html.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-dark rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
            Convertir HTML
          </button>
        </div>
      )}
    </div>
  );
}
