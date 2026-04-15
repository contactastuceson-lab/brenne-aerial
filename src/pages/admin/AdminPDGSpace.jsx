import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Crown, Download, Code, FileCode, Search, RefreshCw, Lock, ChevronRight, Eye, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDG_EMAILS, PDG_ADJOINT_EMAILS } from '@/lib/roles';
import { toast } from 'sonner';
import PDGAIAgent from '@/components/admin/PDGAIAgent';

// All project files organized by category
const FILE_TREE = {
  '📄 Core': ['App.jsx', 'index.css', 'tailwind.config.js', 'index.html'],
  '📚 Lib': ['lib/roles.js', 'lib/employeeRoles.js', 'lib/AuthContext.jsx', 'lib/query-client.js', 'lib/utils.js', 'lib/PageNotFound.jsx'],
  '🏠 Pages Publiques': [
    'pages/HomePage', 'pages/AboutPage', 'pages/ServicesPage', 'pages/PortfolioPage',
    'pages/QuotePage', 'pages/PlanningPage', 'pages/BlogPage', 'pages/ContactPage',
    'pages/DashboardPage', 'pages/DiscoverPage', 'pages/MessagesPage', 'pages/ProfilePage',
    'pages/GaragePage', 'pages/QuoteCalculatorPage', 'pages/ReglementationPage',
    'pages/FlashDeliveryPage', 'pages/SimulateurVuePage', 'pages/ComparateurPage',
    'pages/StatusPage', 'pages/DonationPage', 'pages/DonationSuccessPage',
    'pages/CertificationSuccessPage', 'pages/legal/PrivacyPage', 'pages/legal/TermsPage',
  ],
  '⚙️ Pages Admin': [
    'pages/admin/AdminDashboard', 'pages/admin/AdminQuotes', 'pages/admin/AdminAppointments',
    'pages/admin/AdminPortfolio', 'pages/admin/AdminBlog', 'pages/admin/AdminMessaging',
    'pages/admin/AdminUsers', 'pages/admin/AdminReports', 'pages/admin/AdminConversations',
    'pages/admin/AdminMaintenance', 'pages/admin/AdminAnnouncements', 'pages/admin/AdminPages',
    'pages/admin/AdminBadges', 'pages/admin/AdminEmailing', 'pages/admin/AdminPricing',
    'pages/admin/AdminAccounts', 'pages/admin/AdminCertifications', 'pages/admin/AdminDonations',
    'pages/admin/AdminStatus', 'pages/admin/AdminGovernance', 'pages/admin/AdminEmployees',
    'pages/admin/AdminSiteConfig', 'pages/admin/AdminPDGSpace',
  ],
  '🧩 Composants': [
    'components/admin/AdminLayout', 'components/layout/PublicLayout',
    'components/layout/Navbar', 'components/layout/Footer',
    'components/admin/EmployeeProfileModal', 'components/shared/UserProfileModal',
    'components/shared/ReportModal', 'components/shared/FeatureDisabled',
    'components/home/DronWeatherWidget',
  ],
  '⚡ Fonctions Backend': [
    'functions/getSourceCode', 'functions/adminGetUsers', 'functions/adminUpdateUser',
    'functions/adminDeleteUser', 'functions/getPublicUsers', 'functions/emailNotification',
    'functions/sendWelcomeEmail', 'functions/sendQuoteConfirmation', 'functions/generateQuotePDF',
    'functions/createDonationPayment', 'functions/logDonation', 'functions/handleStripeWebhook',
    'functions/sendCertificationEmail', 'functions/createCertificationPayment',
    'functions/pushNotification', 'functions/addDonatorBadge', 'functions/sendBadgeAssignedEmail',
    'functions/requestAccountDeletion', 'functions/refuseDeletionRequest',
    'functions/sendDeletionEmail', 'functions/adminSendBroadcastEmail',
    'functions/sendVerificationCode', 'functions/verifyEmailCode',
  ],
};

const ALL_FILES = Object.values(FILE_TREE).flat();

export default function AdminPDGSpace() {
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ai');
  const [fileContents, setFileContents] = useState({}); // path -> content
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [search, setSearch] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expandedCats, setExpandedCats] = useState({ '📄 Core': true });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      const isTop = u?.role === 'owner' || u?.role === 'pdg_adjoint' ||
        PDG_EMAILS.includes(u?.email) || PDG_ADJOINT_EMAILS.includes(u?.email);
      setAuthorized(isTop);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fetchFile = async (path) => {
    if (fileContents[path]) {
      setSelectedFile(path);
      return;
    }
    setLoadingFile(true);
    setSelectedFile(path);
    try {
      // We use the base44 file reading API via a known pattern
      // Files are fetched from the app source
      const res = await fetch(`/src/${path}.jsx`).catch(() => null) ||
                  await fetch(`/src/${path}.js`).catch(() => null) ||
                  await fetch(`/src/${path}.json`).catch(() => null) ||
                  await fetch(`/src/${path}`).catch(() => null);
      if (res && res.ok) {
        const text = await res.text();
        setFileContents(prev => ({ ...prev, [path]: text }));
      } else {
        setFileContents(prev => ({ ...prev, [path]: `// Fichier: ${path}\n// Contenu non disponible en lecture directe depuis le navigateur.\n// Utilisez le téléchargement ZIP pour accéder au code source complet.` }));
      }
    } catch {
      setFileContents(prev => ({ ...prev, [path]: `// Fichier: ${path}\n// Contenu non disponible en lecture directe depuis le navigateur.` }));
    }
    setLoadingFile(false);
  };

  const downloadZip = async () => {
    setDownloadProgress('Initialisation...');
    try {
      const { default: JSZip } = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm');
      const zip = new JSZip();
      let done = 0;

      for (const path of ALL_FILES) {
        setDownloadProgress(`Chargement ${done + 1}/${ALL_FILES.length}: ${path}`);
        
        const extensions = ['.jsx', '.js', '.json', '.css', '.html', ''];
        let content = null;
        for (const ext of extensions) {
          try {
            const r = await fetch(`/src/${path}${ext}`);
            if (r.ok) {
              content = await r.text();
              break;
            }
          } catch {}
        }
        
        if (content) {
          zip.file(`brenne-aerial/${path}`, content);
        }
        done++;
      }

      setDownloadProgress('Génération du ZIP...');
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brenne-aerial-source-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('ZIP téléchargé avec succès !');
    } catch (err) {
      toast.error('Erreur lors de la génération du ZIP: ' + err.message);
    }
    setDownloadProgress(null);
  };

  const copyContent = () => {
    if (selectedFile && fileContents[selectedFile]) {
      navigator.clipboard.writeText(fileContents[selectedFile]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copié dans le presse-papiers');
    }
  };

  const filteredTree = Object.entries(FILE_TREE).reduce((acc, [cat, files]) => {
    const filtered = files.filter(f => !search || f.toLowerCase().includes(search.toLowerCase()));
    if (filtered.length) acc[cat] = filtered;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
          <Lock className="w-8 h-8 text-yellow-500" />
        </div>
        <h2 className="font-grotesk font-bold text-xl">Accès restreint</h2>
        <p className="font-inter text-sm text-muted-foreground text-center max-w-sm">
          Cet espace est réservé exclusivement au PDG et au PDG-Adjoint de Brenne Aerial.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#92400e,#d97706)', boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}>
              <Crown className="w-5 h-5 text-yellow-100" />
            </div>
            <div>
              <h1 className="font-grotesk font-bold text-2xl">Espace PDG</h1>
              <p className="font-inter text-sm text-muted-foreground">
                IA Super Admin · Code Source · Accès exclusif direction
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {downloadProgress ? (
              <div className="flex items-center gap-2 bg-secondary border border-border rounded-xl px-4 py-2">
                <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                <span className="font-mono text-xs text-primary max-w-[200px] truncate">{downloadProgress}</span>
              </div>
            ) : (
              <Button
                onClick={downloadZip}
                className="gap-2 font-grotesk font-semibold"
                style={{ background: 'linear-gradient(135deg,#92400e,#d97706)', color: '#fde68a' }}
              >
                <Download className="w-4 h-4" />
                Télécharger ZIP
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-grotesk font-semibold text-sm transition-all ${
              activeTab === 'ai'
                ? 'text-yellow-100'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
            style={activeTab === 'ai' ? { background: 'linear-gradient(135deg,#92400e,#d97706)', boxShadow: '0 0 16px rgba(245,158,11,0.3)' } : {}}
          >
            <Sparkles className="w-4 h-4" />
            NEXUS — IA Super Admin
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-grotesk font-semibold text-sm transition-all ${
              activeTab === 'code'
                ? 'bg-primary/10 border border-primary/30 text-primary'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Code className="w-4 h-4" />
            Code Source
          </button>
        </div>
      </div>

      {/* AI Tab */}
      {activeTab === 'ai' && (
        <PDGAIAgent />
      )}

      {/* Code Tab */}
      {activeTab === 'code' && (
      <div className="flex gap-4 flex-1 min-h-0" style={{ height: 'calc(100vh - 360px)' }}>
        {/* Left: file tree */}
        <div className="w-64 flex-shrink-0 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-secondary border-0"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {Object.entries(filteredTree).map(([cat, files]) => (
              <div key={cat}>
                <button
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-secondary text-left transition-colors"
                  onClick={() => setExpandedCats(p => ({ ...p, [cat]: !p[cat] }))}
                >
                  <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${expandedCats[cat] ? 'rotate-90' : ''}`} />
                  <span className="font-mono text-[11px] text-muted-foreground">{cat}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">{files.length}</span>
                </button>
                {expandedCats[cat] && (
                  <div className="ml-3 space-y-0.5">
                    {files.map(file => (
                      <button
                        key={file}
                        onClick={() => fetchFile(file)}
                        className={`w-full text-left flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-mono transition-colors truncate ${
                          selectedFile === file
                            ? 'bg-primary/15 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                      >
                        <FileCode className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{file.split('/').pop()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: code viewer */}
        <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden min-w-0">
          {selectedFile ? (
            <>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-primary" />
                  <span className="font-mono text-xs text-primary">{selectedFile}</span>
                </div>
                <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={copyContent}>
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copié' : 'Copier'}
                </Button>
              </div>
              <div className="flex-1 overflow-auto">
                {loadingFile ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <pre className="p-4 font-mono text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap break-all">
                    {fileContents[selectedFile] || '// Fichier vide ou non accessible'}
                  </pre>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Eye className="w-10 h-10 opacity-20" />
              <p className="font-inter text-sm">Sélectionnez un fichier pour afficher son code</p>
              <p className="font-mono text-xs opacity-60">{ALL_FILES.length} fichiers disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 flex items-start gap-2">
        <Lock className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
        <p className="font-inter text-xs text-muted-foreground">
          <span className="text-yellow-500 font-semibold">Accès confidentiel.</span> Ce panneau est visible uniquement par le PDG et le PDG-Adjoint.
        </p>
      </div>
      )}
    </div>
  );
}