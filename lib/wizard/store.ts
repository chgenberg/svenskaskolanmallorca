"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultState } from "./defaults";
import { getSteps, suggestedCategory } from "./steps";
import type { StepId, WizardState } from "./types";
import { canContinue } from "./validation";

type WizardStore = WizardState & {
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

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      ...defaultState(),
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
      reset: () => set({ ...defaultState(), hydrated: true }),
      resetBranch: () => set({ ...BRANCH_RESET, currentStepId: "reason" }),
      loadPersona: (state) =>
        set({ ...state, attachmentChecks: state.attachmentChecks ?? {}, hydrated: true, currentStepId: "pack" }),
      toggleAttachment: (id, value) =>
        set({
          attachmentChecks: { ...(get().attachmentChecks ?? {}), [id]: value },
        }),
    }),
    {
      name: "underlaget-gymnasiet-v1",
      skipHydration: true,
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
