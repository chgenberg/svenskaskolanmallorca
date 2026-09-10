export type GroupId = "halloween" | "disco" | "musical" | "fika" | "core";

export type BoardMember = {
  id: string;
  name: string;
  role: string;
  done: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardGroup = {
  id: GroupId;
  note: string;
  members: BoardMember[];
};

export type Board = {
  updatedAt: string;
  groups: Record<GroupId, BoardGroup>;
};

export const GROUP_META: { id: GroupId; title: string; blurb: string; roles: string[] }[] = [
  {
    id: "halloween",
    title: "Halloweenfesten",
    blurb: "Kvällens huvudgrupp. Fyra roller: bar, spöktunnel, dörr, smyckning.",
    roles: ["Baren", "Spöktunneln", "Dörren", "Smycka skolan", "Helhetsgrepp", "Annat"],
  },
  {
    id: "disco",
    title: "Skoldisco",
    blurb: "Datum, musik, vuxna i salen. Inte samma detaljer som Halloween.",
    roles: ["Ansvarig", "Musik", "Fika/kassa", "Vuxna i salen", "Annat"],
  },
  {
    id: "musical",
    title: "Musikalen",
    blurb: "Det festgruppen hjälper till med — inte hela produktionen.",
    roles: ["Kontakt mot produktionen", "Fika/paus", "Dekor/rekvisita", "Annat"],
  },
  {
    id: "fika",
    title: "Skolfika",
    blurb: "Nästa fika: datum, bakning, inköp.",
    roles: ["Ansvarig nästa fika", "Bakar", "Inköp", "Annat"],
  },
  {
    id: "core",
    title: "Fiesta-kärnan",
    blurb: "De som håller ihop gruppen: kallelser, lösenord, anteckningar.",
    roles: ["Kallar till möte", "Antecknar", "Lösenord/sajt", "Annat"],
  },
];

export function groupMeta(id: GroupId) {
  return GROUP_META.find((group) => group.id === id) ?? GROUP_META[0];
}

export function isGroupId(value: string): value is GroupId {
  return GROUP_META.some((group) => group.id === value);
}

export function emptyGroup(id: GroupId): BoardGroup {
  return { id, note: "", members: [] };
}

export function emptyBoard(): Board {
  return {
    updatedAt: new Date().toISOString(),
    groups: {
      halloween: emptyGroup("halloween"),
      disco: emptyGroup("disco"),
      musical: emptyGroup("musical"),
      fika: emptyGroup("fika"),
      core: emptyGroup("core"),
    },
  };
}
