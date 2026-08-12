import React, { useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// utility for id generation
const genId = () => `step_${Math.random().toString(36).substring(2, 8)}`;

const DEFAULT_STEPS = [
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
];

const STEP_TYPES = [
  "action",
  "reviewer",
  "approver",
  "system",
  "assignment",
  "custom",
];

export default function WorkflowBuilder() {
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [roles, setRoles] = useState([
    "Policy Reviewer",
    "Policy Approver",
    "Employee",
  ]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null); // null means new
  const [roleInput, setRoleInput] = useState("");

  // Derived: names for selecting next steps (exclude self when editing)
  const stepOptions = useMemo(
    () => steps.map((s) => ({ id: s.id, label: s.label })),
    [steps]
  );

  const openNew = () => {
    setEditingStep({
      id: genId(),
      label: "",
      type: "action",
      assigneeRole: "",
      next: "",
    });
    setModalOpen(true);
  };

  const openEdit = (step) => {
    // shallow copy
    let copy = { ...step };
    // normalize next so UI can handle
    if (step.type === "approver") {
      if (typeof step.next === "string") {
        copy.next = { onApprove: step.next, onReject: null };
      }
    } else if (typeof step.next === "object" && step.next !== null) {
      // flatten for non-approver
      copy.next = step.next.onApprove || step.next.onReject || "";
    }
    setEditingStep(copy);
    setModalOpen(true);
  };

  const closeModal = () => {
    setEditingStep(null);
    setModalOpen(false);
  };

  const handleSaveStep = () => {
    if (!editingStep.label.trim()) return;
    setSteps((prev) => {
      const exists = prev.find((s) => s.id === editingStep.id);
      const toSave = { ...editingStep };
      // normalize `next` back to expected structure
      if (toSave.type === "approver") {
        // ensure object
        let onApprove = "";
        let onReject = "";
        if (typeof toSave.next === "object") {
          onApprove = toSave.next.onApprove || "";
          onReject = toSave.next.onReject || "";
        }
        toSave.next = {
          onApprove: onApprove || null,
          onReject: onReject || null,
        };
      } else {
        if (typeof toSave.next === "object") {
          toSave.next = toSave.next.onApprove || toSave.next.onReject || "";
        }
      }

      if (exists) {
        return prev.map((s) => (s.id === toSave.id ? toSave : s));
      }
      return [...prev, toSave];
    });
    closeModal();
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this step?")) return;
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    const reordered = Array.from(steps);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
    setSteps(reordered);
  };

  const addRole = () => {
    const r = roleInput.trim();
    if (!r || roles.includes(r)) return;
    setRoles((rList) => [...rList, r]);
    setRoleInput("");
  };

  const removeRole = (r) => {
    if (!window.confirm(`Remove role '${r}'?`)) return;
    setRoles((prev) => prev.filter((x) => x !== r));
    // also clear any step using this role
    setSteps((prev) =>
      prev.map((s) => (s.assigneeRole === r ? { ...s, assigneeRole: "" } : s))
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#2B245C]">Workflow Builder</h2>
        <button
          onClick={openNew}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add Step
        </button>
      </div>

      {/* Roles management */}
      <div className="border rounded p-4 bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold">Roles</div>
          <div className="flex gap-2">
            <input
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              placeholder="New role"
              className="border rounded px-2 py-1"
            />
            <button
              onClick={addRole}
              className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
            >
              Add Role
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <div
              key={r}
              className="bg-white border rounded px-3 py-1 flex items-center space-x-2"
            >
              <span className="text-sm">{r}</span>
              <button
                onClick={() => removeRole(r)}
                className="text-red-500 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Steps list */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="workflow">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-3"
            >
              {steps.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index}>
                  {(prov, snap) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      className={`p-4 rounded border shadow-sm bg-white flex justify-between items-center ${
                        snap.isDragging ? "ring-2 ring-indigo-500" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          {...prov.dragHandleProps}
                          className="cursor-move mr-2"
                        >
                          ☰
                        </div>
                        <div className="flex flex-col">
                          <div className="font-semibold">{step.label}</div>
                          <div className="text-xs text-gray-600 flex gap-4">
                            <div>Type: {step.type}</div>
                            {step.assigneeRole && (
                              <div>Role: {step.assigneeRole}</div>
                            )}
                            <div>
                              Next:{" "}
                              {step.type === "approver" ? (
                                <>
                                  {typeof step.next === "object" && (
                                    <span>
                                      onApprove → {step.next?.onApprove || "—"},
                                      onReject → {step.next?.onReject || "—"}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span>{step.next || "(end)"}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(step)}
                          className="text-blue-600 text-sm hover:underline"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(step.id)}
                          className="text-red-600 text-sm hover:underline"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex justify-end">
        <button
          onClick={() => {
            alert("Save Workflow to Backend");
            console.log("workflow payload:", steps);
          }}
          className="bg-[#2B245C] text-white px-5 py-2 rounded hover:bg-[#1f1a3c]"
        >
          Save Workflow
        </button>
      </div>

      {/* Step modal */}
      {isModalOpen && editingStep && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <h3 className="text-xl font-semibold mb-4">
              {steps.find((s) => s.id === editingStep.id)
                ? "Edit Step"
                : "New Step"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Label</label>
                <input
                  type="text"
                  value={editingStep.label}
                  onChange={(e) =>
                    setEditingStep((eS) => ({ ...eS, label: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Type</label>
                  <select
                    value={editingStep.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setEditingStep((eS) => {
                        let next = eS.next;
                        if (newType === "approver") {
                          if (typeof next === "string") {
                            next = { onApprove: next, onReject: null };
                          } else if (!next || typeof next === "string") {
                            next = { onApprove: "", onReject: "" };
                          }
                        } else {
                          // flatten
                          if (typeof next === "object") {
                            next = next.onApprove || next.onReject || "";
                          }
                        }
                        return { ...eS, type: newType, next };
                      });
                    }}
                    className="w-full border rounded px-3 py-2"
                  >
                    {STEP_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Assignee Role
                  </label>
                  <select
                    value={editingStep.assigneeRole || ""}
                    onChange={(e) =>
                      setEditingStep((eS) => ({
                        ...eS,
                        assigneeRole: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">(none)</option>
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Next logic */}
              <div>
                <div className="font-medium mb-1">Transition</div>
                {editingStep.type === "approver" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm">onApprove →</label>
                      <select
                        value={
                          typeof editingStep.next === "object"
                            ? editingStep.next.onApprove || ""
                            : ""
                        }
                        onChange={(e) =>
                          setEditingStep((eS) => ({
                            ...eS,
                            next: {
                              ...(typeof eS.next === "object" ? eS.next : {}),
                              onApprove: e.target.value || null,
                            },
                          }))
                        }
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="">(end)</option>
                        {stepOptions
                          .filter((o) => o.id !== editingStep.id)
                          .map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm">onReject →</label>
                      <select
                        value={
                          typeof editingStep.next === "object"
                            ? editingStep.next.onReject || ""
                            : ""
                        }
                        onChange={(e) =>
                          setEditingStep((eS) => ({
                            ...eS,
                            next: {
                              ...(typeof eS.next === "object" ? eS.next : {}),
                              onReject: e.target.value || null,
                            },
                          }))
                        }
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="">(end)</option>
                        {stepOptions
                          .filter((o) => o.id !== editingStep.id)
                          .map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm">Next Step</label>
                    <select
                      value={editingStep.next || ""}
                      onChange={(e) =>
                        setEditingStep((eS) => ({
                          ...eS,
                          next: e.target.value,
                        }))
                      }
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">(end)</option>
                      {stepOptions
                        .filter((o) => o.id !== editingStep.id)
                        .map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {/* preview of JSON-like for clarity */}
              <div className="bg-gray-100 rounded p-3 text-xs font-mono">
                {JSON.stringify(
                  { ...editingStep, next: editingStep.next },
                  null,
                  2
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStep}
                className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save Step
              </button>
            </div>

            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
