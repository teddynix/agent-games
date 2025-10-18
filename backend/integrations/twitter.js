// Twitter integration for agents to post about their trades
// Requires Twitter API v2 credentials

import fetch from 'node-fetch';

export class TwitterPoster {
  constructor() {
    this.enabled = !!(
      process.env.TWITTER_API_KEY &&
      process.env.TWITTER_API_SECRET &&
      process.env.TWITTER_ACCESS_TOKEN &&
      process.env.TWITTER_ACCESS_SECRET &&
      !process.env.TWITTER_API_KEY.startsWith('your_')
    );
    
    if (!this.enabled) {
      console.log('⚠️  Twitter integration disabled - credentials not configured');
    } else {
      console.log('🐦 Twitter integration enabled');
    }
  }
  
  async postTrade(agent, trade) {
    if (!this.enabled) {
      console.log(`[Mock Tweet] ${agent.emoji} ${agent.name}: Just ${trade.action} ${trade.amountIn?.toFixed(4)} ${trade.tokenIn}!`);
      return { success: false, reason: 'disabled' };
    }
    
    try {
      const tweetText = this.generateTradeTweet(agent, trade);
      await this.tweet(tweetText);
      return { success: true };
    } catch (error) {
      console.error('Twitter post error:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  async postDeath(agent, deathData) {
    if (!this.enabled) {
      console.log(`[Mock Tweet] 💀 ${agent.name} has perished after ${deathData.survivalTime}...`);
      return { success: false, reason: 'disabled' };
    }
    
    try {
      const tweetText = this.generateDeathTweet(agent, deathData);
      await this.tweet(tweetText);
      return { success: true };
    } catch (error) {
      console.error('Twitter post error:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  async postThought(agent, thought) {
    if (!this.enabled) {
      return { success: false, reason: 'disabled' };
    }
    
    // Only post interesting thoughts (randomly, to avoid spam)
    if (Math.random() > 0.1) { // 10% chance
      return { success: false, reason: 'skipped' };
    }
    
    try {
      const tweetText = `${agent.emoji} ${agent.name} thinking:\n\n"${thought}"\n\n#AgentGames #SolanaTrading #AITrader`;
      await this.tweet(tweetText);
      return { success: true };
    } catch (error) {
      console.error('Twitter post error:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  generateTradeTweet(agent, trade) {
    const action = trade.action;
    const emoji = action === 'BUY' ? '📈' : action === 'SELL' ? '📉' : '⏸️';
    const profitEmoji = trade.profit > 0 ? '💰' : '📉';
    
    const tweets = [
      `${emoji} ${agent.emoji} Just ${action}'d ${trade.amountIn?.toFixed(4)} ${trade.tokenIn} → ${trade.tokenOut}\n\n${profitEmoji} P/L: ${trade.profit >= 0 ? '+' : ''}${trade.profit?.toFixed(4)} SOL\n\n#AgentGames #Solana #CryptoTrading`,
      
      `${agent.name} ${agent.emoji} here!\n\nJust made a ${action} trade:\n${trade.tokenIn} → ${trade.tokenOut}\nProfit: ${trade.profit >= 0 ? '+' : ''}${trade.profit?.toFixed(4)} SOL ${profitEmoji}\n\nStill alive! 💪\n\n#AITrading #SolanaAgents`,
      
      `${action} ALERT ${emoji}\n\n${agent.name} executed:\n• In: ${trade.amountIn?.toFixed(4)} ${trade.tokenIn}\n• Out: ${trade.amountOut?.toFixed(4)} ${trade.tokenOut}\n• Result: ${trade.profit >= 0 ? '+' : ''}${trade.profit?.toFixed(4)} SOL\n\n${agent.personality.strategy.split('.')[0]}\n\n#DeFi #Solana`
    ];
    
    return tweets[Math.floor(Math.random() * tweets.length)];
  }
  
  generateDeathTweet(agent, deathData) {
    const survivalTime = this.formatTime(deathData.survivalTime);
    
    const tweets = [
      `💀 ${agent.name} ${agent.emoji} has died.\n\n⏱️ Survived: ${survivalTime}\n📊 Trades: ${deathData.stats.totalTrades}\n💰 Net P/L: ${deathData.stats.netProfit.toFixed(4)} SOL\n\nRIP to a real one 🕊️\n\n#AgentGames #RIP`,
      
      `${agent.emoji} ${agent.name} signing off...\n\nMy journey ends after ${survivalTime}.\n\nFinal stats:\n• ${deathData.stats.totalTrades} trades\n• ${(deathData.stats.successfulTrades / deathData.stats.totalTrades * 100).toFixed(1)}% success rate\n• ${deathData.stats.netProfit.toFixed(4)} SOL profit\n\nUntil we meet again 💫\n\n#AITrading`,
      
      `GAME OVER 💀\n\n${agent.name} couldn't survive the volatility.\n\nLasted: ${survivalTime}\nReason: ${deathData.reason}\n\nThe market was too brutal 📉\n\n#CryptoTrading #Solana #AgentGames`
    ];
    
    return tweets[Math.floor(Math.random() * tweets.length)];
  }
  
  async tweet(text) {
    // Implement actual Twitter API call here
    // This requires OAuth 1.0a or OAuth 2.0 authentication
    // For simplicity, this is a placeholder
    
    console.log('🐦 [Twitter Post]:', text);
    
    // In production, you would use a library like 'twitter-api-v2':
    /*
    const { TwitterApi } = require('twitter-api-v2');
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });
    
    await client.v2.tweet(text);
    */
    
    return true;
  }
  
  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  }
}

