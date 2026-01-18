import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { RelationshipsPage } from './pages/RelationshipsPage';
import { RelationshipDetailPage } from './pages/RelationshipDetailPage';
import { CheckinPage } from './pages/CheckinPage';
import { LegacyPage } from './pages/LegacyPage';
import { ObligationsPage } from './pages/ObligationsPage';
import { TrustedPersonPage } from './pages/TrustedPersonPage';
import { DemoPage } from './pages/DemoPage';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/relationships" element={<RelationshipsPage />} />
          <Route path="/relationships/:id" element={<RelationshipDetailPage />} />
          <Route path="/checkin" element={<CheckinPage />} />
          <Route path="/legacy" element={<LegacyPage />} />
          <Route path="/obligations" element={<ObligationsPage />} />
          <Route path="/obligations/trusted-person" element={<TrustedPersonPage />} />
          <Route path="/demo" element={<DemoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
