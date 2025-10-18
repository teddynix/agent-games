# Agent Games Setup Guide

Follow these steps to get your AI agent survival game up and running!

## Prerequisites

- Node.js v18+ installed
- Solana wallets for each agent
- API keys for AI provider (OpenAI or Anthropic)
- Some SOL to fund agent wallets

## Step 1: Install Dependencies

```bash
cd agent-games
cd backend
npm install
```

## Step 2: Create Solana Wallets

You need to create separate wallets for each agent. You have two options:

### Option A: Using Solana CLI (Recommended for Testing)

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Create wallet for each agent
solana-keygen new --outfile agent1.json --no-bip39-passphrase
solana-keygen new --outfile agent2.json --no-bip39-passphrase
solana-keygen new --outfile agent3.json --no-bip39-passphrase

# Get the public addresses (for funding)
solana-keygen pubkey agent1.json
solana-keygen pubkey agent2.json
solana-keygen pubkey agent3.json
```

### Option B: Using JavaScript

Create a file `generate-wallets.js`:

```javascript
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

for (let i = 1; i <= 3; i++) {
  const keypair = Keypair.generate();
  console.log(`\nAgent ${i}:`);
  console.log('Public Key:', keypair.publicKey.toString());
  console.log('Private Key (Base58):', bs58.encode(keypair.secretKey));
}
```

Run it:
```bash
node generate-wallets.js
```

## Step 3: Fund Your Wallets

### For Testing (Devnet):

```bash
# Airdrop devnet SOL to each wallet
solana airdrop 2 <AGENT_1_PUBLIC_KEY> --url devnet
solana airdrop 2 <AGENT_2_PUBLIC_KEY> --url devnet
solana airdrop 2 <AGENT_3_PUBLIC_KEY> --url devnet
```

### For Production (Mainnet):

Transfer real SOL to each agent's public address. **Start with small amounts** (0.1-0.5 SOL per agent).

⚠️ **Warning:** Agents will autonomously trade and could lose all funds. Only use money you can afford to lose!

## Step 4: Configure Environment

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your values:

```env
PORT=3000

# Choose ONE AI provider
OPENAI_API_KEY=sk-your-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-key-here

# For testing, use devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# For production, use mainnet (or a paid RPC like Helius/QuickNode for better performance)
# SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Paste the private keys (Base58 format) from Step 2
AGENT_1_PRIVATE_KEY=your_base58_private_key_here
AGENT_2_PRIVATE_KEY=your_base58_private_key_here
AGENT_3_PRIVATE_KEY=your_base58_private_key_here

# Adjust costs (in SOL)
AGENT_OPERATION_COST_PER_HOUR=0.001
AI_API_COST_PER_DECISION=0.0001
```

## Step 5: Run the Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

The dashboard will be available at: `http://localhost:3000`

## Step 6: Monitor Your Agents

Open your browser and navigate to `http://localhost:3000`. You should see:

- **3 AI agents** with different personalities
- **Real-time updates** as they think and trade
- **Live activity feed** showing all actions
- **Statistics** tracking survival time, profits, and trades

## Understanding Agent Behavior

### Conservative Carl 🛡️
- Plays it safe with small positions
- Uses strict stop losses
- Prioritizes survival over profits
- Best for: Testing and learning the system

### Aggressive Anna ⚡
- Takes large positions (up to 40% of balance)
- Chases high-risk opportunities
- Lives fast, dies young
- Best for: Entertainment and high-risk scenarios

### Balanced Bob ⚖️
- Moderate risk-taking
- Uses technical analysis
- Balanced position sizing
- Best for: Realistic trading simulation

## Troubleshooting

### "No agents initialized"
- Check that your private keys are correctly formatted in `.env`
- Ensure agent wallets have sufficient SOL balance (minimum 0.01 SOL)

### Agents not making trades
- Verify AI API key is valid and has credits
- Check agent balance is sufficient for trading
- Review console logs for error messages

### WebSocket connection issues
- Ensure backend is running on the correct port
- Check firewall settings
- Try refreshing the browser

## Advanced Configuration

### Using a Custom RPC

For better performance and reliability, consider using a paid RPC provider:

```env
# Helius
SOLANA_RPC_URL=https://rpc.helius.xyz/?api-key=YOUR_KEY

# QuickNode
SOLANA_RPC_URL=https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_KEY/
```

### Adjusting Decision Frequency

Edit `backend/agents/agentManager.js`:

```javascript
// Change decision interval (default: 120000 = 2 minutes)
this.decisionInterval = setInterval(async () => {
    await this.makeDecisions();
}, 60000); // 1 minute
```

### Modifying Agent Personalities

Edit `backend/agents/personalities.js` to adjust:
- `riskTolerance` (0-1)
- `tradeFrequency` (0-1)
- `positionSize` (percentage of balance)
- `stopLoss` and `takeProfit` levels

## Production Deployment

When deploying to production:

1. **Use mainnet RPC** with a reliable provider
2. **Secure your .env file** - never commit it to git
3. **Start with small balances** to test
4. **Monitor closely** for the first few hours
5. **Set up alerts** for agent deaths or low balances

## Cost Estimates

Based on default configuration:

- **Operation costs:** 0.001 SOL/hour per agent = ~$0.10/hour (at $100/SOL)
- **AI API costs:** ~$0.01-0.05 per decision (varies by provider)
- **Trading fees:** ~0.3% per trade on Raydium
- **Transaction fees:** ~0.000005 SOL per transaction

**Daily cost estimate per agent:** $2-5 USD (depending on trading frequency)

## Safety Tips

1. ⚠️ Start with devnet/testnet first
2. 💰 Only fund with amounts you can afford to lose
3. 👀 Monitor agents regularly
4. 🔒 Keep private keys secure
5. 🧪 Test personality modifications on devnet first

## Next Steps

Once everything is running:

1. **Monitor performance** - Watch which personality performs best
2. **Adjust strategies** - Tweak personality traits
3. **Implement stretch goals** - Add Twitter integration or donations
4. **Scale up** - Add more agents with different strategies

## Support

If you encounter issues:
- Check the console logs in both browser and terminal
- Review the error messages
- Ensure all dependencies are installed
- Verify wallet balances and API keys

Happy trading! 🚀

