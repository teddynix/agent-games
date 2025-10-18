import { EventEmitter } from 'events';
import { Agent } from './Agent.js';
import { getAllPersonalities } from './personalities.js';

export class AgentManager extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.isRunning = false;
    this.updateInterval = null;
    this.decisionInterval = null;
  }
  
  async initialize() {
    console.log('🎮 Initializing Agent Games with CDP Wallets...');
    
    const personalities = getAllPersonalities();
    const walletIds = [
      process.env.AGENT_1_WALLET_ID,
      process.env.AGENT_2_WALLET_ID,
      process.env.AGENT_3_WALLET_ID
    ];
    
    // Verify CDP credentials
    if (!process.env.CDP_API_KEY_NAME || !process.env.CDP_API_KEY_PRIVATE_KEY) {
      console.error('❌ CDP API credentials not found in .env file!');
      console.error('   Please add CDP_API_KEY_NAME and CDP_API_KEY_PRIVATE_KEY');
      console.error('   Get your credentials from: https://portal.cdp.coinbase.com/');
      return false;
    }
    
    // Create agents
    for (let i = 0; i < Math.min(personalities.length, walletIds.length); i++) {
      if (!walletIds[i] || walletIds[i].startsWith('your_')) {
        console.warn(`⚠️  Skipping agent ${i + 1}: No wallet ID configured`);
        console.warn(`   Run 'npm run create-cdp-wallets' to generate wallet IDs`);
        continue;
      }
      
      try {
        const agent = new Agent(personalities[i], walletIds[i]);
        
        // Forward agent events
        agent.on('thinking', (data) => this.emit('update', data));
        agent.on('trade', (data) => this.emit('trade', data));
        agent.on('death', (data) => this.emit('death', data));
        agent.on('donation', (data) => this.emit('update', data));
        
        await agent.initialize();
        this.agents.set(agent.id, agent);
        
        console.log(`✅ ${agent.emoji} ${agent.name} ready to trade`);
      } catch (error) {
        console.error(`❌ Failed to create agent ${i + 1}:`, error.message);
      }
    }
    
    if (this.agents.size === 0) {
      console.error('❌ No agents initialized. Please run: npm run create-cdp-wallets');
      return false;
    }
    
    console.log(`🎮 ${this.agents.size} agents initialized and ready`);
    return true;
  }
  
  async start() {
    if (this.isRunning) {
      return;
    }
    
    const initialized = await this.initialize();
    if (!initialized) {
      console.error('❌ Failed to start: No agents initialized');
      return;
    }
    
    this.isRunning = true;
    console.log('🚀 Agent Games started!');
    
    // Regular status updates (every 30 seconds)
    this.updateInterval = setInterval(async () => {
      await this.updateAllAgents();
    }, 30000);
    
    // Agent decision making (every 2-5 minutes, varies by personality)
    this.decisionInterval = setInterval(async () => {
      await this.makeDecisions();
    }, 120000); // Check every 2 minutes
    
    // Initial update
    await this.updateAllAgents();
  }
  
  async stop() {
    this.isRunning = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    if (this.decisionInterval) {
      clearInterval(this.decisionInterval);
      this.decisionInterval = null;
    }
    
    console.log('🛑 Agent Games stopped');
  }
  
  async updateAllAgents() {
    for (const agent of this.agents.values()) {
      if (agent.isAlive) {
        await agent.checkSurvival();
        
        // Emit update
        this.emit('update', {
          agentId: agent.id,
          status: agent.getStatus()
        });
      }
    }
  }
  
  async makeDecisions() {
    for (const agent of this.agents.values()) {
      if (!agent.isAlive) {
        continue;
      }
      
      // Each agent has different decision frequency based on personality
      const shouldDecide = Math.random() < agent.traits.tradeFrequency;
      
      if (shouldDecide) {
        console.log(`🧠 ${agent.name} is thinking...`);
        
        const decision = await agent.think();
        
        if (decision && decision.action !== 'HOLD') {
          await agent.executeTrade(decision);
        } else if (decision) {
          console.log(`⏸️  ${agent.name} decided to HOLD`);
        }
      }
    }
  }
  
  async getAgentsStatus() {
    const status = [];
    for (const agent of this.agents.values()) {
      status.push(await agent.getStatus());
    }
    return status;
  }
  
  async getAgentStatus(agentId) {
    const agent = this.agents.get(agentId);
    return agent ? await agent.getStatus() : null;
  }
  
  async donateToAgent(agentId, amount) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }
    
    if (!agent.isAlive) {
      throw new Error('Cannot donate to a dead agent');
    }
    
    await agent.receiveDonation(amount);
    
    return {
      success: true,
      agentId: agentId,
      amount: amount,
      newBalance: agent.balance
    };
  }
  
  async resetAllAgents() {
    await this.stop();
    this.agents.clear();
    await this.start();
  }
  
  getAliveAgents() {
    return Array.from(this.agents.values()).filter(agent => agent.isAlive);
  }
  
  getDeadAgents() {
    return Array.from(this.agents.values()).filter(agent => !agent.isAlive);
  }
}

