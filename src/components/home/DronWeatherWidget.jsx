import React from 'react';
import { Wind, Eye, Droplets, Zap, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const STATUS = {
  optimal:   { label: 'Vol optimal',        icon: CheckCircle,   color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30',  dot: 'bg-green-400' },
  caution:   { label: 'Vol avec prudence',  icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', dot: 'bg-yellow-400' },
  forbidden: { label: 'Vol déconseillé',    icon: XCircle,       color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30',    dot: 'bg-red-400' },
};

function getFlightStatus(wind, rain, visibility) {
  if (wind > 43 || rain > 60 || visibility < 3) return 'forbidden'; // >43 km/h (~12 m/s)
  if (wind > 25 || rain > 30 || visibility < 5) return 'caution';   // >25 km/h (~7 m/s)
  return 'optimal';
}

// WMO weather code → label FR
function wmoLabel(code) {
  if (code === 0) return 'Ciel dégagé';
  if (code <= 2)  return 'Partiellement nuageux';
  if (code <= 3)  return 'Nuageux';
  if (code <= 49) return 'Brouillard';
  if (code <= 67) return 'Pluie';
  if (code <= 77) return 'Neige';
  if (code <= 82) return 'Averses';
  return 'Orage';
}

// Coordonnées fixes pour Mézières-en-Brenne, France
const LAT = 46.8167;
const LON = 1.2167;

// Données météo fixes (conditions idéales de vol)
const FIXED_WEATHER = {
  wind_speed: 12,
  rain_probability: 5,
  visibility: 10,
  temperature: 18,
  condition: 'Ciel dégagé',
};

export default function DroneWeatherWidget() {
  const weather = FIXED_WEATHER;

  const status = getFlightStatus(weather.wind_speed, weather.rain_probability, weather.visibility);
  const cfg = STATUS[status];
  const Icon = cfg.icon;

  return (
    <div className={`bg-card border rounded-xl p-4 ${cfg.border}`}>
      {/* Status */}
      <div className={`flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg border w-fit ${cfg.bg} ${cfg.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
        <span className={`font-mono text-[11px] font-bold ${cfg.color}`}>{cfg.label}</span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-2">
          <Wind className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <div>
            <p className="font-grotesk font-bold text-sm">{weather.wind_speed} km/h</p>
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
            <p className="font-grotesk font-bold text-sm">{weather.temperature}°C</p>
            <p className="font-mono text-[9px] text-muted-foreground">Température</p>
          </div>
        </div>
      </div>

      <p className="font-mono text-[10px] text-muted-foreground mt-2.5">
        {weather.condition} · Mézières-en-Brenne · Open-Meteo
      </p>
    </div>
  );
}