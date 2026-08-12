// WorkflowExecutionSimulator.jsx
import React, { useMemo, useState, useEffect } from "react";

// Dummy workflow (your provided input)
const DUMMY_WORKFLOW = [
  { id: "upload", label: "Upload Policy", type: "action", next: "review" },
  {
    id: "review",
    label: "Review",
    type: "reviewer",
    assigneeRole: "Policy Reviewer",
    next: "approve",
  },
  {
    id: "approve",
    label: "Approval",
    type: "approver",
    assigneeRole: "Policy Approver",
    next: { onApprove: "activate", onReject: "review" },
  },
  { id: "activate", label: "Activate", type: "system", next: "assign" },
  {
    id: "assign",
    label: "Assign to Employees",
    type: "assignment",
    assigneeRole: "Employee",
  },
  {
    id: "step_0mbhd0",
    label: "AAAAAAAA",
    type: "custom",
    assigneeRole: "AAAAAAA",
    next: "assign",
  },
];

// Helper to find step definition
const findStep = (workflow, id) => workflow.find((s) => s.id === id);

// Step pill for UI
function StepPill({ step, status, isCurrent }) {
  let base =
    "flex-shrink-0 px-4 py-2 rounded-full flex items-center space-x-2 text-sm font-medium";
  if (isCurrent) base += " bg-indigo-600 text-white";
  else if (status === "completed") base += " bg-green-100 text-green-800";
  else base += " bg-gray-100 text-gray-800";
  return (
    <div className={base}>
      <div>{step.label}</div>
      <div className="ml-2 italic text-xs">({step.type})</div>
    </div>
  );
}

export default function WorkflowExecutionSimulator() {
  // Build derived roles from workflow
  const roles = useMemo(() => {
    const set = new Set();
    DUMMY_WORKFLOW.forEach((s) => {
      if (s.assigneeRole) set.add(s.assigneeRole);
    });
    // add a fallback actor for steps without role
    set.add("Any");
    return Array.from(set);
  }, []);

  // Simulated policy instance
  const [policy, setPolicy] = useState({
    title: "Sample Policy Document",
    workflowName: "dummy_policy_flow",
    currentStep: "upload",
    status: "in-progress", // could be 'in-progress' | 'active' | 'completed'
    assigneeId: null,
    history: [], // { stepId, action, byRole, timestamp, note }
  });

  const workflow = DUMMY_WORKFLOW;

  // Simulated current user role
  const [userRole, setUserRole] = useState("Policy Reviewer");

  const currentDef = useMemo(
    () => findStep(workflow, policy.currentStep),
    [policy.currentStep, workflow]
  );

  // Determine step statuses for rendering
  const stepStatusMap = useMemo(() => {
    const map = {};
    let seenCurrent = false;
    workflow.forEach((s) => {
      if (s.id === policy.currentStep) {
        map[s.id] = "current";
        seenCurrent = true;
      } else if (!seenCurrent) {
        map[s.id] = "completed";
      } else {
        map[s.id] = "pending";
      }
    });
    return map;
  }, [policy.currentStep, workflow]);

  // Check if user can act on current step
  const canAct = useMemo(() => {
    if (!currentDef) return false;
    if (currentDef.assigneeRole) {
      // exact match
      return userRole === currentDef.assigneeRole;
    }
    // no role required -> allow any selected (treat 'Any' or anything)
    return true;
  }, [currentDef, userRole]);

  // Function to advance workflow based on action
  const advance = (action) => {
    if (!currentDef) return;
    if (!canAct) return;

    const timestamp = new Date().toISOString();
    let nextId = null;
    let note = "";

    if (currentDef.type === "approver") {
      if (action === "approve") {
        nextId = currentDef.next?.onApprove;
        note = "Approved";
      } else if (action === "reject") {
        nextId = currentDef.next?.onReject;
        note = "Rejected";
      }
    } else if (
      currentDef.type === "action" ||
      currentDef.type === "reviewer" ||
      currentDef.type === "custom"
    ) {
      if (action === "complete") {
        nextId = typeof currentDef.next === "string" ? currentDef.next : null;
        note = "Completed";
      }
    } else if (currentDef.type === "assignment") {
      if (action === "assign") {
        // end of flow
        nextId = null;
        note = "Assigned to employees";
      }
    }

    setPolicy((p) => {
      const newHistory = [
        ...p.history,
        {
          stepId: currentDef.id,
          action: action,
          byRole: userRole,
          timestamp,
          note,
        },
      ];
      let newStatus = p.status;
      let newCurrent = nextId;

      // Handle system steps and status updates
      const chain = async () => {
        let chainStepId = nextId;
        let updatedHistory = [...newHistory];
        let statusAfter = newStatus;

        // If the immediate next is a system step, auto-run it
        while (chainStepId) {
          const def = findStep(workflow, chainStepId);
          if (!def) break;

          // If it's a system step, apply its logic automatically
          if (def.type === "system") {
            statusAfter = "active"; // activate on system
            updatedHistory.push({
              stepId: def.id,
              action: "auto-complete",
              byRole: "system",
              timestamp: new Date().toISOString(),
              note: "System executed",
            });
            // move pointer to its next
            chainStepId = typeof def.next === "string" ? def.next : null;
          } else {
            break; // stop chaining
          }
        }

        setPolicy((prev) => ({
          ...prev,
          currentStep: chainStepId,
          status: chainStepId === null ? "completed" : statusAfter,
          history: updatedHistory,
        }));
      };

      // If next is a system step, we delegate to chain
      const immediateNextDef = findStep(workflow, nextId);
      if (immediateNextDef?.type === "system") {
        // set interim state then process chain
        return {
          ...p,
          currentStep: immediateNextDef.id,
          status: "in-progress",
          history: newHistory,
        };
      }

      // Normal advance
      return {
        ...p,
        currentStep: nextId,
        status: nextId === null ? "completed" : p.status,
        history: newHistory,
      };
    });
  };

  // Effect to auto-handle system step when it becomes current
  useEffect(() => {
    if (!currentDef) return;
    if (currentDef.type === "system") {
      // simulate a small delay like processing
      const t = setTimeout(() => {
        // system auto action done, advance to next
        advance("auto");
      }, 500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDef?.id, userRole]);

  // Available action UI
  const renderActionControls = () => {
    if (!currentDef) return null;
    if (!canAct)
      return (
        <div className="text-sm text-red-500">
          You cannot act on this step as <strong>{userRole}</strong>.
        </div>
      );

    switch (currentDef.type) {
      case "action":
      case "reviewer":
      case "custom":
        return (
          <button
            onClick={() => advance("complete")}
            disabled={!canAct || policy.status === "completed"}
            className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Mark Complete
          </button>
        );
      case "approver":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => advance("approve")}
              className="bg-green-600 text-white px-4 py-2 rounded"
              disabled={!canAct}
            >
              Approve
            </button>
            <button
              onClick={() => advance("reject")}
              className="bg-red-500 text-white px-4 py-2 rounded"
              disabled={!canAct}
            >
              Reject
            </button>
          </div>
        );
      case "assignment":
        return (
          <button
            onClick={() => advance("assign")}
            className="bg-yellow-600 text-black px-4 py-2 rounded"
            disabled={policy.status === "completed"}
          >
            Assign
          </button>
        );
      case "system":
        return <div className="text-sm">System executing...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{policy.title}</h1>
          <div className="text-sm text-gray-600">
            Status: <strong>{policy.status}</strong> | Current Step:{" "}
            <strong>{policy.currentStep || "(none)"}</strong>
          </div>
        </div>
        <div>
          <div className="text-sm mb-1">Acting as role</div>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {workflow.map((s) => (
          <StepPill
            key={s.id}
            step={s}
            status={stepStatusMap[s.id]}
            isCurrent={stepStatusMap[s.id] === "current"}
          />
        ))}
      </div>

      {/* Current step details + actions */}
      <div className="border rounded p-4 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex-1">
          {currentDef ? (
            <>
              <div className="font-semibold text-lg">{currentDef.label}</div>
              <div className="text-sm text-gray-700">
                Type: {currentDef.type}{" "}
                {currentDef.assigneeRole && (
                  <>| Role: {currentDef.assigneeRole}</>
                )}
              </div>
            </>
          ) : (
            <div className="text-gray-700">Workflow completed.</div>
          )}
        </div>
        <div>{renderActionControls()}</div>
      </div>

      {/* History log */}
      <div className="bg-gray-100 rounded p-4">
        <div className="font-semibold mb-2">Execution History</div>
        {policy.history.length === 0 && (
          <div className="text-sm">No actions yet.</div>
        )}
        {policy.history.map((h, i) => (
          <div
            key={i}
            className="text-xs flex justify-between border-b last:border-b-0 py-1"
          >
            <div>
              <div>
                <strong>{h.stepId}</strong> - {h.note || h.action}
              </div>
              <div className="text-gray-500">
                by <em>{h.byRole}</em> at{" "}
                {new Date(h.timestamp).toLocaleTimeString()}
              </div>
            </div>
            <div className="italic text-gray-600">{h.action}</div>
          </div>
        ))}
      </div>

      {/* Raw state (for debugging) */}
      <div className="bg-white border rounded p-3 text-xs font-mono">
        <div className="mb-2">
          <div className="font-medium">Workflow Definition</div>
          <pre>{JSON.stringify(workflow, null, 2)}</pre>
        </div>
        <div>
          <div className="font-medium">Policy State</div>
          <pre>{JSON.stringify(policy, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
