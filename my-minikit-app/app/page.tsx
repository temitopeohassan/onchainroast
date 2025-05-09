"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Name, Identity } from "@coinbase/onchainkit/identity";
import { sendFrameNotification } from "@/lib/notification-client";

interface Follower {
  fid: number;
  username: string;
}

export default function App() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const { address } = useAccount();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [selectedFollower, setSelectedFollower] = useState<Follower | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    async function fetchFollowers() {
      try {
        // In a real app, you would get the FID from the user's wallet
        // For now, we'll use a mock FID
        const mockFid = 1; // Replace with actual FID
        const res = await fetch(`/api/battles?fid=${mockFid}`);
        if (!res.ok) {
          throw new Error("Failed to fetch followers");
        }
        const data = await res.json();
        setFollowers(data);
      } catch (error) {
        console.error("Error fetching followers:", error);
        setError("Failed to load followers. Please try again later.");
      }
    }
    fetchFollowers();
  }, []);

  const handleTagFollower = async () => {
    if (!selectedFollower) return;
    
    setIsLoading(true);
    try {
      // Create battle in contract
      const battleResponse = await fetch("/api/battles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challenger: address,
          opponent: selectedFollower.fid,
        }),
      });

      if (!battleResponse.ok) {
        throw new Error("Failed to create battle");
      }

      await battleResponse.json();

      // Send notification to tagged follower
      await sendFrameNotification({
        fid: selectedFollower.fid,
        title: "Roast Battle Challenge!",
        body: `You&apos;ve been challenged to a roast battle! Click to accept.`,
      });

      // Send notification to challenger&apos;s followers
      await sendFrameNotification({
        fid: selectedFollower.fid, // In a real app, you&apos;d send to all followers
        title: "New Roast Battle!",
        body: `A new roast battle is starting! Click to watch and vote.`,
      });

      setNotificationSent(true);
    } catch (error) {
      console.error("Error creating battle:", error);
      setError("Failed to create battle. Please try again later.");
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-center">🔥 Onchain Roast Battles 🔥</h1>
          <p className="text-center text-gray-600">Tag a follower to start a roast battle!</p>
          
          {error ? (
            <div className="text-center bg-red-100 p-4 rounded-lg shadow">
              <p className="text-red-600">{error}</p>
            </div>
          ) : !notificationSent ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="font-semibold mb-2">Select a follower to challenge:</h2>
                <select
                  value={selectedFollower?.fid || ""}
                  onChange={(e) => {
                    const follower = followers.find(f => f.fid === parseInt(e.target.value));
                    setSelectedFollower(follower || null);
                  }}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select a follower</option>
                  {followers.map((follower) => (
                    <option key={follower.fid} value={follower.fid}>
                      {follower.username}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleTagFollower}
                disabled={!selectedFollower || isLoading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Battle..." : "Tag for Battle"}
              </button>
            </div>
          ) : (
            <div className="text-center bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold text-green-600 mb-2">Battle Created!</h2>
              <p className="text-gray-600">
                Your follower has been notified. They&apos;ll need to accept the challenge to start the battle.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
