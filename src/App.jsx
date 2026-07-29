import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import PreferencesApplier from "@/components/settings/PreferencesApplier";
import NavigationSkeleton from "@/components/layout/NavigationSkeleton";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

// Layout
import PublicLayout from "@/components/layout/PublicLayout";
import SidebarLayout from "@/components/layout/SidebarLayout";
import AdminLayout from "@/components/admin/AdminLayout";

// Public pages
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import BlogPage from "@/pages/BlogPage";
import DashboardPage from "@/pages/DashboardPage";
import DiscoverPage from "@/pages/DiscoverPage";
import MessagesPage from "@/pages/MessagesPage";
import PrivacyPage from "@/pages/legal/PrivacyPage";
import TermsPage from "@/pages/legal/TermsPage";
import CookiePage from "@/pages/legal/CookiePage";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminBlog from "@/pages/admin/AdminBlog";
import AdminMessaging from "@/pages/admin/AdminMessaging";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminReports from "@/pages/admin/AdminReports";
import AdminConversations from "@/pages/admin/AdminConversations";
import AdminMaintenance from "@/pages/admin/AdminMaintenance";
import AdminAnnouncements from "@/pages/admin/AdminAnnouncements";
import AdminPages from "@/pages/admin/AdminPages";
import AdminBadges from "@/pages/admin/AdminBadges";
import AdminEmailing from "@/pages/admin/AdminEmailing";
import AdminPricing from "@/pages/admin/AdminPricing";
import AdminAccounts from "@/pages/admin/AdminAccounts";
import AdminCertifications from "@/pages/admin/AdminCertifications";
import AdminDonations from "@/pages/admin/AdminDonations";
import AdminStatus from "@/pages/admin/AdminStatus";
import AdminGovernance from "@/pages/admin/AdminGovernance";
import AdminEmployees from "@/pages/admin/AdminEmployees";
import AdminSiteConfig from "@/pages/admin/AdminSiteConfig";
import AdminPDGSpace from "@/pages/admin/AdminPDGSpace";
import AdminDataManager from "@/pages/admin/AdminDataManager";
import AdminBilling from "@/pages/admin/AdminBilling";
import AdminStats from "@/pages/admin/AdminStats";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminUpdates from "@/pages/admin/AdminUpdates";
import AdminSessions from "@/pages/admin/AdminSessions";
import AdminAuditLogs from "@/pages/admin/AdminAuditLogs";
import AdminForum from "@/pages/admin/AdminForum";
import AdminPortfolio from "@/pages/admin/AdminPortfolio";
import AdminAffiliations from "@/pages/admin/AdminAffiliations";
import AdminSampleProfiles from "@/pages/admin/AdminSampleProfiles";
import BlogArticlePage from "@/pages/BlogArticlePage";
import { Navigate } from "react-router-dom";
import UptimePage from "@/pages/UptimePage";
import ProfilePage from "@/pages/ProfilePage";
import CertificationSuccessPage from "@/pages/CertificationSuccessPage";
import DonationPage from "@/pages/DonationPage";
import DonationSuccessPage from "@/pages/DonationSuccessPage";
import AccountDeletionPage from "@/pages/AccountDeletionPage";
import ForumPage from "@/pages/ForumPage";
import DiscussionDetailPage from "@/pages/DiscussionDetailPage";
import PublicProfilePage from "@/pages/PublicProfilePage";
import EnorBiographyPage from "@/pages/EnorBiographyPage";
import EcosystemePage from "@/pages/EcosystemePage";
import BusinessSpacePage from "@/pages/BusinessSpacePage";
import PostDetailPage from "@/pages/PostDetailPage";
import PremiumPage from "@/pages/PremiumPage";
import NotificationsPage from "@/pages/NotificationsPage";
import CreatePostPage from "@/pages/CreatePostPage";
import SearchPage from "@/pages/SearchPage";
import SampleProfilePage from "@/pages/SampleProfilePage";
import PortfolioPage from "@/pages/PortfolioPage";
import DocumentationPage from "@/pages/DocumentationPage";
import DocumentationArticlePage from "@/pages/DocumentationArticlePage";
import UserSpacePage from "@/pages/UserSpacePage";
import BookmarksPage from "@/pages/BookmarksPage";

function ExternalRedirect({ to }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return null;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return <NavigationSkeleton />;
  }

  if (authError?.type === "user_not_registered") return <UserNotRegisteredError />;
  if (authError?.type === "auth_required") {
    // Allow public routes to render without auth (like TikTok/Instagram public profiles)
    const publicPaths = ['/', '/about', '/blog', '/discover', '/portfolio', '/forum', '/documentation',
      '/uptime', '/enor', '/legal', '/status', '/donation', '/user', '/s'];
    const currentPath = window.location.pathname;
    const isPublicPath = publicPaths.some(p => currentPath === p || currentPath.startsWith(p + '/'))
      || /^\/@?[a-zA-Z0-9_.-]+$/.test(currentPath); // public profile /@username or /username
    if (!isPublicPath) { navigateToLogin(); return null; }
  }

  return (
    <>
      <PwaInstallPrompt />
      {/* Apply user preferences globally */}
      <PreferencesApplier user={user} />
      
      <Routes>
      {/* Auth pages (outside PublicLayout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public — PublicLayout handles modals/maintenance, SidebarLayout adds sidebar */}
      <Route element={<PublicLayout />}>
        <Route element={<SidebarLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/certification-success" element={<CertificationSuccessPage />} />
          <Route path="/donation" element={<DonationPage />} />
          <Route path="/donation-success" element={<DonationSuccessPage />} />
          <Route path="/status" element={<ExternalRedirect to="https://status.eza.group" />} />
          <Route path="/uptime" element={<UptimePage />} />
          <Route path="/account-deletion" element={<AccountDeletionPage />} />
          <Route path="/legal/privacy" element={<PrivacyPage />} />
          <Route path="/legal/terms" element={<TermsPage />} />
          <Route path="/legal/cookies" element={<CookiePage />} />
          <Route path="/blog/:id" element={<BlogArticlePage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/forum/:id" element={<DiscussionDetailPage />} />
          <Route path="/enor" element={<EnorBiographyPage />} />
          <Route path="/ecosysteme" element={<EcosystemePage />} />
          <Route path="/business" element={<BusinessSpacePage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/create-post" element={<CreatePostPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/espace" element={<UserSpacePage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/s/:username" element={<SampleProfilePage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/documentation/:slug" element={<DocumentationArticlePage />} />
          {/* Profile catch-all route for /@username - must be last in public routes */}
          <Route path="/:pathUsername" element={<PublicProfilePage />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/blog" element={<AdminBlog />} />
        <Route path="/admin/messaging" element={<AdminMessaging />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/clients" element={<AdminUsers />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/conversations" element={<AdminConversations />} />
        <Route path="/admin/maintenance" element={<AdminMaintenance />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/pages" element={<AdminPages />} />
        <Route path="/admin/portfolio" element={<AdminPortfolio />} />
        <Route path="/admin/affiliations" element={<AdminAffiliations />} />
        <Route path="/admin/sample-profiles" element={<AdminSampleProfiles />} />
        <Route path="/admin/badges" element={<AdminBadges />} />
        <Route path="/admin/emailing" element={<AdminEmailing />} />
        <Route path="/admin/pricing" element={<AdminPricing />} />
        <Route path="/admin/accounts" element={<AdminAccounts />} />
        <Route path="/admin/certifications" element={<AdminCertifications />} />
        <Route path="/admin/donations" element={<AdminDonations />} />
        <Route path="/admin/status" element={<AdminStatus />} />
        <Route path="/admin/governance" element={<AdminGovernance />} />
        <Route path="/admin/employees" element={<AdminEmployees />} />
        <Route path="/admin/site-config" element={<AdminSiteConfig />} />
        <Route path="/admin/pdg" element={<AdminPDGSpace />} />
        <Route path="/admin/data-manager" element={<AdminDataManager />} />
        <Route path="/admin/sessions" element={<AdminSessions />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        <Route path="/admin/forum" element={<AdminForum />} />
        <Route path="/admin/updates" element={<AdminUpdates />} />
        <Route path="/admin/stats" element={<AdminStats />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/billing" element={<AdminBilling />} />

      </Route>

      <Route path="*" element={<PageNotFound />} />
            </Routes>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <LanguageProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Sonner
          theme="dark"
          toastOptions={{
            style: {
              background: "hsl(214 40% 7%)",
              border: "1px solid hsl(214 25% 14%)",
              color: "hsl(210 20% 94%)",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
            },
          }}
        />
        <Toaster />
      </QueryClientProvider>
      </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}