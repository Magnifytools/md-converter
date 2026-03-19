import { useState, useCallback } from 'react';
import { FileText, Globe, AlertCircle } from 'lucide-react';
import FileUploader from './components/FileUploader';
import UrlInput from './components/UrlInput';
import MarkdownPreview from './components/MarkdownPreview';

export default function App() {
  const [activeTab, setActiveTab] = useState('file');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const addResults = useCallback((newResults) => {
    setResults(newResults);
    setError('');
  }, []);

  const updateResult = useCallback((id, markdown) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, markdown } : r));
  }, []);

  const removeResult = useCallback((id) => {
    setResults(prev => prev.filter(r => r.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-dark p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center pt-4">
          <h1 className="text-2xl md:text-3xl font-bold text-cream tracking-[0.3em] uppercase font-logo">
            MD Converter
          </h1>
          <p className="text-[10px] tracking-[0.25em] uppercase text-neutral-500 mt-1">
            by Magnify
          </p>
          <p className="text-neutral-400 text-sm mt-3">
            Convierte archivos y URLs a Markdown en segundos
          </p>
        </header>

        {/* Tabs */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'file'
                ? 'bg-accent text-dark'
                : 'bg-surface-light text-neutral-400 hover:text-cream'
            }`}
          >
            <FileText size={20} />
            Archivo
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'url'
                ? 'bg-accent text-dark'
                : 'bg-surface-light text-neutral-400 hover:text-cream'
            }`}
          >
            <Globe size={20} />
            URL
          </button>
        </div>

        {/* Input area */}
        <div className="bg-surface rounded-lg p-6">
          {activeTab === 'file' ? (
            <FileUploader onResult={addResults} onError={setError} />
          ) : (
            <UrlInput onResult={addResults} onError={setError} />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-surface border border-red-500/30 rounded-lg text-red-400">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <MarkdownPreview
            results={results}
            onUpdateResult={updateResult}
            onRemoveResult={removeResult}
          />
        )}

        {/* Footer */}
        <footer className="text-center text-sm text-neutral-600 pt-4">
          MD Converter v1.0
        </footer>
      </div>
    </div>
  );
}
