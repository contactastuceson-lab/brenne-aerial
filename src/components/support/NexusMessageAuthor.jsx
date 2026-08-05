import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

export default function NexusMessageAuthor() {
  return (
    <div className="flex items-center gap-0.5 mb-1 px-1 flex-wrap">
      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #F37322, #1DA890)' }}>
        <Bot className="w-2.5 h-2.5 text-white" />
      </div>
      <span className="text-xs font-semibold text-foreground/90">Nexus IA</span>
      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 flex-shrink-0">
        <Sparkles className="w-2 h-2" /> IA
      </span>
    </div>
  );
}