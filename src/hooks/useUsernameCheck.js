import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import supabase from '../utils/supabaseClient';

export const useUsernameCheck = () => {
  const [needsUsername, setNeedsUsername] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUsername = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          setIsChecking(false);
          return;
        }

        // Check if user has a username
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking username:', error);
          setIsChecking(false);
          return;
        }

        // If user doesn't have a username, they need to select one
        if (!data?.username) {
          setNeedsUsername(true);
          // Redirect to profile page with username selector visible
          navigate('/profile?tab=account&selectUsername=true');
        }
      } catch (err) {
        console.error('Error in username check:', err);
      } finally {
        setIsChecking(false);
      }
    };

    checkUsername();
  }, [navigate]);

  return { needsUsername, isChecking };
};