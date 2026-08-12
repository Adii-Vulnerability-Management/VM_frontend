export const THIRD_PARTY_TYPES = [
  {
    label: 'Vendor',
    value: 'Vendor',
    description: 'External service provider, technology provider, consultant, outsourcing partner, or supplier.',
  },
  {
    label: 'Agent',
    value: 'Agent',
    description: 'Representative or intermediary acting on behalf of the organization.',
  },
  {
    label: 'Regulator',
    value: 'Regulator',
    description: 'Regulatory or supervisory body involved in business oversight or reporting.',
  },
  {
    label: 'Physical and Digital Supply Chain Partner',
    value: 'Physical and Digital Supply Chain Partner',
    description: 'Logistics, infrastructure, cloud, data, platform, or supply chain dependency.',
  },
  {
    label: 'Customer',
    value: 'Customer',
    description: 'Customer entity that requires assessment, assurance, or trust review.',
  },
  {
    label: 'Business Partner',
    value: 'Business Partner',
    description: 'Strategic partner, alliance, channel partner, or joint operating partner.',
  },
];

export const COMMITTEE_ROLES = [
  'Relationship Manager',
  'TPRM Team Manager',
  'Business Owner',
  'Vendor Manager',
  'TPRM Team Lead',
  'Contract Management Head',
  'CISO',
  'Other',
];

export const GOVERNANCE_OWNER_FIELDS = [
  { key: 'relationshipManager', label: 'Relationship Manager' },
  { key: 'tprmTeamManager', label: 'TPRM Team Manager' },
  { key: 'businessOwner', label: 'Business Owner' },
  { key: 'vendorManager', label: 'Vendor Manager' },
  { key: 'tprmTeamLead', label: 'TPRM Team Lead' },
  { key: 'contractManagementHead', label: 'Contract Management Head' },
  { key: 'ciso', label: 'CISO' },
];

export const RISK_LEVELS = {
  Critical: {
    badge: 'bg-red-100 text-red-700 border-red-200',
    questionnaire: 'SIG / CCM questionnaire + ISO 27001 / SOC 2 + Physical Audit + Incident Metrics',
    actions: ['Full assessment', 'Governance approval', 'Physical audit', 'Incident performance matrix'],
  },
  High: {
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    questionnaire: 'SIG Lite questionnaire + ISO 27001 / SOC 2 + Incident Metrics',
    actions: ['Standard assessment', 'Governance approval', 'Incident performance matrix'],
  },
  Medium: {
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    questionnaire: 'SIG Lite / CCM-based questionnaire or external monitoring service',
    actions: ['Limited assessment', 'Evidence review'],
  },
  Low: {
    badge: 'bg-green-100 text-green-700 border-green-200',
    questionnaire: 'No detailed questionnaire required',
    actions: ['Basic record review'],
  },
  Unclassified: {
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    questionnaire: 'Threshold assessment pending',
    actions: ['Complete threshold assessment'],
  },
};

export const EMPTY_GOVERNANCE_OWNERS = {
  relationshipManager: '',
  tprmTeamManager: '',
  businessOwner: '',
  vendorManager: '',
  tprmTeamLead: '',
  contractManagementHead: '',
  ciso: '',
};

export const WORKFLOW_STEPS = [
  'Select Third-Party Type',
  'Governance Committee',
  'Add / Upload Third Parties',
  'Threshold Assessment',
  'Questionnaire Decision',
  'Send Assessment',
  'Reporting',
];

export function evaluateThresholdRisk(input = {}) {
  const confidential = Boolean(input.confidentialData);
  const sensitive = Boolean(input.sensitiveCustomerData);
  const access = Boolean(input.accessToSystems);
  const critical = Boolean(input.businessCritical);

  if (confidential && sensitive && access && critical) {
    return {
      riskCategory: 'Critical',
      suggestedQuestionnaire: RISK_LEVELS.Critical.questionnaire,
      requiresGovernanceApproval: true,
      requiresPhysicalAudit: true,
      requiresIncidentPerformanceMatrix: true,
    };
  }

  if (!confidential && !sensitive && access && critical) {
    return {
      riskCategory: 'High',
      suggestedQuestionnaire: RISK_LEVELS.High.questionnaire,
      requiresGovernanceApproval: true,
      requiresPhysicalAudit: false,
      requiresIncidentPerformanceMatrix: true,
    };
  }

  if (confidential && !sensitive && !access && !critical) {
    return {
      riskCategory: 'Medium',
      suggestedQuestionnaire: RISK_LEVELS.Medium.questionnaire,
      requiresGovernanceApproval: false,
      requiresPhysicalAudit: false,
      requiresIncidentPerformanceMatrix: false,
    };
  }

  if (!confidential && !sensitive && !access && !critical) {
    return {
      riskCategory: 'Low',
      suggestedQuestionnaire: RISK_LEVELS.Low.questionnaire,
      requiresGovernanceApproval: false,
      requiresPhysicalAudit: false,
      requiresIncidentPerformanceMatrix: false,
    };
  }

  const score = [confidential, sensitive, access, critical].filter(Boolean).length;
  if (score >= 3) {
    return {
      riskCategory: 'High',
      suggestedQuestionnaire: RISK_LEVELS.High.questionnaire,
      requiresGovernanceApproval: true,
      requiresPhysicalAudit: false,
      requiresIncidentPerformanceMatrix: true,
    };
  }

  if (score === 2) {
    return {
      riskCategory: 'Medium',
      suggestedQuestionnaire: RISK_LEVELS.Medium.questionnaire,
      requiresGovernanceApproval: false,
      requiresPhysicalAudit: false,
      requiresIncidentPerformanceMatrix: false,
    };
  }

  return {
    riskCategory: 'Low',
    suggestedQuestionnaire: RISK_LEVELS.Low.questionnaire,
    requiresGovernanceApproval: false,
    requiresPhysicalAudit: false,
    requiresIncidentPerformanceMatrix: false,
  };
}
