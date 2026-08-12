// TableAccordion.jsx
import React from "react";
import { FaCaretDown, FaFile } from "react-icons/fa";

const TableAccordion = ({
  title,
  isActive,
  toggleAccordion,
  data,
  applicableValues,
  handleApplicableChange,
  handleModalToggle,
  selectedStatus,
  onStatusChange,
  saveStatus,
  disableApplicable = false,
  extraHeader = null,
  extraRowContent = null,
  headerActions = null,
  rowDetailRenderer = null,
  detailColSpan = null,
  showStoredApplicableSelection = true,
  canSaveItem = null,
}) => {
  const totalColumns = 7 + (extraHeader ? 1 : 0);
  const caretClass = headerActions ? "" : "ml-auto ";

  return (
    <div className="mt-4">
      <div
        className={`flex items-center bg-blue-200 p-4 rounded-t-md cursor-pointer ${
          isActive ? "shadow-md" : ""
        }`}
        onClick={() => toggleAccordion(title.toLowerCase())}
      >
        <strong>{title}</strong>

        {headerActions && (
          <div
            className="ml-auto flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {headerActions}
          </div>
        )}

        {isActive ? (
          <FaCaretDown className={`${caretClass}rotate-180 transition-transform`} />
        ) : (
          <FaCaretDown className={`${caretClass}transition-transform`} />
        )}
      </div>

      {isActive && (
        <div className="p-4 border border-t-0 border-gray-300 rounded-b-md">
          <table className="table-auto w-full text-sm border-collapse border border-gray-300">
            <thead className="bg-gray-50 font-semibold">
              <tr>
                <th className="border border-gray-300 p-2 text-center">
                  Question ID
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  Question Text
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  Question Domain
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  Applicable
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  Final Response
                </th>
                {extraHeader && (
                  <th className="border border-gray-300 p-2 text-center">
                    {extraHeader}
                  </th>
                )}
                <th className="border border-gray-300 p-2 text-center">
                  Status
                </th>
                <th className="border border-gray-300 p-2 text-center">Save</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <React.Fragment key={index}>
                  <tr className="border-t border-gray-300">
                    <td className="border border-gray-300 p-2 text-center">
                      {item.questionId}
                    </td>

                    <td className="border border-gray-300 p-2 text-center">
                      {item.question}
                    </td>

                    <td className="border border-gray-300 p-2 text-center">
                      {item.domain}
                    </td>

                    <td className="border border-gray-300 p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {["Yes", "No", "N/A"].map((value) => (
                          <label key={value} className="flex items-center gap-1">
                            <input
                              type="radio"
                              name={`applicable-${item.questionId}`}
                              checked={
                                (
                                  Object.prototype.hasOwnProperty.call(
                                    applicableValues,
                                    item.questionId,
                                  )
                                    ? applicableValues[item.questionId]
                                    : showStoredApplicableSelection
                                      ? item.applicable
                                      : undefined
                                ) === value
                              }
                              onChange={() =>
                                handleApplicableChange(item.questionId, value)
                              }
                              disabled={disableApplicable}
                            />
                            {value}
                          </label>
                        ))}
                      </div>
                    </td>

                    <td className="border border-gray-300 p-2 text-center">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() =>
                            handleModalToggle(
                              item.questionId,
                              item.question,
                              item.testingFrequencyOverride,
                              item.questionDomain,
                            )
                          }
                          className="p-1.5 rounded-full bg-blue-700 hover:bg-blue-600 transition-colors duration-200 focus:outline-none"
                        >
                          <FaFile className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </td>

                    {extraHeader && (
                      <td className="border border-gray-300 p-2 text-center">
                        {extraRowContent ? extraRowContent(item) : null}
                      </td>
                    )}

                    <td className="border border-gray-300 p-2 text-center">
                      <select
                        className="border border-gray-300 rounded-md p-1 w-full"
                        value={
                          selectedStatus[item.questionId] || item.status || ""
                        }
                        onChange={(e) => onStatusChange(e, item.questionId)}
                      >
                        <option value="In Progress" disabled>
                          In Progress
                        </option>
                        <option value="Reviewed" disabled>
                          Reviewed
                        </option>
                        <option value="Answered">Answered</option>
                        <option value="Rejected" disabled>
                          Rejected
                        </option>
                      </select>
                    </td>

                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        className="bg-[#2B245C] text-white text-sm font-semibold px-4 py-1 rounded-md hover:bg-opacity-90"
                        onClick={() => saveStatus(item.questionId)}
                        disabled={
                          canSaveItem
                            ? !canSaveItem(item)
                            : !(
                                selectedStatus[item.questionId] &&
                                selectedStatus[item.questionId] !== item.status
                              )
                        }
                      >
                        <span>Save Status</span>
                      </button>
                    </td>
                  </tr>

                  {rowDetailRenderer && (
                    <tr className="bg-gray-50">
                      <td
                        className="p-3 border-b border-gray-200"
                        colSpan={detailColSpan || totalColumns}
                      >
                        {rowDetailRenderer(item)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TableAccordion;
