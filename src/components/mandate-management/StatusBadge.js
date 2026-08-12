// -----------------------------
// Style maps (unchanged)
// -----------------------------
const STATUS_STYLES = {
  // good
  Verified: "bg-green-100 text-green-700",
  Approved: "bg-green-100 text-green-700",
  Matched: "bg-green-100 text-green-700",

  // pending / attention
  Pending: "bg-yellow-100 text-yellow-700",
  "Pending Review": "bg-yellow-100 text-yellow-700",
  "Needs Review": "bg-yellow-100 text-yellow-700",
  Review: "bg-yellow-100 text-yellow-700",
  "Partially Matched": "bg-yellow-100 text-yellow-700",
  "Partial Match": "bg-yellow-100 text-yellow-700",

  // action needed
  "Needs Changes": "bg-orange-100 text-orange-700",

  // in progress / info
  "Under Implementation": "bg-blue-100 text-blue-700",
  "In Progress": "bg-blue-100 text-blue-700",

  // blocker / bad
  Rejected: "bg-red-100 text-red-700",
  "Not Matched": "bg-red-100 text-red-700",
  "No Match": "bg-red-100 text-red-700",
  Unmatched: "bg-red-100 text-red-700",

  // neutral
  Unknown: "bg-gray-100 text-gray-600",
  "N/A": "bg-gray-100 text-gray-600",
  "—": "bg-gray-100 text-gray-600",
};

const DUE_STYLES = {
  Completed: "bg-gray-100 text-gray-700",
  "Completed (Approved)": "bg-gray-100 text-gray-700",
  Rejected: "bg-red-100 text-red-700",
  Overdue: "bg-red-100 text-red-700",
  "Due Today": "bg-orange-100 text-orange-700",
  "Due Soon": "bg-blue-100 text-blue-700",
  "Due Later": "bg-blue-100 text-blue-700",
  "No Due Date": "bg-gray-100 text-gray-600",
};

// -----------------------------
// Helpers
// -----------------------------
const isPercent = (s) => /^\s*\d{1,3}\s*%\s*$/.test(String(s || ""));
const toNum = (s) => {
  const n = parseInt(String(s).replace("%", "").trim(), 10);
  return Number.isFinite(n) ? n : null;
};

// ✅ Central logic: color by "type" + value levels
const resolveStyles = (value, type) => {
  const s = String(value ?? "—").trim();
  const lower = s.toLowerCase();

  // 1) Confidence: percent-based (level logic)
  //    - <50   => red (low confidence)
  //    - 50-74 => yellow (medium)
  //    - 75-89 => blue (good)
  //    - 90+   => green (very high)
  if (type === "confidence" || isPercent(s)) {
    if (s === "—") return "bg-gray-100 text-gray-600";
    const n = toNum(s);
    if (n === null) return "bg-gray-100 text-gray-600";
    if (n >= 90) return "bg-green-100 text-green-700";
    if (n >= 75) return "bg-blue-100 text-blue-700";
    if (n >= 50) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  }

  // 2) Priority: Low (yellow), Medium (blue), High/Critical (red)
  if (type === "priority") {
    if (lower === "low") return "bg-yellow-100 text-yellow-700";
    if (lower === "medium") return "bg-blue-100 text-blue-700";
    if (lower === "high") return "bg-red-100 text-red-700";
    if (lower === "critical") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  }

  // 3) Match: sensible levels
  if (type === "match") {
    if (
      lower.includes("not matched") ||
      lower.includes("no match") ||
      lower.includes("unmatched")
    )
      return "bg-red-100 text-red-700";
    if (lower.includes("partial")) return "bg-yellow-100 text-yellow-700";
    if (lower.includes("new mandate") || lower.includes("in progress"))
      return "bg-blue-100 text-blue-700";
    if (lower.includes("matched") || lower === "match")
      return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-600";
  }

  // 4) Status: keep your map first, fallback to keywords
  if (type === "status") {
    if (STATUS_STYLES[s]) return STATUS_STYLES[s];

    if (lower.includes("verify") || lower.includes("approve"))
      return "bg-green-100 text-green-700";
    if (lower.includes("pending") || lower.includes("review"))
      return "bg-yellow-100 text-yellow-700";
    if (lower.includes("implement") || lower.includes("progress"))
      return "bg-blue-100 text-blue-700";
    if (lower.includes("reject")) return "bg-red-100 text-red-700";

    return "bg-gray-100 text-gray-600";
  }

  return STATUS_STYLES[s] || "bg-gray-100 text-gray-600";
};

// -----------------------------
// Components
// -----------------------------
export function StatusBadge({ status, className = "", type }) {
  const s = String(status ?? "Pending").trim();
  const styles = resolveStyles(s, type);

  return (
    <span
      className={`inline-flex text-center rounded-full px-3 py-1 text-xs font-medium ${styles} ${className}`}
    >
      {s}
    </span>
  );
}

export function DueDateBadge({ label, variant, subLabel }) {
  const v = String(variant || "No Due Date").trim();
  const styles = DUE_STYLES[v] || "bg-gray-100 text-gray-600";

  return (
    <div className="inline-flex w-full flex-col items-center text-center">
      <span
        className={`inline-flex justify-center text-center rounded-full px-3 py-1 text-xs font-medium ${styles}`}
        title={subLabel || label}
      >
        {String(label || "—")}
      </span>

      {subLabel ? (
        <span className="mt-1 text-[11px] text-gray-500">{subLabel}</span>
      ) : null}
    </div>
  );
}

export function Badge({
  label,
  value,
  type,
  className = "",
  labelClassName = "",
  pillClassName = "",
  title,
}) {
  const v = value ?? "—";
  const labelLower = String(label || "")
    .trim()
    .toLowerCase();

  const resolverType =
    labelLower === "confidence"
      ? "confidence"
      : labelLower === "priority" || type === "priority"
        ? "priority"
        : labelLower === "match"
          ? "match"
          : type === "status" ||
              labelLower === "status" ||
              labelLower === "mandate status"
            ? "status"
            : undefined;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-white px-2 py-1 ring-1 ring-gray-200 ${className}`}
      title={title}
    >
      <span className={`text-[11px] text-gray-500 ${labelClassName}`}>
        {label}:
      </span>

      <StatusBadge status={v} type={resolverType} className={pillClassName} />
    </span>
  );
}
