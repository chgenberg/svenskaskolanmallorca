import { Suspense } from "react";
import { WizardShell } from "@/components/wizard/WizardShell";

export default function GymnasietPage() {
  return (
    <Suspense fallback={<main className="flex min-h-dvh items-center justify-center text-stone">Laddar…</main>}>
      <WizardShell />
    </Suspense>
  );
}
