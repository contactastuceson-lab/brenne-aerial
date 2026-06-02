import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function OfficialMessageEditor({ content, onChange, disabled }) {
  const [showPreview, setShowPreview] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const refineWithAI = async () => {
    if (!content.trim()) return;
    setIsAILoading(true);
    try {
      const result = await base44.functions.invoke('refineMessageWithAI', { message: content });
      onChange(result.data?.refined_message || result.data);
      toast.success('Message reformulé avec Markdown ✨');
    } catch (err) {
      toast.error('Erreur lors de la reformulation');
    } finally {
      setIsAILoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertMarkdown = (before, after = '') => {
    const textarea = document.getElementById('message-editor');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;
    const selected = text.substring(start, end);
    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selected.length;
    }, 0);
  };

  return (
    <div className="space-y-3 rounded-xl bg-card border border-border p-4 lg:p-5">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 pb-3 border-b border-border/50">
        <button
          onClick={() => insertMarkdown('**', '**')}
          className="px-2.5 py-1.5 text-xs font-bold bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          title="Gras"
        >
          B
        </button>
        <button
          onClick={() => insertMarkdown('*', '*')}
          className="px-2.5 py-1.5 text-xs italic bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          title="Italique"
        >
          I
        </button>
        <button
          onClick={() => insertMarkdown('`', '`')}
          className="px-2.5 py-1.5 text-xs font-mono bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          title="Code"
        >
          {'<>'}
        </button>
        <button
          onClick={() => insertMarkdown('```\n', '\n```')}
          className="px-2.5 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          title="Bloc de code"
        >
          CODE
        </button>
        <button
          onClick={() => insertMarkdown('> ', '')}
          className="px-2.5 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          title="Citation"
        >
          "
        </button>
        <button
          onClick={() => insertMarkdown('- ', '')}
          className="px-2.5 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          title="Liste"
        >
          •
        </button>
        <button
          onClick={() => insertMarkdown('[', '](url)')}
          className="px-2.5 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          title="Lien"
        >
          🔗
        </button>
        <div className="flex-1" />
        <Button
          onClick={() => setShowPreview(!showPreview)}
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
        >
          {showPreview ? '✎ Éditer' : '👁 Aperçu'}
        </Button>
      </div>

      {/* Editor / Preview */}
      <div className="relative">
        {!showPreview ? (
          <textarea
            id="message-editor"
            value={content}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            placeholder="Composez votre message officiel... (Markdown supporté)"
            className="w-full h-48 p-3 rounded-lg bg-muted/30 border border-border/50 font-mono text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        ) : (
          <div className="w-full h-48 p-3 rounded-lg bg-muted/30 border border-border/50 text-xs lg:text-sm overflow-y-auto prose prose-sm prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code: ({ inline, children }) => 
                  inline ? (
                    <code className="bg-primary/20 px-1.5 py-0.5 rounded text-[11px] text-primary">{children}</code>
                  ) : (
                    <pre className="bg-background/50 border border-border p-2 rounded my-2"><code>{children}</code></pre>
                  ),
                strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-3 border-primary/40 pl-3 italic text-muted-foreground my-2">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1">{children}</ol>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* AI & Actions */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          onClick={refineWithAI}
          disabled={!content.trim() || isAILoading || disabled}
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
        >
          {isAILoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          Reformuler avec Markdown
        </Button>
        <Button
          onClick={copyToClipboard}
          disabled={!content.trim()}
          variant="ghost"
          size="sm"
          className="h-8 text-xs gap-1.5"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          Copier
        </Button>
      </div>
    </div>
  );
}