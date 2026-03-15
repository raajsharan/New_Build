import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Server, Settings, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose, visiblePages }) => {
  const location = useLocation();
  const { user } = useAuth();

  const shouldShowPage = (page) => {
    if (!visiblePages) return true;
    return visiblePages.includes(page);
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
    { path: '/add-asset', label: 'Add Asset', icon: Server, page: 'asset_inventory' },
    { path: '/asset-inventory', label: 'View Assets', icon: Server, page: 'asset_inventory' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ path: '/inventory-config', label: 'Inventory Configuration', icon: Settings, page: 'inventory_configuration' });
    menuItems.push({ path: '/field-config', label: 'Field Configuration', icon: Settings, page: 'inventory_configuration' });
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 w-64 bg-gray-900 text-white h-screen transition-all lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">InfraIMMS</h1>
          <button onClick={onClose} className="lg:hidden p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          {menuItems.map((item) => {
            if (!shouldShowPage(item.page)) return null;

            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
