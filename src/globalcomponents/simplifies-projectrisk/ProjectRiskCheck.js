import { useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

export default function ProjectRiskCheck() {
  const data = {
    "Project Resources": [
      "Project team",
      "Methodology",
    ],
    Timing: ["Project planning"],
    Confidentiality: ["Project confidentiality"],
    Contract: ["SOW", "Payment Terms", "IT Requirements-Logistics", "Intellectual Property", "Local Regulations"],
    "Testing Validation": ["Security Validations"]
  };

  const causes = {
    "Project Team": [
      "Incomplete",
      "Poorly adapted",
      "Strewn over different sites",
      "Overloaded",
      "Departure of a core team member",
      "Core Team or Extended Team lack of skills",
      "Logistics choice",
      "Continuity of project team and experts",
    ],
    Methodology: [
      "Processes misunderstood by team members",
      "Documents unknown by team members",
    ],
    "Project planning": [
      "Blurry, evolving, or unfeasible Customer key dates",
      "Tight target",
      "Difference between project and customer timing plans",
      "Not suitable hours distribution per phase throughout project",
      "Potential customer change within before production",
    ],
    "Project confidentiality": [
      "Confidentiality rating of the project",
      "Confidentiality requirements",
      "Information Security Awareness training of team members",
      "Security certification of external consulters ",
      "Loss of Intellectual Property",
      "Defined working space for project team",
    ],
    SOW: [
      "Not agreed, nonexistent or insufficient",
    ],
    "Payment Terms": [
      "Not agreed",
      "Undefined or imprecise development payment terms",
    ],
    "IT Requirements-Logistics": [
      "New IT Requirement",
    ],
    "Intellectual Property": [
      "Potential Intellectual Property Infringements",
      "Unidentified Intellectual Property Issues",
    ],
    "Local Regulations": [
      "Site Risk",
    ],
    "Security Validations": [
      "Undefined or imprecise audit and security checks",
    ],

  };


  const [threats, setThreats] = useState([]);
  const [newThreat, setNewThreat] = useState({
    item: "",
    origin: "",
    cause: "",
    name:"",
    impacts:"",
    status:"",
    plan:"",
    duedate: "" ,
    comments: "",
  });
  const [editIndex, setEditIndex] = useState(null);

  const handleAddOrUpdateThreat = () => {
    if (newThreat.item && newThreat.origin && newThreat.cause) {
      if (editIndex !== null) {
        const updatedThreats = [...threats];
        updatedThreats[editIndex] = { ...newThreat, id: editIndex + 1 };
        setThreats(updatedThreats);
        setEditIndex(null);
      } else {
        setThreats([...threats, { ...newThreat, id: threats.length + 1 }]);
      }
      setNewThreat({
        item: "",
        origin: "",
        cause: "",
        name:"",
        impacts: "",
        status:"",
        plan:"",
        duedate: "" ,
        comments: "",
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

  return (
    <div className="p-6 font-sans">
      <h2 className="text-2xl font-bold mb-4">Project Risk Checklist</h2>

      {/* Form Section */}
      
      {/* Threat Item */}
      <div className="p-4 border border-gray-300 rounded bg-gray-100 mb-6">
        <h3 className="text-lg font-semibold mb-2">Add or Edit Project Risk</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Threats Item</label>
            <select
              className="w-full border border-gray-300 rounded p-2"
              value={newThreat.item}
              onChange={(e) =>
                setNewThreat({
                  ...newThreat,
                  item: e.target.value,
                  origin: "",
                  cause: "",
                })
              }
            >
              <option value="">Select Item</option>
              {Object.keys(data).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          
          {/* Threats Origin */}
          <div>
            <label className="block font-medium mb-1">Threats Origin</label>
            <select
              className="w-full border border-gray-300 rounded p-2"
              value={newThreat.origin}
              onChange={(e) =>
                setNewThreat({
                  ...newThreat,
                  origin: e.target.value,
                  cause: "",
                })
              }
              disabled={!newThreat.item}
            >
              <option value="">Select Origin</option>
              {newThreat.item &&
                data[newThreat.item].map((origin) => (
                  <option key={origin} value={origin}>
                    {origin}
                  </option>
                ))}
            </select>
          </div>
          
          {/* Threat Cause */}
          <div>
            <label className="block font-medium mb-1">Threat Cause</label>
            <select
              className="w-full border border-gray-300 rounded p-2"
              value={newThreat.cause}
              onChange={(e) =>
                setNewThreat({ ...newThreat, cause: e.target.value })
              }
              disabled={!newThreat.origin}
            >
              <option value="">Select Cause</option>
              {newThreat.origin &&
                causes[newThreat.origin]?.map((cause) => (
                  <option key={cause} value={cause}>
                    {cause}
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
          
          {/* Impacts */}
          <div>
            <label className="block font-medium mb-1">Risk Impact</label>
                <select
                className="w-full border border-gray-300 rounded p-2"
                impacts={newThreat.impacts}
                onChange={(e) =>
                  setNewThreat({ ...newThreat, impacts: e.target.value })
                }
                >
                  <option impacts="">Select Origin</option>
                  <option impacts="NA">N/A</option>
                </select>
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
                  <option value="">Select Origin</option>
                  <option value="High">High Impact</option>
                  <option value="Medium">Medium Impact</option>
                  <option value="Low">Low Impact</option>
                  <option value="NA">Not Applicable</option>
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
          
          {/* Comments */}
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Comments</label>
            <textarea
              className="w-full border border-gray-300 rounded p-2"
              value={newThreat.comments}
              onChange={(e) =>
                setNewThreat({ ...newThreat, comments: e.target.value })
              }
              rows="3"
            ></textarea>
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
      <h3 className="text-lg font-semibold mb-2">Threats List</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">#</th>
              <th className="border border-gray-300 px-4 py-2">Item</th>
              <th className="border border-gray-300 px-4 py-2">Origin</th>
              <th className="border border-gray-300 px-4 py-2">Cause</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Impact</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Plan</th>
              <th className="border border-gray-300 px-4 py-2">Due Date</th>
              <th className="border border-gray-300 px-4 py-2">Comments</th>
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
                <td className="border px-4 py-2">{threat.item}</td>
                <td className="border px-4 py-2">{threat.origin}</td>
                <td className="border px-4 py-2">{threat.cause}</td>
                <td className="border px-4 py-2">{threat.name}</td>
                <td className="border px-4 py-2">{threat.impacts}</td>
                <td className="border px-4 py-2">{threat.status}</td>
                <td className="border px-4 py-2">{threat.plan}</td>
                <td className="border px-4 py-2">{threat.duedate}</td>
                <td className="border px-4 py-2">{threat.comments}</td>
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