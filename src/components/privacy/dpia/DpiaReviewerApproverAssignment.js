import SelectUser from "@/components/dataflow/SelectUser";

const inputClass = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2B245C] focus:outline-none focus:ring-1 focus:ring-[#2B245C]";

const getSelectedUserId = (user) => {
  if (!user) return "";
  if (typeof user === "string") return user;
  return user._id || user.id || user.value || user.userId || "";
};

const getSelectedUserName = (user) => {
  if (!user || typeof user === "string") return "";
  return (
    user.name ||
    user.fullName ||
    user.full_name ||
    user.label ||
    [user.firstName || user.first_name, user.lastName || user.last_name].filter(Boolean).join(" ") ||
    ""
  );
};

const getSelectedUserEmail = (user) => {
  if (!user || typeof user === "string") return "";
  return user.email || user.userEmail || user.mail || "";
};

const emitWorkflowChange = (onChange, name, value) => {
  onChange?.({ target: { name, value } });
};

const AssignmentDateField = ({ label, name, value, onChange, type = "date" }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className={inputClass}
    />
  </div>
);

const AssignmentTextarea = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      rows={3}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className={inputClass}
    />
  </div>
);

const UserAssignmentCard = ({
  title,
  description,
  value,
  selectedName,
  selectedEmail,
  idField,
  nameField,
  emailField,
  onChange,
  error,
}) => {
  const handleSelect = (user) => {
    const userId = getSelectedUserId(user);
    const userName = getSelectedUserName(user);
    const userEmail = getSelectedUserEmail(user);

    emitWorkflowChange(onChange, idField, userId);
    emitWorkflowChange(onChange, nameField, userName);
    emitWorkflowChange(onChange, emailField, userEmail);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-[#2B245C]">{title}</h4>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
      <SelectUser
        value={value || ""}
        onChange={handleSelect}
        className="w-full"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <div className="mt-3 rounded-lg border bg-white p-3 text-xs text-gray-600">
        <div><span className="font-semibold">Selected:</span> {selectedName || selectedEmail || value || "Not assigned"}</div>
        {selectedEmail && <div className="mt-1"><span className="font-semibold">Email:</span> {selectedEmail}</div>}
      </div>
    </div>
  );
};

const DpiaReviewerApproverAssignment = ({ workflow = {}, onChange, errors = {} }) => {
  return (
    <div className="space-y-5 rounded-xl border bg-white p-5">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-lg font-semibold text-[#2B245C]">Reviewer & Approver Assignment</h3>
        <p className="mt-1 text-sm text-gray-600">
          Choose the assigned reviewer and final approver from the user dropdown. Only the assigned reviewer can move the DPIA through review stages, and only the assigned approver can approve, reject, send back, or close the final approval.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UserAssignmentCard
          title="Assigned Reviewer"
          description="This user will see the DPIA in Review Queue and can send it to approval after review."
          value={workflow.reviewerUserId || workflow.reviewerId || ""}
          selectedName={workflow.reviewerName}
          selectedEmail={workflow.reviewerEmail}
          idField="reviewerUserId"
          nameField="reviewerName"
          emailField="reviewerEmail"
          onChange={onChange}
          error={errors["workflow.reviewerUserId"]}
        />
        <UserAssignmentCard
          title="Assigned Approver"
          description="This user will see the DPIA in Approval Queue after reviewer sends it for final approval."
          value={workflow.approverUserId || workflow.approverId || ""}
          selectedName={workflow.approverName}
          selectedEmail={workflow.approverEmail}
          idField="approverUserId"
          nameField="approverName"
          emailField="approverEmail"
          onChange={onChange}
          error={errors["workflow.approverUserId"]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AssignmentDateField
          label="Review Due Date"
          name="reviewDueDate"
          value={workflow.reviewDueDate}
          onChange={onChange}
        />
        <AssignmentDateField
          label="Approval Due Date"
          name="approvalDueDate"
          value={workflow.approvalDueDate}
          onChange={onChange}
        />
      </div>

      <AssignmentTextarea
        label="Submission / Reviewer Note"
        name="latestComment"
        value={workflow.latestComment}
        onChange={onChange}
        placeholder="Add any instruction for the reviewer/approver. This will be visible in workflow logs/comments."
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border bg-gray-50 p-3">
          <div className="text-xs uppercase text-gray-500">Current Status</div>
          <div className="mt-1 font-semibold text-[#2B245C]">{workflow.status || workflow.currentStatus || "Draft"}</div>
        </div>
        <div className="rounded-lg border bg-gray-50 p-3">
          <div className="text-xs uppercase text-gray-500">Reviewer</div>
          <div className="mt-1 text-sm font-semibold text-gray-800">{workflow.reviewerName || workflow.reviewerEmail || workflow.reviewerUserId || "Not assigned"}</div>
        </div>
        <div className="rounded-lg border bg-gray-50 p-3">
          <div className="text-xs uppercase text-gray-500">Approver</div>
          <div className="mt-1 text-sm font-semibold text-gray-800">{workflow.approverName || workflow.approverEmail || workflow.approverUserId || "Not assigned"}</div>
        </div>
      </div>
    </div>
  );
};

export default DpiaReviewerApproverAssignment;
