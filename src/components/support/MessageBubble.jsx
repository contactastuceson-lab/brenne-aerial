import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Wrench, ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_META = {
  pending: { icon: Loader2, cls: 'text-muted-foreground', spin: true },
  running: { icon: Loader2, cls: 'text-primary', spin: true },
  in_progress: { icon: Loader2, cls: 'text-primary', spin: true },
  completed: { icon: CheckCircle2, cls: 'text-green-400' },
  success: { icon: CheckCircle2, cls: 'text-green-400' },
  failed: { icon: XCircle, cls: 'text-red-400' },
  error: { icon: XCircle, cls: 'text-red-400' },
};

function FunctionDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const rawStatus = toolCall?.status || 'pending';
  const status = STATUS_META[rawStatus] || STATUS_META.pending;
  const SIcon = status.icon;
  let failed = ['failed', 'error'].includes(rawStatus);
  let parsedResults = toolCall?.results;
  if (typeof parsedResults === 'string') {
    try { parsedResults = JSON.parse(parsedResults); } catch {}
  }
  if (parsedResults && typeof parsedResults === 'object' && parsedResults.success === false) failed = true;
  if (typeof toolCall?.results === 'string' && /error|failed/i.test(toolCall.results)) failed = true;

  const proj = toolCall?.display_projection || {};
  const hideDetails = proj.hide_details && proj.details_redacted;
  const label = failed ? (proj.error_label || 'Échec') : (proj.label || toolCall?.name || 'Action');

  let args = toolCall?.arguments_string;
  if (typeof args === 'string') { try { args = JSON.parse(args); } catch {} }

  return (
    <div className="mt-2 text-xs rounded-lg bg-secondary/60 border border-border overflow-hidden">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-secondary transition-colors">
        {hideDetails ? <span className="text-muted-foreground">{status.spin ? '…' : '•'}</span> :
          expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
        <Wrench className={`w-3 h-3 ${failed ? 'text-red-400' : 'text-primary'}`} />
        <span className="font-medium truncate flex-1 text-left">{label}</span>
        <span className={`flex items-center gap-1 ${failed ? 'text-red-400' : status.cls}`}>
          <SIcon className={`w-3 h-3 ${status.spin ? 'animate-spin' : ''}`} />
          {failed ? 'échec' : status.spin ? '…' : 'ok'}
        </span>
      </button>
      {!hideDetails && expanded && (
        <div className="px-2.5 pb-2 space-y-1.5">
          {args && (
            <div>
              <p className="text-muted-foreground text-[10px] uppercase mb-0.5">Paramètres</p>
              <pre className="text-[10px] text-foreground/80 whitespace-pre-wrap break-all">{JSON.stringify(args, null, 2)}</pre>
            </div>
          )}
          {parsedResults != null && (
            <div>
              <p className="text-muted-foreground text-[10px] uppercase mb-0.5">Résultat</p>
              <pre className="text-[10px] text-foreground/80 whitespace-pre-wrap break-all">{typeof parsedResults === 'string' ? parsedResults : JSON.stringify(parsedResults, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
          style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}>
          <span className="text-white text-xs font-bold">N</span>
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
        isUser ? 'text-primary-foreground rounded-tr-sm' : 'bg-secondary border border-border rounded-tl-sm'
      }`}
        style={isUser ? { background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' } : {}}>
        {message.content && (
          isUser
            ? <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
            : <ReactMarkdown components={{
                p: ({ children }) => <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-1">{children}</ol>,
                li: ({ children }) => <li className="mb-0.5">{children}</li>,
                a: ({ href, children }) => <a href={href} className="text-primary underline" target="_blank" rel="noreferrer">{children}</a>,
              }}>{message.content}</ReactMarkdown>
        )}
        {message.tool_calls?.map((tc, i) => <FunctionDisplay key={i} toolCall={tc} />)}
      </div>
    </div>
  );
}