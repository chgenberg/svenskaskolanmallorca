"use client";

import { Alert, ChoiceCard, Field, TextArea, TextInput } from "@/components/ui";
import { isSoleTrader } from "@/lib/wizard/gates";
import { suggestedCategory } from "@/lib/wizard/steps";
import { useWizardStore } from "@/lib/wizard/store";
import type { Category } from "@/lib/wizard/types";
import { StepHeader } from "./Stem";

export function EmployerFormStep() {
  const state = useWizardStore();
  const patch = useWizardStore((s) => s.patch);
  const resetBranch = useWizardStore((s) => s.resetBranch);

  return (
    <>
      <StepHeader
        title="Vem är arbetsgivaren?"
        help="Arbetsgivaren måste vara en juridisk person. Enskild firma räknas inte."
      />
      <div className="space-y-6">
        <Field label="Arbetsgivarens form">
          <div className="grid gap-2">
            {(
              [
                ["swedish_authority", "Svensk myndighet eller svensk organisation"],
                ["international_org", "Internationell organisation (FN, EU, OECD …)"],
                ["swedish_ab", "Svenskt aktiebolag (AB)"],
                ["swedish_hb", "Svenskt handelsbolag eller kommanditbolag"],
                ["swedish_association", "Svensk förening eller stiftelse"],
                ["foreign_company", "Utländskt bolag"],
                ["sole_trader", "Enskild firma / jag fakturerar som privatperson"],
                ["unsure", "Osäker"],
              ] as const
            ).map(([value, title]) => (
              <ChoiceCard
                key={value}
                title={title}
                selected={state.employerForm === value}
                onSelect={() =>
                  patch({
                    employerForm: value,
                    category: suggestedCategory(value) || state.category,
                  })
                }
              />
            ))}
          </div>
        </Field>

        {state.employerForm === "unsure" ? (
          <Alert tone="info">
            Titta på organisationsnumret. AB har ofta 556… eller 559…. Enskild firma har ofta
            personnummer som organisationsnummer.
          </Alert>
        ) : null}

        {isSoleTrader(state) ? (
          <Alert tone="stop">
            Enskild firma är inte en juridisk person. Skolverket godkänner inte Intyg om tjänstgöring
            när arbetsgivaren är du själv som fysisk person. Du kan inte skriva under ditt eget
            intyg, och det finns ingen arbetsgivare som kan göra det.
            <div className="mt-3">
              <button type="button" className="underline" onClick={resetBranch}>
                Byt anledning
              </button>
            </div>
          </Alert>
        ) : (
          <Field label="Är den utlandsverksamma vårdnadshavaren ägare, VD eller ensam firmatecknare i bolaget?">
            <div className="grid gap-2">
              <ChoiceCard
                title="Ja"
                selected={state.isOwnerOrCeo === "yes"}
                onSelect={() => patch({ isOwnerOrCeo: "yes" })}
              />
              <ChoiceCard
                title="Nej"
                selected={state.isOwnerOrCeo === "no"}
                onSelect={() => patch({ isOwnerOrCeo: "no" })}
              />
              <ChoiceCard
                title="Delägare men inte ensam"
                selected={state.isOwnerOrCeo === "part_owner"}
                onSelect={() => patch({ isOwnerOrCeo: "part_owner" })}
              />
            </div>
          </Field>
        )}
      </div>
    </>
  );
}

const CATEGORIES: { id: Category; title: string; hint: string }[] = [
  { id: "A", title: "A — Svensk myndighet eller organisation", hint: "Stat, kommun eller svensk organisation." },
  { id: "B", title: "B — Internationell organisation", hint: "FN, EU, OECD och liknande." },
  { id: "C", title: "C — Svensk juridisk person", hint: "Vanligast för den som är anställd i ett svenskt AB." },
  { id: "D", title: "D — Utländskt bolag med svenskt bestämmande inflytande", hint: "I regel mer än 50 procent. Franchising räcker inte." },
  { id: "E", title: "E — Tillfällig tjänst vid utländskt bolag med verksamhet i Sverige", hint: "Bolaget måste vara aktivt i Sverige." },
  { id: "F", title: "F — I förväg tidsbegränsad tjänst vid utländsk juridisk person", hint: "Anställningsavtal med start och slut måste bifogas." },
];

export function CategoryStep() {
  const category = useWizardStore((s) => s.category);
  const employerForm = useWizardStore((s) => s.employerForm);
  const patch = useWizardStore((s) => s.patch);
  const suggested = suggestedCategory(employerForm);

  return (
    <>
      <StepHeader
        title="Vilken typ av tjänstgöring?"
        help="Det här är rutan A–F på intygets andra sida. Välj efter arbetsgivaren, inte efter hur det känns."
      />
      <div className="grid gap-2">
        {CATEGORIES.map((item) => (
          <ChoiceCard
            key={item.id}
            title={item.title}
            description={item.hint}
            selected={category === item.id}
            onSelect={() => patch({ category: item.id })}
          />
        ))}
      </div>
      {suggested === "C" ? (
        <p className="mt-5 text-[14px] leading-6 text-stone">
          C är vanligast för den som är anställd i ett svenskt AB och arbetar från Mallorca för att
          bolagets uppdrag kräver det.
        </p>
      ) : null}
      {category === "D" ? (
        <div className="mt-5">
          <Alert tone="warn">
            Bestämmande inflytande är i regel mer än 50 % av aktierna. Konsult eller franchise på
            uppdrag av ett svenskt bolag räcker inte.
          </Alert>
        </div>
      ) : null}
    </>
  );
}

export function EmployerStep() {
  const state = useWizardStore();
  const patch = useWizardStore((s) => s.patch);

  return (
    <>
      <StepHeader
        title="Uppgifter om arbetsgivaren"
        help="Skriv exakt som i Bolagsverket eller registreringsbevis. Fel organisationsnummer är en klassiker."
      />
      <div className="space-y-6">
        <Field label="Arbetsgivarens namn">
          <TextInput value={state.employerName} onChange={(e) => patch({ employerName: e.target.value })} />
        </Field>
        <Field
          label="Organisationsnummer"
          hint={state.category === "A" || state.category === "C" ? "Svenskt format NNNNNN-NNNN." : "NIF, CIF, VAT eller motsvarande."}
        >
          <TextInput value={state.employerOrgNr} onChange={(e) => patch({ employerOrgNr: e.target.value })} />
        </Field>
        <Field label="Adress">
          <TextInput value={state.employerAddress} onChange={(e) => patch({ employerAddress: e.target.value })} />
        </Field>
        <Field label="Land">
          <TextInput value={state.employerCountry} onChange={(e) => patch({ employerCountry: e.target.value })} />
        </Field>
        <Field label="Webbadress" hint="Valfritt.">
          <TextInput value={state.employerWebsite} onChange={(e) => patch({ employerWebsite: e.target.value })} />
        </Field>
        <Field label="Arbetstagarens befattning">
          <TextInput
            value={state.jobTitle}
            onChange={(e) => patch({ jobTitle: e.target.value })}
            placeholder="Marknadschef, civilingenjör, VD …"
          />
        </Field>
        {state.category === "D" ? (
          <>
            <Field label="Svensk juridisk person med bestämmande inflytande">
              <TextInput
                value={state.swedishControllerName}
                onChange={(e) => patch({ swedishControllerName: e.target.value })}
              />
            </Field>
            <Field label="Organisationsnummer, svenskt bolag">
              <TextInput
                value={state.swedishControllerOrgNr}
                onChange={(e) => patch({ swedishControllerOrgNr: e.target.value })}
              />
            </Field>
            <Field label="Ägarandel i procent">
              <TextInput
                value={state.ownershipPercent}
                onChange={(e) => patch({ ownershipPercent: e.target.value })}
                inputMode="numeric"
              />
            </Field>
            <Field label="Beskriv inflytandet">
              <TextArea
                value={state.influenceDescription}
                onChange={(e) => patch({ influenceDescription: e.target.value })}
              />
            </Field>
          </>
        ) : null}
      </div>
    </>
  );
}

export function JobStep() {
  const state = useWizardStore();
  const patch = useWizardStore((s) => s.patch);

  return (
    <>
      <StepHeader
        title="Tjänstgöringen"
        help="Skilj på anställningen hos arbetsgivaren och själva utlandsperioden."
      />
      <div className="space-y-6">
        <Field label="Anställningen hos arbetsgivaren är">
          <div className="grid gap-2">
            <ChoiceCard
              title="Tillsvidare"
              selected={state.employmentType === "permanent"}
              onSelect={() => patch({ employmentType: "permanent" })}
            />
            <ChoiceCard
              title="Tidsbegränsad"
              selected={state.employmentType === "temporary"}
              onSelect={() => patch({ employmentType: "temporary" })}
            />
          </div>
        </Field>
        {state.category === "F" && state.employmentType === "permanent" ? (
          <Alert tone="warn">F kräver start- och slutdatum i avtalet. Tillsvidare passar inte här.</Alert>
        ) : null}
        <Field label="Utlandsperiod från">
          <TextInput
            type="month"
            value={state.workAbroadFrom}
            onChange={(e) => patch({ workAbroadFrom: e.target.value })}
          />
        </Field>
        {state.employmentType === "temporary" || state.category === "F" ? (
          <Field label="Utlandsperiod till">
            <TextInput
              type="month"
              value={state.workAbroadTo}
              onChange={(e) => patch({ workAbroadTo: e.target.value })}
            />
          </Field>
        ) : null}
        <Field
          label="Korta arbetsuppgifter — tre konkreta punkter"
          hint="Inte “jobbar med försäljning”. Det här är råvara till blanketttexten."
        >
          <TextArea
            value={state.jobPoints}
            onChange={(e) => patch({ jobPoints: e.target.value })}
            placeholder={"1. Ansvarar för leverans av … till kunder i Spanien\n2. Behöver vara på plats hos …\n3. …"}
          />
        </Field>
      </div>
    </>
  );
}

export function SignerStep() {
  const state = useWizardStore();
  const patch = useWizardStore((s) => s.patch);

  return (
    <>
      <StepHeader
        title="Vem kan skriva under del 2?"
        help="Del 2 fylls i av arbetsgivaren. Du får inte skriva under ditt eget intyg. Lämplig person: VD, HR, extern revisor eller motsvarande."
      />
      <div className="space-y-6">
        <Field label="Kan en oberoende person hos arbetsgivaren skriva under?">
          <div className="grid gap-2">
            <ChoiceCard
              title="Ja — HR, annan VD, styrelseordförande eller chef"
              selected={state.canIndependentSign === "yes"}
              onSelect={() => patch({ canIndependentSign: "yes" })}
            />
            <ChoiceCard
              title="Nej — jag är ensam firmatecknare eller ägare"
              selected={state.canIndependentSign === "no"}
              onSelect={() => patch({ canIndependentSign: "no", signerType: "auditor" })}
            />
            <ChoiceCard
              title="Osäker"
              selected={state.canIndependentSign === "unsure"}
              onSelect={() => patch({ canIndependentSign: "unsure", signerType: "auditor" })}
            />
            <ChoiceCard
              title="Jag tänker skriva under själv"
              selected={state.canIndependentSign === "self"}
              onSelect={() => patch({ canIndependentSign: "self" })}
            />
          </div>
        </Field>

        {state.canIndependentSign === "self" ? (
          <Alert tone="stop">
            Det går inte. Skolverket tar inte emot intyg som vårdnadshavaren skrivit under själv,
            även om du är VD.
          </Alert>
        ) : null}

        {state.canIndependentSign === "yes" ? (
          <>
            <Field label="Namn på undertecknare">
              <TextInput value={state.signerName} onChange={(e) => patch({ signerName: e.target.value })} />
            </Field>
            <Field label="Titel">
              <TextInput value={state.signerTitle} onChange={(e) => patch({ signerTitle: e.target.value })} />
            </Field>
            <Field label="E-post">
              <TextInput
                type="email"
                value={state.signerEmail}
                onChange={(e) => patch({ signerEmail: e.target.value })}
              />
            </Field>
            <Field label="Telefon">
              <TextInput
                type="tel"
                value={state.signerPhone}
                onChange={(e) => patch({ signerPhone: e.target.value })}
              />
            </Field>
          </>
        ) : null}

        {state.canIndependentSign === "no" || state.canIndependentSign === "unsure" ? (
          <>
            <Alert tone="info">
              Då tar vi fram ett brev du kan skicka. Revisorn intygar uppgifterna i del 2 — inte att
              ni borde få bidrag.
            </Alert>
            <Field label="Revisorns namn eller byrå">
              <TextInput value={state.auditorName} onChange={(e) => patch({ auditorName: e.target.value })} />
            </Field>
            <Field label="E-post">
              <TextInput
                type="email"
                value={state.auditorEmail}
                onChange={(e) => patch({ auditorEmail: e.target.value })}
              />
            </Field>
          </>
        ) : null}
      </div>
    </>
  );
}

export function SwedishStep() {
  const state = useWizardStore();
  const patch = useWizardStore((s) => s.patch);

  return (
    <>
      <StepHeader
        title="Svenska i vardagen"
        help="För tjänstgöring vid företag ska svenska vara det dagliga umgängesspråket med eleven, och eleven ska ha grundläggande kunskaper i svenska."
      />
      <div className="space-y-6">
        <Field label="Vilket språk talar den svenska vårdnadshavaren med eleven till vardags?">
          <div className="grid gap-2">
            <ChoiceCard
              title="Svenska"
              selected={state.dailyLanguage === "swedish"}
              onSelect={() => patch({ dailyLanguage: "swedish" })}
            />
            <ChoiceCard
              title="Blandat, men svenska dagligen"
              selected={state.dailyLanguage === "mixed"}
              onSelect={() => patch({ dailyLanguage: "mixed" })}
            />
            <ChoiceCard
              title="Sällan svenska"
              selected={state.dailyLanguage === "rarely"}
              onSelect={() => patch({ dailyLanguage: "rarely" })}
            />
          </div>
        </Field>
        <Field label="Elevens svenska">
          <div className="grid gap-2">
            <ChoiceCard
              title="Följer undervisningen utan stöd"
              selected={state.studentSwedish === "follows"}
              onSelect={() => patch({ studentSwedish: "follows" })}
            />
            <ChoiceCard
              title="Följer med visst stöd"
              selected={state.studentSwedish === "support"}
              onSelect={() => patch({ studentSwedish: "support" })}
            />
            <ChoiceCard
              title="Otillräcklig för gymnasiesvenska"
              selected={state.studentSwedish === "insufficient"}
              onSelect={() => patch({ studentSwedish: "insufficient" })}
            />
          </div>
        </Field>
        {state.dailyLanguage === "rarely" || state.studentSwedish === "insufficient" ? (
          <Alert tone="warn">Skolan bedömer språket. Berätta som det är.</Alert>
        ) : null}
      </div>
    </>
  );
}
