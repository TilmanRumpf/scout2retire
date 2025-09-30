import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to send a message to Claude via secure Edge Function
export async function askConsultant(message, consultantPersona = '', conversationHistory = null) {
  try {
    // Get the current user's session for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Authentication required:', sessionError);
      return 'Please log in to chat with Scotty.';
    }

    // Call the Edge Function with authentication
    const { data, error } = await supabase.functions.invoke('chat-with-scotty', {
      body: {
        message,
        consultantPersona: consultantPersona || 'You are Scotty, a helpful retirement planning assistant.',
        conversationHistory
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error('Error calling Edge Function:', error);
      return 'Sorry, there was an error connecting to Scotty.';
    }

    // Extract the text response from Claude's API format
    if (data && data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text;
    }

    console.error('Unexpected response format:', data);
    return 'Sorry, there was an error processing the response.';

  } catch (error) {
    console.error('Error talking to Claude:', error);
    return 'Sorry, there was an error connecting to Scotty.';
  }
}

// Keep the original function for backward compatibility
export async function askClaude(message) {
  return askConsultant(message);
}