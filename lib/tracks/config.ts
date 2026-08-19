export type SchoolTrackId = "gymnasiet" | "grundskola";

export type TrackConfig = {
  id: SchoolTrackId;
  persistKey: string;
  label: string;
  shortLabel: string;
  schoolNameOnForm: string;
  submittersLabel: string;
  submittersShort: string;
  feeFull: number;
  feeGrant: number;
  feeDelta: number;
  englishEmployerPack: boolean;
  hermods: boolean;
  hasProgram: boolean;
  yearOptions: { value: string; label: string }[];
};

function eur(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export const TRACKS: Record<SchoolTrackId, TrackConfig> = {
  gymnasiet: {
    id: "gymnasiet",
    persistKey: "underlaget-gymnasiet-v1",
    label: "Gymnasiet",
    shortLabel: "Gymnasiet",
    schoolNameOnForm: "Hermods Distansgymnasium / Svenska Skolan Mallorca",
    submittersLabel: "skolan och Hermods",
    submittersShort: "Svenska Skolan Mallorca och Hermods",
    feeFull: 9300,
    feeGrant: 7100,
    feeDelta: 2200,
    englishEmployerPack: false,
    hermods: true,
    hasProgram: true,
    yearOptions: [
      { value: "1", label: "Åk 1" },
      { value: "2", label: "Åk 2" },
      { value: "3", label: "Åk 3" },
    ],
  },
  grundskola: {
    id: "grundskola",
    persistKey: "underlaget-grundskola-v1",
    label: "Grundskola",
    shortLabel: "Grundskola",
    schoolNameOnForm: "Svenska Skolan Mallorca",
    submittersLabel: "skolan",
    submittersShort: "Svenska Skolan Mallorca",
    feeFull: 8700,
    feeGrant: 6500,
    feeDelta: 2200,
    englishEmployerPack: true,
    hermods: false,
    hasProgram: false,
    yearOptions: [
      { value: "forskoleklass", label: "Förskoleklass" },
      { value: "1", label: "Åk 1" },
      { value: "2", label: "Åk 2" },
      { value: "3", label: "Åk 3" },
      { value: "4", label: "Åk 4" },
      { value: "5", label: "Åk 5" },
      { value: "6", label: "Åk 6" },
      { value: "7", label: "Åk 7" },
      { value: "8", label: "Åk 8" },
      { value: "9", label: "Åk 9" },
    ],
  },
};

export function trackOf(state: { schoolTrack?: SchoolTrackId | "" }): TrackConfig {
  return state.schoolTrack === "grundskola" ? TRACKS.grundskola : TRACKS.gymnasiet;
}

export function formatEuro(n: number) {
  return `${eur(n)} €`;
}

export function feeReductionSentence(track: TrackConfig) {
  const noun = track.id === "grundskola" ? "Grundskoleavgiften" : "Gymnasieavgiften";
  return `${noun} går från ${formatEuro(track.feeFull)} till ${formatEuro(track.feeGrant)} (${formatEuro(track.feeDelta)}).`;
}

export function yearLabel(state: { schoolTrack?: SchoolTrackId | ""; year: string }): string {
  if (!state.year) return "";
  if (state.year === "forskoleklass") return "Förskoleklass";
  const track = trackOf(state);
  return track.id === "grundskola" ? `Grundskola åk ${state.year}` : `Gymnasiet åk ${state.year}`;
}

export function filenameFallback(state: { schoolTrack?: SchoolTrackId | ""; studentLastName: string }) {
  return (state.studentLastName || trackOf(state).id).toLowerCase();
}

export function approvalFeeHint(track: TrackConfig) {
  const noun = track.id === "grundskola" ? "grundskoleavgiften" : "gymnasieavgiften";
  return `Godkännande kan sänka ${noun} med ${formatEuro(track.feeDelta)}.`;
}

export const SCHOOL_FUTURE_SENTENCE =
  "Det är inte enbart en lägre avgift om eleven blir godkänd. Skolans framtid bygger på att vi har tillräckligt många statsbidragsgodkända elever.";

export function leaveToSchoolSentence(track: TrackConfig) {
  return track.hermods
    ? "Lämna till Svenska Skolan Mallorca i början av höstterminen. Skolan och Hermods skickar samlat — ni söker inte själva."
    : "Lämna till Svenska Skolan Mallorca i början av höstterminen. Skolan skickar samlat — ni söker inte själva.";
}
