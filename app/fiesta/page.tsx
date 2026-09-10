import type { Metadata } from "next";
import { FiestaGate } from "@/components/fiesta/FiestaGate";
import { FiestaShell } from "@/components/fiesta/FiestaShell";
import { fiestaPasswordConfigured, fiestaUnlocked } from "@/lib/fiesta/auth";
import { getBoard } from "@/lib/fiesta/board";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fiesta — festgruppen",
  robots: { index: false, follow: false },
};

export default async function FiestaPage() {
  if (!(await fiestaUnlocked())) {
    return <FiestaGate configured={fiestaPasswordConfigured()} />;
  }
  return <FiestaShell initialBoard={await getBoard()} />;
}
