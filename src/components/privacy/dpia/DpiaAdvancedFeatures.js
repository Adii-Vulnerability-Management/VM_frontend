import { useMemo } from "react";
import SelectUser from "@/components/dataflow/SelectUser";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2B245C] focus:outline-none focus:ring-1 focus:ring-[#2B245C]";

const roleOptions = [
  "Creator",
  "Privacy Reviewer",
  "Security Reviewer",
  "Legal Reviewer",
  "Vendor Reviewer",
  "Business Owner",
  "DPO",
  "Final Approver",
  "Vendor Contact",
  "Custom",
];

const permissionOptions = [
  "View",
  "Edit",
  "Comment",
  "Upload Evidence",
  "Raise Query",
  "Respond Query",
  "Request Remediation",
  "Send To Approver",
  "Approve",
  "Reject",
  "Close",
];

const reviewStageOptions = [
  "Privacy Review",
  "Security Review",
  "Legal Review",
  "Vendor Review",
  "Business Review",
  "DPO Review",
];

const frequencyOptions = ["", "Quarterly", "Half-Yearly", "Annual", "Biennial", "On Major Change"];
const yesNoOptions = ["", "Yes", "No"];

function userId(user) {
  if (!user) return "";
  if (typeof user === "string") return user;
  return user._id || user.id || user.value || user.userId || user.user_id || user.user_uuid || "";
}

function userName(user) {
  if (!user || typeof user === "string") return "";
  return (
    user.name ||
    user.fullName ||
    user.full_name ||
    user.label ||
    [user.firstName || user.first_name, user.lastName || user.last_name].filter(Boolean).join(" ") ||
    ""
  );
}

function userEmail(user) {
  if (!user || typeof user === "string") return "";
  return user.email || user.mail || user.userEmail || user.user_email || user.emailId || user.emailAddress || "";
}

const Section = ({ title, description, children }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-[#2B245C]">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
    </div>
    {children}
  </section>
);

const Field = ({ label, children }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    {children}
  </div>
);

const PermissionsPicker = ({ selected = [], onChange }) => (
  <div className="flex flex-wrap gap-2">
    {permissionOptions.map((permission) => {
      const active = selected.includes(permission);
      return (
        <button
          key={permission}
          type="button"
          onClick={() => {
            const next = active
              ? selected.filter((item) => item !== permission)
              : [...selected, permission];
            onChange(next);
          }}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            active ? "border-[#2B245C] bg-[#2B245C] text-white" : "border-gray-300 bg-gray-50 text-gray-700"
          }`}
        >
          {permission}
        </button>
      );
    })}
  </div>
);

export default function DpiaAdvancedFeatures({
  formData,
  onFieldChange,
  onArrayChange,
  onAddArrayItem,
  onRemoveArrayItem,
  onUserSelect,
}) {
  const customRoles = Array.isArray(formData.customRoles) ? formData.customRoles : [];
  const reviewProcess = formData.customReviewProcess || {};
  const stages = Array.isArray(reviewProcess.stages) ? reviewProcess.stages : [];
  const reminders = Array.isArray(formData.reminders) ? formData.reminders : [];
  const queries = Array.isArray(formData.queryEscalations) ? formData.queryEscalations : [];
  const periodicReview = formData.periodicReview || {};
  const proactive = formData.proactiveAssessment || {};
  const collaboration = formData.collaboration || {};
  const participants = Array.isArray(collaboration.participants) ? collaboration.participants : [];
  const artefacts = Array.isArray(formData.artefacts) ? formData.artefacts : [];
  const customRoleNames = customRoles
    .map((role) => (role.role === "Custom" ? role.customRoleName : role.role))
    .map((role) => String(role || "").trim())
    .filter(Boolean);
  const duplicateRoleNames = customRoleNames.filter((role, index) => customRoleNames.indexOf(role) !== index);

  const reviewSummary = useMemo(() => {
    if (!stages.length) return "Default review path will be used.";
    return stages.map((stage, index) => `${index + 1}. ${stage.name || stage.stage || "Review"}`).join(" → ");
  }, [stages]);

  const setRoleUser = (index, user) => {
    onArrayChange("customRoles", index, "userId", userId(user));
    onArrayChange("customRoles", index, "userName", userName(user));
    onArrayChange("customRoles", index, "userEmail", userEmail(user));
  };

  const setQueryAssignee = (index, user, prefix = "assignedTo") => {
    onArrayChange("queryEscalations", index, `${prefix}UserId`, userId(user));
    onArrayChange("queryEscalations", index, `${prefix}Name`, userName(user));
    onArrayChange("queryEscalations", index, `${prefix}Email`, userEmail(user));
  };

  const setStageUser = (index, user, prefix = "assignee") => {
    onArrayChange("customReviewProcess.stages", index, `${prefix}UserId`, userId(user));
    onArrayChange("customReviewProcess.stages", index, `${prefix}Name`, userName(user));
    onArrayChange("customReviewProcess.stages", index, `${prefix}Email`, userEmail(user));
  };

  const setParticipant = (index, user) => {
    const next = [...participants];
    next[index] = {
      ...(next[index] || {}),
      userId: userId(user),
      name: userName(user),
      email: userEmail(user),
    };
    onFieldChange("collaboration", { ...collaboration, participants: next });
  };

  const changeParticipant = (index, field, value) => {
    const next = [...participants];
    next[index] = { ...(next[index] || {}), [field]: value };
    onFieldChange("collaboration", { ...collaboration, participants: next });
  };

  const removeParticipant = (index) => {
    onFieldChange("collaboration", {
      ...collaboration,
      participants: participants.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <h2 className="text-xl font-bold text-[#2B245C]">Advanced DPIA Governance Features <span className="text-xs font-semibold text-green-700">V47 active</span></h2>
        <p className="mt-1 text-sm text-gray-700">
          Configure optional governance automation. Reviewer/Approver remain the main workflow owners; roles/stages/queries/collaborators add automation, evidence and follow-up control.
        </p>
      </div>

      <Section title="1. Custom Roles & Permissions" description="Create assessment-level role-to-user mappings. One role = one assigned user. These are stored inside this DPIA only and are used by review stages.">
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          Rule: create the role here first, then select that role in a stage. Do not type role names manually in stages. Duplicate role names are not allowed.
          {duplicateRoleNames.length > 0 && <div className="mt-1 font-semibold">Duplicate role found: {duplicateRoleNames.join(", ")}</div>}
        </div>
        <div className="space-y-4">
          {customRoles.map((role, index) => (
            <div key={index} className="rounded-lg border bg-gray-50 p-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <Field label="Role">
                  <select className={inputClass} value={role.role || ""} onChange={(e) => onArrayChange("customRoles", index, "role", e.target.value)}>
                    <option value="">Select role</option>
                    {roleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Assigned User">
                  <SelectUser value={role.userId || ""} onChange={(user) => setRoleUser(index, user)} className="w-full" />
                </Field>
                <Field label="Custom Role Name">
                  <input className={inputClass} value={role.customRoleName || ""} onChange={(e) => onArrayChange("customRoles", index, "customRoleName", e.target.value)} placeholder="Only if Role = Custom" />
                </Field>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Permissions</label>
                <PermissionsPicker selected={Array.isArray(role.permissions) ? role.permissions : []} onChange={(next) => onArrayChange("customRoles", index, "permissions", next)} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{role.userName || role.userEmail || role.userId || "No user selected"}</span>
                <button type="button" onClick={() => onRemoveArrayItem("customRoles", index)} className="text-red-600">Remove role</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => onAddArrayItem("customRoles", { role: "Privacy Reviewer", permissions: ["View", "Comment", "Send To Approver"] })} className="rounded-md bg-[#2B245C] px-4 py-2 text-sm text-white">Add Role</button>
        </div>
      </Section>

      <Section title="2. Automated Review Stages, SLA & Escalation" description="Build only review stages here. Do not add Pending Approval as a stage; final approval is handled by the Assigned Approver field and appears in Approval Queue.">
        <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-gray-700">
          <div className="font-semibold text-[#2B245C]">Automation path</div>
          <div className="mt-1">{reviewSummary}</div>
          <div className="mt-2 text-xs text-gray-600">Tip: Owner Role should match a Custom Role above. The role user becomes the stage assignee and sees the DPIA in Review Queue. Select a direct assignee only when you want to override the role user.</div>
        </div>
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={index} className="rounded-lg border bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-bold text-[#2B245C]">Stage {index + 1}</div>
                <button type="button" onClick={() => onRemoveArrayItem("customReviewProcess.stages", index)} className="text-sm text-red-600">Remove stage</button>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <Field label="Stage Name">
                  <select className={inputClass} value={stage.name || ""} onChange={(e) => onArrayChange("customReviewProcess.stages", index, "name", e.target.value)}>
                    <option value="">Select stage</option>
                    {reviewStageOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Owner Role (dropdown from Custom Roles)">
                  <select
                    className={inputClass}
                    value={stage.ownerRole || ""}
                    onChange={(e) => {
                      onArrayChange("customReviewProcess.stages", index, "ownerRole", e.target.value);
                      // Keep direct assignee untouched: direct assignee is an intentional override.
                    }}
                    disabled={!customRoleNames.length}
                  >
                    <option value="">{customRoleNames.length ? "Select Owner Role" : "Create custom role first"}</option>
                    {customRoleNames.map((roleName) => <option key={roleName} value={roleName}>{roleName}</option>)}
                  </select>
                </Field>
                <Field label="Direct Assignee Override (optional)">
                  <SelectUser value={stage.assigneeUserId || ""} onChange={(user) => setStageUser(index, user, "assignee")} className="w-full" />
                  <p className="mt-1 text-xs text-gray-500">Leave empty for normal flow. Backend will use the user selected in the Owner Role above. Direct Assignee is only an override.</p>
                </Field>
                <Field label="SLA Days">
                  <input className={inputClass} type="number" min="0" value={stage.slaDays || ""} onChange={(e) => onArrayChange("customReviewProcess.stages", index, "slaDays", e.target.value)} placeholder="3" />
                </Field>
                <Field label="Reminder Before Due Date">
                  <input className={inputClass} type="number" min="0" value={stage.reminderBeforeDays || ""} onChange={(e) => onArrayChange("customReviewProcess.stages", index, "reminderBeforeDays", e.target.value)} placeholder="1" />
                </Field>
                <Field label="Escalate After Overdue Days">
                  <input className={inputClass} type="number" min="0" value={stage.escalationAfterDays || ""} onChange={(e) => onArrayChange("customReviewProcess.stages", index, "escalationAfterDays", e.target.value)} placeholder="1" />
                </Field>
                <Field label="Manual Due Date Override">
                  <input className={inputClass} type="date" value={stage.dueDate || ""} onChange={(e) => onArrayChange("customReviewProcess.stages", index, "dueDate", e.target.value)} />
                </Field>
                <Field label="Escalation Owner">
                  <SelectUser value={stage.escalationOwnerUserId || ""} onChange={(user) => setStageUser(index, user, "escalationOwner")} className="w-full" />
                </Field>
                <Field label="Stage Status">
                  <select className={inputClass} value={stage.status || "Not Started"} onChange={(e) => onArrayChange("customReviewProcess.stages", index, "status", e.target.value)}>
                    <option>Not Started</option><option>In Progress</option><option>Completed</option><option>Skipped</option>
                  </select>
                </Field>
              </div>
              <div className="mt-3 rounded-md bg-white p-3 text-xs text-gray-600">
                Stage user: {stage.assigneeName || stage.assigneeEmail || stage.assigneeUserId || `User from role: ${stage.ownerRole || "not selected"}`} | SLA: {stage.slaDays || "default"} day(s) | Due: {stage.dueDate || "auto-calculated on submit/start"}
              </div>
            </div>
          ))}
          <button type="button" onClick={() => onAddArrayItem("customReviewProcess.stages", { name: "Privacy Review", ownerRole: customRoleNames[0] || "", slaDays: 3, reminderBeforeDays: 1, escalationAfterDays: 1, status: "Not Started" })} className="rounded-md bg-[#2B245C] px-4 py-2 text-sm text-white">Add Review Stage</button>
        </div>
      </Section>

      <Section title="3. Auto-Reminders" description="Configure reminders that can be used by due-date jobs or notification services.">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Reminder Before Due Date (days)"><input type="number" className={inputClass} value={formData.reminderConfig?.reminderBeforeDays || ""} onChange={(e) => onFieldChange("reminderConfig", { ...(formData.reminderConfig || {}), reminderBeforeDays: e.target.value })} /></Field>
          <Field label="Overdue Repeat Every (days)"><input type="number" className={inputClass} value={formData.reminderConfig?.overdueRepeatDays || ""} onChange={(e) => onFieldChange("reminderConfig", { ...(formData.reminderConfig || {}), overdueRepeatDays: e.target.value })} /></Field>
          <Field label="Escalate After (days)"><input type="number" className={inputClass} value={formData.reminderConfig?.escalationAfterDays || ""} onChange={(e) => onFieldChange("reminderConfig", { ...(formData.reminderConfig || {}), escalationAfterDays: e.target.value })} /></Field>
        </div>
        <div className="mt-4 rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
          Generated reminders: {reminders.length ? reminders.map((item) => `${item.type}: ${item.dueDate}`).join(" | ") : "No reminder generated yet. Review/approval/periodic due dates will generate reminders on submit."}
        </div>
      </Section>

      <Section title="4. Stage-wise Query Escalation & Follow-ups" description="Queries are attached to the active review stage. Query assignee can answer. Current stage assignee closes the query after checking the answer.">
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-gray-700">
          Rule: every query must be linked to a review stage. Open queries block only that stage movement. Escalation owner is notified only if the query is overdue.
        </div>
        <div className="space-y-4">
          {queries.map((query, index) => (
            <div key={index} className="rounded-lg border bg-gray-50 p-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <Field label="Stage">
                  <select
                    className={inputClass}
                    value={query.stageName || query.stage || ""}
                    onChange={(e) => {
                      const selectedStageIndex = stages.findIndex((stage) => String(stage.name || "") === e.target.value);
                      const selectedStage = selectedStageIndex >= 0 ? stages[selectedStageIndex] : {};
                      onArrayChange("queryEscalations", index, "stageName", e.target.value);
                      onArrayChange("queryEscalations", index, "stage", e.target.value);
                      onArrayChange("queryEscalations", index, "stageId", selectedStage.id || `stage-${selectedStageIndex + 1}` || "");
                      onArrayChange("queryEscalations", index, "stageIndex", selectedStageIndex >= 0 ? selectedStageIndex : undefined);
                    }}
                    disabled={!stages.length}
                  >
                    <option value="">{stages.length ? "Select stage for this query" : "Create review stage first"}</option>
                    {stages.map((stage, stageIndex) => <option key={stage.id || stageIndex} value={stage.name || ""}>{stage.name || `Stage ${stageIndex + 1}`}</option>)}
                  </select>
                </Field>
                <Field label="Query Title"><input className={inputClass} value={query.title || ""} onChange={(e) => onArrayChange("queryEscalations", index, "title", e.target.value)} /></Field>
                <Field label="Priority"><select className={inputClass} value={query.priority || "Medium"} onChange={(e) => onArrayChange("queryEscalations", index, "priority", e.target.value)}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></Field>
                <Field label="Due Date"><input type="date" className={inputClass} value={query.dueDate || ""} onChange={(e) => onArrayChange("queryEscalations", index, "dueDate", e.target.value)} /></Field>
                <Field label="Assigned To"><SelectUser value={query.assignedToUserId || ""} onChange={(user) => setQueryAssignee(index, user, "assignedTo")} className="w-full" /></Field>
                <Field label="Escalation Owner"><SelectUser value={query.escalationOwnerUserId || ""} onChange={(user) => setQueryAssignee(index, user, "escalationOwner")} className="w-full" /></Field>
                <Field label="Status"><select className={inputClass} value={query.status || "Open"} onChange={(e) => onArrayChange("queryEscalations", index, "status", e.target.value)}><option>Open</option><option>Answered</option><option>Closed</option><option>Escalated</option></select></Field>
              </div>
              <Field label="Query Details"><textarea rows={3} className={inputClass} value={query.description || ""} onChange={(e) => onArrayChange("queryEscalations", index, "description", e.target.value)} /></Field>
              <div className="mt-3 text-right"><button type="button" onClick={() => onRemoveArrayItem("queryEscalations", index)} className="text-sm text-red-600">Remove query</button></div>
            </div>
          ))}
          <button
            type="button"
            disabled={!stages.length}
            onClick={() => onAddArrayItem("queryEscalations", { stageName: "", stageId: "", stageIndex: undefined, title: "", priority: "Medium", status: "Open", followUps: [] })}
            className={`rounded-md px-4 py-2 text-sm text-white ${stages.length ? "bg-[#2B245C]" : "cursor-not-allowed bg-gray-400"}`}
          >
            Add Stage-wise Query
          </button>
          {!stages.length && <p className="mt-2 text-xs text-red-600">Create at least one Review Stage before adding a query.</p>}
        </div>
      </Section>

      <Section title="5. Document Upload & Artefact Attachments" description="Link supporting evidence to the overall DPIA or to a specific query/vendor review.">
        <div className="space-y-3">
          {artefacts.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-lg border bg-gray-50 p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <input className={inputClass} value={item.name || ""} onChange={(e) => onArrayChange("artefacts", index, "name", e.target.value)} placeholder="Artefact name" />
              <select className={inputClass} value={item.type || "Evidence"} onChange={(e) => onArrayChange("artefacts", index, "type", e.target.value)}><option>Evidence</option><option>Vendor DPA</option><option>Security Report</option><option>Architecture Diagram</option><option>Policy</option><option>Query Response</option></select>
              <input className={inputClass} value={item.reference || ""} onChange={(e) => onArrayChange("artefacts", index, "reference", e.target.value)} placeholder="Link/reference/query id" />
              <button type="button" onClick={() => onRemoveArrayItem("artefacts", index)} className="rounded-md border px-3 py-2 text-sm text-red-600">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => onAddArrayItem("artefacts", { name: "", type: "Evidence", reference: "" })} className="rounded-md bg-[#2B245C] px-4 py-2 text-sm text-white">Add Artefact Reference</button>
        </div>
        <p className="mt-3 text-xs text-gray-500">File upload fields remain available in the Flow Diagram/document upload section. These references make evidence trackable against queries and review stages.</p>
      </Section>

      <Section title="6. Periodic DPIA Reviews" description="Schedule recurring reviews after approval or when the process changes.">
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Review Frequency"><select className={inputClass} value={periodicReview.frequency || ""} onChange={(e) => onFieldChange("periodicReview", { ...periodicReview, frequency: e.target.value })}>{frequencyOptions.map((option) => <option key={option || "blank"} value={option}>{option || "Select"}</option>)}</select></Field>
          <Field label="Next Review Date"><input type="date" className={inputClass} value={periodicReview.nextReviewDate || ""} onChange={(e) => onFieldChange("periodicReview", { ...periodicReview, nextReviewDate: e.target.value })} /></Field>
          <Field label="Review Owner"><SelectUser value={periodicReview.ownerUserId || ""} onChange={(user) => onFieldChange("periodicReview", { ...periodicReview, ownerUserId: userId(user), ownerName: userName(user), ownerEmail: userEmail(user) })} className="w-full" /></Field>
          <Field label="Review Required on Change"><select className={inputClass} value={periodicReview.reviewOnChange || ""} onChange={(e) => onFieldChange("periodicReview", { ...periodicReview, reviewOnChange: e.target.value })}>{yesNoOptions.map((option) => <option key={option || "blank"} value={option}>{option || "Select"}</option>)}</select></Field>
        </div>
      </Section>

      <Section title="7. Proactive DPIA Initiation" description="Capture rules that justify automatically starting a DPIA for a new process/change.">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Trigger Source"><input className={inputClass} value={proactive.triggerSource || ""} onChange={(e) => onFieldChange("proactiveAssessment", { ...proactive, triggerSource: e.target.value })} placeholder="BPA / Change Request / New Vendor" /></Field>
          <Field label="High-Risk Processing"><select className={inputClass} value={proactive.highRiskProcessing || ""} onChange={(e) => onFieldChange("proactiveAssessment", { ...proactive, highRiskProcessing: e.target.value })}>{yesNoOptions.map((option) => <option key={option || "blank"} value={option}>{option || "Select"}</option>)}</select></Field>
          <Field label="Auto Initiate DPIA"><select className={inputClass} value={proactive.autoInitiate || ""} onChange={(e) => onFieldChange("proactiveAssessment", { ...proactive, autoInitiate: e.target.value })}>{yesNoOptions.map((option) => <option key={option || "blank"} value={option}>{option || "Select"}</option>)}</select></Field>
        </div>
        <Field label="Trigger Reason / Rule"><textarea rows={3} className={inputClass} value={proactive.triggerReason || ""} onChange={(e) => onFieldChange("proactiveAssessment", { ...proactive, triggerReason: e.target.value })} placeholder="Example: sensitive data + third-party sharing + cross-border transfer" /></Field>
      </Section>

      <Section title="8. Vendor & Internal Team Collaboration" description="Invite vendors/internal teams and define what they can see or submit.">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Vendor Collaboration"><select className={inputClass} value={collaboration.vendorCollaborationEnabled || ""} onChange={(e) => onFieldChange("collaboration", { ...collaboration, vendorCollaborationEnabled: e.target.value })}>{yesNoOptions.map((option) => <option key={option || "blank"} value={option}>{option || "Select"}</option>)}</select></Field>
          <Field label="Internal Team Collaboration"><select className={inputClass} value={collaboration.internalTeamCollaborationEnabled || ""} onChange={(e) => onFieldChange("collaboration", { ...collaboration, internalTeamCollaborationEnabled: e.target.value })}>{yesNoOptions.map((option) => <option key={option || "blank"} value={option}>{option || "Select"}</option>)}</select></Field>
          <Field label="Vendor Restricted View"><select className={inputClass} value={collaboration.vendorRestrictedView || ""} onChange={(e) => onFieldChange("collaboration", { ...collaboration, vendorRestrictedView: e.target.value })}>{yesNoOptions.map((option) => <option key={option || "blank"} value={option}>{option || "Select"}</option>)}</select></Field>
        </div>
        <div className="mt-4 space-y-3">
          {participants.map((participant, index) => (
            <div key={index} className="grid gap-3 rounded-lg border bg-gray-50 p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <SelectUser value={participant.userId || ""} onChange={(user) => setParticipant(index, user)} className="w-full" />
              <select className={inputClass} value={participant.type || "Internal"} onChange={(e) => changeParticipant(index, "type", e.target.value)}><option>Internal</option><option>Vendor</option><option>Legal</option><option>Security</option><option>Business</option></select>
              <select className={inputClass} value={participant.access || "Comment + Upload"} onChange={(e) => changeParticipant(index, "access", e.target.value)}><option>Read Only</option><option>Comment</option><option>Upload Evidence</option><option>Comment + Upload</option></select>
              <button type="button" onClick={() => removeParticipant(index)} className="rounded-md border px-3 py-2 text-sm text-red-600">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => onFieldChange("collaboration", { ...collaboration, participants: [...participants, { type: "Internal", access: "Comment + Upload" }] })} className="rounded-md bg-[#2B245C] px-4 py-2 text-sm text-white">Add Collaborator</button>
        </div>
      </Section>
    </div>
  );
}
