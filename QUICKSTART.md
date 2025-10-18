# 🚀 Agent Games - Quick Start

Get your AI agents trading in 5 minutes!

## Quick Setup (Copy & Paste)

### 1. Install Dependencies
```bash
cd agent-games
npm install
cd backend
npm install
cd ..
```

### 2. Generate Wallets
```bash
npm run generate-wallets
```

This will output 3 wallet keypairs. **Save these somewhere secure!**

### 3. Create .env File

Create a file called `.env` in the `agent-games` directory:

```env
PORT=3000

# Get a free API key from https://platform.openai.com/
OPENAI_API_KEY=your_key_here

# Use devnet for testing (free)
SOLANA_RPC_URL=https://api.devnet.solana.com

# Paste your agent private keys from step 2 (Base58 format)
AGENT_1_PRIVATE_KEY=paste_here
AGENT_2_PRIVATE_KEY=paste_here
AGENT_3_PRIVATE_KEY=paste_here

# Default costs
AGENT_OPERATION_COST_PER_HOUR=0.001
AI_API_COST_PER_DECISION=0.0001
```

### 4. Fund Wallets (Devnet - Free!)

Using the public keys from step 2:

```bash
# Install Solana CLI if you haven't
# Windows (PowerShell as Admin):
cmd /c "curl https://release.solana.com/v1.17.0/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe && C:\solana-install-tmp\solana-install-init.exe v1.17.0"

# Then airdrop to each agent:
solana airdrop 2 AGENT_1_PUBLIC_KEY --url devnet
solana airdrop 2 AGENT_2_PUBLIC_KEY --url devnet
solana airdrop 2 AGENT_3_PUBLIC_KEY --url devnet
```

Or use the Solana Faucet website: https://faucet.solana.com/

### 5. Start the Game!
```bash
npm start
```

Open your browser to: **http://localhost:3000**

## What You'll See

- **3 AI Agents** with different trading personalities
- **Real-time dashboard** showing balances, trades, and survival time
- **Live activity feed** as agents make decisions
- **Agent stats** including success rate and net profit

## Agent Personalities

### 🛡️ Conservative Carl
- Safe trades, small positions
- Will probably survive the longest
- Lower profits but steady

### ⚡ Aggressive Anna  
- Big risks, big rewards (or losses!)
- Exciting to watch
- May die quickly or moon 🚀

### ⚖️ Balanced Bob
- Moderate approach
- Analyzes before trading
- Good middle ground

## Troubleshooting

### "No agents initialized"
→ Check your `.env` file has all 3 private keys correctly pasted

### "Insufficient funds"
→ Airdrop more devnet SOL to your agent wallets

### "API Error"
→ Check your OpenAI API key is valid

### Can't connect to WebSocket
→ Make sure the backend is running (`npm start`)

## Next Steps

1. **Watch them trade!** Monitor the dashboard
2. **Check the logs** Terminal shows detailed agent thinking
3. **Tweak personalities** Edit `backend/agents/personalities.js`
4. **Go to mainnet** When ready, fund with real SOL (⚠️ risky!)

## ⚠️ Important Notes

- **Devnet = Testing** - Free SOL, no real money at risk
- **Mainnet = Real** - Agents trade with real money!
- **Start small** - Even on mainnet, start with 0.1 SOL per agent
- **Monitor closely** - Agents can lose funds quickly

## Need Help?

1. Read the full [SETUP.md](./SETUP.md) for detailed instructions
2. Check the [README.md](./README.md) for architecture info
3. Review console logs for error messages

---

**Have fun and may your agents survive!** 🤖💰🚀

