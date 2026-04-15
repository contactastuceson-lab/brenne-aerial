import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ExternalLink, MapPin, Home, Heart, Plane } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icons (broken with Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: null, iconUrl: null, shadowUrl: null });

const CATEGORIES = [
  { key: 'all', label: 'Tous', icon: MapPin },
  { key: 'immobilier', label: 'Immobilier', icon: Home },
  { key: 'mariage', label: 'Mariage', icon: Heart },
  { key: 'tourisme', label: 'Tourisme', icon: Plane },
];

const CATEGORY_COLORS = {
  immobilier: '#38aadc',
  mariage:    '#f59e0b',
  tourisme:   '#1dd8b4',
};

const PROJECTS = [
  {
    id: 1,
    title: 'Villa Prestige Neuilly',
    city: 'Paris',
    category: 'immobilier',
    description: 'Captation aérienne 4K d\'une propriété d\'exception. Vue sur la Seine, intégration paysagère complète.',
    lat: 48.8566,
    lng: 2.3522,
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80',
    videoId: null,
  },
  {
    id: 2,
    title: 'Mariage au Château Pichon',
    city: 'Lyon',
    category: 'mariage',
    description: 'Immortaliser le plus beau jour depuis les airs. Film cinématique 4K avec drone FPV.',
    lat: 45.764,
    lng: 4.8357,
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
    videoId: 'dQw4w9WgXcQ',
  },
  {
    id: 3,
    title: 'Côte d\'Azur Depuis le Ciel',
    city: 'Nice',
    category: 'tourisme',
    description: 'Survol époustouflant de la Promenade des Anglais et du Cap d\'Antibes au coucher du soleil.',
    lat: 43.7102,
    lng: 7.262,
    thumbnail: 'https://images.unsplash.com/photo-1559006930-0a6b3b7b3c9e?w=600&auto=format&fit=crop&q=80',
    videoId: 'dQw4w9WgXcQ',
  },
  {
    id: 4,
    title: 'Domaine Viticole Bordelais',
    city: 'Bordeaux',
    category: 'tourisme',
    description: 'Mise en valeur d\'un grand cru classé : vignes à perte de vue et architecture châtelaine.',
    lat: 44.8378,
    lng: -0.5792,
    thumbnail: 'https://images.unsplash.com/photo-1506377295352-e3154d43ea9e?w=600&auto=format&fit=crop&q=80',
    videoId: null,
  },
  {
    id: 5,
    title: 'Appartements Vue Mer',
    city: 'Marseille',
    category: 'immobilier',
    description: 'Programme immobilier haut de gamme face à la Méditerranée. Tournage complet pour brochure promotionnelle.',
    lat: 43.2965,
    lng: 5.3698,
    thumbnail: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80',
    videoId: null,
  },
  {
    id: 6,
    title: 'Mariage en Dordogne',
    city: 'Périgueux',
    category: 'mariage',
    description: 'Reportage complet dans un manoir périgourdin : cérémonie en plein air et réception étoilée.',
    lat: 45.185,
    lng: 0.721,
    thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop&q=80',
    videoId: 'dQw4w9WgXcQ',
  },
];

// Custom SVG marker factory
function createMarkerIcon(category, isActive = false) {
  const color = CATEGORY_COLORS[category] || '#38aadc';
  const size = isActive ? 36 : 28;
  const pulse = isActive ? `
    <circle cx="18" cy="18" r="16" fill="${color}" opacity="0.15">
      <animate attributeName="r" values="16;22;16" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.15;0;0.15" dur="2s" repeatCount="indefinite"/>
    </circle>` : '';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 36 36">
      ${pulse}
      <circle cx="18" cy="18" r="10" fill="${color}" opacity="0.2"/>
      <circle cx="18" cy="18" r="6" fill="${color}" opacity="0.6"/>
      <circle cx="18" cy="18" r="3" fill="${color}"/>
      <circle cx="16" cy="16" r="1" fill="white" opacity="0.7"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FlyTo({ project }) {
  const map = useMap();
  useEffect(() => {
    if (project) {
      map.flyTo([project.lat, project.lng], 9, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [project, map]);
  return null;
}

function ProjectPopup({ project, onClose }) {
  if (!project) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="absolute bottom-6 left-1/2 z-[1000] w-[340px] sm:w-[400px]"
        style={{ transform: 'translateX(-50%)' }}
      >
        <div style={{
          background: 'linear-gradient(145deg, rgba(8,16,32,0.97), rgba(12,22,44,0.97))',
          border: `1px solid ${CATEGORY_COLORS[project.category]}40`,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 40px ${CATEGORY_COLORS[project.category]}15`,
        }}>
          {/* Accent bar */}
          <div style={{ height: 3, background: `linear-gradient(90deg, ${CATEGORY_COLORS[project.category]}, ${CATEGORY_COLORS[project.category]}80)` }} />

          {/* Thumbnail */}
          <div className="relative" style={{ height: 160 }}>
            <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,16,32,0.95) 0%, transparent 60%)' }} />
            {project.videoId && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: `${CATEGORY_COLORS[project.category]}20`,
                  border: `1.5px solid ${CATEGORY_COLORS[project.category]}80`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)',
                }}>
                  <Play style={{ width: 18, height: 18, color: CATEGORY_COLORS[project.category], marginLeft: 2 }} />
                </div>
              </div>
            )}
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
            >
              <X style={{ width: 12, height: 12 }} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
                color: CATEGORY_COLORS[project.category],
                background: `${CATEGORY_COLORS[project.category]}15`,
                border: `1px solid ${CATEGORY_COLORS[project.category]}30`,
                borderRadius: 20, padding: '2px 10px',
              }}>
                {project.category}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <MapPin style={{ width: 10, height: 10 }} /> {project.city}
              </span>
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#e8edf5', fontFamily: 'var(--font-grotesk)' }}>
              {project.title}
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: 12, color: 'rgba(180,200,220,0.7)', lineHeight: 1.6 }}>
              {project.description}
            </p>
            <a
              href="/portfolio"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 20px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: `linear-gradient(135deg, ${CATEGORY_COLORS[project.category]}cc, ${CATEGORY_COLORS[project.category]}80)`,
                color: project.category === 'mariage' ? '#0d0800' : '#fff',
                textDecoration: 'none', letterSpacing: '0.3px',
                border: `1px solid ${CATEGORY_COLORS[project.category]}60`,
              }}
            >
              <ExternalLink style={{ width: 12, height: 12 }} />
              Voir le projet
            </a>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function InteractiveMap() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

  const filtered = activeFilter === 'all' ? PROJECTS : PROJECTS.filter(p => p.category === activeFilter);

  return (
    <section style={{ background: '#060d18', padding: '80px 0' }}>
      {/* Section header */}
      <div className="text-center mb-10 px-5">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '4px', textTransform: 'uppercase', color: '#38aadc', opacity: 0.8, marginBottom: 12 }}>
            — Nos réalisations sur le terrain
          </p>
          <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: 'clamp(28px,5vw,46px)', fontWeight: 900, color: '#e8edf5', margin: '0 0 12px', lineHeight: 1.1 }}>
            Projets <span style={{ background: 'linear-gradient(135deg,#38aadc,#1dd8b4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>à travers la France</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: 'rgba(180,200,220,0.6)', maxWidth: 480, margin: '0 auto' }}>
            Survolez la carte et découvrez nos réalisations aériennes — immobilier, mariage, tourisme.
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex justify-center gap-2 px-5 mb-6 flex-wrap">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeFilter === cat.key;
          return (
            <motion.button
              key={cat.key}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setActiveFilter(cat.key); setSelectedProject(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 30, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                background: isActive ? 'linear-gradient(135deg,#38aadc,#1b8ab8)' : 'rgba(255,255,255,0.04)',
                border: isActive ? '1px solid #38aadc80' : '1px solid rgba(255,255,255,0.08)',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                boxShadow: isActive ? '0 4px 20px rgba(56,170,220,0.25)' : 'none',
              }}
            >
              <Icon style={{ width: 13, height: 13 }} />
              {cat.label}
            </motion.button>
          );
        })}
      </div>

      {/* Map container */}
      <div className="px-4 lg:px-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.1 }}
          style={{
            borderRadius: 20, overflow: 'hidden', position: 'relative',
            border: '1px solid rgba(56,170,220,0.15)',
            boxShadow: '0 0 60px rgba(0,0,0,0.6), 0 0 100px rgba(56,170,220,0.05)',
            height: 520,
          }}
        >
          {/* Gradient overlay edges */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to bottom,rgba(6,13,24,0.6),transparent)', zIndex: 500, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to top,rgba(6,13,24,0.6),transparent)', zIndex: 500, pointerEvents: 'none' }} />

          <MapContainer
            center={[46.5, 2.5]}
            zoom={5}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            {/* Dark cinematic tile */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

            {/* Fly animation */}
            <FlyTo project={selectedProject} />

            {/* Markers */}
            {filtered.map(project => (
              <Marker
                key={project.id}
                position={[project.lat, project.lng]}
                icon={createMarkerIcon(project.category, selectedProject?.id === project.id)}
                eventHandlers={{
                  click: () => setSelectedProject(prev => prev?.id === project.id ? null : project),
                }}
              />
            ))}
          </MapContainer>

          {/* Popup overlay */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 900 }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
              <div style={{ pointerEvents: 'auto' }}>
                <AnimatePresence>
                  {selectedProject && (
                    <ProjectPopup
                      key={selectedProject.id}
                      project={selectedProject}
                      onClose={() => setSelectedProject(null)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{
            position: 'absolute', top: 16, right: 16, zIndex: 600,
            background: 'rgba(6,13,24,0.85)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px',
          }}>
            {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize', fontFamily: 'var(--font-inter)' }}>{key}</span>
              </div>
            ))}
          </div>

          {/* Attribution */}
          <div style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 600, fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-inter)' }}>
            © CARTO · OpenStreetMap
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="flex justify-center gap-8 mt-8 flex-wrap"
        >
          {[
            { val: `${PROJECTS.length}+`, label: 'Projets cartographiés' },
            { val: '12', label: 'Régions couvertes' },
            { val: '4K', label: 'Qualité de tournage' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-grotesk)', background: 'linear-gradient(135deg,#38aadc,#1dd8b4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'rgba(180,200,220,0.45)', fontFamily: 'var(--font-inter)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}