import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/layout/BottomNav';
import PullToRefresh from '@/components/PullToRefresh';
import ErrorBoundary from '@/components/ErrorBoundary';
import AnimatedRoutes from '@/components/AnimatedRoutes';
import { Skeleton } from '@/components/ui/skeleton';
import Landing from '@/pages/Landing';
import { ThemeProvider } from "@/lib/ThemeContext";

const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const Booking = lazy(() => import('@/pages/Booking'));
const MyBookings = lazy(() => import('@/pages/MyBookings'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const ManageServices = lazy(() => import('@/pages/ManageServices'));
const ManageClients = lazy(() => import('@/pages/ManageClients'));
const AdminStats = lazy(() => import('@/pages/AdminStats'));
const AdminSettings = lazy(() => import('@/pages/AdminSettings'));
const ManageStaff = lazy(() => import('@/pages/ManageStaff'));
const ManageSchedule = lazy(() => import('@/pages/ManageSchedule'));
const ManageHomeContent = lazy(() => import('@/pages/ManageHomeContent'));
const Profile = lazy(() => import('@/pages/Profile'));
//Auth boilerplate pages
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail'));

function RouteSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-28 sm:px-6">
      <Skeleton className="h-8 w-48" />
      <div className="mt-6 space-y-3">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  );
}

function App() {
  const handleRefresh = () => window.location.reload();
  return (
    <ThemeProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <TooltipProvider delayDuration={400} skipDelayDuration={200}>
        <ErrorBoundary>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <PullToRefresh onRefresh={handleRefresh}>
          <Suspense fallback={<RouteSkeleton />}>
          <AnimatedRoutes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
              <Route path="/prenota" element={<Booking />} />
              <Route path="/le-mie-prenotazioni" element={<MyBookings />} />
              <Route path="/profilo" element={<Profile />} />
              <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} requireAdmin />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/servizi" element={<ManageServices />} />
                <Route path="/admin/clienti" element={<ManageClients />} />
                <Route path="/admin/statistiche" element={<AdminStats />} />
                <Route path="/admin/impostazioni" element={<AdminSettings />} />
                <Route path="/admin/staff" element={<ManageStaff />} />
                <Route path="/admin/orari" element={<ManageSchedule />} />
                <Route path="/admin/contenuti" element={<ManageHomeContent />} />
              </Route>
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </AnimatedRoutes>
          </Suspense>
          </PullToRefresh>
          <BottomNav />
        </Router>
        </ErrorBoundary>
        <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App