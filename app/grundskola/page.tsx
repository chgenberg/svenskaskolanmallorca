import { Suspense } from "react";
import { WizardShell } from "@/components/wizard/WizardShell";
import { WizardProvider } from "@/lib/wizard/store";

export default function GrundskolaPage() {
  return (
    <Suspense fallback={<main className="flex min-h-dvh items-center justify-center text-stone">Laddar…</main>}>
      <WizardProvider track="grundskola">
        <WizardShell track="grundskola" />
      </WizardProvider>
    </Suspense>
  );
}
