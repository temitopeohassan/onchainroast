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
    const { untrustedData } = req.body;
    
    if (!untrustedData) {
      return res.status(400).json({ error: "Missing untrustedData" });
    }

    const { buttonIndex, inputText, fid } = untrustedData;

    // Handle different button actions
    switch (buttonIndex) {
      case 1: // Submit roast
        if (!inputText) {
          return res.status(400).json({ error: "Missing roast text" });
        }

        const tx = await contract.submitRoast(1, inputText); // Using battle ID 1 for now
        await tx.wait();

        return res.status(200).json({
          type: "frame",
          frame: {
            image: "https://onchainroast.vercel.app/success.png",
            buttons: [
              {
                label: "View Battle",
                action: "post_redirect",
              },
            ],
          },
        });

      case 2: // Vote
        // Handle voting logic here
        return res.status(200).json({
          type: "frame",
          frame: {
            image: "https://onchainroast.vercel.app/vote.png",
            buttons: [
              {
                label: "Back to Battle",
                action: "post",
              },
            ],
          },
        });

      default:
        return res.status(400).json({ error: "Invalid button index" });
    }
  } catch (error) {
    console.error("Error handling frame interaction:", error);
    
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "An unknown error occurred" });
  }
} 