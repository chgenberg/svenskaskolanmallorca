"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  defaultFiestaState,
  newClipId,
  suggestTopic,
  type ClipSource,
  type FiestaState,
  type Role,
  type RoleId,
  type TopicId,
} from "./model";

export type FiestaStore = FiestaState & {
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  patch: (partial: Partial<FiestaState>) => void;
  setNote: (topicId: TopicId, text: string) => void;
  patchRole: (id: RoleId, partial: Partial<Role>) => void;
  ingest: (text: string, source: ClipSource, topicId?: TopicId | "auto") => void;
  moveClip: (id: string, topicId: TopicId) => void;
  removeClip: (id: string) => void;
  reset: () => void;
};

export const useFiestaStore = create<FiestaStore>()(
  persist(
    (set, get) => ({
      ...defaultFiestaState(),
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      patch: (partial) => set(partial),
      setNote: (topicId, text) =>
        set({ notesByTopic: { ...get().notesByTopic, [topicId]: text } }),
      patchRole: (id, partial) =>
        set({ roles: { ...get().roles, [id]: { ...get().roles[id], ...partial } } }),
      ingest: (text, source, topicId = "auto") => {
        const chunks = text
          .split(/\n{2,}/)
          .map((chunk) => chunk.trim())
          .filter(Boolean);
        const pieces = chunks.length > 0 ? chunks : [text.trim()].filter(Boolean);
        if (pieces.length === 0) return;
        const at = new Date().toISOString();
        const clips = [
          ...get().clips,
          ...pieces.map((piece) => ({
            id: newClipId(),
            source,
            topicId: topicId === "auto" || !topicId ? suggestTopic(piece) : topicId,
            text: piece,
            at,
          })),
        ];
        set({ clips });
      },
      moveClip: (id, topicId) =>
        set({
          clips: get().clips.map((clip) => (clip.id === id ? { ...clip, topicId } : clip)),
        }),
      removeClip: (id) => set({ clips: get().clips.filter((clip) => clip.id !== id) }),
      reset: () => set({ ...defaultFiestaState(), hydrated: true }),
    }),
    {
      name: "fiesta-mote-v1",
      skipHydration: true,
      merge: (persisted, current) => ({
        ...current,
        ...(typeof persisted === "object" && persisted ? persisted : {}),
      }),
      partialize: (state) => {
        const { hydrated, setHydrated, patch, setNote, patchRole, ingest, moveClip, removeClip, reset, ...rest } =
          state;
        void hydrated;
        void setHydrated;
        void patch;
        void setNote;
        void patchRole;
        void ingest;
        void moveClip;
        void removeClip;
        void reset;
        return rest;
      },
    },
  ),
);
