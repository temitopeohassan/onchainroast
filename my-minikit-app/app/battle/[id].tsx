"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Name, Identity } from "@coinbase/onchainkit/identity";
import { useParams } from "next/navigation";

interface Battle {
  id: number;
  challenger: string;
  opponent: string;
}

const CONTRACT_ADDRESS = "0x904de529043aDaCddDEEc9Ef4FA81AC452608AeB" as `0x${string}`;

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

export default function BattlePage() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const { address } = useAccount();
  const params = useParams();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [roast, setRoast] = useState("");

  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    async function fetchBattle() {
      try {
        const res = await fetch(`/api/battle?id=${params.id}`);
        const data = await res.json();
        setBattle(data);
      } catch (error) {
        console.error("Error fetching battle:", error);
      }
    }
    if (params.id) {
      fetchBattle();
    }
  }, [params.id]);

  const handleSubmitRoast = () => {
    if (!battle || !roast.trim()) return;
    
    writeContract({
      abi: ROAST_BATTLE_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "submitRoast",
      args: [BigInt(battle.id), roast],
    });
  };

  return (
    <div className="flex flex-col min-h-screen sm:min-h-[820px] font-sans bg-[#E5E5E5] text-black items-center relative">
      <div className="w-screen max-w-[520px] p-4">
        <header className="flex justify-between items-center mb-4">
          <div>
            {address ? (
              <Identity
                address={address}
                className="!bg-inherit p-0 [&>div]:space-x-2"
              >
                <Name className="text-inherit" />
              </Identity>
            ) : (
              <div className="text-gray-500 text-sm font-semibold">
                NOT CONNECTED
              </div>
            )}
          </div>
        </header>

        <main className="space-y-4">
          {battle ? (
            <>
              <h1 className="text-2xl font-bold text-center">Roast Battle #{battle.id}</h1>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="font-semibold">Challenger: {battle.challenger}</p>
                <p className="font-semibold">Opponent: {battle.opponent}</p>
              </div>

              <textarea
                placeholder="Drop your roast here..."
                value={roast}
                onChange={(e) => setRoast(e.target.value)}
                className="w-full h-32 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleSubmitRoast}
                disabled={!roast.trim()}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Roast
              </button>
            </>
          ) : (
            <div className="text-center">
              <p>Loading battle details...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
