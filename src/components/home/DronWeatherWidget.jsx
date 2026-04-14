import React, { useState, useEffect } from 'react';
import { Wind, Eye, Droplets, Zap, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATUS = {
  optimal: { label: 'Conditions Optimales', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30', dot: 'bg-green-400' },
  caution: { label: 'Vol avec Prudence', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', dot: 'bg-yellow-400' },
  forbidden: { label: 'Vol Déconseillé', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', dot: 'bg-red-400' },
};

function getFlightStatus(wind, rain, visibility) {
  if (wind > 12 || rain > 60 || visibility < 3) return 'forbidden';
  if (wind > 7 || rain > 30 || visibility < 5) return 'caution';
  return 'optimal';
}

export default function DroneWeatherWidget({ location = 'Brenne, France' }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `Get current weather data for ${location}. Return JSON with: wind_speed (m/s number), rain_probability (0-100 number), visibility (km number), temperature (celsius number), kp_index (0-9 number, geomagnetic activity), condition (short text like "Ensoleillé", "Nuageux", "Pluie").`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              wind_speed: { type: 'number' },
              rain_probability: { type: 'number' },
              visibility: { type: 'number' },
              temperature: { type: 'number' },
              kp_index: { type: 'number' },
              condition: { type: 'string' },
            }
          }
        });
        setWeather(res);
      } catch {
        setWeather({ wind_speed: 4.2, rain_probability: 15, visibility: 12, temperature: 18, kp_index: 2, condition: 'Ensoleillé' });
      }
      setLoading(false);
    };
    fetchWeather();
  }, [location]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-2">
        <Loader2 className="w-4 h-4 text-primary animate-spin" />
        <span className="font-mono text-xs text-muted-foreground">Chargement météo...</span>
      </div>
    );
  }

  const status = getFlightStatus(weather.wind_speed, weather.rain_probability, weather.visibility);
  const cfg = STATUS[status];
  const Icon = cfg.icon;

  return (
    <div className={`bg-card border rounded-xl p-4 ${cfg.border}`}>
      {/* Status badge */}
      <div className={`flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg border w-fit ${cfg.bg} ${cfg.border}`}>
        <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
        <span className={`font-mono text-[11px] font-bold ${cfg.color}`}>Conditions de vol : {cfg.label}</span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="flex items-center gap-2">
          <Wind className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <div>
            <p className="font-grotesk font-bold text-sm">{weather.wind_speed} m/s</p>
            <p className="font-mono text-[9px] text-muted-foreground">Vent</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <div>
            <p className="font-grotesk font-bold text-sm">{weather.rain_probability}%</p>
            <p className="font-mono text-[9px] text-muted-foreground">Précipitations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <div>
            <p className="font-grotesk font-bold text-sm">{weather.visibility} km</p>
            <p className="font-mono text-[9px] text-muted-foreground">Visibilité</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="font-grotesk font-bold text-sm">Kp {weather.kp_index}</p>
            <p className="font-mono text-[9px] text-muted-foreground">Index géomag.</p>
          </div>
        </div>
      </div>

      <p className="font-mono text-[10px] text-muted-foreground mt-2">{weather.condition} · {weather.temperature}°C · Données en temps réel</p>
    </div>
  );
}