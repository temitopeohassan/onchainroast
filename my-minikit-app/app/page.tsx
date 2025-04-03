"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Name, Identity } from "@coinbase/onchainkit/identity";

interface Battle {
  id: number;
  challenger: string;
  opponent: string;
}

export default function App() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const { address } = useAccount();
  const [battles, setBattles] = useState<Battle[]>([]);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    async function fetchBattles() {
      try {
        const res = await fetch("/api/battles");
        const data = await res.json();
        setBattles(data);
      } catch (error) {
        console.error("Error fetching battles:", error);
      }
    }
    fetchBattles();
  }, []);

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
          <h1 className="text-2xl font-bold text-center">🔥 Onchain Roast Battles 🔥</h1>
          <p className="text-center text-gray-600">Engage in epic roast battles on Base!</p>
          
          {battles.length > 0 ? (
            <ul className="space-y-4">
              {battles.map((battle) => (
                <li key={battle.id} className="bg-white p-4 rounded-lg shadow">
                  <p className="font-bold">Battle #{battle.id}</p>
                  <p className="text-sm">Challenger: {battle.challenger}</p>
                  <p className="text-sm">Opponent: {battle.opponent}</p>
                  <a
                    href={`/battle/${battle.id}`}
                    className="mt-2 inline-block bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    View Battle
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center">
              <p>Loading battles...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
