import { AgentKit, CdpV2SolanaWalletProvider } from "@coinbase/agentkit";
import { raydiumActionProvider } from "./raydium-action-provider";
import dotenv from "dotenv";

dotenv.config();

/**
 * Create an AgentKit instance with Raydium trading capabilities
 */
export async function createTradingAgent(
  agentConfig: {
    walletSecret?: string;
    idempotencyKey?: string;
    address?: string;
  } = {}
) {
  // Configure CDP Solana Wallet
  const walletProvider = await CdpV2SolanaWalletProvider.configureWithWallet({
    apiKeyId: process.env.CDP_API_KEY_ID!,
    apiKeySecret: process.env.CDP_API_KEY_SECRET!,
    walletSecret: agentConfig.walletSecret,
    idempotencyKey: agentConfig.idempotencyKey,
    address: agentConfig.address,
    networkId: process.env.NETWORK_ID || "solana-devnet"
  });

  // Create AgentKit with Raydium action provider
  const agentkit = await AgentKit.from({
    walletProvider,
    actionProviders: [
      raydiumActionProvider()
    ]
  });

  return agentkit;
}

/**
 * Get agent wallet details
 */
export async function getAgentWalletInfo(agentkit: AgentKit) {
  const address = await agentkit.wallet.getAddress();
  const balance = await agentkit.wallet.getBalance();
  
  return {
    address,
    balance,
    network: process.env.NETWORK_ID || "solana-devnet"
  };
}

