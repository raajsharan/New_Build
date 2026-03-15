import React, { useState, useEffect } from 'react';
import { settingsService, userService } from '../services/api';
import { Save, Loader, Eye, EyeOff, Toggle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Settings states
  const [companyName, setCompanyName] = useState('Infrastructure Team');
  const [companyLogo, setCompanyLogo] = useState('https://via.placeholder.com/40');
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  // Database settings
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState('5432');
  const [dbName, setDbName] = useState('infrastructure_inventory');
  const [dbUser, setDbUser] = useState('postgres');
  const [dbPassword, setDbPassword] = useState('');
  const [showDbPassword, setShowDbPassword] = useState(false);

  // Users
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermission, setUserPermission] = useState('read_write');
  const [userVisiblePages, setUserVisiblePages] = useState({
    dashboard: true,
    asset_inventory: true,
    inventory_configuration: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await settingsService.getSettings();
      const settingsData = settings.data;

      if (settingsData.company_name) setCompanyName(settingsData.company_name);
      if (settingsData.company_logo) setCompanyLogo(settingsData.company_logo);
      if (settingsData.db_host) setDbHost(settingsData.db_host);
      if (settingsData.db_port) setDbPort(settingsData.db_port);
      if (settingsData.db_name) setDbName(settingsData.db_name);
      if (settingsData.db_user) setDbUser(settingsData.db_user);

      const pwdVisibility = await settingsService.getPasswordVisibility();
      setPasswordVisibility(pwdVisibility.data.password_visibility);

      // Load users
      const usersData = await userService.getUsers();
      setUsers(usersData.data);
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompanySettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await settingsService.updateCompanySettings({
        logoUrl: companyLogo,
        companyName: companyName
      });
      setSuccess('Company settings updated successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to save company settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDatabaseSettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await settingsService.updateDatabaseConfig({
        db_host: dbHost,
        db_port: parseInt(dbPort),
        db_name: dbName,
        db_user: dbUser,
        db_password: dbPassword
      });
      setSuccess('Database settings updated successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to save database settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePasswordVisibility = async (value) => {
    try {
      await settingsService.updatePasswordVisibility({ visible: value });
      setPasswordVisibility(value);
      setSuccess('Password visibility setting updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to update password visibility');
    }
  };

  const handleUpdateUserPermission = async (userId, permission) => {
    try {
      await userService.updateUserPermission(userId, { permission_level: permission });
      setUsers(users.map(u => u.id === userId ? { ...u, permission_level: permission } : u));
      setSuccess('User permission updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to update user permission');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          Access denied. Only administrators can access settings.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage system configuration and user permissions</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="text-red-700">×</button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="space-y-8">
        {/* Company Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Company Settings</h2>
          <form onSubmit={handleSaveCompanySettings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo URL
              </label>
              <input
                type="url"
                value={companyLogo}
                onChange={(e) => setCompanyLogo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {companyLogo && (
                <img src={companyLogo} alt="Company Logo" className="mt-3 h-12 w-12 rounded" />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Company Settings'}
            </button>
          </form>
        </div>

        {/* Database Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Database Connection</h2>
          <form onSubmit={handleSaveDatabaseSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Host
                </label>
                <input
                  type="text"
                  value={dbHost}
                  onChange={(e) => setDbHost(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Port
                </label>
                <input
                  type="number"
                  value={dbPort}
                  onChange={(e) => setDbPort(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Database Name
                </label>
                <input
                  type="text"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={dbUser}
                  onChange={(e) => setDbUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showDbPassword ? 'text' : 'password'}
                    value={dbPassword}
                    onChange={(e) => setDbPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDbPassword(!showDbPassword)}
                    className="absolute right-3 top-2.5 text-gray-600"
                  >
                    {showDbPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Database Settings'}
            </button>
          </form>
        </div>

        {/* Password Visibility */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Asset Password Visibility</h2>
          <p className="text-gray-600 mb-4">
            Toggle to show/hide passwords in the asset inventory table for all users
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleSavePasswordVisibility(!passwordVisibility)}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                passwordVisibility ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  passwordVisibility ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {passwordVisibility ? 'Passwords Visible' : 'Passwords Hidden'}
            </span>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">User Management</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Permission Level</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3 capitalize">{u.role}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.permission_level}
                        onChange={(e) => handleUpdateUserPermission(u.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="read_only">Read Only</option>
                        <option value="read_write">Read & Write</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleUpdateUserPermission(u.id, u.permission_level)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
