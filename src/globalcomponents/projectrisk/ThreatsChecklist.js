import { useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import * as XLSX from "xlsx";

export default function ThreatsChecklist() {
  const data = {
    "Project Resources": [
      "Project team",
      "Financial resources",
      "Methodology",
      "Plant resources",
    ],
    Timing: ["Fast track plan", "Project planning"],
    Confidentiality: ["Project confidentiality"],
    Contract: ["SOW", "Payment Terms"],
    Context: ["Economic conditions fluctuation", "Intellectual Property"],
    "Customer relations": [
      "Main core team members",
      "Customer context",
      "Field or warranty returns",
    ],
    "Requirements definition": ["Perimeter", "Volumes", "Prototypes"],
    "Product solution choices": [
      "Product family or concept",
      "Product design",
      "Assembly",
      "Materials",
    ],
    "Process solution choices": [
      "Production means",
      "Test or control means",
      "Manufacturing process",
      "Paint process",
      "Manufacturing capacity",
      "Production site",
    ],
    "Logistic choice": [
      "Logistic scheme",
      "Logistics Service Provider",
      "PO site",
      "SILS",
      "IT Requirements",
      "Packaging",
    ],
    "Validation and acceptance": [
      "Test means",
      "Tests and trials",
      "Automotive safety protocols",
    ],
    Purchases: ["Suppliers context", "Tool trials facilities", "Strategy"],
    "Health, Safety and Environment": [
      "Local regulations",
      "Site",
      "Packaging/Racks",
      "Tools",
      "Grippers",
      "Materials",
      "Assembly process",
      "Paint process",
      "Manufacturing process",
      "Transports",
    ],
  };

  const causes = {
    "Project team": [
      "Incomplete",
      "Poorly adapted",
      "Strewn over different sites",
      "Overloaded",
      "Departure of a core team member",
      "Core Team or Extended Team lack of skills",
      "Continuity of project team and experts",
    ],
    "Financial resources": [
      "Extended amortization period",
      "Amortization over large number of parts",
      "Negative cash flow",
      "PRU not calculated or unreliable",
    ],
    Methodology: [
      "Processes misunderstood by team members",
      "Documents unknown by team members",
    ],
    "Plant resources": [
      "Availability of plant personnel for trials",
      "Availability of paint line capacity for trials",
      "Availability of injection press for trials",
    ],
    "Fast track plan": [
      "Design responsible supplier late nomination",
      "Non-robust Tool Go and feasibility commitment",
    ],
    "Project planning": [
      "Blurry, evolving, or unfeasible Customer key dates",
      "Tight target",
      "Difference between project and customer timing plans",
      "Not suitable hours distribution per phase throughout project",
      "Potential customer change within 2 months before SOP risking tool to leave production site",
    ],
    "Project confidentiality": [
      "Confidentiality rating of the project",
      "Confidentiality requirements",
      "Information Security Awareness training of team members",
      "TISAX certification of external consultants",
      "Defined working space for project team",
      "Prototype security protection and awareness",
    ],
    SOW: [
      "Not agreed, nonexistent or insufficient",
      "Spare parts / Service parts strategy defined",
    ],
    "Payment Terms": [
      "Not agreed",
      "Undefined or imprecise development payment terms",
      "Undefined or imprecise tooling payment terms",
      "Undefined or imprecise series parts payment terms",
    ],
    "Economic conditions fluctuation": [
      "Exchange rate fluctuations",
      "Raw materials price fluctuations",
      "Local interest rates fluctuations",
      "Inflation rates / prices review frequency",
    ],
    "Intellectual Property": [
      "Potential Intellectual Property Infringements",
      "Unidentified Intellectual Property Issues",
    ],
    "Main core team members": [
      "Don't master customer's language",
      "Don't know customer practices or processes",
    ],
    "Customer context": [
      "New customer for PO or for the Business Unit",
      "Customer representatives unknown by PO",
      "Multiple customer representative decision-makers",
      "Representative change during project development",
      "Difficulty establishing a permanent R&D contact",
      "Bad relationships because of prior issues",
      "Customer practices change during project development",
      "Geographical distance",
      "Customer not confident towards new technologies",
    ],
    "Field or warranty returns": [
      "New technology",
      "Returns of equivalent part already in production",
      "Unclear warranty agreement terms",
    ],
    Perimeter: [
      "Inexistent, blurry or unfeasible; physics, aspect, and dimensional customer demands",
      "Inexistent, blurry, evolving or unfeasible deliveries quality levels",
      "Inexistent, evolving or unfeasible materials specifications",
      "Poorly defined documents to be produced",
      "Not defined customer assistance",
      "High References or components number",
      "Unknown or low target selling price",
      "Customer matching process after PPAP",
    ],
    Volumes: [
      "Unknown, low or evolving annual volumes",
      "Unknown, low or evolving lifetime volumes",
    ],
    Prototypes: ["Not in budget", "Imprecise or evolving quantities"],
    "Product family or concept": [
      "Non validated",
      "At limits of known technology",
    ],
    "Product design": [
      "Unsuitable to our process",
      "CAPEX incursion",
      "Demoulding issues",
      "Non optimal weight",
      "Paint robot accessibility issues",
      "Possible water retention issues",
      "Imposed customer design standard non POAE validated",
    ],
    Assembly: ["Scratches", "Deformation"],
    Materials: [
      "New",
      "Not stable",
      "Known deformation issues",
      "Material Compatibility issues",
    ],
    "Production means": [
      "Inexistent",
      "New",
      "Imposed customer injection tooling standard",
      "Imposed customer assembly standard",
      "Development in non production intent equipment",
    ],
    "Test or control means": ["New"],
    "Manufacturing process": [
      "New",
      "Complex",
      "Poorly mastered in other products",
      "Not suitable to reach required PPM level",
      "MOD over-consumption",
    ],
    "Paint process": [
      "Unstable",
      "New technology",
      "Specific requirement for paint jigs",
      "No plan defined for paint jigs storage",
    ],
    "Manufacturing capacity": [
      "Exceeded capacity of tools or equipment",
      "Exceeded process capacity",
      "Exceeded sites capacity",
    ],
    "Production site": [
      "New PO Site",
      "New process to specific site",
      "Mould weight limitations",
      "Lack of skilled/trained workforce",
    ],
    "Logistic scheme": [
      "Multiple PO/customer sites/countries",
      "Complex",
      "Undefined",
    ],
    "Logistics Service Provider": ["New"],
    "PO site": ["New"],
    SILS: [
      "New",
      "Exceeded capacity",
      "External SILS fees fluctuation",
      "Late nomination in project timing",
    ],
    "IT Requirements": ["New IT requirements"],
    Packaging: [
      "Lack of charging protection",
      "New concept",
      "Incorrectly dimensioned springs in racks",
      "B to C racks poorly managed by customer",
    ],
    "Test means": [
      "Unavailable or loosely conceived laboratory test means",
      "Unavailable or loosely conceived metrology test means",
      "Not in budget special test means",
      "Unavailable representative vehicles",
    ],
    "Tests and trials": [
      "Undefined shared validation between PO and customer",
      "Exceeded press capacity",
      "Exceeded paint line capacity",
    ],
    "Automotive safety protocols": ["Evolution", "New platform"],
    "Suppliers context": [
      "New supplier",
      "Supplier financial health",
      "Known low performance supplier",
      "Supplier overloaded",
      "Supplier in monopolistic situation",
    ],
    "Tool trials facilities": [
      "Not in line with POAE requirements",
      "Capacity of trials management",
    ],
    Strategy: [
      "Short timing",
      "Late make or buy decision",
      "Very aggressive economical target",
    ],
    "Local regulations": [
      "Activities in new country",
      "Evolution",
      "Unclear or undefined",
    ],
    Site: [
      "Located in a country presenting high threats to personal safety",
      "Fork-lift trucks presence in workshop",
      "Extended work days",
    ],
    "Packaging/Racks": [
      "Difficult rack access",
      "Difficult rack load/unload",
      "Cardholder not in ergonomic position",
      "Undefined maintenance plan for racks",
      "Racks presenting stability issues",
      "Storage failure to adhere to PO fire insurance requirements",
    ],
    Tools: [
      "Incorrectly positioned hoist rings",

      "Hoist points thread incorrectly performed",
      "Exceeded lift bridge weight capacity",
    ],
    Grippers: [
      "Robot gripper weight/handling",
      "Robot gripper sharp edge/knives",
    ],
    Materials: [
      "Presence of dangerous substances",
      "Material storage issues",
      "Incorrectly or non-identified materials",
    ],
    "Assembly process": [
      "Inappropriate assembly station height",
      "Excessive operator effort required",
      "Clip aggressive to fingers",
      "Difficult bumper/piece positioning on assembly machine",
      "Emission of toxic gases when welding is performed",
    ],
    "Paint process": [
      "Heavy paint jigs",
      "Failure to follow directives for work in explosive atmosphere",
    ],
    "Manufacturing process": [
      "Work outside of ergonomic zone",
      "Unawareness of operating procedures",
      "Unawareness of manual handling guidelines",
      "Extreme working conditions",
      "Polluting",
      "Misuse of personal protective equipment",
      "Presence of cutting smudges in parts",
      "Cumbersome or heavy parts",
      "Machines not compliant with noise regulations",
      "Supplier not qualified for machine safety certification",
      "Machines presenting electrical/mechanical issues",
      "Presence of subcontract staff unaware of PO safety rules",
    ],
    Transports: [
      "Incorrect mould stowing",
      "Hazardous driving conditions",
      "Frequent or extended road trips",
      "Air pollution",
    ],
  };

  const [threats, setThreats] = useState([]);
  const [newThreat, setNewThreat] = useState({
    item: "",
    origin: "",
    cause: "",
    impacts: { quality: "", cost: "", time: "", hse: "" },
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
        impacts: { quality: "", cost: "", time: "", hse: "" },
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
 const handleFileUpload = (e) => {
   const file = e.target.files[0];
   if (file) {
     const reader = new FileReader();
     reader.onload = (event) => {
       const data = new Uint8Array(event.target.result);
       const workbook = XLSX.read(data, { type: "array" });
       const sheetName = workbook.SheetNames[0];
       const worksheet = workbook.Sheets[sheetName];
       const parsedData = XLSX.utils.sheet_to_json(worksheet);
       const formattedThreats = parsedData.map((row, index) => ({
         id: index + 1,
         item: row["Item"] || "",
         origin: row["Origin"] || "",
         cause: row["Cause"] || "",
         impacts: {
           quality: row["Quality"] || "",
           cost: row["Cost"] || "",
           time: row["Time"] || "",
           hse: row["HSE"] || "",
         },
         comments: row["Comments"] || "",
       }));
       setThreats((prevThreats) => [...prevThreats, ...formattedThreats]);
     };
     reader.readAsArrayBuffer(file);
   }
 };
  return (
    <div className="p-6 font-sans">
      <h2 className="text-2xl font-bold mb-4">Threats Checklist</h2>
      {/* File Upload Section */}
      <div className="mb-6">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      {/* Form Section */}
      <div className="p-4 border border-gray-300 rounded bg-gray-100 mb-6">
        <h3 className="text-lg font-semibold mb-2">Add or Edit Threat</h3>
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
            <label className="block font-medium mb-1">Impacts</label>
            <div className="grid grid-cols-4 gap-2">
              {["quality", "cost", "time", "hse"].map((impact) => (
                <select
                  key={impact}
                  className="w-full border border-gray-300 rounded p-2"
                  value={newThreat.impacts[impact]}
                  onChange={(e) =>
                    setNewThreat({
                      ...newThreat,
                      impacts: {
                        ...newThreat.impacts,
                        [impact]: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">{impact.toUpperCase()}</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              ))}
            </div>
          </div>

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
              <th className="border border-gray-300 px-4 py-2">Quality</th>
              <th className="border border-gray-300 px-4 py-2">Cost</th>
              <th className="border border-gray-300 px-4 py-2">Time</th>
              <th className="border border-gray-300 px-4 py-2">HSE</th>
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
                <td className="border px-4 py-2">{threat.impacts.quality}</td>
                <td className="border px-4 py-2">{threat.impacts.cost}</td>
                <td className="border px-4 py-2">{threat.impacts.time}</td>
                <td className="border px-4 py-2">{threat.impacts.hse}</td>
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
                  colSpan="10"
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