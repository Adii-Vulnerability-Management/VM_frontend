import React, { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";

export default function TabList({
  tabs,
  activeTab,
  onSelect,
  onAdd, // (tabName: string) => void
  onRename, // (oldName: string) => void
  onDelete, // (name: string) => void
  onReorder, // (result: DropResult) => void
}) {
  const [newTabName, setNewTabName] = useState("");

  return (
    <Droppable droppableId="TAB_ROW" type="TAB" direction="horizontal">
      {(prov) => (
        <div
          ref={prov.innerRef}
          {...prov.droppableProps}
          className="flex items-center space-x-2 border-b bg-white px-4 overflow-x-auto"
        >
          {tabs.map((tab, i) => (
            <Draggable key={tab} draggableId={tab} index={i} type="TAB">
              {(dragProv) => (
                <div
                  ref={dragProv.innerRef}
                  {...dragProv.draggableProps}
                  {...dragProv.dragHandleProps}
                  className="flex items-center space-x-1"
                >
                  <button
                    onClick={() => onSelect(tab)}
                    className={`px-4 py-2 border-b-2 rounded-t-lg ${
                      activeTab === tab
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {tab}
                  </button>
                  <button onClick={() => onRename(tab)} className="text-sm">
                    ✏️
                  </button>
                  <button onClick={() => onDelete(tab)} className="text-sm">
                    🗑️
                  </button>
                </div>
              )}
            </Draggable>
          ))}

          {prov.placeholder}

          {/* New-tab input + button */}
          <input
            type="text"
            className="border rounded px-2 py-1"
            placeholder="New Tab"
            value={newTabName}
            onChange={(e) => setNewTabName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onAdd(newTabName.trim());
                setNewTabName("");
              }
            }}
          />
          <button
            className="bg-green-600 text-white px-3 py-1 rounded"
            onClick={() => {
              onAdd(newTabName.trim());
              setNewTabName("");
            }}
          >
            Add Tab
          </button>
        </div>
      )}
    </Droppable>
  );
}
