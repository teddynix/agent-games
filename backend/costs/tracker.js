export class CostTracker {
  constructor(agentId) {
    this.agentId = agentId;
    this.startTime = Date.now();
    
    // Cost rates (in SOL)
    this.operationCostPerHour = parseFloat(process.env.AGENT_OPERATION_COST_PER_HOUR || 0.001);
    this.aiCallCost = parseFloat(process.env.AI_API_COST_PER_DECISION || 0.0001);
    
    // Tracking
    this.totalAICalls = 0;
    this.totalAICost = 0;
    this.totalTradingFees = 0;
    this.totalOperationCost = 0;
  }
  
  getOperationTime() {
    return Date.now() - this.startTime;
  }
  
  getOperationTimeHours() {
    return this.getOperationTime() / (1000 * 60 * 60);
  }
  
  getOperationCost() {
    const hours = this.getOperationTimeHours();
    return hours * this.operationCostPerHour;
  }
  
  getAICallCost() {
    return this.aiCallCost;
  }
  
  addAICallCost() {
    this.totalAICalls++;
    this.totalAICost += this.aiCallCost;
  }
  
  addTradingCost(fees) {
    this.totalTradingFees += fees;
  }
  
  getCurrentCosts() {
    const operationCost = this.getOperationCost();
    this.totalOperationCost = operationCost;
    
    return {
      operation: operationCost,
      aiCalls: this.totalAICost,
      trading: this.totalTradingFees,
      total: operationCost + this.totalAICost + this.totalTradingFees
    };
  }
  
  getMinimumBalance() {
    // Agent needs at least enough for 1 hour of operation + 1 AI call + typical trading fees
    return this.operationCostPerHour + this.aiCallCost + 0.005; // 0.005 SOL for transaction fees
  }
  
  getCostBreakdown() {
    const costs = this.getCurrentCosts();
    
    return {
      operationTime: this.getOperationTime(),
      operationTimeHours: this.getOperationTimeHours(),
      totalAICalls: this.totalAICalls,
      costs: costs,
      minimumRequired: this.getMinimumBalance()
    };
  }
  
  reset() {
    this.startTime = Date.now();
    this.totalAICalls = 0;
    this.totalAICost = 0;
    this.totalTradingFees = 0;
    this.totalOperationCost = 0;
  }
}

