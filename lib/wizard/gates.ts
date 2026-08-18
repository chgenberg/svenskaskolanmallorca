import type { PackStatus, WizardState } from "./types";

function monthsBetween(from: string, to?: string): number | null {
  if (!from) return null;
  const start = new Date(`${from}-01T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  const end = to ? new Date(`${to}-01T00:00:00`) : new Date();
  if (Number.isNaN(end.getTime())) return null;
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

export function stayTooShort(state: WizardState): boolean {
  if (state.stayType === "indefinite") return false;
  if (!state.stayFrom || !state.stayTo) return false;
  const months = monthsBetween(state.stayFrom, state.stayTo);
  const min = state.reason === "studies" ? 4 : 6;
  return months !== null && months < min;
}

export function hasSwedishCitizen(state: WizardState): boolean {
  const first = state.guardian1.citizenship === "swedish" || state.guardian1.citizenship === "swedish_plus";
  const second =
    state.hasSecondGuardian &&
    (state.guardian2.citizenship === "swedish" || state.guardian2.citizenship === "swedish_plus");
  return first || second;
}

export function isSoleTrader(state: WizardState): boolean {
  return state.reason === "employment" && state.employerForm === "sole_trader";
}

export function wantsSelfSign(state: WizardState): boolean {
  return state.reason === "employment" && state.canIndependentSign === "self";
}

export function mustUseExternalAuditor(state: WizardState): boolean {
  return (
    state.reason === "employment" &&
    (state.canIndependentSign === "no" ||
      state.canIndependentSign === "unsure" ||
      (state.isOwnerOrCeo === "yes" && state.canIndependentSign !== "yes"))
  );
}

export function distanceStudiesBlocked(state: WizardState): boolean {
  return state.reason === "studies" && state.studyMode === "distance";
}

export function getRisks(state: WizardState): string[] {
  const risks: string[] = [];
  if (stayTooShort(state)) {
    risks.push(
      state.reason === "studies"
        ? "Planerad studietid är kortare än en hel termin."
        : "Planerad utlandsvistelse är kortare än 6 månader.",
    );
  }
  if (!hasSwedishCitizen(state) && state.guardian1.citizenship) {
    risks.push("Minst en vårdnadshavare måste vara svensk medborgare.");
  }
  if (state.livesWithAbroadGuardian === "no") {
    risks.push("Hermods tar oftast emot underlag där eleven medföljer vårdnadshavaren.");
  }
  if (state.dailyLanguage === "rarely" || state.studentSwedish === "insufficient") {
    risks.push("Svenskan i vardagen eller i undervisningen kan behöva bedömas av skolan.");
  }
  if (distanceStudiesBlocked(state)) {
    risks.push("Distansstudier vid svenskt lärosäte godkänns inte som grund.");
  }
  if (state.funding === "none") {
    risks.push("Förordningen kräver studiemedel, stipendium eller lön.");
  }
  if (state.cultureLivelihood === "complement") {
    risks.push("Kulturarbetet ska vara den huvudsakliga försörjningen.");
  }
  if (state.exceptionalDocs === "missing") {
    risks.push("Synnerliga skäl kräver intyg som lämnas till skolan, inte här.");
  }
  if (state.category === "F" && state.employmentType === "permanent") {
    risks.push("Kategori F kräver ett tidsbegränsat avtal med start- och slutdatum.");
  }
  return risks;
}

export function getStops(state: WizardState): string[] {
  const stops: string[] = [];
  if (isSoleTrader(state)) {
    stops.push(
      "Enskild firma är inte en juridisk person. Skolverket godkänner inte Intyg om tjänstgöring när arbetsgivaren är du själv som fysisk person.",
    );
  }
  if (wantsSelfSign(state)) {
    stops.push(
      "Du får inte skriva under ditt eget intyg, även om du är VD. Be en extern revisor eller annan oberoende person med insyn.",
    );
  }
  return stops;
}

export function whyText(state: WizardState): string {
  return state.writeMyself ? state.whyRaw.trim() : state.whyGenerated.trim() || state.whyRaw.trim();
}

export function getPackStatus(state: WizardState): PackStatus {
  if (isSoleTrader(state)) return "incomplete";
  if (state.reason === "employment" && !whyText(state)) return "incomplete";
  if (state.reason && !state.studentFirstName) return "incomplete";
  if (state.reason === "employment" && !state.employerName) return "incomplete";
  if (state.reason === "employment" && !state.whyApproved && !state.writeMyself) return "incomplete";
  if (getStops(state).length > 0) return "incomplete";
  if (getRisks(state).length > 0) return "complete_risk";
  if (state.reason && state.studentFirstName && whyText(state).length >= 400) return "complete";
  return "incomplete";
}

export function statusLabel(status: PackStatus): string {
  if (status === "complete") return "Komplett";
  if (status === "complete_risk") return "Komplett med risk";
  return "Ofullständigt";
}
