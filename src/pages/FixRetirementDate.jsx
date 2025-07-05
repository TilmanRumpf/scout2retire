import { useEffect, useState } from 'react';
import supabase from '../utils/supabaseClient';

export default function FixRetirementDate() {
  const [status, setStatus] = useState('Checking...');
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fixRetirementMonth() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setStatus('No authenticated user');
          return;
        }

        // Get onboarding data
        const { data: onboarding, error } = await supabase
          .from('onboarding_responses')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          setStatus(`Error: ${error.message}`);
          return;
        }

        if (!onboarding || onboarding.length === 0) {
          setStatus('No onboarding data found');
          return;
        }

        const record = onboarding[0];
        setData(record.current_status);

        const timeline = record.current_status?.retirement_timeline;
        
        if (!timeline) {
          setStatus('No retirement timeline found');
          return;
        }

        if (timeline.target_month === undefined || timeline.target_month === null) {
          setStatus('Found missing target_month! Fixing...');
          
          // Fix it
          const updatedCurrentStatus = {
            ...record.current_status,
            retirement_timeline: {
              ...timeline,
              target_month: 1
            }
          };

          const { error: updateError } = await supabase
            .from('onboarding_responses')
            .update({ current_status: updatedCurrentStatus })
            .eq('id', record.id);

          if (updateError) {
            setStatus(`Update error: ${updateError.message}`);
          } else {
            setStatus('✅ Successfully fixed! target_month set to 1 (January)');
            setData(updatedCurrentStatus);
          }
        } else {
          setStatus(`✅ target_month already exists: ${timeline.target_month}`);
        }
      } catch (err) {
        setStatus(`Error: ${err.message}`);
      }
    }

    fixRetirementMonth();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Fix Retirement Date</h2>
      <p>Status: {status}</p>
      {data && (
        <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
          {JSON.stringify(data.retirement_timeline, null, 2)}
        </pre>
      )}
    </div>
  );
}