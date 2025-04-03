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

interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp: {
    url: string;
  };
  profile: {
    bio: {
      text: string;
    };
  };
}

interface NeynarResponse {
  users: NeynarUser[];
}

function getContract() {
  if (!process.env.RPC_URL) {
    throw new Error("RPC_URL environment variable is not set");
  }

  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is not set");
  }

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, ROAST_BATTLE_ABI, wallet);
}

async function getFollowers(fid: number) {
  // Return mock data in development if API key is not set
  if (!process.env.NEYNAR_API_KEY) {
    console.warn("NEYNAR_API_KEY not set, returning mock data");
    return [
      { fid: 1, username: "follower1" },
      { fid: 2, username: "follower2" },
      { fid: 3, username: "follower3" },
    ];
  }

  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/followers?fid=${fid}&viewer_fid=${fid}`,
      {
        headers: {
          "api_key": process.env.NEYNAR_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Neynar API error:", errorData);
      throw new Error(`Neynar API error: ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json() as NeynarResponse;
    return data.users.map((user) => ({
      fid: user.fid,
      username: user.username,
    }));
  } catch (error) {
    console.error("Error in getFollowers:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch followers: ${error.message}`);
    }
    throw new Error("Failed to fetch followers: Unknown error");
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fid = searchParams.get("fid");

    if (!fid) {
      return NextResponse.json(
        { error: "Missing fid parameter" },
        { status: 400 }
      );
    }

    const followers = await getFollowers(parseInt(fid));
    return NextResponse.json(followers);
  } catch (error) {
    console.error("Error in GET /api/battles:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch followers" },
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

    const contract = getContract();
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