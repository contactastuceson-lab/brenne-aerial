import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

function getConversationId(emailA, emailB) {
  return [emailA, emailB].sort().join('_');
}

export default function MessageRequestsPanel({ user, onSelectConv }) {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['message-requests', user.email],
    queryFn: () => base44.entities.ChatMessage.filter({
      recipient_email: user.email,
      is_request: true,
      request_status: 'pending',
    }, '-created_date'),
    enabled: !!user.email,
    refetchInterval: 5000,
  });

  const accept = useMutation({
    mutationFn: async (req) => {
      await base44.entities.ChatMessage.update(req.id, { request_status: 'accepted' });
    },
    onSuccess: (_, req) => {
      queryClient.invalidateQueries({ queryKey: ['message-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-chat-messages'] });
      queryClient.invalidateQueries({ queryKey: ['thread'] });
      toast.success('Demande acceptée !');
    },
  });

  const decline = useMutation({
    mutationFn: async (req) => {
      await base44.entities.ChatMessage.update(req.id, { request_status: 'declined' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-chat-messages'] });
      toast('Demande refusée');
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
        <Clock className="w-8 h-8 text-muted-foreground/40 mb-3" />
        <p className="font-inter text-xs text-muted-foreground">Aucune demande en attente</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
      {requests.map((req, i) => (
        <motion.div
          key={req.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card border border-primary/20 rounded-xl p-3"
        >
          <div className="flex items-start gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="font-grotesk font-bold text-sm text-primary">
                {req.sender_name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter font-medium text-sm">{req.sender_name}</p>
              <p className="font-mono text-[9px] text-muted-foreground">
                {req.created_date ? format(new Date(req.created_date), 'd MMM · HH:mm', { locale: fr }) : ''}
              </p>
            </div>
          </div>

          <p className="font-inter text-xs text-muted-foreground bg-secondary/60 rounded-lg px-3 py-2 mb-3 line-clamp-2">
            "{req.content}"
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-primary text-primary-foreground text-xs gap-1.5 h-7"
              onClick={() => {
                accept.mutate(req);
                onSelectConv({
                  email: req.sender_email,
                  name: req.sender_name,
                  convId: req.conversation_id,
                });
              }}
              disabled={accept.isPending}
            >
              <Check className="w-3 h-3" /> Accepter
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 text-xs gap-1.5 h-7"
              onClick={() => decline.mutate(req)}
              disabled={decline.isPending}
            >
              <X className="w-3 h-3" /> Refuser
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}