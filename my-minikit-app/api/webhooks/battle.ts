import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

const ROAST_BATTLE_ABI = [
  {
    inputs: [
      { name: "challenger", type: "address" },
      { name: "opponent", type: "address" }
    ],
    name: "createBattle",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

const CONTRACT_ADDRESS = "0xYourRoastBattleContract" as `0x${string}`;

if (!process.env.RPC_URL) {
  throw new Error("RPC_URL environment variable is not set");
}

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY environment variable is not set");
}

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ROAST_BATTLE_ABI, wallet);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { challenger, opponent } = req.body;

    if (!challenger || !opponent) {
      return res.status(400).json({ error: "Missing challenger or opponent address" });
    }

    const tx = await contract.createBattle(challenger, opponent);
    await tx.wait();

    // Get the battle ID from the transaction receipt
    const receipt = await tx.wait();
    const battleId = receipt.logs[0].args[0].toString();

    return res.status(200).json({
      success: true,
      battleId,
      txHash: tx.hash
    });
  } catch (error) {
    console.error("Error creating battle:", error);
    
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "An unknown error occurred" });
  }
} 