import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/context/LanguageContext';

// Public pages
import PublicLayout from '@/components/public/PublicLayout';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Services from '@/pages/Services';
import QuotePage from '@/pages/QuotePage';
import Hours from '@/pages/Hours';
import Planning from '@/pages/Planning';
import Dashboard from '@/pages/Dashboard';

// Admin pages
import AdminLayout from '@/components/admin/AdminLayout';
import AdminStats from '@/pages/admin/AdminStats';
import AdminQuotes from '@/pages/admin/AdminQuotes';
import AdminAppointments from '@/pages/admin/AdminAppointments';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminMessaging from '@/pages/admin/AdminMessaging';
import AdminHours from '@/pages/admin/AdminHours';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/hours" element={<Hours />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Admin routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminStats />} />
        <Route path="/admin/quotes" element={<AdminQuotes />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/messaging" element={<AdminMessaging />} />
        <Route path="/admin/hours" element={<AdminHours />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <LanguageProvider>
          <Router>
            <AuthenticatedApp />
          </Router>
          <SonnerToaster
            theme="dark"
            toastOptions={{
              style: {
                background: 'hsl(240 5% 7.5%)',
                border: '1px solid hsl(240 4% 16%)',
                color: 'hsl(0 0% 95%)',
                fontFamily: 'Inter, sans-serif',
              },
            }}
          />
          <Toaster />
        </LanguageProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App