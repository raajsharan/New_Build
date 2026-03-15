import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { settingsService } from './services/api';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AddAssetPage } from './pages/AddAssetPage';
import { AssetInventoryPage } from './pages/AssetInventoryPage';
import { InventoryConfigPage } from './pages/InventoryConfigPage';
import { FieldConfigPage } from './pages/FieldConfigPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companySettings, setCompanySettings] = useState({
    name: 'Infrastructure Inventory',
    logo: 'https://via.placeholder.com/40'
  });
  const [visiblePages, setVisiblePages] = useState({
    dashboard: true,
    asset_inventory: true,
    inventory_configuration: false
  });

  useEffect(() => {
    if (user) {
      loadCompanySettings();
      loadUserVisiblePages();
    }
  }, [user]);

  const loadCompanySettings = async () => {
    try {
      const settings = await settingsService.getSettings();
      const data = settings.data;
      setCompanySettings({
        name: data.company_name || 'Infrastructure Inventory',
        logo: data.company_logo
      });
    } catch (err) {
      console.error(err);
    }
  };

  const loadUserVisiblePages = async () => {
    try {
      // Load from user object or local storage
      const pages = user?.visible_pages;
      if (pages) {
        if (typeof pages === 'string') {
          setVisiblePages(JSON.parse(pages));
        } else {
          setVisiblePages(pages);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        visiblePages={visiblePages}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          companyName={companySettings.name}
          companyLogo={companySettings.logo}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/add-asset" element={<AddAssetPage />} />
            <Route path="/asset-inventory" element={<AssetInventoryPage />} />
            {user?.role === 'admin' && (
              <>
                <Route path="/inventory-config" element={<InventoryConfigPage />} />
                <Route path="/field-config" element={<FieldConfigPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </>
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
