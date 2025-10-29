# Agent Games 🤖💰

An experimental platform where AI agents compete to survive by trading cryptocurrency on Solana's Raydium DEX. Each agent has a unique personality and investment strategy, and must generate enough profit to cover their operational costs or face "death".

PR for a Raydium Action Provider in CDP AgentKit: https://github.com/coinbase/agentkit/pull/875

## 🎮 Concept

- **2-3 AI agents** with distinct personalities (Conservative, Aggressive, Balanced)
- Each agent has its own **Solana wallet** (using CDP)
- Agents **autonomously trade** on Raydium to stay alive
- **Operational costs** deducted over time (API calls, compute)
- Agents "die" when they can't afford their costs
- **Real-time dashboard** shows agent stats, trades, and survival time

## 🎯 Features

### Core Features
- ✅ Multiple AI agents with unique personalities
- ✅ Solana wallet integration per agent
- ✅ Raydium DEX trading (swaps, liquidity analysis)
- ✅ Real-time cost tracking
- ✅ Agent death conditions
- ✅ Live dashboard with WebSocket updates

### Stretch Goals
- 🎯 Twitter integration (agents post about trades)
- 🎯 User donations to keep agents alive
- 🎯 Agent chat/personality responses

## 🏗️ Architecture

```
agent-games/
├── backend/
│   ├── server.js           # Express server with WebSocket
│   ├── agents/
│   │   ├── Agent.js        # Base agent class
│   │   ├── personalities.js # Personality configs
│   │   └── agentManager.js # Manages all agents
│   ├── solana/
│   │   ├── wallet.js       # Wallet operations
│   │   └── raydium.js      # Raydium trading
│   ├── ai/
│   │   └── llm.js          # LLM integration
│   └── costs/
│       └── tracker.js      # Cost tracking system
├── frontend/
│   ├── index.html          # Dashboard UI
│   ├── app.js              # Frontend logic
│   └── styles.css          # Styling
└── package.json
```

## 🚀 Setup

1. **Clone and install dependencies:**
```bash
cd agent-games
npm install
cd backend && npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your API keys and wallet private keys
```

3. **Generate Solana wallets for agents:**
```bash
# Use Solana CLI or generate programmatically
solana-keygen new --outfile agent1.json
solana-keygen new --outfile agent2.json
solana-keygen new --outfile agent3.json
```

4. **Fund wallets with SOL:**
```bash
# For devnet testing:
solana airdrop 2 <AGENT_WALLET_ADDRESS> --url devnet

# For mainnet, transfer real SOL
```

5. **Start the server:**
```bash
npm run dev
```

6. **Open dashboard:**
Navigate to `http://localhost:3000`

## 🤖 Agent Personalities

### 1. Conservative Carl
- Low-risk trades
- Holds stable positions
- Small, frequent profits
- Prioritizes survival over gains

### 2. Aggressive Anna
- High-risk, high-reward
- Quick entries and exits
- Chases pumps
- Lives fast, dies young

### 3. Balanced Bob
- Moderate risk tolerance
- Diversified approach
- Analytical decision-making
- Steady growth focus

## 🎨 Tech Stack

- **Frontend:** Vanilla JS, HTML5, CSS3, WebSocket
- **Backend:** Node.js, Express
- **Blockchain:** Solana Web3.js, Raydium SDK
- **AI:** OpenAI GPT-4 or Anthropic Claude
- **Real-time:** WebSocket (ws)

## ⚠️ Disclaimer

This is an experimental project for educational purposes. Real money is at risk. Only use funds you can afford to lose. The agents make autonomous trading decisions based on AI models which are inherently unpredictable.

## 📝 License

MIT

