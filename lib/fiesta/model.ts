export type ClipSource = "wispr" | "pocket" | "note";

export type TopicId =
  | "inbox"
  | "opening"
  | "halloween"
  | "halloween-bar"
  | "halloween-tunnel"
  | "halloween-door"
  | "halloween-deco"
  | "disco"
  | "musical"
  | "fika"
  | "next";

export type RoleId = "bar" | "tunnel" | "door" | "deco";

export type RoleStatus = "" | "open" | "named" | "ready";

export type Role = {
  lead: string;
  helpers: string;
  count: string;
  status: RoleStatus;
  note: string;
};

export type Clip = {
  id: string;
  source: ClipSource;
  topicId: TopicId;
  text: string;
  at: string;
};

export type FiestaState = {
  meetingTitle: string;
  meetingDate: string;
  meetingPlace: string;
  attendees: string;
  notesByTopic: Record<TopicId, string>;
  roles: Record<RoleId, Role>;
  clips: Clip[];
};

export type Topic = {
  id: TopicId;
  title: string;
  short: string;
  minutes: number;
  focus?: boolean;
  decide: string[];
  help: string;
};

export const TOPICS: Topic[] = [
  {
    id: "opening",
    title: "Öppning",
    short: "Vem är här, vad ska vara klart när vi går",
    minutes: 5,
    decide: ["Vem antecknar och skickar ut efteråt"],
    help: "Kort runda. Halloween tar huvuddelen av tiden.",
  },
  {
    id: "halloween",
    title: "Halloweenfesten",
    short: "Huvudfokus för mötet",
    minutes: 35,
    focus: true,
    decide: [
      "Datum och klockslag",
      "Vem som har helhetsgreppet",
      "Vad som måste vara klart en vecka före",
    ],
    help: "Inte hur länge familjerna tänker stanna på festen — vem som tar vilken roll, och vad som saknas.",
  },
  {
    id: "halloween-bar",
    title: "Baren",
    short: "Dryck, godis, kassa",
    minutes: 8,
    focus: true,
    decide: ["Ansvarig", "Hur många i pass", "Vad som ska köpas in"],
    help: "Stå i baren: flöde, priser, vem som hanterar pengar.",
  },
  {
    id: "halloween-tunnel",
    title: "Spöktunneln",
    short: "Bana, bemanning, säkerhet",
    minutes: 8,
    focus: true,
    decide: ["Ansvarig", "Hur många vuxna inne", "När den byggs"],
    help: "Spöktunneln behöver både byggas och bemannas. Barn ska kunna gå ut snabbt.",
  },
  {
    id: "halloween-door",
    title: "Dörren",
    short: "Insläpp, välkomnande, kö",
    minutes: 6,
    focus: true,
    decide: ["Ansvarig", "Två pass eller ett", "Vad som sägs i dörren"],
    help: "Första mötet med festen. Hålla kön, hälsa, släppa in i lagom takt.",
  },
  {
    id: "halloween-deco",
    title: "Smycka skolan",
    short: "Utsmyckning före festen",
    minutes: 8,
    focus: true,
    decide: ["Ansvarig", "Vilken dag vi smyckar", "Vad skolan redan har"],
    help: "Smyckning är ett eget pass, inte samma personer som står i baren samma kväll om det går att undvika.",
  },
  {
    id: "disco",
    title: "Skoldisco",
    short: "Kort — nästa steg, inte djupdyk",
    minutes: 8,
    decide: ["Är datum spikat?", "Vem driver vidare till nästa möte?"],
    help: "Parkera detaljer. En mening om läge, en om nästa steg.",
  },
  {
    id: "musical",
    title: "Musikalen",
    short: "Kort — läge och vad festgruppen hjälper med",
    minutes: 8,
    decide: ["Behöver festgruppen något konkret till nästa repetition?"],
    help: "Musikalen är stor, men inte kvällens ämne. Fånga bara det som festgruppen äger.",
  },
  {
    id: "fika",
    title: "Skolfika",
    short: "Kort — schema och ansvar",
    minutes: 6,
    decide: ["Nästa fika: datum och vem som bakar/inköp"],
    help: "Håll det praktiskt. Inte en ny diskussion om formatet om det redan fungerar.",
  },
  {
    id: "next",
    title: "Nästa möte",
    short: "När, vem skickar anteckningarna",
    minutes: 5,
    decide: ["Datum för nästa Fiesta-möte", "Vem renskriver och skickar"],
    help: "Avsluta med tre rader: beslutat, öppet, vem gör vad till nästa gång.",
  },
];

const emptyRole = (): Role => ({
  lead: "",
  helpers: "",
  count: "",
  status: "open",
  note: "",
});

const emptyNotes = (): Record<TopicId, string> => ({
  inbox: "",
  opening: "",
  halloween: "",
  "halloween-bar": "",
  "halloween-tunnel": "",
  "halloween-door": "",
  "halloween-deco": "",
  disco: "",
  musical: "",
  fika: "",
  next: "",
});

export const defaultFiestaState = (): FiestaState => ({
  meetingTitle: "Fiesta / festgruppen",
  meetingDate: "2026-09-10",
  meetingPlace: "Svenska Skolan Mallorca",
  attendees: "",
  notesByTopic: emptyNotes(),
  roles: {
    bar: emptyRole(),
    tunnel: emptyRole(),
    door: emptyRole(),
    deco: emptyRole(),
  },
  clips: [],
});

export const ROLE_BY_TOPIC: Partial<Record<TopicId, RoleId>> = {
  "halloween-bar": "bar",
  "halloween-tunnel": "tunnel",
  "halloween-door": "door",
  "halloween-deco": "deco",
};

export const TOPIC_BY_ROLE: Record<RoleId, TopicId> = {
  bar: "halloween-bar",
  tunnel: "halloween-tunnel",
  door: "halloween-door",
  deco: "halloween-deco",
};

export function topicOf(id: TopicId): Topic {
  return TOPICS.find((topic) => topic.id === id) ?? TOPICS[0];
}

export function sourceLabel(source: ClipSource): string {
  if (source === "wispr") return "Wispr";
  if (source === "pocket") return "Pocket";
  return "Anteckning";
}

export function roleStatusLabel(status: RoleStatus): string {
  if (status === "named") return "Ansvarig utsedd";
  if (status === "ready") return "Klart att köra";
  if (status === "open") return "Saknar ansvarig";
  return "";
}

const ROUTES: { topic: TopicId; words: string[] }[] = [
  { topic: "halloween-bar", words: ["bar", "baren", "dryck", "läsk", "saft", "kassa", "godisbar"] },
  { topic: "halloween-tunnel", words: ["spöktunnel", "tunnel", "spök", "skräck", "läskig"] },
  { topic: "halloween-door", words: ["dörr", "dörren", "entré", "insläpp", "biljett", "välkomna", "kön"] },
  { topic: "halloween-deco", words: ["smyck", "dekor", "utsmyck", "pumpa", "spindelnät", "ljusslinga"] },
  { topic: "disco", words: ["skoldisco", "disco", "dans"] },
  { topic: "musical", words: ["musikal", "föreställning", "scen", "repetition"] },
  { topic: "fika", words: ["skolfika", "fika", "kaffe", "bulle"] },
  { topic: "halloween", words: ["halloween", "halloweenfest", "festen"] },
  { topic: "next", words: ["nästa möte", "skicka ut", "anteckningarna"] },
];

export function suggestTopic(text: string): TopicId {
  const hay = text.toLowerCase();
  let best: TopicId = "inbox";
  let score = 0;
  for (const route of ROUTES) {
    const hits = route.words.filter((word) => hay.includes(word)).length;
    if (hits > score) {
      score = hits;
      best = route.topic;
    }
  }
  return best;
}

export function newClipId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatMeetingDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
