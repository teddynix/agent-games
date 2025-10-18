import { EventEmitter } from 'events';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { getLLMDecision } from '../ai/llm.js';
import { CostTracker } from '../costs/tracker.js';
import { RaydiumTrader } from '../solana/raydium.js';
import { CDPWallet } from '../solana/cdp-wallet.js';
import { TwitterPoster } from '../integrations/twitter.js';

export class Agent extends EventEmitter {
  constructor(personality, walletId) {
    super();
    
    this.id = personality.id;
    this.name = personality.name;
    this.emoji = personality.emoji;
    this.description = personality.description;
    this.personality = personality;
    this.traits = personality.traits;
    
    // Initialize CDP wallet
    this.wallet = new CDPWallet(walletId);
    this.balance = 0;
    this.walletInitialized = false;
    
    // Trading components
    this.trader = new RaydiumTrader(this.wallet);
    this.costTracker = new CostTracker(this.id);
    this.twitter = new TwitterPoster();
    
    // Agent state
    this.isAlive = true;
    this.startTime = Date.now();
    this.deathTime = null;
    this.lastDecisionTime = null;
    
    // Trading history
    this.trades = [];
    this.totalTrades = 0;
    this.successfulTrades = 0;
    this.failedTrades = 0;
    this.totalProfit = 0;
    this.totalLoss = 0;
    
    // Current positions
    this.positions = [];
    
    // Decision making
    this.isThinking = false;
    this.lastThought = null;
    
    console.log(`🤖 ${this.emoji} ${this.name} initialized`);
  }
  
  async initialize() {
    try {
      // Initialize CDP wallet
      await this.wallet.initialize();
      this.walletInitialized = true;
      
      // Get initial balance
      await this.updateBalance();
      console.log(`💰 ${this.name} starting balance: ${this.balance} SOL`);
      console.log(`🏦 Wallet address: ${await this.wallet.getPublicKey()}`);
      
      // Check if agent has enough to operate
      if (this.balance < 0.01) {
        console.warn(`⚠️  ${this.name} has insufficient funds (${this.balance} SOL)`);
        console.warn(`   Fund this address: ${await this.wallet.getPublicKey()}`);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to initialize ${this.name}:`, error.message);
      return false;
    }
  }
  
  async updateBalance() {
    this.balance = await this.wallet.getBalance();
    return this.balance;
  }
  
  async think() {
    if (!this.isAlive || this.isThinking) {
      return null;
    }
    
    this.isThinking = true;
    this.lastDecisionTime = Date.now();
    
    try {
      // Update current balance and costs
      await this.updateBalance();
      const currentCosts = this.costTracker.getCurrentCosts();
      
      // Check if agent can afford to think (AI API call)
      const thinkingCost = this.costTracker.getAICallCost();
      if (this.balance < currentCosts + thinkingCost) {
        await this.die('Insufficient funds for decision making');
        return null;
      }
      
      // Get market data
      const marketData = await this.trader.getMarketOverview();
      
      // Prepare context for AI
      const context = {
        balance: this.balance,
        costs: currentCosts,
        positions: this.positions,
        recentTrades: this.trades.slice(-5),
        marketData: marketData,
        traits: this.traits,
        survivalTime: Date.now() - this.startTime,
        performance: {
          totalTrades: this.totalTrades,
          successRate: this.totalTrades > 0 ? (this.successfulTrades / this.totalTrades) : 0,
          netProfit: this.totalProfit - this.totalLoss
        }
      };
      
      // Get AI decision
      const decision = await getLLMDecision(
        this.personality.systemPrompt,
        context
      );
      
      this.lastThought = decision.reasoning;
      
      // Track AI API cost
      this.costTracker.addAICallCost();
      
      // Emit thinking event
      this.emit('thinking', {
        agentId: this.id,
        thought: this.lastThought,
        decision: decision.action
      });
      
      // Optionally post thought to Twitter
      await this.twitter.postThought(this, this.lastThought);
      
      return decision;
    } catch (error) {
      console.error(`❌ ${this.name} thinking error:`, error.message);
      return null;
    } finally {
      this.isThinking = false;
    }
  }
  
  async executeTrade(decision) {
    if (!this.isAlive || !decision) {
      return false;
    }
    
    try {
      const tradeResult = await this.trader.executeDecision(decision, this.balance);
      
      if (tradeResult.success) {
        const trade = {
          id: `trade-${Date.now()}`,
          timestamp: Date.now(),
          action: decision.action,
          tokenIn: tradeResult.tokenIn,
          tokenOut: tradeResult.tokenOut,
          amountIn: tradeResult.amountIn,
          amountOut: tradeResult.amountOut,
          profit: tradeResult.profit || 0,
          status: 'completed'
        };
        
        this.trades.push(trade);
        this.totalTrades++;
        
        if (tradeResult.profit > 0) {
          this.successfulTrades++;
          this.totalProfit += tradeResult.profit;
        } else {
          this.failedTrades++;
          this.totalLoss += Math.abs(tradeResult.profit || 0);
        }
        
        // Update balance after trade
        await this.updateBalance();
        
        // Track trading costs
        this.costTracker.addTradingCost(tradeResult.fees || 0);
        
        // Emit trade event
        this.emit('trade', {
          agentId: this.id,
          trade: trade
        });
        
        // Post trade to Twitter
        await this.twitter.postTrade(this, trade);
        
        console.log(`✅ ${this.name} executed trade: ${decision.action}`);
        return true;
      } else {
        console.log(`⚠️  ${this.name} trade failed: ${tradeResult.error}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ ${this.name} trade execution error:`, error.message);
      return false;
    }
  }
  
  async checkSurvival() {
    if (!this.isAlive) {
      return false;
    }
    
    await this.updateBalance();
    const currentCosts = this.costTracker.getCurrentCosts();
    const minimumRequired = this.costTracker.getMinimumBalance();
    
    // Check if agent can afford next hour of operation
    if (this.balance < currentCosts || this.balance < minimumRequired) {
      await this.die('Insufficient funds to continue operations');
      return false;
    }
    
    return true;
  }
  
  async die(reason) {
    if (!this.isAlive) {
      return;
    }
    
    this.isAlive = false;
    this.deathTime = Date.now();
    const survivalTime = this.deathTime - this.startTime;
    
    console.log(`💀 ${this.emoji} ${this.name} has died: ${reason}`);
    console.log(`⏱️  Survived for: ${this.formatTime(survivalTime)}`);
    console.log(`📊 Final stats: ${this.totalTrades} trades, ${this.successfulTrades} successful`);
    
    const deathData = {
      agentId: this.id,
      name: this.name,
      reason: reason,
      survivalTime: survivalTime,
      finalBalance: this.balance,
      stats: {
        totalTrades: this.totalTrades,
        successfulTrades: this.successfulTrades,
        failedTrades: this.failedTrades,
        netProfit: this.totalProfit - this.totalLoss
      }
    };
    
    this.emit('death', deathData);
    
    // Post death announcement to Twitter
    await this.twitter.postDeath(this, deathData);
  }
  
  async receiveDonation(amount) {
    // In a real implementation, this would transfer SOL to the agent's wallet
    // For now, we'll simulate it
    this.balance += amount;
    console.log(`💝 ${this.name} received donation: ${amount} SOL`);
    
    this.emit('donation', {
      agentId: this.id,
      amount: amount,
      newBalance: this.balance
    });
  }
  
  async getStatus() {
    const survivalTime = this.isAlive 
      ? Date.now() - this.startTime 
      : this.deathTime - this.startTime;
    
    let walletAddress = 'Not initialized';
    try {
      if (this.walletInitialized) {
        walletAddress = await this.wallet.getPublicKey();
      }
    } catch (error) {
      console.error('Error getting wallet address:', error.message);
    }
    
    return {
      id: this.id,
      name: this.name,
      emoji: this.emoji,
      description: this.description,
      isAlive: this.isAlive,
      balance: this.balance,
      survivalTime: survivalTime,
      survivalTimeFormatted: this.formatTime(survivalTime),
      costs: this.costTracker.getCurrentCosts(),
      totalTrades: this.totalTrades,
      successfulTrades: this.successfulTrades,
      failedTrades: this.failedTrades,
      successRate: this.totalTrades > 0 ? (this.successfulTrades / this.totalTrades * 100).toFixed(1) : 0,
      netProfit: this.totalProfit - this.totalLoss,
      recentTrades: this.trades.slice(-5),
      positions: this.positions,
      lastThought: this.lastThought,
      walletAddress: walletAddress,
      walletId: this.wallet.getWalletId()
    };
  }
  
  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

