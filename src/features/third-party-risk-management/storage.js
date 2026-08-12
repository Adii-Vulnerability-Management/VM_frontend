export const STORAGE_KEYS = {
  selectedType: 'newTprmSelectedType',
  thirdParties: 'newTprmThirdParties',
  committeeMembers: 'newTprmCommitteeMembers',
  committeeMeetings: 'newTprmCommitteeMeetings',
  questionnaires: 'newTprmQuestionnaires',
  assessments: 'newTprmAssessments',
  incidents: 'newTprmIncidents',
  approvals: 'newTprmApprovals',
  physicalAudits: 'newTprmPhysicalAudits',
  impm: 'newTprmIncidentPerformanceMatrix',
  findings: 'newTprmFindings',
  reports: 'newTprmBusinessReports',
};

export function readStorage(key, fallback = []) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error('Storage read failed:', error);
    return fallback;
  }
}

export function writeStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage write failed:', error);
  }
}

export function makeId(prefix = 'tprm') {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}
