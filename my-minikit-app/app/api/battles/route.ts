import { NextRequest, NextResponse } from "next/server";
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

export async function GET() {
  try {
    // In a real app, you would fetch followers from your social graph
    // For now, we'll return mock data
    const mockFollowers = [
      { fid: 1, username: "follower1" },
      { fid: 2, username: "follower2" },
      { fid: 3, username: "follower3" },
    ];

    return NextResponse.json(mockFollowers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      { error: "Failed to fetch followers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { challenger, opponent } = body;

    if (!challenger || !opponent) {
      return NextResponse.json(
        { error: "Missing challenger or opponent" },
        { status: 400 }
      );
    }

    const tx = await contract.createBattle(challenger, opponent);
    await tx.wait();

    return NextResponse.json({
      success: true,
      battleId: tx.hash,
    });
  } catch (error) {
    console.error("Error creating battle:", error);
    return NextResponse.json(
      { error: "Failed to create battle" },
      { status: 500 }
    );
  }
} 