import { ethers } from "ethers";
import FundloomFactoryABI from "./FundloomFactoryABI.json";
import type { Log, Interface } from "ethers";

// Base Sepolia addresses
const FUNDLOOM_FACTORY_ADDRESS = import.meta.env.VITE_FUNDLOOM_FACTORY_ADDRESS || "";
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const TX_TIMEOUT_MS = 180000; // 3 minutes for slow testnet

export interface CampaignData {
  id: number;
  creator: string;
  goal: bigint;
  raised: bigint;
  deadline: number;
  withdrawn: boolean;
  milestonesCount?: number;
}

export interface MilestoneData {
  description: string;
  amount: bigint;
  status: number;
  exists: boolean;
}

export enum MilestoneStatus {
  Pending = 0,
  Approved = 1,
  Released = 2,
}

export class FundloomContract {
  private contract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(signer: ethers.Signer) {
    this.signer = signer;
    this.contract = new ethers.Contract(FUNDLOOM_FACTORY_ADDRESS, FundloomFactoryABI, signer);
  }

  async createCampaign(goalUSDC: number, deadlineUnix: number): Promise<number> {
    const goal = ethers.parseUnits(goalUSDC.toString(), 6); // USDC has 6 decimals
    const tx = await this.contract.createCampaign(goal, deadlineUnix);

    // Wait with timeout
    const receipt = await this.waitForTransaction(tx.hash, TX_TIMEOUT_MS);

    // Find CampaignCreated event
    const event = receipt.logs
      .map((log: Log) => {
        try {
          return this.contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find(
        (e): e is NonNullable<ReturnType<Interface["parseLog"]>> =>
          e !== null && e?.name === "CampaignCreated",
      );

    return Number(event?.args?.id ?? 0);
  }

  private async waitForTransaction(
    txHash: string,
    timeoutMs: number,
  ): Promise<ethers.TransactionReceipt> {
    const provider = this.signer.provider;
    if (!provider) {
      throw new Error("No provider available");
    }

    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const receipt = await provider.getTransactionReceipt(txHash);
        if (receipt) {
          if (receipt.status === 0) {
            throw new Error("Transaction failed");
          }
          return receipt;
        }
      } catch (error) {
        // Continue polling on error
      }
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s between checks
    }
    throw new Error(`Transaction timed out after ${timeoutMs / 1000}s. Hash: ${txHash}`);
  }

  async contribute(campaignId: number, amountUSDC: number): Promise<string> {
    const amount = ethers.parseUnits(amountUSDC.toString(), 6);

    // First approve USDC spending
    const usdcContract = new ethers.Contract(
      USDC_ADDRESS,
      [
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
      ],
      this.signer,
    );

    const allowance = await usdcContract.allowance(
      await this.signer.getAddress(),
      FUNDLOOM_FACTORY_ADDRESS,
    );

    if (allowance < amount) {
      const approveTx = await usdcContract.approve(FUNDLOOM_FACTORY_ADDRESS, amount);
      await this.waitForTransaction(approveTx.hash, TX_TIMEOUT_MS);
    }

    const tx = await this.contract.contribute(campaignId, amount);
    const receipt = await this.waitForTransaction(tx.hash, TX_TIMEOUT_MS);
    return receipt.hash;
  }

  async withdraw(campaignId: number): Promise<string> {
    const tx = await this.contract.withdraw(campaignId);
    const receipt = await this.waitForTransaction(tx.hash, TX_TIMEOUT_MS);
    return receipt.hash;
  }

  async getCampaign(campaignId: number): Promise<CampaignData> {
    const campaign = await this.contract.getCampaign(campaignId);
    return {
      id: campaignId,
      creator: campaign[0],
      goal: campaign[1],
      raised: campaign[2],
      deadline: Number(campaign[3]),
      withdrawn: campaign[4],
      milestonesCount: Number(campaign[5]),
    };
  }

  async getMilestone(campaignId: number, milestoneId: number): Promise<MilestoneData> {
    const milestone = await this.contract.getMilestone(campaignId, milestoneId);
    return {
      description: milestone[0],
      amount: milestone[1],
      status: Number(milestone[2]) as MilestoneStatus,
      exists: milestone[3],
    };
  }

  async addMilestone(campaignId: number, description: string, amountUSDC: number): Promise<string> {
    const amount = ethers.parseUnits(amountUSDC.toString(), 6);
    const tx = await this.contract.addMilestone(campaignId, description, amount);
    const receipt = await this.waitForTransaction(tx.hash, TX_TIMEOUT_MS);
    return receipt.hash;
  }

  async approveMilestone(campaignId: number, milestoneId: number): Promise<string> {
    const tx = await this.contract.approveMilestone(campaignId, milestoneId);
    const receipt = await this.waitForTransaction(tx.hash, TX_TIMEOUT_MS);
    return receipt.hash;
  }

  async releaseMilestone(campaignId: number, milestoneId: number): Promise<string> {
    const tx = await this.contract.releaseMilestone(campaignId, milestoneId);
    const receipt = await this.waitForTransaction(tx.hash, TX_TIMEOUT_MS);
    return receipt.hash;
  }

  async getCampaignsCount(): Promise<number> {
    const count = await this.contract.campaignsCount();
    return Number(count);
  }
}

export function getContractInstance(signer: ethers.Signer): FundloomContract {
  return new FundloomContract(signer);
}
