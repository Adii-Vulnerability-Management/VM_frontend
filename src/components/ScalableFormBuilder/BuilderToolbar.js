import React, { useState } from "react";

export default function BuilderToolbar({
  activeTab,
  onAddSection, // (sectionTitle: string) => void
  onAddField,
  onPreview,
  onSave,
}) {
  const [newSectionTitle, setNewSectionTitle] = useState("");

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
      <div className="flex space-x-2">
        <input
          type="text"
          className="border rounded px-3 py-2 w-64"
          placeholder={`New Section (${activeTab})`}
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAddSection(newSectionTitle.trim());
              setNewSectionTitle("");
            }
          }}
        />
        <button
          onClick={() => {
            onAddSection(newSectionTitle.trim());
            setNewSectionTitle("");
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Section
        </button>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={onAddField}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Add Field
        </button>
        <button
          onClick={onPreview}
          className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50"
        >
          Show Preview
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-[#2B245C] text-white rounded hover:bg-[#050038]"
        >
          Save Metadata
        </button>
      </div>
    </div>
  );
}
