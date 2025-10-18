// Generate Solana wallets for agents
// Run with: node generate-wallets.js

import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

console.log('🔐 Generating Solana wallets for Agent Games...\n');
console.log('⚠️  IMPORTANT: Save these private keys securely!');
console.log('⚠️  Never share them or commit them to git!\n');
console.log('=' .repeat(80));

for (let i = 1; i <= 3; i++) {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toString();
  const privateKeyBase58 = bs58.encode(keypair.secretKey);
  const privateKeyArray = JSON.stringify(Array.from(keypair.secretKey));
  
  console.log(`\n🤖 AGENT ${i}:`);
  console.log('-'.repeat(80));
  console.log('Public Key (for funding):');
  console.log(publicKey);
  console.log('\nPrivate Key (Base58 - use this in .env):');
  console.log(privateKeyBase58);
  console.log('\nPrivate Key (Array format - alternative):');
  console.log(privateKeyArray);
  console.log('-'.repeat(80));
}

console.log('\n✅ Wallet generation complete!');
console.log('\n📋 Next steps:');
console.log('1. Copy the Private Keys (Base58 format) to your .env file');
console.log('2. Fund each wallet with SOL:');
console.log('   - Devnet (testing): solana airdrop 2 <PUBLIC_KEY> --url devnet');
console.log('   - Mainnet (real): Send SOL to the public addresses');
console.log('\n⚠️  Keep these private keys secure and never share them!');

