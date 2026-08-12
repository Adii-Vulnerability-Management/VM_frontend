import { useState, useEffect  } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

export default function Phase() {
  const data = {
    "Business Plan": [
      "Does the business plan reflect the latest customer submission Quote and is it approved?",
    ],
    "Customer Timing Plan": [
      "Customer milestones and events documented? Critical path timing developed?"
    ],
    "Manufacturing Quote": [
      "Are Manufacturing assumptions documented, checked against the DFAM best practice checklist, and signed by IE  Manger."
    ],
    "Costed BOM": [
      "Costed BOM complete? "
    ],
    "DVP/TDM": [
      "Verification plan initiated and approved?"
    ],
    "Quoted BOM": [
      "Quote BOM established?"
    ],
    "Engineering Budget": [
      "Engineering budget complete approved?", "Supplier quote sheets to support customer quote in Program file?"
    ],
    "Past Problem History Roadmap": [
      "PPH Roadmap initiated?  Review of surrogate data/lessons learned with documented root cause,countermeasures and preventative actions."
    ],
    "Project ID & File": [
      "New Enovia project identification number established, program file location created and PDP Gate deliverable evidence stored?"
    ],
    "Resource Plan": [
      "All Phase 2-5 resources assigned to SDT?  If so, is the cross-functional team identified appropriate considering program complexity versus timeline?"
    ],
    "Customer Specific Requirements": [
      "Latest customer requirements reviewed and changes communicated to the  team. "
    ],
    "Lessons Learned": [
      "Lessons Learned from Phase 1 documented with information to use for future programs?"
    ],
  };

  const pdp = {
    "Does the business plan reflect the latest customer submission Quote and is it approved?": [
      "Commercial Finance Manager",
    ],
    "Customer milestones and events documented? Critical path timing developed?": [
      "Commercial Finance Manager",
    ],
    "Are Manufacturing assumptions documented, checked against the DFAM best practice checklist, and signed by IE  Manger.": [
      "Industrial Engineer",
    ],
    "Costed BOM complete?": [
      "Costing Manger",
    ],
    "Verification plan initiated and approved?": [
      "Product Engineer",
    ],
    "Quote BOM established?": [
      "Product Engineer",
    ],
    "Engineering budget complete approved?": [
      "Engineering Manager",
    ],
    "Supplier quote sheets to support customer quote in Program file?": [
      "Purchasing",
    ],
    "PPH Roadmap initiated?  Review of surrogate data/lessons learned with documented root cause,countermeasures and preventative actions.": [
      "Quality",
    ],
    "New Enovia project identification number established, program file location created and PDP Gate deliverable evidence stored?":[
      "Commercial Sales Manager"
    ],
    "All Phase 2-5 resources assigned to SDT?  If so, is the cross-functional team identified appropriate considering program complexity versus timeline?":[
      "Commercial Sales Manager"
    ],
    "Latest customer requirements reviewed and changes communicated to the  team. ":[
      "Commercial Sales Manager"
    ],
    "Lessons Learned from Phase 1 documented with information to use for future programs?":[
      "Commercial Sales Manager"
    ],

  };


  const [threats, setThreats] = useState([]);
  const [newThreat, setNewThreat] = useState({
    category: "",
    requirements: "",
    responsibility: "",
    name: "",
    status:"",
    plan:"",
    duedate: "" ,
  });
  const [editIndex, setEditIndex] = useState(null);

  const handleAddOrUpdateThreat = () => {
    if (newThreat.category && newThreat.requirements && newThreat.responsibility) {
      if (editIndex !== null) {
        const updatedThreats = [...threats];
        updatedThreats[editIndex] = { ...newThreat, id: editIndex + 1 };
        setThreats(updatedThreats);
        setEditIndex(null);
      } else {
        setThreats([...threats, { ...newThreat, id: threats.length + 1 }]);
      }
      setNewThreat({
        category: "",
        requirements: "",
        responsibility: "",
        name: "",
        status:"",
        plan:"",
        duedate: "" ,
      });
    }
  };

  const handleEdit = (index) => {
    setNewThreat(threats[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    setThreats(threats.filter((_, i) => i !== index));
  };

  // Auto select category if only one category
  useEffect(() => {
    if (Object.keys(data).length === 1 && !newThreat.category) {
      const singleCategory = Object.keys(data)[0];
      setNewThreat((prev) => ({ ...prev, category: singleCategory }));
    }
  }, [data, newThreat.category]);

  // Auto select requirement if only one requirement for selected category
  useEffect(() => {
    if (newThreat.category && data[newThreat.category]?.length === 1 && !newThreat.requirements) {
      const singleRequirement = data[newThreat.category][0];
      setNewThreat((prev) => ({ ...prev, requirements: singleRequirement }));
    }
  }, [newThreat.category, data, newThreat.requirements]);

  // Auto select responsibility if only one responsibility for selected requirement
  useEffect(() => {
    if (newThreat.requirements && pdp[newThreat.requirements]?.length === 1 && !newThreat.responsibility) {
      const singleResponsibility = pdp[newThreat.requirements][0];
      setNewThreat((prev) => ({ ...prev, responsibility: singleResponsibility }));
    }
  }, [newThreat.requirements, pdp, newThreat.responsibility]);

  return (
    
    <div className="p-6 font-sans">
      <h2 className="text-2xl font-bold mb-4">Phase 1</h2>

      {/* Form Section */}
      
      
      <div className="p-4 border border-gray-300 rounded bg-gray-100 mb-6 ">
        <h3 className="text-lg font-semibold mb-2">Add or Edit </h3>
        {/* Deliverable Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Deliverable Category</label>
            <select
              className="w-full border border-gray-300 rounded p-2"
              value={newThreat.category}
              onChange={(e) =>
                setNewThreat({
                  ...newThreat,
                  category: e.target.value,
                  requirements: "",
                  responsibility: "",
                })
              }
            >
              <option value="">Select Item</option>
              {Object.keys(data).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          {/* Deliverable requirements  */}
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Deliverable requirements </label>
            <select
              className="w-full border border-gray-300 rounded p-2"
              value={newThreat.requirements}
              onChange={(e) =>
                setNewThreat({
                  ...newThreat,
                  requirements: e.target.value,
                  responsibility: "",
                })
              }
              disabled={!newThreat.category}
            >
              <option value="">Select requirements</option>
              {newThreat.category &&
                data[newThreat.category].map((requirements) => (
                  <option key={requirements} value={requirements}>
                    {requirements}
                  </option>
                ))}
            </select>
          </div>
          
          {/* PDP Resp. */}
          <div>
            <label className="block font-medium mb-1">PDP Resp.</label>
            <select
              className="w-full border border-gray-300 rounded p-2"
              value={newThreat.responsibility}
              onChange={(e) =>
                setNewThreat({ ...newThreat, responsibility: e.target.value })
              }
              disabled={!newThreat.requirements}
            >
              <option value="">Select responsibility</option>
              {newThreat.requirements &&
                pdp[newThreat.requirements]?.map((responsibility) => (
                  <option key={responsibility} value={responsibility}>
                    {responsibility}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Responsible Name</label>
            <input type="text"
              className="w-full border border-gray-300 rounded p-2"
              value={newThreat.name}
              onChange={(e) =>
                setNewThreat({ ...newThreat, name: e.target.value })
              }
            ></input>
          </div>
          
          {/* Risk Status */}
          <div>
            <label className="block font-medium mb-1">Risk Status</label>
                <select
                className="w-full border border-gray-300 rounded p-2"
                value={newThreat.status}
                onChange={(e) =>
                  setNewThreat({ ...newThreat, status: e.target.value })
                }
                >
                  <option value="">TBD</option>
                </select>
              
          </div>

          {/* Status/Corrective Action Plan */}
          <div>
            <label className="block font-medium mb-1">Status/Corrective Action Plan</label>
            <input type="text"
              className="w-full border border-gray-300 rounded p-2"
              value={newThreat.plan}
              onChange={(e) =>
                setNewThreat({ ...newThreat, plan: e.target.value })
              }
            ></input>
          </div>
          
          {/* Due Date */}
          <div>
            <label className="block font-medium mb-1">Due Date</label>
            <input type="date"
              className="w-full border border-gray-300 rounded p-2"
              value={newThreat.duedate}
              onChange={(e) =>
                setNewThreat({ ...newThreat, duedate: e.target.value })
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
      <h3 className="text-lg font-semibold mb-2">Phase 1 List</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">#</th>
              <th className="border border-gray-300 px-4 py-2">Deliverable Category</th>
              <th className="border border-gray-300 px-4 py-2">Deliverable requirements</th>
              <th className="border border-gray-300 px-4 py-2">PDP Resp.</th>
              <th className="border border-gray-300 px-4 py-2">Responsible Name</th>
              <th className="border border-gray-300 px-4 py-2"> Risk Status</th>
              <th className="border border-gray-300 px-4 py-2">Status/ Corrective Action Plan</th>
              <th className="border border-gray-300 px-4 py-2">Due Date</th>
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
                <td className="border px-4 py-2">{threat.category}</td>
                <td className="border px-4 py-2">{threat.requirements}</td>
                <td className="border px-4 py-2">{threat.responsibility}</td>
                <td className="border px-4 py-2">{threat.name}</td>
                <td className="border px-4 py-2">{threat.status}</td>
                <td className="border px-4 py-2">{threat.plan}</td>
                <td className="border px-4 py-2">{threat.duedate}</td>
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