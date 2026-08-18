import type { StepDef, WizardState } from "./types";

const STEM: StepDef[] = [
  { id: "intro", title: "Så funkar det", short: "Intro" },
  { id: "student", title: "Eleven", short: "Eleven" },
  { id: "guardians", title: "Vårdnadshavare", short: "Vårdnadshavare" },
  { id: "stay", title: "Vistelsen", short: "Vistelsen" },
  { id: "reason", title: "Anledningen", short: "Anledning" },
];

const TAIL: StepDef[] = [
  { id: "checklist", title: "Er checklista", short: "Checklista" },
  { id: "pack", title: "Ert underlag", short: "Paketet" },
];

export function getSteps(state: WizardState): StepDef[] {
  const branch: StepDef[] = [];

  switch (state.reason) {
    case "employment":
      branch.push(
        { id: "employer-form", title: "Bolagsform", short: "Bolag" },
        { id: "category", title: "Typ av tjänstgöring", short: "A–F" },
        { id: "employer", title: "Arbetsgivaren", short: "Arbetsgivare" },
        { id: "job", title: "Tjänsten", short: "Tjänsten" },
        { id: "why", title: "Varför utomlands", short: "Varför" },
        { id: "signer", title: "Underskrift", short: "Underskrift" },
        { id: "letter", title: "Brev", short: "Brev" },
      );
      if (state.category === "C" || state.category === "D" || state.category === "E" || state.category === "F") {
        branch.push({ id: "swedish", title: "Svenskan", short: "Svenska" });
      }
      break;
    case "studies":
      branch.push(
        { id: "studies", title: "Studierna", short: "Studier" },
        { id: "funding", title: "Finansiering", short: "Finansiering" },
        { id: "why", title: "Varför utomlands", short: "Varför" },
      );
      break;
    case "culture":
      branch.push(
        { id: "culture-work", title: "Kulturarbetet", short: "Kultur" },
        { id: "culture-livelihood", title: "Försörjningen", short: "Försörjning" },
        { id: "why", title: "Varför utomlands", short: "Varför" },
      );
      break;
    case "society":
      branch.push(
        { id: "society-work", title: "Verksamheten", short: "Verksamhet" },
        { id: "why", title: "Varför utomlands", short: "Varför" },
      );
      break;
    case "exceptional":
      branch.push(
        { id: "exceptional-reasons", title: "Skälen", short: "Skäl" },
        { id: "exceptional-docs", title: "Underlag", short: "Underlag" },
        { id: "why", title: "Kort redogörelse", short: "Redogörelse" },
      );
      break;
    default:
      break;
  }

  return [...STEM, ...branch, ...TAIL];
}

export function stepIndex(state: WizardState): number {
  const steps = getSteps(state);
  const index = steps.findIndex((step) => step.id === state.currentStepId);
  return index === -1 ? 0 : index;
}

export function suggestedCategory(form: WizardState["employerForm"]): WizardState["category"] {
  switch (form) {
    case "swedish_authority":
      return "A";
    case "international_org":
      return "B";
    case "swedish_ab":
    case "swedish_hb":
    case "swedish_association":
      return "C";
    default:
      return "";
  }
}
