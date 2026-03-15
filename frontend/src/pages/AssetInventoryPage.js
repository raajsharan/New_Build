import React, { useState, useEffect } from 'react';
import { assetService, configService, settingsService } from '../services/api';
import { Edit2, Trash2, Search, ChevronDown, Eye, EyeOff, Loader } from 'lucide-react';
import { getStatusColor, getStatusDotColor } from '../utils/helpers';

export const AssetInventoryPage = () => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [configs, setConfigs] = useState({});
  const [osVersions, setOsVersions] = useState([]);
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssetType, setFilterAssetType] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortColumn, setSortColumn] = useState('vm_name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [searchTerm, filterLocation, filterDepartment, filterStatus, filterAssetType, page, pageSize]);

  useEffect(() => {
    loadPasswordVisibility();
  }, []);

  const loadPasswordVisibility = async () => {
    try {
      const response = await settingsService.getPasswordVisibility();
      setPasswordVisibility(response.data.password_visibility);
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    try {
      const tables = [
        'asset_types', 'os_types', 'departments', 'server_status',
        'patching_schedule', 'patching_type', 'locations', 'os_versions', 'server_patch_types'
      ];

      const data = {};
      for (const table of tables) {
        const response = await configService.getConfigData(table);
        data[table] = response.data;
      }
      setConfigs(data);
    } catch (err) {
      setError('Failed to load configuration data');
    }
  };

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await assetService.getAssets({
        search: searchTerm,
        location: filterLocation,
        department: filterDepartment,
        status: filterStatus,
        asset_type: filterAssetType,
        page,
        limit: pageSize
      });

      setAssets(response.data.data);
      setFilteredAssets(response.data.data);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (asset) => {
    setSelectedAsset(asset);
    setEditFormData({ ...asset });
    if (asset.os_type_id && configs.os_versions) {
      const versions = configs.os_versions.filter(v => v.os_type_id == asset.os_type_id);
      setOsVersions(versions);
    }
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;

    try {
      await assetService.deleteAsset(id);
      setAssets(assets.filter(a => a.id !== id));
      setFilteredAssets(filteredAssets.filter(a => a.id !== id));
    } catch (err) {
      setError('Failed to delete asset');
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'os_type_id') {
      const versions = configs.os_versions.filter(v => v.os_type_id == value);
      setOsVersions(versions);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await assetService.updateAsset(selectedAsset.id, editFormData);
      setAssets(assets.map(a => a.id === selectedAsset.id ? editFormData : a));
      setFilteredAssets(filteredAssets.map(a => a.id === selectedAsset.id ? editFormData : a));
      setShowEditModal(false);
      setError(null);
    } catch (err) {
      setError('Failed to update asset');
    } finally {
      setUpdating(false);
    }
  };

  if (loading && assets.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Asset Inventory</h1>
        <p className="text-gray-600">View and manage infrastructure assets</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="text-red-700">×</button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search hostname, IP, user..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={filterLocation}
            onChange={(e) => {
              setFilterLocation(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Locations</option>
            {configs.locations && configs.locations.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>

          <select
            value={filterDepartment}
            onChange={(e) => {
              setFilterDepartment(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Departments</option>
            {configs.departments && configs.departments.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Status</option>
            {configs.server_status && configs.server_status.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>

          <select
            value={filterAssetType}
            onChange={(e) => {
              setFilterAssetType(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Types</option>
            {configs.asset_types && configs.asset_types.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">VM Name</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">Hostname</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">IP Address</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">Asset Type</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">OS Type</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">User</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">Dept</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">ME</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">Tenable</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">Patch</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">Password</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(asset => (
              <tr key={asset.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{asset.vm_name}</td>
                <td className="px-4 py-3 text-sm">{asset.os_hostname}</td>
                <td className="px-4 py-3 text-sm font-mono text-xs">{asset.ip_address}</td>
                <td className="px-4 py-3 text-sm">{asset.asset_type_name}</td>
                <td className="px-4 py-3 text-sm">{asset.os_type_name}</td>
                <td className="px-4 py-3 text-sm">{asset.assigned_user}</td>
                <td className="px-4 py-3 text-sm">{asset.department_name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.server_status_name)}`}>
                    {asset.server_status_name}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{asset.me_installed_status ? '✓' : '✗'}</td>
                <td className="px-4 py-3 text-sm">{asset.tenable_installed_status ? '✓' : '✗'}</td>
                <td className="px-4 py-3 text-sm">{asset.patching_type_name}</td>
                <td className="px-4 py-3 text-sm">
                  {passwordVisibility ? (
                    <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">{asset.user_password || '-'}</span>
                  ) : (
                    <span className="text-gray-400">••••••</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(asset)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAssets.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No assets found. Try adjusting your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit Asset</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="vm_name"
                  value={editFormData.vm_name || ''}
                  onChange={handleEditChange}
                  placeholder="VM Name"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="text"
                  name="os_hostname"
                  value={editFormData.os_hostname || ''}
                  onChange={handleEditChange}
                  placeholder="OS Hostname"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="text"
                  name="ip_address"
                  value={editFormData.ip_address || ''}
                  onChange={handleEditChange}
                  placeholder="IP Address"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <select
                  name="asset_type_id"
                  value={editFormData.asset_type_id || ''}
                  onChange={handleEditChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select Asset Type</option>
                  {configs.asset_types && configs.asset_types.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>

                <select
                  name="os_type_id"
                  value={editFormData.os_type_id || ''}
                  onChange={handleEditChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select OS Type</option>
                  {configs.os_types && configs.os_types.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>

                <select
                  name="os_version"
                  value={editFormData.os_version || ''}
                  onChange={handleEditChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select OS Version</option>
                  {osVersions.map(item => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}
                </select>

                <input
                  type="text"
                  name="assigned_user"
                  value={editFormData.assigned_user || ''}
                  onChange={handleEditChange}
                  placeholder="Assigned User"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="user_password"
                    value={editFormData.user_password || ''}
                    onChange={handleEditChange}
                    placeholder="User Password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Additional fields */}
                <select
                  name="department_id"
                  value={editFormData.department_id || ''}
                  onChange={handleEditChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select Department</option>
                  {configs.departments && configs.departments.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>

                <select
                  name="server_status_id"
                  value={editFormData.server_status_id || ''}
                  onChange={handleEditChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select Server Status</option>
                  {configs.server_status && configs.server_status.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>

                <select
                  name="location_id"
                  value={editFormData.location_id || ''}
                  onChange={handleEditChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select Location</option>
                  {configs.locations && configs.locations.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Asset'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
