import React, { useEffect, useState } from 'react';
import { Wind, Eye, Droplets, Thermometer, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

const STATUS = {
  optimal:   { label: 'Vol optimal',       icon: CheckCircle,   color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30',  dot: 'bg-green-400' },
  caution:   { label: 'Vol avec prudence', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', dot: 'bg-yellow-400' },
  forbidden: { label: 'Vol déconseillé',   icon: XCircle,       color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30',    dot: 'bg-red-400' },
};

function getFlightStatus(wind, rain, visibility) {
  if (wind > 43 || rain > 60 || visibility < 3) return 'forbidden';
  if (wind > 25 || rain > 30 || visibility < 5) return 'caution';
  return 'optimal';
}

function wmoLabel(code) {
  if (code === 0) return 'Ciel dégagé';
  if (code <= 2)  return 'Partiellement nuageux';
  if (code === 3) return 'Couvert';
  if (code <= 49) return 'Brouillard';
  if (code <= 55) return 'Bruine';
  if (code <= 67) return 'Pluie';
  if (code <= 77) return 'Neige';
  if (code <= 82) return 'Averses';
  if (code <= 99) return 'Orage';
  return 'Inconnu';
}

// Mézières-en-Brenne, France
const LAT = 46.8167;
const LON = 1.2167;

export default function DroneWeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    setError(false);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,wind_speed_10m,precipitation_probability,visibility,weather_code&wind_speed_unit=kmh&timezone=Europe%2FParis&_t=${Date.now()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      const c = json.current;
      setWeather({
        wind_speed: Math.round(c.wind_speed_10m),
        rain_probability: c.precipitation_probability ?? 0,
        visibility: Math.round((c.visibility ?? 10000) / 1000), // m → km
        temperature: Math.round(c.temperature_2m),
        condition: wmoLabel(c.weather_code),
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeather(); }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
        <RefreshCw className="w-4 h-4 text-primary animate-spin" />
        <span className="font-mono text-xs text-muted-foreground">Chargement météo…</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
        <XCircle className="w-4 h-4 text-red-400" />
        <span className="font-mono text-xs text-muted-foreground">Météo indisponible</span>
        <button onClick={fetchWeather} className="ml-auto font-mono text-[10px] text-primary hover:underline">Réessayer</button>
      </div>
    );
  }

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
          <Thermometer className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="font-grotesk font-bold text-sm">{weather.temperature}°C</p>
            <p className="font-mono text-[9px] text-muted-foreground">Température</p>
          </div>
        </div>
      </div>

      <p className="font-mono text-[10px] text-muted-foreground mt-2.5">
        {weather.condition} · Mézières-en-Brenne · Open-Meteo (temps réel)
      </p>
    </div>
  );
}