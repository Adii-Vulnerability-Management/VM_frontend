import React, { useState,useEffect } from 'react';
import { FiEdit, FiTrash } from 'react-icons/fi'; 
// Use the components in your JSX
const textlist = () => {
  return (
    <div>
    </div>
  );
};

export default textlist;


export const ReferanceDocumentList = ({ data, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [listItems, setListItems] = useState(data || []);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    // Notify parent with initial data on component mount
    onChange(listItems);
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddButtonClick = () => {
    if (inputValue.trim() !== '') {
      const updatedList = [...listItems];
      if (editIndex !== null) {
        updatedList[editIndex] = inputValue.trim();
        setEditIndex(null);
      } else {
        updatedList.push(inputValue.trim());
      }
      setListItems(updatedList);
      setInputValue('');
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
    setEditIndex(null);
    setInputValue('');
    onChange(updatedList); // Notify parent of changes
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Reference Data Box */}
        <div className="my-1">
          <label className="font-bold">Reference Documentation</label>
          <textarea
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
            rows={2}
            placeholder="Type something..."
            value={inputValue}
            onChange={handleInputChange}
          ></textarea>
          <button
            className={`mt-3 px-4 py-2 rounded text-white ${editIndex !== null ? 'bg-green-500' : 'bg-blue-500'}`}
            onClick={handleAddButtonClick}
          >
            {editIndex !== null ? 'Update' : 'Add'}
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


export const CommentsList = ({ data, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [listItems, setListItems] = useState(data || []);
  const [editIndex, setEditIndex] = useState(null);
 
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
 
  const handleAddButtonClick = () => {
    if (inputValue.trim() !== '') {
      const updatedList = [...listItems];
      if (editIndex !== null) {
        updatedList[editIndex] = inputValue.trim();
        setEditIndex(null);
      } else {
        updatedList.push(inputValue.trim());
      }
      setListItems(updatedList);
      setInputValue('');
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
      setInputValue('');
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
            className={`mt-3 px-4 py-2 rounded text-white ${editIndex !== null ? 'bg-green-500' : 'bg-blue-500'}`}
            onClick={handleAddButtonClick}
          >
            {editIndex !== null ? 'Update' : 'Add'}
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

export const FindingsList = ({ data, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [listItems, setListItems] = useState(data || []);
  const [editIndex, setEditIndex] = useState(null);
 
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
 
  const handleAddButtonClick = () => {
    if (inputValue.trim() !== '') {
      const updatedList = [...listItems];
      if (editIndex !== null) {
        updatedList[editIndex] = inputValue.trim();
        setEditIndex(null);
      } else {
        updatedList.push(inputValue.trim());
      }
      setListItems(updatedList);
      setInputValue('');
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
      setInputValue('');
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
            className={`mt-3 px-4 py-2 rounded text-white ${editIndex !== null ? 'bg-green-500' : 'bg-[#007ACC] hover:bg-[#005A99] active:bg-[#004F8A]'}`}
            onClick={handleAddButtonClick}
          >
            {editIndex !== null ? 'Update' : 'Add'}
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
