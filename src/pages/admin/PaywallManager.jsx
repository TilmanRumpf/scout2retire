import { useState, useEffect } from 'react';
import { Shield, Users, Settings, TrendingUp, Lock, Crown, Building2, DollarSign, Edit2, Save, X, Check } from 'lucide-react';
import supabase from '../../utils/supabaseClient';
import { checkAdminAccess } from '../../utils/paywallUtils';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';
import UnifiedHeader from '../../components/UnifiedHeader';
import HeaderSpacer from '../../components/HeaderSpacer';

const PaywallManager = () => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [tiers, setTiers] = useState([]);
  const [features, setFeatures] = useState([]);
  const [limits, setLimits] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [editingLimit, setEditingLimit] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editingPrice, setEditingPrice] = useState(null); // { tierId, field: 'monthly' | 'yearly' }
  const [priceValue, setPriceValue] = useState('');

  // Check admin access
  useEffect(() => {
    const checkAccess = async () => {
      const access = await checkAdminAccess('executive_admin');
      setHasAccess(access);
      if (!access) {
        toast.error('Access denied. Executive admin role required.');
        setLoading(false);
      }
    };
    checkAccess();
  }, []);

  // Load all data
  useEffect(() => {
    if (hasAccess) {
      loadAllData();
    }
  }, [hasAccess]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadTiers(),
      loadFeatures(),
      loadLimits(),
      loadUserStats()
    ]);
    setLoading(false);
  };

  const loadTiers = async () => {
    const { data, error } = await supabase
      .from('user_categories')
      .select('*')
      .order('sort_order');

    if (!error) setTiers(data || []);
  };

  const loadFeatures = async () => {
    const { data, error } = await supabase
      .from('feature_definitions')
      .select('*')
      .order('sort_order');

    if (!error) setFeatures(data || []);
  };

  const loadLimits = async () => {
    const { data, error } = await supabase
      .from('category_limits')
      .select(`
        *,
        category:user_categories(category_code, display_name, color_hex),
        feature:feature_definitions(feature_code, display_name, description)
      `)
      .order('category_id, feature_id');

    if (!error) setLimits(data || []);
  };

  const loadUserStats = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('category_id, user_categories(category_code, display_name, color_hex)');

    if (!error) {
      // Count users per tier
      const stats = {};
      data.forEach(user => {
        const tierCode = user.user_categories?.category_code || 'unknown';
        stats[tierCode] = (stats[tierCode] || 0) + 1;
      });

      const statsArray = Object.entries(stats).map(([code, count]) => {
        const tier = tiers.find(t => t.category_code === code);
        return {
          code,
          name: tier?.display_name || code,
          count,
          color: tier?.color_hex || '#6B7280'
        };
      });

      setUserStats(statsArray);
    }
  };

  const startEditLimit = (categoryId, featureId, currentValue) => {
    setEditingLimit({ categoryId, featureId });
    setEditValue(currentValue === null ? '' : currentValue.toString());
  };

  const cancelEdit = () => {
    setEditingLimit(null);
    setEditValue('');
  };

  const saveLimit = async () => {
    if (!editingLimit) return;

    const newValue = editValue === '' ? null : parseInt(editValue);

    const { error } = await supabase
      .from('category_limits')
      .update({ limit_value: newValue })
      .eq('category_id', editingLimit.categoryId)
      .eq('feature_id', editingLimit.featureId);

    if (error) {
      toast.error('Failed to update limit');
      console.error(error);
    } else {
      toast.success('Limit updated successfully');
      await loadLimits();
      setEditingLimit(null);
      setEditValue('');
    }
  };

  const toggleTierVisibility = async (tierId, currentVisibility) => {
    const { error } = await supabase
      .from('user_categories')
      .update({ is_visible: !currentVisibility })
      .eq('id', tierId);

    if (error) {
      toast.error('Failed to update tier visibility');
    } else {
      toast.success('Tier visibility updated');
      await loadTiers();
    }
  };

  const startEditPrice = (tierId, field, currentValue) => {
    setEditingPrice({ tierId, field });
    setPriceValue(currentValue === null ? '' : currentValue.toString());
  };

  const cancelPriceEdit = () => {
    setEditingPrice(null);
    setPriceValue('');
  };

  const savePrice = async () => {
    if (!editingPrice) return;

    const newValue = priceValue === '' ? null : parseFloat(priceValue);

    // Validate price is a positive number
    if (newValue !== null && (isNaN(newValue) || newValue < 0)) {
      toast.error('Price must be a positive number or empty for free');
      return;
    }

    const updateField = editingPrice.field === 'monthly' ? 'price_monthly' : 'price_yearly';

    const { error } = await supabase
      .from('user_categories')
      .update({ [updateField]: newValue })
      .eq('id', editingPrice.tierId);

    if (error) {
      toast.error('Failed to update price');
    } else {
      toast.success('Price updated successfully');
      await loadTiers();
      setEditingPrice(null);
      setPriceValue('');
    }
  };

  const formatLimit = (value) => {
    if (value === null) return '∞';
    if (value === 0) return '❌';
    return value;
  };

  const getTierIcon = (code) => {
    switch (code) {
      case 'free': return <Users className="w-5 h-5" />;
      case 'freemium': return <Lock className="w-5 h-5" />;
      case 'premium': return <Crown className="w-5 h-5" />;
      case 'enterprise': return <Building2 className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className={`text-2xl font-bold ${uiConfig.colors.heading} mb-2`}>Access Denied</h2>
          <p className={uiConfig.colors.body}>Executive admin role required to access Paywall Manager</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.body}`}>Loading Paywall Manager...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <UnifiedHeader title="Paywall Manager" />
      <HeaderSpacer />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-scout-accent-500" />
            <h1 className={`text-3xl font-bold ${uiConfig.colors.heading}`}>Paywall Manager</h1>
          </div>
          <p className={uiConfig.colors.body}>Manage subscription tiers, feature limits, and user access</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-scout-accent-600 dark:text-scout-accent-400 border-b-2 border-scout-accent-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('limits')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'limits'
                ? 'text-scout-accent-600 dark:text-scout-accent-400 border-b-2 border-scout-accent-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Feature Limits
          </button>
          <button
            onClick={() => setActiveTab('tiers')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'tiers'
                ? 'text-scout-accent-600 dark:text-scout-accent-400 border-b-2 border-scout-accent-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Crown className="w-4 h-4 inline mr-2" />
            Tiers
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* User Distribution */}
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-6`}>
              <h2 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-4`}>User Distribution</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {userStats.map(stat => (
                  <div key={stat.code} className={`${uiConfig.colors.input} ${uiConfig.layout.radius.lg} p-4`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div style={{ color: stat.color }}>
                        {getTierIcon(stat.code)}
                      </div>
                      <h3 className={`font-semibold ${uiConfig.colors.heading}`}>{stat.name}</h3>
                    </div>
                    <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.count}</p>
                    <p className={`text-sm ${uiConfig.colors.hint}`}>active users</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-6`}>
                <Users className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>Total Users</h3>
                <p className="text-3xl font-bold text-blue-500">{userStats.reduce((sum, s) => sum + s.count, 0)}</p>
              </div>
              <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-6`}>
                <Shield className="w-8 h-8 text-green-500 mb-3" />
                <h3 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>Active Tiers</h3>
                <p className="text-3xl font-bold text-green-500">{tiers.filter(t => t.is_visible).length}</p>
              </div>
              <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-6`}>
                <Settings className="w-8 h-8 text-purple-500 mb-3" />
                <h3 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>Features</h3>
                <p className="text-3xl font-bold text-purple-500">{features.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Feature Limits Tab */}
        {activeTab === 'limits' && (
          <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${uiConfig.colors.input}`}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Feature</th>
                    {tiers.map(tier => (
                      <th key={tier.id} className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-2">
                          <div style={{ color: tier.color_hex }}>
                            {getTierIcon(tier.category_code)}
                          </div>
                          {tier.display_name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {features.map(feature => (
                    <tr key={feature.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4">
                        <div className={`font-medium ${uiConfig.colors.heading}`}>{feature.display_name}</div>
                        <div className={`text-sm ${uiConfig.colors.hint}`}>{feature.description}</div>
                      </td>
                      {tiers.map(tier => {
                        const limit = limits.find(l => l.category_id === tier.id && l.feature_id === feature.id);
                        const isEditing = editingLimit?.categoryId === tier.id && editingLimit?.featureId === feature.id;

                        return (
                          <td key={tier.id} className="px-6 py-4 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-2">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  placeholder="∞"
                                  className={`w-20 px-2 py-1 ${uiConfig.colors.input} border-2 border-scout-accent-500 rounded text-center`}
                                  autoFocus
                                />
                                <button onClick={saveLimit} className="text-green-500 hover:text-green-600">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={cancelEdit} className="text-red-500 hover:text-red-600">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditLimit(tier.id, feature.id, limit?.limit_value)}
                                className="group flex items-center justify-center gap-2 mx-auto hover:text-scout-accent-500"
                              >
                                <span className="text-lg font-semibold">{formatLimit(limit?.limit_value)}</span>
                                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tiers Tab */}
        {activeTab === 'tiers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tiers.map(tier => (
              <div
                key={tier.id}
                className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-6`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div style={{ color: tier.color_hex }}>
                      {getTierIcon(tier.category_code)}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${uiConfig.colors.heading}`}>{tier.display_name}</h3>
                      <p className={`text-sm ${uiConfig.colors.hint}`}>{tier.category_code}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleTierVisibility(tier.id, tier.is_visible)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      tier.is_visible
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {tier.is_visible ? 'Visible' : 'Hidden'}
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={uiConfig.colors.body}>Monthly Price:</span>
                    {editingPrice?.tierId === tier.id && editingPrice?.field === 'monthly' ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <span className="text-sm mr-1">$</span>
                          <input
                            type="text"
                            value={priceValue}
                            onChange={(e) => setPriceValue(e.target.value)}
                            placeholder="0"
                            className={`w-20 px-2 py-1 ${uiConfig.colors.input} border-2 border-scout-accent-500 rounded text-center`}
                            autoFocus
                          />
                        </div>
                        <button onClick={savePrice} className="text-green-500 hover:text-green-600">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={cancelPriceEdit} className="text-red-500 hover:text-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditPrice(tier.id, 'monthly', tier.price_monthly)}
                        className="group flex items-center gap-2 hover:text-scout-accent-500"
                      >
                        <span className={`font-semibold ${uiConfig.colors.heading}`}>
                          {tier.price_monthly ? `$${tier.price_monthly}` : 'Free'}
                        </span>
                        <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={uiConfig.colors.body}>Yearly Price:</span>
                    {editingPrice?.tierId === tier.id && editingPrice?.field === 'yearly' ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <span className="text-sm mr-1">$</span>
                          <input
                            type="text"
                            value={priceValue}
                            onChange={(e) => setPriceValue(e.target.value)}
                            placeholder="0"
                            className={`w-20 px-2 py-1 ${uiConfig.colors.input} border-2 border-scout-accent-500 rounded text-center`}
                            autoFocus
                          />
                        </div>
                        <button onClick={savePrice} className="text-green-500 hover:text-green-600">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={cancelPriceEdit} className="text-red-500 hover:text-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditPrice(tier.id, 'yearly', tier.price_yearly)}
                        className="group flex items-center gap-2 hover:text-scout-accent-500"
                      >
                        <span className={`font-semibold ${uiConfig.colors.heading}`}>
                          {tier.price_yearly ? `$${tier.price_yearly}` : 'Free'}
                        </span>
                        <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.body}>Users:</span>
                    <span className={`font-semibold ${uiConfig.colors.heading}`}>
                      {userStats.find(s => s.code === tier.category_code)?.count || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaywallManager;
