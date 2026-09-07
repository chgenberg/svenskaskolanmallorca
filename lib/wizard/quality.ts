import { CENSUS_ISO } from "./gates";
import type { WizardState } from "./types";

const LIFESTYLE =
  /\b(klimat|solen|soliga|livskvalitet|livsstil|skatt|skatten|valde att flytta|weekend|pension|digital nomad|bättre skola|semester|jobbar på distans från)\b/i;

const FEELING = /\b(jag känner|vi drömde|vi ville|för att det är skönt|för barnens skull)\b/i;

const AI_TELL =
  /\b(således|därmed|i enlighet med|i syfte att|säkerställa|beaktat|föreligger|innehar|nyckelroll|värdeskapande|strategisk närvaro|det är av vikt|det är viktigt att framhålla|härmed|vidare kan nämnas)\b/i;

export type QualityIssue = {
  code: string;
  message: string;
};

export function checkWhyQuality(text: string, state: WizardState): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const trimmed = text.trim();

  if (trimmed.length < 280) {
    issues.push({
      code: "short",
      message: "Skriv vad arbetet består i och varför just de uppgifterna kräver närvaro utomlands. Några korta stycken räcker.",
    });
  }
  if (trimmed.length > 1200) {
    issues.push({
      code: "long",
      message: "Texten är för lång för blankettfältet. Korta ner. Skolverket läser orsak, inte essä.",
    });
  }
  if (!/(arbete|tjänst|uppdrag|forskning|studier|kultur|verksamhet)/i.test(trimmed)) {
    issues.push({ code: "work", message: "Det saknas en konkret beskrivning av arbetet, studierna eller verksamheten." });
  }
  if (!/(plats|på plats|utomlands|Spanien|Mallorca|Palma|här|värdlandet|lärosäte)/i.test(trimmed)) {
    issues.push({ code: "place", message: "Det saknas varför just denna plats krävs." });
  }
  if (LIFESTYLE.test(trimmed)) {
    issues.push({ code: "lifestyle", message: "Ta bort livsstilsskäl som klimat, skatt eller att ni valde Mallorca." });
  }
  if (FEELING.test(trimmed)) {
    issues.push({ code: "feeling", message: "Blankettfältet ska låta som arbetsgivaren, inte som en personlig essä." });
  }
  if (AI_TELL.test(trimmed)) {
    issues.push({
      code: "ai",
      message: "Ta bort byråkratfraser som således, i enlighet med eller nyckelroll. Skriv som en människa.",
    });
  }
  if (/\b(jobbar hemifrån|remote|distansarbete från|kan utföras varifrån som helst)\b/i.test(trimmed)) {
    issues.push({
      code: "remote",
      message: "Om arbetet kan göras varifrån som helst förklarar det inte varför personen måste vara utomlands. Beskriv vad som kräver platsen.",
    });
  }
  if (/på grund av arbetet\b/i.test(trimmed) && trimmed.length < 500) {
    issues.push({ code: "vague", message: "Frasen “på grund av arbetet” räcker inte. Beskriv vilket arbete och varför det kräver närvaro." });
  }

  const invented = findInventedTerms(trimmed, state);
  if (invented.length > 0) {
    issues.push({
      code: "invented",
      message: `Kontrollera att inget är påhittat. Okända namn i texten: ${invented.slice(0, 4).join(", ")}.`,
    });
  }

  const years = trimmed.match(/\b(19|20)\d{2}\b/g) ?? [];
  const knownYears = [state.stayFrom, state.stayTo, state.workAbroadFrom, state.workAbroadTo, state.studentDateOfBirth, CENSUS_ISO]
    .filter(Boolean)
    .map((value) => value.slice(0, 4));
  const extraYears = years.filter((year) => !knownYears.includes(year));
  if (extraYears.length > 0) {
    issues.push({
      code: "year",
      message: `Kontrollera årtal som inte finns i era svar: ${[...new Set(extraYears)].join(", ")}.`,
    });
  }

  return issues;
}

function findInventedTerms(text: string, state: WizardState): string[] {
  const known = [
    state.employerName,
    state.institutionName,
    state.guardian1.firstName,
    state.guardian1.lastName,
    state.guardian2.firstName,
    state.guardian2.lastName,
    state.studentFirstName,
    state.studentLastName,
    state.jobTitle,
    state.stayPlace,
    state.swedishControllerName,
    state.cultureType,
    state.societyWhat,
  ]
    .filter(Boolean)
    .map((value) => value.toLowerCase());

  const orgMatch = text.match(/\b\d{6}-\d{4}\b/g) ?? [];
  const unknownOrg = orgMatch.filter((nr) => !state.employerOrgNr.includes(nr) && !state.swedishControllerOrgNr.includes(nr));

  const allow = new Set([
    "skolverket",
    "sverige",
    "svensk",
    "svenska",
    "spanien",
    "mallorca",
    "palma",
    "hermods",
    "vårdnadshavaren",
    "eleven",
    "arbetsgivaren",
    "bolaget",
    "aktiebolaget",
    "aktiebolag",
    "universitet",
    "forskning",
    "studierna",
    "tjänstgöringen",
    "verksamheten",
  ]);

  const proper = text.match(/\b[A-ZÅÄÖ][\p{L}]+(?:\s+[A-ZÅÄÖ][\p{L}]+)+\b/gu) ?? [];
  const unknownNames = proper.filter((phrase) => {
    const lower = phrase.toLowerCase();
    if ([...allow].some((word) => lower.includes(word))) return false;
    return !known.some((item) => item && (lower.includes(item) || item.includes(lower)));
  });

  return [...unknownOrg, ...unknownNames];
}
