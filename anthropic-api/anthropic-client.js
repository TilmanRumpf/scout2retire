import Anthropic from '@anthropic-ai/sdk';

// Get your API key from the .env file
const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

// Create the Anthropic client
const anthropic = new Anthropic({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
});

// Function to send a message to Claude with a specific consultant persona
export async function askConsultant(message, consultantPersona = '') {
  try {
    const systemPrompt = consultantPersona || 'You are a helpful assistant.';
    
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: message
        }
      ]
    });
    
    return response.content[0].text;
  } catch (error) {
    console.error('Error talking to Claude:', error);
    return 'Sorry, there was an error connecting to Claude.';
  }
}

// Keep the original function for backward compatibility
export async function askClaude(message) {
  return askConsultant(message);
}