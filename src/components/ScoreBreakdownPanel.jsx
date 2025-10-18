/**
 * ADMIN SCORE BREAKDOWN PANEL - SIMPLIFIED
 *
 * Shows admin score data from towns table with manual adjustment capability
 * NO complex calculations - just displays what's already in the database
 *
 * Created: 2025-10-17
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';

export default function ScoreBreakdownPanel({ town }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [adjustments, setAdjustments] = useState({});
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(null);

  // Load existing adjustments from database
  useEffect(() => {
    loadAdjustments();
  }, [town.id]);

  const loadAdjustments = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_score_adjustments')
        .select('*')
        .eq('town_id', town.id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by category
      const grouped = {};
      data?.forEach(adj => {
        if (!grouped[adj.category]) grouped[adj.category] = [];
        grouped[adj.category].push({
          id: adj.id,
          value: parseFloat(adj.adjustment_value),
          reason: adj.reason,
          createdBy: adj.created_by,
          createdAt: adj.created_at
        });
      });

      setAdjustments(grouped);
    } catch (err) {
      console.error('Error loading adjustments:', err);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getAdjustedScore = (baseScore, category) => {
    const categoryAdjs = adjustments[category] || [];
    const total = categoryAdjs.reduce((sum, adj) => sum + adj.value, 0);
    return baseScore + total;
  };

  return (
    <div className="mb-8 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-bold text-gray-900">Admin Score Data</h2>
        <p className="text-sm text-gray-600 mt-1">
          View and adjust scoring data for {town.name}
        </p>
      </div>

      <div className="p-6 space-y-4">

        {/* HEALTHCARE (30 points) */}
        <ScoreSection
          title="Healthcare"
          icon="🏥"
          maxPoints={30}
          score={town.healthcare_score}
          adjustedScore={getAdjustedScore(town.healthcare_score || 0, 'healthcare')}
          adjustments={adjustments.healthcare}
          isExpanded={expandedSections.healthcare}
          onToggle={() => toggleSection('healthcare')}
          onAddAdjustment={() => setShowAdjustmentModal({ category: 'healthcare', subcategory: 'Healthcare' })}
        >
          <DataField label="Healthcare Score" value={town.healthcare_score} field="healthcare_score" />
          <DataField label="Hospital Count" value={town.hospital_count} field="hospital_count" />
          <DataField label="Nearest Hospital (km)" value={town.nearest_major_hospital_km} field="nearest_major_hospital_km" />
          <DataField label="Emergency Services Quality" value={town.emergency_services_quality} field="emergency_services_quality" />
          <DataField label="English Speaking Doctors" value={town.english_speaking_doctors_available} field="english_speaking_doctors_available" />
          <DataField label="Insurance Availability" value={town.insurance_availability_rating} field="insurance_availability_rating" />
          <DataField label="Healthcare Cost" value={town.healthcare_cost} field="healthcare_cost" />
        </ScoreSection>

        {/* SAFETY (25 points) */}
        <ScoreSection
          title="Safety"
          icon="🛡️"
          maxPoints={25}
          score={town.safety_score}
          adjustedScore={getAdjustedScore(town.safety_score || 0, 'safety')}
          adjustments={adjustments.safety}
          isExpanded={expandedSections.safety}
          onToggle={() => toggleSection('safety')}
          onAddAdjustment={() => setShowAdjustmentModal({ category: 'safety', subcategory: 'Safety' })}
        >
          <DataField label="Safety Score" value={town.safety_score} field="safety_score" />
          <DataField label="Crime Rate" value={town.crime_rate} field="crime_rate" />
          <DataField label="Environmental Health Rating" value={town.environmental_health_rating} field="environmental_health_rating" />
          <DataField label="Natural Disaster Risk" value={town.natural_disaster_risk} field="natural_disaster_risk" />
          <DataField label="Political Stability Rating" value={town.political_stability_rating} field="political_stability_rating" />
        </ScoreSection>

        {/* INFRASTRUCTURE (15 points) */}
        <ScoreSection
          title="Infrastructure"
          icon="🏗️"
          maxPoints={15}
          score={town.government_efficiency_rating ? town.government_efficiency_rating / 10 : null}
          adjustedScore={getAdjustedScore(town.government_efficiency_rating ? town.government_efficiency_rating / 10 : 0, 'infrastructure')}
          adjustments={adjustments.infrastructure}
          isExpanded={expandedSections.infrastructure}
          onToggle={() => toggleSection('infrastructure')}
          onAddAdjustment={() => setShowAdjustmentModal({ category: 'infrastructure', subcategory: 'Infrastructure' })}
        >
          <DataField label="Walkability Score" value={town.walkability_score} field="walkability_score" />
          <DataField label="Public Transport Rating" value={town.public_transport_rating} field="public_transport_rating" />
          <DataField label="Airport Distance (km)" value={town.airport_distance_km} field="airport_distance_km" />
          <DataField label="Internet Speed (Mbps)" value={town.internet_speed_mbps} field="internet_speed_mbps" />
          <DataField label="Air Quality Index" value={town.air_quality_index} field="air_quality_index" />
          <DataField label="Local Mobility Options" value={town.local_mobility_options} field="local_mobility_options" />
        </ScoreSection>

        {/* LEGAL & ADMIN (10 points) */}
        <ScoreSection
          title="Legal & Admin"
          icon="📋"
          maxPoints={10}
          score={null}
          adjustedScore={getAdjustedScore(0, 'legal')}
          adjustments={adjustments.legal}
          isExpanded={expandedSections.legal}
          onToggle={() => toggleSection('legal')}
          onAddAdjustment={() => setShowAdjustmentModal({ category: 'legal', subcategory: 'Legal & Admin' })}
        >
          <DataField label="Government Efficiency Rating" value={town.government_efficiency_rating} field="government_efficiency_rating" />
          <DataField label="Visa Requirements" value={town.visa_requirements} field="visa_requirements" />
          <DataField label="Visa on Arrival Countries" value={town.visa_on_arrival_countries?.join(', ')} field="visa_on_arrival_countries" />
          <DataField label="Retirement Visa Available" value={town.retirement_visa_available} field="retirement_visa_available" />
          <DataField label="Tax Treaty US" value={town.tax_treaty_us} field="tax_treaty_us" />
          <DataField label="Tax Haven Status" value={town.tax_haven_status} field="tax_haven_status" />
          <DataField label="Bureaucracy Score" value={town.bureaucracy_score} field="bureaucracy_score" />
        </ScoreSection>

        {/* ENVIRONMENTAL (15 points - conditional) */}
        <ScoreSection
          title="Environmental Health (Conditional)"
          icon="🌿"
          maxPoints={15}
          score={town.environmental_health_rating}
          adjustedScore={getAdjustedScore(town.environmental_health_rating || 0, 'environmental')}
          adjustments={adjustments.environmental}
          isExpanded={expandedSections.environmental}
          onToggle={() => toggleSection('environmental')}
          onAddAdjustment={() => setShowAdjustmentModal({ category: 'environmental', subcategory: 'Environmental' })}
        >
          <DataField label="Environmental Health Rating" value={town.environmental_health_rating} field="environmental_health_rating" />
          <DataField label="Air Quality Index" value={town.air_quality_index} field="air_quality_index" />
          <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mt-2">
            Only awarded if user marks environmental health as 'sensitive' in preferences
          </p>
        </ScoreSection>

        {/* SUMMARY */}
        <div className="mt-6 pt-6 border-t-2 border-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Admin Score Summary</h3>
          <div className="space-y-2 text-sm">
            <SummaryRow label="Healthcare" score={town.healthcare_score} category="healthcare" adjustments={adjustments.healthcare} maxPoints={30} />
            <SummaryRow label="Safety" score={town.safety_score} category="safety" adjustments={adjustments.safety} maxPoints={25} />
            <SummaryRow label="Infrastructure" score={town.government_efficiency_rating ? town.government_efficiency_rating / 10 : null} category="infrastructure" adjustments={adjustments.infrastructure} maxPoints={15} />
            <SummaryRow label="Legal & Admin" score={null} category="legal" adjustments={adjustments.legal} maxPoints={10} />
            <SummaryRow label="Environmental (conditional)" score={town.environmental_health_rating} category="environmental" adjustments={adjustments.environmental} maxPoints={15} />

            <div className="mt-4 pt-3 border-t border-gray-300 flex justify-between font-bold text-base">
              <span>TOTAL ADMIN SCORE:</span>
              <span className="text-blue-600">Calculated based on user preferences (0-100 pts)</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Add Manual Adjustment */}
      {showAdjustmentModal && (
        <AdjustmentModal
          category={showAdjustmentModal.category}
          subcategory={showAdjustmentModal.subcategory}
          townId={town.id}
          townName={town.name}
          onClose={() => setShowAdjustmentModal(null)}
          onSave={async (adjustment) => {
            try {
              const { data, error } = await supabase
                .from('admin_score_adjustments')
                .insert({
                  town_id: town.id,
                  category: showAdjustmentModal.category,
                  subcategory: showAdjustmentModal.subcategory,
                  adjustment_value: adjustment.value,
                  reason: adjustment.reason,
                  applies_to: adjustment.appliesTo,
                  created_by: adjustment.createdBy,
                  active: true
                })
                .select()
                .single();

              if (error) throw error;

              setAdjustments(prev => ({
                ...prev,
                [showAdjustmentModal.category]: [...(prev[showAdjustmentModal.category] || []), {
                  id: data.id,
                  value: parseFloat(data.adjustment_value),
                  reason: data.reason,
                  createdBy: data.created_by,
                  createdAt: data.created_at
                }]
              }));

              setShowAdjustmentModal(null);
              toast.success('Adjustment saved!');
            } catch (err) {
              console.error(err);
              toast.error('Failed to save adjustment');
            }
          }}
        />
      )}
    </div>
  );
}

/* SUB-COMPONENTS */

function ScoreSection({ title, icon, maxPoints, score, adjustedScore, adjustments, isExpanded, onToggle, onAddAdjustment, children }) {
  const hasAdjustments = adjustments && adjustments.length > 0;
  const adjustmentTotal = adjustments?.reduce((sum, adj) => sum + adj.value, 0) || 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">Max: {maxPoints} admin points</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {score !== null && score !== undefined && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-mono">
                {typeof score === 'number' ? score.toFixed(1) : score}/10.0
              </span>
              {hasAdjustments && (
                <>
                  <span className="text-gray-400">→</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-mono ${
                    adjustmentTotal > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {adjustedScore.toFixed(1)}/10.0 ✏️
                  </span>
                </>
              )}
            </div>
          )}
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 bg-white border-t border-gray-200">
          <button
            onClick={onAddAdjustment}
            className="mb-4 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
          >
            + Add Manual Adjustment
          </button>

          {hasAdjustments && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded">
              <h4 className="text-sm font-semibold text-amber-900 mb-2">Active Adjustments:</h4>
              {adjustments.map((adj, idx) => (
                <div key={idx} className="text-xs text-amber-800 flex justify-between">
                  <span>• {adj.reason}</span>
                  <span className={`font-mono ${adj.value > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {adj.value > 0 ? '+' : ''}{adj.value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function DataField({ label, value, field }) {
  const displayValue = value !== null && value !== undefined
    ? (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value)
    : '(empty)';

  const valueColor = value !== null && value !== undefined ? 'text-gray-900' : 'text-red-600';

  return (
    <div className="flex items-center justify-between py-1.5 px-3 hover:bg-gray-50 rounded">
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-400 ml-2">({field})</span>
      </div>
      <span className={`text-sm font-mono ${valueColor}`}>
        {displayValue}
      </span>
    </div>
  );
}

function SummaryRow({ label, score, category, adjustments, maxPoints }) {
  const hasAdjustments = adjustments && adjustments.length > 0;
  const adjustmentTotal = adjustments?.reduce((sum, adj) => sum + adj.value, 0) || 0;
  const adjusted = (score || 0) + adjustmentTotal;

  return (
    <div className="flex justify-between">
      <span>{label}:</span>
      <span className="font-mono">
        {score !== null && score !== undefined ? (
          hasAdjustments ? (
            <>
              <span className="line-through text-gray-400">{score.toFixed(1)}</span>
              {' → '}
              <span className="text-green-600 font-semibold">{adjusted.toFixed(1)}</span>
            </>
          ) : (
            score.toFixed(1)
          )
        ) : (
          'N/A'
        )}
        /10.0 → {maxPoints} pts max
      </span>
    </div>
  );
}

/* MODAL */

function AdjustmentModal({ category, subcategory, townId, townName, onClose, onSave }) {
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [appliesTo, setAppliesTo] = useState('this_town');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const handleSave = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return toast.error('Enter a valid number');
    if (!reason.trim()) return toast.error('Enter a reason');

    onSave({
      value: numValue,
      reason: reason.trim(),
      appliesTo,
      createdBy: currentUser?.email || 'unknown@user.com'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-xl w-full">
        <div className="px-6 py-4 border-b bg-green-50">
          <h3 className="text-lg font-bold">Add Manual Adjustment</h3>
          <p className="text-sm text-gray-600">{subcategory} - {townName}</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Adjustment Value</label>
            <input
              type="number"
              step="0.1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g., -0.5 or +0.3"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reason *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Island ferry penalty"
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Apply To</label>
            <select value={appliesTo} onChange={(e) => setAppliesTo(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              <option value="this_town">This town only</option>
              <option value="all_islands">All island towns</option>
              <option value="custom_filter">Custom filter</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
