# 🏦 CDP (Coinbase Developer Platform) Setup Guide

This project uses **CDP Server Wallets** for secure, managed Solana wallets for each AI agent.

## Why CDP?

- ✅ **Secure key management** - Keys are managed by Coinbase
- ✅ **Server-side wallets** - Perfect for autonomous agents
- ✅ **Better infrastructure** - Enterprise-grade reliability
- ✅ **Easy onboarding** - Simplified wallet creation
- ✅ **Multi-chain support** - Works with Solana and other chains

## Step 1: Get CDP API Credentials

1. **Go to CDP Portal:**
   - Visit: https://portal.cdp.coinbase.com/
   - Sign up or log in with your Coinbase account

2. **Create API Key:**
   - Navigate to "API Keys" section
   - Click "Create API Key"
   - Give it a name like "Agent Games"
   - **Important:** Save both the API Key Name and Private Key securely!

3. **Note your credentials:**
   ```
   API Key Name: organizations/{org-id}/apiKeys/{key-id}
   Private Key: -----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----
   ```

## Step 2: Configure Your .env File

Create a `.env` file in the `agent-games` directory:

```env
# Server
PORT=3000

# CDP API Credentials (from Step 1)
CDP_API_KEY_NAME=organizations/your-org-id/apiKeys/your-key-id
CDP_API_KEY_PRIVATE_KEY=-----BEGIN EC PRIVATE KEY-----\nYourPrivateKeyHere\n-----END EC PRIVATE KEY-----

# AI Provider (choose one)
OPENAI_API_KEY=sk-your-openai-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Solana Network
# For testing (FREE):
SOLANA_RPC_URL=https://api.devnet.solana.com
# For production (REAL MONEY):
# SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Agent Wallet IDs (generated in Step 3)
AGENT_1_WALLET_ID=your_wallet_id_here
AGENT_2_WALLET_ID=your_wallet_id_here
AGENT_3_WALLET_ID=your_wallet_id_here

# Cost Configuration
AGENT_OPERATION_COST_PER_HOUR=0.001
AI_API_COST_PER_DECISION=0.0001
```

## Step 3: Create Agent Wallets

Run the CDP wallet creation script:

```bash
npm run create-cdp-wallets
```

This will:
1. Connect to CDP using your API credentials
2. Create 3 Solana wallets (one for each agent)
3. Display the wallet IDs and addresses

**Copy the wallet IDs to your .env file:**
```env
AGENT_1_WALLET_ID=abc123...
AGENT_2_WALLET_ID=def456...
AGENT_3_WALLET_ID=ghi789...
```

## Step 4: Fund the Wallets

### For Devnet (Testing - FREE):

1. **Web Faucet:**
   - Go to: https://faucet.solana.com/
   - Paste each agent's address
   - Request 2 SOL per agent

2. **CLI (if you have Solana CLI installed):**
   ```bash
   solana airdrop 2 <AGENT_1_ADDRESS> --url devnet
   solana airdrop 2 <AGENT_2_ADDRESS> --url devnet
   solana airdrop 2 <AGENT_3_ADDRESS> --url devnet
   ```

### For Mainnet (Real Money - ⚠️ USE CAUTION):

1. Transfer real SOL to each agent's address
2. **Start small:** 0.1-0.5 SOL per agent
3. **Monitor closely:** Agents will autonomously trade
4. **Risk warning:** Agents can lose all funds quickly

## Step 5: Verify Setup

Check that everything is configured:

```bash
# Make sure all dependencies are installed
cd backend
npm install
cd ..

# Verify your .env file has:
# - CDP_API_KEY_NAME
# - CDP_API_KEY_PRIVATE_KEY
# - AGENT_1_WALLET_ID
# - AGENT_2_WALLET_ID
# - AGENT_3_WALLET_ID
# - OPENAI_API_KEY or ANTHROPIC_API_KEY
```

## Step 6: Start the Game!

```bash
npm start
```

Then open: http://localhost:3000

You should see:
- ✅ "Initializing Agent Games with CDP Wallets..."
- ✅ All 3 agents initialized with their balances
- ✅ Wallet addresses displayed

## Troubleshooting

### "CDP API credentials not found"
→ Check that your .env file has `CDP_API_KEY_NAME` and `CDP_API_KEY_PRIVATE_KEY`

### "Failed to initialize CDP wallet"
→ Verify your API credentials are correct
→ Make sure your API key has wallet creation permissions

### "No wallet ID configured"
→ Run `npm run create-cdp-wallets` to generate wallets
→ Copy the wallet IDs to your .env file

### "Insufficient funds"
→ Check wallet balances at https://explorer.solana.com/
→ Airdrop devnet SOL or send mainnet SOL to the addresses

## Managing CDP Wallets

### View Wallet Details:
- Log into CDP Portal: https://portal.cdp.coinbase.com/
- Navigate to "Wallets"
- View all your agent wallets and their balances

### Export Wallet Data (Backup):
```javascript
const wallet = new CDPWallet('your-wallet-id');
await wallet.initialize();
const backup = await wallet.exportWalletData();
// Save this securely!
```

### Transfer Between Wallets:
```javascript
await wallet.transfer('destination-address', 0.1); // Transfer 0.1 SOL
```

## Security Best Practices

1. ✅ **Never commit .env to git** - It's in .gitignore
2. ✅ **Store API keys securely** - Use a password manager
3. ✅ **Start with devnet** - Test everything before using real money
4. ✅ **Monitor agent activity** - Check dashboard regularly
5. ✅ **Set spending limits** - Start with small amounts

## CDP Resources

- **Documentation:** https://docs.cdp.coinbase.com/
- **Portal:** https://portal.cdp.coinbase.com/
- **Support:** https://help.coinbase.com/
- **SDK GitHub:** https://github.com/coinbase/coinbase-sdk-nodejs

## Next Steps

Once your wallets are funded and configured:
1. Start the server: `npm start`
2. Open the dashboard: http://localhost:3000
3. Watch your agents trade!
4. Monitor their survival times
5. Donate to keep them alive (optional)

Good luck! 🚀

