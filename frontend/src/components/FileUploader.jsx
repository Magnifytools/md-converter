import { useState, useCallback } from 'react';
import { Upload, FileText, Image, Table, Globe, File, Loader2 } from 'lucide-react';
import { convertFile } from '../lib/api';

const FILE_ICONS = {
  pdf: FileText,
  docx: FileText,
  txt: FileText,
  html: Globe,
  htm: Globe,
  csv: Table,
  png: Image,
  jpg: Image,
  jpeg: Image,
  webp: Image,
};

const ACCEPTED = '.pdf,.docx,.png,.jpg,.jpeg,.webp,.html,.htm,.txt,.csv';

export default function FileUploader({ onResult, onError }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    onError('');

    try {
      const result = await convertFile(file);
      onResult(result.markdown);
    } catch (err) {
      onError(err.message);
      onResult('');
    } finally {
      setLoading(false);
    }
  }, [onResult, onError]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleInput = useCallback((e) => {
    handleFile(e.target.files?.[0]);
  }, [handleFile]);

  const ext = fileName.split('.').pop()?.toLowerCase();
  const IconComp = FILE_ICONS[ext] || File;

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
        dragging
          ? 'border-accent bg-accent/5'
          : 'border-neutral-700 hover:border-accent/50 hover:bg-surface-light'
      }`}
      onClick={() => document.getElementById('file-input').click()}
    >
      <input
        id="file-input"
        type="file"
        accept={ACCEPTED}
        onChange={handleInput}
        className="hidden"
      />

      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-accent" size={40} />
          <p className="text-neutral-300">Convirtiendo <strong className="text-cream">{fileName}</strong>...</p>
        </div>
      ) : fileName ? (
        <div className="flex flex-col items-center gap-3">
          <IconComp className="text-accent" size={40} />
          <p className="text-neutral-300"><strong className="text-cream">{fileName}</strong> convertido</p>
          <p className="text-sm text-neutral-500">Arrastra otro archivo o haz clic para cambiar</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Upload className="text-neutral-500" size={40} />
          <p className="text-neutral-300 font-medium">Arrastra un archivo aqui o haz clic para seleccionar</p>
          <p className="text-sm text-neutral-500">
            PDF, DOCX, PNG, JPG, HTML, TXT, CSV (max. 20MB)
          </p>
        </div>
      )}
    </div>
  );
}
