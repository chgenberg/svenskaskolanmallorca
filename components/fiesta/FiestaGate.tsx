"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SchoolLogo } from "@/components/brand/SchoolLogo";
import { Button, Field, TextInput } from "@/components/ui";

export function FiestaGate({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/fiesta/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Fel lösenord.");
        return;
      }
      router.refresh();
      router.push("/fiesta");
    } catch {
      setError("Kunde inte nå servern.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center px-5 py-16">
      <div className="w-full max-w-[420px] rounded-[20px] bg-card px-8 py-10">
        <div className="flex justify-center">
          <SchoolLogo size={88} priority />
        </div>
        <p className="mt-5 text-center text-[13px] font-semibold tracking-[0.12em] text-pine uppercase">
          Svenska Skolan Mallorca
        </p>
        <h1 className="font-serif mt-3 text-center text-[32px] font-semibold text-ink">Fiesta</h1>
        <p className="mt-3 text-center text-[16px] leading-6 text-stone">
          Arbetsyta för festgruppen. Skriv lösenordet ni fick i gruppen.
        </p>

        {!configured ? (
          <p className="mt-6 rounded-[14px] bg-warn-bg px-4 py-3 text-[15px] text-warn">
            Lösenordet är inte satt på servern. Lägg FIESTA_PASSWORD i Railway Variables.
          </p>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={(event) => void submit(event)}>
            <Field label="Lösenord">
              <TextInput
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {error ? <p className="text-[14px] text-stop">{error}</p> : null}
            <Button type="submit" disabled={busy || !password.trim()} className="w-full">
              {busy ? "Öppnar…" : "Öppna arbetsytan"}
            </Button>
          </form>
        )}

        <p className="mt-8 text-center text-[13px] text-stone">
          <Link href="/" className="text-klint underline">
            Tillbaka till Underlaget
          </Link>
        </p>
      </div>
    </main>
  );
}
