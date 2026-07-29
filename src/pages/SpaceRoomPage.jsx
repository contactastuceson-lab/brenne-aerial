import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Room, RoomEvent, ConnectionState, Track } from 'livekit-client';
import {
  ArrowLeft, Mic, MicOff, PhoneOff, Phone, Loader2, Radio, AlertTriangle, Users,
  RotateCw, Hand, Headphones, Smile, Crown, Shield, UserPlus, UserMinus, X, Check, MoreVertical, Video,
} from 'lucide-react';
import { toast } from 'sonner';
import VerificationIcons from '@/components/ui/VerificationIcon';

const parseMeta = (p) => {
  try { return JSON.parse(p?.metadata || '{}'); } catch { return {}; }
};
const ROLE_LABEL = { host: 'Hôte', cohost: 'Co-hôte', speaker: 'Orateur', listener: 'Auditeur' };
const REACTIONS = ['👏', '❤️', '🔥', '😂', '👍', '🎉'];

function Avatar({ p, size = 'md', speaking }) {
  const dim = size === 'sm' ? 'w-10 h-10' : 'w-16 h-16';
  const ring = speaking ? 'ring-4 ring-red-500/60' : '';
  return (
    <div className={`relative ${dim} rounded-full overflow-hidden bg-primary/10 flex items-center justify-center ${ring}`}>
      {p.avatar ? <img src={p.avatar} className="w-full h-full object-cover" alt="" /> : (
        <span className={`font-grotesk font-bold text-primary ${size === 'sm' ? 'text-xs' : 'text-lg'}`}>
          {(p.name || 'U')[0]}
        </span>
      )}
    </div>
  );
}

function RoleBadge({ role }) {
  if (role === 'host') return <Crown className="w-3 h-3 text-amber-400" />;
  if (role === 'cohost') return <Shield className="w-3 h-3 text-primary" />;
  return null;
}

export default function SpaceRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const roomRef = useRef(null);
  const intendedRef = useRef(false);
  const audioContainerRef = useRef(null);
  const audioElsRef = useRef([]);
  const deafenedRef = useRef(false);
  const isHostRef = useRef(false);
  const reactionIdRef = useRef(0);
  const remoteCameraTrackRef = useRef(null);
  const localCameraTrackRef = useRef(null);
  const remoteCameraVideoEl = useRef(null);
  const localCameraVideoEl = useRef(null);

  const [status, setStatus] = useState('connecting');
  const [stage, setStage] = useState('init');
  const [errorMsg, setErrorMsg] = useState('');
  const [participants, setParticipants] = useState([]);
  const [micOn, setMicOn] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [activeSpeakers, setActiveSpeakers] = useState(new Set());
  const [raisedHands, setRaisedHands] = useState(new Set());
  const [reactions, setReactions] = useState([]);
  const [showReactions, setShowReactions] = useState(false);
  const [menuFor, setMenuFor] = useState(null);
  const [ending, setEnding] = useState(false);
  const [cameraSharer, setCameraSharer] = useState(null);
  const [cameraBusy, setCameraBusy] = useState(false);

  const { user } = useAuth();
  const { data: space } = useQuery({
    queryKey: ['space', id],
    queryFn: () => base44.entities.Space.get(id),
    enabled: !!id,
    retry: false,
  });
  const isHost = space?.host_id === user?.id;

  useEffect(() => {
    isHostRef.current = isHost;
    if (roomRef.current) collectParticipants(roomRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost]);

  const collectParticipants = useCallback((room) => {
    if (!room || !user) return;
    const list = [];
    const local = room.localParticipant;
    const localMeta = parseMeta(local);
    list.push({
      identity: local.identity,
      name: user.display_name || user.full_name || user.username || local.identity,
      avatar: user.avatar_url,
      username: user.username,
      verifications: user.verifications || [],
      isLocal: true,
      micOn: local.isMicrophoneEnabled,
      role: isHostRef.current ? 'host' : (localMeta.role || 'listener'),
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
        role: meta.role || 'listener',
      });
    });
    setParticipants(list);
  }, [user]);

  const addReaction = useCallback((emoji, identity) => {
    const rid = ++reactionIdRef.current;
    setReactions(prev => [...prev.slice(-12), { id: rid, emoji, identity }]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== rid)), 3000);
  }, []);

  const sendData = useCallback((obj) => {
    const room = roomRef.current;
    if (!room) return;
    try {
      room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(obj)),
        { reliable: true, topic: 'space' },
      );
    } catch {}
  }, []);

  const connect = useCallback(async () => {
    if (!id || !user) return;
    setStatus('connecting'); setErrorMsg(''); setStage('init');
    let currentStage = 'init'; let room;
    try {
      currentStage = 'token'; setStage('token');
      let data;
      try {
        const res = await base44.functions.invoke('generateSpaceToken', { spaceId: id });
        data = res.data || res;
      } catch (err) { data = err?.response?.data || { error: 'Jeton indisponible' }; }
      if (data?.error) { setStatus('error'); setErrorMsg(data.error); return; }
      const { token, url } = data;

      room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;
      room.on(RoomEvent.ParticipantConnected, () => collectParticipants(room));
      room.on(RoomEvent.ParticipantDisconnected, (p) => {
        setRaisedHands(prev => { const n = new Set(prev); n.delete(p.identity); return n; });
        collectParticipants(room);
      });
      room.on(RoomEvent.ParticipantMetadataChanged, () => collectParticipants(room));
      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Audio) {
          try {
            const el = track.attach();
            el.muted = deafenedRef.current;
            if (audioContainerRef.current) audioContainerRef.current.appendChild(el);
            audioElsRef.current.push(el);
          } catch {}
        } else if (track.source === Track.Source.Camera && track.kind === Track.Kind.Video) {
          remoteCameraTrackRef.current = track;
          const meta = parseMeta(participant);
          setCameraSharer({ identity: participant.identity, name: participant.name || meta.username || participant.identity, isLocal: false });
        }
        collectParticipants(room);
      });
      room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        if (track.source === Track.Source.Camera) {
          try { track.detach(); } catch {}
          remoteCameraTrackRef.current = null;
          setCameraSharer(prev => (!prev?.isLocal && prev?.identity === participant.identity) ? null : prev);
        } else {
          try { const els = track.detach(); if (Array.isArray(els)) els.forEach(e => e?.remove?.()); } catch {}
        }
        audioElsRef.current = audioElsRef.current.filter(el => el.isConnected);
        collectParticipants(room);
      });
      room.on(RoomEvent.ActiveSpeakerChanged, (speakers) => setActiveSpeakers(new Set(speakers.map(s => s.identity))));
      room.on(RoomEvent.DataReceived, (payload) => {
        let obj; try { obj = JSON.parse(new TextDecoder().decode(payload)); } catch { return; }
        if (!obj) return;
        if (obj.t === 'reaction') addReaction(obj.emoji, obj.identity);
        else if (obj.t === 'raise') setRaisedHands(prev => new Set([...prev, obj.identity]));
        else if (obj.t === 'lower') setRaisedHands(prev => { const n = new Set(prev); n.delete(obj.identity); return n; });
      });
      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        if (state === ConnectionState.Connected) setStatus('live');
        if (state === ConnectionState.Disconnected && !intendedRef.current) {
          if (roomRef.current) { try { roomRef.current.disconnect(); } catch {} roomRef.current = null; }
          setStatus('error'); setErrorMsg('Connexion audio perdue.');
        }
      });
      room.on(RoomEvent.LocalTrackPublished, (publication, participant) => {
        if (publication.source === Track.Source.Camera && publication.track) {
          localCameraTrackRef.current = publication.track;
          setCameraSharer({ identity: participant.identity, name: 'Vous', isLocal: true });
        }
      });
      room.on(RoomEvent.LocalTrackUnpublished, (publication) => {
        if (publication.source === Track.Source.Camera) {
          try { publication.track?.detach(); } catch {}
          localCameraTrackRef.current = null;
          setCameraSharer(prev => prev?.isLocal ? null : prev);
        }
      });

      currentStage = 'connecting'; setStage('connecting');
      const connectPromise = room.connect(url, token);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Le serveur audio ne répond pas (timeout 20s).')), 20000));
      await Promise.race([connectPromise, timeoutPromise]);

      setStatus('live'); setStage('live');
      await room.localParticipant.setMicrophoneEnabled(false);
      collectParticipants(room);
    } catch (e) {
      if (room) { try { room.disconnect(); } catch {} }
      roomRef.current = null;
      setStatus('error'); setErrorMsg(`${e?.message || 'Connexion au Space impossible.'} (étape: ${currentStage})`);
    }
  }, [id, user, collectParticipants, addReaction]);

  useEffect(() => {
    connect();
    return () => {
      if (roomRef.current) { try { roomRef.current.disconnect(); } catch {} roomRef.current = null; }
      audioElsRef.current = [];
    };
  }, [connect]);

  useEffect(() => {
    if (!cameraSharer) return;
    if (cameraSharer.isLocal && localCameraVideoEl.current && localCameraTrackRef.current) {
      try { localCameraTrackRef.current.attach(localCameraVideoEl.current); } catch {}
    } else if (!cameraSharer.isLocal && remoteCameraVideoEl.current && remoteCameraTrackRef.current) {
      try { remoteCameraTrackRef.current.attach(remoteCameraVideoEl.current); } catch {}
    }
  }, [cameraSharer]);

  const local = participants.find(p => p.isLocal);
  const localRole = local?.role || (isHost ? 'host' : 'listener');
  const canSpeak = localRole === 'host' || localRole === 'cohost' || localRole === 'speaker';
  const hasRaised = raisedHands.has(user?.id);

  const toggleMic = async () => {
    const room = roomRef.current;
    if (!room || !canSpeak) return;
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

  const toggleDeafen = () => {
    const next = !deafened;
    setDeafened(next); deafenedRef.current = next;
    audioElsRef.current.forEach(el => { el.muted = next; });
  };

  const toggleCamera = async () => {
    const room = roomRef.current;
    if (!room || !canSpeak || cameraBusy) return;
    if (!room.localParticipant.permissions?.canPublish) {
      toast.error("Vous n'avez pas la permission de partager dans ce Space.");
      return;
    }
    const want = !cameraSharer?.isLocal;
    setCameraBusy(true);
    try {
      await room.localParticipant.setCameraEnabled(want);
      if (!want) {
        try { localCameraTrackRef.current?.detach(); localCameraTrackRef.current?.stop(); } catch {}
        localCameraTrackRef.current = null;
        setCameraSharer(prev => prev?.isLocal ? null : prev);
      }
    } catch (e) {
      const msg = String(e?.message || e || '').toLowerCase();
      if (msg.includes('notallowed') || msg.includes('denied') || msg.includes('permission')) {
        toast.error("Caméra refusée par le navigateur. Autorisez l'accès à la caméra.");
      } else {
        toast.error("Caméra indisponible sur cet appareil : " + (msg || 'non supporté'));
      }
    } finally {
      setCameraBusy(false);
    }
  };

  const sendReaction = (emoji) => {
    addReaction(emoji, user.id);
    sendData({ t: 'reaction', emoji, identity: user.id });
    setShowReactions(false);
  };

  const raiseHand = () => {
    sendData({ t: 'raise', identity: user.id });
    setRaisedHands(prev => new Set([...prev, user.id]));
    toast.success('Demande de parole envoyée');
  };
  const lowerHand = () => {
    sendData({ t: 'lower', identity: user.id });
    setRaisedHands(prev => { const n = new Set(prev); n.delete(user.id); return n; });
  };

  const invokeAction = async (identity, action, successMsg) => {
    try {
      const res = await base44.functions.invoke('updateSpaceParticipant', { spaceId: id, identity, action });
      const data = res.data || res;
      if (data?.error) { toast.error(data.error); return false; }
      if (successMsg) toast.success(successMsg);
      return true;
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Action impossible');
      return false;
    }
  };

  const approveHand = async (p) => {
    const ok = await invokeAction(p.identity, 'grant', 'Orateur autorisé');
    if (ok) {
      sendData({ t: 'lower', identity: p.identity });
      setRaisedHands(prev => { const n = new Set(prev); n.delete(p.identity); return n; });
    }
    setMenuFor(null);
  };
  const denyHand = (p) => {
    sendData({ t: 'lower', identity: p.identity });
    setRaisedHands(prev => { const n = new Set(prev); n.delete(p.identity); return n; });
    setMenuFor(null);
  };

  const handleLeave = () => {
    intendedRef.current = true;
    if (roomRef.current) { try { roomRef.current.disconnect(); } catch {} roomRef.current = null; }
    navigate(-1);
  };

  const handleEnd = async () => {
    if (!confirm('Terminer le Space pour tous les participants ?')) return;
    intendedRef.current = true; setEnding(true);
    try {
      let data;
      try { const res = await base44.functions.invoke('endSpace', { spaceId: id }); data = res.data; }
      catch (err) { data = err?.response?.data || { error: 'Erreur' }; }
      if (data?.error) { toast.error(data.error); setEnding(false); return; }
      toast.success('Space terminé');
      qc.invalidateQueries({ queryKey: ['spaces-live'] });
      qc.invalidateQueries({ queryKey: ['spaces-scheduled'] });
      if (roomRef.current) { try { roomRef.current.disconnect(); } catch {} roomRef.current = null; }
      navigate(-1);
    } catch { toast.error('Erreur'); setEnding(false); }
  };

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

  const orateurs = participants.filter(p => ['host', 'cohost', 'speaker'].includes(p.role));
  const orateursSorted = [...orateurs].sort((a, b) => {
    const order = { host: 0, cohost: 1, speaker: 2 };
    return (order[a.role] ?? 3) - (order[b.role] ?? 3);
  });
  const listeners = participants.filter(p => p.role === 'listener');
  const pendingHands = listeners.filter(p => raisedHands.has(p.identity));

  const menuActions = menuFor ? (() => {
    const acts = [];
    if (menuFor.role === 'listener' && raisedHands.has(menuFor.identity)) {
      acts.push({ label: 'Autoriser à parler', icon: Check, onClick: () => approveHand(menuFor), tone: 'primary' });
      acts.push({ label: 'Refuser', icon: X, onClick: () => denyHand(menuFor), tone: 'muted' });
    } else if (menuFor.role === 'listener') {
      acts.push({ label: 'Inviter à parler', icon: UserPlus, onClick: async () => { await invokeAction(menuFor.identity, 'grant', 'Invité à parler'); setMenuFor(null); }, tone: 'primary' });
    } else if (menuFor.role === 'speaker') {
      acts.push({ label: 'Révoquer le micro', icon: MicOff, onClick: async () => { await invokeAction(menuFor.identity, 'revoke', 'Micro révoqué'); setMenuFor(null); }, tone: 'muted' });
      acts.push({ label: 'Promouvoir co-hôte', icon: Shield, onClick: async () => { await invokeAction(menuFor.identity, 'promote', 'Co-hôte nommé'); setMenuFor(null); }, tone: 'primary' });
    } else if (menuFor.role === 'cohost') {
      acts.push({ label: 'Rétrograder auditeur', icon: UserMinus, onClick: async () => { await invokeAction(menuFor.identity, 'demote', 'Rétrogradé'); setMenuFor(null); }, tone: 'muted' });
    }
    if (menuFor.role !== 'host') {
      acts.push({ label: 'Expulser du Space', icon: PhoneOff, onClick: async () => { await invokeAction(menuFor.identity, 'kick', 'Participant expulsé'); setMenuFor(null); }, tone: 'destructive' });
    }
    return acts;
  })() : [];

  return (
    <div className="w-full max-w-[680px] min-w-0 mx-auto pb-28">
      <div ref={audioContainerRef} className="hidden" aria-hidden="true" />

      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/60 px-4 py-2 flex items-center gap-2">
        <button onClick={handleLeave} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/8"><ArrowLeft className="w-4 h-4" /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="text-[10px] font-bold text-red-400">EN DIRECT</span>
            <span className="text-[10px] text-muted-foreground/60">· {participants.length}</span>
          </div>
          <p className="font-grotesk font-bold text-sm truncate">{space?.title || 'Space'}</p>
        </div>
        {status === 'connecting' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      {space?.description && (
        <p className="px-4 py-2 font-inter text-sm text-muted-foreground border-b border-border/40">{space.description}</p>
      )}

      {cameraSharer && (
        <div className="px-4 py-3 border-b border-border/40">
          <div className="relative rounded-2xl overflow-hidden bg-black border border-border">
            <video
              ref={cameraSharer.isLocal ? localCameraVideoEl : remoteCameraVideoEl}
              className="w-full aspect-video bg-black object-contain"
              autoPlay playsInline
              muted={cameraSharer.isLocal}
            />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur text-[10px] font-semibold text-white">
              <Video className="w-3 h-3" /> {cameraSharer.isLocal ? 'Votre caméra' : `Caméra de ${cameraSharer.name}`}
            </div>
            {cameraSharer.isLocal && (
              <button onClick={toggleCamera} disabled={cameraBusy}
                className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold disabled:opacity-50">
                Arrêter
              </button>
            )}
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed left-0 right-0 bottom-28 z-30 flex justify-center">
        <div className="relative h-0">
          <AnimatePresence>
            {reactions.map(r => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -90, scale: 1.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.6, ease: 'easeOut' }}
                className="absolute bottom-0 text-3xl select-none"
                style={{ left: `${(r.id * 37) % 200 - 100}px` }}
              >
                {r.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-4 py-4">
        {status === 'connecting' ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="font-inter text-sm text-muted-foreground">
              {stage === 'token' && 'Génération du jeton…'}
              {stage === 'connecting' && 'Connexion au serveur audio…'}
              {(stage === 'init' || stage === 'live' || !stage) && 'Connexion au Space en cours…'}
            </p>
            <button onClick={handleLeave} className="mt-2 text-xs text-muted-foreground/60 hover:text-foreground">Annuler</button>
          </div>
        ) : (
          <>
            {isHost && pendingHands.length > 0 && (
              <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1"><Hand className="w-3 h-3" /> Demande de parole ({pendingHands.length})</p>
                <div className="space-y-2">
                  {pendingHands.map(p => (
                    <div key={p.identity} className="flex items-center gap-2">
                      <Avatar p={p} size="sm" />
                      <div className="flex-1 min-w-0 flex items-center gap-1">
                        <span className="font-inter text-xs font-semibold truncate">{p.isLocal ? 'Vous' : (p.name?.split(' ')[0] || p.username)}</span>
                        {!p.isLocal && p.verifications?.length > 0 && <VerificationIcons verifications={p.verifications} size="sm" markSize="0.8em" />}
                      </div>
                      <button onClick={() => approveHand(p)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => denyHand(p)} className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-3">Orateurs ({orateursSorted.length})</p>
            <div className="grid grid-cols-4 gap-3">
              {orateursSorted.map(p => {
                const speaking = activeSpeakers.has(p.identity) && p.micOn;
                return (
                  <div key={p.identity} className="flex flex-col items-center gap-1.5">
                    <div className="relative">
                      <Avatar p={p} speaking={speaking} />
                      <div className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: p.micOn ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}>
                        {p.micOn ? <Mic className="w-2.5 h-2.5 text-primary-foreground" /> : <MicOff className="w-2.5 h-2.5 text-muted-foreground" />}
                      </div>
                      {cameraSharer?.identity === p.identity && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary flex items-center justify-center border-2 border-card">
                          <Video className="w-2.5 h-2.5 text-primary-foreground" />
                        </span>
                      )}
                      {isHost && !p.isLocal && (
                        <button onClick={() => setMenuFor(p)} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center hover:bg-white/10">
                          <MoreVertical className="w-2.5 h-2.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 min-w-0">
                      <RoleBadge role={p.role} />
                      <span className="font-inter text-[11px] font-semibold truncate flex-1 min-w-0">{p.isLocal ? 'Vous' : (p.name?.split(' ')[0] || p.username)}</span>
                      {!p.isLocal && p.verifications?.length > 0 && <span className="flex-shrink-0"><VerificationIcons verifications={p.verifications} size="sm" markSize="0.8em" /></span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {listeners.length > 0 && (
              <>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 mt-5 mb-3 flex items-center gap-1"><Users className="w-3 h-3" /> Auditeurs ({listeners.length})</p>
                <div className="grid grid-cols-6 gap-2">
                  {listeners.map(p => {
                    const raised = raisedHands.has(p.identity);
                    return (
                      <button
                        key={p.identity}
                        onClick={isHost ? () => setMenuFor(p) : undefined}
                        className="relative"
                      >
                        <Avatar p={p} size="sm" />
                        {raised && (
                          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                            <Hand className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {participants.length <= 1 && (
              <p className="mt-6 text-center font-inter text-sm text-muted-foreground/70">
                {canSpeak ? "Vous êtes seul·e pour l'instant. Activez votre micro pour parler." : "Vous écoutez. Levez la main pour demander à parler."}
              </p>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur border-t border-border">
        <div className="max-w-[680px] mx-auto px-4 py-3 flex items-center justify-center gap-3" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
          {canSpeak ? (
            <button onClick={toggleMic} disabled={status !== 'live'}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 ${micOn ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
          ) : hasRaised ? (
            <button onClick={lowerHand}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-500/20 text-amber-400">
              <Hand className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={raiseHand} disabled={status !== 'live'}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-muted text-muted-foreground disabled:opacity-40 hover:bg-amber-500/20 hover:text-amber-400">
              <Hand className="w-5 h-5" />
            </button>
          )}

          <button onClick={toggleDeafen} disabled={status !== 'live'}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 ${deafened ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`}
            title={deafened ? 'Réactiver le son' : 'Sourdine (ne plus écouter)'}>
            <Headphones className="w-5 h-5" />
          </button>

          {canSpeak && (
            <button onClick={toggleCamera} disabled={status !== 'live' || cameraBusy}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 ${cameraSharer?.isLocal ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              title="Partager la caméra">
              {cameraBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          <div className="relative">
            <button onClick={() => setShowReactions(v => !v)} disabled={status !== 'live'}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-muted text-muted-foreground disabled:opacity-40">
              <Smile className="w-5 h-5" />
            </button>
            {showReactions && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1 p-2 rounded-full bg-card border border-border shadow-xl">
                {REACTIONS.map(emoji => (
                  <button key={emoji} onClick={() => sendReaction(emoji)} className="w-8 h-8 rounded-full hover:bg-white/10 text-lg flex items-center justify-center">{emoji}</button>
                ))}
              </div>
            )}
          </div>

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

      {menuFor && (
        <div className="fixed inset-0 z-40 flex items-end" onClick={() => setMenuFor(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative w-full max-w-[680px] mx-auto bg-card border-t border-border rounded-t-2xl p-4 pb-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <Avatar p={menuFor} />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-grotesk font-bold text-sm truncate">{menuFor.name}</p>
                  {!menuFor.isLocal && menuFor.verifications?.length > 0 && <VerificationIcons verifications={menuFor.verifications} size="sm" markSize="0.85em" />}
                </div>
                <p className="font-inter text-xs text-muted-foreground">@{menuFor.username || menuFor.identity} · {ROLE_LABEL[menuFor.role]}</p>
              </div>
              <button onClick={() => setMenuFor(null)} className="ml-auto w-8 h-8 rounded-full hover:bg-white/8 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid gap-2">
              {menuActions.map((a, i) => (
                <button
                  key={i}
                  onClick={a.onClick}
                  className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium ${
                    a.tone === 'destructive' ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                      : a.tone === 'primary' ? 'bg-primary/10 text-primary hover:bg-primary/20'
                      : 'bg-muted text-foreground hover:bg-muted/70'
                  }`}
                >
                  <a.icon className="w-4 h-4" /> {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}