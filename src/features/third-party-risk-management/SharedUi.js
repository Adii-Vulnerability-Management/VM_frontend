import React from "react";
import { RISK_LEVELS } from "./constants";

const primary = "#2B245C";

const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

export function PageHeader({ title, description, actions }) {
  return (
    <section className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-50">{title}</h1>
          {description && (
            <p className="text-sm leading-6 text-white mt-1">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </section>
  );
}

export function SectionCard({ title, description, children, actions }) {
  return (
    <section className="rounded-2xl border border-[#2B245C] bg-white p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row md:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#2B245C] mb-1">
            {title}
          </h2>
          {description && (
            <p className="text-sm leading-6 text-gray-600">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
      {children}
    </section>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#2B245C] bg-blue-50 px-4 py-2 text-sm font-semibold text-[#2B245C] transition-all hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function WhiteButton({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold shadow-md transition-all bg-white text-[#2B245C] hover:shadow-lg hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function TextInput({
  label,
  error,
  className = "",
  required = false,
  ...props
}) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-2 block text-xs font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-md text-sm outline-none transition focus:border-[#2B245C] focus:ring-1 focus:ring-[#2B245C] ${error ? "border-red-400" : "border-gray-300"}`}
        {...props}
      />
      {error && (
        <span className="mt-1 block text-sm text-red-500 px-1">{error}</span>
      )}
    </label>
  );
}

export function TextArea({
  label,
  error,
  className = "",
  required = false,
  ...props
}) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-2 block text-xs font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      )}
      <textarea
        className={`min-h-[96px] w-full px-3 py-2 border rounded-md text-sm outline-none transition focus:border-[#2B245C] focus:ring-1 focus:ring-[#2B245C] ${error ? "border-red-400" : "border-gray-300"}`}
        {...props}
      />
      {error && (
        <span className="mt-1 block text-sm text-red-500 px-1">{error}</span>
      )}
    </label>
  );
}

export function SelectInput({
  label,
  error,
  children,
  className = "",
  required = false,
  ...props
}) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-2 block text-xs font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      )}
      <select
        className={`w-full px-3 py-2 border rounded-md text-sm bg-white outline-none transition focus:border-[#2B245C] focus:ring-1 focus:ring-[#2B245C] ${error ? "border-red-400" : "border-gray-300"}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <span className="mt-1 block text-sm text-red-500 px-1">{error}</span>
      )}
    </label>
  );
}

export function ToggleField({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between rounded-lg border p-4 text-left shadow-sm transition hover:shadow-md ${checked ? "border-[#2B245C] bg-blue-50" : "border-gray-300 bg-white hover:border-[#2B245C]"}`}
    >
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${checked ? "bg-[#2B245C] text-white" : "bg-gray-100 text-gray-600"}`}
      >
        {checked ? "Yes" : "No"}
      </span>
    </button>
  );
}

export function RiskBadge({ value = "Unclassified" }) {
  const risk = RISK_LEVELS[value] || RISK_LEVELS.Unclassified;
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${risk.badge}`}
    >
      {value}
    </span>
  );
}

export function StatusBadge({ value = "Draft" }) {
  return (
    <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
      {value}
    </span>
  );
}

export function EmptyState({
  title = "No records found",
  description = "Start by adding a new record.",
}) {
  return (
    <div className="rounded-lg border border-dashed border-gray-400 bg-white p-8 text-center">
      <h3 className="text-sm font-semibold text-[#2B245C]">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}

export function MetricCard({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-[#2B245C] bg-white p-5 shadow-lg transition-shadow duration-300 hover:shadow-2xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-[#2B245C]">{value}</p>
      {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
    </div>
  );
}

export function TableShell({
  columns,
  data,
  renderRow,
  emptyTitle,
  emptyDescription,
}) {
  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div
      className="overflow-auto rounded-lg border border-gray-800"
      data-tour="third-party-risk-table"
    >
      <table className="min-w-full text-sm">
        <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="px-4 py-2 font-medium whitespace-nowrap"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item, index) => {
            const row = renderRow(item, index);
            if (!React.isValidElement(row)) return row;
            const base = index % 2 === 0 ? "bg-gray-50" : "bg-white";
            return React.cloneElement(row, {
              className: `${base} hover:bg-gray-100 transition ${row.props.className || ""}`,
            });
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TableControls({
  rowsPerPage,
  onRowsPerPageChange,
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}) {
  return (
    <div className="mt-4">
      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>

          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevious}
            disabled={currentPage === 1}
            className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
          >
            Prev
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={onNext}
            disabled={currentPage >= totalPages}
            className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export { primary, formatDate };
