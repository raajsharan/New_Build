import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, Legend, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { dashboardService } from '../services/api';
import { Loader } from 'lucide-react';

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardService.getSummary();
      setSummary(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      </div>
    );
  }

  const vmVsPhysical = [
    { name: 'VMs', value: summary.vm_count },
    { name: 'Physical Servers', value: summary.physical_server_count },
  ];

  const patchingData = [
    { name: 'Auto Patching', value: summary.auto_patch_count },
    { name: 'Manual Patching', value: summary.manual_patch_count },
  ];

  const statusData = [
    { name: 'Alive', value: summary.alive_servers },
    { name: 'Powered Off', value: summary.powered_off_servers },
    { name: 'Not Alive', value: summary.not_alive_servers },
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  const StatCard = ({ label, value, icon: Icon }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && <Icon className="w-12 h-12 text-blue-600 opacity-20" />}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Infrastructure Dashboard</h1>
        <p className="text-gray-600">Real-time overview of your infrastructure assets</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Assets" value={summary.total_assets} />
        <StatCard label="ME Installed" value={summary.me_installed_count} />
        <StatCard label="Tenable Installed" value={summary.tenable_installed_count} />
        <StatCard label="Alive Servers" value={summary.alive_servers} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* VM vs Physical */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Asset Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vmVsPhysical}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#3B82F6" />
                <Cell fill="#6B7280" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Patching Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Patching Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={patchingData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#10B981" />
                <Cell fill="#F59E0B" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Server Status */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Server Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={statusData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Location Distribution */}
        {summary.location_distribution && summary.location_distribution.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Location-wise Server Count</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={summary.location_distribution}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">VM Count</p>
          <p className="text-2xl font-bold text-gray-900">{summary.vm_count}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Physical Servers</p>
          <p className="text-2xl font-bold text-gray-900">{summary.physical_server_count}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Auto Patching</p>
          <p className="text-2xl font-bold text-gray-900">{summary.auto_patch_count}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Manual Patching</p>
          <p className="text-2xl font-bold text-gray-900">{summary.manual_patch_count}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Powered Off</p>
          <p className="text-2xl font-bold text-yellow-600">{summary.powered_off_servers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Not Alive</p>
          <p className="text-2xl font-bold text-red-600">{summary.not_alive_servers}</p>
        </div>
      </div>
    </div>
  );
};
