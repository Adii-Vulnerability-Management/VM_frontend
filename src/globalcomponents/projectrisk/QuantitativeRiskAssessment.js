import { useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

export default function QuantitativeRiskAssessment() {
  const [risks, setRisks] = useState([]);
  const [formData, setFormData] = useState({
    riskNumber: "",
    description: "",
    type: "Threat",
    milestone: "",
    npv: "",
    developmentMargin: "",
    specificInvestmentMargin: "",
    grossMargin: "",
    qualitativeProbability: "",
    quantitativeProbability: "",
    expectedNpv: "",
    expectedDevelopmentMargin: "",
    expectedSpecificInvestmentMargin: "",
    expectedGrossMargin: "",
    insideErp: "No",
  });

  const [editIndex, setEditIndex] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateRisk = () => {
    if (editIndex !== null) {
      setRisks((prev) =>
        prev.map((risk, index) =>
          index === editIndex ? { ...formData } : risk
        )
      );
      setEditIndex(null);
    } else {
      setRisks((prev) => [...prev, formData]);
    }
    setFormData({
      riskNumber: "",
      description: "",
      type: "Threat",
      milestone: "",
      npv: "",
      developmentMargin: "",
      specificInvestmentMargin: "",
      grossMargin: "",
      qualitativeProbability: "",
      quantitativeProbability: "",
      expectedNpv: "",
      expectedDevelopmentMargin: "",
      expectedSpecificInvestmentMargin: "",
      expectedGrossMargin: "",
      insideErp: "No",
    });
  };

  const handleEdit = (index) => {
    setFormData(risks[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    setRisks((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Quantitative Risk Assessment</h2>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Risk #</label>
          <input
            type="text"
            name="riskNumber"
            value={formData.riskNumber}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="border p-2 rounded"
          >
            <option value="Threat">Threat</option>
            <option value="Opportunity">Opportunity</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Milestone</label>
          <input
            type="text"
            name="milestone"
            value={formData.milestone}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1">NPV</label>
          <input
            type="text"
            name="npv"
            value={formData.npv}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Development Margin</label>
          <input
            type="text"
            name="developmentMargin"
            value={formData.developmentMargin}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1">
            Specific Investment Margin
          </label>
          <input
            type="text"
            name="specificInvestmentMargin"
            value={formData.specificInvestmentMargin}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Gross Margin</label>
          <input
            type="text"
            name="grossMargin"
            value={formData.grossMargin}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Qualitative Probability</label>
          <input
            type="text"
            name="qualitativeProbability"
            value={formData.qualitativeProbability}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Quantitative Probability</label>
          <input
            type="text"
            name="quantitativeProbability"
            value={formData.quantitativeProbability}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Inside ERP?</label>
          <select
            name="insideErp"
            value={formData.insideErp}
            onChange={handleInputChange}
            className="border p-2 rounded"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>
      <button
        onClick={handleAddOrUpdateRisk}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {editIndex !== null ? "Update Risk" : "Add Risk"}
      </button>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Risk #</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
              <th className="border border-gray-300 px-4 py-2">Type</th>
              <th className="border border-gray-300 px-4 py-2">Milestone</th>
              <th className="border border-gray-300 px-4 py-2">NPV</th>
              <th className="border border-gray-300 px-4 py-2">Dev Margin</th>
              <th className="border border-gray-300 px-4 py-2">Inv Margin</th>
              <th className="border border-gray-300 px-4 py-2">Gross Margin</th>
              <th className="border border-gray-300 px-4 py-2">
                Qualitative Prob
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Quantitative Prob
              </th>
              <th className="border border-gray-300 px-4 py-2">Inside ERP</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((risk, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}
              >
                <td className="border px-4 py-2">{risk.riskNumber}</td>
                <td className="border px-4 py-2">{risk.description}</td>
                <td className="border px-4 py-2">{risk.type}</td>
                <td className="border px-4 py-2">{risk.milestone}</td>
                <td className="border px-4 py-2">{risk.npv}</td>
                <td className="border px-4 py-2">{risk.developmentMargin}</td>
                <td className="border px-4 py-2">
                  {risk.specificInvestmentMargin}
                </td>
                <td className="border px-4 py-2">{risk.grossMargin}</td>
                <td className="border px-4 py-2">
                  {risk.qualitativeProbability}
                </td>
                <td className="border px-4 py-2">
                  {risk.quantitativeProbability}
                </td>
                <td className="border px-4 py-2">{risk.insideErp}</td>
                <td className="border px-4 py-2 flex space-x-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 flex items-center"
                  >
                    <FaEdit className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex items-center"
                  >
                    <FaTrashAlt className="mr-1" /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {risks.length === 0 && (
              <tr>
                <td
                  className="py-4 px-4 border border-gray-300 text-center text-gray-500"
                  colSpan="12"
                >
                  No risks added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Project Forecast Table */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Project Forecast</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Scenario</th>
                <th className="border border-gray-300 px-4 py-2">NPV</th>
                <th className="border border-gray-300 px-4 py-2">Dev Margin</th>
                <th className="border border-gray-300 px-4 py-2">Inv Margin</th>
                <th className="border border-gray-300 px-4 py-2">
                  Gross Margin
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Net Exposure
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-100">
                <td className="border px-4 py-2">Most Likely</td>
                <td className="border px-4 py-2">-55K €</td>
                <td className="border px-4 py-2">453K €</td>
                <td className="border px-4 py-2">453K €</td>
                <td className="border px-4 py-2">27.5 €</td>
                <td className="border px-4 py-2">3K €</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border px-4 py-2">Most Optimistic</td>
                <td className="border px-4 py-2">-57K €</td>
                <td className="border px-4 py-2">450K €</td>
                <td className="border px-4 py-2">450K €</td>
                <td className="border px-4 py-2">25 €</td>
                <td className="border px-4 py-2">0K €</td>
              </tr>
              <tr className="bg-gray-100">
                <td className="border px-4 py-2">Most Pessimistic</td>
                <td className="border px-4 py-2">-55K €</td>
                <td className="border px-4 py-2">453K €</td>
                <td className="border px-4 py-2">453K €</td>
                <td className="border px-4 py-2">27.5 €</td>
                <td className="border px-4 py-2">3K €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Status and Objectives */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Project Status & Objectives</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gray-700 text-white">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Metric</th>
                <th className="border border-gray-300 px-4 py-2">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-100">
                <td className="border px-4 py-2">Current Project Status</td>
                <td className="border px-4 py-2">-57K €</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border px-4 py-2">Project Objective</td>
                <td className="border px-4 py-2">25K €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
