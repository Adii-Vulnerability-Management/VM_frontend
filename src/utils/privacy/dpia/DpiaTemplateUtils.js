export const LEGACY_DPIA_FORM_TEMPLATE_SECTIONS = [
  {
    title: "CORPORATE AND COMPLIANCE DETAILS",
    questions: [
      {
        key: "legacy_companyInformation",
        label: "Company Information: company name, address, city, state, ZIP, entity levels, division, and unit.",
        type: "textarea",
        required: false,
        guidance: "This replaces the old fixed Company Information accordion when using template-based DPIA.",
      },
      {
        key: "legacy_personnelInformation",
        label: "Personnel Information: manager, privacy officer, executive sponsor, titles, and contact details.",
        type: "textarea",
        required: false,
      },
      {
        key: "legacy_complianceInformation",
        label: "Compliance Information: PHI/PII/GDPR/HIPAA/DPDP applicability and assessment dates.",
        type: "textarea",
        required: false,
      },
    ],
  },
  {
    title: "SECTION 1 - EXECUTIVE SUMMARY",
    questions: [
      {
        key: "legacy_executiveSummary",
        label: "Executive summary of the initiative, processing activity, privacy impact, and final recommendation.",
        type: "textarea",
        required: false,
      },
      {
        key: "legacy_generalAdministrativeInformation",
        label: "General administrative information: organization, work unit, author, executive sponsor, privacy officer, and last review date.",
        type: "textarea",
        required: false,
      },
      {
        key: "legacy_initiativeDescription",
        label: "Initiative description: describe the project, system, business process, or change being assessed.",
        type: "textarea",
        required: false,
      },
      {
        key: "legacy_scopeOfPia",
        label: "Scope of this PIA/DPIA: describe what is in scope, out of scope, systems involved, locations, and data flows.",
        type: "textarea",
        required: false,
      },
      {
        key: "legacy_relatedDocumentation",
        label: "Related documentation: policies, procedures, contracts, PTA/PIA references, records of processing, or architecture documents.",
        type: "textarea",
        required: false,
      },
    ],
  },
  {
    title: "SECTION 2 - OPERATIONS AND RISK ANALYSIS",
    questions: [
      {
        key: "legacy_collectingPersonalInformation",
        label: "Describe what personal information is collected and why it is required.",
        type: "textarea",
        required: false,
      },
      {
        key: "legacy_consentWithdrawalImpact",
        label: "Describe the implications if an individual withdraws consent or objects to processing.",
        type: "textarea",
        required: false,
      },
      {
        key: "legacy_notificationStatement",
        label: "Notification / privacy notice statement, including position/title, mailing address, email, and phone number for contact.",
        type: "textarea",
        required: false,
      },
      {
        key: "legacy_personalInformationInventory",
        label: "Personal information inventory: data elements, sensitivity, purpose, user roles, third-party disclosure, disclosure purpose, and retention.",
        type: "textarea",
        required: false,
        guidance: "Use this to capture the old inventory table content in template form.",
      },
      {
        key: "legacy_personalInformationFlow",
        label: "Personal information flow table: describe collection, storage, use, disclosure, transfer, billing, and disposal steps.",
        type: "textarea",
        required: false,
      },
      {
        key: "legacy_complianceMonitoring",
        label: "Describe how compliance with the defined processing purpose, notices, retention, and access controls will be monitored.",
        type: "textarea",
        required: false,
      },
    ],
  },
  {
    title: "SECTION 3 - SECURITY OF PERSONAL INFORMATION",
    questions: [
      {
        key: "legacy_securitySafeguards",
        label: "Security safeguards: storage location, storage device/system, encryption, access controls, logging, backup, and monitoring.",
        type: "textarea",
        required: false,
      },
      {
        key: "legacy_securityRiskControls",
        label: "Describe security risks and controls for unauthorized access, disclosure, alteration, loss, and breach response.",
        type: "textarea",
        required: false,
      },
    ],
  },
  {
    title: "SECTION 4 - ACCESS, ACCURACY, CORRECTION & RETENTION",
    questions: [
      {
        key: "legacy_accessAccuracyCorrectionRetention",
        label: "Describe access, accuracy, correction, and retention obligations for this processing activity.",
        type: "textarea",
        required: false,
      },
      {
        key: "legacy_individualAccessRequest",
        label: "How can individuals request access to their own personal information?",
        type: "textarea",
        required: false,
      },
      {
        key: "legacy_updateCorrectionAnnotation",
        label: "How can an individual have personal information updated, corrected, or annotated?",
        type: "textarea",
        required: false,
      },
      {
        key: "legacy_retentionRequirement",
        label: "What legal or business requirement applies, and how long must the information be retained?",
        type: "textarea",
        required: false,
      },
      {
        key: "legacy_disposalAfterRetention",
        label: "How will personal information be disposed of after the retention period is complete?",
        type: "textarea",
        required: false,
      },
    ],
  },
  {
    title: "SECTION 5 - PRIVACY OFFICE(R) COMMENTS",
    questions: [
      {
        key: "legacy_privacyOfficerComments",
        label: "Privacy Office(r) comments, decision, concerns, or approval conditions.",
        type: "textarea",
        required: false,
      },
      {
        key: "legacy_moreInformation",
        label: "Additional information requested, clarifications, or unresolved privacy questions.",
        type: "textarea",
        required: false,
      },
      {
        key: "legacy_signatureSummary",
        label: "Signature summary: manager, data privacy officer, executive director, signature dates, and final approval notes.",
        type: "textarea",
        required: false,
      },
    ],
  },
];

export const STANDARD_DPIA_TEMPLATE_SECTIONS = [
  {
    title: "Standard processing activity description",
    questions: [
      {
        key: "activityName",
        label: "What is the processing activity name?",
        type: "text",
        required: true,
        guidance: "Name the project, process, system, or use case being assessed.",
      },
      {
        key: "businessJustification",
        label: "What is the business justification for this processing?",
        type: "textarea",
        required: true,
      },
      {
        key: "processingOperations",
        label: "Which operations are performed on personal data?",
        type: "textarea",
        required: true,
        guidance: "Example: collect, store, analyze, disclose, transfer, delete, anonymize.",
      },
      {
        key: "dataSource",
        label: "What is the source of the personal data?",
        type: "textarea",
        required: true,
      },
      {
        key: "retentionAndDeletion",
        label: "What is the retention period and deletion trigger?",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    title: "Third-party involvement and transfers",
    questions: [
      {
        key: "thirdPartyInvolved",
        label: "Are any third parties, processors, sub-processors, or service providers involved?",
        type: "yes_no",
        required: true,
      },
      {
        key: "thirdPartyRoles",
        label: "List third-party names, roles, and purpose of sharing.",
        type: "textarea",
        required: false,
      },
      {
        key: "thirdPartySafeguards",
        label: "What contractual/security safeguards are in place?",
        type: "textarea",
        required: false,
        guidance: "Include DPA/BAA, audit rights, breach SLA, sub-processor approval, and deletion/return obligations.",
      },
      {
        key: "crossBorderTransferDetails",
        label: "If cross-border transfer exists, document destination and transfer mechanism.",
        type: "textarea",
        required: false,
      },
    ],
  },
];

export const safeJsonParse = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeTitle = (title) => String(title || "").trim().toLowerCase();

const TEMPLATE_WORKFLOW_SECTION_TITLES = [
  "workflow and approval readiness",
  "review and approval readiness",
  "approval workflow",
  "template approval flow",
];

export const isTemplateWorkflowSection = (section = {}) => {
  const title = normalizeTitle(section?.title);
  if (TEMPLATE_WORKFLOW_SECTION_TITLES.includes(title)) return true;

  const questions = Array.isArray(section?.questions) ? section.questions : [];
  return questions.some((question) =>
    ["reviewStakeholders", "highResidualRiskEscalation", "approvalRecommendation", "reviewerComments", "approverComments"].includes(question?.key),
  );
};

export const normalizeTemplateSections = (sections) => {
  const parsedSections = safeJsonParse(sections, []);
  const baseSections = Array.isArray(parsedSections) ? parsedSections : [];

  // IMPORTANT:
  // Do not auto-append legacy/default DPIA sections here.
  // Short/custom templates must render exactly the sections created in Template Library.
  // Default full DPIA templates already contain their own sections from the seed data.
  return baseSections.filter((section) => !isTemplateWorkflowSection(section));
};

export const normalizeDpiaTemplate = (template = {}) => ({
  ...template,
  sections: normalizeTemplateSections(template.sections),
  defaults: safeJsonParse(template.defaults, {}),
  riskLibrary: safeJsonParse(template.riskLibrary, []),
  customRoles: safeJsonParse(template.customRoles, []),
  reviewProcess: safeJsonParse(template.reviewProcess, {}),
  reminderConfig: safeJsonParse(template.reminderConfig, {}),
  queryConfig: safeJsonParse(template.queryConfig, {}),
  periodicReviewConfig: safeJsonParse(template.periodicReviewConfig, {}),
  proactiveTriggerConfig: safeJsonParse(template.proactiveTriggerConfig, {}),
  collaborationConfig: safeJsonParse(template.collaborationConfig, {}),
  assignedUsers: safeJsonParse(template.assignedUsers, []),
});

export const normalizeDpiaTemplates = (templates = []) =>
  Array.isArray(templates) ? templates.map(normalizeDpiaTemplate) : [];

export const buildTemplateQuestionState = (template = {}) =>
  normalizeTemplateSections(template.sections).map((section) => ({
    ...section,
    questions: (section.questions || []).map((question) => ({
      ...question,
      answer: question.answer || "",
    })),
  }));

export const buildTemplateRiskState = (template = {}) => {
  const riskLibrary = safeJsonParse(template.riskLibrary, []);
  return (Array.isArray(riskLibrary) ? riskLibrary : []).map((risk) => ({
    ...risk,
    likelihood: risk.likelihood || "Medium",
    residualRisk: risk.residualRisk || "Medium",
    control: risk.control || risk.mitigation || "",
  }));
};
