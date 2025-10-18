import { Coinbase, Wallet } from '@coinbase/coinbase-sdk';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

/**
 * CDP (Coinbase Developer Platform) Wallet Integration for Solana
 * Provides managed, secure wallets with better key management
 */
export class CDPWallet {
  constructor(walletId = null) {
    // Initialize CDP
    this.coinbase = null;
    this.wallet = null;
    this.walletId = walletId;
    this.address = null;
    
    // Solana connection for balance checking
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
  }
  
  async initialize() {
    try {
      // Configure CDP with API credentials
      Coinbase.configure({
        apiKeyName: process.env.CDP_API_KEY_NAME,
        privateKey: process.env.CDP_API_KEY_PRIVATE_KEY.replace(/\\n/g, '\n')
      });
      
      this.coinbase = Coinbase;
      
      // Load existing wallet or create new one
      if (this.walletId) {
        console.log(`Loading CDP wallet: ${this.walletId}`);
        this.wallet = await Wallet.fetch(this.walletId);
      } else {
        console.log('Creating new CDP wallet on Solana...');
        this.wallet = await Wallet.create({ networkId: 'solana-devnet' }); // or 'solana-mainnet'
        this.walletId = this.wallet.getId();
        console.log(`✅ Created new CDP wallet: ${this.walletId}`);
        console.log(`⚠️  Save this wallet ID in your .env file!`);
      }
      
      // Get the default address
      const addresses = await this.wallet.listAddresses();
      this.address = addresses[0];
      
      console.log(`✅ CDP Wallet initialized: ${this.address.getId()}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize CDP wallet:', error.message);
      throw error;
    }
  }
  
  async getBalance() {
    try {
      if (!this.address) {
        throw new Error('Wallet not initialized');
      }
      
      // Get balance from Solana RPC
      const publicKey = new PublicKey(this.address.getId());
      const balance = await this.connection.getBalance(publicKey);
      
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error.message);
      return 0;
    }
  }
  
  async getPublicKey() {
    if (!this.address) {
      throw new Error('Wallet not initialized');
    }
    return this.address.getId();
  }
  
  async transfer(destinationAddress, amount) {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not initialized');
      }
      
      // Create and execute transfer
      const transfer = await this.wallet.createTransfer({
        amount: amount,
        assetId: 'sol',
        destination: destinationAddress
      });
      
      // Wait for transfer to complete
      await transfer.wait();
      
      return {
        success: true,
        transactionHash: transfer.getTransactionHash()
      };
    } catch (error) {
      console.error('Transfer error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async signTransaction(transaction) {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not initialized');
      }
      
      // CDP handles signing automatically when creating transfers/trades
      // This method is here for compatibility with the existing Agent interface
      throw new Error('Direct transaction signing not supported with CDP. Use transfer() or trade methods.');
    } catch (error) {
      console.error('Sign transaction error:', error.message);
      throw error;
    }
  }
  
  getWalletId() {
    return this.walletId;
  }
  
  async exportWalletData() {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not initialized');
      }
      
      // Export wallet data (for backup/migration)
      const data = await this.wallet.export();
      
      return {
        walletId: this.walletId,
        seed: data.seed,
        address: this.address.getId()
      };
    } catch (error) {
      console.error('Export wallet error:', error.message);
      throw error;
    }
  }
  
  // Compatibility methods for existing code
  get publicKey() {
    return {
      toString: () => this.address ? this.address.getId() : null
    };
  }
  
  async getTokenAccounts() {
    // CDP doesn't expose token accounts directly
    // This would need to be queried from Solana RPC
    return [];
  }
  
  async getTransactionHistory(limit = 10) {
    try {
      if (!this.wallet) {
        return [];
      }
      
      // Get transaction history from CDP
      const transactions = await this.wallet.listTransfers();
      
      return transactions.slice(0, limit).map(tx => ({
        signature: tx.getTransactionHash(),
        timestamp: tx.getCreatedAt(),
        status: tx.getStatus()
      }));
    } catch (error) {
      console.error('Error getting transaction history:', error.message);
      return [];
    }
  }
}

// Helper function to create CDP wallets for all agents
export async function createAgentWallets() {
  console.log('🏦 Creating CDP wallets for agents...');
  
  const wallets = [];
  
  for (let i = 1; i <= 3; i++) {
    const wallet = new CDPWallet();
    await wallet.initialize();
    
    wallets.push({
      agentNumber: i,
      walletId: wallet.getWalletId(),
      address: await wallet.getPublicKey()
    });
    
    console.log(`Agent ${i} wallet created: ${wallet.getWalletId()}`);
  }
  
  console.log('\n✅ All agent wallets created!');
  console.log('\n⚠️  Add these to your .env file:');
  wallets.forEach((w, i) => {
    console.log(`AGENT_${i + 1}_WALLET_ID=${w.walletId}`);
  });
  console.log('\n📋 Public addresses for funding:');
  wallets.forEach((w, i) => {
    console.log(`Agent ${i + 1}: ${w.address}`);
  });
  
  return wallets;
}

