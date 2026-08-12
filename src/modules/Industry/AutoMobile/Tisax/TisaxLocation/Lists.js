import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash } from "react-icons/fi";
import { toast } from "react-toastify";

export const ReferenceDocumentList = ({ data = [], onChange }) => {
  const [nameInput, setNameInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [listItems, setListItems] = useState(data);
  const [editIndex, setEditIndex] = useState(null);
  const [fileInput, setFileInput] = useState(null);
  // Notify parent of initial data
  useEffect(() => {
    onChange(listItems);
  }, []);
  const resetForm = () => {
    setNameInput("");
    setLinkInput("");
    setFileInput(null);
    setEditIndex(null);
  };

  const handleAddButtonClick = () => {
    if (!nameInput.trim() || (!linkInput.trim() && !fileInput)) {
      return toast.error("Name plus either a URL or a file is required");
    }
    const entry = {
      name: nameInput.trim(),
      link: linkInput.trim() || undefined,
      file: fileInput || undefined,
    };
    const updated = [...listItems];
    if (editIndex !== null) {
      updated[editIndex] = entry;
    } else {
      updated.push(entry);
    }
    setListItems(updated);
    onChange(updated);
    resetForm();
  };

  const handleEditButtonClick = (idx) => {
    const item = listItems[idx];
    setEditIndex(idx);
    setNameInput(item.name);
    setLinkInput(item.link || "");
    setFileInput(item.file || null);
  };

  const handleRemoveButtonClick = (idx) => {
    const updated = [...listItems];
    updated.splice(idx, 1);
    setListItems(updated);
    onChange(updated);
    resetForm();
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="font-bold block mb-2">
            Reference Documentation
          </label>
          <input
            type="text"
            placeholder="Document Name"
            className="w-full border p-2 rounded mb-2"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Document URL (https://...)"
            className="w-full border p-2 rounded mb-2"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
          />
          <input
            type="file"
            className="mb-2"
            onChange={(e) => setFileInput(e.target.files?.[0] || null)}
          />
          <button
            className={`px-4 py-2 rounded text-white ${
              editIndex !== null ? "bg-green-500" : "bg-blue-500"
            }`}
            onClick={handleAddButtonClick}
          >
            {editIndex !== null ? "Update" : "Add"}
          </button>
        </div>
      </div>

      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-left">Name</th>
            <th className="border px-4 py-2 text-left">Link / File</th>
            <th className="border px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {listItems.map((item, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{item.name}</td>
              <td className="border px-4 py-2">
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {item.link}
                  </a>
                ) : item.file ? (
                  <a
                    href={URL.createObjectURL(item.file)}
                    download={item.file.name}
                    className="text-blue-600 hover:underline"
                  >
                    {item.file.name}
                  </a>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </td>
              <td className="border px-4 py-2 text-center">
                <button
                  className="mr-2 text-green-500 hover:text-green-700"
                  onClick={() => handleEditButtonClick(idx)}
                >
                  <FiEdit className="inline" />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveButtonClick(idx)}
                >
                  <FiTrash className="inline" />
                </button>
              </td>
            </tr>
          ))}
          {listItems.length === 0 && (
            <tr>
              <td
                colSpan={3}
                className="border px-4 py-2 text-center text-gray-500"
              >
                No reference documents added
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export const CommentsList = ({ data, onChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [listItems, setListItems] = useState(data || []);
  const [editIndex, setEditIndex] = useState(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddButtonClick = () => {
    if (inputValue.trim() !== "") {
      const updatedList = [...listItems];
      if (editIndex !== null) {
        updatedList[editIndex] = inputValue.trim();
        setEditIndex(null);
      } else {
        updatedList.push(inputValue.trim());
      }
      setListItems(updatedList);
      setInputValue("");
      onChange(updatedList); // Notify parent of changes
    }
  };

  const handleEditButtonClick = (index) => {
    setEditIndex(index);
    setInputValue(listItems[index]);
  };

  const handleRemoveButtonClick = (index) => {
    const updatedList = [...listItems];
    updatedList.splice(index, 1);
    setListItems(updatedList);
    if (editIndex === index) {
      setEditIndex(null);
      setInputValue("");
    }
    onChange(updatedList); // Notify parent of changes
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Comments Data Box */}
        <div className="my-1">
          <label className="font-bold">Comments</label>
          <textarea
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
            rows={2}
            placeholder="Type something..."
            value={inputValue}
            onChange={handleInputChange}
          ></textarea>
          <button
            className={`mt-3 px-4 py-2 rounded text-white ${
              editIndex !== null ? "bg-green-500" : "bg-blue-500"
            }`}
            onClick={handleAddButtonClick}
          >
            {editIndex !== null ? "Update" : "Add"}
          </button>
        </div>

        <div className="my-4">
          <div className="overflow-auto max-h-60">
            {listItems.map((item, index) => (
              <div key={`item-${index}`} className="border p-4 mb-2 rounded-md">
                <div className="flex justify-between items-center">
                  <ul className="flex-1">
                    <li>
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.name}
                        </a>
                      ) : (
                        item.name
                      )}
                    </li>
                  </ul>
                  <div className="flex space-x-2">
                    <button
                      className="text-green-500"
                      onClick={() => handleEditButtonClick(index)}
                    >
                      <FiEdit className="h-5 w-5" />
                    </button>
                    <button
                      className="text-red-500"
                      onClick={() => handleRemoveButtonClick(index)}
                    >
                      <FiTrash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FindingsList = ({ data, onChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [listItems, setListItems] = useState(data || []);
  const [editIndex, setEditIndex] = useState(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddButtonClick = () => {
    if (inputValue.trim() !== "") {
      const updatedList = [...listItems];
      if (editIndex !== null) {
        updatedList[editIndex] = inputValue.trim();
        setEditIndex(null);
      } else {
        updatedList.push(inputValue.trim());
      }
      setListItems(updatedList);
      setInputValue("");
      onChange(updatedList); // Notify parent of changes
    }
  };

  const handleEditButtonClick = (index) => {
    setEditIndex(index);
    setInputValue(listItems[index]);
  };

  const handleRemoveButtonClick = (index) => {
    const updatedList = [...listItems];
    updatedList.splice(index, 1);
    setListItems(updatedList);
    if (editIndex === index) {
      setEditIndex(null);
      setInputValue("");
    }
    onChange(updatedList); // Notify parent of changes
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Findings Data Box */}
        <div className="my-1">
          <label className="font-bold">Findings</label>
          <textarea
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
            rows={2}
            placeholder="Type something..."
            value={inputValue}
            onChange={handleInputChange}
          ></textarea>
          <button
            className={`mt-3 px-4 py-2 rounded text-white ${
              editIndex !== null
                ? "bg-green-500"
                : "bg-[#007ACC] hover:bg-[#005A99] active:bg-[#004F8A]"
            }`}
            onClick={handleAddButtonClick}
          >
            {editIndex !== null ? "Update" : "Add"}
          </button>
        </div>

        <div className="my-4">
          <div className="overflow-auto max-h-60">
            {listItems.map((item, index) => (
              <div key={`item-${index}`} className="border p-4 mb-2 rounded-md">
                <div className="flex justify-between items-center">
                  <ul className="flex-1">
                    <li>{item}</li>
                  </ul>
                  <div className="flex space-x-2">
                    <button
                      className="text-green-500"
                      onClick={() => handleEditButtonClick(index)}
                    >
                      <FiEdit className="h-5 w-5" />
                    </button>
                    <button
                      className="text-red-500"
                      onClick={() => handleRemoveButtonClick(index)}
                    >
                      <FiTrash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
