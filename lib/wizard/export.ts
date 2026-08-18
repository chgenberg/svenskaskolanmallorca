import { AUDITOR_CORE_PARAGRAPH, SKOLVERKET_FORMS } from "./defaults";
import { getPackStatus, getRisks, statusLabel, whyText } from "./gates";
import type { WizardState } from "./types";

function line(label: string, value: string) {
  return `${label.padEnd(28)} ${value || "—"}`;
}

function guardianName(state: WizardState, which: 1 | 2) {
  const g = which === 1 ? state.guardian1 : state.guardian2;
  return `${g.firstName} ${g.lastName}`.trim();
}

function citizenshipLabel(value: WizardState["guardian1"]["citizenship"]) {
  if (value === "swedish") return "Svenskt";
  if (value === "swedish_plus") return "Svenskt + annat";
  if (value === "not_swedish") return "Inte svenskt";
  return "";
}

function reasonLabel(state: WizardState) {
  switch (state.reason) {
    case "employment":
      return "Tjänstgöring — Intyg om tjänstgöring";
    case "studies":
      return "Studier eller forskning";
    case "culture":
      return "Kulturarbete";
    case "society":
      return "Väsentligt för det svenska samhället";
    case "exceptional":
      return "Synnerliga skäl";
    default:
      return "";
  }
}

function categoryLabel(category: WizardState["category"]) {
  const map = {
    A: "A — svensk myndighet eller organisation",
    B: "B — internationell organisation",
    C: "C — svensk juridisk person",
    D: "D — utländskt bolag med svenskt bestämmande inflytande",
    E: "E — tillfällig tjänst vid utländskt bolag med verksamhet i Sverige",
    F: "F — i förväg tidsbegränsad tjänst vid utländsk juridisk person",
  };
  return category ? map[category] : "";
}

export function getChecklist(state: WizardState): { done: boolean; text: string }[] {
  const items: { done: boolean; text: string }[] = [
    { done: Boolean(state.studentFirstName && state.studentDateOfBirth), text: "Del 1 — elevens namn och födelsedatum" },
    {
      done: Boolean(state.guardian1.firstName && state.guardian1.citizenship),
      text: "Del 1 — vårdnadshavare ifyllda och minst en svensk medborgare",
    },
  ];

  if (state.reason === "employment") {
    items.push(
      { done: Boolean(state.employerName && state.employerOrgNr), text: "Del 2 — arbetsgivare och organisationsnummer" },
      { done: Boolean(state.category), text: `Kategori ${state.category || "A–F"} ikryssad` },
      { done: whyText(state).length >= 280, text: "Fältet “Ange varför vårdnadshavaren måste arbeta utomlands” är ifyllt" },
      {
        done: state.canIndependentSign !== "self" && Boolean(state.signerName || state.auditorName),
        text: "Del 2 underskrivs av arbetsgivare, HR eller extern revisor — inte av er",
      },
    );
    if (state.category === "F" || state.employmentType === "temporary") {
      items.push({ done: false, text: "Bifoga anställningsavtal till skolan (ladda inte upp här)" });
    }
    if (state.canIndependentSign !== "yes") {
      items.push({ done: Boolean(state.letterGenerated), text: "Brevet till revisorn är skickat" });
    }
  }

  if (state.reason === "studies") {
    items.push(
      { done: Boolean(state.institutionName), text: "Namn på universitet, skola eller forskningscentrum" },
      { done: state.funding !== "" && state.funding !== "none", text: "Intyg om CSN, stipendium eller lön bifogas till skolan" },
      { done: whyText(state).length >= 280, text: "Beskrivning av varför studierna måste ske utomlands" },
    );
  }

  if (state.reason === "culture") {
    items.push(
      { done: state.cultureLivelihood === "main", text: "Kulturarbetet är den huvudsakliga försörjningen" },
      { done: false, text: "Underlag som visar försörjningen lämnas till skolan" },
    );
  }

  if (state.reason === "society") {
    items.push({ done: Boolean(state.societyWhySweden), text: "Beskrivning av samhällsintresse på Sverige-nivå" });
  }

  if (state.reason === "exceptional") {
    items.push({
      done: state.exceptionalDocs === "exists",
      text: "Intyg (läkare, socialtjänst eller liknande) lämnas i slutet kuvert till skolan",
    });
  }

  items.push({
    done: false,
    text: "Lämnas till Svenska Skolan Mallorca. Skolan samordnar med Hermods.",
  });

  return items;
}

export function fieldGuide(state: WizardState): string {
  const rows = [
    "FÄLTGUIDE — fyll i Skolverkets PDF med dessa uppgifter",
    "",
    line("Blankett", reasonLabel(state)),
    line("Elevens namn", `${state.studentFirstName} ${state.studentLastName}`.trim()),
    line("Födelsedatum", state.studentDateOfBirth),
    line("Årskurs", state.year ? `Gymnasiet åk ${state.year}` : ""),
    line("Program", state.program === "annat" ? state.programOther : state.program),
    "",
    line("Vårdnadshavare 1", guardianName(state, 1)),
    line("Födelsedatum VH1", state.guardian1.dateOfBirth),
    line("Svensk medborgare VH1", citizenshipLabel(state.guardian1.citizenship)),
  ];

  if (state.hasSecondGuardian) {
    rows.push(
      line("Vårdnadshavare 2", guardianName(state, 2)),
      line("Födelsedatum VH2", state.guardian2.dateOfBirth),
      line("Svensk medborgare VH2", citizenshipLabel(state.guardian2.citizenship)),
    );
  }

  rows.push("", line("Utlandsvistelse från", state.stayFrom), line("Till", state.stayType === "indefinite" ? "Tillsvidare" : state.stayTo), line("Plats", state.stayPlace));

  if (state.reason === "employment") {
    rows.push(
      "",
      "DEL 2 — arbetsgivare / revisor",
      line("Arbetstagaren", state.abroadGuardian === "2" ? guardianName(state, 2) : guardianName(state, 1)),
      line("Befattning", state.jobTitle),
      line("Arbetsgivaren", state.employerName),
      line("Organisationsnummer", state.employerOrgNr),
      line("Adress", `${state.employerAddress}, ${state.employerCountry}`.trim()),
      line("Kategori", categoryLabel(state.category)),
      line("Tjänstgöringen är", state.employmentType === "permanent" ? "Tillsvidare" : "Tidsbegränsad"),
      line("Period utland", `${state.workAbroadFrom} – ${state.workAbroadTo || ""}`.trim()),
      line("Underskrift", state.canIndependentSign === "yes" ? `${state.signerName}, ${state.signerTitle}` : `Extern revisor: ${state.auditorName || "—"}`),
    );
    if (state.category === "D") {
      rows.push(
        line("Svenskt bolag", state.swedishControllerName),
        line("Org.nr svenskt bolag", state.swedishControllerOrgNr),
        line("Ägarandel", state.ownershipPercent ? `${state.ownershipPercent} %` : ""),
        line("Inflytande", state.influenceDescription),
      );
    }
  }

  if (state.reason === "studies") {
    rows.push(
      "",
      line("Lärosäte", state.institutionName),
      line("Land", state.institutionCountry),
      line("Studier / forskning", state.studyDescription),
      line("Finansiering", state.funding),
    );
  }

  return rows.join("\n");
}

export function letterText(state: WizardState): string {
  const generated = state.letterGenerated.trim();
  if (!generated) return "";
  if (generated.includes("Vårdnadshavaren får inte underteckna")) return generated;
  return `${generated}\n\n${AUDITOR_CORE_PARAGRAPH}`;
}

export function officialFormUrl(state: WizardState): string {
  if (state.reason === "studies") return SKOLVERKET_FORMS.studies;
  if (state.reason === "culture") return SKOLVERKET_FORMS.culture;
  if (state.reason === "society") return SKOLVERKET_FORMS.society;
  if (state.reason === "exceptional") return SKOLVERKET_FORMS.exceptional;
  return SKOLVERKET_FORMS.employment;
}

export function exportBundle(state: WizardState): string {
  const status = statusLabel(getPackStatus(state));
  const risks = getRisks(state);
  const checklist = getChecklist(state)
    .map((item) => `- [${item.done ? "x" : " "}] ${item.text}`)
    .join("\n");

  return [
    "UNDERLAGET — Svenska Skolan Mallorca, gymnasiet",
    `Status: ${status}`,
    risks.length ? `Risker:\n${risks.map((risk) => `- ${risk}`).join("\n")}` : "",
    "",
    fieldGuide(state),
    "",
    "BLANKETTTEXT — varför utomlands",
    whyText(state) || "—",
    "",
    state.reason === "employment" ? "BREV TILL UNDERTECKNARE" : "",
    state.reason === "employment" ? letterText(state) || "—" : "",
    "",
    "CHECKLISTA",
    checklist,
    "",
    "Nästa steg:",
    "1. Ladda ner Skolverkets PDF via länken i guiden.",
    "2. Fyll i med fältguiden. Få del 2 underskriven.",
    "3. Lämna till Svenska Skolan Mallorca. Skolan och Hermods skickar samlat.",
    "",
    "Underlaget är ett stöd från Svenska Skolan Mallorca. Skolverket beslutar. Appen är inte Skolverket.",
  ]
    .filter((block) => block !== "")
    .join("\n");
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
