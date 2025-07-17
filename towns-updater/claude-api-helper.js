// Claude API Helper for Scout2Retire

export async function callClaude(prompt, maxTokens = 150) {
  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY
  
  if (!CLAUDE_API_KEY) {
    console.error('❌ Missing CLAUDE_API_KEY in .env file')
    return null
  }
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: maxTokens,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    return data.content[0].text
  } catch (error) {
    console.error('Claude API error:', error)
    return null
  }
}

// Batch multiple prompts efficiently
export async function batchCallClaude(prompts, maxTokensEach = 150) {
  const results = []
  
  for (const prompt of prompts) {
    const result = await callClaude(prompt, maxTokensEach)
    results.push(result)
    
    // Respect rate limits (adjust as needed)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return results
}