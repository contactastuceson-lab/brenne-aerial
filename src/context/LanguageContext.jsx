import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  fr: {
    nav: { home: 'Accueil', about: 'À propos', services: 'Services', quote: 'Devis', hours: 'Horaires', planning: 'Planning', dashboard: 'Espace', admin: 'Admin', login: 'Connexion', logout: 'Déconnexion' },
    hero: { title: 'Excellence.', subtitle: 'Précision.', tagline: 'Solutions sur mesure pour votre réussite', cta: 'Demander un devis', discover: 'Découvrir' },
    about: { title: 'Le Fondateur', role: 'Fondateur & Directeur', history: "Enor Lefoulon Meyer a fondé cette entreprise avec une vision claire : offrir des services d'excellence qui allient expertise technique et approche humaine. Chaque projet est traité avec la même rigueur et le même souci du détail.", values: 'Nos Valeurs', excellence: 'Excellence', innovation: 'Innovation', integrity: 'Intégrité', proximity: 'Proximité' },
    services: { title: 'Nos Services', subtitle: 'Des solutions adaptées à vos besoins', consulting: 'Consulting', development: 'Développement', design: 'Design', maintenance: 'Maintenance', formation: 'Formation', autre: 'Autre' },
    quote: { title: 'Demande de Devis', step1: 'Service', step2: 'Détails', step3: 'Contact', step4: 'Confirmation', next: 'Suivant', prev: 'Précédent', submit: 'Envoyer', success: 'Votre demande a été envoyée avec succès !', name: 'Nom complet', email: 'Adresse email', phone: 'Téléphone', description: 'Décrivez votre besoin', budget: 'Budget estimé', urgency: 'Niveau d\'urgence' },
    hours: { title: 'Horaires d\'ouverture', open: 'Ouvert', closed: 'Fermé', break: 'Pause' },
    planning: { title: 'Planning & Réservation', available: 'Disponible', booked: 'Réservé', book: 'Réserver', morning: 'Matin', afternoon: 'Après-midi', evening: 'Soir' },
    dashboard: { title: 'Mon Espace', messages: 'Messages', notifications: 'Notifications', badges: 'Badges', profile: 'Profil' },
    admin: { title: 'Administration', quotes: 'Devis', appointments: 'Rendez-vous', users: 'Utilisateurs', accounts: 'Comptes', certifications: 'Certifications', messaging: 'Messagerie', stats: 'Statistiques', settings: 'Paramètres', emailing: 'Emailing', pricing: 'Tarification', sessions: 'Sessions', audit_logs: 'Journal d\'audit', monitoring: 'Monitoring IA' },
    badges: { founder: 'Fondateur', admin: 'Administrateur', vip: 'VIP', moderator: 'Modérateur', user: 'Utilisateur' },
    common: { loading: 'Chargement...', save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', accept: 'Accepter', refuse: 'Refuser', send: 'Envoyer', search: 'Rechercher', noResults: 'Aucun résultat', pending: 'En attente', reviewing: 'En cours', accepted: 'Accepté', refused: 'Refusé' },
    preferences: { language: 'Langue', display: 'Affichage', compact_mode: 'Mode compact', compact_mode_desc: 'Interface plus compacte', show_online_status: 'Afficher le statut en ligne', show_online_status_desc: 'Les autres voient si vous êtes actif', save: 'Sauvegarder les préférences', saved: 'Préférences sauvegardées' },
  },
  en: {
    nav: { home: 'Home', about: 'About', services: 'Services', quote: 'Quote', hours: 'Hours', planning: 'Planning', dashboard: 'Dashboard', admin: 'Admin', login: 'Login', logout: 'Logout' },
    hero: { title: 'Excellence.', subtitle: 'Precision.', tagline: 'Tailored solutions for your success', cta: 'Request a quote', discover: 'Discover' },
    about: { title: 'The Founder', role: 'Founder & Director', history: "Enor Lefoulon Meyer founded this company with a clear vision: to offer excellent services that combine technical expertise with a human approach. Every project is treated with the same rigor and attention to detail.", values: 'Our Values', excellence: 'Excellence', innovation: 'Innovation', integrity: 'Integrity', proximity: 'Proximity' },
    services: { title: 'Our Services', subtitle: 'Solutions tailored to your needs', consulting: 'Consulting', development: 'Development', design: 'Design', maintenance: 'Maintenance', formation: 'Training', autre: 'Other' },
    quote: { title: 'Quote Request', step1: 'Service', step2: 'Details', step3: 'Contact', step4: 'Confirmation', next: 'Next', prev: 'Previous', submit: 'Submit', success: 'Your request has been sent successfully!', name: 'Full name', email: 'Email address', phone: 'Phone', description: 'Describe your needs', budget: 'Estimated budget', urgency: 'Urgency level' },
    hours: { title: 'Business Hours', open: 'Open', closed: 'Closed', break: 'Break' },
    planning: { title: 'Planning & Booking', available: 'Available', booked: 'Booked', book: 'Book', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' },
    dashboard: { title: 'My Dashboard', messages: 'Messages', notifications: 'Notifications', badges: 'Badges', profile: 'Profile' },
    admin: { title: 'Administration', quotes: 'Quotes', appointments: 'Appointments', users: 'Users', accounts: 'Accounts', certifications: 'Certifications', messaging: 'Messaging', stats: 'Statistics', settings: 'Settings', emailing: 'Emailing', pricing: 'Pricing', sessions: 'Sessions', audit_logs: 'Audit Logs', monitoring: 'AI Monitoring' },
    badges: { founder: 'Founder', admin: 'Administrator', vip: 'VIP', moderator: 'Moderator', user: 'User' },
    common: { loading: 'Loading...', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', accept: 'Accept', refuse: 'Refuse', send: 'Send', search: 'Search', noResults: 'No results', pending: 'Pending', reviewing: 'Reviewing', accepted: 'Accepted', refused: 'Refused' },
    preferences: { language: 'Language', display: 'Display', compact_mode: 'Compact mode', compact_mode_desc: 'More compact interface', show_online_status: 'Show online status', show_online_status_desc: 'Others can see if you are active', save: 'Save preferences', saved: 'Preferences saved' },
  },
  es: {
    nav: { home: 'Inicio', about: 'Sobre nosotros', services: 'Servicios', quote: 'Presupuesto', hours: 'Horarios', planning: 'Planificación', dashboard: 'Panel', admin: 'Admin', login: 'Iniciar sesión', logout: 'Cerrar sesión' },
    hero: { title: 'Excelencia.', subtitle: 'Precisión.', tagline: 'Soluciones a medida para su éxito', cta: 'Solicitar presupuesto', discover: 'Descubrir' },
    about: { title: 'El Fundador', role: 'Fundador y Director', history: 'Enor Lefoulon Meyer fundó esta empresa con una visión clara: ofrecer servicios de excelencia que combinen experiencia técnica con un enfoque humano.', values: 'Nuestros Valores', excellence: 'Excelencia', innovation: 'Innovación', integrity: 'Integridad', proximity: 'Proximidad' },
    services: { title: 'Nuestros Servicios', subtitle: 'Soluciones adaptadas a sus necesidades', consulting: 'Consultoría', development: 'Desarrollo', design: 'Diseño', maintenance: 'Mantenimiento', formation: 'Formación', autre: 'Otro' },
    quote: { title: 'Solicitud de Presupuesto', step1: 'Servicio', step2: 'Detalles', step3: 'Contacto', step4: 'Confirmación', next: 'Siguiente', prev: 'Anterior', submit: 'Enviar', success: '¡Su solicitud ha sido enviada con éxito!', name: 'Nombre completo', email: 'Correo electrónico', phone: 'Teléfono', description: 'Describa su necesidad', budget: 'Presupuesto estimado', urgency: 'Nivel de urgencia' },
    hours: { title: 'Horario de Atención', open: 'Abierto', closed: 'Cerrado', break: 'Pausa' },
    planning: { title: 'Planificación & Reserva', available: 'Disponible', booked: 'Reservado', book: 'Reservar', morning: 'Mañana', afternoon: 'Tarde', evening: 'Noche' },
    dashboard: { title: 'Mi Panel', messages: 'Mensajes', notifications: 'Notificaciones', badges: 'Insignias', profile: 'Perfil' },
    admin: { title: 'Administración', quotes: 'Presupuestos', appointments: 'Citas', users: 'Usuarios', accounts: 'Cuentas', certifications: 'Certificaciones', messaging: 'Mensajería', stats: 'Estadísticas', settings: 'Ajustes', emailing: 'Emailing', pricing: 'Tarifas', sessions: 'Sesiones', audit_logs: 'Auditoría', monitoring: 'Monitoreo IA' },
    badges: { founder: 'Fundador', admin: 'Administrador', vip: 'VIP', moderator: 'Moderador', user: 'Usuario' },
    common: { loading: 'Cargando...', save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar', accept: 'Aceptar', refuse: 'Rechazar', send: 'Enviar', search: 'Buscar', noResults: 'Sin resultados', pending: 'Pendiente', reviewing: 'En revisión', accepted: 'Aceptado', refused: 'Rechazado' },
    preferences: { language: 'Idioma', display: 'Visualización', compact_mode: 'Modo compacto', compact_mode_desc: 'Interfaz más compacta', show_online_status: 'Mostrar estado en línea', show_online_status_desc: 'Los demás ven si estás activo', save: 'Guardar preferencias', saved: 'Preferencias guardadas' },
  },
  de: {
    nav: { home: 'Startseite', about: 'Über uns', services: 'Dienstleistungen', quote: 'Angebot', hours: 'Öffnungszeiten', planning: 'Planung', dashboard: 'Dashboard', admin: 'Admin', login: 'Anmelden', logout: 'Abmelden' },
    hero: { title: 'Exzellenz.', subtitle: 'Präzision.', tagline: 'Maßgeschneiderte Lösungen für Ihren Erfolg', cta: 'Angebot anfordern', discover: 'Entdecken' },
    about: { title: 'Der Gründer', role: 'Gründer & Direktor', history: 'Enor Lefoulon Meyer gründete dieses Unternehmen mit einer klaren Vision: hervorragende Dienstleistungen anzubieten, die technisches Know-how mit einem menschlichen Ansatz verbinden.', values: 'Unsere Werte', excellence: 'Exzellenz', innovation: 'Innovation', integrity: 'Integrität', proximity: 'Nähe' },
    services: { title: 'Unsere Leistungen', subtitle: 'Lösungen, die auf Ihre Bedürfnisse zugeschnitten sind', consulting: 'Beratung', development: 'Entwicklung', design: 'Design', maintenance: 'Wartung', formation: 'Ausbildung', autre: 'Sonstiges' },
    quote: { title: 'Angebotsanfrage', step1: 'Dienst', step2: 'Details', step3: 'Kontakt', step4: 'Bestätigung', next: 'Weiter', prev: 'Zurück', submit: 'Absenden', success: 'Ihre Anfrage wurde erfolgreich gesendet!', name: 'Vollständiger Name', email: 'E-Mail-Adresse', phone: 'Telefon', description: 'Beschreiben Sie Ihren Bedarf', budget: 'Geschätztes Budget', urgency: 'Dringlichkeitsstufe' },
    hours: { title: 'Öffnungszeiten', open: 'Geöffnet', closed: 'Geschlossen', break: 'Pause' },
    planning: { title: 'Planung & Buchung', available: 'Verfügbar', booked: 'Gebucht', book: 'Buchen', morning: 'Morgen', afternoon: 'Nachmittag', evening: 'Abend' },
    dashboard: { title: 'Mein Dashboard', messages: 'Nachrichten', notifications: 'Benachrichtigungen', badges: 'Abzeichen', profile: 'Profil' },
    admin: { title: 'Verwaltung', quotes: 'Angebote', appointments: 'Termine', users: 'Benutzer', accounts: 'Konten', certifications: 'Zertifikate', messaging: 'Nachrichten', stats: 'Statistiken', settings: 'Einstellungen', emailing: 'E-Mailing', pricing: 'Preise', sessions: 'Sitzungen', audit_logs: 'Prüfprotokoll', monitoring: 'KI-Monitoring' },
    badges: { founder: 'Gründer', admin: 'Administrator', vip: 'VIP', moderator: 'Moderator', user: 'Benutzer' },
    common: { loading: 'Laden...', save: 'Speichern', cancel: 'Abbrechen', delete: 'Löschen', edit: 'Bearbeiten', accept: 'Akzeptieren', refuse: 'Ablehnen', send: 'Senden', search: 'Suchen', noResults: 'Keine Ergebnisse', pending: 'Ausstehend', reviewing: 'In Bearbeitung', accepted: 'Akzeptiert', refused: 'Abgelehnt' },
    preferences: { language: 'Sprache', display: 'Anzeige', compact_mode: 'Kompaktmodus', compact_mode_desc: 'Kompaktere Benutzeroberfläche', show_online_status: 'Online-Status anzeigen', show_online_status_desc: 'Andere sehen, ob Sie aktiv sind', save: 'Einstellungen speichern', saved: 'Einstellungen gespeichert' },
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('user-language') || 'fr');

  // Listen to language-changed events from PreferencesSettings
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.lang && translations[e.detail.lang]) {
        setLangState(e.detail.lang);
      }
    };
    window.addEventListener('language-changed', handler);
    return () => window.removeEventListener('language-changed', handler);
  }, []);

  const setLang = (newLang) => {
    if (translations[newLang]) {
      setLangState(newLang);
      localStorage.setItem('user-language', newLang);
      document.documentElement.lang = newLang;
    }
  };

  const t = (path) => {
    const keys = path.split('.');
    let result = translations[lang];
    for (const key of keys) {
      result = result?.[key];
    }
    return result || path;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);