"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Name, Identity } from "@coinbase/onchainkit/identity";
import { useParams } from "next/navigation";

interface Roast {
  id: number;
  content: string;
  votes: number;
}

const CONTRACT_ADDRESS = "0xBBfE5FC04D15Be13641350247836567Ef730f837" as `0x${string}`;

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

export default function VotingPage() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const { address } = useAccount();
  const params = useParams();
  const [roasts, setRoasts] = useState<Roast[]>([]);
  const [selectedRoast, setSelectedRoast] = useState<number | null>(null);

  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    async function fetchRoasts() {
      try {
        const res = await fetch(`/api/roasts?battleId=${params.id}`);
        const data = await res.json();
        setRoasts(data);
      } catch (error) {
        console.error("Error fetching roasts:", error);
      }
    }
    if (params.id) {
      fetchRoasts();
    }
  }, [params.id]);

  const handleVote = (roastId: number) => {
    if (!params.id) return;
    
    writeContract({
      abi: VOTING_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "vote",
      args: [BigInt(params.id as string), BigInt(roastId)],
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
          <h1 className="text-2xl font-bold text-center">Vote for the Best Roast</h1>
          
          {roasts.length > 0 ? (
            <ul className="space-y-4">
              {roasts.map((roast) => (
                <li key={roast.id} className="bg-white p-4 rounded-lg shadow">
                  <p className="mb-2">{roast.content}</p>
                  <p className="text-sm text-gray-600 mb-2">🔥 Votes: {roast.votes}</p>
                  <button
                    onClick={() => handleVote(roast.id)}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Vote for This Roast
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center">
              <p>Loading roasts...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
