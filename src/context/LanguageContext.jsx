import React, { createContext, useContext, useState } from 'react';

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
    admin: { title: 'Administration', quotes: 'Devis', appointments: 'Rendez-vous', users: 'Utilisateurs', messaging: 'Messagerie', stats: 'Statistiques', settings: 'Paramètres', emailing: 'Emailing', pricing: 'Tarification' },
    badges: { founder: 'Fondateur', admin: 'Administrateur', vip: 'VIP', moderator: 'Modérateur', user: 'Utilisateur' },
    common: { loading: 'Chargement...', save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', accept: 'Accepter', refuse: 'Refuser', send: 'Envoyer', search: 'Rechercher', noResults: 'Aucun résultat', pending: 'En attente', reviewing: 'En cours', accepted: 'Accepté', refused: 'Refusé' }
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
    admin: { title: 'Administration', quotes: 'Quotes', appointments: 'Appointments', users: 'Users', messaging: 'Messaging', stats: 'Statistics', settings: 'Settings', emailing: 'Emailing', pricing: 'Pricing' },
    badges: { founder: 'Founder', admin: 'Administrator', vip: 'VIP', moderator: 'Moderator', user: 'User' },
    common: { loading: 'Loading...', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', accept: 'Accept', refuse: 'Refuse', send: 'Send', search: 'Search', noResults: 'No results', pending: 'Pending', reviewing: 'Reviewing', accepted: 'Accepted', refused: 'Refused' }
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('fr');
  const t = (path) => {
    const keys = path.split('.');
    let result = translations[lang];
    for (const key of keys) {
      result = result?.[key];
    }
    return result || path;
  };
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);