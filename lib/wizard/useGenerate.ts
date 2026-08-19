"use client";

import { useState } from "react";
import { payloadForModel } from "./sanitize";
import { useWizardStoreApi } from "./store";
import type { GenerateType } from "./types";

export function useGenerate() {
  const store = useWizardStoreApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(type: GenerateType) {
    setLoading(true);
    setError(null);
    const state = store.getState();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload: payloadForModel(state, type) }),
      });
      const data = (await response.json()) as { text?: string; error?: string };
      if (!response.ok || !data.text) {
        throw new Error(data.error || "Kunde inte skapa text just nu.");
      }
      if (type === "why") {
        store.getState().patch({ whyGenerated: data.text, whyApproved: false });
      } else {
        store.getState().patch({ letterGenerated: data.text, letterApproved: false });
      }
      return data.text;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kunde inte skapa text just nu.";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { generate, loading, error };
}
