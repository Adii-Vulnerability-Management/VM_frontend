"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArchive, FiCalendar } from "react-icons/fi";

export default function AssessmentsPanel({ dataByYear = {} }) {
  const router = useRouter();
  const curYear = new Date().getFullYear();

  const allYears = useMemo(
    () =>
      Object.keys(dataByYear)
        .map((y) => Number(y))
        .filter((y) => !Number.isNaN(y))
        .sort((a, b) => b - a),
    [dataByYear]
  );

  const currentList = dataByYear[String(curYear)] || [];
  const earlierYears = allYears.filter((y) => y !== curYear);
  const earlierGroups = earlierYears.map((y) => ({
    year: y,
    items: dataByYear[String(y)] || [],
  }));

  const hasAny =
    currentList.length > 0 ||
    earlierGroups.some((g) => Array.isArray(g.items) && g.items.length > 0);

  const [open, setOpen] = useState(true);
  const [currentOpen, setCurrentOpen] = useState(true);
  const [earlierOpen, setEarlierOpen] = useState(true);
  const [preview, setPreview] = useState(null);
  const [conductingId, setConductingId] = useState(null);

const goConduct = async (item) => {
  try {
    setConductingId(item.id); 
    sessionStorage.setItem(
      "activeAssessment",
      JSON.stringify({
        id: item.id,
        unit: item.unit,
        year: String(curYear),
        type: item.typeValue,
        typeLabel: item.typeLabel,
        date: item.date || "",
        from: "planassess",
        payload: item.payload || {},
      })
    );
    router.push("/industry/freeassessment/conductassess");
  } catch (e) {
    console.error(e);
    setConductingId(null); 
  }
};

  return (
    <section className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-3 py-2 md:py-3 rounded-md bg-[#050038] text-white shadow-lg"
        title={open ? "Collapse" : "Expand"}
      >
        <span className="text-base md:text-lg font-semibold">Assessments</span>
        <Chevron isOpen={open} />
      </button>

      <div
        className={`transition-[max-height,opacity] duration-300 ${
          open ? "max-h-[3000px] opacity-100 mt-2" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-2 bg-white rounded-md shadow-md">
          {!hasAny && (
            <Notice type="neutral" className="mb-3">
              Nothing to show yet. Select an assessment type & year in Scheduling, then save.
            </Notice>
          )}

          <MiniAccordion
            title={`Current Year (${curYear})`}
            Icon={FiCalendar}
            open={currentOpen}
            onToggle={() => setCurrentOpen((v) => !v)}
          >
           <ListOrEmpty
                  items={currentList}
                  emptyText="No assessments for the current year."
                  onView={setPreview}
                  onConduct={goConduct}
                  showConduct
                  conductingId={conductingId}   // ← add this
                />
          </MiniAccordion>

          <MiniAccordion
            title="Earlier Years"
            Icon={FiArchive}
            open={earlierOpen}
            onToggle={() => setEarlierOpen((v) => !v)}
          >
            {earlierGroups.length === 0 ? (
              <Notice type="neutral">No earlier-year assessments.</Notice>
            ) : (
              <div className="space-y-3">
                {earlierGroups.map((g) => (
                  <div key={g.year} className="border border-gray-200 rounded-md p-2">
                    <div className="text-sm font-semibold text-[#0b2a5a] mb-1">{g.year}</div>
                    <ListOrEmpty
                      items={g.items}
                      emptyText={`No assessments in ${g.year}.`}
                      onView={setPreview}
                    />
                  </div>
                ))}
              </div>
            )}
          </MiniAccordion>

          {preview && (
            <div className="mt-3 p-3 rounded-md bg-white shadow border border-gray-200">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-sm font-semibold text-[#0b2a5a]">{preview.name}</div>
                  <div className="text-[12px] text-gray-600">
                    Unit: <b>{preview.unit}</b>
                    {preview.date ? (
                      <>
                        {" "}
                        · Date: <span>{preview.date}</span>
                      </>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="text-xs text-[#050038] hover:underline"
                  title="Close"
                >
                  Close
                </button>
              </div>
              <div className="text-[12px] text-gray-700">
                Type: <b>{preview.typeLabel}</b>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ListOrEmpty({
  items,
  emptyText,
  onView,
  onConduct,
  showConduct = false,
  conductingId = null,   
}) {
  if (!items || items.length === 0) {
    return <Notice type="neutral" className="mt-2">{emptyText}</Notice>;
  }
  return (
    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {items.map((it) => (
        <div key={it.id} className="p-2 border border-gray-200 rounded-md">
          <div className="text-[13px] font-semibold text-[#0b2a5a]">{it.name}</div>
          <div className="text-[12px] text-gray-600">
            Unit: <b>{it.unit}</b>
            {it.date ? (
              <>
                {" "}
                · Date: <span>{it.date}</span>
              </>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onView?.(it)}
              className="px-2 h-8 rounded-md text-xs font-medium text-white bg-[#050038] hover:opacity-90"
              title="View"
            >
              View
            </button>
              {showConduct && (
        <button
          type="button"
          onClick={() => onConduct?.(it)}
          disabled={conductingId === it.id}
          className={`px-2 h-8 rounded-md text-xs font-medium text-white ${
            conductingId === it.id
              ? "bg-green-600/60 cursor-not-allowed"
              : "bg-green-600 hover:opacity-90"
          }`}
          title="Conduct this assessment"
        >
            {conductingId === it.id ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z" />
                </svg>
                Loading…
              </span>
            ) : (
              "Conduct Assessment"
            )}
          </button>
        )}
                </div>
              </div>
            ))}
          </div>
        );
      }

        function MiniAccordion({ title, Icon, open, onToggle, children }) {
          return (
            <div className="rounded-md border border-gray-200 overflow-hidden mb-2">
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50"
                title={open ? "Collapse" : "Expand"}
              >
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b2a5a]">
                  {Icon ? <Icon /> : null}
                  {title}
                </span>
                <Chevron isOpen={open} />
              </button>
              <div
                className={`transition-[max-height,opacity] duration-300 ${
                  open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                <div className="p-2">{children}</div>
              </div>
            </div>
          );
        }

        function Notice({ type = "neutral", className = "", children }) {
          const cls =
            type === "neutral"
              ? "bg-gray-50 border-gray-200 text-gray-700"
              : type === "info"
              ? "bg-blue-50 border-blue-200 text-blue-800"
              : "bg-gray-50 border-gray-200 text-gray-700";
          return (
            <div className={`px-3 py-2 text-[12px] border rounded-md ${cls} ${className}`}>
              {children}
            </div>
          );
        }

        function Chevron({ isOpen }) {
          return (
            <svg
              className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          );
        }


