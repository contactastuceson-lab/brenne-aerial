import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only owner/PDG and pdg_adjoint can access source code
    const PDG_EMAILS = ['enor.lefoulon@gmail.com'];
    const PDG_ADJOINT_EMAILS = [];
    const isTopMgmt = user.role === 'owner' || user.role === 'pdg_adjoint' ||
      PDG_EMAILS.includes(user.email) || PDG_ADJOINT_EMAILS.includes(user.email);

    if (!isTopMgmt) {
      return Response.json({ error: 'Forbidden: PDG/Adjoint access only' }, { status: 403 });
    }

    // Return metadata — the actual file list is fetched from Base44 file system API
    // We'll return a manifest of key project files
    const files = [
      // Pages
      'pages/HomePage', 'pages/AboutPage', 'pages/ServicesPage', 'pages/PortfolioPage',
      'pages/QuotePage', 'pages/PlanningPage', 'pages/BlogPage', 'pages/ContactPage',
      'pages/DashboardPage', 'pages/DiscoverPage', 'pages/MessagesPage', 'pages/ProfilePage',
      'pages/GaragePage', 'pages/QuoteCalculatorPage', 'pages/ReglementationPage',
      'pages/FlashDeliveryPage', 'pages/SimulateurVuePage', 'pages/ComparateurPage',
      'pages/StatusPage', 'pages/DonationPage', 'pages/DonationSuccessPage',
      'pages/CertificationSuccessPage',
      'pages/legal/PrivacyPage', 'pages/legal/TermsPage',
      // Admin pages
      'pages/admin/AdminDashboard', 'pages/admin/AdminQuotes', 'pages/admin/AdminAppointments',
      'pages/admin/AdminPortfolio', 'pages/admin/AdminBlog', 'pages/admin/AdminMessaging',
      'pages/admin/AdminUsers', 'pages/admin/AdminReports', 'pages/admin/AdminConversations',
      'pages/admin/AdminMaintenance', 'pages/admin/AdminAnnouncements', 'pages/admin/AdminPages',
      'pages/admin/AdminBadges', 'pages/admin/AdminEmailing', 'pages/admin/AdminPricing',
      'pages/admin/AdminAccounts', 'pages/admin/AdminCertifications', 'pages/admin/AdminDonations',
      'pages/admin/AdminStatus', 'pages/admin/AdminGovernance', 'pages/admin/AdminEmployees',
      'pages/admin/AdminSiteConfig',
      // Core
      'App.jsx', 'index.css', 'tailwind.config.js',
      // Lib
      'lib/roles.js', 'lib/employeeRoles.js', 'lib/AuthContext.jsx',
      // Key components
      'components/admin/AdminLayout', 'components/layout/PublicLayout',
      'components/layout/Navbar', 'components/layout/Footer',
    ];

    return Response.json({
      success: true,
      files,
      project_name: 'Brenne Aerial',
      generated_at: new Date().toISOString(),
      total_files: files.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});