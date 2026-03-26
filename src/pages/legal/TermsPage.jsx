import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const SECTIONS = [
  { title: '1. Objet et champ d\'application', content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du site internet www.brenne-aerial.fr (ci-après "le Site") et des services proposés par Brenne Aerial, représentée par Enor Lefoulon Meyer (ci-après "Brenne Aerial", "nous" ou "l'Entreprise").\n\nEn accédant et en utilisant le Site, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, veuillez cesser d'utiliser le Site immédiatement.\n\nBrenn Aerial se réserve le droit de modifier les présentes CGU à tout moment. Les modifications prennent effet dès leur publication sur le Site.` },
  { title: '2. Description des services', content: `Brenne Aerial est une entreprise spécialisée dans :\n\n• La vidéographie par drone professionnelle (événements, mariages, clips)\n• L'inspection technique par drone (toitures, façades, structures)\n• Le suivi de chantier aérien et cartographie\n• La captation vidéo 4K pour particuliers et entreprises\n• Le retour vidéo en temps réel pour opérations critiques\n• La formation pilote drone (en développement)\n\nTous nos pilotes sont certifiés DGAC. Nos prestations sont assurées conformément à la réglementation aérienne en vigueur.` },
  { title: '3. Accès au site et compte utilisateur', content: `3.1 Accès\nL'accès au Site est gratuit. Brenne Aerial se réserve le droit de restreindre ou suspendre l'accès en cas de maintenance, mise à jour ou menace de sécurité.\n\n3.2 Création de compte\nCertaines fonctionnalités nécessitent la création d'un compte (espace client, messagerie, suivi de devis). Vous êtes responsable de la confidentialité de vos identifiants.\n\n3.3 Obligations de l'utilisateur\nVous vous engagez à :\n• Fournir des informations exactes et à jour\n• Ne pas usurper l'identité d'une autre personne\n• Ne pas utiliser le Site à des fins illicites\n• Ne pas tenter de perturber le fonctionnement du Site\n• Signaler tout usage frauduleux de votre compte\n\n3.4 Suspension de compte\nBrenn Aerial peut suspendre ou supprimer tout compte en cas de violation des présentes CGU, sans préavis ni indemnisation.` },
  { title: '4. Commandes et devis', content: `4.1 Processus de devis\nLes demandes de devis effectuées sur le Site ne constituent pas une offre ferme de notre part. Tout devis envoyé par Brenne Aerial est valable 30 jours à compter de sa date d'émission.\n\n4.2 Confirmation de commande\nUne commande n'est ferme qu'après :\n• Signature du devis\n• Versement de l'acompte stipulé (généralement 30%)\n• Confirmation écrite de Brenne Aerial\n\n4.3 Modification et annulation\n• Annulation moins de 72h avant la prestation : acompte non remboursable\n• Annulation entre 72h et 7 jours : 50% du montant total dû\n• Annulation plus de 7 jours avant : acompte remboursable, moins frais administratifs (50€)\n\n4.4 Cas de force majeure\nEn cas de conditions météo incompatibles avec le vol de drone (vent > 50 km/h, pluie intense, brouillard), Brenne Aerial peut reporter la prestation sans pénalité. Un nouveau créneau sera proposé dans les 30 jours.` },
  { title: '5. Tarification et paiement', content: `5.1 Prix\nLes prix affichés sur le Site sont indicatifs et exprimés en euros TTC. Le prix définitif est déterminé dans le devis signé et peut inclure :\n• Frais de déplacement (au-delà de 50 km de la Brenne)\n• Frais de rendu et post-production\n• Frais d'autorisation de survol le cas échéant\n\n5.2 Modalités de paiement\n• Acompte de 30% à la commande\n• Solde à réception de la livraison\n• Paiement par virement bancaire ou carte bancaire\n\n5.3 Retards de paiement\nTout retard de paiement entraîne de plein droit l'application d'intérêts de retard au taux légal en vigueur, majoré de 10 points, sans mise en demeure préalable.` },
  { title: '6. Propriété intellectuelle', content: `6.1 Contenu du site\nL'ensemble du contenu du Site (textes, images, vidéos, logos, design) est la propriété exclusive de Brenne Aerial et est protégé par les droits de propriété intellectuelle.\n\n6.2 Productions créatives\nSauf accord contraire dans le devis, Brenne Aerial conserve les droits d'auteur sur toutes les productions (vidéos, photos). Le client reçoit une licence d'utilisation non exclusive pour les usages définis au contrat.\n\n6.3 Utilisation commerciale\nToute utilisation des productions à des fins commerciales non prévues au contrat initial est soumise à accord préalable et facturation supplémentaire.\n\n6.4 Droit à l'image\nLe client garantit disposer des autorisations nécessaires pour filmer les lieux, bâtiments et personnes présents lors des prestations.` },
  { title: '7. Responsabilité', content: `7.1 Limitation de responsabilité\nBrenn Aerial s'engage à réaliser ses prestations dans les règles de l'art. Notre responsabilité ne saurait être engagée pour :\n• Conditions météorologiques imprévisibles\n• Refus d'autorisation de survol par les autorités\n• Pannes matérielles imprévues\n• Faits du client ou de tiers\n\n7.2 Assurance\nBrenn Aerial est couvert par une assurance responsabilité civile professionnelle et assurance drone. Une attestation peut être fournie sur demande.\n\n7.3 Données client\nBrenn Aerial s'engage à ne pas divulguer les informations confidentielles du client. Les données sont protégées conformément à notre politique de confidentialité.` },
  { title: '8. Droit applicable et juridiction', content: `Les présentes CGU sont soumises au droit français.\n\nEn cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours judiciaire. À défaut d'accord amiable dans un délai de 30 jours, tout litige sera soumis à la compétence exclusive des tribunaux français.\n\nMédiation : conformément aux articles L.616-1 et R.616-1 du Code de la consommation, pour tout litige non résolu, vous pouvez recourir à une médiation de la consommation.\n\nDate de dernière mise à jour : ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}` },
];

export default function TermsPage() {
  return (
    <div className="pt-16">
      <section className="py-24 px-5 lg:px-10 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-primary" />
            <div>
              <p className="font-mono text-xs text-primary tracking-widest uppercase">Légal</p>
              <h1 className="font-grotesk font-bold text-3xl sm:text-4xl">Conditions Générales d'Utilisation</h1>
            </div>
          </div>
          <p className="font-inter text-sm text-muted-foreground mb-12">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="space-y-6">
            {SECTIONS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="p-6 rounded-xl bg-card border border-border">
                <h2 className="font-grotesk font-bold text-lg mb-4">{s.title}</h2>
                <div className="font-inter text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{s.content}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}