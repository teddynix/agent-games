import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
}) : null;

export async function getLLMDecision(systemPrompt, context) {
  // Try Anthropic first, fallback to OpenAI, then to mock
  if (anthropic) {
    return await getAnthropicDecision(systemPrompt, context);
  } else if (openai) {
    return await getOpenAIDecision(systemPrompt, context);
  } else {
    console.warn('⚠️  No AI API configured, using mock decisions');
    return getMockDecision(context);
  }
}

async function getAnthropicDecision(systemPrompt, context) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Current trading context:
Balance: ${context.balance} SOL
Current costs: ${context.costs.total} SOL
Market sentiment: ${context.marketData.marketSentiment}
Recent trades: ${context.recentTrades.length}
Success rate: ${context.performance.successRate}%
Net profit: ${context.performance.netProfit} SOL

Market overview:
${context.marketData.tokens.map(t => `${t.symbol}: $${t.price} (${t.change24h > 0 ? '+' : ''}${t.change24h}%)`).join('\n')}

Based on your personality and current situation, what trading action should you take?
Respond ONLY with valid JSON in this format:
{
  "action": "BUY" | "SELL" | "HOLD",
  "tokenIn": "token symbol",
  "tokenOut": "token symbol",
  "amount": 0.1,
  "reasoning": "explanation of decision"
}`
      }]
    });
    
    const response = message.content[0].text;
    const decision = parseDecisionResponse(response);
    
    return decision;
  } catch (error) {
    console.error('Anthropic API error:', error.message);
    return getMockDecision(context);
  }
}

async function getOpenAIDecision(systemPrompt, context) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Current trading context:
Balance: ${context.balance} SOL
Current costs: ${context.costs.total} SOL
Market sentiment: ${context.marketData.marketSentiment}
Recent trades: ${context.recentTrades.length}
Success rate: ${context.performance.successRate}%
Net profit: ${context.performance.netProfit} SOL

Market overview:
${context.marketData.tokens.map(t => `${t.symbol}: $${t.price} (${t.change24h > 0 ? '+' : ''}${t.change24h}%)`).join('\n')}

Based on your personality and current situation, what trading action should you take?
Respond ONLY with valid JSON in this format:
{
  "action": "BUY" | "SELL" | "HOLD",
  "tokenIn": "token symbol",
  "tokenOut": "token symbol",
  "amount": 0.1,
  "reasoning": "explanation of decision"
}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    const response = completion.choices[0].message.content;
    const decision = parseDecisionResponse(response);
    
    return decision;
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return getMockDecision(context);
  }
}

function parseDecisionResponse(response) {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response.trim();
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
    }
    
    const decision = JSON.parse(jsonStr);
    
    // Validate decision structure
    if (!decision.action || !['BUY', 'SELL', 'HOLD'].includes(decision.action)) {
      throw new Error('Invalid action');
    }
    
    return decision;
  } catch (error) {
    console.error('Error parsing LLM response:', error.message);
    throw error;
  }
}

function getMockDecision(context) {
  // Generate a simple mock decision based on context
  const actions = ['BUY', 'SELL', 'HOLD'];
  const tokens = ['SOL', 'USDC', 'RAY', 'BONK'];
  
  // More likely to HOLD if balance is low
  const holdProbability = context.balance < 0.1 ? 0.7 : 0.4;
  
  const rand = Math.random();
  let action;
  if (rand < holdProbability) {
    action = 'HOLD';
  } else if (rand < (holdProbability + (1 - holdProbability) / 2)) {
    action = 'BUY';
  } else {
    action = 'SELL';
  }
  
  const amount = context.balance * 0.1 * Math.random(); // Random amount up to 10% of balance
  
  return {
    action: action,
    tokenIn: action === 'BUY' ? 'SOL' : tokens[Math.floor(Math.random() * tokens.length)],
    tokenOut: action === 'BUY' ? tokens[Math.floor(Math.random() * tokens.length)] : 'SOL',
    amount: amount,
    reasoning: `Mock decision: ${action} ${amount.toFixed(4)} tokens. Market is ${context.marketData.marketSentiment}.`
  };
}

