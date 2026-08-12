const flowSteps = [
  {
    key: "draft",
    title: "1. Creator prepares assessment",
    status: "Draft / Submitted",
    text: "The creator selects a business process, selects a DPIA template, answers questions, assigns reviewer/approver, and submits the assessment.",
  },
  {
    key: "review",
    title: "2. Reviewer reviews",
    status: "Review Queue",
    text: "Reviewer checks the answers, adds comments, requests remediation, or sends the assessment to the approver.",
  },
  {
    key: "approval",
    title: "3. Approver decides",
    status: "Approval Queue",
    text: "Approver reviews the completed DPIA and can approve, reject, send back, or close the assessment.",
  },
  {
    key: "logs",
    title: "4. Logs stay available",
    status: "Workflow History",
    text: "Every status movement is shown in the workflow history/logs with comment, time, and status change.",
  },
];

const DpiaFlowGuide = ({ active = "draft" }) => {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-1">
        <h3 className="text-lg font-bold text-[#2B245C]">DPIA Review & Approval Flow</h3>
        <p className="text-sm text-gray-600">
          This shows what happens after an assessment is prepared and how reviewer, approver, and logs are connected.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {flowSteps.map((step) => {
          const isActive = step.key === active;
          return (
            <div
              key={step.key}
              className={`rounded-xl border p-4 ${
                isActive ? "border-[#2B245C] bg-blue-50" : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="text-sm font-bold text-[#2B245C]">{step.title}</div>
              <div className="mt-1 inline-flex rounded-full border border-[#2B245C]/20 bg-white px-2 py-0.5 text-xs font-semibold text-[#2B245C]">
                {step.status}
              </div>
              <p className="mt-2 text-xs leading-5 text-gray-600">{step.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DpiaFlowGuide;
