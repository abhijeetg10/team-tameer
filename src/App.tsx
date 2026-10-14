import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { SimpleRegistrationPage } from './pages/SimpleRegistrationPage';
import { SimpleAdminPage } from './pages/SimpleAdminPage';

// Standard clean layout with Navbar & Developer Credit Footer
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC]">
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
          {/* Main Website Landing Page with Event Highlights and Google Sign-In */}
          <Route
            path="/"
            element={
              <MainLayout>
                <LandingPage />
              </MainLayout>
            }
          />

          {/* School Registration Form (Protected by Google Sign-In) */}
          <Route
            path="/register"
            element={
              <MainLayout>
                <SimpleRegistrationPage />
              </MainLayout>
            }
          />

          {/* Clean Admin Page to View All Registrations and Download Documents */}
          <Route
            path="/admin"
            element={
              <MainLayout>
                <SimpleAdminPage />
              </MainLayout>
            }
          />

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
