import React, { useState, useEffect } from 'react';
import { configService } from '../services/api';
import { Plus, Edit2, Trash2, Loader } from 'lucide-react';

export const InventoryConfigPage = () => {
  const [activeTable, setActiveTable] = useState('asset_types');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [configs, setConfigs] = useState({});
  const [selectedOsType, setSelectedOsType] = useState('');

  const tables = [
    'asset_types',
    'os_types',
    'os_versions',
    'departments',
    'server_status',
    'patching_schedule',
    'patching_type',
    'server_patch_types',
    'locations'
  ];

  useEffect(() => {
    loadConfigs();
  }, []);

  useEffect(() => {
    loadItems();
  }, [activeTable]);

  const loadConfigs = async () => {
    try {
      const data = {};
      for (const table of tables) {
        try {
          const response = await configService.getConfigData(table);
          data[table] = response.data;
        } catch (err) {
          console.error(`Failed to load ${table}:`, err);
        }
      }
      setConfigs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await configService.getConfigData(activeTable);
      setItems(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load configuration items');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      const data = activeTable === 'os_versions'
        ? { name: newItemName, parent_id: selectedOsType }
        : { name: newItemName };

      const response = await configService.addConfigData(activeTable, data);
      setItems([...items, response.data.data]);
      setNewItemName('');
      setSelectedOsType('');
      setSuccess('Item added successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to add item');
    }
  };

  const handleUpdate = async (id) => {
    if (!editingName.trim()) return;

    try {
      const data = activeTable === 'os_versions'
        ? { name: editingName, parent_id: selectedOsType }
        : { name: editingName };

      const response = await configService.updateConfigData(activeTable, id, data);
      setItems(items.map(item => item.id === id ? response.data.data : item));
      setEditingId(null);
      setEditingName('');
      setSelectedOsType('');
      setSuccess('Item updated successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to update item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await configService.deleteConfigData(activeTable, id);
      setItems(items.filter(item => item.id !== id));
      setSuccess('Item deleted successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditingName(item.name);
    if (item.os_type_id) {
      setSelectedOsType(item.os_type_id);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Configuration</h1>
        <p className="text-gray-600">Manage dropdown values used throughout the system</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <nav className="space-y-1 p-4">
              {tables.map(table => (
                <button
                  key={table}
                  onClick={() => {
                    setActiveTable(table);
                    setEditingId(null);
                    setNewItemName('');
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTable === table
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {table.replace(/_/g, ' ').toUpperCase()}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6 capitalize">
              {activeTable.replace(/_/g, ' ')}
            </h2>

            {/* Add Form */}
            <form onSubmit={handleAdd} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-3">
                {activeTable === 'os_versions' && (
                  <select
                    value={selectedOsType}
                    onChange={(e) => setSelectedOsType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Select OS Type</option>
                    {configs.os_types && configs.os_types.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder={`Add new ${activeTable.replace(/_/g, ' ')}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </form>

            {/* Items List */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    {editingId === item.id ? (
                      <div className="flex-1 flex gap-2">
                        {activeTable === 'os_versions' && (
                          <select
                            value={selectedOsType}
                            onChange={(e) => setSelectedOsType(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                          >
                            <option value="">Select OS Type</option>
                            {configs.os_types && configs.os_types.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        )}
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                        />
                        <button
                          onClick={() => handleUpdate(item.id)}
                          className="bg-green-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-400 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-500 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {activeTable === 'os_versions' && item.os_type_id && (
                            <p className="text-xs text-gray-500">
                              OS Type ID: {item.os_type_id}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No items found. Add one to get started.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
