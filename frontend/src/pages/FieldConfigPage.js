import React, { useState, useEffect } from 'react';
import { configService, userService, settingsService } from '../services/api';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export const FieldConfigPage = () => {
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({
    name: '',
    type: 'textbox',
    options: '',
    required: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editField, setEditField] = useState(null);

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      setLoading(true);
      // Load from local storage or API
      const savedFields = localStorage.getItem('custom_asset_fields');
      if (savedFields) {
        setFields(JSON.parse(savedFields));
      }
    } catch (err) {
      setError('Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = (e) => {
    e.preventDefault();
    if (!newField.name.trim()) {
      setError('Field name is required');
      return;
    }

    const field = {
      id: Date.now(),
      ...newField,
      options: newField.type !== 'textbox' && newField.type !== 'password' 
        ? newField.options.split(',').map(opt => opt.trim()).filter(opt => opt)
        : []
    };

    const updatedFields = [...fields, field];
    setFields(updatedFields);
    localStorage.setItem('custom_asset_fields', JSON.stringify(updatedFields));
    setNewField({ name: '', type: 'textbox', options: '', required: false });
    setSuccess('Field added successfully');
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleDeleteField = (id) => {
    if (!window.confirm('Are you sure you want to delete this field?')) return;

    const updatedFields = fields.filter(f => f.id !== id);
    setFields(updatedFields);
    localStorage.setItem('custom_asset_fields', JSON.stringify(updatedFields));
    setSuccess('Field deleted successfully');
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleEditField = (field) => {
    setEditingId(field.id);
    setEditField({
      ...field,
      options: Array.isArray(field.options) ? field.options.join(', ') : field.options
    });
  };

  const handleSaveEdit = () => {
    if (!editField.name.trim()) {
      setError('Field name is required');
      return;
    }

    const updatedFields = fields.map(f => {
      if (f.id === editingId) {
        return {
          ...editField,
          options: editField.type !== 'textbox' && editField.type !== 'password'
            ? editField.options.split(',').map(opt => opt.trim()).filter(opt => opt)
            : []
        };
      }
      return f;
    });

    setFields(updatedFields);
    localStorage.setItem('custom_asset_fields', JSON.stringify(updatedFields));
    setEditingId(null);
    setEditField(null);
    setSuccess('Field updated successfully');
    setTimeout(() => setSuccess(null), 2000);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Custom Asset Fields</h1>
        <p className="text-gray-600">Add custom fields to asset inventory (Admin Only)</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Field Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Field</h3>
            <form onSubmit={handleAddField} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Name
                </label>
                <input
                  type="text"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  placeholder="e.g., Warranty Date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Type
                </label>
                <select
                  value={newField.type}
                  onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="textbox">Text Box</option>
                  <option value="password">Password</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="toggle">Toggle</option>
                </select>
              </div>

              {(newField.type === 'dropdown') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dropdown Options (comma-separated)
                  </label>
                  <textarea
                    value={newField.options}
                    onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                    placeholder="Option 1, Option 2, Option 3"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newField.required}
                  onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                  className="rounded form-checkbox"
                />
                <span className="text-sm font-medium text-gray-700">Required Field</span>
              </label>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </form>
          </div>
        </div>

        {/* Fields List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Custom Fields</h3>

            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No custom fields added yet. Create one to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map(field => (
                  <div key={field.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {editingId === field.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editField.name}
                          onChange={(e) => setEditField({ ...editField, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />

                        <select
                          value={editField.type}
                          onChange={(e) => setEditField({ ...editField, type: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="textbox">Text Box</option>
                          <option value="password">Password</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="toggle">Toggle</option>
                        </select>

                        {editField.type === 'dropdown' && (
                          <textarea
                            value={editField.options}
                            onChange={(e) => setEditField({ ...editField, options: e.target.value })}
                            placeholder="Option 1, Option 2, Option 3"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 bg-gray-400 text-white py-2 rounded-lg font-medium hover:bg-gray-500 transition-colors flex items-center justify-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{field.name}</p>
                          <p className="text-sm text-gray-500 capitalize">
                            Type: {field.type} {field.required && '• Required'}
                          </p>
                          {Array.isArray(field.options) && field.options.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                              Options: {field.options.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditField(field)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteField(field.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Custom fields will appear as additional columns in the asset inventory table and in the add/edit forms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
