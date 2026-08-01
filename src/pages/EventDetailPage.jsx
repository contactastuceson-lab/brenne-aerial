import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import {
  Calendar, MapPin, Users, Clock, Video, Globe, Building2, ArrowLeft,
  Mic2, Wrench, Users as UsersIcon, Music, Code, Monitor, Image as ImageIcon,
  Trophy, PartyPopper, Tag, Star, Ticket, ExternalLink, Loader2, Share2, Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import EventTicketModal from "@/components/events/EventTicketModal";

const CATEGORIES = {
  conference: { label: "Conférence", icon: Mic2, color: "text-sky-400" },
  workshop: { label: "Atelier", icon: Wrench, color: "text-orange-400" },
  meetup: { label: "Meetup", icon: UsersIcon, color: "text-emerald-400" },
  concert: { label: "Concert", icon: Music, color: "text-fuchsia-400" },
  hackathon: { label: "Hackathon", icon: Code, color: "text-violet-400" },
  webinar: { label: "Webinaire", icon: Monitor, color: "text-cyan-400" },
  expo: { label: "Expo", icon: ImageIcon, color: "text-amber-400" },
  sport: { label: "Sport", icon: Trophy, color: "text-lime-400" },
  party: { label: "Soirée", icon: PartyPopper, color: "text-rose-400" },
  other: { label: "Autre", icon: Tag, color: "text-muted-foreground" },
};

function fmtDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function fmtTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ev, setEv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [ticketReg, setTicketReg] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await base44.entities.Event.get(id);
        if (active) {
          setEv(data);
          setRegistered(!!data.registered_ids?.includes(user?.id));
        }
      } catch {
        if (active) setEv(null);
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [id, user?.id]);

  const handleRegister = async () => {
    if (!user) { toast.error("Connectez-vous pour vous inscrire"); return; }
    if (registered) return;
    setRegistering(true);
    try {
      const res = await base44.functions.invoke("registerForEvent", { event_id: ev.id });
      toast.success(`Inscription confirmée${res?.data?.credits_paid ? ` — ${res.data.credits_paid} crédits débités` : ""} !`);
      setRegistered(true);
      setEv({ ...ev, attendees_count: (ev.attendees_count || 0) + 1, registered_ids: [...(ev.registered_ids || []), user.id] });
      setTicketReg({
        id: res?.data?.registration_id || '',
        event_id: ev.id,
        event_title: ev.title,
        event_start_date: ev.start_date,
        event_city: ev.city,
        event_image_url: ev.image_url,
        credits_paid: res?.data?.credits_paid || 0,
      });
    } catch (e) {
      toast.error(e?.response?.data?.error || "Inscription échouée");
    }
    setRegistering(false);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: ev.title, url });
    else { navigator.clipboard.writeText(url); toast.success("Lien copié"); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!ev) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <p className="font-grotesk text-xl font-bold">Événement introuvable</p>
        <Button variant="outline" onClick={() => navigate("/events")}>
          <ArrowLeft className="w-4 h-4" /> Retour aux événements
        </Button>
      </div>
    );
  }

  const cat = CATEGORIES[ev.category] || CATEGORIES.other;
  const CatIcon = cat.icon;
  const now = Date.now();
  const start = ev.start_date ? new Date(ev.start_date).getTime() : 0;
  const end = ev.end_date ? new Date(ev.end_date).getTime() : start;
  const isLive = start <= now && now <= end && ev.status !== "cancelled";
  const isPast = end < now;
  const isFull = ev.capacity > 0 && (ev.attendees_count || 0) >= ev.capacity;
  const remainingPct = ev.capacity > 0 ? Math.round(((ev.attendees_count || 0) / ev.capacity) * 100) : 0;
  const credits = ev.price_credits || 0;
  const canAfford = credits === 0 || (user?.referral_credits || 0) >= credits;

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        {ev.image_url ? (
          <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary to-accent/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link to="/events" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-sm font-bold hover:bg-white/10">
            <ArrowLeft className="w-4 h-4" /> Événements
          </Link>
          <button onClick={handleShare} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-sm font-bold hover:bg-white/10">
            <Share2 className="w-4 h-4" /> Partager
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10 pb-16 space-y-6">
        {/* Header card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl border border-border p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-xs font-grotesk font-bold px-3 py-1 rounded-full bg-secondary/60 ${cat.color}`}>
              <CatIcon className="w-3.5 h-3.5" /> {cat.label}
            </span>
            {ev.is_featured && (
              <span className="inline-flex items-center gap-1 text-xs font-grotesk font-bold px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
                <Star className="w-3 h-3 fill-current" /> À la une
              </span>
            )}
            {ev.format === "online" && (
              <span className="inline-flex items-center gap-1 text-xs font-grotesk font-bold px-3 py-1 rounded-full bg-secondary/60 text-cyan-400">
                <Video className="w-3.5 h-3.5" /> En ligne
              </span>
            )}
            {ev.format === "hybrid" && (
              <span className="inline-flex items-center gap-1 text-xs font-grotesk font-bold px-3 py-1 rounded-full bg-secondary/60 text-violet-400">
                <Globe className="w-3.5 h-3.5" /> Hybride
              </span>
            )}
            {isLive && (
              <span className="inline-flex items-center gap-1 text-xs font-grotesk font-bold px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> EN DIRECT
              </span>
            )}
            {isPast && (
              <span className="text-xs font-grotesk font-bold px-3 py-1 rounded-full bg-muted/40 text-muted-foreground">
                Terminé
              </span>
            )}
          </div>

          <h1 className="font-grotesk text-2xl sm:text-4xl font-black tracking-tight">{ev.title}</h1>
          {ev.description && <p className="text-muted-foreground text-base sm:text-lg">{ev.description}</p>}

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/50">
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Date</p>
              <p className="text-sm font-grotesk font-bold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" /> {fmtDate(ev.start_date)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Horaire</p>
              <p className="text-sm font-grotesk font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" /> {fmtTime(ev.start_date)}
                {ev.end_date && ` → ${fmtTime(ev.end_date)}`}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Lieu</p>
              <p className="text-sm font-grotesk font-bold flex items-center gap-1.5">
                {ev.format === "physical" ? <Building2 className="w-4 h-4 text-primary" /> : <Video className="w-4 h-4 text-primary" />}
                {ev.city || (ev.format === "online" ? "En ligne" : "—")}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Prix</p>
              <p className="text-sm font-grotesk font-bold flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" /> {credits === 0 ? "Gratuit" : `${credits} crédits`}
              </p>
            </div>
          </div>

          {ev.location && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              <span>{ev.location}{ev.address ? ` — ${ev.address}` : ""}{ev.city ? `, ${ev.city}` : ""}</span>
            </div>
          )}
        </motion.div>

        {/* Description */}
        {ev.long_description && (
          <div className="glass-card rounded-3xl border border-border p-6 sm:p-8 space-y-3">
            <h2 className="font-grotesk font-bold text-lg">À propos de l'événement</h2>
            <div className="prose prose-invert prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {ev.long_description}
            </div>
          </div>
        )}

        {/* Tags */}
        {ev.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ev.tags.map((t) => (
              <span key={t} className="text-xs font-bold px-2.5 py-1 rounded-full bg-secondary/60 text-muted-foreground">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Registration */}
        <div className="glass-card rounded-3xl border border-border p-6 sm:p-8 space-y-4 sticky bottom-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <p className="text-2xl font-grotesk font-black flex items-center gap-1.5">
                <Coins className="w-5 h-5 text-amber-400" />
                {credits === 0 ? "Gratuit" : `${credits} crédits`}
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users className="w-4 h-4" /> {ev.attendees_count || 0} inscrits
                </span>
                {ev.capacity > 0 && (
                  <span className={isFull ? "text-red-400 font-bold" : ""}>
                    {ev.capacity - (ev.attendees_count || 0)} places restantes
                  </span>
                )}
              </div>
              {credits > 0 && user && (
                <p className="text-xs text-muted-foreground pt-1">
                  Votre solde : <span className="font-bold text-amber-400">{user.referral_credits || 0} crédits</span>
                </p>
              )}
              {ev.capacity > 0 && (
                <div className="w-full h-1.5 rounded-full bg-secondary/60 overflow-hidden mt-2">
                  <div className={`h-full ${isFull ? "bg-red-500" : "bg-primary"}`} style={{ width: `${Math.min(remainingPct, 100)}%` }} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {ev.website_url && (
                <a href={ev.website_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-bold hover:bg-secondary/40">
                  <ExternalLink className="w-4 h-4" /> Billetterie
                </a>
              )}
              {!isPast ? (
                <Button onClick={handleRegister} disabled={registering || registered || isFull || !user || (credits > 0 && !canAfford)}
                  size="lg" className="font-grotesk font-bold">
                  {registering ? <Loader2 className="w-4 h-4 animate-spin" /> :
                    registered ? "Inscrit ✓" :
                    isFull ? "Complet" :
                    !user ? "Connectez-vous" :
                    (credits > 0 && !canAfford) ? "Crédits insuffisants" :
                    "S'inscrire"}
                </Button>
              ) : (
                <Button disabled size="lg" variant="secondary" className="font-grotesk font-bold">
                  Événement terminé
                </Button>
              )}
            </div>
          </div>
          {registered && (
            <p className="text-sm text-emerald-400 font-bold flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-current" /> Vous êtes inscrit — rendez-vous le {fmtDate(ev.start_date)} !
            </p>
          )}
        </div>

        {/* Back link */}
        <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-bold">
         <ArrowLeft className="w-4 h-4" /> Tous les événements
        </Link>
        </div>

        {ticketReg && (
        <EventTicketModal
         open={!!ticketReg}
         onClose={() => setTicketReg(null)}
         registration={ticketReg}
         event={ev}
         user={user}
         variant="confirmation"
        />
        )}
        </div>
        );
        }