import React, { useState, useEffect } from 'react';
import { assetService, configService } from '../services/api';
import { Plus, Eye, EyeOff, Upload } from 'lucide-react';
import { downloadCSVTemplate } from '../utils/helpers';

// Simple CSV parser function
const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const values = lines[i].split(',').map(v => v.trim());
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    data.push(obj);
  }
  
  return data;
};

export const AddAssetPage = () => {
  const [formData, setFormData] = useState({
    vm_name: '',
    os_hostname: '',
    ip_address: '',
    asset_type_id: '',
    os_type_id: '',
    os_version: '',
    assigned_user: '',
    user_password: '',
    department_id: '',
    business_purpose: '',
    server_status_id: '',
    me_installed_status: false,
    tenable_installed_status: false,
    patching_schedule_id: '',
    patching_type_id: '',
    server_patch_type: '',
    location_id: '',
    additional_remarks: '',
    serial_no: '',
    idrac_enabled: false,
    idrac_ip: '',
    eol_status: '',
  });

  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [osVersions, setOsVersions] = useState([]);
  const [bulkImportFile, setBulkImportFile] = useState(null);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  useEffect(() => {
    if (formData.os_type_id && configs.os_versions) {
      const versions = configs.os_versions.filter(
        v => v.os_type_id == formData.os_type_id
      );
      setOsVersions(versions);
    }
  }, [formData.os_type_id, configs]);

  const loadConfigs = async () => {
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await assetService.createAsset(formData);
      setSuccess('Asset created successfully!');
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBulkImporting(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target.result;
        const results = parseCSV(csvText);
        const assets = results.filter(row => row.vm_name); // Filter empty rows
        await assetService.bulkImportAssets({ assets });
        setSuccess(`${assets.length} assets imported successfully!`);
        setBulkImportFile(null);
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to import assets');
      } finally {
        setBulkImporting(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read CSV file');
      setBulkImporting(false);
    };
    reader.readAsText(file);
  };

  const resetForm = () => {
    setFormData({
      vm_name: '',
      os_hostname: '',
      ip_address: '',
      asset_type_id: '',
      os_type_id: '',
      os_version: '',
      assigned_user: '',
      user_password: '',
      department_id: '',
      business_purpose: '',
      server_status_id: '',
      me_installed_status: false,
      tenable_installed_status: false,
      patching_schedule_id: '',
      patching_type_id: '',
      server_patch_type: '',
      location_id: '',
      additional_remarks: '',
      serial_no: '',
      idrac_enabled: false,
      idrac_ip: '',
      eol_status: '',
    });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Asset</h1>
        <p className="text-gray-600">Manually add infrastructure assets to inventory</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">×</button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="vm_name"
                placeholder="VM Name"
                value={formData.vm_name}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="text"
                name="os_hostname"
                placeholder="OS Hostname"
                value={formData.os_hostname}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="text"
                name="ip_address"
                placeholder="IP Address"
                value={formData.ip_address}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <select
                name="asset_type_id"
                value={formData.asset_type_id}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select Asset Type</option>
                {configs.asset_types && configs.asset_types.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>

              <select
                name="os_type_id"
                value={formData.os_type_id}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select OS Type</option>
                {configs.os_types && configs.os_types.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>

              <select
                name="os_version"
                value={formData.os_version}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select OS Version</option>
                {osVersions.map(item => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>

              <input
                type="text"
                name="assigned_user"
                placeholder="Assigned User"
                value={formData.assigned_user}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="user_password"
                  placeholder="User Password"
                  value={formData.user_password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select Department</option>
                {configs.departments && configs.departments.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>

              <input
                type="text"
                name="business_purpose"
                placeholder="Business Purpose"
                value={formData.business_purpose}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <select
                name="server_status_id"
                value={formData.server_status_id}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select Server Status</option>
                {configs.server_status && configs.server_status.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>

              <select
                name="server_patch_type"
                value={formData.server_patch_type}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select Server Patch Type</option>
                {configs.server_patch_types && configs.server_patch_types.map(item => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>

              <select
                name="patching_schedule_id"
                value={formData.patching_schedule_id}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select Patching Schedule</option>
                {configs.patching_schedule && configs.patching_schedule.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>

              <select
                name="patching_type_id"
                value={formData.patching_type_id}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select Patching Type</option>
                {configs.patching_type && configs.patching_type.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>

              <select
                name="location_id"
                value={formData.location_id}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select Location</option>
                {configs.locations && configs.locations.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>

              <input
                type="text"
                name="serial_no"
                placeholder="Serial Number"
                value={formData.serial_no}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <select
                name="eol_status"
                value={formData.eol_status}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select EOL Status</option>
                <option value="InSupport">InSupport</option>
                <option value="EOL">EOL</option>
                <option value="Decom">Decommissioned</option>
              </select>
            </div>

            <textarea
              name="additional_remarks"
              placeholder="Additional Remarks"
              value={formData.additional_remarks}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="me_installed_status"
                  checked={formData.me_installed_status}
                  onChange={handleChange}
                  className="rounded form-checkbox"
                />
                <span>ME Installed</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="tenable_installed_status"
                  checked={formData.tenable_installed_status}
                  onChange={handleChange}
                  className="rounded form-checkbox"
                />
                <span>Tenable Installed</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="idrac_enabled"
                  checked={formData.idrac_enabled}
                  onChange={handleChange}
                  className="rounded form-checkbox"
                />
                <span>IDRAC Enabled</span>
              </label>
            </div>

            {formData.idrac_enabled && (
              <input
                type="text"
                name="idrac_ip"
                placeholder="IDRAC IP Address"
                value={formData.idrac_ip}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {loading ? 'Creating...' : 'Add Asset'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>

        {/* Bulk Import */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Bulk Import</h3>
          <p className="text-sm text-gray-600 mb-4">
            Import multiple assets at once using CSV file upload
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <label className="block">
              <input
                type="file"
                accept=".csv"
                onChange={handleBulkImport}
                disabled={bulkImporting}
                className="hidden"
              />
              <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                Click to upload CSV
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              or drag and drop CSV file
            </p>
          </div>

          <button
            onClick={downloadCSVTemplate}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors mb-4"
          >
            Download CSV Template
          </button>

          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <p className="font-medium mb-2">CSV Format:</p>
            <ul className="list-disc list-inside text-xs space-y-1">
              <li>First row must contain column headers</li>
              <li>Required columns: vm_name, os_hostname, ip_address</li>
              <li>Use correct IDs for dropdown fields</li>
              <li>Boolean fields: true/false</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
