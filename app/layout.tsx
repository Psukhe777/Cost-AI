import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Cost AI",
  description: "Zero-config LLM cost, token, TPS, and latency tracking."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 font-sans text-zinc-50 antialiased">
        {children}
      </body>
    </html>
  );
}
