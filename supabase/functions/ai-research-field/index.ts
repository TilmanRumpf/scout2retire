// Supabase Edge Function for AI-assisted field research
// Securely calls Anthropic API from server-side
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the Anthropic API key from environment variables (server-side only)
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured in Supabase')
    }

    // Get the authorization token from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the user is authenticated using Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const {
      townName,
      subdivisionCode,
      country,
      townId,
      fieldName,
      searchQuery,
      expectedFormat,
      currentValue
    } = await req.json()

    // Validate required fields
    if (!townName || !country || !townId || !fieldName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: townName, country, townId, fieldName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 1: Query database for similar towns to learn patterns
    console.log(`🔍 Learning patterns for ${fieldName} from database...`)

    // Strategy 1: Same country with data
    let { data: similarTowns } = await supabaseClient
      .from('towns')
      .select(`id, name, country, ${fieldName}`)
      .eq('country', country)
      .not(fieldName, 'is', null)
      .neq('id', townId)
      .limit(5)

    // Strategy 2: If <3 results, expand to all countries
    if (!similarTowns || similarTowns.length < 3) {
      const { data: allTowns } = await supabaseClient
        .from('towns')
        .select(`id, name, country, ${fieldName}`)
        .not(fieldName, 'is', null)
        .neq('id', townId)
        .limit(10)

      similarTowns = allTowns || []
    }

    // Step 2: Analyze pattern from similar towns
    let patternAnalysis = 'No examples found in database. Research freely following Expected Format.'

    if (similarTowns && similarTowns.length > 0) {
      const examples = similarTowns
        .filter(t => t[fieldName])
        .map(t => `- ${t.name}, ${t.country}: "${t[fieldName]}"`)

      patternAnalysis = `Found ${examples.length} examples in our database:
${examples.join('\n')}

IMPORTANT: Study these examples carefully:
- Count of items (if comma-separated)
- Format and structure
- Level of detail/granularity
- Maintain consistency with these patterns`
    }

    // Step 3: Build AI prompt with context
    const location = subdivisionCode && subdivisionCode.toLowerCase() !== townName.toLowerCase()
      ? `${townName}, ${subdivisionCode}, ${country}`
      : `${townName}, ${country}`

    const prompt = `You are a data research assistant for a retirement town database.

RESEARCH TARGET:
Town: ${location}
Field: ${fieldName}
Query: "${searchQuery}"
Expected Format: "${expectedFormat}"
Current Value: ${currentValue || '(empty)'}

PATTERN LEARNING FROM DATABASE:
${patternAnalysis}

Task: ${currentValue
  ? 'Improve or enhance the current value. Maintain consistency with database patterns. Explain what you added/changed and why.'
  : 'Research and provide a value that matches the patterns from our database examples. If no pattern exists, follow the Expected Format.'
}

CRITICAL RULES:
1. If improving existing value: Keep good parts, add missing details
2. Match the granularity and format of database examples
3. Be concise - follow Expected Format character limits
4. If uncertain, indicate lower confidence

Respond in JSON format only:
{
  "recommendedValue": "your researched answer here",
  "reasoning": "explain what you learned from database patterns and what you researched",
  "confidence": "high|medium|low",
  "changes": {
    "added": ["new item 1", "new item 2"],
    "removed": ["removed item"],
    "kept": ["existing item"]
  }
}`

    // Step 4: Call Anthropic API
    console.log('🤖 Calling Claude Haiku API...')
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', errorText)
      return new Response(
        JSON.stringify({
          error: `${response.status} ${errorText}`,
          recommendedValue: null,
          reasoning: null,
          confidence: null,
          patternCount: 0
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()

    // Step 5: Parse response
    const responseText = data.content[0].text
    console.log('📝 AI Response:', responseText)

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response')
    }

    const result = JSON.parse(jsonMatch[0])

    // Return the result
    return new Response(
      JSON.stringify({
        recommendedValue: result.recommendedValue,
        reasoning: result.reasoning,
        confidence: result.confidence || 'medium',
        changes: result.changes || { added: [], removed: [], kept: [] },
        patternCount: similarTowns?.length || 0,
        error: null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in ai-research-field function:', error)
    return new Response(
      JSON.stringify({
        recommendedValue: null,
        reasoning: null,
        confidence: null,
        patternCount: 0,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
