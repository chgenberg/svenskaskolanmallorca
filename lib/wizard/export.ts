import { attachmentGaps, attachmentSummary, getAttachments } from "./attachments";
import { AUDITOR_CORE_PARAGRAPH, SKOLVERKET_FORMS } from "./defaults";
import { getPackStatus, getRisks, getStops, statusLabel, whyText } from "./gates";
import type { WizardState } from "./types";

function line(label: string, value: string) {
  return `${label.padEnd(28)} ${value || "—"}`;
}

export function guardianName(state: WizardState, which: 1 | 2) {
  const g = which === 1 ? state.guardian1 : state.guardian2;
  return `${g.firstName} ${g.lastName}`.trim();
}

export function citizenshipLabel(value: WizardState["guardian1"]["citizenship"]) {
  if (value === "swedish") return "Svenskt";
  if (value === "swedish_plus") return "Svenskt + annat";
  if (value === "not_swedish") return "Inte svenskt";
  return "";
}

export function reasonLabel(state: WizardState) {
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

export function categoryLabel(category: WizardState["category"]) {
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
  }

  if (state.reason === "studies") {
    items.push(
      { done: Boolean(state.institutionName), text: "Namn på universitet, skola eller forskningscentrum" },
      { done: state.funding !== "" && state.funding !== "none", text: "Finansiering är angiven (CSN, stipendium eller lön)" },
      { done: whyText(state).length >= 280, text: "Beskrivning av varför studierna måste ske utomlands" },
    );
  }

  if (state.reason === "culture") {
    items.push({ done: state.cultureLivelihood === "main", text: "Kulturarbetet är den huvudsakliga försörjningen" });
  }

  if (state.reason === "society") {
    items.push({ done: Boolean(state.societyWhySweden), text: "Beskrivning av samhällsintresse på Sverige-nivå" });
  }

  if (state.reason === "exceptional") {
    items.push({
      done: state.exceptionalDocs === "exists",
      text: "Intyg finns (lämnas i slutet kuvert — inte här)",
    });
  }

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
      line("Finansiering", fundingLabel(state.funding)),
    );
  }

  if (state.reason === "culture") {
    rows.push(
      "",
      line("Kulturarbete", state.cultureType),
      line("Var och varför", state.cultureWhere),
      line("Uppdragsgivare", state.cultureClients),
      line("Försörjning", state.cultureLivelihood === "main" ? "Huvudsaklig" : state.cultureLivelihood),
    );
  }

  if (state.reason === "society") {
    rows.push(
      "",
      line("Verksamhet", state.societyWhat),
      line("Sverige-intresse", state.societyWhySweden),
      line("Kan styrkas av", state.societyVerifier),
    );
  }

  if (state.reason === "exceptional") {
    rows.push(
      "",
      line("Vem berörs", state.exceptionalWho === "student" ? "Eleven" : state.exceptionalWho === "guardian" ? "Vårdnadshavare" : state.exceptionalWho === "both" ? "Båda" : ""),
      line("Intyg", state.exceptionalDocs === "exists" ? "Finns, lämnas i slutet kuvert" : ""),
    );
  }

  return rows.join("\n");
}

export function fieldGuidePairs(state: WizardState): { label: string; value: string }[] {
  const pairs: { label: string; value: string }[] = [
    { label: "Blankett", value: reasonLabel(state) },
    { label: "Elevens namn", value: `${state.studentFirstName} ${state.studentLastName}`.trim() },
    { label: "Födelsedatum", value: state.studentDateOfBirth },
    { label: "Årskurs", value: state.year ? `Gymnasiet åk ${state.year}` : "" },
    { label: "Program", value: state.program === "ekonomi" ? "Ekonomiprogrammet" : state.program === "samhalle" ? "Samhällsvetenskapsprogrammet" : state.programOther },
    { label: "Vårdnadshavare 1", value: guardianName(state, 1) },
    { label: "Födelsedatum VH1", value: state.guardian1.dateOfBirth },
    { label: "Medborgarskap VH1", value: citizenshipLabel(state.guardian1.citizenship) },
  ];
  if (state.hasSecondGuardian) {
    pairs.push(
      { label: "Vårdnadshavare 2", value: guardianName(state, 2) },
      { label: "Födelsedatum VH2", value: state.guardian2.dateOfBirth },
      { label: "Medborgarskap VH2", value: citizenshipLabel(state.guardian2.citizenship) },
    );
  }
  pairs.push(
    { label: "Utlandsvistelse från", value: state.stayFrom },
    { label: "Till", value: state.stayType === "indefinite" ? "Tillsvidare" : state.stayTo },
    { label: "Plats", value: state.stayPlace },
  );
  if (state.reason === "employment") {
    pairs.push(
      { label: "Arbetstagaren", value: state.abroadGuardian === "2" ? guardianName(state, 2) : guardianName(state, 1) },
      { label: "Befattning", value: state.jobTitle },
      { label: "Arbetsgivaren", value: state.employerName },
      { label: "Organisationsnummer", value: state.employerOrgNr },
      { label: "Adress", value: `${state.employerAddress}, ${state.employerCountry}`.trim() },
      { label: "Kategori", value: categoryLabel(state.category) },
      { label: "Tjänstgöringen är", value: state.employmentType === "permanent" ? "Tillsvidare" : "Tidsbegränsad" },
      { label: "Period utland", value: `${state.workAbroadFrom} – ${state.workAbroadTo || "tillsvidare"}` },
      {
        label: "Underskrift del 2",
        value: state.canIndependentSign === "yes" ? `${state.signerName}, ${state.signerTitle}` : `Extern revisor: ${state.auditorName || "—"}`,
      },
    );
    if (state.category === "D") {
      pairs.push(
        { label: "Svenskt bolag", value: state.swedishControllerName },
        { label: "Org.nr svenskt bolag", value: state.swedishControllerOrgNr },
        { label: "Ägarandel", value: state.ownershipPercent ? `${state.ownershipPercent} %` : "" },
        { label: "Inflytande", value: state.influenceDescription },
      );
    }
  }
  if (state.reason === "studies") {
    pairs.push(
      { label: "Lärosäte", value: state.institutionName },
      { label: "Land", value: state.institutionCountry },
      { label: "Studier / forskning", value: state.studyDescription },
      { label: "Finansiering", value: fundingLabel(state.funding) },
    );
  }
  if (state.reason === "culture") {
    pairs.push(
      { label: "Kulturarbete", value: state.cultureType },
      { label: "Var och varför", value: state.cultureWhere },
      { label: "Uppdragsgivare", value: state.cultureClients },
      { label: "Försörjning", value: state.cultureLivelihood === "main" ? "Huvudsaklig" : state.cultureLivelihood },
    );
  }
  if (state.reason === "society") {
    pairs.push(
      { label: "Verksamhet", value: state.societyWhat },
      { label: "Sverige-intresse", value: state.societyWhySweden },
      { label: "Kan styrkas av", value: state.societyVerifier },
    );
  }
  if (state.reason === "exceptional") {
    pairs.push(
      {
        label: "Vem berörs",
        value:
          state.exceptionalWho === "student"
            ? "Eleven"
            : state.exceptionalWho === "guardian"
              ? "Vårdnadshavare"
              : state.exceptionalWho === "both"
                ? "Båda"
                : "",
      },
      { label: "Intyg", value: state.exceptionalDocs === "exists" ? "Finns, lämnas i slutet kuvert" : "" },
    );
  }
  return pairs.filter((row) => row.value);
}

function fundingLabel(funding: WizardState["funding"]) {
  if (funding === "csn") return "Studiemedel (CSN)";
  if (funding === "stipend") return "Stipendium";
  if (funding === "salary") return "Lön";
  return "";
}

export function formFillInstructions(state: WizardState): string {
  const form = reasonLabel(state) || "rätt blankett enligt anledningen";
  const url = officialFormUrl(state);
  const signer =
    state.canIndependentSign === "yes"
      ? `${state.signerName || "HR/chef"} (${state.signerTitle || "arbetsgivaren"})`
      : state.auditorName || "extern revisor";

  const lines = [
    `Så fyller du i blanketten`,
    ``,
    `1. Ladda ner ${form}:`,
    `   ${url}`,
    ``,
    `2. Del 1 fyller ni (vårdnadshavarna).`,
    `   Elev: ${`${state.studentFirstName} ${state.studentLastName}`.trim() || "[namn]"}, födelsedatum ${state.studentDateOfBirth || "[ÅÅÅÅ-MM-DD]"}.`,
    `   Vårdnadshavare 1: ${guardianName(state, 1) || "[namn]"}, födelsedatum ${state.guardian1.dateOfBirth || "[datum]"}, svensk medborgare: ${citizenshipLabel(state.guardian1.citizenship) || "[ja/nej]"}.`,
  ];

  if (state.hasSecondGuardian) {
    lines.push(
      `   Vårdnadshavare 2: ${guardianName(state, 2) || "[namn]"}, födelsedatum ${state.guardian2.dateOfBirth || "[datum]"}, svensk medborgare: ${citizenshipLabel(state.guardian2.citizenship) || "[ja/nej]"}.`,
      `   Båda skriver under del 1.`,
    );
  }

  if (state.reason === "employment") {
    lines.push(
      ``,
      `3. Del 2 fyller ${signer}. Ni får inte skriva under själva.`,
      `   Kryssa ${categoryLabel(state.category) || "rätt ruta A–F"}.`,
      `   Arbetsgivare: ${state.employerName || "[namn]"}`,
      `   Organisationsnummer: ${state.employerOrgNr || "[org.nr]"}`,
      `   Tjänstgöring: ${state.employmentType === "permanent" ? "tillsvidare" : state.employmentType === "temporary" ? "tidsbegränsad" : "[tillsvidare/tidsbegränsad]"}`,
      `   Period i utlandet: ${state.workAbroadFrom || "[från]"} – ${state.workAbroadTo || "tillsvidare"}`,
      ``,
      `4. I fältet “Ange varför vårdnadshavaren måste arbeta utomlands” klistrar ni in blanketttexten från Underlaget.`,
      ``,
      `5. Skriv ut eller spara som PDF. Få del 2 underskriven. Lämna till Svenska Skolan Mallorca i början av höstterminen.`,
    );
  } else if (state.reason === "studies") {
    lines.push(
      ``,
      `3. Fyll i lärosäte: ${state.institutionName || "[universitet]"}.`,
      `   Beskriv studierna och att de sker på plats.`,
      `   Bifoga CSN-intyg, stipendieintyg eller lönespecifikation.`,
      ``,
      `4. Klistra in blanketttexten i fältet om varför vistelsen krävs.`,
      ``,
      `5. Lämna till Svenska Skolan Mallorca.`,
    );
  } else {
    lines.push(
      ``,
      `3. Fyll i verksamhetsdelen med era svar. Klistra in blanketttexten.`,
      `4. Bifoga de intyg blanketten kräver. Lämna till skolan.`,
    );
  }

  return lines.join("\n");
}

export function employerEmail(state: WizardState): string {
  if (state.reason === "studies") {
    return [
      `Ämne: Underlag till Skolverket — studier och forskning, ${state.studentFirstName} ${state.studentLastName}`.trim(),
      ``,
      `Hej,`,
      ``,
      `Vi tar fram underlag till Svenska Skolan Mallorca / Hermods för statsbidrag. Vårdnadshavaren studerar på plats och vi behöver bifoga intyg om studiemedel, stipendium eller lön.`,
      ``,
      `Lärosäte: ${state.institutionName || "[lärosäte]"}`,
      `Period: ${state.fundingPeriod || state.stayFrom || "[period]"}`,
      ``,
      `Kan ni skicka ett intyg som visar finansieringen?`,
      ``,
      `Tack,`,
      `${guardianName(state, 1) || ""}`.trim(),
    ].join("\n");
  }

  const to =
    state.canIndependentSign === "yes"
      ? state.signerName || "HR / arbetsgivare"
      : state.auditorName || "revisor";
  const worker = state.abroadGuardian === "2" ? guardianName(state, 2) : guardianName(state, 1);

  return [
    `Ämne: Underskrift av Intyg om tjänstgöring — ${`${state.studentFirstName} ${state.studentLastName}`.trim()}`,
    ``,
    `Hej ${to},`,
    ``,
    `Jag behöver din hjälp med Skolverkets Intyg om tjänstgöring för vårt barn som går gymnasiet vid Svenska Skolan Mallorca (Hermods Distansgymnasium).`,
    ``,
    `Skolan och Hermods skickar underlaget. Vi söker inte själva. Jag ber dig fylla i och skriva under del 2 — inte skriva ett fritt brev i stället.`,
    ``,
    `Uppgifter att stämma av:`,
    `• Arbetstagare: ${worker || "[namn]"}, ${state.jobTitle || "[befattning]"}`,
    `• Arbetsgivare: ${state.employerName || "[bolag]"}`,
    `• Organisationsnummer: ${state.employerOrgNr || "[org.nr]"}`,
    `• Kategori: ${categoryLabel(state.category) || "[A–F]"}`,
    `• Period i utlandet: ${state.workAbroadFrom || "[från]"} – ${state.workAbroadTo || "tillsvidare"}`,
    ``,
    `I fältet “Ange varför vårdnadshavaren måste arbeta utomlands” kan du använda texten vi tagit fram (bifogas).`,
    ``,
    AUDITOR_CORE_PARAGRAPH,
    ``,
    `Kan du skicka tillbaka en underskriven PDF?`,
    ``,
    `Tack,`,
    `${guardianName(state, 1) || ""}`.trim(),
  ].join("\n");
}

export function letterText(state: WizardState): string {
  const generated = state.letterGenerated.trim();
  if (generated) {
    if (generated.includes("Vårdnadshavaren får inte underteckna")) return generated;
    return `${generated}\n\n${AUDITOR_CORE_PARAGRAPH}`;
  }
  return employerEmail(state);
}

export function fillSteps(state: WizardState): { title: string; body: string }[] {
  const signer =
    state.canIndependentSign === "yes"
      ? `${state.signerName || "HR/chef"} (${state.signerTitle || "arbetsgivaren"})`
      : state.auditorName || "extern revisor";

  const family = [
    `Elev: ${`${state.studentFirstName} ${state.studentLastName}`.trim() || "[namn]"}, födelsedatum ${state.studentDateOfBirth || "[ÅÅÅÅ-MM-DD]"}.`,
    `Vårdnadshavare 1: ${guardianName(state, 1) || "[namn]"}, födelsedatum ${state.guardian1.dateOfBirth || "[datum]"}, medborgarskap ${citizenshipLabel(state.guardian1.citizenship) || "[svenskt/annat]"}.`,
  ];
  if (state.hasSecondGuardian) {
    family.push(
      `Vårdnadshavare 2: ${guardianName(state, 2) || "[namn]"}, födelsedatum ${state.guardian2.dateOfBirth || "[datum]"}, medborgarskap ${citizenshipLabel(state.guardian2.citizenship) || "[svenskt/annat]"}. Båda skriver under del 1.`,
    );
  }

  const steps: { title: string; body: string }[] = [
    {
      title: "Ladda ner Skolverkets blankett",
      body: `Öppna ${reasonLabel(state) || "rätt blankett"} via knappen. Fyll inte i en egen mall — det är Skolverkets PDF som gäller.`,
    },
    {
      title: "Fyll i del 1 (ni som vårdnadshavare)",
      body: family.join(" "),
    },
  ];

  if (state.reason === "employment") {
    steps.push(
      {
        title: `Del 2 fylls i av ${signer}`,
        body: `Ni får inte skriva under själva. Kryssa ${categoryLabel(state.category) || "rätt ruta A–F"}. Arbetsgivare: ${state.employerName || "[namn]"}. Org.nr: ${state.employerOrgNr || "[org.nr]"}. Tjänstgöring: ${state.employmentType === "permanent" ? "tillsvidare" : state.employmentType === "temporary" ? "tidsbegränsad" : "[typ]"}. Period: ${state.workAbroadFrom || "[från]"} – ${state.workAbroadTo || "tillsvidare"}.`,
      },
      {
        title: "Klistra in blanketttexten",
        body: "I fältet “Ange varför vårdnadshavaren måste arbeta utomlands” klistrar ni in texten från avsnittet Blanketttext i det här dokumentet.",
      },
      {
        title: "Lämna till skolan",
        body: "Skriv ut eller spara som PDF. Få del 2 underskriven. Lämna till Svenska Skolan Mallorca i början av höstterminen. Skolan och Hermods skickar samlat — ni söker inte själva.",
      },
    );
  } else if (state.reason === "studies") {
    steps.push(
      {
        title: "Fyll i studierna",
        body: `Lärosäte: ${state.institutionName || "[universitet]"}. Beskriv att studierna sker på plats. Bifoga CSN-intyg, stipendieintyg eller lönespecifikation.`,
      },
      {
        title: "Klistra in blanketttexten",
        body: "Klistra in texten från avsnittet Blanketttext i fältet om varför vistelsen krävs.",
      },
      {
        title: "Lämna till skolan",
        body: "Lämna till Svenska Skolan Mallorca. Skolan och Hermods skickar samlat — ni söker inte själva.",
      },
    );
  } else {
    steps.push(
      {
        title: "Fyll i verksamhetsdelen",
        body: "Använd era svar i Underlaget. Klistra in blanketttexten i rätt fält.",
      },
      {
        title: "Lämna till skolan",
        body: "Bifoga de intyg blanketten kräver. Lämna till Svenska Skolan Mallorca.",
      },
    );
  }

  return steps;
}

export function employerMailto(state: WizardState): string {
  const email = employerEmail(state);
  const lines = email.split("\n");
  const subject = lines[0]?.replace(/^Ämne:\s*/u, "") ?? "";
  const body = lines.slice(2).join("\n");
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
  const stops = getStops(state);
  const checklist = getChecklist(state)
    .map((item) => `- [${item.done ? "x" : " "}] ${item.text}`)
    .join("\n");
  const attachments = getAttachments(state)
    .map((item) => `- [${item.checked ? "x" : " "}] ${item.label}`)
    .join("\n");
  const gaps = attachmentGaps(state);
  const summary = attachmentSummary(state);

  return [
    "UNDERLAGET — Svenska Skolan Mallorca, gymnasiet",
    `Status: ${status}`,
    stops.length ? `Stopp:\n${stops.map((stop) => `- ${stop}`).join("\n")}` : "",
    risks.length ? `Risker:\n${risks.map((risk) => `- ${risk}`).join("\n")}` : "",
    summary.total
      ? `Bilagor till skolan: ${summary.done} av ${summary.total} klara.${gaps.length ? `\nLuckor:\n${gaps.map((item) => `- ${item.label}`).join("\n")}` : ""}`
      : "",
    "",
    formFillInstructions(state),
    "",
    fieldGuide(state),
    "",
    "BLANKETTTEXT — varför utomlands",
    whyText(state) || "—",
    "",
    "MEJL TILL ARBETSGIVARE / UNDERTECKNARE",
    employerEmail(state),
    "",
    "CHECKLISTA — ifyllt i Underlaget",
    checklist,
    "",
    attachments ? "LÄMNAS TILL SKOLAN\n" + attachments : "",
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
