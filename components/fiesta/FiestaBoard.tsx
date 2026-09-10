"use client";

import { useState } from "react";
import { Button, Field, TextArea, TextInput } from "@/components/ui";
import {
  GROUP_META,
  groupMeta,
  type Board,
  type BoardMember,
  type GroupId,
} from "@/lib/fiesta/board-model";

export function FiestaBoard({ initialBoard }: { initialBoard: Board }) {
  const [board, setBoard] = useState(initialBoard);
  const [error, setError] = useState("");

  return (
    <div className="space-y-8">
      <HowWeUseIt />
      <JoinForm
        onSaved={(next) => setBoard(next)}
        onError={setError}
      />
      {error ? <p className="text-[14px] text-stop">{error}</p> : null}
      {GROUP_META.map((group) => (
        <GroupCard
          key={group.id}
          groupId={group.id}
          note={board.groups[group.id]?.note ?? ""}
          members={board.groups[group.id]?.members ?? []}
          onChange={setBoard}
          onError={setError}
        />
      ))}
    </div>
  );
}

function HowWeUseIt() {
  return (
    <section className="rounded-[20px] bg-card p-6">
      <h2 className="font-serif text-[24px] font-semibold text-ink">Så använder vi Fiesta</h2>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-[16px] leading-7 text-ink">
        <li>
          <strong>Ett lösenord.</strong> Dela det i festgruppens chatt, inte på startsidan och inte i
          mejl till hela skolan.
        </li>
        <li>
          <strong>En grupp per grej.</strong> Halloween, skoldisco, musikal, skolfika och kärnan. Gå
          in i den grupp du faktiskt jobbar i — inte i alla.
        </li>
        <li>
          <strong>Skriv namn, roll och en rad.</strong> Halloween: bar, spöktunnel, dörr eller
          smyckning. En person, en huvudroll.
        </li>
        <li>
          <strong>Uppdatera efter varje pass.</strong> Ersätt “vad jag har gjort” med en ny mening.
          Då ser andra läget utan merchatt.
        </li>
        <li>
          <strong>En lägesrad per grupp.</strong> Datum, vad som saknas, nästa fysisk träff. En
          mening räcker.
        </li>
        <li>
          <strong>Mötet.</strong> Titta på tavlan först. Klistra Wispr och Pocket i fliken
          Mötesanteckningar. Exportera PDF eller Word efteråt.
        </li>
      </ol>
    </section>
  );
}

function JoinForm({
  onSaved,
  onError,
}: {
  onSaved: (board: Board) => void;
  onError: (text: string) => void;
}) {
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState<GroupId>("halloween");
  const [role, setRole] = useState(GROUP_META[0].roles[0]);
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);
  const roles = groupMeta(groupId).roles;

  async function submit() {
    setBusy(true);
    try {
      const response = await fetch("/api/fiesta/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", name, groupId, role, done }),
      });
      const data = (await response.json()) as Board & { error?: string };
      if (!response.ok) {
        onError(data.error || "Kunde inte spara.");
        return;
      }
      onSaved(data);
      onError("");
      setDone("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[20px] border border-pine/20 bg-card p-6">
      <h2 className="font-serif text-[24px] font-semibold text-ink">Jag hänger på</h2>
      <p className="mt-2 text-[15px] leading-6 text-stone">
        Samma namn i samma grupp uppdaterar din rad i stället för att skapa en dublett.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Namn">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </Field>
        <Field label="Grupp">
          <select
            value={groupId}
            onChange={(e) => {
              const next = e.target.value as GroupId;
              setGroupId(next);
              setRole(groupMeta(next).roles[0]);
            }}
            className="w-full rounded-[12px] border border-line bg-card px-3.5 py-3 text-[17px] text-ink"
          >
            {GROUP_META.map((group) => (
              <option key={group.id} value={group.id}>
                {group.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Roll jag tar">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-[12px] border border-line bg-card px-3.5 py-3 text-[17px] text-ink"
          >
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vad jag har gjort / tar">
          <TextInput
            value={done}
            onChange={(e) => setDone(e.target.value)}
            placeholder="T.ex. inventerat pumpor, saknar två till i baren"
          />
        </Field>
      </div>
      <div className="mt-4">
        <Button type="button" disabled={busy || name.trim().length < 2} onClick={() => void submit()}>
          {busy ? "Sparar…" : "Spara på tavlan"}
        </Button>
      </div>
    </section>
  );
}

function GroupCard({
  groupId,
  note,
  members,
  onChange,
  onError,
}: {
  groupId: GroupId;
  note: string;
  members: BoardMember[];
  onChange: (board: Board) => void;
  onError: (text: string) => void;
}) {
  const meta = groupMeta(groupId);
  const [draft, setDraft] = useState(note);
  const [saving, setSaving] = useState(false);

  async function saveNote() {
    setSaving(true);
    try {
      const response = await fetch("/api/fiesta/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "note", groupId, note: draft }),
      });
      const data = (await response.json()) as Board & { error?: string };
      if (!response.ok) {
        onError(data.error || "Kunde inte spara läget.");
        return;
      }
      onChange(data);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id={groupId} className="scroll-mt-6 rounded-[20px] bg-card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-[24px] font-semibold text-ink">{meta.title}</h2>
        <p className="text-[13px] text-stone">
          {members.length} {members.length === 1 ? "person" : "personer"}
        </p>
      </div>
      <p className="mt-2 text-[15px] leading-6 text-stone">{meta.blurb}</p>
      <div className="mt-4">
        <Field label="Lägesrad för gruppen" hint="En mening: datum, vad som saknas, nästa träff.">
          <TextArea value={draft} onChange={(e) => setDraft(e.target.value)} />
        </Field>
        <button
          type="button"
          className="mt-2 text-[14px] text-klint underline disabled:text-stone"
          disabled={saving || draft === note}
          onClick={() => void saveNote()}
        >
          {saving ? "Sparar läge…" : "Spara lägesrad"}
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {members.length === 0 ? (
          <p className="text-[15px] text-stone">Ingen har hängt på här än.</p>
        ) : (
          members.map((member) => (
            <MemberRow
              key={`${member.id}-${member.updatedAt}`}
              groupId={groupId}
              member={member}
              roles={meta.roles}
              onChange={onChange}
              onError={onError}
            />
          ))
        )}
      </div>
    </section>
  );
}

function MemberRow({
  groupId,
  member,
  roles,
  onChange,
  onError,
}: {
  groupId: GroupId;
  member: BoardMember;
  roles: string[];
  onChange: (board: Board) => void;
  onError: (text: string) => void;
}) {
  const [done, setDone] = useState(member.done);
  const [role, setRole] = useState(member.role);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const response = await fetch("/api/fiesta/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", groupId, memberId: member.id, role, done }),
      });
      const data = (await response.json()) as Board & { error?: string };
      if (!response.ok) {
        onError(data.error || "Kunde inte uppdatera.");
        return;
      }
      onChange(data);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Ta bort ${member.name} från gruppen?`)) return;
    const response = await fetch("/api/fiesta/board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", groupId, memberId: member.id }),
    });
    const data = (await response.json()) as Board & { error?: string };
    if (!response.ok) {
      onError(data.error || "Kunde inte ta bort.");
      return;
    }
    onChange(data);
  }

  return (
    <article className="rounded-2xl border border-line px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[16px] font-semibold text-ink">{member.name}</p>
        <button type="button" className="text-[13px] text-stone underline" onClick={() => void remove()}>
          Ta bort
        </button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Roll">
          <select
            value={roles.includes(role) ? role : roles[roles.length - 1]}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-[12px] border border-line bg-card px-3.5 py-3 text-[17px] text-ink"
          >
            {roles.includes(role) ? null : <option value={role}>{role}</option>}
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vad jag har gjort">
          <TextInput value={done} onChange={(e) => setDone(e.target.value)} />
        </Field>
      </div>
      <button
        type="button"
        className="mt-2 text-[14px] text-klint underline disabled:text-stone"
        disabled={busy || (done === member.done && role === member.role)}
        onClick={() => void save()}
      >
        {busy ? "Sparar…" : "Uppdatera min rad"}
      </button>
    </article>
  );
}
