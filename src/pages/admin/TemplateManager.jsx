import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import supabase from '../../utils/supabaseClient';
import UnifiedHeader from '../../components/UnifiedHeader';
import HeaderSpacer from '../../components/HeaderSpacer';
import { uiConfig } from '../../styles/uiConfig';

const TemplateManager = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('field_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedTemplates, setSelectedTemplates] = useState(new Set());

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterAndSortTemplates();
  }, [templates, searchTerm, statusFilter, sortField, sortDirection]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('field_search_templates')
        .select('*')
        .order('field_name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTemplates = () => {
    let filtered = [...templates];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.field_name.toLowerCase().includes(search) ||
        t.search_template?.toLowerCase().includes(search) ||
        t.human_description?.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';

      if (sortField === 'updated_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredTemplates(filtered);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // OPTIMISTIC LOCKING: Only update if version hasn't changed
      const { data, error } = await supabase
        .from('field_search_templates')
        .update({
          search_template: editingTemplate.search_template,
          expected_format: editingTemplate.expected_format,
          human_description: editingTemplate.human_description,
          status: editingTemplate.status,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('field_name', editingTemplate.field_name)
        .eq('version', editingTemplate.version) // Check version for conflict detection
        .select();

      if (error) throw error;

      // Check if update was successful (no rows = version conflict)
      if (!data || data.length === 0) {
        toast.error('⚠️ Conflict! Another admin just saved this template. Reloading...');
        await loadTemplates();
        setEditingTemplate(null);
        return;
      }

      toast.success('Template updated successfully');
      setEditingTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedTemplates.size === 0) {
      toast.error('No templates selected');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const newStatus = action === 'activate' ? 'active' : 'archived';

      const { error } = await supabase
        .from('field_search_templates')
        .update({
          status: newStatus,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .in('field_name', Array.from(selectedTemplates));

      if (error) throw error;

      toast.success(`${selectedTemplates.size} templates ${action === 'activate' ? 'activated' : 'archived'}`);
      setSelectedTemplates(new Set());
      loadTemplates();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const toggleSelection = (fieldName) => {
    const newSelection = new Set(selectedTemplates);
    if (newSelection.has(fieldName)) {
      newSelection.delete(fieldName);
    } else {
      newSelection.add(fieldName);
    }
    setSelectedTemplates(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedTemplates.size === filteredTemplates.length) {
      setSelectedTemplates(new Set());
    } else {
      setSelectedTemplates(new Set(filteredTemplates.map(t => t.field_name)));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <>
        <UnifiedHeader />
        <HeaderSpacer />
        <div className="flex items-center justify-center h-screen">
          <div className={`text-lg ${uiConfig.colors.muted}`}>Loading templates...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <UnifiedHeader />
      <HeaderSpacer />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Template Manager</h1>
          <p className={`${uiConfig.colors.muted}`}>
            Manage field search templates for AI research and data population
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search field name, template..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-scout-orange-500 dark:bg-gray-700"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-scout-orange-500 dark:bg-gray-700"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Bulk Actions */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Bulk Actions ({selectedTemplates.size} selected)
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  disabled={selectedTemplates.size === 0}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  disabled={selectedTemplates.size === 0}
                  className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className={`text-sm ${uiConfig.colors.muted}`}>Total</div>
            <div className="text-2xl font-bold">{templates.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className={`text-sm ${uiConfig.colors.muted}`}>Active</div>
            <div className="text-2xl font-bold text-green-600">
              {templates.filter(t => t.status === 'active').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className={`text-sm ${uiConfig.colors.muted}`}>Archived</div>
            <div className="text-2xl font-bold text-gray-600">
              {templates.filter(t => t.status === 'archived').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className={`text-sm ${uiConfig.colors.muted}`}>Showing</div>
            <div className="text-2xl font-bold">{filteredTemplates.length}</div>
          </div>
        </div>

        {/* Templates Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.size === filteredTemplates.length && filteredTemplates.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th
                    onClick={() => handleSort('field_name')}
                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Field Name {sortField === 'field_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Template Preview
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('version')}
                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Ver {sortField === 'version' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('updated_at')}
                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Updated {sortField === 'updated_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTemplates.map((template) => (
                  <tr key={template.field_name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedTemplates.has(template.field_name)}
                        onChange={() => toggleSelection(template.field_name)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{template.field_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-sm ${uiConfig.colors.muted} truncate max-w-md`}>
                        {template.search_template || 'No template'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        template.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : template.status === 'archived'
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {template.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {template.version}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(template.updated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-scout-orange-500 hover:text-scout-orange-600 font-medium text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className={`${uiConfig.colors.muted}`}>
                {searchTerm || statusFilter !== 'all'
                  ? 'No templates match your filters'
                  : 'No templates found'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Edit Template</h2>

              <div className="space-y-4">
                {/* Field Name (read-only) */}
                <div>
                  <label className="block text-sm font-medium mb-2">Field Name</label>
                  <input
                    type="text"
                    value={editingTemplate.field_name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700"
                  />
                </div>

                {/* Search Template */}
                <div>
                  <label className="block text-sm font-medium mb-2">Search Template</label>
                  <textarea
                    value={editingTemplate.search_template || ''}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      search_template: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-scout-orange-500 dark:bg-gray-700"
                    placeholder="e.g., What is the {field} in {town_name}, {country}?"
                  />
                  <p className={`text-xs ${uiConfig.colors.muted} mt-1`}>
                    Use placeholders: {'{town_name}'}, {'{country}'}, {'{subdivision}'}
                  </p>
                </div>

                {/* Expected Format */}
                <div>
                  <label className="block text-sm font-medium mb-2">Expected Format</label>
                  <input
                    type="text"
                    value={editingTemplate.expected_format || ''}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      expected_format: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-scout-orange-500 dark:bg-gray-700"
                    placeholder="e.g., number, text, dropdown value"
                  />
                </div>

                {/* Human Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Human Description</label>
                  <textarea
                    value={editingTemplate.human_description || ''}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      human_description: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-scout-orange-500 dark:bg-gray-700"
                    placeholder="Description for admins to understand what this field captures"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={editingTemplate.status}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      status: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-scout-orange-500 dark:bg-gray-700"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                {/* Version Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className={uiConfig.colors.muted}>Version:</span>
                      <span className="ml-2 font-medium">{editingTemplate.version}</span>
                    </div>
                    <div>
                      <span className={uiConfig.colors.muted}>Last Updated:</span>
                      <span className="ml-2 font-medium">{formatDate(editingTemplate.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-scout-orange-500 text-white rounded-md hover:bg-scout-orange-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateManager;
