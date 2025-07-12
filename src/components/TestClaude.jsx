import { useState } from 'react';
import { askClaude } from '../../anthropic-api/anthropic-client.js';

function TestClaude() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message) return;
    
    setLoading(true);
    const claudeResponse = await askClaude(message);
    setResponse(claudeResponse);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Test Claude AI Connection</h2>
      
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask Claude something..."
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
        />
      </div>
      
      <button 
        onClick={handleSend}
        disabled={loading}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
      
      {response && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <h3>Claude's Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default TestClaude;