"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SchoolLogo } from "@/components/brand/SchoolLogo";
import type { Board } from "@/lib/fiesta/board-model";
import { FiestaBoard } from "./FiestaBoard";
import { FiestaWorkspace } from "./FiestaWorkspace";

export function FiestaShell({ initialBoard }: { initialBoard: Board }) {
  const router = useRouter();
  const [tab, setTab] = useState<"board" | "notes">("board");
  const [leaving, setLeaving] = useState(false);

  async function logout() {
    setLeaving(true);
    await fetch("/api/fiesta/logout", { method: "POST" });
    router.refresh();
    router.push("/fiesta");
  }

  return (
    <div>
      <header className="border-b border-line bg-pine text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-5 py-5">
          <SchoolLogo size={56} priority />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-white/80">
              Svenska Skolan Mallorca
            </p>
            <h1 className="font-serif text-[28px] font-semibold leading-8">Fiesta</h1>
            <p className="text-[14px] text-white/80">Festgruppens tavla. Inte ut mot alla familjer.</p>
          </div>
          <button
            type="button"
            className="h-12 rounded-xl border border-white/35 px-5 text-[16px] font-medium text-white disabled:opacity-50"
            disabled={leaving}
            onClick={() => void logout()}
          >
            Logga ut
          </button>
        </div>
        <div className="h-1 bg-gold" />
      </header>

      <div className="mx-auto max-w-5xl px-5 py-6">
        <div className="flex flex-wrap gap-2">
          <TabButton active={tab === "board"} onClick={() => setTab("board")}>
            Grupper
          </TabButton>
          <TabButton active={tab === "notes"} onClick={() => setTab("notes")}>
            Mötesanteckningar
          </TabButton>
          <Link href="/" className="ml-auto self-center text-[14px] text-klint underline">
            Underlaget
          </Link>
        </div>
      </div>

      {tab === "board" ? (
        <div className="mx-auto max-w-5xl px-5 pb-16">
          <FiestaBoard initialBoard={initialBoard} />
        </div>
      ) : (
        <FiestaWorkspace embedded />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-xl px-4 text-[15px] font-medium ${
        active ? "bg-pine text-white" : "border border-line bg-card text-ink"
      }`}
    >
      {children}
    </button>
  );
}
