/**
 * Online Hours Tracking Hook
 *
 * Tracks user online time with high accuracy using
 * visibility API and activity detection.
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../utils/supabaseClient';

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const useOnlineTracking = () => {
  const { user } = useAuth();
  const heartbeatInterval = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const isActiveRef = useRef(true);
  const sessionStartRef = useRef(Date.now());

  useEffect(() => {
    if (!user?.id) return;

    // Track page visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false;
        stopHeartbeat();
      } else {
        isActiveRef.current = true;
        lastActivityRef.current = Date.now();
        startHeartbeat();
      }
    };

    // Track user activity
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      if (!isActiveRef.current) {
        isActiveRef.current = true;
        startHeartbeat();
      }
    };

    // Send heartbeat to update last_active_at
    const sendHeartbeat = async () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;

      // If idle for more than 5 minutes, stop heartbeat
      if (timeSinceActivity > IDLE_TIMEOUT) {
        isActiveRef.current = false;
        stopHeartbeat();
        return;
      }

      // Update last_active_at in database
      try {
        const { error } = await supabase
          .from('users')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating last_active_at:', error);
        }
      } catch (err) {
        console.error('Heartbeat error:', err);
      }
    };

    const startHeartbeat = () => {
      if (!heartbeatInterval.current) {
        heartbeatInterval.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
      }
    };

    const stopHeartbeat = () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
    };

    // Listen to activity events
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start heartbeat
    startHeartbeat();

    // Cleanup
    return () => {
      stopHeartbeat();
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]);

  return {
    isTracking: !!user?.id && isActiveRef.current
  };
};

export default useOnlineTracking;
