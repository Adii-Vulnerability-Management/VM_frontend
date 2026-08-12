import React from "react";

const inputClass =
  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

const yesNoOptions = ["", "Yes", "No", "Not Applicable"];
const thirdPartyRoles = [
  "",
  "Processor",
  "Sub-processor",
  "Joint Controller",
  "Independent Controller",
  "Service Provider",
];
const riskRatings = ["", "Low", "Medium", "High", "Critical"];
const workflowStatuses = [
  "Draft",
  "Submitted",
  "Privacy Review",
  "Security Review",
  "Legal Review",
  "Vendor Review",
  "Remediation Required",
  "Pending Approval",
  "Approved",
  "Rejected",
  "Closed",
];

const Field = ({ label, name, value, onChange, error, textarea = false, type = "text", children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children ? (
      children
    ) : textarea ? (
      <textarea
        rows={3}
        name={name}
        value={value || ""}
        onChange={onChange}
        className={`${inputClass} ${error ? "border-red-500" : ""}`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        className={`${inputClass} ${error ? "border-red-500" : ""}`}
      />
    )}
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const DpiaWorkflowSections = ({
  formData,
  errors,
  onProcessingActivityChange,
  onWorkflowChange,
  onThirdPartyChange,
  onAddThirdParty,
  onRemoveThirdParty,
}) => {
  const processingActivity = formData.processingActivity || {};
  const workflow = formData.workflow || {};
  const thirdParties = Array.isArray(formData.thirdParties) ? formData.thirdParties : [];

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-blue-50">
        <h3 className="text-lg font-semibold text-[#2B245C] mb-2">
          Standard Processing Activity Description
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Capture the standard DPIA processing record: purpose, data subjects, data categories,
          source, operations, location, retention, and legal basis.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Processing Activity Name"
            name="activityName"
            value={processingActivity.activityName}
            onChange={onProcessingActivityChange}
            error={errors["processingActivity.activityName"]}
          />
          <Field
            label="Business Justification"
            name="businessJustification"
            value={processingActivity.businessJustification}
            onChange={onProcessingActivityChange}
            error={errors["processingActivity.businessJustification"]}
          />
          <Field
            label="Purpose of Processing"
            name="purpose"
            value={processingActivity.purpose}
            onChange={onProcessingActivityChange}
            error={errors["processingActivity.purpose"]}
            textarea
          />
          <Field
            label="Data Subjects Involved"
            name="dataSubjects"
            value={processingActivity.dataSubjects}
            onChange={onProcessingActivityChange}
            error={errors["processingActivity.dataSubjects"]}
            textarea
          />
          <Field
            label="Categories of Personal Data"
            name="dataCategories"
            value={processingActivity.dataCategories}
            onChange={onProcessingActivityChange}
            error={errors["processingActivity.dataCategories"]}
            textarea
          />
          <Field
            label="Sensitive / Special Category Data"
            name="sensitiveData"
            value={processingActivity.sensitiveData}
            onChange={onProcessingActivityChange}
            error={errors["processingActivity.sensitiveData"]}
          >
            <select
              name="sensitiveData"
              value={processingActivity.sensitiveData || ""}
              onChange={onProcessingActivityChange}
              className={`${inputClass} ${errors["processingActivity.sensitiveData"] ? "border-red-500" : ""}`}
            >
              {yesNoOptions.map((option) => (
                <option key={option || "blank"} value={option}>{option || "Select"}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Data Source"
            name="dataSource"
            value={processingActivity.dataSource}
            onChange={onProcessingActivityChange}
            error={errors["processingActivity.dataSource"]}
          />
          <Field
            label="Collection Method"
            name="collectionMethod"
            value={processingActivity.collectionMethod}
            onChange={onProcessingActivityChange}
            error={errors["processingActivity.collectionMethod"]}
          />
          <Field
            label="Processing Operations"
            name="processingOperations"
            value={processingActivity.processingOperations}
            onChange={onProcessingActivityChange}
            error={errors["processingActivity.processingOperations"]}
            textarea
          />
          <Field
            label="Processing Frequency"
            name="frequency"
            value={processingActivity.frequency}
            onChange={onProcessingActivityChange}
            error={errors["processingActivity.frequency"]}
          />
          <Field
            label="Approx. Volume of Data"
            name="volume"
            value={processingActivity.volume}
            onChange={onProcessingActivityChange}
            error={errors["processingActivity.volume"]}
          />
          <Field
            label="Processing Location"
            name="processingLocation"
            value={processingActivity.processingLocation}
            onChange={onProcessingActivityChange}
            error={errors["processingActivity.processingLocation"]}
          />
          <Field
            label="Storage Location"
            name="storageLocation"
            value={processingActivity.storageLocation}
            onChange={onProcessingActivityChange}
            error={errors["processingActivity.storageLocation"]}
          />
          <Field
            label="Retention Period"
            name="retentionPeriod"
            value={processingActivity.retentionPeriod}
            onChange={onProcessingActivityChange}
            error={errors["processingActivity.retentionPeriod"]}
          />
          <Field
            label="Legal / Regulatory Basis"
            name="legalBasis"
            value={processingActivity.legalBasis}
            onChange={onProcessingActivityChange}
            error={errors["processingActivity.legalBasis"]}
          />
          <Field
            label="Data Subject / Data Principal Rights Impact"
            name="dataSubjectRightsImpact"
            value={processingActivity.dataSubjectRightsImpact}
            onChange={onProcessingActivityChange}
            error={errors["processingActivity.dataSubjectRightsImpact"]}
            textarea
          />
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-blue-50">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#2B245C]">
              Third-Party Involvement
            </h3>
            <p className="text-sm text-gray-600">
              Track vendors, processors, sub-processors, cross-border transfer, safeguards,
              risk rating, breach SLA, and deletion/return obligations.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddThirdParty}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
          >
            Add Third Party
          </button>
        </div>
        <div className="overflow-x-auto border rounded-lg bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-100 text-gray-700">
              <tr>
                <th className="p-2 text-left min-w-[180px]">Name</th>
                <th className="p-2 text-left min-w-[160px]">Role</th>
                <th className="p-2 text-left min-w-[220px]">Purpose</th>
                <th className="p-2 text-left min-w-[220px]">Data Shared</th>
                <th className="p-2 text-left min-w-[200px]">Processing Performed</th>
                <th className="p-2 text-left min-w-[160px]">Country</th>
                <th className="p-2 text-left min-w-[160px]">Cross-Border</th>
                <th className="p-2 text-left min-w-[180px]">Transfer Mechanism</th>
                <th className="p-2 text-left min-w-[120px]">DPA</th>
                <th className="p-2 text-left min-w-[160px]">Security Review</th>
                <th className="p-2 text-left min-w-[140px]">Risk Rating</th>
                <th className="p-2 text-left min-w-[160px]">Sub-processors</th>
                <th className="p-2 text-left min-w-[160px]">Breach SLA</th>
                <th className="p-2 text-left min-w-[180px]">Deletion / Return</th>
                <th className="p-2 text-left min-w-[180px]">Exit Plan</th>
                <th className="p-2 text-left min-w-[90px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {thirdParties.map((party, index) => (
                <tr key={index} className="border-t align-top">
                  <td className="p-2">
                    <input className={inputClass} value={party.thirdPartyName || ""} onChange={(e) => onThirdPartyChange(index, "thirdPartyName", e.target.value)} />
                    {errors[`thirdParties[${index}].thirdPartyName`] && <p className="text-red-500 text-xs mt-1">{errors[`thirdParties[${index}].thirdPartyName`]}</p>}
                  </td>
                  <td className="p-2">
                    <select className={inputClass} value={party.role || ""} onChange={(e) => onThirdPartyChange(index, "role", e.target.value)}>
                      {thirdPartyRoles.map((option) => <option key={option || "blank"} value={option}>{option || "Select"}</option>)}
                    </select>
                    {errors[`thirdParties[${index}].role`] && <p className="text-red-500 text-xs mt-1">{errors[`thirdParties[${index}].role`]}</p>}
                  </td>
                  <td className="p-2"><textarea rows={2} className={inputClass} value={party.purposeOfSharing || ""} onChange={(e) => onThirdPartyChange(index, "purposeOfSharing", e.target.value)} /></td>
                  <td className="p-2"><textarea rows={2} className={inputClass} value={party.dataShared || ""} onChange={(e) => onThirdPartyChange(index, "dataShared", e.target.value)} /></td>
                  <td className="p-2"><textarea rows={2} className={inputClass} value={party.processingPerformed || ""} onChange={(e) => onThirdPartyChange(index, "processingPerformed", e.target.value)} /></td>
                  <td className="p-2"><input className={inputClass} value={party.countryOfProcessing || ""} onChange={(e) => onThirdPartyChange(index, "countryOfProcessing", e.target.value)} /></td>
                  <td className="p-2">
                    <select className={inputClass} value={party.crossBorderTransfer || ""} onChange={(e) => onThirdPartyChange(index, "crossBorderTransfer", e.target.value)}>
                      {yesNoOptions.map((option) => <option key={option || "blank"} value={option}>{option || "Select"}</option>)}
                    </select>
                  </td>
                  <td className="p-2"><input className={inputClass} value={party.transferMechanism || ""} onChange={(e) => onThirdPartyChange(index, "transferMechanism", e.target.value)} /></td>
                  <td className="p-2">
                    <select className={inputClass} value={party.dpaAvailable || ""} onChange={(e) => onThirdPartyChange(index, "dpaAvailable", e.target.value)}>
                      {yesNoOptions.map((option) => <option key={option || "blank"} value={option}>{option || "Select"}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <select className={inputClass} value={party.securityAssessmentCompleted || ""} onChange={(e) => onThirdPartyChange(index, "securityAssessmentCompleted", e.target.value)}>
                      {yesNoOptions.map((option) => <option key={option || "blank"} value={option}>{option || "Select"}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <select className={inputClass} value={party.vendorRiskRating || ""} onChange={(e) => onThirdPartyChange(index, "vendorRiskRating", e.target.value)}>
                      {riskRatings.map((option) => <option key={option || "blank"} value={option}>{option || "Select"}</option>)}
                    </select>
                  </td>
                  <td className="p-2"><textarea rows={2} className={inputClass} value={party.subProcessors || ""} onChange={(e) => onThirdPartyChange(index, "subProcessors", e.target.value)} /></td>
                  <td className="p-2"><input className={inputClass} value={party.breachNotificationSla || ""} onChange={(e) => onThirdPartyChange(index, "breachNotificationSla", e.target.value)} /></td>
                  <td className="p-2">
                    <select className={inputClass} value={party.dataReturnDeletionClause || ""} onChange={(e) => onThirdPartyChange(index, "dataReturnDeletionClause", e.target.value)}>
                      {yesNoOptions.map((option) => <option key={option || "blank"} value={option}>{option || "Select"}</option>)}
                    </select>
                  </td>
                  <td className="p-2"><textarea rows={2} className={inputClass} value={party.vendorExitPlan || ""} onChange={(e) => onThirdPartyChange(index, "vendorExitPlan", e.target.value)} /></td>
                  <td className="p-2">
                    <button type="button" className="text-red-600 text-sm" onClick={() => onRemoveThirdParty(index)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {!thirdParties.length && (
                <tr>
                  <td colSpan={16} className="p-4 text-center text-gray-500">
                    No third party added. Add a row when any external party processes, stores, receives, or supports personal data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-blue-50">
        <h3 className="text-lg font-semibold text-[#2B245C] mb-2">DPIA Workflow</h3>
        <p className="text-sm text-gray-600 mb-4">
          Use this section to track review status, responsible reviewer, approval history,
          and remediation actions before final sign-off.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Workflow Status" name="status" value={workflow.status || formData.status || "Draft"} onChange={onWorkflowChange}>
            <select
              name="status"
              value={workflow.status || formData.status || "Draft"}
              onChange={onWorkflowChange}
              className={inputClass}
            >
              {workflowStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Current / Assigned Reviewer"
            name="currentReviewer"
            value={workflow.currentReviewer}
            onChange={onWorkflowChange}
          />
          <Field
            label="Latest Workflow Comment"
            name="latestComment"
            value={workflow.latestComment}
            onChange={onWorkflowChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Field
            label="Review Steps"
            name="reviewStepsText"
            value={workflow.reviewStepsText}
            onChange={onWorkflowChange}
            textarea
          />
          <Field
            label="Remediation Actions"
            name="remediationActionsText"
            value={workflow.remediationActionsText}
            onChange={onWorkflowChange}
            textarea
          />
        </div>
      </div>
    </div>
  );
};

export default DpiaWorkflowSections;
