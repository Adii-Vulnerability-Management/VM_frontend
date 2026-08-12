"use client";
// RiskWorkflowBuilder.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  FaPlus,
  FaSave,
  FaDownload,
  FaUpload,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaCopy,
  FaGripVertical,
  FaChevronRight,
  FaArrowRight,
  FaProjectDiagram,
  FaFileImport,
  FaUserCheck,
  FaUserCog,
  FaServer,
  FaCalculator,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaCogs,
} from "react-icons/fa";

/** ----------------------------------------------------------------
 *  THEME + CONSTANTS
 *  ---------------------------------------------------------------- */
const DEFAULT_PRIMARY = "#2B245C"; // your brand
const ACCENT_OK = "#10B981";
const ACCENT_WARN = "#F59E0B";
const ACCENT_INFO = "#3B82F6";
const ACCENT_REJECT = "#EF4444";

const CONNECTOR_STYLES = ["solid", "dashed", "dotted"];
const BOX_SHAPES = [
  { key: "rounded", className: "rounded-xl" },
  { key: "pill", className: "rounded-full" },
  { key: "square", className: "rounded-md" },
];

const STEP_TYPES = ["action", "reviewer", "approver", "system", "custom"];
const TYPE_META = {
  action: {
    color: ACCENT_INFO,
    icon: <FaCogs className="w-4 h-4" />,
  },
  reviewer: {
    color: ACCENT_WARN,
    icon: <FaUserCog className="w-4 h-4" />,
  },
  approver: {
    color: ACCENT_OK,
    icon: <FaUserCheck className="w-4 h-4" />,
  },
  system: {
    color: "#64748B",
    icon: <FaServer className="w-4 h-4" />,
  },
  custom: {
    color: "#8B5CF6",
    icon: <FaFileImport className="w-4 h-4" />,
  },
};

// utility for id generation
const genId = () => `step_${Math.random().toString(36).substring(2, 8)}`;

// initial metadata (replace with real fetch)
const FORM_METADATA = [
  { id: "f1", name: "Asset Details Form" },
  { id: "f2", name: "Advanced Asset Form" },
  { id: "f3", name: "Risk Calculation Form" },
];

// placeholder API functions
const fetchApprovers = async () => [
  "alice@example.com",
  "bob@example.com",
  "carol@example.com",
];
const fetchReviewers = async () => [
  "dan@example.com",
  "eva@example.com",
  "frank@example.com",
];

const DEFAULT_STEPS = [
  { id: "add_asset", label: "Add Asset", type: "action", next: "asset_review" },
  {
    id: "asset_review",
    label: "Asset Review",
    type: "reviewer",
    assignees: [], // will load
    next: "asset_approval",
  },
  {
    id: "asset_approval",
    label: "Asset Approval",
    type: "approver",
    assignees: [], // will load
    next: { onApprove: "activate_asset", onReject: "asset_review" },
  },
  {
    id: "activate_asset",
    label: "Activate Asset",
    type: "system",
    next: "risk_assessment",
  },
  {
    id: "risk_assessment",
    label: "Risk Calculation",
    type: "custom",
    formId: "f3",
    next: "risk_review",
  },
  {
    id: "risk_review",
    label: "Risk Review",
    type: "reviewer",
    assignees: [],
    next: "risk_approval",
  },
  {
    id: "risk_approval",
    label: "Risk Approval",
    type: "approver",
    assignees: [],
    next: { onApprove: null, onReject: "risk_review" },
  },
];

/** ----------------------------------------------------------------
 *  SMALL UTILS
 *  ---------------------------------------------------------------- */
const cx = (...c) => c.filter(Boolean).join(" ");
const getTypeMeta = (type) => TYPE_META[type] || TYPE_META.action;
const toCssBorder = (style) =>
  style === "solid"
    ? "border-solid"
    : style === "dashed"
    ? "border-dashed"
    : "border-dotted";

/** ----------------------------------------------------------------
 *  MAIN
 *  ---------------------------------------------------------------- */
export default function RiskWorkflowBuilder() {
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Customization
  const [primary, setPrimary] = useState(DEFAULT_PRIMARY);
  const [connectorStyle, setConnectorStyle] = useState("solid");
  const [boxShape, setBoxShape] = useState(BOX_SHAPES[0]);
  const [compact, setCompact] = useState(false);
  const [showIds, setShowIds] = useState(false);

  const fileInputRef = useRef(null);

  // load approvers/reviewers into steps on mount
  useEffect(() => {
    async function loadUsers() {
      const [apprs, revs] = await Promise.all([
        fetchApprovers(),
        fetchReviewers(),
      ]);
      setSteps((cur) =>
        cur.map((s) => {
          if (s.type === "approver")
            return {
              ...s,
              assignees: s.assignees?.length ? s.assignees : apprs,
            };
          if (s.type === "reviewer")
            return {
              ...s,
              assignees: s.assignees?.length ? s.assignees : revs,
            };
          return s;
        })
      );
    }
    loadUsers();
  }, []);

  const stepOptions = useMemo(
    () => steps.map((s) => ({ id: s.id, label: s.label })),
    [steps]
  );

  const openNew = () =>
    setEditingStep({
      id: genId(),
      label: "",
      type: "action",
      assignees: [],
      formId: "",
      description: "",
      slaDays: "",
      slaHours: "",
      color: "",
      iconKey: "",
      next: "",
      arrows: { approveLabel: "Approve", rejectLabel: "Reject" },
    });

  const openEdit = (step) => {
    let copy = {
      arrows: {
        approveLabel: "Approve",
        rejectLabel: "Reject",
        ...(step.arrows || {}),
      },
      description: "",
      slaDays: "",
      slaHours: "",
      color: "",
      iconKey: "",
      ...step,
    };
    if (step.type === "approver") {
      copy.next =
        typeof step.next === "string"
          ? { onApprove: step.next, onReject: null }
          : {
              onApprove: step.next?.onApprove ?? null,
              onReject: step.next?.onReject ?? null,
            };
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
      let toSave = { ...editingStep };
      if (toSave.type === "approver") {
        toSave.next = {
          onApprove: toSave.next.onApprove || null,
          onReject: toSave.next.onReject || null,
        };
      } else if (typeof toSave.next === "object") {
        toSave.next = toSave.next.onApprove || toSave.next.onReject || "";
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

  const handleDuplicate = (step) => {
    const copy = {
      ...step,
      id: genId(),
      label: step.label + " (copy)",
    };
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === step.id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const onDragEnd = ({ source, destination }) => {
    if (!destination) return;
    const reordered = Array.from(steps);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
    setSteps(reordered);
  };

  // Export/Import
  const exportJson = () => {
    const file = new Blob([JSON.stringify({ steps }, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = "workflow.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importJson = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        if (obj?.steps?.length) setSteps(obj.steps);
        else alert("Invalid file.");
      } catch {
        alert("Invalid JSON.");
      }
    };
    reader.readAsText(file);
  };

  // helpers
  const getLabelById = (id) => steps.find((s) => s.id === id)?.label || "(end)";
  const borderStyle = toCssBorder(connectorStyle);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header / Controls */}
      <div
        className="rounded-2xl shadow-md p-4 mb-6 border"
        style={{
          borderColor: primary,
          background: "linear-gradient(180deg, #ffffff 0%, #fafaff 100%)",
        }}
      >
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ background: primary }}
            >
              <FaProjectDiagram />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: primary }}>
                Risk Workflow Builder
              </h2>
              <p className="text-sm text-gray-500">
                Drag steps, edit details, and preview the final flow like a
                train.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                openNew();
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-white rounded-lg"
              style={{ background: primary }}
            >
              <FaPlus /> Add Step
            </button>

            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg"
              style={{ borderColor: primary, color: primary }}
            >
              <FaEye /> Show Preview
            </button>

            <button
              onClick={() => console.log("Workflow:", steps)}
              className="inline-flex items-center gap-2 px-3 py-2 text-white rounded-lg"
              style={{ background: ACCENT_INFO }}
            >
              <FaSave /> Save (console)
            </button>

            <button
              onClick={exportJson}
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg"
            >
              <FaDownload /> Export
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg"
            >
              <FaUpload /> Import
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) importJson(e.target.files[0]);
                }}
              />
            </button>
          </div>
        </div>

        {/* Customization */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium min-w-24">Primary</label>
            <input
              type="color"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="w-10 h-10 p-0 border rounded"
              title="Primary color"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium min-w-24">Connectors</label>
            <select
              value={connectorStyle}
              onChange={(e) => setConnectorStyle(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            >
              {CONNECTOR_STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium min-w-24">Box Shape</label>
            <select
              value={boxShape.key}
              onChange={(e) =>
                setBoxShape(
                  BOX_SHAPES.find((b) => b.key === e.target.value) ||
                    BOX_SHAPES[0]
                )
              }
              className="border rounded px-2 py-1 w-full"
            >
              {BOX_SHAPES.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.key}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Compact</label>
            <input
              type="checkbox"
              checked={compact}
              onChange={(e) => setCompact(e.target.checked)}
            />
            <label className="text-sm font-medium">Show IDs</label>
            <input
              type="checkbox"
              checked={showIds}
              onChange={(e) => setShowIds(e.target.checked)}
            />
          </div>
        </div>
      </div>

      {/* Steps List (DnD) */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="wf">
          {(prov) => (
            <div
              ref={prov.innerRef}
              {...prov.droppableProps}
              className="space-y-3 min-h-[12px]"
            >
              {steps.map((step, idx) => (
                <Draggable key={step.id} draggableId={step.id} index={idx}>
                  {(p) => {
                    const meta = getTypeMeta(step.type);
                    const leftBar = step.color || meta.color;
                    return (
                      <div
                        ref={p.innerRef}
                        {...p.draggableProps}
                        {...p.dragHandleProps}
                        className={cx(
                          "border bg-white shadow-sm flex justify-between items-center",
                          "p-4 rounded-xl"
                        )}
                        style={{
                          borderLeft: `6px solid ${leftBar}`,
                          ...p.draggableProps.style, // <-- critical for movement
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="cursor-grab active:cursor-grabbing mt-1 text-gray-500"
                            title="Drag to reorder"
                          >
                            <FaGripVertical />
                          </span>
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-lg"
                            style={{ background: `${leftBar}1A` }}
                          >
                            {step.iconKey ? (
                              <DynamicIcon name={step.iconKey} />
                            ) : (
                              meta.icon
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              {step.label}
                              {showIds && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                  {step.id}
                                </span>
                              )}
                            </div>
                            <div
                              className={cx(
                                "text-sm text-gray-600",
                                compact && "hidden md:block"
                              )}
                            >
                              <div className="flex flex-wrap gap-x-3 gap-y-1">
                                <span>
                                  Type: <b>{step.type}</b>
                                </span>
                                {step.formId && (
                                  <span>
                                    Form:{" "}
                                    {FORM_METADATA.find(
                                      (f) => f.id === step.formId
                                    )?.name || step.formId}
                                  </span>
                                )}
                                {step.assignees?.length > 0 && (
                                  <span className="truncate max-w-[36rem]">
                                    Users: {step.assignees.join(", ")}
                                  </span>
                                )}
                                {(step.slaDays || step.slaHours) && (
                                  <span className="inline-flex items-center gap-1">
                                    <FaChevronRight /> SLA: {step.slaDays || 0}d{" "}
                                    {step.slaHours || 0}h
                                  </span>
                                )}
                                {step.description && (
                                  <span className="text-gray-500 italic">
                                    {step.description}
                                  </span>
                                )}
                              </div>

                              <div className="mt-1">
                                <span className="text-gray-500">Next:</span>{" "}
                                {step.type === "approver" ? (
                                  <span>
                                    <span className="text-green-600">
                                      onApprove →{" "}
                                      {getLabelById(step.next?.onApprove)}
                                    </span>
                                    {", "}
                                    <span className="text-red-600">
                                      onReject →{" "}
                                      {getLabelById(step.next?.onReject)}
                                    </span>
                                  </span>
                                ) : (
                                  <span>
                                    {getLabelById(step.next) || "(end)"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDuplicate(step)}
                            className="p-2 rounded-lg border text-gray-600 hover:bg-gray-50"
                            title="Duplicate"
                          >
                            <FaCopy />
                          </button>
                          <button
                            onClick={() => {
                              openEdit(step);
                              setModalOpen(true);
                            }}
                            className="p-2 rounded-lg border text-blue-600 hover:bg-blue-50"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(step.id)}
                            className="p-2 rounded-lg border text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                    );
                  }}
                </Draggable>
              ))}
              {prov.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* MODAL: Edit/Create Step */}
      {isModalOpen && editingStep && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">
              {editingStep.label ? "Edit Step" : "New Step"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Label</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={editingStep.label}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, label: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={editingStep.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    let next = editingStep.next;
                    if (newType === "approver")
                      next = { onApprove: "", onReject: "" };
                    else next = "";
                    setEditingStep({ ...editingStep, type: newType, next });
                  }}
                >
                  {STEP_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {(editingStep.id === "add_asset" ||
                editingStep.type === "custom") && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Form
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={editingStep.formId || ""}
                    onChange={(e) =>
                      setEditingStep({ ...editingStep, formId: e.target.value })
                    }
                  >
                    <option value="">-- pick form --</option>
                    {FORM_METADATA.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(editingStep.type === "reviewer" ||
                editingStep.type === "approver") && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Assignees (comma-sep)
                  </label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={(editingStep.assignees || []).join(",")}
                    onChange={(e) =>
                      setEditingStep({
                        ...editingStep,
                        assignees: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                  value={editingStep.description || ""}
                  onChange={(e) =>
                    setEditingStep({
                      ...editingStep,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  SLA Days
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full border rounded px-3 py-2"
                  value={editingStep.slaDays || ""}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, slaDays: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  SLA Hours
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full border rounded px-3 py-2"
                  value={editingStep.slaHours || ""}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, slaHours: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Color Override
                </label>
                <input
                  type="color"
                  className="w-12 h-10 p-0 border rounded"
                  value={editingStep.color || "#ffffff"}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, color: e.target.value })
                  }
                  title="Override type color"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Icon (optional)
                </label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={editingStep.iconKey || ""}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, iconKey: e.target.value })
                  }
                >
                  <option value="">Auto by type</option>
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                  <option value="calc">Calc</option>
                  <option value="server">Server</option>
                  <option value="file">File</option>
                  <option value="workflow">Workflow</option>
                  <option value="usercheck">UserCheck</option>
                  <option value="usercog">UserCog</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Next Step
                </label>
                {editingStep.type === "approver" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-gray-500">onApprove</span>
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={editingStep.next.onApprove || ""}
                        onChange={(e) =>
                          setEditingStep({
                            ...editingStep,
                            next: {
                              ...editingStep.next,
                              onApprove: e.target.value || null,
                            },
                          })
                        }
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
                      <span className="text-xs text-gray-500">onReject</span>
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={editingStep.next.onReject || ""}
                        onChange={(e) =>
                          setEditingStep({
                            ...editingStep,
                            next: {
                              ...editingStep.next,
                              onReject: e.target.value || null,
                            },
                          })
                        }
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
                      <span className="text-xs text-gray-500">
                        Approve Arrow Label
                      </span>
                      <input
                        className="w-full border rounded px-3 py-2"
                        value={editingStep.arrows?.approveLabel || ""}
                        onChange={(e) =>
                          setEditingStep({
                            ...editingStep,
                            arrows: {
                              ...editingStep.arrows,
                              approveLabel: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">
                        Reject Arrow Label
                      </span>
                      <input
                        className="w-full border rounded px-3 py-2"
                        value={editingStep.arrows?.rejectLabel || ""}
                        onChange={(e) =>
                          setEditingStep({
                            ...editingStep,
                            arrows: {
                              ...editingStep.arrows,
                              rejectLabel: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={editingStep.next || ""}
                    onChange={(e) =>
                      setEditingStep({ ...editingStep, next: e.target.value })
                    }
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
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStep}
                className="px-4 py-2 text-white rounded-lg"
                style={{ background: primary }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW */}
      {showPreview && (
        <PreviewRail
          onClose={() => setShowPreview(false)}
          steps={steps}
          primary={primary}
          boxShape={boxShape}
          connectorStyle={connectorStyle}
        />
      )}
    </div>
  );
}

/** ----------------------------------------------------------------
 *  PreviewRail: “train” preview with arrows/boxes
 *  ---------------------------------------------------------------- */
function PreviewRail({ steps, onClose, primary, boxShape, connectorStyle }) {
  const borderStyle = toCssBorder(connectorStyle);
  const getLabel = (id) => steps.find((s) => s.id === id)?.label || "End";
  const trackColor = primary + "33";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
              style={{ background: primary }}
            >
              <FaEye />
            </div>
            <div>
              <div className="font-semibold">Workflow Preview</div>
              <div className="text-xs text-gray-500">
                Train-style, scrollable
              </div>
            </div>
          </div>
          <button onClick={onClose} className="px-3 py-1.5 border rounded-lg">
            Close
          </button>
        </div>

        <div className="p-6 overflow-x-auto">
          <div className="inline-flex items-center gap-6 flex-nowrap whitespace-nowrap">
            {steps.map((s, idx) => {
              const meta = getTypeMeta(s.type);
              const nodeColor = s.color || meta.color;
              return (
                <React.Fragment key={s.id}>
                  <div className="flex-shrink-0">
                    {/* Step Box */}
                    <div
                      className={cx(
                        "w-64 bg-white border shadow-sm px-4 py-3", // fixed width
                        boxShape.className
                      )}
                      style={{ borderColor: nodeColor, borderWidth: 2 }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: `${nodeColor}1A` }}
                        >
                          {s.iconKey ? (
                            <DynamicIcon name={s.iconKey} />
                          ) : (
                            meta.icon
                          )}
                        </div>
                        <div className="font-semibold">{s.label}</div>
                      </div>
                      {s.type === "approver" && (
                        <div className="mt-2 text-xs">
                          <div className="flex items-center gap-1 text-green-600">
                            <FaArrowRight />{" "}
                            {s.arrows?.approveLabel || "Approve"} →{" "}
                            {getLabel(s.next?.onApprove)}
                          </div>
                          <div className="flex items-center gap-1 text-red-600">
                            <FaTimesCircle />{" "}
                            {s.arrows?.rejectLabel || "Reject"} →{" "}
                            {getLabel(s.next?.onReject)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connector between cards */}
                  {idx < steps.length - 1 && (
                    <div className="flex-shrink-0">
                      <Arrow color={primary} borderStyle={borderStyle} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

       
        </div>
      </div>
    </div>
  );
}

/** Simple straight arrow connector */
function Arrow({ color, borderStyle, label = "" }) {
  return (
    <div className="flex items-center">
      <div
        className={`border-b w-20 ${borderStyle}`}
        style={{ borderColor: color }}
      />
      <FaChevronRight className="w-5 h-5" style={{ color }} />
      {label && (
        <span className="ml-1 text-xs" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  );
}

function BranchArrow({ color, label, offset = 0 }) {
  return (
    <div
      className="flex items-center"
      style={{ transform: `translateY(${offset}px)` }}
    >
      <FaArrowRight className="w-5 h-5" style={{ color }} />
      <span className="text-xs ml-1" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

/** Optional icon override based on a simple key */
function DynamicIcon({ name }) {
  const base = "w-4 h-4";
  switch (name) {
    case "approve":
      return <FaCheckCircle className={base} />;
    case "reject":
      return <FaTimesCircle className={base} />;
    case "calc":
      return <FaCalculator className={base} />;
    case "server":
      return <FaServer className={base} />;
    case "file":
      return <FaFileImport className={base} />;
    case "workflow":
      return <FaProjectDiagram className={base} />;
    case "usercheck":
      return <FaUserCheck className={base} />;
    case "usercog":
      return <FaUserCog className={base} />;
    default:
      return <FaCogs className={base} />;
  }
}
