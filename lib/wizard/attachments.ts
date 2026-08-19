import { trackOf } from "@/lib/tracks/config";
import { getStops, mustUseExternalAuditor } from "./gates";
import type { WizardState } from "./types";

export type AttachmentId =
  | "part1_signed"
  | "part2_signed"
  | "employment_contract"
  | "csn_or_funding"
  | "auditor_letter_sent"
  | "culture_proof"
  | "society_statement"
  | "exceptional_sealed"
  | "handed_to_school";

export type Attachment = {
  id: AttachmentId;
  label: string;
  hint: string;
  checked: boolean;
};

function isChecked(state: WizardState, id: AttachmentId) {
  return Boolean(state.attachmentChecks?.[id]);
}

export function getAttachments(state: WizardState): Attachment[] {
  if (getStops(state).length > 0) return [];

  const items: Attachment[] = [];

  if (state.hasSecondGuardian) {
    items.push({
      id: "part1_signed",
      label: "Båda vårdnadshavarna har skrivit under del 1",
      hint: "En underskrift räcker inte när det finns två vårdnadshavare.",
      checked: isChecked(state, "part1_signed"),
    });
  } else {
    items.push({
      id: "part1_signed",
      label: "Vårdnadshavaren har skrivit under del 1",
      hint: "Skriv under Skolverkets blankett, inte bara Underlaget.",
      checked: isChecked(state, "part1_signed"),
    });
  }

  if (state.reason === "employment") {
    items.push({
      id: "part2_signed",
      label: "Del 2 är underskriven av arbetsgivare, HR eller extern revisor",
      hint: "Inte av er. Lämna den underskrivna sidan till skolan.",
      checked: isChecked(state, "part2_signed"),
    });
    if (state.category === "F" || state.employmentType === "temporary") {
      items.push({
        id: "employment_contract",
        label: "Anställningsavtal med start- och slutdatum lämnas till skolan",
        hint: "Krävs vid tidsbegränsad tjänst och alltid i kategori F. Ladda inte upp här.",
        checked: isChecked(state, "employment_contract"),
      });
    }
    if (mustUseExternalAuditor(state) || state.canIndependentSign !== "yes") {
      items.push({
        id: "auditor_letter_sent",
        label: "Brevet till revisorn eller undertecknaren är skickat",
        hint: "Utkastet finns i paketet. Kryssa när mejlet är skickat.",
        checked: isChecked(state, "auditor_letter_sent"),
      });
    }
  }

  if (state.reason === "studies") {
    items.push({
      id: "csn_or_funding",
      label:
        state.funding === "stipend"
          ? "Stipendieintyg lämnas till skolan"
          : state.funding === "salary"
            ? "Lönespecifikation lämnas till skolan"
            : "CSN-intyg lämnas till skolan",
      hint: "Ladda inte upp här. Ta med papperskopian eller PDF:en till expeditionen.",
      checked: isChecked(state, "csn_or_funding"),
    });
  }

  if (state.reason === "culture") {
    items.push({
      id: "culture_proof",
      label: "Underlag som visar att kulturarbetet är den huvudsakliga försörjningen",
      hint: "Bokslut, kontrakt eller cachet. Lämnas till skolan.",
      checked: isChecked(state, "culture_proof"),
    });
  }

  if (state.reason === "society") {
    items.push({
      id: "society_statement",
      label: "Intyg från svensk aktör som kan styrka samhällsintresset",
      hint: "Myndighet, förbund eller uppdragsgivare. Inte familjen själv.",
      checked: isChecked(state, "society_statement"),
    });
  }

  if (state.reason === "exceptional") {
    items.push({
      id: "exceptional_sealed",
      label: "Intyg lämnas i slutet kuvert till skolan",
      hint: "Läkare, socialtjänst eller liknande. Inga journaler i appen.",
      checked: isChecked(state, "exceptional_sealed"),
    });
  }

  items.push({
    id: "handed_to_school",
    label: "Paketet är lämnat till Svenska Skolan Mallorca",
    hint: trackOf(state).hermods
      ? "Skolan samordnar med Hermods. Ni skickar inte själva till Skolverket."
      : "Skolan skickar underlaget. Ni skickar inte själva till Skolverket.",
    checked: isChecked(state, "handed_to_school"),
  });

  return items;
}

export function attachmentGaps(state: WizardState): Attachment[] {
  return getAttachments(state).filter((item) => !item.checked);
}

export function attachmentSummary(state: WizardState): { done: number; total: number } {
  const items = getAttachments(state);
  return { done: items.filter((item) => item.checked).length, total: items.length };
}
