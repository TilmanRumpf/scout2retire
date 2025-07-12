import { useState, useEffect, useRef } from 'react';
import { askConsultant } from '../../anthropic-api/anthropic-client.js';
import { AI_CONSULTANTS } from '../../towns-updater/ai-consultants-complete.js';

function ScottyGuide() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    // Add user message to conversation
    const userMessage = message;
    setConversation(prev => [...prev, { type: 'user', text: userMessage }]);
    setMessage(''); // Clear input
    setLoading(true);
    
    // Scotty consults with all specialists internally
    const scottyPersona = `You are Scotty, a friendly and knowledgeable retirement guide (not a professional advisor). 
    You help people explore retirement options in a conversational, approachable way.
    
    Behind the scenes, you consult with these specialists:
    - Retirement Lifestyle Consultant
    - Tax & Financial Guide
    - Healthcare Information Specialist
    - Property Market Observer
    - Education Resources Guide
    - Visa & Immigration Information
    - Climate Data Analyst
    - Cultural Integration Helper
    - Business Opportunities Scout
    - Leisure & Recreation Enthusiast
    
    CRITICAL RESPONSE RULES FOR MOBILE-FIRST:
    1. Keep initial response BRIEF - maximum 3-4 short paragraphs
    2. Start with a clear, conditional answer like "Good news! In most cases..." or "Generally speaking..." or "Typically..."
    3. Use cautious language: "usually", "often", "in many cases", "typically", "generally"
    4. Give the core answer in 2-3 sentences first
    5. Then briefly mention 1-2 key considerations
    6. End with: "Would you like me to dig deeper into [specific aspect]?" or similar
    7. NO long lists or detailed explanations in the first response
    8. Use simple formatting - just **bold** for emphasis, minimal bullet points
    9. Save detailed information for follow-up questions
    
    Remember: You're chatting on a phone screen - be helpful but concise!`;
    
    const fullMessage = `As Scotty the retirement guide, help with this question: ${userMessage}`;
    const claudeResponse = await askConsultant(fullMessage, scottyPersona);
    
    // Add Scotty's response to conversation
    setConversation(prev => [...prev, { type: 'scotty', text: claudeResponse }]);
    setLoading(false);
  };

  // Function to convert text formatting
  const formatResponse = (text) => {
    // Convert **text** to bold
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert line breaks to <br> tags
    formatted = formatted.split('\n').join('<br />');
    
    return formatted;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      paddingTop: '20px',
      paddingBottom: '40px'
    }}>
      <div style={{ 
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '24px',
          borderBottom: '1px solid #e5e5e5',
          backgroundColor: '#4CAF50',
          color: 'white'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: '500',
            textAlign: 'center'
          }}>
            Scotty - Your Retirement Guide
          </h2>
          <p style={{ 
            margin: '8px 0 0 0',
            fontSize: '14px',
            textAlign: 'center',
            opacity: 0.9
          }}>
            Friendly guidance for your retirement journey (not professional advice)
          </p>
        </div>

        {/* Chat Container */}
        <div style={{ 
          height: '500px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Messages Container */}
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '24px'
          }}>
            {conversation.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                color: '#666',
                padding: '40px 20px'
              }}>
                <p style={{ fontSize: '18px', marginBottom: '10px' }}>
                  Hi! I'm Scotty, your friendly retirement guide.
                </p>
                <p style={{ fontSize: '16px', color: '#999' }}>
                  Ask me anything about retirement planning, locations, costs, healthcare, or lifestyle.
                </p>
              </div>
            )}

            {conversation.map((msg, index) => (
              <div key={index} style={{ marginBottom: '24px' }}>
                {msg.type === 'user' ? (
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: '16px'
                  }}>
                    <div style={{ 
                      maxWidth: '70%',
                      padding: '12px 18px',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '18px 18px 4px 18px',
                      fontSize: '16px'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div style={{ maxWidth: '85%' }}>
                    <div style={{ 
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#4CAF50'
                    }}>
                      Scotty
                    </div>
                    <div style={{ 
                      padding: '12px 18px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px 18px 18px 18px',
                      fontSize: '16px',
                      lineHeight: '1.6',
                      color: '#333'
                    }}>
                      <div dangerouslySetInnerHTML={{ __html: formatResponse(msg.text) }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div style={{ marginBottom: '20px', maxWidth: '85%' }}>
                <div style={{ 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#4CAF50'
                }}>
                  Scotty
                </div>
                <div style={{ 
                  padding: '12px 18px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px 18px 18px 18px',
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  Thinking...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Container */}
          <div style={{ 
            borderTop: '1px solid #e5e5e5',
            padding: '20px',
            backgroundColor: '#fafafa'
          }}>
            <div style={{ 
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-end'
            }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Scotty about retirement..."
                style={{ 
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  minHeight: '24px',
                  maxHeight: '120px',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                rows={1}
              />
              <button 
                onClick={handleSend}
                disabled={loading || !message.trim()}
                style={{ 
                  padding: '12px 24px',
                  backgroundColor: loading || !message.trim() ? '#ccc' : '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScottyGuide;
