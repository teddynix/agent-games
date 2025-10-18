// Create CDP wallets for agents
// Run with: node create-cdp-wallets.js

import dotenv from 'dotenv';
import { createAgentWallets } from './backend/solana/cdp-wallet.js';

dotenv.config();

console.log('🚀 CDP Wallet Generator for Agent Games\n');

// Verify CDP credentials are set
if (!process.env.CDP_API_KEY_NAME || !process.env.CDP_API_KEY_PRIVATE_KEY) {
  console.error('❌ Error: CDP API credentials not found in .env file!');
  console.error('\nPlease add the following to your .env file:');
  console.error('CDP_API_KEY_NAME=your_api_key_name');
  console.error('CDP_API_KEY_PRIVATE_KEY=your_api_key_private_key');
  console.error('\nGet your CDP API keys from: https://portal.cdp.coinbase.com/');
  process.exit(1);
}

async function main() {
  try {
    const wallets = await createAgentWallets();
    
    console.log('\n\n' + '='.repeat(80));
    console.log('✅ SUCCESS! Your agent wallets are ready.');
    console.log('='.repeat(80));
    console.log('\n📋 Copy these lines to your .env file:\n');
    
    wallets.forEach((w, i) => {
      console.log(`AGENT_${i + 1}_WALLET_ID=${w.walletId}`);
    });
    
    console.log('\n\n💰 Fund these addresses with SOL:\n');
    wallets.forEach((w, i) => {
      console.log(`Agent ${i + 1}: ${w.address}`);
    });
    
    console.log('\n\nFor devnet (testing):');
    console.log('Visit: https://faucet.solana.com/');
    console.log('Or use: solana airdrop 2 <ADDRESS> --url devnet');
    
    console.log('\n\nFor mainnet (real money):');
    console.log('Send SOL to each address from your personal wallet');
    console.log('⚠️  Start with small amounts (0.1-0.5 SOL per agent)');
    
  } catch (error) {
    console.error('\n❌ Error creating wallets:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify your CDP API credentials are correct');
    console.error('2. Check your internet connection');
    console.error('3. Ensure you have access to CDP API');
    process.exit(1);
  }
}

main();

