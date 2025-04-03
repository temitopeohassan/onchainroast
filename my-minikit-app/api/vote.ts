import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

const VOTING_ABI = [
  {
    inputs: [
      { name: "battleId", type: "uint256" },
      { name: "roastId", type: "uint256" }
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

const CONTRACT_ADDRESS = "0xBBfE5FC04D15Be13641350247836567Ef730f837" as `0x${string}`;

if (!process.env.RPC_URL) {
  throw new Error("RPC_URL environment variable is not set");
}

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY environment variable is not set");
}

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, VOTING_ABI, wallet);

interface VoteRequest {
  battleId: string;
  roastId: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { battleId, roastId } = req.body as VoteRequest;

    if (!battleId || !roastId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const tx = await contract.vote(battleId, roastId);
    await tx.wait();

    return res.status(200).json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error("Error submitting vote:", error);
    
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "An unknown error occurred" });
  }
}
