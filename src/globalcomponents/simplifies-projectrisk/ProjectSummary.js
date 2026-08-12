import { useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

export default function ProjectSummary(){
    const [threats, setThreats] = useState([]);
  const [newThreat, setNewThreat] = useState({
    name: "",
    number: "",
    review:"",
    phase1Closure:"",
    FeasibilityClosure: "" ,
  });
  const [editIndex, setEditIndex] = useState(null);

  const handleAddOrUpdateThreat = () => {
      if (editIndex !== null) {
        const updatedThreats = [...threats];
        updatedThreats[editIndex] = { ...newThreat, id: editIndex + 1 };
        setThreats(updatedThreats);
        setEditIndex(null);
      } else {
        setThreats([...threats, { ...newThreat, id: threats.length + 1 }]);
      }
      setNewThreat({
        name: "",
        number: "",
        review:"",
        phase1Closure:"",
        FeasibilityClosure: "" ,
      });
    };

  const handleEdit = (index) => {
    setNewThreat(threats[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    setThreats(threats.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 font-sans">
      <h2 className="text-2xl font-bold mb-4">Project Summary and Status</h2>

      {/* Form Section */}
      
      
      <div className="p-4 border border-gray-300 rounded bg-gray-100 mb-6 ">
        <h3 className="text-lg font-semibold mb-2">Add or Edit </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project Name & Product */}
        <div>
            <label className="block font-medium mb-1">Project Name & Product</label>
            <input type="text"
              className="w-full border border-gray-300 rounded p-2"
              value={newThreat.name}
              onChange={(e) =>
                setNewThreat({ ...newThreat, name: e.target.value })
              }
            ></input>
        </div>
          
          {/* Enovia Number  */}
          <div>
            <label className="block font-medium mb-1">Enovia Number</label>
            <input type="text"
              className="w-full border border-gray-300 rounded p-2"
              value={newThreat.number}
              onChange={(e) =>
                setNewThreat({ ...newThreat, number: e.target.value })
              }
            ></input>
         </div>
          
          {/* Gate Review */}
          <div>
            <label className="block font-medium mb-1">Gate Review</label>
            <input type="text"
              className="w-full border border-gray-300 rounded p-2"
              value={newThreat.review}
              onChange={(e) =>
                setNewThreat({ ...newThreat, review: e.target.value })
              }
            ></input>
          </div>

          {/* Phase 1 Closure */}
          <div>
            <label className="block font-medium mb-1">Phase 1 Closure</label>
            <input type="text"
              className="w-full border border-gray-300 rounded p-2"
              value={newThreat.phase1Closure}
              onChange={(e) =>
                setNewThreat({ ...newThreat, phase1Closure: e.target.value })
              }
            ></input>
          </div>

          {/* Feasibility Closure */}
          <div>
            <label className="block font-medium mb-1">Feasibility Closure</label>
            <input type="text"
              className="w-full border border-gray-300 rounded p-2"
              value={newThreat.FeasibilityClosure}
              onChange={(e) =>
                setNewThreat({ ...newThreat, FeasibilityClosure: e.target.value })
              }
            ></input>
          </div>
          
        </div>

        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleAddOrUpdateThreat}
        >
          {editIndex !== null ? "Update Threat" : "Add Threat"}
        </button>
      </div>

      {/* Threats Table */}
      <h3 className="text-lg font-semibold mb-2">Project Summary and Status</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">#</th>
              <th className="border border-gray-300 px-4 py-2">Project Name & Product</th>
              <th className="border border-gray-300 px-4 py-2">Enovia Number</th>
              <th className="border border-gray-300 px-4 py-2">Gate Review</th>
              <th className="border border-gray-300 px-4 py-2">Phase 1 Closure</th>
              <th className="border border-gray-300 px-4 py-2">Feasibility Closure</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {threats.map((threat, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="border px-4 py-2">{threat.id}</td>
                <td className="border px-4 py-2">{threat.name}</td>
                <td className="border px-4 py-2">{threat.number}</td>
                <td className="border px-4 py-2">{threat.review}</td>
                <td className="border px-4 py-2">{threat.phase1Closure}</td>
                <td className="border px-4 py-2">{threat.FeasibilityClosure}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 flex items-center"
                  >
                    <FaEdit className="mr-1" /> 
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex items-center"
                  >
                    <FaTrashAlt className="mr-1" /> 
                  </button>
                </td>
              </tr>
            ))}
            {threats.length === 0 && (
              <tr>
                <td
                  colSpan="14"
                  className="text-center text-gray-500 py-4 border"
                >
                  No threats found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );  
} 
