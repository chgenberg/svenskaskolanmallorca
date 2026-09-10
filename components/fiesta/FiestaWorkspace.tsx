"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SchoolLogo } from "@/components/brand/SchoolLogo";
import { Button, Field, TextArea, TextInput } from "@/components/ui";
import {
  formatMeetingDate,
  ROLE_BY_TOPIC,
  sourceLabel,
  suggestTopic,
  TOPICS,
  topicOf,
  type ClipSource,
  type FiestaState,
  type RoleStatus,
  type TopicId,
} from "@/lib/fiesta/model";
import { useFiestaStore } from "@/lib/fiesta/store";

export function FiestaWorkspace({ embedded = false }: { embedded?: boolean }) {
  const store = useFiestaStore();
  const [busy, setBusy] = useState<"pdf" | "docx" | null>(null);

  useEffect(() => {
    void useFiestaStore.persist.rehydrate();
  }, []);

  async function exportFile(kind: "pdf" | "docx") {
    setBusy(kind);
    try {
      const payload: FiestaState = {
        meetingTitle: store.meetingTitle,
        meetingDate: store.meetingDate,
        meetingPlace: store.meetingPlace,
        attendees: store.attendees,
        notesByTopic: store.notesByTopic,
        roles: store.roles,
        clips: store.clips,
      };
      const path = kind === "pdf" ? "/api/fiesta/export-pdf" : "/api/fiesta/export-docx";
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Export misslyckades");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = kind === "pdf" ? "fiesta-halloween.pdf" : "fiesta-halloween.docx";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  }

  const exportButtons = (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => void exportFile("pdf")}
        className={
          embedded
            ? "h-12 rounded-xl bg-pine px-5 text-[16px] font-medium text-white disabled:opacity-50"
            : "h-12 rounded-xl bg-white px-5 text-[16px] font-medium text-pine disabled:opacity-50"
        }
      >
        {busy === "pdf" ? "Skapar PDF…" : "PDF"}
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => void exportFile("docx")}
        className={
          embedded
            ? "h-12 rounded-xl border border-line bg-card px-5 text-[16px] font-medium text-ink disabled:opacity-50"
            : "h-12 rounded-xl border border-white/35 bg-white/10 px-5 text-[16px] font-medium text-white disabled:opacity-50"
        }
      >
        {busy === "docx" ? "Skapar Word…" : "Word"}
      </button>
    </div>
  );

  return (
    <main className={embedded ? "bg-paper pb-16" : "min-h-dvh bg-paper"}>
      {embedded ? (
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 pb-2">
          <p className="text-[15px] text-stone">Klistra Wispr och Pocket. Exportera efter mötet.</p>
          {exportButtons}
        </div>
      ) : (
        <header className="border-b border-line bg-pine text-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-5 py-5">
            <SchoolLogo size={56} priority />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-white/80">
                Svenska Skolan Mallorca
              </p>
              <h1 className="font-serif text-[28px] font-semibold leading-8">Fiesta</h1>
              <p className="text-[14px] text-white/80">
                Arbetsyta för festgruppen. Inte startsidan ut mot familjer.
              </p>
            </div>
            {exportButtons}
          </div>
          <div className="h-1 bg-gold" />
        </header>
      )}

      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="text-[12px] font-semibold tracking-[0.12em] text-pine uppercase">Agenda</p>
          <ol className="mt-3 space-y-1">
            {TOPICS.map((topic) => (
              <li key={topic.id}>
                <a
                  href={`#${topic.id}`}
                  className={`block rounded-xl px-3 py-2 text-[14px] leading-5 ${
                    topic.focus ? "bg-pine-soft font-semibold text-ink" : "text-stone hover:text-ink"
                  }`}
                >
                  {topic.title}
                  <span className="ml-2 text-[12px] font-normal text-stone">{topic.minutes} min</span>
                </a>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-[13px] leading-5 text-stone">
            {formatMeetingDate(store.meetingDate) || "Sätt datum"} · ca 90 min · Halloween tar merparten.
          </p>
          <Link href="/" className="mt-4 inline-block text-[13px] text-klint underline">
            Tillbaka till Underlaget
          </Link>
        </aside>

        <div className="space-y-8">
          <section className="rounded-[20px] bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Möte">
                <TextInput
                  value={store.meetingTitle}
                  onChange={(e) => store.patch({ meetingTitle: e.target.value })}
                />
              </Field>
              <Field label="Datum">
                <TextInput
                  type="date"
                  value={store.meetingDate}
                  onChange={(e) => store.patch({ meetingDate: e.target.value })}
                />
              </Field>
              <Field label="Plats">
                <TextInput
                  value={store.meetingPlace}
                  onChange={(e) => store.patch({ meetingPlace: e.target.value })}
                />
              </Field>
              <Field label="Närvarande" hint="Namn, kommaseparerat. Fylls på under mötet.">
                <TextInput
                  value={store.attendees}
                  onChange={(e) => store.patch({ attendees: e.target.value })}
                />
              </Field>
            </div>
          </section>

          <Inbox />

          {TOPICS.map((topic) => (
            <TopicBlock key={topic.id} id={topic.id} />
          ))}

          <InboxClips />

          <p className="pb-10 text-center text-[13px] text-stone">
            Mallarna följer sajten: blå topp, gul linje, Svenska Skolan Mallorca.{" "}
            <a href="https://www.svenskaskolanmallorca.com/" className="text-klint underline">
              svenskaskolanmallorca.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

function Inbox() {
  const ingest = useFiestaStore((s) => s.ingest);
  const [text, setText] = useState("");
  const [source, setSource] = useState<ClipSource>("wispr");
  const [target, setTarget] = useState<TopicId | "auto">("auto");
  const guess = useMemo(() => (text.trim() ? suggestTopic(text) : "inbox"), [text]);

  function submit() {
    ingest(text, source, target);
    setText("");
  }

  return (
    <section className="rounded-[20px] border border-pine/20 bg-card p-6">
      <h2 className="font-serif text-[24px] font-semibold text-ink">Klistra in från Wispr eller Pocket</h2>
      <p className="mt-2 max-w-xl text-[15px] leading-6 text-stone">
        Kopiera transkriptionen från Wispr, eller en sparad lapp från Pocket. Tom rad mellan stycken ger
        flera klipp. Välj auto så läggs texten mot baren, tunneln, dörren, smyckning eller de korta
        punkterna.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Källa">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as ClipSource)}
            className="w-full rounded-[12px] border border-line bg-card px-3.5 py-3 text-[17px] text-ink"
          >
            <option value="wispr">Wispr</option>
            <option value="pocket">Pocket</option>
            <option value="note">Anteckning</option>
          </select>
        </Field>
        <Field label="Lägg mot" hint={target === "auto" && text.trim() ? `Förslag: ${topicOf(guess).title}` : undefined}>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as TopicId | "auto")}
            className="w-full rounded-[12px] border border-line bg-card px-3.5 py-3 text-[17px] text-ink"
          >
            <option value="auto">Auto — läs av orden</option>
            {TOPICS.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
            <option value="inbox">Parkera osorterat</option>
          </select>
        </Field>
      </div>
      <Field label="Text">
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Klistra här. T.ex. “Lisa tar baren, vi behöver två till i spöktunneln…”"
        />
      </Field>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" disabled={!text.trim()} onClick={submit}>
          Lägg in i agendan
        </Button>
        <Button type="button" variant="ghost" disabled={!text} onClick={() => setText("")}>
          Töm rutan
        </Button>
      </div>
    </section>
  );
}

function TopicBlock({ id }: { id: TopicId }) {
  const topic = topicOf(id);
  const note = useFiestaStore((s) => s.notesByTopic[id]);
  const setNote = useFiestaStore((s) => s.setNote);
  const clips = useFiestaStore((s) => s.clips.filter((clip) => clip.topicId === id));
  const roleId = ROLE_BY_TOPIC[id];

  return (
    <section id={id} className="scroll-mt-6 rounded-[20px] bg-card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-[24px] font-semibold text-ink">{topic.title}</h2>
        <p className="text-[13px] text-stone">
          {topic.minutes} min{topic.focus ? " · fokus" : ""}
        </p>
      </div>
      <p className="mt-2 text-[15px] leading-6 text-stone">{topic.help}</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px] text-ink">
        {topic.decide.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      {roleId ? <RoleFields id={roleId} /> : null}

      <div className="mt-5">
        <Field label="Beslut och anteckning från rummet">
          <TextArea value={note} onChange={(e) => setNote(id, e.target.value)} />
        </Field>
      </div>

      {clips.length ? (
        <div className="mt-5 space-y-3">
          <p className="text-[13px] font-medium text-stone">Inklistrat</p>
          {clips.map((clip) => (
            <ClipCard key={clip.id} id={clip.id} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function RoleFields({ id }: { id: "bar" | "tunnel" | "door" | "deco" }) {
  const role = useFiestaStore((s) => s.roles[id]);
  const patchRole = useFiestaStore((s) => s.patchRole);

  return (
    <div className="mt-5 grid gap-3 rounded-2xl bg-pine-soft/60 p-4 sm:grid-cols-2">
      <Field label="Ansvarig">
        <TextInput value={role.lead} onChange={(e) => patchRole(id, { lead: e.target.value, status: e.target.value ? "named" : "open" })} />
      </Field>
      <Field label="Med sig">
        <TextInput value={role.helpers} onChange={(e) => patchRole(id, { helpers: e.target.value })} />
      </Field>
      <Field label="Hur många behövs">
        <TextInput value={role.count} onChange={(e) => patchRole(id, { count: e.target.value })} />
      </Field>
      <Field label="Läge">
        <select
          value={role.status}
          onChange={(e) => patchRole(id, { status: e.target.value as RoleStatus })}
          className="w-full rounded-[12px] border border-line bg-card px-3.5 py-3 text-[17px] text-ink"
        >
          <option value="open">Saknar ansvarig</option>
          <option value="named">Ansvarig utsedd</option>
          <option value="ready">Klart att köra</option>
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Praktiskt för rollen">
          <TextArea value={role.note} onChange={(e) => patchRole(id, { note: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}

function ClipCard({ id }: { id: string }) {
  const clip = useFiestaStore((s) => s.clips.find((item) => item.id === id));
  const moveClip = useFiestaStore((s) => s.moveClip);
  const removeClip = useFiestaStore((s) => s.removeClip);
  if (!clip) return null;

  return (
    <article className="rounded-2xl border border-line px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-semibold tracking-[0.08em] text-pine uppercase">{sourceLabel(clip.source)}</p>
        <div className="flex gap-2">
          <select
            value={clip.topicId}
            onChange={(e) => moveClip(clip.id, e.target.value as TopicId)}
            className="rounded-lg border border-line bg-card px-2 py-1 text-[13px] text-ink"
          >
            <option value="inbox">Osorterat</option>
            {TOPICS.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
          <button type="button" className="text-[13px] text-stone underline" onClick={() => removeClip(clip.id)}>
            Ta bort
          </button>
        </div>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-[15px] leading-6 text-ink">{clip.text}</p>
    </article>
  );
}

function InboxClips() {
  const clips = useFiestaStore((s) => s.clips.filter((clip) => clip.topicId === "inbox"));
  if (!clips.length) return null;
  return (
    <section className="rounded-[20px] bg-card p-6">
      <h2 className="font-serif text-[24px] font-semibold text-ink">Osorterat</h2>
      <p className="mt-2 text-[15px] text-stone">Hamnade inte mot en punkt. Flytta dem i rullistan.</p>
      <div className="mt-4 space-y-3">
        {clips.map((clip) => (
          <ClipCard key={clip.id} id={clip.id} />
        ))}
      </div>
    </section>
  );
}
