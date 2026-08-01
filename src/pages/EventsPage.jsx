import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  Calendar, MapPin, Users, Search, Clock, Sparkles, Video, Globe, Building2,
  Mic2, Wrench, Users as UsersIcon, Music, Code, Monitor, Image as ImageIcon,
  Trophy, PartyPopper, Tag, TrendingUp, ArrowRight, Loader2, Star, Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  { key: "all", label: "Tous", icon: Tag, color: "text-foreground" },
  { key: "conference", label: "Conférences", icon: Mic2, color: "text-sky-400" },
  { key: "workshop", label: "Ateliers", icon: Wrench, color: "text-orange-400" },
  { key: "meetup", label: "Meetups", icon: UsersIcon, color: "text-emerald-400" },
  { key: "concert", label: "Concerts", icon: Music, color: "text-fuchsia-400" },
  { key: "hackathon", label: "Hackathons", icon: Code, color: "text-violet-400" },
  { key: "webinar", label: "Webinaires", icon: Monitor, color: "text-cyan-400" },
  { key: "expo", label: "Expos", icon: ImageIcon, color: "text-amber-400" },
  { key: "sport", label: "Sport", icon: Trophy, color: "text-lime-400" },
  { key: "party", label: "Soirées", icon: PartyPopper, color: "text-rose-400" },
];

const FORMATS = [
  { key: "all", label: "Tous formats", icon: Globe },
  { key: "physical", label: "Présentiel", icon: Building2 },
  { key: "online", label: "En ligne", icon: Video },
  { key: "hybrid", label: "Hybride", icon: Globe },
];

function formatPrice(ev) {
  if (!ev.price_credits || ev.price_credits === 0) return "Gratuit";
  return `${ev.price_credits} crédits`;
}

function formatDay(d) {
  try {
    const date = new Date(d);
    return {
      day: date.toLocaleDateString("fr-FR", { day: "2-digit" }),
      month: date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "").toUpperCase(),
      weekday: date.toLocaleDateString("fr-FR", { weekday: "short" }),
      time: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };
  } catch {
    return { day: "--", month: "---", weekday: "", time: "" };
  }
}

function statusBadge(ev) {
  const now = Date.now();
  const start = ev.start_date ? new Date(ev.start_date).getTime() : 0;
  const end = ev.end_date ? new Date(ev.end_date).getTime() : start;
  if (ev.status === "cancelled") return { label: "Annulé", cls: "bg-red-500/15 text-red-400 border-red-500/30" };
  if (start <= now && now <= end) return { label: "En direct", cls: "bg-red-500/15 text-red-400 border-red-500/30 animate-pulse" };
  if (now < start) return { label: "À venir", cls: "bg-sky-500/15 text-sky-300 border-sky-500/30" };
  return { label: "Terminé", cls: "bg-muted/40 text-muted-foreground border-border" };
}

function EventCard({ ev, index }) {
  const date = formatDay(ev.start_date);
  const sb = statusBadge(ev);
  const cat = CATEGORIES.find((c) => c.key === ev.category) || CATEGORIES[CATEGORIES.length - 1];
  const CatIcon = cat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
    >
      <Link to={`/events/${ev.id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card hover-lift h-full">
          {/* Date badge */}
          <div className="absolute top-3 left-3 z-20 flex flex-col items-center justify-center w-14 h-14 rounded-xl glass border border-white/10">
            <span className="text-lg font-grotesk font-black leading-none">{date.day}</span>
            <span className="text-[10px] font-bold text-muted-foreground">{date.month}</span>
          </div>
          {/* Status */}
          <div className={`absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full text-[11px] font-grotesk font-bold border ${sb.cls}`}>
            {sb.label}
          </div>
          {/* Image */}
          <div className="aspect-[16/9] overflow-hidden bg-secondary/40">
            {ev.image_url ? (
              <img src={ev.image_url} alt={ev.title} loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/30 to-accent/10">
                <CatIcon className="w-12 h-12 text-muted-foreground/40" />
              </div>
            )}
          </div>
          {/* Body */}
          <div className="p-4 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary/60 ${cat.color}`}>
                <CatIcon className="w-3 h-3" /> {cat.label}
              </span>
              {ev.format === "online" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary/60 text-cyan-400">
                  <Video className="w-3 h-3" /> En ligne
                </span>
              )}
              {ev.format === "hybrid" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary/60 text-violet-400">
                  <Globe className="w-3 h-3" /> Hybride
                </span>
              )}
            </div>
            <h3 className="font-grotesk font-bold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {ev.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{ev.description}</p>
            <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {date.weekday} {date.time}
              </span>
              {ev.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {ev.city}
                </span>
              )}
              {ev.attendees_count > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {ev.attendees_count}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
              <span className="font-grotesk font-bold text-amber-400 text-sm inline-flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> {formatPrice(ev)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                Détails <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EventSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="aspect-[16/9] bg-muted/30 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-20 bg-muted/40 rounded animate-pulse" />
        <div className="h-5 w-full bg-muted/40 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [format, setFormat] = useState("all");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("upcoming"); // upcoming | live | past

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const list = await base44.entities.Event.list("-start_date", 200);
        if (active) setEvents(list || []);
      } catch {
        if (active) setEvents([]);
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const now = Date.now();

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      if (category !== "all" && ev.category !== category) return false;
      if (format !== "all" && ev.format !== format) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!ev.title?.toLowerCase().includes(q) &&
            !ev.description?.toLowerCase().includes(q) &&
            !ev.city?.toLowerCase().includes(q) &&
            !ev.tags?.some((t) => t.toLowerCase().includes(q))) return false;
      }
      const start = ev.start_date ? new Date(ev.start_date).getTime() : 0;
      const end = ev.end_date ? new Date(ev.end_date).getTime() : start;
      if (tab === "upcoming" && start <= now) return false;
      if (tab === "past" && end >= now) return false;
      if (tab === "live" && !(start <= now && now <= end)) return false;
      return true;
    });
  }, [events, category, format, query, tab, now]);

  const featured = useMemo(() => {
    return events.filter((e) => e.is_featured && new Date(e.start_date).getTime() > now).slice(0, 1)[0];
  }, [events, now]);

  const tabs = [
    { key: "upcoming", label: "À venir", icon: Calendar },
    { key: "live", label: "En direct", icon: TrendingUp },
    { key: "past", label: "Passés", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-grotesk font-bold">
              <Sparkles className="w-3.5 h-3.5" /> EZA Événements
            </span>
          </motion.div>
          <h1 className="font-grotesk text-3xl sm:text-5xl font-black tracking-tight gradient-text mb-3">
            Événements EZA
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
            Conférences, ateliers, meetups, concerts et hackathons — retrouvez toute la vie
            de la communauté EZA en un seul endroit.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Featured */}
        {featured && !loading && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Link to={`/events/${featured.id}`}>
              <div className="relative overflow-hidden rounded-3xl border border-primary/30 h-64 sm:h-80 group">
                {featured.image_url && (
                  <img src={featured.image_url} alt={featured.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-grotesk font-bold inline-flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-current" /> À la une
                  </span>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground">
                      <span className="text-2xl font-grotesk font-black leading-none">
                        {formatDay(featured.start_date).day}
                      </span>
                      <span className="text-[10px] font-bold">
                        {formatDay(featured.start_date).month}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h2 className="font-grotesk text-xl sm:text-3xl font-black text-white drop-shadow-lg">
                        {featured.title}
                      </h2>
                      <div className="flex items-center gap-3 text-white/80 text-sm flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {formatDay(featured.start_date).time}
                        </span>
                        {featured.city && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {featured.city}
                          </span>
                        )}
                        <span className="font-bold inline-flex items-center gap-1 text-amber-400">
                          <Coins className="w-4 h-4" /> {formatPrice(featured)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm line-clamp-2 max-w-2xl hidden sm:block">
                    {featured.description}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Controls */}
        <div className="space-y-4">
          {/* Search + tabs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un événement, une ville, un tag…"
                className="pl-9 bg-card/60" />
            </div>
            <div className="flex gap-1 p-1 rounded-xl bg-secondary/60 overflow-x-auto no-scrollbar">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-grotesk font-bold transition-all whitespace-nowrap ${tab === t.key ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}>
                    <Icon className="w-4 h-4" /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <button key={c.key} onClick={() => setCategory(c.key)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold border transition-all ${category === c.key ? `${c.color} bg-secondary border-border` : "text-muted-foreground border-border/50 hover:border-border hover:text-foreground"}`}>
                  <Icon className="w-4 h-4" /> {c.label}
                </button>
              );
            })}
          </div>

          {/* Format chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {FORMATS.map((f) => {
              const Icon = f.icon;
              return (
                <button key={f.key} onClick={() => setFormat(f.key)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${format === f.key ? "text-primary bg-primary/10 border-primary/30" : "text-muted-foreground border-border/50 hover:text-foreground"}`}>
                  <Icon className="w-3.5 h-3.5" /> {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <EventSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-16 h-16 rounded-full bg-secondary/40 flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="font-grotesk font-bold text-lg">Aucun événement trouvé</p>
            <p className="text-sm text-muted-foreground">Essayez d'élargir vos filtres ou revenez plus tard.</p>
            <Button variant="outline" size="sm" onClick={() => { setCategory("all"); setFormat("all"); setQuery(""); setTab("upcoming"); }}>
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground font-grotesk font-bold">
              {filtered.length} événement{filtered.length > 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((ev, i) => <EventCard key={ev.id} ev={ev} index={i} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}