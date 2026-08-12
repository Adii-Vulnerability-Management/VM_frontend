import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import breachService from "@/services/breachService";

const INITIAL_FORM = {
  organisationName: "",
  occurrenceStart: "",
  occurrenceEnd: "",
  occurrenceLocation: "",
  natureOfBreach: "",
  extentOfBreach: "",
  likelyImpact: "",
  additionalRemedialActions: "",
  contactName: "",
  contactDesignation: "",
  contactEmail: "",
  contactPhone: "",
  additionalNotes: "",
};

function toIsoDate(value) {
  if (!value) return undefined;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toISOString();
}

function displayValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function ReportField({ label, value }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap text-sm text-[#050038]">
        {displayValue(value)}
      </p>
    </div>
  );
}

export default function BreachBoardReportTab({
  breachId,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [previewResult, setPreviewResult] =
    useState(null);
  const [history, setHistory] = useState([]);
  const [previewing, setPreviewing] =
    useState(false);
  const [generating, setGenerating] =
    useState(false);
  const [loadingHistory, setLoadingHistory] =
    useState(false);
  const [
    downloadingVersion,
    setDownloadingVersion,
  ] = useState(null);

  const buildPayload = useCallback(
    () => ({
      ...form,
      occurrenceStart: toIsoDate(
        form.occurrenceStart,
      ),
      occurrenceEnd: toIsoDate(form.occurrenceEnd),
    }),
    [form],
  );

  const loadHistory = useCallback(async () => {
    if (!breachId) {
      setHistory([]);
      return;
    }

    try {
      setLoadingHistory(true);

      const { data } =
        await breachService.getBoardReportHistory(
          breachId,
        );

      setHistory(
        Array.isArray(data?.reports)
          ? data.reports
          : [],
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load Board report history.",
      );

      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [breachId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setPreviewResult(null);
  };

  const previewReport = async () => {
    if (!breachId) {
      toast.error(
        "Save or open a breach before previewing the report.",
      );
      return;
    }

    try {
      setPreviewing(true);

      const { data } =
        await breachService.previewBoardReport(
          breachId,
          buildPayload(),
        );

      setPreviewResult(data);

      if (data?.readyToGenerate) {
        toast.success(
          "Board report preview is ready.",
        );
      } else {
        toast.warning(
          "Complete the missing report information.",
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to preview the Board report.",
      );
    } finally {
      setPreviewing(false);
    }
  };

  const generateReport = async () => {
    if (!breachId) {
      toast.error(
        "Save or open a breach before generating the report.",
      );
      return;
    }

    try {
      setGenerating(true);

      const { data } =
        await breachService.generateBoardReport(
          breachId,
          buildPayload(),
        );

      toast.success(
        data?.version
          ? `Board report version ${data.version} generated.`
          : "Board report generated successfully.",
      );

      if (data?.report) {
        setPreviewResult({
          report: data.report,
          missingFields: [],
          readyToGenerate: true,
        });
      }

      await loadHistory();
    } catch (error) {
      const responseMessage =
        error?.response?.data?.message;

      const message = Array.isArray(
        responseMessage,
      )
        ? responseMessage.join(", ")
        : responseMessage;

      toast.error(
        message ||
          error?.message ||
          "Failed to generate the Board report.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const downloadPdf = async (version) => {
    if (!breachId) return;

    try {
      setDownloadingVersion(version);

      const response =
        await breachService.downloadBoardReportPdf(
          breachId,
          version,
        );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const objectUrl =
        window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      const disposition =
        response.headers?.[
          "content-disposition"
        ] || "";

      const match = disposition.match(
        /filename="?([^";]+)"?/i,
      );

      link.href = objectUrl;
      link.download =
        match?.[1] ||
        `data-protection-board-report-v${version}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to download the PDF.",
      );
    } finally {
      setDownloadingVersion(null);
    }
  };

  const report = previewResult?.report;

  const missingFields = Array.isArray(
    previewResult?.missingFields,
  )
    ? previewResult.missingFields
    : [];

  return (
    <section className="space-y-6 rounded-b-lg bg-[#F4F4F9] p-6">
      <div>
        <h2 className="text-xl font-semibold text-[#2B245C]">
          Data Protection Board Report
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Generate a versioned breach report covering
          the nature, extent, timing, location, likely
          impact, and remedial actions.
        </p>
      </div>

      {!breachId && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Save the breach first. The Board report can
          only be generated for an existing breach
          record.
        </div>
      )}

      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-[#050038]">
          Additional Report Information
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <label className="block text-sm font-semibold text-[#2B245C]">
            Organisation Name

            <input
              type="text"
              value={form.organisationName}
              onChange={(event) =>
                updateField(
                  "organisationName",
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-normal focus:border-[#2B245C] focus:ring-2 focus:ring-[#2B245C]"
            />
          </label>

          <label className="block text-sm font-semibold text-[#2B245C]">
            Occurrence Location

            <input
              type="text"
              value={form.occurrenceLocation}
              onChange={(event) =>
                updateField(
                  "occurrenceLocation",
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-normal focus:border-[#2B245C] focus:ring-2 focus:ring-[#2B245C]"
            />
          </label>

          <label className="block text-sm font-semibold text-[#2B245C]">
            Occurrence Start

            <input
              type="datetime-local"
              value={form.occurrenceStart}
              onChange={(event) =>
                updateField(
                  "occurrenceStart",
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-normal focus:border-[#2B245C] focus:ring-2 focus:ring-[#2B245C]"
            />
          </label>

          <label className="block text-sm font-semibold text-[#2B245C]">
            Occurrence End

            <input
              type="datetime-local"
              value={form.occurrenceEnd}
              onChange={(event) =>
                updateField(
                  "occurrenceEnd",
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-normal focus:border-[#2B245C] focus:ring-2 focus:ring-[#2B245C]"
            />
          </label>
        </div>

        <div className="mt-5 space-y-5">
          {[
            [
              "Nature of Breach",
              "natureOfBreach",
            ],
            [
              "Extent of Breach",
              "extentOfBreach",
            ],
            ["Likely Impact", "likelyImpact"],
            [
              "Additional Remedial Actions",
              "additionalRemedialActions",
            ],
            [
              "Additional Notes",
              "additionalNotes",
            ],
          ].map(([label, field]) => (
            <label
              key={field}
              className="block text-sm font-semibold text-[#2B245C]"
            >
              {label}

              <textarea
                rows={3}
                value={form[field]}
                onChange={(event) =>
                  updateField(
                    field,
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-normal focus:border-[#2B245C] focus:ring-2 focus:ring-[#2B245C]"
              />
            </label>
          ))}
        </div>

        <h3 className="mb-4 mt-6 text-base font-semibold text-[#050038]">
          Report Contact
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[
            ["Contact Name", "contactName", "text"],
            [
              "Designation",
              "contactDesignation",
              "text",
            ],
            ["Email", "contactEmail", "email"],
            ["Phone", "contactPhone", "text"],
          ].map(([label, field, type]) => (
            <label
              key={field}
              className="block text-sm font-semibold text-[#2B245C]"
            >
              {label}

              <input
                type={type}
                value={form[field]}
                onChange={(event) =>
                  updateField(
                    field,
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-normal focus:border-[#2B245C] focus:ring-2 focus:ring-[#2B245C]"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-200 pt-5">
          <button
            type="button"
            onClick={previewReport}
            disabled={
              !breachId ||
              previewing ||
              generating
            }
            className="rounded-md border border-[#2B245C] px-5 py-2 text-sm font-medium text-[#2B245C] transition hover:bg-[#F2F1FB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {previewing
              ? "Previewing..."
              : "Preview Report"}
          </button>

          <button
            type="button"
            onClick={generateReport}
            disabled={
              !breachId ||
              generating ||
              previewing ||
              !previewResult?.readyToGenerate
            }
            className="rounded-md bg-[#2B245C] px-5 py-2 text-sm font-medium text-white shadow transition hover:bg-[#050038] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating
              ? "Generating..."
              : "Generate Report"}
          </button>
        </div>
      </div>

      {previewResult && (
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-[#050038]">
              Report Preview
            </h3>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                previewResult.readyToGenerate
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {previewResult.readyToGenerate
                ? "Ready to generate"
                : "Missing information"}
            </span>
          </div>

          {missingFields.length > 0 && (
            <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                Required information still missing:
              </p>

              <p className="mt-1 text-sm text-amber-700">
                {missingFields.join(", ")}
              </p>
            </div>
          )}

          {report && (
            <div className="mt-5 space-y-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <ReportField
                  label="Breach Number"
                  value={
                    report.breachIdentification
                      ?.breachNumber
                  }
                />

                <ReportField
                  label="Breach Title"
                  value={
                    report.breachIdentification
                      ?.breachTitle
                  }
                />

                <ReportField
                  label="Status"
                  value={
                    report.breachIdentification
                      ?.status
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ReportField
                  label="Nature of Breach"
                  value={
                    report.natureAndExtent
                      ?.natureOfBreach
                  }
                />

                <ReportField
                  label="Extent of Breach"
                  value={
                    report.natureAndExtent
                      ?.extentOfBreach
                  }
                />

                <ReportField
                  label="Occurrence Location"
                  value={
                    report.timingAndLocation
                      ?.occurrenceLocation
                  }
                />

                <ReportField
                  label="Likely Impact"
                  value={
                    report.likelyImpact
                      ?.overallImpact
                  }
                />

                <ReportField
                  label="Root Cause / Investigation"
                  value={
                    report.causeAndInvestigation
                      ?.rootCause
                  }
                />

                <ReportField
                  label="Additional Remedial Actions"
                  value={
                    report.remedialActions
                      ?.additionalRemedialActions
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-[#050038]">
            Generated Report Versions
          </h3>

          <button
            type="button"
            onClick={loadHistory}
            disabled={
              !breachId || loadingHistory
            }
            className="text-sm font-medium text-[#2B245C] hover:underline disabled:opacity-50"
          >
            {loadingHistory
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-[#2B245C] text-white">
              <tr>
                <th className="px-4 py-3 text-left">
                  Version
                </th>

                <th className="px-4 py-3 text-left">
                  Generated At
                </th>

                <th className="px-4 py-3 text-left">
                  Generated By
                </th>

                <th className="px-4 py-3 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.version}>
                    <td className="px-4 py-3 font-medium text-[#050038]">
                      Version {item.version}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {item.generatedAt
                        ? new Date(
                            item.generatedAt,
                          ).toLocaleString()
                        : "—"}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {item.generatedByEmail ||
                        item.generatedBy ||
                        "—"}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          downloadPdf(
                            item.version,
                          )
                        }
                        disabled={
                          downloadingVersion ===
                          item.version
                        }
                        className="rounded-md border border-[#2B245C] px-3 py-1.5 text-sm font-medium text-[#2B245C] transition hover:bg-[#2B245C] hover:text-white disabled:opacity-50"
                      >
                        {downloadingVersion ===
                        item.version
                          ? "Downloading..."
                          : "Download PDF"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    {loadingHistory
                      ? "Loading report versions..."
                      : "No Board reports generated yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}