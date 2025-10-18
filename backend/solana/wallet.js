import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';

export class SolanaWallet {
  constructor(privateKey) {
    // Initialize connection
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );
    
    // Parse private key
    if (typeof privateKey === 'string') {
      // Support both base58 and array formats
      try {
        const decoded = bs58.decode(privateKey);
        this.keypair = Keypair.fromSecretKey(decoded);
      } catch {
        // Try as JSON array
        const secretKey = new Uint8Array(JSON.parse(privateKey));
        this.keypair = Keypair.fromSecretKey(secretKey);
      }
    } else if (Array.isArray(privateKey)) {
      const secretKey = new Uint8Array(privateKey);
      this.keypair = Keypair.fromSecretKey(secretKey);
    } else {
      throw new Error('Invalid private key format');
    }
    
    this.publicKey = this.keypair.publicKey;
  }
  
  async getBalance() {
    try {
      const balance = await this.connection.getBalance(this.publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error.message);
      return 0;
    }
  }
  
  async getTokenAccounts() {
    try {
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        this.publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );
      
      return tokenAccounts.value.map(account => ({
        address: account.pubkey.toString(),
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals
      }));
    } catch (error) {
      console.error('Error getting token accounts:', error.message);
      return [];
    }
  }
  
  async getTransactionHistory(limit = 10) {
    try {
      const signatures = await this.connection.getSignaturesForAddress(
        this.publicKey,
        { limit }
      );
      
      return signatures;
    } catch (error) {
      console.error('Error getting transaction history:', error.message);
      return [];
    }
  }
  
  getPublicKey() {
    return this.publicKey.toString();
  }
}

