import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';

// Import pages and components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Navbar from './components/Navbar';
import StatsPage from './pages/StatsPage';
import VisualizerPage from './pages/VisualizerPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import Footer from './components/Footer';

function App() {
  const { user } = useAuthContext();
  const savedTheme = localStorage.getItem('dreamTheme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  return (
    <div className="App">
      <BrowserRouter basename={process.env.PUBLIC_URL || ''}>
        <Navbar />
        <div className="pages">
          <Routes>
            {/* Public Interactive Visualizer */}
            <Route 
              path="/visualizer" 
              element={<VisualizerPage />} 
            />

            {/* Main Journal Archive Route (supports cloud accounts and local browser mode) */}
            <Route 
              path="/journal" 
              element={<HomePage />} 
            />
            <Route 
              path="/" 
              element={user ? <HomePage /> : <Navigate to="/visualizer" replace />} 
            />

            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={!user ? <LoginPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/signup" 
              element={!user ? <SignupPage /> : <Navigate to="/" replace />} 
            />

            {/* Dream Analytics Route */}
            <Route 
              path="/stats" 
              element={<StatsPage />} 
            />

            {/* Mandatory Trust & Transparency Routes */}
            <Route 
              path="/about" 
              element={<AboutPage />} 
            />
            <Route 
              path="/contact" 
              element={<ContactPage />} 
            />
            <Route 
              path="/privacy" 
              element={<PrivacyPolicyPage />} 
            />
            <Route 
              path="/terms" 
              element={<TermsPage />} 
            />

            {/* Fallback route */}
            <Route 
              path="*" 
              element={<Navigate to="/visualizer" replace />} 
            />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
