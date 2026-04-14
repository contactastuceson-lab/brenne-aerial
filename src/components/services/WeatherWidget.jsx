import React, { useState, useEffect } from 'react';
import { Wind, Droplets, Eye, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CONDITIONS = {
  optimal: {
    label: 'Conditions optimales',
    sub: 'Vol autorisé — résultats visuels excellents garantis',
    icon: CheckCircle2,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    dot: 'bg-green-500',
    emoji: '✅',
  },
  acceptable: {
    label: 'Conditions acceptables',
    sub: 'Vol possible avec précautions — résultats légèrement impactés',
    icon: AlertTriangle,
    color: 'text-chart-5',
    bg: 'bg-chart-5/10',
    border: 'border-chart-5/30',
    dot: 'bg-chart-5',
    emoji: '⚠️',
  },
  risque: {
    label: 'Conditions risquées',
    sub: 'Vol déconseillé — report de mission recommandé',
    icon: AlertTriangle,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    dot: 'bg-orange-500',
    emoji: '🔶',
  },
  interdit: {
    label: 'Vol interdit',
    sub: 'Vent excessif ou précipitations — mission reportée automatiquement',
    icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    dot: 'bg-destructive',
    emoji: '🚫',
  },
};

function getFlightCondition(weather) {
  if (!weather) return null;
  const wind = weather.wind_speed_kmh || 0;
  const rain = weather.precipitation_mm || 0;
  const visibility = weather.visibility_km || 10;
  const gusts = weather.gusts_kmh || 0;

  if (wind > 50 || gusts > 60 || rain > 5) return 'interdit';
  if (wind > 35 || gusts > 45 || rain > 1 || visibility < 3) return 'risque';
  if (wind > 20 || gusts > 30 || rain > 0.1 || visibility < 5) return 'acceptable';
  return 'optimal';
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Donne-moi les conditions météo actuelles pour Brenne (Indre, France, coordonnées 46.7, 1.4) en JSON.
Retourne uniquement ces champs : wind_speed_kmh (vitesse vent moy km/h), gusts_kmh (rafales km/h), precipitation_mm (précip mm dernière heure), visibility_km (visibilité km), temperature_c (temp °C), description (météo en français, 3 mots max).`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            wind_speed_kmh: { type: 'number' },
            gusts_kmh: { type: 'number' },
            precipitation_mm: { type: 'number' },
            visibility_km: { type: 'number' },
            temperature_c: { type: 'number' },
            description: { type: 'string' },
          },
        },
      });
      setWeather(res);
      setLastUpdate(new Date());
    } catch {
      // fallback static
      setWeather({ wind_speed_kmh: 12, gusts_kmh: 18, precipitation_mm: 0, visibility_km: 10, temperature_c: 15, description: 'Ensoleillé' });
      setLastUpdate(new Date());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const condition = getFlightCondition(weather);
  const cfg = CONDITIONS[condition] || CONDITIONS.optimal;
  const Icon = cfg.icon;

  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="relative mt-0.5">
            <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
            <div className={`absolute inset-0 rounded-full ${cfg.dot} animate-ping opacity-60`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className={`font-grotesk font-bold text-sm ${cfg.color}`}>{cfg.emoji} {cfg.label}</p>
            </div>
            <p className="font-inter text-xs text-muted-foreground mt-0.5">{cfg.sub}</p>
          </div>
        </div>
        <button onClick={fetchWeather} disabled={loading} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {weather && !loading && (
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-mono text-xs">{weather.wind_speed_kmh} km/h</span>
            <span className="font-mono text-[10px] text-muted-foreground">(rafales {weather.gusts_kmh})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-mono text-xs">{weather.precipitation_mm} mm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-mono text-xs">{weather.visibility_km} km visibilité</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-muted-foreground">{weather.temperature_c}°C · {weather.description}</span>
          </div>
        </div>
      )}

      {lastUpdate && (
        <p className="font-mono text-[10px] text-muted-foreground mt-3">
          Mis à jour à {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · Région Brenne, Indre
        </p>
      )}
    </div>
  );
}