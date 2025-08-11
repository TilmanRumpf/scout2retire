import { useState, useEffect } from 'react';
import verificationService from '../services/verificationService';
import { getFieldOptions } from '../utils/townDataOptions';

const SmartVerificationPopup = ({ 
  isOpen, 
  onClose, 
  town, 
  fieldName, 
  fieldDefinition,
  onUpdateField 
}) => {
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('smart'); // 'smart' or 'manual'
  
  useEffect(() => {
    if (isOpen && town && fieldName) {
      performVerification();
    }
  }, [isOpen, town, fieldName]);
  
  const performVerification = async () => {
    setLoading(true);
    try {
      const result = await verificationService.verifyField(
        town,
        fieldName,
        fieldDefinition
      );
      setVerificationResult(result);
      
      // If error or no suggestion, switch to manual mode
      if (result.status === 'error' || !result.suggestedValue) {
        setMode('manual');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      setMode('manual');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAcceptSuggestion = async () => {
    if (verificationResult?.suggestedValue) {
      await onUpdateField(fieldName, verificationResult.suggestedValue);
      onClose();
    }
  };
  
  const handleKeepCurrent = () => {
    onClose();
  };
  
  if (!isOpen) return null;
  
  // Format field name for display
  const displayFieldName = fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      
      {/* Popup Window */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            <h2 className="text-lg font-semibold text-gray-800">
              Smart Verification: {displayFieldName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Analyzing search results...</p>
              <p className="text-sm text-gray-500 mt-2">Searching for: {town.name}</p>
            </div>
          ) : mode === 'smart' && verificationResult ? (
            <div className="space-y-6">
              {/* Verification Results */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Verification Results for {town.name}</h3>
                
                {/* Current vs Suggested */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Current Value:</span>
                    <span className={`font-semibold ${verificationResult.hasConflict ? 'text-red-600' : 'text-gray-800'}`}>
                      {verificationResult.currentValue || 'Not set'}
                      {verificationResult.hasConflict && ' ❌'}
                    </span>
                  </div>
                  
                  {verificationResult.suggestedValue && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                      <span className="text-sm font-medium text-gray-600">Google Says:</span>
                      <span className="font-semibold text-green-700">
                        {verificationResult.suggestedValue} ✓
                      </span>
                    </div>
                  )}
                  
                  {/* Confidence Score */}
                  {verificationResult.confidence > 0 && (
                    <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Confidence:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              verificationResult.confidence > 0.8 ? 'bg-green-500' :
                              verificationResult.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${verificationResult.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(verificationResult.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Evidence */}
              {verificationResult.evidence && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Evidence:</h4>
                  <p className="text-sm text-gray-600">{verificationResult.evidence}</p>
                </div>
              )}
              
              {/* Search Query Used */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">
                  Search query: "{verificationResult.searchQuery}"
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {verificationResult.hasConflict && verificationResult.suggestedValue ? (
                  <>
                    <button
                      onClick={handleAcceptSuggestion}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      Update to {verificationResult.suggestedValue}
                    </button>
                    <button
                      onClick={handleKeepCurrent}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Keep {verificationResult.currentValue}
                    </button>
                  </>
                ) : verificationResult.suggestedValue ? (
                  <button
                    onClick={onClose}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    ✓ Verified Correct
                  </button>
                ) : (
                  <button
                    onClick={() => setMode('manual')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Search Manually
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Manual Search Mode */
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Automatic verification unavailable. Opening Google search for manual verification.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Search for: <span className="font-medium">{town.name} {fieldName.replace(/_/g, ' ')}</span>
                </p>
                <a
                  href={verificationResult?.fallbackUrl || `https://www.google.com/search?q=${encodeURIComponent(town.name + ' ' + fieldName.replace(/_/g, ' '))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
                  </svg>
                  Open Google Search
                </a>
              </div>
              
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SmartVerificationPopup;