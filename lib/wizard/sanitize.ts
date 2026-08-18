import type { GenerateType, WizardState } from "./types";

export function payloadForModel(state: WizardState, type: GenerateType) {
  return {
    type,
    reason: state.reason,
    studentFirstName: state.studentFirstName,
    studentLastName: state.studentLastName,
    studentBirthYear: state.studentDateOfBirth.slice(0, 4),
    year: state.year,
    program: state.program === "annat" ? state.programOther : state.program,
    abroadGuardian:
      state.abroadGuardian === "1"
        ? `${state.guardian1.firstName} ${state.guardian1.lastName}`.trim()
        : state.abroadGuardian === "2"
          ? `${state.guardian2.firstName} ${state.guardian2.lastName}`.trim()
          : `${state.guardian1.firstName} ${state.guardian1.lastName}`.trim(),
    stayFrom: state.stayFrom,
    stayType: state.stayType,
    stayTo: state.stayTo,
    stayPlace: state.stayPlace,
    employerForm: state.employerForm,
    category: state.category,
    employerName: state.employerName,
    employerOrgNr: state.employerOrgNr,
    employerAddress: state.employerAddress,
    employerCountry: state.employerCountry,
    jobTitle: state.jobTitle,
    swedishControllerName: state.swedishControllerName,
    ownershipPercent: state.ownershipPercent,
    influenceDescription: state.influenceDescription,
    employmentType: state.employmentType,
    workAbroadFrom: state.workAbroadFrom,
    workAbroadTo: state.workAbroadTo,
    jobPoints: state.jobPoints,
    whyRaw: state.whyRaw,
    signerType: state.signerType || (state.canIndependentSign === "yes" ? "hr" : "auditor"),
    signerName: state.canIndependentSign === "yes" ? state.signerName : state.auditorName || state.signerName,
    signerTitle: state.signerTitle,
    institutionName: state.institutionName,
    institutionCountry: state.institutionCountry,
    studyDescription: state.studyDescription,
    studyMode: state.studyMode,
    funding: state.funding,
    cultureType: state.cultureType,
    culturePoints: state.culturePoints,
    cultureWhere: state.cultureWhere,
    cultureClients: state.cultureClients,
    societyWhat: state.societyWhat,
    societyWhySweden: state.societyWhySweden,
    societyVerifier: state.societyVerifier,
    exceptionalReasons: state.exceptionalReasons,
    exceptionalWho: state.exceptionalWho,
  };
}
