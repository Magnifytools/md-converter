import { useState, useCallback } from 'react';
import { Upload, FileText, Image, Table, Globe, File, Loader2 } from 'lucide-react';
import { convertFiles } from '../lib/api';

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
  const [fileNames, setFileNames] = useState([]);

  const handleFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    setFileNames(fileList.map(f => f.name));
    setLoading(true);
    onError('');

    try {
      const result = await convertFiles(fileList);
      const mapped = result.results.map((r, i) => ({
        id: crypto.randomUUID(),
        filename: r.filename.replace(/\.[^.]+$/, ''),
        markdown: r.markdown,
        source: 'file',
        error: r.error,
      }));
      onResult(mapped);
    } catch (err) {
      onError(err.message);
      onResult([]);
    } finally {
      setLoading(false);
    }
  }, [onResult, onError]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleInput = useCallback((e) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const count = fileNames.length;
  const ext = count === 1 ? fileNames[0].split('.').pop()?.toLowerCase() : null;
  const IconComp = ext ? (FILE_ICONS[ext] || File) : Upload;

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
        multiple
        onChange={handleInput}
        className="hidden"
      />

      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-accent" size={40} />
          <p className="text-neutral-300">
            Convirtiendo <strong className="text-cream">{count} {count === 1 ? 'archivo' : 'archivos'}</strong>...
          </p>
        </div>
      ) : count > 0 ? (
        <div className="flex flex-col items-center gap-3">
          <IconComp className="text-accent" size={40} />
          <p className="text-neutral-300">
            <strong className="text-cream">
              {count === 1 ? fileNames[0] : `${count} archivos`}
            </strong> {count === 1 ? 'convertido' : 'convertidos'}
          </p>
          <p className="text-sm text-neutral-500">Arrastra mas archivos o haz clic para cambiar</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Upload className="text-neutral-500" size={40} />
          <p className="text-neutral-300 font-medium">Arrastra archivos aqui o haz clic para seleccionar</p>
          <p className="text-sm text-neutral-500">
            PDF, DOCX, PNG, JPG, HTML, TXT, CSV — multiples archivos permitidos
          </p>
        </div>
      )}
    </div>
  );
}
