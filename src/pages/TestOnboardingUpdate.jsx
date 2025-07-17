import { useState } from 'react';
import { getCurrentUser } from '../utils/authUtils';
import supabase from '../utils/supabaseClient';
import { completeOnboarding } from '../utils/onboardingUtils';
import { uiConfig } from '../styles/uiConfig';

export default function TestOnboardingUpdate() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  
  const addResult = (message, isError = false) => {
    setResults(prev => [...prev, { message, isError, timestamp: new Date().toISOString() }]);
  };

  const testDirectUpdate = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult('Starting direct update test...');
      
      const { user } = await getCurrentUser();
      if (!user) {
        addResult('No user found. Please log in.', true);
        setLoading(false);
        return;
      }
      
      addResult(`User found: ${user.email} (${user.id})`);
      
      // Check current status
      const { data: userBefore, error: fetchError } = await supabase
        .from('users')
        .select('id, email, onboarding_completed, retirement_year_estimate')
        .eq('id', user.id)
        .single();
      
      if (fetchError) {
        addResult(`Error fetching user: ${fetchError.message}`, true);
        setLoading(false);
        return;
      }
      
      addResult(`Current onboarding_completed: ${userBefore.onboarding_completed}`);
      
      // Try direct update
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', user.id)
        .select()
        .single();
      
      if (updateError) {
        addResult(`Update error: ${updateError.message}`, true);
        addResult(`Error code: ${updateError.code}`, true);
        addResult(`Error hint: ${updateError.hint}`, true);
      } else {
        addResult(`Update successful! New value: ${updatedUser.onboarding_completed}`);
      }
      
    } catch (error) {
      addResult(`Unexpected error: ${error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  const testCompleteOnboarding = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult('Starting completeOnboarding function test...');
      
      const { user } = await getCurrentUser();
      if (!user) {
        addResult('No user found. Please log in.', true);
        setLoading(false);
        return;
      }
      
      addResult(`User found: ${user.email} (${user.id})`);
      
      // Call completeOnboarding
      const { success, error } = await completeOnboarding(user.id);
      
      if (success) {
        addResult('completeOnboarding returned success!');
        
        // Verify the update
        const { data: userAfter, error: verifyError } = await supabase
          .from('users')
          .select('id, email, onboarding_completed, retirement_year_estimate')
          .eq('id', user.id)
          .single();
        
        if (verifyError) {
          addResult(`Verification error: ${verifyError.message}`, true);
        } else {
          addResult(`Verified onboarding_completed: ${userAfter.onboarding_completed}`);
          addResult(`Retirement year estimate: ${userAfter.retirement_year_estimate || 'Not set'}`);
        }
      } else {
        addResult(`completeOnboarding failed: ${error?.message || 'Unknown error'}`, true);
      }
      
    } catch (error) {
      addResult(`Unexpected error: ${error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} p-8`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-2xl font-bold ${uiConfig.colors.heading} mb-6`}>
          Test Onboarding Update
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={testDirectUpdate}
            disabled={loading}
            className={`px-6 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md} disabled:opacity-50`}
          >
            Test Direct Update
          </button>
          
          <button
            onClick={testCompleteOnboarding}
            disabled={loading}
            className={`px-6 py-2 ${uiConfig.colors.btnSecondary} ${uiConfig.layout.radius.md} disabled:opacity-50`}
          >
            Test completeOnboarding Function
          </button>
        </div>
        
        {results.length > 0 && (
          <div className={`mt-8 p-4 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg}`}>
            <h2 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
              Test Results:
            </h2>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`text-sm ${result.isError ? 'text-red-600' : uiConfig.colors.body}`}
                >
                  {result.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}