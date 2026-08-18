export type Reason =
  | "employment"
  | "studies"
  | "culture"
  | "society"
  | "exceptional";

export type EmployerForm =
  | "swedish_authority"
  | "international_org"
  | "swedish_ab"
  | "swedish_hb"
  | "swedish_association"
  | "foreign_company"
  | "sole_trader"
  | "unsure";

export type Category = "A" | "B" | "C" | "D" | "E" | "F";

export type Citizenship = "swedish" | "swedish_plus" | "not_swedish";

export type PackStatus = "complete" | "complete_risk" | "incomplete";

export type StepId =
  | "intro"
  | "student"
  | "guardians"
  | "stay"
  | "reason"
  | "employer-form"
  | "category"
  | "employer"
  | "job"
  | "why"
  | "signer"
  | "letter"
  | "swedish"
  | "studies"
  | "funding"
  | "culture-work"
  | "culture-livelihood"
  | "society-work"
  | "exceptional-reasons"
  | "exceptional-docs"
  | "checklist"
  | "pack";

export type Guardian = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  citizenship: Citizenship | "";
};

export type WizardState = {
  currentStepId: StepId;
  understoodSchoolSubmits: boolean;
  consentProcessing: boolean;
  studentFirstName: string;
  studentLastName: string;
  studentDateOfBirth: string;
  year: "1" | "2" | "3" | "";
  program: "ekonomi" | "samhalle" | "annat" | "";
  programOther: string;
  guardian1: Guardian;
  guardian2: Guardian;
  hasSecondGuardian: boolean;
  abroadGuardian: "1" | "2" | "both" | "";
  livesWithAbroadGuardian: "yes" | "no" | "shared" | "";
  stayFrom: string;
  stayType: "indefinite" | "limited" | "";
  stayTo: string;
  stayPlace: string;
  reason: Reason | "";
  employerForm: EmployerForm | "";
  isOwnerOrCeo: "yes" | "no" | "part_owner" | "";
  category: Category | "";
  employerName: string;
  employerOrgNr: string;
  employerAddress: string;
  employerCountry: string;
  employerWebsite: string;
  jobTitle: string;
  swedishControllerName: string;
  swedishControllerOrgNr: string;
  ownershipPercent: string;
  influenceDescription: string;
  employmentType: "permanent" | "temporary" | "";
  workAbroadFrom: string;
  workAbroadTo: string;
  jobPoints: string;
  whyRaw: string;
  whyGenerated: string;
  whyApproved: boolean;
  aiConsent: boolean;
  writeMyself: boolean;
  canIndependentSign: "yes" | "no" | "unsure" | "self" | "";
  signerName: string;
  signerTitle: string;
  signerEmail: string;
  signerPhone: string;
  signerType: "auditor" | "hr" | "both" | "";
  auditorName: string;
  auditorEmail: string;
  letterGenerated: string;
  letterApproved: boolean;
  dailyLanguage: "swedish" | "mixed" | "rarely" | "";
  studentSwedish: "follows" | "support" | "insufficient" | "";
  institutionName: string;
  institutionCountry: string;
  studyDescription: string;
  studyMode: "onsite" | "distance" | "";
  funding: "csn" | "stipend" | "salary" | "none" | "";
  fundingPayer: string;
  fundingPeriod: string;
  cultureType: string;
  culturePoints: string;
  cultureWhere: string;
  cultureClients: string;
  cultureLivelihood: "main" | "complement" | "";
  cultureProof: "accounts" | "contract" | "cachet" | "not_yet" | "";
  societyWhat: string;
  societyWhySweden: string;
  societyVerifier: string;
  exceptionalReasons: string;
  exceptionalWho: "student" | "guardian" | "both" | "";
  exceptionalDocs: "exists" | "missing" | "";
  attachmentChecks: Partial<Record<string, boolean>>;
};

export type StepDef = {
  id: StepId;
  title: string;
  short: string;
};

export type GenerateType = "why" | "letter";
