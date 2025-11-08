"use client";

import { ChatPanel } from "@/components/ChatPanel";
import { ResultsPanel } from "@/components/ResultsPanel";

export default function Home() {
  return (
    <main className="h-screen flex">
      {/* Chat Panel - 1/4 width */}
      <div className="w-1/4 min-w-[320px] max-w-[400px]">
        <ChatPanel />
      </div>

      {/* Results Panel - 3/4 width */}
      <div className="flex-1">
        <ResultsPanel />
      </div>
    </main>
  );
}
