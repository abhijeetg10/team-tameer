import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegistrationWizard } from './pages/RegistrationWizard';
import { SchoolDashboard } from './pages/SchoolDashboard';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SchoolDetailPage } from './pages/admin/SchoolDetailPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { EventSettingsPage } from './pages/admin/EventSettingsPage';

// Protected Route for School Users
const ProtectedSchoolRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Layout with standard Navbar & Footer for public / school pages
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar />
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public & School Pages */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <LandingPage />
              </PublicLayout>
            }
          />
          <Route
            path="/login"
            element={
              <PublicLayout>
                <LoginPage />
              </PublicLayout>
            }
          />
          <Route
            path="/register"
            element={
              <PublicLayout>
                <ProtectedSchoolRoute>
                  <RegistrationWizard />
                </ProtectedSchoolRoute>
              </PublicLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PublicLayout>
                <ProtectedSchoolRoute>
                  <SchoolDashboard />
                </ProtectedSchoolRoute>
              </PublicLayout>
            }
          />

          {/* Dedicated SaaS Admin Console */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="schools" element={<AdminDashboard />} />
            <Route path="school/:id" element={<SchoolDetailPage />} />
            <Route path="students" element={<AdminReportsPage />} />
            <Route path="mentors" element={<AdminReportsPage />} />
            <Route path="reviews" element={<AdminDashboard />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="settings" element={<EventSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
