"use client";

import { Alert, Checkbox, ChoiceCard, Field, TextInput } from "@/components/ui";
import { hasSwedishCitizen } from "@/lib/wizard/gates";
import { useWizardStore } from "@/lib/wizard/store";
import { stayWarning } from "@/lib/wizard/validation";

export function IntroStep({ onPrivacy }: { onPrivacy: () => void }) {
  const understoodSchoolSubmits = useWizardStore((s) => s.understoodSchoolSubmits);
  const consentProcessing = useWizardStore((s) => s.consentProcessing);
  const patch = useWizardStore((s) => s.patch);

  return (
    <>
      <StepHeader
        title="Så här fungerar statsbidraget"
        help="Tre saker att veta innan vi börjar."
      />
      <ol className="space-y-4 text-[16px] leading-7 text-stone">
        <li>
          <strong className="text-ink">Ni söker inte själva.</strong> Skolan samlar underlagen i
          början av höstterminen. Hermods Distansgymnasium lämnar dem, tillsammans med skolan, till
          Skolverket.
        </li>
        <li>
          <strong className="text-ink">Godkännande sänker avgiften.</strong> Gymnasieavgiften går
          från 9 300 € till 7 100 € (2 200 €). Nya elever faktureras först till full avgift.
        </li>
        <li>
          <strong className="text-ink">Skolverket beslutar.</strong> Guiden hjälper er att lämna ett
          komplett underlag. Den kan inte lova godkännande.
        </li>
      </ol>
      <div className="mt-8 space-y-4">
        <Checkbox
          checked={understoodSchoolSubmits}
          onChange={(value) => patch({ understoodSchoolSubmits: value })}
        >
          Jag förstår att underlaget lämnas till skolan och Hermods, inte direkt till Skolverket.
        </Checkbox>
        <Checkbox
          checked={consentProcessing}
          onChange={(value) => patch({ consentProcessing: value })}
        >
          Jag godkänner att uppgifter om eleven och familjen behandlas för att ta fram underlaget.{" "}
          <button type="button" className="text-klint underline" onClick={onPrivacy}>
            Integritet
          </button>
        </Checkbox>
      </div>
    </>
  );
}

export function StudentStep() {
  const state = useWizardStore();
  const patch = useWizardStore((s) => s.patch);

  return (
    <>
      <StepHeader
        title="Vem är eleven?"
        help="Samma uppgifter som på Skolverkets blankett, del 1."
      />
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Förnamn">
            <TextInput
              value={state.studentFirstName}
              onChange={(e) => patch({ studentFirstName: e.target.value })}
              autoComplete="given-name"
            />
          </Field>
          <Field label="Efternamn">
            <TextInput
              value={state.studentLastName}
              onChange={(e) => patch({ studentLastName: e.target.value })}
              autoComplete="family-name"
            />
          </Field>
        </div>
        <Field label="Födelsedatum" hint="Samma fält som på blanketten.">
          <TextInput
            type="date"
            value={state.studentDateOfBirth}
            onChange={(e) => patch({ studentDateOfBirth: e.target.value })}
          />
        </Field>
        <Field label="Årskurs">
          <div className="grid grid-cols-3 gap-2">
            {(["1", "2", "3"] as const).map((year) => (
              <ChoiceCard
                key={year}
                title={`Åk ${year}`}
                selected={state.year === year}
                onSelect={() => patch({ year })}
              />
            ))}
          </div>
        </Field>
        <Field label="Program">
          <div className="grid gap-2">
            <ChoiceCard
              title="Ekonomiprogrammet"
              selected={state.program === "ekonomi"}
              onSelect={() => patch({ program: "ekonomi" })}
            />
            <ChoiceCard
              title="Samhällsvetenskapsprogrammet"
              selected={state.program === "samhalle"}
              onSelect={() => patch({ program: "samhalle" })}
            />
            <ChoiceCard
              title="Annat"
              selected={state.program === "annat"}
              onSelect={() => patch({ program: "annat" })}
            />
          </div>
        </Field>
        {state.program === "annat" ? (
          <Field label="Vilket program?">
            <TextInput
              value={state.programOther}
              onChange={(e) => patch({ programOther: e.target.value })}
            />
          </Field>
        ) : null}
      </div>
    </>
  );
}

export function GuardiansStep() {
  const state = useWizardStore();
  const patch = useWizardStore((s) => s.patch);

  return (
    <>
      <StepHeader
        title="Vårdnadshavare"
        help="Minst en ska vara svensk medborgare. Minst en ska vistas utomlands på grund av verksamheten."
      />
      <div className="space-y-8">
        <GuardianFields which={1} />
        <Checkbox
          checked={state.hasSecondGuardian}
          onChange={(value) => patch({ hasSecondGuardian: value })}
        >
          Det finns en andra vårdnadshavare
        </Checkbox>
        {state.hasSecondGuardian ? <GuardianFields which={2} /> : null}

        {!hasSwedishCitizen(state) && state.guardian1.citizenship ? (
          <Alert tone="warn">
            3 § kräver att minst en vårdnadshavare är svensk medborgare. Ni kan fortsätta, men
            paketet märks som risk.
          </Alert>
        ) : null}

        <Field label="Vilken vårdnadshavare vistas utomlands på grund av arbete, studier eller annan verksamhet?">
          <div className="grid gap-2">
            <ChoiceCard
              title={`${state.guardian1.firstName || "Vårdnadshavare 1"}`}
              selected={state.abroadGuardian === "1"}
              onSelect={() => patch({ abroadGuardian: "1" })}
            />
            {state.hasSecondGuardian ? (
              <ChoiceCard
                title={`${state.guardian2.firstName || "Vårdnadshavare 2"}`}
                selected={state.abroadGuardian === "2"}
                onSelect={() => patch({ abroadGuardian: "2" })}
              />
            ) : null}
            {state.hasSecondGuardian ? (
              <ChoiceCard
                title="Båda"
                selected={state.abroadGuardian === "both"}
                onSelect={() => patch({ abroadGuardian: "both" })}
              />
            ) : null}
          </div>
        </Field>

        <Field label="Bor eleven tillsammans med den utlandsverksamma vårdnadshavaren på Mallorca?">
          <div className="grid gap-2">
            <ChoiceCard
              title="Ja"
              selected={state.livesWithAbroadGuardian === "yes"}
              onSelect={() => patch({ livesWithAbroadGuardian: "yes" })}
            />
            <ChoiceCard
              title="Nej, eleven bor hos den andra vårdnadshavaren"
              selected={state.livesWithAbroadGuardian === "no"}
              onSelect={() => patch({ livesWithAbroadGuardian: "no" })}
            />
            <ChoiceCard
              title="Delad"
              selected={state.livesWithAbroadGuardian === "shared"}
              onSelect={() => patch({ livesWithAbroadGuardian: "shared" })}
            />
          </div>
        </Field>
        {state.livesWithAbroadGuardian === "no" ? (
          <Alert tone="info">
            Hermods tar emot underlag där eleven medföljer vårdnadshavare. Berätta för skolan hur ni
            bor, så de kan bedöma.
          </Alert>
        ) : null}
      </div>
    </>
  );
}

function GuardianFields({ which }: { which: 1 | 2 }) {
  const guardian = useWizardStore((s) => (which === 1 ? s.guardian1 : s.guardian2));
  const patchGuardian = useWizardStore((s) => s.patchGuardian);

  return (
    <fieldset className="space-y-4">
      <legend className="text-[13px] font-medium text-stone">Vårdnadshavare {which}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Förnamn">
          <TextInput
            value={guardian.firstName}
            onChange={(e) => patchGuardian(which, { firstName: e.target.value })}
          />
        </Field>
        <Field label="Efternamn">
          <TextInput
            value={guardian.lastName}
            onChange={(e) => patchGuardian(which, { lastName: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Födelsedatum">
        <TextInput
          type="date"
          value={guardian.dateOfBirth}
          onChange={(e) => patchGuardian(which, { dateOfBirth: e.target.value })}
        />
      </Field>
      <Field label="Medborgarskap">
        <div className="grid gap-2">
          <ChoiceCard
            title="Svenskt"
            selected={guardian.citizenship === "swedish"}
            onSelect={() => patchGuardian(which, { citizenship: "swedish" })}
          />
          <ChoiceCard
            title="Svenskt + annat"
            selected={guardian.citizenship === "swedish_plus"}
            onSelect={() => patchGuardian(which, { citizenship: "swedish_plus" })}
          />
          <ChoiceCard
            title="Inte svenskt"
            selected={guardian.citizenship === "not_swedish"}
            onSelect={() => patchGuardian(which, { citizenship: "not_swedish" })}
          />
        </div>
      </Field>
    </fieldset>
  );
}

export function StayStep() {
  const state = useWizardStore();
  const patch = useWizardStore((s) => s.patch);
  const warning = stayWarning(state);

  return (
    <>
      <StepHeader
        title="Utlandsvistelsen"
        help="Skolverket kräver stadigvarande vistelse — minst 6 månader. Vid studier: minst en hel termin."
      />
      <div className="space-y-6">
        <Field label="När började, eller börjar, den sammanhängande vistelsen utomlands?">
          <TextInput
            type="month"
            value={state.stayFrom}
            onChange={(e) => patch({ stayFrom: e.target.value })}
          />
        </Field>
        <Field label="Hur länge är vistelsen planerad?">
          <div className="grid gap-2">
            <ChoiceCard
              title="Tillsvidare / obestämd"
              selected={state.stayType === "indefinite"}
              onSelect={() => patch({ stayType: "indefinite", stayTo: "" })}
            />
            <ChoiceCard
              title="Tidsbegränsad"
              selected={state.stayType === "limited"}
              onSelect={() => patch({ stayType: "limited" })}
            />
          </div>
        </Field>
        {state.stayType === "limited" ? (
          <Field label="Till och med">
            <TextInput
              type="month"
              value={state.stayTo}
              onChange={(e) => patch({ stayTo: e.target.value })}
            />
          </Field>
        ) : null}
        <Field label="Var vistas den utlandsverksamma vårdnadshavaren?">
          <TextInput
            value={state.stayPlace}
            onChange={(e) => patch({ stayPlace: e.target.value })}
          />
        </Field>
        {warning ? <Alert tone="warn">{warning}</Alert> : null}
      </div>
    </>
  );
}

export function ReasonStep() {
  const reason = useWizardStore((s) => s.reason);
  const patch = useWizardStore((s) => s.patch);
  const resetBranch = useWizardStore((s) => s.resetBranch);

  function select(next: typeof reason) {
    if (reason && reason !== next) {
      resetBranch();
    }
    patch({ reason: next });
  }

  return (
    <>
      <StepHeader
        title="Varför vistas vårdnadshavaren utomlands?"
        help="Välj det som är den verkliga orsaken. Fel blankett är en av de vanligaste orsakerna till komplettering."
      />
      <div className="grid gap-3">
        <ChoiceCard
          title="Tjänstgöring"
          description="Anställd hos myndighet, organisation eller företag. Inte enskild firma."
          selected={reason === "employment"}
          onSelect={() => select("employment")}
        />
        <ChoiceCard
          title="Studier eller forskning"
          description="Med studiemedel, stipendium eller lön. Inte distansstudier vid svenskt lärosäte."
          selected={reason === "studies"}
          onSelect={() => select("studies")}
        />
        <ChoiceCard
          title="Kulturarbete"
          description="Huvudsaklig försörjning. Arbetet behöver utföras här."
          selected={reason === "culture"}
          onSelect={() => select("culture")}
        />
        <ChoiceCard
          title="Väsentligt för det svenska samhället"
          description="Annan verksamhet som bedöms väsentlig. Högt beviskrav."
          selected={reason === "society"}
          onSelect={() => select("society")}
        />
        <ChoiceCard
          title="Synnerliga skäl"
          description="Sociala förhållanden, till exempel hälsoskäl. Undantag — inte genväg."
          selected={reason === "exceptional"}
          onSelect={() => select("exceptional")}
        />
      </div>
      <p className="mt-6 text-[14px] leading-6 text-stone">
        De flesta familjer på Mallorca hör till tjänstgöring, ofta svenskt aktiebolag (kategori C).
        Kultur, “väsentligt” och synnerliga skäl är smala undantag.
      </p>
    </>
  );
}

export function StepHeader({ title, help }: { title: string; help: string }) {
  return (
    <header className="mb-8">
      <h1 className="font-serif text-[32px] font-semibold leading-[38px] text-ink max-sm:text-[26px] max-sm:leading-8">
        {title}
      </h1>
      <p className="mt-3 max-w-[36rem] text-[16px] leading-7 text-stone">{help}</p>
    </header>
  );
}
