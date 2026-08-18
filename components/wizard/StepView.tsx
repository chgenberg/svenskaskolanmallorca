"use client";

import {
  CategoryStep,
  EmployerFormStep,
  EmployerStep,
  JobStep,
  SignerStep,
  SwedishStep,
} from "./steps/Employment";
import { PackStep, ChecklistStep } from "./steps/Output";
import {
  CultureLivelihoodStep,
  CultureWorkStep,
  ExceptionalDocsStep,
  ExceptionalReasonsStep,
  FundingStep,
  SocietyWorkStep,
  StudiesStep,
} from "./steps/SideTracks";
import {
  GuardiansStep,
  IntroStep,
  ReasonStep,
  StayStep,
  StudentStep,
} from "./steps/Stem";
import { LetterStep, WhyStep } from "./steps/WhyAndLetter";
import type { StepId } from "@/lib/wizard/types";

export function StepView({
  stepId,
  onPrivacy,
}: {
  stepId: StepId;
  onPrivacy: () => void;
}) {
  switch (stepId) {
    case "intro":
      return <IntroStep onPrivacy={onPrivacy} />;
    case "student":
      return <StudentStep />;
    case "guardians":
      return <GuardiansStep />;
    case "stay":
      return <StayStep />;
    case "reason":
      return <ReasonStep />;
    case "employer-form":
      return <EmployerFormStep />;
    case "category":
      return <CategoryStep />;
    case "employer":
      return <EmployerStep />;
    case "job":
      return <JobStep />;
    case "why":
      return <WhyStep />;
    case "signer":
      return <SignerStep />;
    case "letter":
      return <LetterStep />;
    case "swedish":
      return <SwedishStep />;
    case "studies":
      return <StudiesStep />;
    case "funding":
      return <FundingStep />;
    case "culture-work":
      return <CultureWorkStep />;
    case "culture-livelihood":
      return <CultureLivelihoodStep />;
    case "society-work":
      return <SocietyWorkStep />;
    case "exceptional-reasons":
      return <ExceptionalReasonsStep />;
    case "exceptional-docs":
      return <ExceptionalDocsStep />;
    case "checklist":
      return <ChecklistStep />;
    case "pack":
      return <PackStep />;
    default:
      return null;
  }
}
