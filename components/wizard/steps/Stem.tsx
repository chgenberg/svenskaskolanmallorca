"use client";

import { useEffect } from "react";
import { Alert, Checkbox, ChoiceCard, Field, TextInput } from "@/components/ui";
import { feeReductionSentence, SCHOOL_FUTURE_SENTENCE, trackOf } from "@/lib/tracks/config";
import { CENSUS_ISO, CENSUS_LABEL_SV, hasSwedishCitizen, LOCKED_STAY_PLACE } from "@/lib/wizard/gates";
import { useWizardStore } from "@/lib/wizard/store";
import { stayWarning } from "@/lib/wizard/validation";

export function IntroStep({ onPrivacy }: { onPrivacy: () => void }) {
  const understoodSchoolSubmits = useWizardStore((s) => s.understoodSchoolSubmits);
  const consentProcessing = useWizardStore((s) => s.consentProcessing);
  const schoolTrack = useWizardStore((s) => s.schoolTrack);
  const patch = useWizardStore((s) => s.patch);
  const track = trackOf({ schoolTrack });

  return (
    <>
      <StepHeader
        title="Så här fungerar statsbidraget"
        help="Fyra saker att veta innan vi börjar."
      />
      <ol className="space-y-4 text-[16px] leading-7 text-stone">
        <li>
          <strong className="text-ink">Ni söker inte själva.</strong> Skolan samlar underlagen i
          september, i början av höstterminen. {track.hermods
            ? "Hermods Distansgymnasium lämnar dem, tillsammans med skolan, till Skolverket."
            : "Svenska Skolan Mallorca skickar dem till Skolverket."}
        </li>
        <li>
          <strong className="text-ink">Godkännande sänker avgiften.</strong> {feeReductionSentence(track)}{" "}
          Nya elever faktureras först till full avgift.
        </li>
        <li>
          <strong className="text-ink">Det handlar om skolan, inte bara om er avgift.</strong>{" "}
          {SCHOOL_FUTURE_SENTENCE}
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
          Jag förstår att underlaget lämnas till {track.submittersLabel}, inte direkt till Skolverket.
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
  const track = trackOf(state);

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
        <p className="text-[14px] leading-6 text-stone">
          På blanketten: Ange utlandsskolan som <strong className="text-ink">{track.schoolNameOnForm}</strong>.
        </p>
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

  useEffect(() => {
    if (state.stayPlace !== LOCKED_STAY_PLACE) {
      patch({ stayPlace: LOCKED_STAY_PLACE });
    }
  }, [state.stayPlace, patch]);

  return (
    <>
      <StepHeader
        title="Utlandsvistelsen"
        help="Skolverket kräver stadigvarande vistelse — minst 6 månader, mätt mot anställningen eller verksamheten, och att den täcker 15 oktober."
      />
      <div className="space-y-6">
        <Field label="När började, eller börjar, den sammanhängande vistelsen utomlands?">
          <TextInput
            type="month"
            value={state.stayFrom}
            onChange={(e) => patch({ stayFrom: e.target.value })}
          />
        </Field>
        <Field label="Var vistas den utlandsverksamma vårdnadshavaren?">
          <ChoiceCard
            title={LOCKED_STAY_PLACE}
            description="Palma och ön räknas. Inte Barcelona, Madrid eller annan ort."
            selected
            disabled
            onSelect={() => patch({ stayPlace: LOCKED_STAY_PLACE })}
          />
        </Field>
        <Field
          label={`Pågår anställningen eller verksamheten minst 6 månader och över ${CENSUS_LABEL_SV}?`}
          hint={`Mätpunkten är ${CENSUS_LABEL_SV} ${CENSUS_ISO.slice(0, 4)} (${CENSUS_ISO}). Vid tjänstgöring fyller ni också utlandsperiod från och till under Tjänstgöringen.`}
        >
          <div className="grid gap-2">
            <ChoiceCard
              title="Ja"
              description={`Tjänsten eller verksamheten täcker minst 6 månader och ${CENSUS_LABEL_SV}.`}
              selected={state.activityMeetsStayRule === "yes"}
              onSelect={() => patch({ activityMeetsStayRule: "yes", stayPlace: LOCKED_STAY_PLACE })}
            />
            <ChoiceCard
              title="Nej"
              description="Då räknas eleven oftast inte som underlag för läsåret."
              selected={state.activityMeetsStayRule === "no"}
              onSelect={() => patch({ activityMeetsStayRule: "no", stayPlace: LOCKED_STAY_PLACE })}
            />
          </div>
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
