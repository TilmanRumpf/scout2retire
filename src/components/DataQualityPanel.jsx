import { useState, useEffect } from 'react';
import { X, Shield, AlertCircle, CheckCircle, XCircle, Camera, Edit, Copy, TrendingUp } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';
import toast from 'react-hot-toast';

export default function DataQualityPanel({ town, isOpen, onClose, onQuickAction }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!isOpen || !town) return null;

  // Analyze town data
  const analyzeData = () => {
    const allFields = Object.keys(town).filter(key => !key.startsWith('_') && key !== 'id');
    const filledFields = [];
    const emptyFields = [];
    const errorFields = [];
    
    // Critical fields that should always be filled
    const criticalFields = [
      'image_url_1', 'country', 'region', 'cost_of_living_usd',
      'healthcare_score', 'safety_score', 'climate', 'population'
    ];
    
    // Matching algorithm fields
    const matchingFields = [
      'airport_distance', 'climate', 'cost_of_living_usd', 'english_proficiency',
      'healthcare_score', 'safety_score', 'walkability'
    ];
    
    allFields.forEach(field => {
      const value = town[field];
      
      // Check if field has error
      if (town._errors?.some(err => err.includes(field))) {
        errorFields.push(field);
      }
      
      // Check if field is empty
      if (value === null || value === undefined || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        emptyFields.push(field);
      } else {
        filledFields.push(field);
      }
    });
    
    const missingCritical = criticalFields.filter(field => emptyFields.includes(field));
    const missingMatching = matchingFields.filter(field => emptyFields.includes(field));
    
    return {
      totalFields: allFields.length,
      filledFields,
      emptyFields,
      errorFields,
      missingCritical,
      missingMatching,
      hasPhoto: !!town.image_url_1,
      completion: town._completion || 0,
      errors: town._errors || []
    };
  };
  
  const data = analyzeData();
  
  // Format field name for display
  const formatFieldName = (field) => {
    return field
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
      .replace(/Url/g, 'URL')
      .replace(/Usd/g, 'USD');
  };
  
  // Copy report to clipboard
  const copyReport = () => {
    const report = `
Data Quality Report - ${town.town_name}, ${town.country}
=====================================
Completion: ${data.completion}%
Total Fields: ${data.totalFields}
Filled: ${data.filledFields.length}
Empty: ${data.emptyFields.length}
Errors: ${data.errorFields.length}

Missing Critical Fields:
${data.missingCritical.map(f => `- ${formatFieldName(f)}`).join('\n')}

Missing Matching Fields:
${data.missingMatching.map(f => `- ${formatFieldName(f)}`).join('\n')}

Errors:
${data.errors.join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(report);
    toast.success('Report copied to clipboard!');
  };

  return (
    <>
      {/* Panel - 1/4 page from right with flex layout */}
      <div className={`fixed right-0 top-0 h-full w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 ${uiConfig.colors.card} shadow-2xl z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} border-l ${uiConfig.colors.border} flex flex-col`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${uiConfig.colors.border}`}>
          <div className="flex items-center gap-2">
            <Shield className={`w-5 h-5 ${
              data.completion >= 70 ? 'text-green-600' :
              data.completion >= 30 ? 'text-yellow-600' : 'text-red-600'
            }`} />
            <h3 className={`font-semibold ${uiConfig.colors.heading}`}>Data Quality Report</h3>
          </div>
        </div>
        
        {/* Town Info */}
        <div className={`px-4 py-3 ${uiConfig.colors.secondary} border-b ${uiConfig.colors.border}`}>
          <div className={`font-medium ${uiConfig.colors.heading}`}>{town.town_name}, {town.country}</div>
          <div className={`text-sm ${uiConfig.colors.subtitle} mt-1`}>
            Last updated: {town.updated_at ? new Date(town.updated_at).toLocaleDateString() : 'Unknown'}
          </div>
        </div>
        
        {/* Tabs */}
        <div className={`flex border-b ${uiConfig.colors.border}`}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'overview' 
                ? `${uiConfig.colors.primary} ${uiConfig.colors.primaryText}` 
                : `${uiConfig.colors.body} hover:${uiConfig.colors.secondary}`
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('fields')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'fields' 
                ? `${uiConfig.colors.primary} ${uiConfig.colors.primaryText}` 
                : `${uiConfig.colors.body} hover:${uiConfig.colors.secondary}`
            }`}
          >
            Fields
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'actions' 
                ? `${uiConfig.colors.primary} ${uiConfig.colors.primaryText}` 
                : `${uiConfig.colors.body} hover:${uiConfig.colors.secondary}`
            }`}
          >
            Actions
          </button>
        </div>
        
        {/* Content - flex-1 to fill all available space */}
        <div className="overflow-y-auto flex-1 p-4">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Completion Score */}
              <div className={`p-4 rounded-lg ${uiConfig.colors.secondary}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${uiConfig.colors.heading}`}>Completion Score</span>
                  <span className={`text-2xl font-bold ${
                    data.completion >= 70 ? 'text-green-600' :
                    data.completion >= 30 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {data.completion}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      data.completion >= 70 ? 'bg-green-600' :
                      data.completion >= 30 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${data.completion}%` }}
                  />
                </div>
              </div>
              
              {/* Field Statistics */}
              <div className="grid grid-cols-3 gap-2">
                <div className={`p-3 rounded-lg ${uiConfig.colors.secondary} text-center`}>
                  <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <div className={`text-lg font-bold ${uiConfig.colors.heading}`}>{data.filledFields.length}</div>
                  <div className={`text-xs ${uiConfig.colors.subtitle}`}>Filled</div>
                </div>
                <div className={`p-3 rounded-lg ${uiConfig.colors.secondary} text-center`}>
                  <AlertCircle className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                  <div className={`text-lg font-bold ${uiConfig.colors.heading}`}>{data.emptyFields.length}</div>
                  <div className={`text-xs ${uiConfig.colors.subtitle}`}>Empty</div>
                </div>
                <div className={`p-3 rounded-lg ${uiConfig.colors.secondary} text-center`}>
                  <XCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                  <div className={`text-lg font-bold ${uiConfig.colors.heading}`}>{data.errorFields.length}</div>
                  <div className={`text-xs ${uiConfig.colors.subtitle}`}>Errors</div>
                </div>
              </div>
              
              {/* Critical Issues */}
              {data.missingCritical.length > 0 && (
                <div className={`p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20`}>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className={`text-sm font-medium text-red-700 dark:text-red-400`}>
                      Missing Critical Fields ({data.missingCritical.length})
                    </span>
                  </div>
                  <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                    {data.missingCritical.map(field => (
                      <li key={field}>• {formatFieldName(field)}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Photo Status */}
              <div className={`p-3 rounded-lg ${data.hasPhoto ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                <div className="flex items-center gap-2">
                  <Camera className={`w-4 h-4 ${data.hasPhoto ? 'text-green-600' : 'text-yellow-600'}`} />
                  <span className={`text-sm font-medium ${data.hasPhoto ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                    {data.hasPhoto ? 'Has photo' : 'No photo'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Fields Tab */}
          {activeTab === 'fields' && (
            <div className="space-y-4">
              {/* Empty Required Fields */}
              {data.missingCritical.length > 0 && (
                <div>
                  <h4 className={`font-medium ${uiConfig.colors.heading} mb-2`}>Empty Critical Fields</h4>
                  <div className="space-y-1">
                    {data.missingCritical.map(field => (
                      <div 
                        key={field}
                        className={`p-2 rounded ${uiConfig.colors.secondary} text-sm flex items-center justify-between`}
                      >
                        <span className={uiConfig.colors.body}>{formatFieldName(field)}</span>
                        <button
                          onClick={() => onQuickAction('scrollToField', field)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Fill →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Fields with Errors */}
              {data.errorFields.length > 0 && (
                <div>
                  <h4 className={`font-medium ${uiConfig.colors.heading} mb-2`}>Fields with Errors</h4>
                  <div className="space-y-1">
                    {data.errorFields.map(field => (
                      <div 
                        key={field}
                        className={`p-2 rounded bg-red-50 dark:bg-red-900/20 text-sm flex items-center justify-between`}
                      >
                        <span className="text-red-700 dark:text-red-400">{formatFieldName(field)}</span>
                        <button
                          onClick={() => onQuickAction('scrollToField', field)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Fix →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* All Empty Fields */}
              <div>
                <h4 className={`font-medium ${uiConfig.colors.heading} mb-2`}>
                  All Empty Fields ({data.emptyFields.length})
                </h4>
                <div className="space-y-1">
                  {data.emptyFields.map(field => (
                    <div 
                      key={field}
                      className={`p-2 rounded ${uiConfig.colors.secondary} text-sm flex items-center justify-between`}
                    >
                      <span className={`text-xs ${uiConfig.colors.body}`}>{formatFieldName(field)}</span>
                      <button
                        onClick={() => onQuickAction('scrollToField', field)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Fill
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-3">
              <button
                onClick={() => onQuickAction('fillMissing')}
                className={`w-full p-3 rounded-lg ${uiConfig.colors.primary} ${uiConfig.colors.primaryText} hover:opacity-90 flex items-center justify-center gap-2`}
              >
                <Edit className="w-4 h-4" />
                Fill Missing Fields
              </button>
              
              {data.errorFields.length > 0 && (
                <button
                  onClick={() => onQuickAction('fixErrors')}
                  className="w-full p-3 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  Fix {data.errorFields.length} Errors
                </button>
              )}
              
              {!data.hasPhoto && (
                <button
                  onClick={() => onQuickAction('addPhoto')}
                  className="w-full p-3 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Add Photo
                </button>
              )}
              
              <button
                onClick={copyReport}
                className={`w-full p-3 rounded-lg ${uiConfig.colors.secondary} ${uiConfig.colors.body} hover:${uiConfig.colors.tertiary} flex items-center justify-center gap-2`}
              >
                <Copy className="w-4 h-4" />
                Copy Report
              </button>
              
              <button
                onClick={() => onQuickAction('runValidation')}
                className={`w-full p-3 rounded-lg ${uiConfig.colors.secondary} ${uiConfig.colors.body} hover:${uiConfig.colors.tertiary} flex items-center justify-center gap-2`}
              >
                <TrendingUp className="w-4 h-4" />
                Run Full Validation
              </button>
            </div>
          )}
        </div>
        
        {/* Bottom Close Button */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${uiConfig.colors.border} ${uiConfig.colors.card}`}>
          <button
            onClick={onClose}
            className={`w-full py-2 px-4 ${uiConfig.colors.secondary} hover:${uiConfig.colors.tertiary} rounded-lg transition-colors flex items-center justify-center gap-2`}
          >
            <X className="w-4 h-4" />
            <span className="font-medium">Close Report</span>
          </button>
        </div>
      </div>
    </>
  );
}