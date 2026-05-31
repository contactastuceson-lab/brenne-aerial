import React, { useState, useRef } from 'react';
import { Upload, Link, X, Loader2, Image } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

/**
 * ImageUploadOrUrl
 * Props:
 *   value      — current URL string
 *   onChange   — (url: string) => void
 *   label      — optional label above the field
 *   className  — optional wrapper class
 *   previewHeight — e.g. "h-32" (default "h-28")
 */
export default function ImageUploadOrUrl({ value, onChange, label, className, previewHeight = 'h-28' }) {
  const [mode, setMode] = useState('url'); // 'url' | 'upload'
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');
  const fileRef = useRef(null);

  const handleUrlChange = (e) => {
    setUrlInput(e.target.value);
    onChange(e.target.value);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
      setUrlInput(file_url);
      setMode('url');
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
      setUrlInput(file_url);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    onChange('');
    setUrlInput('');
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="font-inter text-xs text-muted-foreground block">{label}</label>}

      {/* Mode toggle */}
      <div className="flex gap-1 bg-secondary/60 p-0.5 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md font-inter text-xs font-medium transition-all cursor-pointer',
            mode === 'url' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Link className="w-3 h-3" /> URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md font-inter text-xs font-medium transition-all cursor-pointer',
            mode === 'upload' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Upload className="w-3 h-3" /> Uploader
        </button>
      </div>

      {/* URL input */}
      {mode === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={handleUrlChange}
            placeholder="https://..."
            className="flex-1 h-9 px-3 rounded-md border border-input bg-secondary text-sm font-inter text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {value && (
            <button type="button" onClick={clearImage} className="h-9 w-9 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Drop zone */}
      {mode === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => !uploading && fileRef.current?.click()}
          className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-secondary/30 hover:bg-primary/5"
        >
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          {uploading ? (
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-muted-foreground" />
          )}
          <p className="font-inter text-xs text-muted-foreground text-center">
            {uploading ? 'Upload en cours...' : 'Glisser-déposer ou cliquer pour choisir'}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/60">PNG, JPG, WEBP</p>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className={cn('relative rounded-xl overflow-hidden border border-border bg-secondary', previewHeight)}>
          <img src={value} alt="Aperçu" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {!value && mode === 'url' && (
        <div className={cn('rounded-xl border border-dashed border-border bg-secondary/30 flex items-center justify-center', previewHeight)}>
          <Image className="w-6 h-6 text-muted-foreground/40" />
        </div>
      )}
    </div>
  );
}