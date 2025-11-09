import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';
import toast from 'react-hot-toast';
import UnifiedHeader from '../../components/UnifiedHeader';
import HeaderSpacer from '../../components/HeaderSpacer';
import { uiConfig } from '../../styles/uiConfig';
import { Plus, Edit2, Trash2, Save, X, ChevronUp, ChevronDown, Eye, EyeOff, MapPin, Search, Sparkles } from 'lucide-react';
import Anthropic from '@anthropic-ai/sdk';

const RegionManager = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inspirations, setInspirations] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingInspiration, setEditingInspiration] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [allTowns, setAllTowns] = useState([]);
  const [townSearch, setTownSearch] = useState('');
  const [townFeatureFilter, setTownFeatureFilter] = useState('all'); // 'all', 'coastal', 'island', 'mountain', etc.
  const [countryFilter, setCountryFilter] = useState(''); // Auto-detected from region_name

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

  // AI matching state
  const [aiMatching, setAiMatching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  // New inspiration form data
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    region_name: '',
    image_url: '',
    link: '',
    typical_town_examples: [],
    is_active: true,
    display_order: 0
  });

  // Check admin access
  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('admin_role')
        .eq('id', user.id)
        .single();

      if (error || !['town_manager', 'executive_admin'].includes(userData?.admin_role)) {
        toast.error('Access denied. Admin only.');
        navigate('/admin');
        return;
      }

      setIsAdmin(true);
      loadInspirations();
      loadTowns();
    };

    checkAccess();
  }, [navigate]);

  // Auto-detect country from region_name and set country filter
  useEffect(() => {
    const detectCountry = (regionName) => {
      if (!regionName) return '';

      const name = regionName.toLowerCase();

      // Country mappings
      const countryMap = {
        'turkey': 'Turkey',
        'turkish': 'Turkey',
        'spain': 'Spain',
        'spanish': 'Spain',
        'portugal': 'Portugal',
        'portuguese': 'Portugal',
        'italy': 'Italy',
        'italian': 'Italy',
        'france': 'France',
        'french': 'France',
        'greece': 'Greece',
        'greek': 'Greece',
        'croatia': 'Croatia',
        'croatian': 'Croatia',
        'montenegro': 'Montenegro',
        'albania': 'Albania',
        'albanian': 'Albania',
        'malta': 'Malta',
        'cyprus': 'Cyprus',
        'mexico': 'Mexico',
        'mexican': 'Mexico',
        'thailand': 'Thailand',
        'thai': 'Thailand',
        'vietnam': 'Vietnam',
        'vietnamese': 'Vietnam',
        'bali': 'Indonesia',
        'indonesia': 'Indonesia',
        'malaysia': 'Malaysia',
        'philippines': 'Philippines',
        'filipino': 'Philippines'
      };

      for (const [keyword, country] of Object.entries(countryMap)) {
        if (name.includes(keyword)) {
          return country;
        }
      }

      return ''; // No country detected - show all
    };

    // Detect country when editing or creating
    const regionName = editingInspiration?.region_name || formData.region_name;
    const detected = detectCountry(regionName);
    setCountryFilter(detected);
  }, [editingInspiration?.region_name, formData.region_name]);

  const loadInspirations = async () => {
    const { data, error } = await supabase
      .from('regional_inspirations')
      .select('*')
      .order('display_order');

    if (error) {
      console.error('Error loading inspirations:', error);
      toast.error('Failed to load inspirations');
    } else {
      setInspirations(data || []);
    }
    setLoading(false);
  };

  const loadTowns = async () => {
    // Try with is_published first, fallback if column doesn't exist yet
    let query = supabase
      .from('towns')
      .select('id, town_name, country, region, geographic_features_actual, regions, is_published, image_url_1')
      .not('image_url_1', 'is', null)
      .not('image_url_1', 'eq', '')
      .not('image_url_1', 'ilike', 'NULL')
      .not('image_url_1', 'eq', 'null')
      .order('town_name');

    const { data, error } = await query;

    if (error) {
      // If is_published column doesn't exist yet, retry without it
      if (error.code === '42703' || error.message?.includes('is_published')) {
        console.warn('is_published column not found, falling back to query without it');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('towns')
          .select('id, town_name, country, region, geographic_features_actual, regions, image_url_1')
          .not('image_url_1', 'is', null)
          .not('image_url_1', 'eq', '')
          .not('image_url_1', 'ilike', 'NULL')
          .not('image_url_1', 'eq', 'null')
          .order('town_name');

        if (fallbackError) {
          console.error('Error loading towns:', fallbackError);
        } else {
          // Add default is_published = true for towns without the column
          setAllTowns((fallbackData || []).map(t => ({ ...t, is_published: true })));
        }
      } else {
        console.error('Error loading towns:', error);
      }
    } else {
      setAllTowns(data || []);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.region_name) {
      toast.error('Title and region name are required');
      return;
    }

    const { error } = await supabase
      .from('regional_inspirations')
      .insert([{
        ...formData,
        display_order: inspirations.length
      }]);

    if (error) {
      console.error('Error creating inspiration:', error);
      toast.error('Failed to create inspiration');
    } else {
      toast.success('Inspiration created!');
      setShowCreateForm(false);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        region_name: '',
        image_url: '',
        link: '',
        typical_town_examples: [],
        is_active: true,
        display_order: 0
      });
      loadInspirations();
    }
  };

  const handleUpdate = async (id, updates) => {
    const { error } = await supabase
      .from('regional_inspirations')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating inspiration:', error);
      toast.error('Failed to update inspiration');
    } else {
      toast.success('Inspiration updated!');
      loadInspirations();
      setEditingInspiration(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this inspiration?')) return;

    const { error } = await supabase
      .from('regional_inspirations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting inspiration:', error);
      toast.error('Failed to delete inspiration');
    } else {
      toast.success('Inspiration deleted!');
      loadInspirations();
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    const { error } = await supabase
      .from('regional_inspirations')
      .update({ is_active: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating inspiration:', error);
      toast.error('Failed to update inspiration');
    } else {
      toast.success(
        newStatus
          ? '✅ Inspiration published - now visible on Daily page'
          : '⚠️ Inspiration unpublished - hidden from users'
      );
      loadInspirations();
    }
  };

  const handleReorder = async (id, direction) => {
    // Disable reordering when filtering is active
    if (searchQuery || statusFilter !== 'all') {
      toast.error('Clear search and filters to reorder');
      return;
    }

    const index = inspirations.findIndex(i => i.id === id);
    if (index === -1) return;

    const newOrder = [...inspirations];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= newOrder.length) return;

    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];

    // Update display_order for both items
    const updates = newOrder.map((item, idx) => ({
      id: item.id,
      display_order: idx
    }));

    for (const update of updates) {
      await supabase
        .from('regional_inspirations')
        .update({ display_order: update.display_order })
        .eq('id', update.id);
    }

    loadInspirations();
  };

  const toggleTownSelection = (townName) => {
    const current = editingInspiration?.typical_town_examples || formData.typical_town_examples || [];
    const newSelection = current.includes(townName)
      ? current.filter(t => t !== townName)
      : [...current, townName];

    if (editingInspiration) {
      setEditingInspiration({
        ...editingInspiration,
        typical_town_examples: newSelection
      });
    } else {
      setFormData({
        ...formData,
        typical_town_examples: newSelection
      });
    }
  };

  // Handle publish/unpublish toggle for towns
  const handleTogglePublish = async (e, town) => {
    e.stopPropagation(); // Prevent checkbox toggle
    if (!town) return;

    const newPublishedState = !town.is_published;
    const actionText = newPublishedState ? 'Publishing' : 'Unpublishing';

    try {
      toast.loading(`${actionText} ${town.town_name}...`, { id: 'publish-toggle' });

      // Get current user for tracking
      const { data: { user } } = await supabase.auth.getUser();

      // Update database
      const { error } = await supabase
        .from('towns')
        .update({
          is_published: newPublishedState,
          published_at: newPublishedState ? new Date().toISOString() : null,
          published_by: newPublishedState ? user?.id : null
        })
        .eq('id', town.id);

      if (error) throw error;

      // Update local state
      setAllTowns(prevTowns =>
        prevTowns.map(t =>
          t.id === town.id
            ? { ...t, is_published: newPublishedState }
            : t
        )
      );

      toast.success(
        newPublishedState
          ? `✅ ${town.town_name} is now PUBLISHED`
          : `⚠️ ${town.town_name} is now UNPUBLISHED`,
        { id: 'publish-toggle' }
      );
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error(`Failed to ${actionText.toLowerCase()}: ${error.message}`, { id: 'publish-toggle' });
    }
  };

  const handleAiMatch = async () => {
    const data = editingInspiration || formData;

    if (!data.title && !data.subtitle && !data.description) {
      toast.error('Add title, subtitle, or description first');
      return;
    }

    setAiMatching(true);
    setAiSuggestions([]);

    try {
      // Initialize Anthropic client
      const anthropic = new Anthropic({
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
        dangerouslyAllowBrowser: true // Required for client-side usage
      });

      // Create prompt for Claude
      const prompt = `Analyze this regional inspiration and identify which towns from the list would be the best match.

Inspiration:
Title: ${data.title || 'N/A'}
Subtitle: ${data.subtitle || 'N/A'}
Description: ${data.description || 'N/A'}

Available towns (with features):
${allTowns.slice(0, 50).map(town =>
  `${town.town_name}, ${town.country} - Features: ${town.geographic_features_actual || 'unknown'}, Regions: ${Array.isArray(town.regions) ? town.regions.join(', ') : 'unknown'}`
).join('\n')}

Return ONLY a JSON array of town names that best match this inspiration, maximum 10 towns. Consider geographic features, location characteristics, and the theme described. Format: ["Town1", "Town2", ...]`;

      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      // Parse Claude's response
      const responseText = message.content[0].text;
      const jsonMatch = responseText.match(/\[.*\]/s);

      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        setAiSuggestions(suggestions);
        toast.success(`AI suggested ${suggestions.length} matching towns`);
      } else {
        toast.error('Could not parse AI response');
      }
    } catch (error) {
      console.error('AI matching error:', error);
      toast.error('AI matching failed: ' + (error.message || 'Unknown error'));
    } finally {
      setAiMatching(false);
    }
  };

  const applyAiSuggestions = () => {
    const current = editingInspiration?.typical_town_examples || formData.typical_town_examples || [];
    const newSelection = [...new Set([...current, ...aiSuggestions])]; // Merge and dedupe

    if (editingInspiration) {
      setEditingInspiration({
        ...editingInspiration,
        typical_town_examples: newSelection
      });
    } else {
      setFormData({
        ...formData,
        typical_town_examples: newSelection
      });
    }

    toast.success(`Added ${aiSuggestions.length} AI-suggested towns`);
    setAiSuggestions([]);
  };

  const filteredTowns = allTowns.filter(town => {
    // Search filter
    const matchesSearch = !townSearch ||
      town.town_name.toLowerCase().includes(townSearch.toLowerCase()) ||
      town.country.toLowerCase().includes(townSearch.toLowerCase());

    if (!matchesSearch) return false;

    // Country filter (auto-detected from region name)
    if (countryFilter && town.country !== countryFilter) return false;

    // Feature filter
    if (townFeatureFilter === 'all') return true;

    // Handle geographic_features_actual as either array or string
    const features = Array.isArray(town.geographic_features_actual)
      ? town.geographic_features_actual.map(f => f.toLowerCase())
      : (town.geographic_features_actual?.toLowerCase() || '');
    const regions = Array.isArray(town.regions) ? town.regions.map(r => r.toLowerCase()) : [];

    // Helper function to check if a feature exists in either array or string
    const hasFeature = (feature) => {
      if (Array.isArray(features)) {
        return features.some(f => f.includes(feature));
      }
      return features.includes(feature);
    };

    switch (townFeatureFilter) {
      case 'coastal':
        return hasFeature('coastal') || regions.includes('coastal');
      case 'island':
        return hasFeature('island') || regions.includes('island');
      case 'mountain':
        return hasFeature('mountain') || hasFeature('highland') || regions.includes('mountain');
      case 'valley':
        return hasFeature('valley') || hasFeature('plain');
      case 'lake':
        return hasFeature('lake') || hasFeature('river');
      default:
        return true;
    }
  });

  // Filter inspirations based on search query and status
  const filteredInspirations = inspirations.filter(inspiration => {
    // Status filter
    if (statusFilter === 'active' && !inspiration.is_active) return false;
    if (statusFilter === 'inactive' && inspiration.is_active) return false;

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = inspiration.title?.toLowerCase().includes(query);
      const matchesRegion = inspiration.region_name?.toLowerCase().includes(query);
      const matchesSubtitle = inspiration.subtitle?.toLowerCase().includes(query);
      const matchesDescription = inspiration.description?.toLowerCase().includes(query);

      return matchesTitle || matchesRegion || matchesSubtitle || matchesDescription;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <UnifiedHeader
        title="Region Manager"
        subtitle="Manage Today's Inspiration sections"
      />
      <HeaderSpacer hasFilters={false} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Regional Inspirations ({inspirations.length})
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage the rotating "Today's Inspiration" cards shown on the Daily page
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-scout-accent-600 text-white rounded-lg hover:bg-scout-accent-700 transition-colors"
          >
            {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreateForm ? 'Cancel' : 'Create New'}
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, region, subtitle, or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-scout-accent-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-scout-accent-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All ({inspirations.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-scout-accent-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Active ({inspirations.filter(i => i.is_active).length})
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === 'inactive'
                    ? 'bg-scout-accent-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Inactive ({inspirations.filter(i => !i.is_active).length})
              </button>
            </div>
          </div>

          {/* Results count */}
          {(searchQuery || statusFilter !== 'all') && (
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredInspirations.length} of {inspirations.length} inspirations
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Inspiration</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Turkish coastal charm?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Region Name *
                </label>
                <input
                  type="text"
                  value={formData.region_name}
                  onChange={(e) => setFormData({ ...formData, region_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Turkish Coast"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., East meets West, Mediterranean sunshine"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe this region..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="/discover"
                />
              </div>
            </div>

            {/* Town Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Featured Towns ({formData.typical_town_examples?.length || 0}) - Showing {filteredTowns.length}
                  {countryFilter && (
                    <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      🌍 Filtered to {countryFilter}
                    </span>
                  )}
                </label>
                {countryFilter && (
                  <button
                    type="button"
                    onClick={() => setCountryFilter('')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Show All Countries
                  </button>
                )}
              </div>

              {/* Feature Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { value: 'all', label: 'All', emoji: '🌍' },
                  { value: 'coastal', label: 'Coastal', emoji: '🏖️' },
                  { value: 'island', label: 'Island', emoji: '🏝️' },
                  { value: 'mountain', label: 'Mountain', emoji: '⛰️' },
                  { value: 'valley', label: 'Valley', emoji: '🏞️' },
                  { value: 'lake', label: 'Lake/River', emoji: '🌊' }
                ].map(filter => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setTownFeatureFilter(filter.value)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      townFeatureFilter === filter.value
                        ? 'bg-scout-accent-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {filter.emoji} {filter.label}
                  </button>
                ))}
              </div>

              {/* AI Match Button */}
              <div className="mb-3">
                <button
                  type="button"
                  onClick={handleAiMatch}
                  disabled={aiMatching}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {aiMatching ? 'AI Analyzing...' : '🤖 AI Match Towns'}
                </button>
              </div>

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      AI Suggestions ({aiSuggestions.length})
                    </p>
                    <button
                      type="button"
                      onClick={applyAiSuggestions}
                      className="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Add All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {aiSuggestions.map((town, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-white dark:bg-gray-800 text-purple-900 dark:text-purple-100 rounded border border-purple-200 dark:border-purple-700"
                      >
                        {town}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <input
                type="text"
                value={townSearch}
                onChange={(e) => setTownSearch(e.target.value)}
                placeholder="Search towns..."
                className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700">
                {filteredTowns.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                    No {townFeatureFilter !== 'all' ? townFeatureFilter : ''} towns found
                  </p>
                ) : (
                  filteredTowns.slice(0, 20).map(town => (
                  <div key={town.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={(formData.typical_town_examples || []).includes(town.town_name)}
                        onChange={() => toggleTownSelection(town.town_name)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {town.town_name}, {town.country}
                      </span>
                    </label>
                    {/* Publish/Unpublish Toggle */}
                    <button
                      onClick={(e) => handleTogglePublish(e, town)}
                      className={`
                        relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 flex-shrink-0
                        ${town.is_published ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}
                      `}
                      title={town.is_published ? 'Published - Click to unpublish' : 'Unpublished - Click to publish'}
                    >
                      <span
                        className={`
                          inline-block w-3 h-3 transform rounded-full bg-white transition-transform
                          ${town.is_published ? 'translate-x-5' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-scout-accent-600 text-white rounded-lg hover:bg-scout-accent-700"
              >
                <Save className="w-4 h-4" />
                Create Inspiration
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Inspirations List */}
        <div className="space-y-4">
          {inspirations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No inspirations yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-scout-accent-600 text-white rounded-lg hover:bg-scout-accent-700"
              >
                Create Your First Inspiration
              </button>
            </div>
          ) : filteredInspirations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No inspirations match your search</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Try different keywords or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredInspirations.map((inspiration, index) => (
              <div
                key={inspiration.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${
                  !inspiration.is_active ? 'opacity-60' : ''
                }`}
              >
                {editingInspiration?.id === inspiration.id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input
                          type="text"
                          value={editingInspiration.title}
                          onChange={(e) => setEditingInspiration({ ...editingInspiration, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region Name</label>
                        <input
                          type="text"
                          value={editingInspiration.region_name}
                          onChange={(e) => setEditingInspiration({ ...editingInspiration, region_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={editingInspiration.subtitle || ''}
                        onChange={(e) => setEditingInspiration({ ...editingInspiration, subtitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <textarea
                        value={editingInspiration.description || ''}
                        onChange={(e) => setEditingInspiration({ ...editingInspiration, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Town Selector for Edit */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Featured Towns ({editingInspiration.typical_town_examples?.length || 0}) - Showing {filteredTowns.length}
                          {countryFilter && (
                            <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                              🌍 Filtered to {countryFilter}
                            </span>
                          )}
                        </label>
                        {countryFilter && (
                          <button
                            onClick={() => setCountryFilter('')}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Show All Countries
                          </button>
                        )}
                      </div>

                      {/* Feature Filter Buttons */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {[
                          { value: 'all', label: 'All', emoji: '🌍' },
                          { value: 'coastal', label: 'Coastal', emoji: '🏖️' },
                          { value: 'island', label: 'Island', emoji: '🏝️' },
                          { value: 'mountain', label: 'Mountain', emoji: '⛰️' },
                          { value: 'valley', label: 'Valley', emoji: '🏞️' },
                          { value: 'lake', label: 'Lake/River', emoji: '🌊' }
                        ].map(filter => (
                          <button
                            key={filter.value}
                            type="button"
                            onClick={() => setTownFeatureFilter(filter.value)}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                              townFeatureFilter === filter.value
                                ? 'bg-scout-accent-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                          >
                            {filter.emoji} {filter.label}
                          </button>
                        ))}
                      </div>

                      {/* AI Match Button */}
                      <div className="mb-3">
                        <button
                          type="button"
                          onClick={handleAiMatch}
                          disabled={aiMatching}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />
                          {aiMatching ? 'AI Analyzing...' : '🤖 AI Match Towns'}
                        </button>
                      </div>

                      {/* AI Suggestions */}
                      {aiSuggestions.length > 0 && (
                        <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                              AI Suggestions ({aiSuggestions.length})
                            </p>
                            <button
                              type="button"
                              onClick={applyAiSuggestions}
                              className="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                            >
                              Add All
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {aiSuggestions.map((town, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-white dark:bg-gray-800 text-purple-900 dark:text-purple-100 rounded border border-purple-200 dark:border-purple-700"
                              >
                                {town}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <input
                        type="text"
                        value={townSearch}
                        onChange={(e) => setTownSearch(e.target.value)}
                        placeholder="Search towns..."
                        className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700">
                        {filteredTowns.length === 0 ? (
                          <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                            No {townFeatureFilter !== 'all' ? townFeatureFilter : ''} towns found
                          </p>
                        ) : (
                          filteredTowns.slice(0, 20).map(town => (
                            <div key={town.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                              <label className="flex items-center gap-2 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={(editingInspiration.typical_town_examples || []).includes(town.town_name)}
                                  onChange={() => toggleTownSelection(town.town_name)}
                                  className="rounded"
                                />
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {town.town_name}, {town.country}
                                </span>
                              </label>
                              {/* Publish/Unpublish Toggle */}
                              <button
                                onClick={(e) => handleTogglePublish(e, town)}
                                className={`
                                  relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 flex-shrink-0
                                  ${town.is_published ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}
                                `}
                                title={town.is_published ? 'Published - Click to unpublish' : 'Unpublished - Click to publish'}
                              >
                                <span
                                  className={`
                                    inline-block w-3 h-3 transform rounded-full bg-white transition-transform
                                    ${town.is_published ? 'translate-x-5' : 'translate-x-1'}
                                  `}
                                />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdate(editingInspiration.id, editingInspiration)}
                        className="flex items-center gap-2 px-4 py-2 bg-scout-accent-600 text-white rounded-lg hover:bg-scout-accent-700"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingInspiration(null)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {inspiration.title}
                          </h3>

                          {/* Published/Unpublished Toggle Switch */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleActive(inspiration.id, inspiration.is_active)}
                              className={`
                                relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                ${inspiration.is_active ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}
                              `}
                              title={inspiration.is_active ? 'Published - Click to unpublish' : 'Unpublished - Click to publish'}
                            >
                              <span
                                className={`
                                  inline-block w-4 h-4 transform rounded-full bg-white transition-transform
                                  ${inspiration.is_active ? 'translate-x-6' : 'translate-x-1'}
                                `}
                              />
                            </button>
                            <span className={`text-xs font-medium ${inspiration.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                              {inspiration.is_active ? 'Published' : 'Unpublished'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {inspiration.subtitle || inspiration.region_name}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {inspiration.description}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReorder(inspiration.id, 'up')}
                          disabled={index === 0 || searchQuery || statusFilter !== 'all'}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title={searchQuery || statusFilter !== 'all' ? 'Clear filters to reorder' : 'Move up'}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReorder(inspiration.id, 'down')}
                          disabled={index === filteredInspirations.length - 1 || searchQuery || statusFilter !== 'all'}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title={searchQuery || statusFilter !== 'all' ? 'Clear filters to reorder' : 'Move down'}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingInspiration(inspiration)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inspiration.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Featured Towns */}
                    {inspiration.typical_town_examples && inspiration.typical_town_examples.length > 0 && (() => {
                      // Show ALL towns, color-coded by whether they have images
                      const allTownsList = inspiration.typical_town_examples;
                      const townsWithImages = allTownsList.filter(name => allTowns.some(t => t.town_name === name));
                      const townsWithoutImages = allTownsList.filter(name => !allTowns.some(t => t.town_name === name));

                      const handleTownClick = async (townName) => {
                        // Find town ID from database
                        const { data, error } = await supabase
                          .from('towns')
                          .select('id, town_name')
                          .eq('town_name', townName)
                          .maybeSingle();

                        if (error) {
                          toast.error(`Database error looking up "${townName}"`);
                          console.error('Error finding town:', error);
                          return;
                        }

                        if (!data) {
                          toast.error(`Town "${townName}" not found in database. It may have been deleted or renamed.`, {
                            duration: 5000
                          });
                          console.warn(`Town "${townName}" listed in regional_inspirations but not found in towns table`);
                          return;
                        }

                        // Navigate to Town Manager with this town selected
                        navigate(`/admin/towns-manager?town=${data.id}`);
                      };

                      if (allTownsList.length === 0) return null;

                      return (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Featured Towns ({allTownsList.length}):
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              ({townsWithImages.length} with photos, {townsWithoutImages.length} need photos)
                            </span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {/* Towns WITH images - GREEN */}
                            {townsWithImages.map((town, idx) => (
                              <button
                                key={`with-${idx}`}
                                onClick={() => handleTownClick(town)}
                                className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors cursor-pointer border border-green-300 dark:border-green-700"
                                title="Click to open in Town Manager (has photos)"
                              >
                                {town}
                              </button>
                            ))}
                            {/* Towns WITHOUT images - RED */}
                            {townsWithoutImages.map((town, idx) => (
                              <button
                                key={`without-${idx}`}
                                onClick={() => handleTownClick(town)}
                                className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors cursor-pointer border border-red-300 dark:border-red-700"
                                title="Click to open in Town Manager (needs photos!)"
                              >
                                {town}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Image Preview */}
                    {inspiration.image_url && (
                      <div className="mt-4">
                        <img
                          src={inspiration.image_url}
                          alt={inspiration.title}
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default RegionManager;
