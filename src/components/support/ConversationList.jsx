import React from 'react';
import { MessageSquare, Plus, Sparkles } from 'lucide-react';

export default function ConversationList({ conversations, activeId, onSelect, onNew, loading }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <button onClick={onNew}
          className="w-full h-10 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm text-white transition-transform active:scale-[.98]"
          style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}>
          <Plus className="w-4 h-4" /> Nouvelle conversation
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <p className="text-center text-xs text-muted-foreground py-6">Chargement…</p>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 px-3">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">Aucune conversation. Lancez-en une nouvelle 👆</p>
          </div>
        ) : conversations.map((c) => {
          const last = c.messages?.[c.messages?.length - 1];
          const preview = last?.content || c.metadata?.description || '…';
          return (
            <button key={c.id} onClick={() => onSelect(c.id)}
              className={`w-full text-left p-2.5 rounded-xl border transition-colors ${activeId === c.id ? 'bg-primary/10 border-primary/40' : 'bg-card border-border hover:border-primary/30'}`}>
              <p className="text-sm font-medium truncate">{c.metadata?.name || 'Conversation'}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{preview.slice(0, 60)}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}