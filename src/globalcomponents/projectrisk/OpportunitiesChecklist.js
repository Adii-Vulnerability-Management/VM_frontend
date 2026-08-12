import { useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import * as XLSX from "xlsx";

export default function OpportunitiesChecklist() {
  const data = {
    "Lessons learned": [
      "Previous project lessons learned",
      "One point lessons",
      "Best practices",
    ],
    "Project Resources": [
      "Project team",
      "Financial resources",
      "Methodology",
      "Plant resources",
    ],
    Timing: ["Project planning", "Fast track plan"],
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
      "SILS",
      "Packaging",
    ],
    "Validation and acceptance": [
      "Test means",
      "Tests and trials",
      "Automotive safety protocols",
    ],
    Purchases: ["Products and specifications", "Strategy", "Other"],
  };

  const causes = {
    "Previous project lessons learned": [
      "Prevent previous project failures carry over to the next project",
    ],
    "One point lessons": ["Identify applicable ideas to project"],
    "Best practices": ["Identify applicable ideas to project"],
    "Project team": [
      "Synergy with other projects",
      "Core team member delocalization",
      "Extended team activities centralized",
    ],
    "Financial resources": ["Development payment terms negotiation"],
    Methodology: ["Apply visual project management"],
    "Plant resources": ["Reused means modification done by plant"],
    "Fast track plan": [""],
    "Project planning": [""],
    SOW: [""],
    "Payment Terms": [""],
    "Economic conditions fluctuation": [""],
    "Intellectual Property": [
      "Identify solutions recently or near the end of term of patent protection",
    ],
    "Main core team members": [""],
    "Field or warranty returns": [""],
    Perimeter: [""],
    Volumes: [""],
    Prototypes: [""],
    "Product family or concept": ["Decrease tooling spec for simpler moulds"],
    "Product design": [
      "Functions integrated into skin mold",
      "Product weight reduction",
    ],
    Assembly: [""],
    Materials: [""],
    "Production means": [
      "Production means re-use",
      "Check benefit of reuse vs new means using last standards",
      "Number of production means suppliers rationalization",
    ],
    "Test or control means": [
      "Test or control means reuse i.e. on facelift projects",
    ],
    "Manufacturing process": [
      "Rationalize number of assembly workstations",
      "Increase number of parts per mast",
    ],
    "Paint process": [
      "Development of common paint jigs for 2 products",
      "POE painted by PO",
      "Paint quality zones negotiation",
    ],
    "Manufacturing capacity": [""],
    "Production site": [""],
    "Logistic scheme": [
      "Direct synchronous delivery from factory",
      "All POI molded in the same production site",
    ],
    "Logistics Service Provider": [
      "Technology scouting (Packaging, logistics, assembly)",
    ],
    SILS: [
      "Synergy with other projects (New or existing) means, area and direct labor",
    ],
    Packaging: [
      "Synchronous racks developed by PO",
      "Packaging reuse",
      "Density increase",
      "Wip racks reuse",
    ],
    "Test means": [""],
    "Tests and trials": ["Use of PO/Sigmatech resources for validation"],
    "Automotive safety protocols": [""],
    "Products and specifications": [
      "Complete or partial means or tools reuse",
      "Decontenting",
      "Use of newest validated technologies",
      "Sourcing in low cost country",
      "Use of internet reverse-auction",
    ],
    Strategy: [
      "Consignment stock negotiation",
      "Effect of leverage by negotiation on global volumes",
      "Make or buy decision ( PM scope)",
    ],
    Other: [
      "Planning opportunity improvement idea?",
      "Quality opportunity improvement idea?",
    ],
  };

  const [Opportunitys, setOpportunitys] = useState([]);
  const [newOpportunity, setNewOpportunity] = useState({
    item: "",
    origin: "",
    cause: "",
    impacts: { quality: "", cost: "", time: "", hse: "" },
    comments: "",
  });
  const [editIndex, setEditIndex] = useState(null);

  const handleAddOrUpdateOpportunity = () => {
    if (newOpportunity.item && newOpportunity.origin && newOpportunity.cause) {
      if (editIndex !== null) {
        const updatedOpportunitys = [...Opportunitys]; // Correct array being used
        updatedOpportunitys[editIndex] = {
          ...newOpportunity,
          id: editIndex + 1,
        };
        setOpportunitys(updatedOpportunitys);
        setEditIndex(null); // Reset the edit index
      } else {
        setOpportunitys([
          ...Opportunitys,
          { ...newOpportunity, id: Opportunitys.length + 1 },
        ]);
      }
      setNewOpportunity({
        item: "",
        origin: "",
        cause: "",
        impacts: { quality: "", cost: "", time: "", hse: "" },
        comments: "",
      });
    }
  };

  // Handle file upload and parse Excel data
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
        const formattedOpportunitys = parsedData.map((row, index) => ({
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
        setOpportunitys((prev) => [...prev, ...formattedOpportunitys]);
      };
      reader.readAsArrayBuffer(file);
    }
  };
  const handleEdit = (index) => {
    setNewOpportunity(Opportunitys[index]); // Set the specific opportunity to edit
    setEditIndex(index); // Set the index for editing
  };

  const handleDelete = (index) => {
    setOpportunitys(Opportunitys.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 font-sans">
      <h2 className="text-2xl font-bold mb-4">Opportunities Checklist</h2>
      {/* File Import Section */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          Import Opportunities via Excel
        </label>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Form Section */}
      <div className="p-4 border border-gray-300 rounded bg-gray-100 mb-6">
        <h3 className="text-lg font-semibold mb-2">Add or Edit Opportunity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Opportunity Item</label>
            <select
              className="w-full border border-gray-300 rounded p-2"
              value={newOpportunity.item}
              onChange={(e) =>
                setNewOpportunity({
                  ...newOpportunity,
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
            <label className="block font-medium mb-1">
              Opportunitys Origin
            </label>
            <select
              className="w-full border border-gray-300 rounded p-2"
              value={newOpportunity.origin}
              onChange={(e) =>
                setNewOpportunity({
                  ...newOpportunity,
                  origin: e.target.value,
                  cause: "",
                })
              }
              disabled={!newOpportunity.item}
            >
              <option value="">Select Origin</option>
              {newOpportunity.item &&
                data[newOpportunity.item].map((origin) => (
                  <option key={origin} value={origin}>
                    {origin}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Opportunity Cause</label>
            <select
              className="w-full border border-gray-300 rounded p-2"
              value={newOpportunity.cause}
              onChange={(e) =>
                setNewOpportunity({ ...newOpportunity, cause: e.target.value })
              }
              disabled={!newOpportunity.origin}
            >
              <option value="">Select Cause</option>
              {newOpportunity.origin &&
                causes[newOpportunity.origin]?.map((cause) => (
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
                  value={newOpportunity.impacts[impact]}
                  onChange={(e) =>
                    setNewOpportunity({
                      ...newOpportunity,
                      impacts: {
                        ...newOpportunity.impacts,
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
              value={newOpportunity.comments}
              onChange={(e) =>
                setNewOpportunity({
                  ...newOpportunity,
                  comments: e.target.value,
                })
              }
              rows="3"
            ></textarea>
          </div>
        </div>

        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleAddOrUpdateOpportunity}
        >
          {editIndex !== null ? "Update Opportunity" : "Add Opportunity"}
        </button>
      </div>

      {/* Opportunitys Table */}
      <h3 className="text-lg font-semibold mb-2">Opportunitys List</h3>
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
            {Opportunitys.map((Opportunity, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="border px-4 py-2">{Opportunity.id}</td>
                <td className="border px-4 py-2">{Opportunity.item}</td>
                <td className="border px-4 py-2">{Opportunity.origin}</td>
                <td className="border px-4 py-2">{Opportunity.cause}</td>
                <td className="border px-4 py-2">
                  {Opportunity.impacts.quality}
                </td>
                <td className="border px-4 py-2">{Opportunity.impacts.cost}</td>
                <td className="border px-4 py-2">{Opportunity.impacts.time}</td>
                <td className="border px-4 py-2">{Opportunity.impacts.hse}</td>
                <td className="border px-4 py-2">{Opportunity.comments}</td>
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
            {Opportunitys.length === 0 && (
              <tr>
                <td
                  colSpan="10"
                  className="text-center text-gray-500 py-4 border"
                >
                  No Opportunitys found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
