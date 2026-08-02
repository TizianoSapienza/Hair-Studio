import { Toaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import UserNotRegisteredError from './components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/layout/BottomNav';
import PullToRefresh from '@/components/PullToRefresh';
import ErrorBoundary from '@/components/ErrorBoundary';
import AnimatedRoutes from '@/components/AnimatedRoutes';
import Landing from '@/pages/Landing';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Booking from '@/pages/Booking';
import MyBookings from '@/pages/MyBookings';
import AdminDashboard from '@/pages/AdminDashboard';
import ManageServices from '@/pages/ManageServices';
import ManageClients from '@/pages/ManageClients';
import AdminStats from '@/pages/AdminStats';
import AdminSettings from '@/pages/AdminSettings';
import ManageStaff from '@/pages/ManageStaff';
import ManageSchedule from '@/pages/ManageSchedule';
import ManageHomeContent from '@/pages/ManageHomeContent';
import Profile from '@/pages/Profile';
// Auth boilerplate pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import { ThemeProvider } from "@/lib/ThemeContext";

function App() {
  const handleRefresh = () => window.location.reload();
  return (
    <ThemeProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <ErrorBoundary>
        <Router>
          <ScrollToTop />
          <PullToRefresh onRefresh={handleRefresh}>
          <AnimatedRoutes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
              <Route path="/prenota" element={<Booking />} />
              <Route path="/le-mie-prenotazioni" element={<MyBookings />} />
              <Route path="/profilo" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/servizi" element={<ManageServices />} />
              <Route path="/admin/clienti" element={<ManageClients />} />
              <Route path="/admin/statistiche" element={<AdminStats />} />
              <Route path="/admin/impostazioni" element={<AdminSettings />} />
              <Route path="/admin/staff" element={<ManageStaff />} />
              <Route path="/admin/orari" element={<ManageSchedule />} />
              <Route path="/admin/contenuti" element={<ManageHomeContent />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </AnimatedRoutes>
          </PullToRefresh>
          <BottomNav />
        </Router>
        </ErrorBoundary>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App