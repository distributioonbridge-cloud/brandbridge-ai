import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { StripeModal } from './components/common/StripeModal';
import { LegalCaseModal } from './components/ai/LegalCaseModal';

import { LandingPage } from './pages/LandingPage';
import { SellerDashboard } from './pages/SellerDashboard';
import { BrandDashboard } from './pages/BrandDashboard';
import { BrandProtectionPage } from './pages/BrandProtectionPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { InventoryPage } from './pages/InventoryPage';
import { WarehousePage } from './pages/WarehousePage';
import { DistributorPage } from './pages/DistributorPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { PricingPage } from './pages/PricingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { RegisterPage } from './pages/RegisterPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('landing');

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage setActiveTab={setActiveTab} />;
      case 'seller-dashboard':
        return <SellerDashboard setActiveTab={setActiveTab} />;
      case 'brand-dashboard':
        return <BrandDashboard setActiveTab={setActiveTab} />;
      case 'brand-protection':
        return <BrandProtectionPage />;
      case 'marketplace':
        return <MarketplacePage />;
      case 'inventory':
        return <InventoryPage />;
      case 'warehouses':
        return <WarehousePage />;
      case 'distributors':
        return <DistributorPage />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'pricing':
        return <PricingPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'register':
        return <RegisterPage setActiveTab={setActiveTab} />;
      case 'settings':
        return <SettingsPage setActiveTab={setActiveTab} />;
      default:
        return <LandingPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0b0f19] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {renderCurrentView()}
      </main>
      <Footer />
      <StripeModal />
      <LegalCaseModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
