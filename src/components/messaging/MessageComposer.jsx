import React, { useState } from 'react';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function MessageComposer({ text, onChange, onSend, isSending, placeholder }) {
  const [isRefining, setIsRefining] = useState(false);

  const refineMessage = async () => {
    if (!text.trim()) return;
    setIsRefining(true);
    try {
      const response = await base44.functions.invoke('refineMessageWithAI', { message: text.trim() });
      const refinedMessage = response.data?.refined_message;
      if (!refinedMessage) throw new Error('Réponse indisponible');
      onChange(refinedMessage);
      toast.success('Message amélioré');
    } catch {
      toast.error('Impossible d’améliorer le message');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input value={text} onChange={event => onChange(event.target.value)} onKeyDown={event => event.key === 'Enter' && onSend()} placeholder={placeholder} className="flex-1 bg-secondary border-border font-inter text-sm" />
      <Button type="button" variant="outline" onClick={refineMessage} disabled={!text.trim() || isRefining} className="flex-shrink-0 gap-1.5 border-primary/30 text-primary hover:bg-primary/10" title="Améliorer avec l’IA">
        {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        <span className="hidden sm:inline">Améliorer</span>
      </Button>
      <Button type="button" onClick={onSend} disabled={!text.trim() || isSending} className="bg-primary text-primary-foreground flex-shrink-0 px-4" title="Envoyer le message">
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}