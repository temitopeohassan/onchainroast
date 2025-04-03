import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Onchain Roast Battle",
    description: "Engage in epic roast battles on Base!",
    other: {
      "fc:frame": JSON.stringify({
        button: {
          title: "Onchain Roast Battle",
          action: {
            type: "launch_frame",
            splashBackgroundColor: "#E5E5E5",
            url: "https://onchainroast.vercel.app/",
            splashImageUrl: "https://onchainroast.vercel.app/splash.png",
            name: "Onchain Roast Battle"
          }
        },
        version: "next",
        imageUrl: "https://onchainroast.vercel.app/image.png"
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background overflow-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
