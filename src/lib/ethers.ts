import { ethers } from "ethers";
import { useWallets, type Wallet } from "@privy-io/react-auth";

/**
 * Get an ethers v6 Signer from Privy's embedded wallet.
 * Must be used inside a component (PrivyProvider must be mounted).
 */
export function useEthersSigner() {
  const { wallets } = useWallets();

  const getSigner = async (): Promise<ethers.Signer | null> => {
    const wallet = wallets[0];
    if (!wallet) return null;

    try {
      // Get the provider from Privy wallet
      const provider = await wallet.getEthereumProvider();
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      return signer;
    } catch (error) {
      console.error("Failed to get ethers signer:", error);
      return null;
    }
  };

  return { getSigner, wallets };
}

/**
 * Convert a Privy wallet to an ethers Signer (for server-side or non-hook usage)
 */
export async function privyWalletToSigner(wallet: unknown): Promise<ethers.Signer> {
  if (typeof wallet !== "object" || wallet === null) {
    throw new Error("Invalid wallet: not an object");
  }

  const walletRecord = wallet as Record<string, unknown>;
  const getEthereumProvider = walletRecord.getEthereumProvider;

  if (typeof getEthereumProvider !== "function") {
    throw new Error("Invalid wallet: missing getEthereumProvider method");
  }

  const provider = await getEthereumProvider.call(walletRecord);
  const ethersProvider = new ethers.BrowserProvider(provider as never);
  return await ethersProvider.getSigner();
}

/**
 * USDC token contract interface
 */
export const USDC_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
];

export const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
