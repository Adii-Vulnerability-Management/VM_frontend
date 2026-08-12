import React, { useMemo, useState } from "react";
import Pagination from "@/components/ui/Pagination";

export default function CombinedMaturityTable({ answers = {} }) {
  // 1. Flatten all answer arrays into one list, preserving top-level domain keys
  const flatEntries = useMemo(
    () =>
      Object.entries(answers).flatMap(([domainKey, entries]) =>
        entries.map((e) => ({
          ...e,
          _domainKey: domainKey,
        }))
      ),
    [answers]
  );

  // 2. Map each entry into a row object matching the table header
  const allRows = useMemo(() => {
    return flatEntries.map((e, idx) => {
      // Use the explicit domain from the entry if present, otherwise fallback to the parent key
      const domain = e.domain || e._domainKey;
      const { factor, component, maturity, response, statement } = e;
      // flag values
      const isY = response === "Y" ? 1 : 0;
      const isYC = response === "Y(C)" ? 1 : 0;
      const isN = response === "N" ? 1 : 0;
      const isNA = response === "N/A" ? 1 : 0;
      // DS columns: counts
      const DS_Y = isY;
      const DS_YC = isYC;
      const DS_N = isN;
      const DS_NA = isNA;
      const DS_Total = DS_Y + DS_YC + DS_N + DS_NA;

      return {
        id: idx + 1,
        domain,
        factor,
        component,
        maturityLevel: maturity,
        Y: isY ? "Yes" : "",
        YC: isYC ? "Yes" : "",
        N: isN ? "Yes" : "",
        NA: isNA ? "Yes" : "",
        DS_Y,
        DS_YC,
        DS_N,
        DS_NA,
        DS_Total,
        statement,
      };
    });
  }, [flatEntries]);

  // 3. Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(allRows.length / rowsPerPage);
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return allRows.slice(start, start + rowsPerPage);
  }, [allRows, currentPage]);

  return (
    <div className="overflow-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">ID           </th>
            <th className="border px-2 py-1">Domain</th>
            <th className="border px-2 py-1">Assessment Factor</th>
            <th className="border px-2 py-1">Component</th>
            <th className="border px-2 py-1">Maturity Level</th>
            <th className="border px-2 py-1 text-center">Y</th>
            <th className="border px-2 py-1 text-center">Y(C)</th>
            <th className="border px-2 py-1 text-center">N</th>
            <th className="border px-2 py-1 text-center">N/A</th>
            <th className="border px-2 py-1 text-center">DS Y</th>
            <th className="border px-2 py-1 text-center">DS Y(C)</th>
            <th className="border px-2 py-1 text-center">DS N</th>
            <th className="border px-2 py-1 text-center">DS N/A</th>
            <th className="border px-2 py-1 text-center">DS Total</th>
            <th className="border px-2 py-1">Statement</th>
          </tr>
        </thead>
        <tbody>
          {pagedRows.map((r, i) => (
            <tr key={r.id} className={i % 2 ? "bg-gray-50" : "bg-white"}>
              <td className="border px-2 py-1">{r.id}</td>
              <td className="border px-2 py-1">{r.domain}</td>
              <td className="border px-2 py-1">{r.factor}</td>
              <td className="border px-2 py-1">{r.component}</td>
              <td className="border px-2 py-1">{r.maturityLevel}</td>
              <td className="border px-2 py-1 text-center">{r.Y}</td>
              <td className="border px-2 py-1 text-center">{r.YC}</td>
              <td className="border px-2 py-1 text-center">{r.N}</td>
              <td className="border px-2 py-1 text-center">{r.NA}</td>
              <td className="border px-2 py-1 text-center">{r.DS_Y}</td>
              <td className="border px-2 py-1 text-center">{r.DS_YC}</td>
              <td className="border px-2 py-1 text-center">{r.DS_N}</td>
              <td className="border px-2 py-1 text-center">{r.DS_NA}</td>
              <td className="border px-2 py-1 text-center">{r.DS_Total}</td>
              <td className="border px-2 py-1">{r.statement}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => p >= 1 && p <= totalPages && setCurrentPage(p)}
      />
    </div>
  );
}
