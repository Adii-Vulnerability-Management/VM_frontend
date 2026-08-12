import React, { useEffect, useState } from "react";

const DpiaEditForm = ({ dpia, businessProcess, onCancel, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    title: dpia?.title || dpia?.companyName || "",
  });

  useEffect(() => {
    setFormData({
      title: dpia?.title || dpia?.companyName || "",
    });
  }, [dpia]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave?.({ ...dpia, ...formData, businessProcessDetails: businessProcess });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        {businessProcess ? `Business process: ${businessProcess}` : "No business process linked."}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default DpiaEditForm;
