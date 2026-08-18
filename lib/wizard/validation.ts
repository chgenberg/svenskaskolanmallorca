import { distanceStudiesBlocked, isSoleTrader, stayTooShort, whyText } from "./gates";
import type { StepId, WizardState } from "./types";

export function canContinue(state: WizardState, stepId: StepId): boolean {
  switch (stepId) {
    case "intro":
      return state.understoodSchoolSubmits && state.consentProcessing;
    case "student":
      return Boolean(
        state.studentFirstName.trim() &&
          state.studentLastName.trim() &&
          state.studentDateOfBirth &&
          state.year,
      );
    case "guardians":
      return Boolean(
        state.guardian1.firstName.trim() &&
          state.guardian1.lastName.trim() &&
          state.guardian1.dateOfBirth &&
          state.guardian1.citizenship &&
          state.abroadGuardian &&
          state.livesWithAbroadGuardian &&
          (!state.hasSecondGuardian ||
            (state.guardian2.firstName.trim() &&
              state.guardian2.lastName.trim() &&
              state.guardian2.dateOfBirth &&
              state.guardian2.citizenship)),
      );
    case "stay":
      return Boolean(state.stayFrom && state.stayType && (state.stayType === "indefinite" || state.stayTo));
    case "reason":
      return Boolean(state.reason);
    case "employer-form":
      return Boolean(state.employerForm && state.employerForm !== "sole_trader" && state.isOwnerOrCeo);
    case "category":
      return Boolean(state.category);
    case "employer": {
      const base =
        state.employerName.trim() &&
        state.employerOrgNr.trim() &&
        state.employerAddress.trim() &&
        state.jobTitle.trim();
      if (state.category === "D") {
        return Boolean(
          base &&
            state.swedishControllerName.trim() &&
            state.swedishControllerOrgNr.trim() &&
            state.ownershipPercent.trim() &&
            state.influenceDescription.trim(),
        );
      }
      return Boolean(base);
    }
    case "job":
      return Boolean(
        state.employmentType &&
          state.workAbroadFrom &&
          (state.employmentType === "permanent" || state.workAbroadTo) &&
          state.jobPoints.trim().length > 12,
      );
    case "why": {
      const text = whyText(state);
      if (state.writeMyself) return text.length >= 400;
      return state.whyApproved && text.length >= 400;
    }
    case "signer":
      if (isSoleTrader(state)) return false;
      if (state.canIndependentSign === "self") return false;
      if (!state.canIndependentSign) return false;
      if (state.canIndependentSign === "yes") {
        return Boolean(state.signerName.trim() && state.signerTitle.trim());
      }
      return Boolean(state.auditorName.trim() || state.signerName.trim());
    case "letter":
      return Boolean(state.letterApproved && state.letterGenerated.trim());
    case "swedish":
      return Boolean(state.dailyLanguage && state.studentSwedish);
    case "studies":
      return Boolean(
        state.institutionName.trim() &&
          state.studyDescription.trim() &&
          state.studyMode &&
          !distanceStudiesBlocked(state),
      );
    case "funding":
      return Boolean(state.funding && state.funding !== "none");
    case "culture-work":
      return Boolean(state.cultureType.trim() && state.cultureWhere.trim());
    case "culture-livelihood":
      return state.cultureLivelihood === "main";
    case "society-work":
      return Boolean(state.societyWhat.trim() && state.societyWhySweden.trim());
    case "exceptional-reasons":
      return Boolean(state.exceptionalReasons.trim() && state.exceptionalWho);
    case "exceptional-docs":
      return Boolean(state.exceptionalDocs);
    case "checklist":
    case "pack":
      return true;
    default:
      return false;
  }
}

export function stayWarning(state: WizardState): string | null {
  if (!stayTooShort(state)) return null;
  return state.reason === "studies"
    ? "Skolverket brukar kräva minst en hel termin. Ni kan fortsätta, men paketet märks som risk."
    : "Skolverket brukar kräva minst 6 månader. Kortare vistelse leder ofta till att eleven inte räknas som underlag. Ni kan fortsätta, men paketet märks som risk.";
}
