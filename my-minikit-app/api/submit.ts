import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

const ROAST_BATTLE_ABI = [
  {
    inputs: [
      { name: "battleId", type: "uint256" },
      { name: "roast", type: "string" }
    ],
    name: "submitRoast",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

const CONTRACT_ADDRESS = "0x904de529043aDaCddDEEc9Ef4FA81AC452608AeB" as `0x${string}`;

if (!process.env.RPC_URL) {
  throw new Error("RPC_URL environment variable is not set");
}

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY environment variable is not set");
}

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ROAST_BATTLE_ABI, wallet);

interface SubmitRequest {
  battleId: string;
  roast: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { battleId, roast } = req.body as SubmitRequest;

    if (!battleId || !roast) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const tx = await contract.submitRoast(battleId, roast);
    await tx.wait();

    return res.status(200).json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error("Error submitting roast:", error);
    
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "An unknown error occurred" });
  }
}
