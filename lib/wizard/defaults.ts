import type { Guardian, SchoolTrackId, WizardState } from "./types";

export const emptyGuardian = (): Guardian => ({
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  citizenship: "",
});

export const defaultState = (track: SchoolTrackId = "gymnasiet"): WizardState => ({
  schoolTrack: track,
  currentStepId: "intro",
  understoodSchoolSubmits: false,
  consentProcessing: false,
  studentFirstName: "",
  studentLastName: "",
  studentDateOfBirth: "",
  year: "",
  program: "",
  programOther: "",
  guardian1: emptyGuardian(),
  guardian2: emptyGuardian(),
  hasSecondGuardian: true,
  abroadGuardian: "",
  livesWithAbroadGuardian: "",
  stayFrom: "",
  stayType: "",
  stayTo: "",
  stayPlace: "Mallorca",
  activityMeetsStayRule: "",
  reason: "",
  employerForm: "",
  isOwnerOrCeo: "",
  category: "",
  employerName: "",
  employerOrgNr: "",
  employerAddress: "",
  employerCountry: "Spanien",
  employerWebsite: "",
  jobTitle: "",
  swedishControllerName: "",
  swedishControllerOrgNr: "",
  ownershipPercent: "",
  influenceDescription: "",
  employmentType: "",
  workAbroadFrom: "",
  workAbroadTo: "",
  jobPoints: "",
  whyRaw: "",
  whyGenerated: "",
  whyApproved: false,
  aiConsent: false,
  writeMyself: false,
  canIndependentSign: "",
  signerName: "",
  signerTitle: "",
  signerEmail: "",
  signerPhone: "",
  signerType: "",
  auditorName: "",
  auditorEmail: "",
  letterGenerated: "",
  letterApproved: false,
  dailyLanguage: "",
  studentSwedish: "",
  institutionName: "",
  institutionCountry: "",
  studyDescription: "",
  studyMode: "",
  funding: "",
  fundingPayer: "",
  fundingPeriod: "",
  cultureType: "",
  culturePoints: "",
  cultureWhere: "",
  cultureClients: "",
  cultureLivelihood: "",
  cultureProof: "",
  societyWhat: "",
  societyWhySweden: "",
  societyVerifier: "",
  exceptionalReasons: "",
  exceptionalWho: "",
  exceptionalDocs: "",
  attachmentChecks: {},
});

export const AUDITOR_CORE_PARAGRAPH =
  "Skolverket kräver att del 2 av Intyg om tjänstgöring undertecknas av arbetsgivaren eller annan lämplig person med insyn i verksamheten, till exempel extern revisor. Vårdnadshavaren får inte underteckna sitt eget intyg. Er underskrift intygar att uppgifterna om tjänstgöringen stämmer — inte att statsbidrag ska beviljas. Mottagare av bidraget är skolan/distansinstitutet, inte familjen.";

export const AUDITOR_CORE_PARAGRAPH_EN =
  "Skolverket requires part 2 of the Employer certificate (Intyg om tjänstgöring) to be signed by the employer or another suitable person with insight into the business, for example an external auditor. The guardian must not sign their own certificate. Your signature confirms that the employment details are correct — not that the grant should be awarded. The recipient of the grant is the school, not the family.";

export const SKOLVERKET_FORMS = {
  guide:
    "https://www.skolverket.se/download/18.1ebb478a198e5fbc603412f/1756284787543/Valj-ratt-intyg-eller-blankett.pdf",
  employment:
    "https://www.skolverket.se/download/18.1ebb478a198e5fbc6034130/1756284787631/Intyg%20om%20tj%C3%A4nstg%C3%B6ring.pdf",
  studies:
    "https://www.skolverket.se/download/18.1d24c383194d85218995a71/1739192978765/Blankett%20studier%20och%20forskning%20UTLANDSSKOLOR.pdf",
  culture:
    "https://www.skolverket.se/download/18.1d24c383194d85218995a72/1739192978811/Blankett%20kulturarbete%20UTLANDSSKOLOR.pdf",
  society:
    "https://www.skolverket.se/download/18.1d24c383194d85218995a73/1739192978862/Blankett%20v%C3%A4sentligt%20f%C3%B6r%20det%20svenska%20samh%C3%A4llet%20UTLANDSSKOLOR.pdf",
  exceptional:
    "https://www.skolverket.se/download/18.1d24c383194d85218995a74/1739192978911/Blankett%20synnerliga%20sk%C3%A4l%20UTLANDSSKOLOR.pdf",
} as const;
