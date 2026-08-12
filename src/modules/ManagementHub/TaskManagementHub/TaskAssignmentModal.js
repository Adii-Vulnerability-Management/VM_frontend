import React, { useState, useEffect } from "react";
import Loader from "@/components/ui/Loader";
import Dialog from "@/components/ui/Dialog";

export default function TaskAssignmentModal({
  isOpen,
  onClose,
  task,
  employees = [],
  roles = [],
  onAssign,
  existingAssignment,
  loading = false,
}) {
  const [selections, setSelections] = useState({});

  useEffect(() => {
    const init = {};
    roles.forEach(({ key }) => {
      init[key] =
        existingAssignment?.[key]?._id?.toString?.() ||
        existingAssignment?.[key]?.toString?.() ||
        "";
    });
    setSelections(init);
  }, [roles, isOpen, existingAssignment]);

  const handleChange = (key, value) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!task) return;

    const payload = {
      ...(existingAssignment ? { assignmentId: existingAssignment._id } : {}),
      task: task._id,
      ...selections,
    };

    onAssign(payload);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Task Assignment"
      footer={
        <>
          <button
            onClick={onClose}
            className="bg-white border border-[#2B245C] text-[#2B245C] text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#2B245C] border border-[#2B245C] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-opacity-90 transition"
          >
            {existingAssignment ? "Update" : "Assign"}
          </button>
        </>
      }
    >
      {loading ? (
        <div className="p-6 text-center">
          <Loader />
        </div>
      ) : task ? (
        <div className="w-full bg-[#F2F1FB] p-2 rounded-md space-y-5">
          <p className="text-[#2B245C] font-medium text-sm">
            <span className="font-semibold">Task:</span> {task.summary}
          </p>

          {roles.map(({ key, label, designation }) => {
            const filteredEmployees = designation
              ? employees.filter((emp) => {
                  const empRoles = Array.isArray(emp.roles) ? emp.roles : [];
                  return empRoles.includes(designation);
                })
              : employees;

            return (
              <div key={key}>
                <label className="block text-[#2B245C] font-semibold mb-2">
                  {label}
                </label>
                <select
                  value={selections[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
                >
                  <option value="">{`Select ${label}`}</option>
                  {filteredEmployees.map((emp) => {
                    const fullName =
                      `${emp.first_name || ""} ${emp.last_name || ""}`.trim();
                    const displayName =
                      fullName || emp.user_name || emp.email || "Unnamed User";

                    return (
                      <option key={emp._id} value={String(emp._id)}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          })}
        </div>
      ) : null}
    </Dialog>
  );
}
