import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Mic, MicOff, PhoneOff, Phone, Loader2, Radio, AlertTriangle, Users, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import VerificationIcons from '@/components/ui/VerificationIcon';

const parseMeta = (p) => {
  try { return JSON.parse(p.metadata || '{}'); } catch { return {}; }
};

export default function SpaceRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const roomRef = useRef(null);
  const [status, setStatus] = useState('connecting'); // connecting | live | ended | error
  const [errorMsg, setErrorMsg] = useState('');
  const [participants, setParticipants] = useState([]);
  const [micOn, setMicOn] = useState(false);
  const [activeSpeakers, setActiveSpeakers] = useState(new Set());
  const [ending, setEnding] = useState(false);

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me(), staleTime: 60000, retry: false });
  const { data: space } = useQuery({
    queryKey: ['space', id],
    queryFn: () => base44.entities.Space.get(id),
    enabled: !!id,
    retry: false,
  });

  const collectParticipants = useCallback((room) => {
    if (!room || !user) return;
    const list = [];
    const local = room.localParticipant;
    list.push({
      identity: local.identity,
      name: user.display_name || user.full_name || user.username || local.identity,
      avatar: user.avatar_url,
      username: user.username,
      verifications: user.verifications || [],
      isLocal: true,
      micOn: local.isMicrophoneEnabled,
    });
    room.remoteParticipants.forEach((p) => {
      const meta = parseMeta(p);
      list.push({
        identity: p.identity,
        name: p.name || p.identity,
        avatar: meta.avatar,
        username: meta.username,
        verifications: meta.verifications || [],
        isLocal: false,
        micOn: p.isMicrophoneEnabled,
      });
    });
    setParticipants(list);
  }, [user]);

  const connect = useCallback(async () => {
    if (!id || !user) return;
    setStatus('connecting');
    setErrorMsg('');
    let room;
    try {
      // Import dynamique pour isoler tout crash du module livekit-client
      const { Room, RoomEvent, ConnectionState } = await import('livekit-client');

      let data;
      try {
        const res = await base44.functions.invoke('generateSpaceToken', { spaceId: id });
        data = res.data;
      } catch (err) {
        data = err?.response?.data || { error: 'Jeton indisponible' };
      }
      if (data?.error) { setStatus('error'); setErrorMsg(data.error); return; }
      const { token, url } = data;

      room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;
      room.on(RoomEvent.ParticipantConnected, () => collectParticipants(room));
      room.on(RoomEvent.ParticipantDisconnected, () => collectParticipants(room));
      room.on(RoomEvent.ActiveSpeakerChanged, (speakers) => {
        setActiveSpeakers(new Set(speakers.map(s => s.identity)));
      });
      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        if (state === ConnectionState.Connected) setStatus('live');
        if (state === ConnectionState.Disconnected) setStatus(prev => prev === 'ending' ? 'ended' : 'ended');
      });

      // Timeout : si LiveKit n'est pas atteint en 15s, on abandonne proprement
      const connectPromise = room.connect(url, token);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Le serveur audio ne répond pas (timeout).')), 15000));
      await Promise.race([connectPromise, timeoutPromise]);

      await room.localParticipant.setMicrophoneEnabled(false);
      collectParticipants(room);
    } catch (e) {
      if (room) { try { room.disconnect(); } catch {} }
      roomRef.current = null;
      setStatus('error');
      setErrorMsg(e?.message || 'Connexion au Space impossible.');
    }
  }, [id, user, collectParticipants]);

  useEffect(() => {
    connect();
    return () => {
      if (roomRef.current) { try { roomRef.current.disconnect(); } catch {} roomRef.current = null; }
    };
  }, [connect]);

  const toggleMic = async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !micOn;
    try {
      await room.localParticipant.setMicrophoneEnabled(next);
      setMicOn(next);
      collectParticipants(room);
      if (next) toast.success('Micro activé');
    } catch {
      toast.error('Micro bloqué — autorisez-le dans les réglages du navigateur');
    }
  };

  const handleLeave = () => {
    if (roomRef.current) { try { roomRef.current.disconnect(); } catch {} roomRef.current = null; }
    navigate(-1);
  };

  const handleEnd = async () => {
    if (!confirm('Terminer le Space pour tous les participants ?')) return;
    setEnding(true);
    setStatus('ending');
    try {
      let data;
      try {
        const res = await base44.functions.invoke('endSpace', { spaceId: id });
        data = res.data;
      } catch (err) {
        data = err?.response?.data || { error: 'Erreur' };
      }
      if (data?.error) { toast.error(data.error); setEnding(false); setStatus('live'); return; }
      toast.success('Space terminé');
      qc.invalidateQueries({ queryKey: ['spaces-live'] });
      qc.invalidateQueries({ queryKey: ['spaces-scheduled'] });
      if (roomRef.current) { try { roomRef.current.disconnect(); } catch {} roomRef.current = null; }
      navigate(-1);
    } catch {
      toast.error('Erreur');
      setEnding(false);
      setStatus('live');
    }
  };

  const isHost = space?.host_id === user?.id;

  if (status === 'error') {
    return (
      <div className="w-full max-w-[680px] mx-auto py-24 text-center px-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <p className="font-grotesk font-bold text-lg mb-2">Impossible de rejoindre</p>
        <p className="font-inter text-sm text-muted-foreground mb-4 max-w-sm mx-auto">{errorMsg || 'Space introuvable ou terminé.'}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={connect} className="flex items-center gap-1.5 text-primary text-sm hover:underline"><RotateCw className="w-3.5 h-3.5" /> Réessayer</button>
          <span className="text-muted-foreground/40">·</span>
          <button onClick={handleLeave} className="text-muted-foreground text-sm hover:underline">Retour</button>
        </div>
      </div>
    );
  }

  if (status === 'ended') {
    return (
      <div className="w-full max-w-[680px] mx-auto py-24 text-center px-4">
        <PhoneOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-grotesk font-bold text-lg mb-2">Space terminé</p>
        <p className="font-inter text-sm text-muted-foreground mb-4">L'hôte a mis fin à la conversation.</p>
        <button onClick={() => navigate('/')} className="text-primary text-sm hover:underline">← Retour à l'accueil</button>
      </div>
    );
  }

  const orateurs = participants.filter(p => p.micOn || p.isLocal || activeSpeakers.has(p.identity));
  const auditeurs = participants.filter(p => !p.micOn && !p.isLocal && !activeSpeakers.has(p.identity));

  return (
    <div className="w-full max-w-[680px] min-w-0 mx-auto pb-28">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/60 px-4 py-2 flex items-center gap-2">
        <button onClick={handleLeave} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/8"><ArrowLeft className="w-4 h-4" /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="text-[10px] font-bold text-red-400">EN DIRECT</span>
          </div>
          <p className="font-grotesk font-bold text-sm truncate">{space?.title || 'Space'}</p>
        </div>
        {status === 'connecting' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      {space?.description && (
        <p className="px-4 py-2 font-inter text-sm text-muted-foreground border-b border-border/40">{space.description}</p>
      )}

      <div className="px-4 py-4">
        {status === 'connecting' ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="font-inter text-sm text-muted-foreground">Connexion au Space en cours…</p>
          </div>
        ) : (
          <>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-3">Orateurs ({orateurs.length})</p>
            <div className="grid grid-cols-4 gap-3">
              {orateurs.map(p => {
                const speaking = activeSpeakers.has(p.identity) && p.micOn;
                return (
                  <div key={p.identity} className="flex flex-col items-center gap-1.5">
                    <div className={`relative w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center ${speaking ? 'ring-4 ring-red-500/60' : ''}`}>
                      {p.avatar ? <img src={p.avatar} className="w-full h-full object-cover" alt="" /> : <span className="font-grotesk font-bold text-primary text-lg">{(p.name || 'U')[0]}</span>}
                      <div className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: p.micOn ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}>
                        {p.micOn ? <Mic className="w-2.5 h-2.5 text-primary-foreground" /> : <MicOff className="w-2.5 h-2.5 text-muted-foreground" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span className="font-inter text-[11px] font-semibold truncate max-w-[64px]">{p.isLocal ? 'Vous' : (p.username || p.name?.split(' ')[0])}</span>
                      {!p.isLocal && p.verifications?.length > 0 && <VerificationIcons verifications={p.verifications} size="sm" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {auditeurs.length > 0 && (
              <>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 mt-5 mb-3 flex items-center gap-1"><Users className="w-3 h-3" /> Auditeurs ({auditeurs.length})</p>
                <div className="grid grid-cols-6 gap-2">
                  {auditeurs.map(p => (
                    <div key={p.identity} className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                      {p.avatar ? <img src={p.avatar} className="w-full h-full object-cover" alt="" /> : <span className="font-grotesk font-bold text-primary text-xs">{(p.name || 'U')[0]}</span>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {participants.length <= 1 && (
              <p className="mt-6 text-center font-inter text-sm text-muted-foreground/70">Vous êtes seul·e pour l'instant. Activez votre micro pour parler, les autres vous rejoindront bientôt.</p>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur border-t border-border">
        <div className="max-w-[680px] mx-auto px-4 py-3 flex items-center justify-center gap-3" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
          <button onClick={toggleMic} disabled={status !== 'live'}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 ${micOn ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          {isHost ? (
            <button onClick={handleEnd} disabled={ending}
              className="px-5 h-12 rounded-full flex items-center gap-1.5 bg-destructive text-destructive-foreground text-sm font-semibold disabled:opacity-50">
              {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneOff className="w-4 h-4" />} Terminer
            </button>
          ) : (
            <button onClick={handleLeave}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-destructive text-destructive-foreground">
              <Phone className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}