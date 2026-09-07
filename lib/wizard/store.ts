"use client";

import { createContext, createElement, useContext, type ReactNode } from "react";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
import { TRACKS, type SchoolTrackId } from "@/lib/tracks/config";
import { defaultState } from "./defaults";
import { getSteps, suggestedCategory } from "./steps";
import type { StepId, WizardState } from "./types";
import { canContinue } from "./validation";

export type WizardStore = WizardState & {
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  patch: (partial: Partial<WizardState>) => void;
  patchGuardian: (which: 1 | 2, partial: Partial<WizardState["guardian1"]>) => void;
  goTo: (id: StepId) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
  resetBranch: () => void;
  loadPersona: (state: WizardState) => void;
  toggleAttachment: (id: string, value: boolean) => void;
};

const BRANCH_RESET: Partial<WizardState> = {
  employerForm: "",
  isOwnerOrCeo: "",
  category: "",
  employerName: "",
  employerOrgNr: "",
  employerAddress: "",
  employerWebsite: "",
  jobTitle: "",
  swedishControllerName: "",
  swedishControllerOrgNr: "",
  ownershipPercent: "",
  influenceDescription: "",
  employmentType: "",
  workAbroadFrom: "",
  workAbroadTo: "",
  jobPoints: "",
  whyRaw: "",
  whyGenerated: "",
  whyApproved: false,
  writeMyself: false,
  canIndependentSign: "",
  signerName: "",
  signerTitle: "",
  signerEmail: "",
  signerPhone: "",
  signerType: "",
  auditorName: "",
  auditorEmail: "",
  letterGenerated: "",
  letterApproved: false,
  dailyLanguage: "",
  studentSwedish: "",
  institutionName: "",
  institutionCountry: "",
  studyDescription: "",
  studyMode: "",
  funding: "",
  fundingPayer: "",
  fundingPeriod: "",
  cultureType: "",
  culturePoints: "",
  cultureWhere: "",
  cultureClients: "",
  cultureLivelihood: "",
  cultureProof: "",
  societyWhat: "",
  societyWhySweden: "",
  societyVerifier: "",
  exceptionalReasons: "",
  exceptionalWho: "",
  exceptionalDocs: "",
  attachmentChecks: {},
};

type WizardHook = UseBoundStore<StoreApi<WizardStore>> & {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
    rehydrate: () => void | Promise<void>;
  };
};

export function createWizardStore(trackId: SchoolTrackId): WizardHook {
  const track = TRACKS[trackId];
  return create<WizardStore>()(
    persist(
      (set, get) => ({
        ...defaultState(trackId),
        hydrated: false,
        setHydrated: (value) => set({ hydrated: value }),
        patch: (partial) => {
          const next = { ...partial };
          if (partial.employerForm && !partial.category) {
            const suggested = suggestedCategory(partial.employerForm);
            if (suggested) next.category = suggested;
          }
          if (partial.whyRaw !== undefined || partial.whyGenerated !== undefined) {
            next.whyApproved = false;
          }
          if (partial.letterGenerated !== undefined) {
            next.letterApproved = false;
          }
          set(next);
        },
        patchGuardian: (which, partial) => {
          const key = which === 1 ? "guardian1" : "guardian2";
          set({ [key]: { ...get()[key], ...partial } });
        },
        goTo: (id) => set({ currentStepId: id }),
        next: () => {
          const state = get();
          if (!canContinue(state, state.currentStepId)) return;
          const steps = getSteps(state);
          const index = steps.findIndex((step) => step.id === state.currentStepId);
          const following = steps[index + 1];
          if (following) set({ currentStepId: following.id });
        },
        back: () => {
          const state = get();
          const steps = getSteps(state);
          const index = steps.findIndex((step) => step.id === state.currentStepId);
          const previous = steps[index - 1];
          if (previous) set({ currentStepId: previous.id });
        },
        reset: () => set({ ...defaultState(trackId), hydrated: true }),
        resetBranch: () => set({ ...BRANCH_RESET, currentStepId: "reason" }),
        loadPersona: (state) =>
          set({
            ...state,
            schoolTrack: trackId,
            attachmentChecks: state.attachmentChecks ?? {},
            hydrated: true,
            currentStepId: "pack",
          }),
        toggleAttachment: (id, value) =>
          set({
            attachmentChecks: { ...(get().attachmentChecks ?? {}), [id]: value },
          }),
      }),
      {
        name: track.persistKey,
        skipHydration: true,
        merge: (persisted, current) => ({
          ...current,
          ...(typeof persisted === "object" && persisted ? persisted : {}),
        }),
        partialize: (state) => {
          const {
            hydrated,
            setHydrated,
            patch,
            patchGuardian,
            goTo,
            next,
            back,
            reset,
            resetBranch,
            loadPersona,
            toggleAttachment,
            ...rest
          } = state;
          void hydrated;
          void setHydrated;
          void patch;
          void patchGuardian;
          void goTo;
          void next;
          void back;
          void reset;
          void resetBranch;
          void loadPersona;
          void toggleAttachment;
          return rest;
        },
      },
    ),
  );
}

export const gymnasietStore = createWizardStore("gymnasiet");
export const grundskolaStore = createWizardStore("grundskola");

const StoreContext = createContext<WizardHook>(gymnasietStore);

export function WizardProvider({
  track,
  children,
}: {
  track: SchoolTrackId;
  children: ReactNode;
}) {
  const store = track === "grundskola" ? grundskolaStore : gymnasietStore;
  return createElement(StoreContext.Provider, { value: store }, children);
}

export function useWizardStoreApi() {
  return useContext(StoreContext);
}

export function useWizardStore(): WizardStore;
export function useWizardStore<T>(selector: (state: WizardStore) => T): T;
export function useWizardStore<T>(selector?: (state: WizardStore) => T): T | WizardStore {
  const store = useContext(StoreContext);
  return selector ? store(selector) : store();
}
