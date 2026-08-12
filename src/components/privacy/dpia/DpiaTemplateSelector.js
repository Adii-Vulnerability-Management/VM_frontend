import React from "react";
import { normalizeTemplateSections } from "@/utils/privacy/dpia/DpiaTemplateUtils";

const renderQuestionInput = ({ question, sectionIndex, questionIndex, onChange }) => {
  const commonClass =
    "w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2B245C]";

  if (question.type === "select") {
    return (
      <select
        className={commonClass}
        value={question.answer || ""}
        onChange={(e) => onChange(sectionIndex, questionIndex, e.target.value)}
      >
        <option value="">Select</option>
        {(question.options || []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (question.type === "yes_no") {
    return (
      <select
        className={commonClass}
        value={question.answer || ""}
        onChange={(e) => onChange(sectionIndex, questionIndex, e.target.value)}
      >
        <option value="">Select</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
        <option value="Not Applicable">Not Applicable</option>
      </select>
    );
  }

  if (question.type === "textarea") {
    return (
      <textarea
        rows={3}
        className={commonClass}
        value={question.answer || ""}
        onChange={(e) => onChange(sectionIndex, questionIndex, e.target.value)}
        placeholder="Enter response"
      />
    );
  }

  return (
    <input
      type={question.type === "date" ? "date" : "text"}
      className={commonClass}
      value={question.answer || ""}
      onChange={(e) => onChange(sectionIndex, questionIndex, e.target.value)}
      placeholder="Enter response"
    />
  );
};

const DpiaTemplateSelector = ({
  templates = [],
  loading = false,
  selectedTemplate,
  selectedTemplateId,
  templateQuestions = [],
  riskAssessment = [],
  onSelectTemplate,
  onQuestionChange,
  onRiskChange,
  onSeedDefaults,
  onManageTemplates,
  errors = {},
}) => {
  const displayTemplateQuestions = Array.isArray(templateQuestions) && templateQuestions.length
    ? templateQuestions
    : selectedTemplate
      ? normalizeTemplateSections(selectedTemplate.sections)
      : [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block font-medium text-gray-700 mb-2">
            Select DPIA Template
          </label>
          <select
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
            value={selectedTemplateId || ""}
            onChange={(e) => onSelectTemplate(e.target.value)}
            disabled={loading}
          >
            <option value="">Select DPIA template</option>
            {templates.map((template) => (
              <option key={template._id || template.name} value={template._id || template.name}>
                {template.name} • {template.regulation} • {template.industry} • v{template.version || "1.0"}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-600 mt-1">
            Select a template to load its DPIA assessment questions. You are answering an assessment, not editing the template here.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSeedDefaults}
            className="px-3 py-2 text-sm rounded-md border border-[#2B245C] text-[#2B245C] hover:bg-[#2B245C] hover:text-white"
          >
            Seed Defaults
          </button>
          <button
            type="button"
            onClick={onManageTemplates}
            className="px-3 py-2 text-sm rounded-md bg-[#2B245C] text-white hover:bg-[#221d49]"
          >
            Open Template Library
          </button>
        </div>
      </div>

      {selectedTemplate && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="font-semibold text-[#2B245C]">
            {selectedTemplate.name}
          </h4>
          <p className="text-sm text-gray-700 mt-1">
            {selectedTemplate.description || "No description provided."}
          </p>
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <span className="px-2 py-1 rounded-full bg-white border">
              Regulation: {selectedTemplate.regulation}
            </span>
            <span className="px-2 py-1 rounded-full bg-white border">
              Industry: {selectedTemplate.industry}
            </span>
            <span className="px-2 py-1 rounded-full bg-white border">
              Version: {selectedTemplate.version || "1.0"}
            </span>
          </div>
        </div>
      )}

      {!!displayTemplateQuestions.length && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-[#2B245C]">
            DPIA Assessment Questions
          </h4>
          {displayTemplateQuestions.map((section, sectionIndex) => (
            <div key={`${section.title}-${sectionIndex}`} className="border rounded-lg p-4 bg-white">
              <h5 className="font-semibold text-gray-800 mb-3">{section.title}</h5>
              <div className="space-y-4">
                {(section.questions || []).map((question, questionIndex) => (
                  <div key={`${question.key}-${questionIndex}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {question.label}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderQuestionInput({
                      question,
                      sectionIndex,
                      questionIndex,
                      onChange: onQuestionChange,
                    })}
                    {errors[`templateQuestions[${sectionIndex}].questions[${questionIndex}].answer`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`templateQuestions[${sectionIndex}].questions[${questionIndex}].answer`]}
                      </p>
                    )}
                    {question.guidance && (
                      <p className="text-xs text-gray-500 mt-1">{question.guidance}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!!riskAssessment.length && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-[#2B245C]">
            Suggested risk assessment from template
          </h4>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2 text-left">Risk</th>
                  <th className="p-2 text-left">Impact</th>
                  <th className="p-2 text-left">Control / Mitigation</th>
                  <th className="p-2 text-left">Likelihood</th>
                  <th className="p-2 text-left">Residual Risk</th>
                </tr>
              </thead>
              <tbody>
                {riskAssessment.map((risk, index) => (
                  <tr key={`${risk.risk}-${index}`} className="border-t align-top">
                    <td className="p-2 min-w-[180px]">{risk.risk}</td>
                    <td className="p-2 min-w-[220px]">{risk.impact}</td>
                    <td className="p-2 min-w-[260px]">
                      <textarea
                        rows={2}
                        className="w-full border rounded-md px-2 py-1"
                        value={risk.control || ""}
                        onChange={(e) => onRiskChange(index, "control", e.target.value)}
                      />
                    </td>
                    <td className="p-2 min-w-[140px]">
                      <select
                        className="w-full border rounded-md px-2 py-1"
                        value={risk.likelihood || "Medium"}
                        onChange={(e) => onRiskChange(index, "likelihood", e.target.value)}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </td>
                    <td className="p-2 min-w-[140px]">
                      <select
                        className="w-full border rounded-md px-2 py-1"
                        value={risk.residualRisk || "Medium"}
                        onChange={(e) => onRiskChange(index, "residualRisk", e.target.value)}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DpiaTemplateSelector;
