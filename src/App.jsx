import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";

// Layout
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/admin/AdminLayout";

// Public pages
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import ServicesPage from "@/pages/ServicesPage";
import PortfolioPage from "@/pages/PortfolioPage";
import QuotePage from "@/pages/QuotePage";
import PlanningPage from "@/pages/PlanningPage";
import BlogPage from "@/pages/BlogPage";
import ContactPage from "@/pages/ContactPage";
import DashboardPage from "@/pages/DashboardPage";
import DiscoverPage from "@/pages/DiscoverPage";
import MessagesPage from "@/pages/MessagesPage";
import PrivacyPage from "@/pages/legal/PrivacyPage";
import TermsPage from "@/pages/legal/TermsPage";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminQuotes from "@/pages/admin/AdminQuotes";
import AdminAppointments from "@/pages/admin/AdminAppointments";
import AdminPortfolio from "@/pages/admin/AdminPortfolio";
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
import ProfilePage from "@/pages/ProfilePage";
import CertificationSuccessPage from "@/pages/CertificationSuccessPage";
import DonationPage from "@/pages/DonationPage";
import DonationSuccessPage from "@/pages/DonationSuccessPage";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="relative">
          <div className="w-10 h-10 border-2 border-muted border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border border-primary/40 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (authError?.type === "user_not_registered") return <UserNotRegisteredError />;
  if (authError?.type === "auth_required") { navigateToLogin(); return null; }

  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/planning" element={<PlanningPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/certification-success" element={<CertificationSuccessPage />} />
        <Route path="/donation" element={<DonationPage />} />
        <Route path="/donation-success" element={<DonationSuccessPage />} />
        <Route path="/legal/privacy" element={<PrivacyPage />} />
        <Route path="/legal/terms" element={<TermsPage />} />
      </Route>

      {/* Admin */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/quotes" element={<AdminQuotes />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/portfolio" element={<AdminPortfolio />} />
        <Route path="/admin/blog" element={<AdminBlog />} />
        <Route path="/admin/messaging" element={<AdminMessaging />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/clients" element={<AdminUsers />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/conversations" element={<AdminConversations />} />
        <Route path="/admin/maintenance" element={<AdminMaintenance />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/pages" element={<AdminPages />} />
        <Route path="/admin/badges" element={<AdminBadges />} />
        <Route path="/admin/emailing" element={<AdminEmailing />} />
        <Route path="/admin/pricing" element={<AdminPricing />} />
        <Route path="/admin/accounts" element={<AdminAccounts />} />
        <Route path="/admin/certifications" element={<AdminCertifications />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}