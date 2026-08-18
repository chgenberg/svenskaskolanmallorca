"use client";

import { Alert, ChoiceCard, Field, TextArea, TextInput } from "@/components/ui";
import { useWizardStore } from "@/lib/wizard/store";
import { StepHeader } from "./Stem";

export function StudiesStep() {
  const state = useWizardStore();
  const patch = useWizardStore((s) => s.patch);

  return (
    <>
      <StepHeader
        title="Studierna"
        help="Studier och forskning ska bedrivas på plats i värdlandet. Distansstudier vid svenskt lärosäte godkänns inte."
      />
      <div className="space-y-6">
        <Field label="Universitet, skola eller forskningscentrum">
          <TextInput
            value={state.institutionName}
            onChange={(e) => patch({ institutionName: e.target.value })}
          />
        </Field>
        <Field label="Land">
          <TextInput
            value={state.institutionCountry}
            onChange={(e) => patch({ institutionCountry: e.target.value })}
          />
        </Field>
        <Field label="Vilka studier eller vilken forskning?">
          <TextArea
            value={state.studyDescription}
            onChange={(e) => patch({ studyDescription: e.target.value })}
          />
        </Field>
        <Field label="Hur bedrivs studierna?">
          <div className="grid gap-2">
            <ChoiceCard
              title="På plats"
              selected={state.studyMode === "onsite"}
              onSelect={() => patch({ studyMode: "onsite" })}
            />
            <ChoiceCard
              title="Distans"
              selected={state.studyMode === "distance"}
              onSelect={() => patch({ studyMode: "distance" })}
            />
          </div>
        </Field>
        {state.studyMode === "distance" ? (
          <Alert tone="stop">
            Distansstudier vid svenska lärosäten godkänns inte som grund. Byt till studier på plats
            eller en annan anledning.
          </Alert>
        ) : null}
      </div>
    </>
  );
}

export function FundingStep() {
  const state = useWizardStore();
  const patch = useWizardStore((s) => s.patch);

  return (
    <>
      <StepHeader
        title="Finansiering"
        help="Förordningen kräver studiemedel, stipendium eller lön."
      />
      <div className="space-y-6">
        <Field label="Hur finansieras studierna eller forskningen?">
          <div className="grid gap-2">
            <ChoiceCard
              title="Studiemedel (CSN)"
              selected={state.funding === "csn"}
              onSelect={() => patch({ funding: "csn" })}
            />
            <ChoiceCard
              title="Stipendium"
              selected={state.funding === "stipend"}
              onSelect={() => patch({ funding: "stipend" })}
            />
            <ChoiceCard
              title="Lön"
              selected={state.funding === "salary"}
              onSelect={() => patch({ funding: "salary" })}
            />
            <ChoiceCard
              title="Ingen av dessa"
              selected={state.funding === "none"}
              onSelect={() => patch({ funding: "none" })}
            />
          </div>
        </Field>
        {state.funding === "none" ? (
          <Alert tone="stop">
            Utan studiemedel, stipendium eller lön blir underlaget ofullständigt för den här
            blanketten.
          </Alert>
        ) : null}
        {state.funding && state.funding !== "none" ? (
          <>
            <Field label="Utbetalare">
              <TextInput
                value={state.fundingPayer}
                onChange={(e) => patch({ fundingPayer: e.target.value })}
              />
            </Field>
            <Field label="Period">
              <TextInput
                value={state.fundingPeriod}
                onChange={(e) => patch({ fundingPeriod: e.target.value })}
                placeholder="Till exempel 2026-08 – 2027-06"
              />
            </Field>
          </>
        ) : null}
      </div>
    </>
  );
}

export function CultureWorkStep() {
  const state = useWizardStore();
  const patch = useWizardStore((s) => s.patch);

  return (
    <>
      <StepHeader
        title="Kulturarbetet"
        help="Om vårdnadshavaren är anställd inom kultur, använd i stället tjänstgöringsintyg."
      />
      <div className="space-y-6">
        <Field label="Typ av kulturarbete">
          <TextInput value={state.cultureType} onChange={(e) => patch({ cultureType: e.target.value })} />
        </Field>
        <Field label="Var utförs det, och varför just här?">
          <TextArea value={state.cultureWhere} onChange={(e) => patch({ cultureWhere: e.target.value })} />
        </Field>
        <Field label="Uppdragsgivare, scener, förlag eller produktion">
          <TextInput
            value={state.cultureClients}
            onChange={(e) => patch({ cultureClients: e.target.value })}
          />
        </Field>
        <Field label="Korta punkter om arbetet">
          <TextArea
            value={state.culturePoints}
            onChange={(e) => patch({ culturePoints: e.target.value })}
          />
        </Field>
      </div>
    </>
  );
}

export function CultureLivelihoodStep() {
  const state = useWizardStore();
  const patch = useWizardStore((s) => s.patch);

  return (
    <>
      <StepHeader
        title="Försörjningen"
        help="Blanketten kräver att den huvudsakliga försörjningen beror på kulturarbetet."
      />
      <div className="space-y-6">
        <Field label="Andel av försörjningen som kommer från kulturarbetet">
          <div className="grid gap-2">
            <ChoiceCard
              title="Huvudsaklig (mer än hälften)"
              selected={state.cultureLivelihood === "main"}
              onSelect={() => patch({ cultureLivelihood: "main" })}
            />
            <ChoiceCard
              title="Komplement"
              selected={state.cultureLivelihood === "complement"}
              onSelect={() => patch({ cultureLivelihood: "complement" })}
            />
          </div>
        </Field>
        {state.cultureLivelihood === "complement" ? (
          <Alert tone="stop">
            Om kulturarbetet bara är ett komplement passar den här blanketten inte. Byt anledning
            eller stärk underlaget.
          </Alert>
        ) : null}
        <Field label="Kan försörjningen styrkas med">
          <div className="grid gap-2">
            <ChoiceCard
              title="Bokslut / BA"
              selected={state.cultureProof === "accounts"}
              onSelect={() => patch({ cultureProof: "accounts" })}
            />
            <ChoiceCard
              title="Kontrakt"
              selected={state.cultureProof === "contract"}
              onSelect={() => patch({ cultureProof: "contract" })}
            />
            <ChoiceCard
              title="Cachetunderlag"
              selected={state.cultureProof === "cachet"}
              onSelect={() => patch({ cultureProof: "cachet" })}
            />
            <ChoiceCard
              title="Inte än"
              selected={state.cultureProof === "not_yet"}
              onSelect={() => patch({ cultureProof: "not_yet" })}
            />
          </div>
        </Field>
      </div>
    </>
  );
}

export function SocietyWorkStep() {
  const state = useWizardStore();
  const patch = useWizardStore((s) => s.patch);

  return (
    <>
      <StepHeader
        title="Verksamheten"
        help="Det ska vara väsentligt för Sverige på nationell nivå, inte för familjen eller det egna bolaget."
      />
      <div className="space-y-6">
        <Field label="Vad gör vårdnadshavaren?">
          <TextArea value={state.societyWhat} onChange={(e) => patch({ societyWhat: e.target.value })} />
        </Field>
        <Field label="På vilket sätt är det väsentligt för Sverige?">
          <TextArea
            value={state.societyWhySweden}
            onChange={(e) => patch({ societyWhySweden: e.target.value })}
          />
        </Field>
        <Field label="Vilken svensk aktör kan styrka det?">
          <TextInput
            value={state.societyVerifier}
            onChange={(e) => patch({ societyVerifier: e.target.value })}
            placeholder="Myndighet, förbund eller uppdragsgivare"
          />
        </Field>
      </div>
    </>
  );
}

export function ExceptionalReasonsStep() {
  const state = useWizardStore();
  const patch = useWizardStore((s) => s.patch);

  return (
    <>
      <StepHeader
        title="Skälen"
        help="Synnerliga skäl tillämpas restriktivt och utgår från elevens behov."
      />
      <div className="space-y-6">
        <Field label="Vilka sociala förhållanden åberopas?">
          <TextArea
            value={state.exceptionalReasons}
            onChange={(e) => patch({ exceptionalReasons: e.target.value })}
          />
        </Field>
        <Field label="Vem berörs?">
          <div className="grid gap-2">
            <ChoiceCard
              title="Eleven"
              selected={state.exceptionalWho === "student"}
              onSelect={() => patch({ exceptionalWho: "student" })}
            />
            <ChoiceCard
              title="Vårdnadshavare"
              selected={state.exceptionalWho === "guardian"}
              onSelect={() => patch({ exceptionalWho: "guardian" })}
            />
            <ChoiceCard
              title="Båda"
              selected={state.exceptionalWho === "both"}
              onSelect={() => patch({ exceptionalWho: "both" })}
            />
          </div>
        </Field>
      </div>
    </>
  );
}

export function ExceptionalDocsStep() {
  const exceptionalDocs = useWizardStore((s) => s.exceptionalDocs);
  const patch = useWizardStore((s) => s.patch);

  return (
    <>
      <StepHeader
        title="Underlag"
        help="Ladda inte upp hälsohandlingar här. Ta med dem till skolan i slutet kuvert."
      />
      <div className="space-y-6">
        <Field label="Finns intyg som styrker skälen?">
          <div className="grid gap-2">
            <ChoiceCard
              title="Ja, intyg finns (läkare, socialtjänst eller liknande)"
              selected={exceptionalDocs === "exists"}
              onSelect={() => patch({ exceptionalDocs: "exists" })}
            />
            <ChoiceCard
              title="Nej, inte än"
              selected={exceptionalDocs === "missing"}
              onSelect={() => patch({ exceptionalDocs: "missing" })}
            />
          </div>
        </Field>
        <Alert tone="warn">
          Inga journaler i appen. Skolan tar emot handlingarna på redan etablerad väg.
        </Alert>
      </div>
    </>
  );
}
