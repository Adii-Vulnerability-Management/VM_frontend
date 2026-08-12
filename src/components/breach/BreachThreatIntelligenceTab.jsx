import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";

import breachService from "@/services/breachService";

const CVE_PATTERN = /^CVE-[0-9]{4}-[0-9]{4,19}$/;

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}

function getErrorMessage(error, fallback) {
  const responseMessage = error?.response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join(" ");
  }

  return (
    responseMessage ||
    error?.response?.data?.errors?.message ||
    error?.message ||
    fallback
  );
}

function StatusBadge({ status }) {
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
        Matched
      </span>
    );
  }

  if (status === "NOT_FOUND") {
    return (
      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
        Not Found
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
      {status || "Unknown"}
    </span>
  );
}

export default function BreachThreatIntelligenceTab({
  breachId,
  canUpdate = true,
}) {
  const [cveId, setCveId] = useState("");
  const [indicators, setIndicators] = useState([]);
  const [intelligenceStatus, setIntelligenceStatus] =
    useState(null);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedIndicator, setSelectedIndicator] =
    useState(null);

  const applyListResponse = useCallback((response) => {
    const payload = response?.data?.data || {};

    setIndicators(
      Array.isArray(payload.indicators)
        ? payload.indicators
        : [],
    );

    setIntelligenceStatus(
      payload.intelligenceStatus || null,
    );
  }, []);

  const loadIndicators = useCallback(
    async ({ showLoader = true } = {}) => {
      if (!breachId) {
        setIndicators([]);
        setIntelligenceStatus(null);
        return;
      }

      if (showLoader) {
        setLoading(true);
      }

      setErrorMessage("");

      try {
        const response =
          await breachService.getThreatIndicators(
            breachId,
          );

        applyListResponse(response);
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Failed to load saved CVE intelligence.",
        );

        setErrorMessage(message);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [breachId, applyListResponse],
  );

  useEffect(() => {
    loadIndicators();
  }, [loadIndicators]);

  const normalizedCveId = useMemo(
    () => cveId.trim().toUpperCase(),
    [cveId],
  );

  const handleCveChange = (event) => {
    const value = event.target.value
      .toUpperCase()
      .replace(/\s+/g, "");

    setCveId(value);
  };

  const handleCheckCve = async (event) => {
    event.preventDefault();

    if (!breachId) {
      toast.error(
        "Save the breach before checking a CVE.",
      );
      return;
    }

    if (!canUpdate) {
      toast.error(
        "You do not have permission to add CVE intelligence.",
      );
      return;
    }

    if (!CVE_PATTERN.test(normalizedCveId)) {
      toast.error(
        "Enter a valid CVE ID, such as CVE-2021-44228.",
      );
      return;
    }

    setChecking(true);
    setErrorMessage("");

    try {
      const response =
        await breachService.addThreatIndicator(
          breachId,
          normalizedCveId,
        );

      const result = response?.data;

      toast.success(
        result?.message ||
          "CVE intelligence checked successfully.",
      );

      if (result?.warning) {
        toast.info(result.warning);
      }

      setCveId("");

      await loadIndicators({
        showLoader: false,
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Failed to check the CVE.",
      );

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setChecking(false);
    }
  };

  const handleViewIndicator = async (indicator) => {
    if (!indicator?.id || !breachId) {
      toast.error(
        "Threat indicator details are unavailable.",
      );
      return;
    }

    setSelectedIndicator(indicator);
    setDetailOpen(true);
    setDetailLoading(true);

    try {
      const response =
        await breachService.getThreatIndicator(
          breachId,
          indicator.id,
        );

      const detailedIndicator =
        response?.data?.data?.indicator;

      if (detailedIndicator) {
        setSelectedIndicator(detailedIndicator);
      }
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Failed to load CVE details.",
      );

      toast.error(message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    if (detailLoading) return;

    setDetailOpen(false);
    setSelectedIndicator(null);
  };

  if (!breachId) {
    return (
      <section className="space-y-6 rounded-b-lg bg-[#F4F4F9] p-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-lg font-semibold text-amber-900">
            Save the breach first
          </h2>

          <p className="mt-1 text-sm text-amber-800">
            A breach ID is required before CVE
            intelligence can be checked and linked to the
            breach.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-b-lg">
      <div>
        <h2 className="text-xl font-semibold text-[#2B245C]">
          Threat Intelligence
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Check CVEs (Common Vulnerabilities and Exposures) 
          against the locally synchronized CISA
          Known Exploited Vulnerabilities catalog.
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-sm font-semibold text-[#050038]">
          Privacy-safe local lookup
        </h3>

        <p className="mt-1 text-sm text-gray-700">
          The entered CVE is checked only against the local
          GRC3 intelligence database. Breach information and
          CVE values are not sent to CISA during this lookup.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Provider
          </p>

          <p className="mt-2 text-sm font-semibold text-[#050038]">
            {intelligenceStatus?.provider || "CISA_KEV"}
          </p>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Last synchronized
          </p>

          <p className="mt-2 text-sm font-semibold text-[#050038]">
            {formatDateTime(
              intelligenceStatus?.lastSyncedAt,
            )}
          </p>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Active KEV records
          </p>

          <p className="mt-2 text-sm font-semibold text-[#050038]">
            {typeof intelligenceStatus?.activeRecordCount ===
            "number"
              ? intelligenceStatus.activeRecordCount.toLocaleString()
              : "—"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
  <details>
    <summary className="cursor-pointer text-sm font-semibold text-[#2B245C]">
      How do I find the CVE ID?
    </summary>

    <div className="mt-4 space-y-3 text-sm text-gray-700">
      <p>
        A CVE ID is a vulnerability identifier such as{" "}
        <span className="font-semibold text-[#050038]">
          CVE-2021-44228
        </span>
        . It may appear in your security scanner, incident report,
        vendor advisory or patch notification.
      </p>

      <div>
        <p className="font-semibold text-[#050038]">
          Check these sources:
        </p>

        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Vulnerability scanner or penetration-test report</li>
          <li>SOC, SIEM, EDR or incident alert</li>
          <li>Software vendor security advisory</li>
          <li>Patch or upgrade notification</li>
          <li>NVD or CVE.org search using the product name</li>
        </ul>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
        <p className="font-semibold text-amber-900">
          Information you may need
        </p>

        <ul className="mt-1 list-disc space-y-1 pl-5 text-amber-800">
          <li>Vendor name</li>
          <li>Product or software name</li>
          <li>Installed version</li>
          <li>Vulnerability description or scanner finding</li>
        </ul>
      </div>

      <p className="text-xs text-gray-500">
        Do not enter breach descriptions, internal hostnames, IP
        addresses, customer information or investigation notes in this
        CVE field.
      </p>
    </div>
  </details>
</div>

      <form
        onSubmit={handleCheckCve}
        className="rounded-lg bg-white p-5 shadow-sm"
      >
        <h3 className="mb-4 text-base font-semibold text-[#050038]">
          Check CVE
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[180px_1fr_auto]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#2B245C]">
              Indicator Type
            </label>

            <select
              value="CVE"
              disabled
              className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-700"
            >
              <option value="CVE">CVE</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#2B245C]">
              CVE ID
            </label>

            <input
              type="text"
              value={cveId}
              onChange={handleCveChange}
              placeholder="Example: CVE-2021-44228"
              maxLength={28}
              autoComplete="off"
              disabled={!canUpdate || checking}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm uppercase focus:border-[#2B245C] focus:outline-none focus:ring-2 focus:ring-[#2B245C] disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={
                !canUpdate ||
                checking ||
                !normalizedCveId
              }
              className="w-full rounded-md bg-[#2B245C] px-5 py-2 text-sm font-medium text-white shadow transition hover:bg-[#050038] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              {checking
                ? "Checking..."
                : "Check Local Intelligence"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Version 0.1 supports CVE identifiers only. A
          no-match result does not mean the vulnerability is
          safe.
        </p>

        {!canUpdate && (
          <p className="mt-2 text-sm text-amber-700">
            You have read-only access to this section.
          </p>
        )}
      </form>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <div className="rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-[#050038]">
              Saved CVE Intelligence
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              CVEs checked and linked to this breach.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {indicators.length} record
              {indicators.length === 1 ? "" : "s"}
            </span>

            <button
              type="button"
              onClick={() => loadIndicators()}
              disabled={loading}
              className="rounded-md border border-[#2B245C] px-3 py-1.5 text-xs font-medium text-[#2B245C] transition hover:bg-[#2B245C] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-[#2B245C] text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">
                  CVE
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  Vendor
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  Product
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  CISA KEV Match
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  Status
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  Last Checked
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading CVE intelligence...
                  </td>
                </tr>
              ) : indicators.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No CVE intelligence has been linked to
                    this breach.
                  </td>
                </tr>
              ) : (
                indicators.map((indicator, index) => (
                  <tr
                    key={indicator.id}
                    className={
                      index % 2 === 0
                        ? "bg-white"
                        : "bg-[#F2F1FB]"
                    }
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#050038]">
                      {indicator.indicatorValue || "—"}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {indicator.vendorProject || "—"}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {indicator.product || "—"}
                    </td>

                    <td className="px-4 py-3">
                      {indicator.knownExploited ? (
                        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                          Known Exploited
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          No KEV Match
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        status={
                          indicator.enrichmentStatus
                        }
                      />
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {formatDateTime(
                        indicator.checkedAt,
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleViewIndicator(indicator)
                        }
                        className="rounded-md border border-[#2B245C] px-3 py-1 text-xs font-medium text-[#2B245C] transition hover:bg-[#2B245C] hover:text-white"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Catalog version:{" "}
          {intelligenceStatus?.catalogVersion || "—"}
        </p>
      </div>

      {detailOpen && selectedIndicator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close CVE details"
            className="absolute inset-0 bg-black/50"
            onClick={closeDetailModal}
          />

          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-[#2B245C]">
                  {selectedIndicator.indicatorValue}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Local CISA KEV intelligence result
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetailModal}
                disabled={detailLoading}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Close
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12 text-center text-gray-500">
                Loading CVE details...
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DetailItem
                    label="Status"
                    value={
                      selectedIndicator.enrichmentStatus
                    }
                  />

                  <DetailItem
                    label="Known Exploited"
                    value={
                      selectedIndicator.knownExploited
                        ? "Yes"
                        : "No KEV match"
                    }
                  />

                  <DetailItem
                    label="Vendor"
                    value={
                      selectedIndicator.vendorProject
                    }
                  />

                  <DetailItem
                    label="Product"
                    value={selectedIndicator.product}
                  />

                  <DetailItem
                    label="Vulnerability"
                    value={
                      selectedIndicator.vulnerabilityName
                    }
                  />

                  <DetailItem
                    label="Ransomware Campaign Use"
                    value={
                      selectedIndicator.knownRansomwareCampaignUse
                    }
                  />

                  <DetailItem
                    label="Date Added to KEV"
                    value={formatDate(
                      selectedIndicator.kevDateAdded,
                    )}
                  />

                  <DetailItem
                    label="CISA Due Date"
                    value={formatDate(
                      selectedIndicator.kevDueDate,
                    )}
                  />

                  <DetailItem
                    label="Source"
                    value={
                      selectedIndicator.sourceProvider
                    }
                  />

                  <DetailItem
                    label="Last Checked"
                    value={formatDateTime(
                      selectedIndicator.checkedAt,
                    )}
                  />
                </div>

                <DetailBlock
                  label="Description"
                  value={
                    selectedIndicator.shortDescription
                  }
                />

                <DetailBlock
                  label="Required Action"
                  value={
                    selectedIndicator.requiredAction
                  }
                />

                <DetailBlock
                  label="CWEs"
                  value={
                    Array.isArray(
                      selectedIndicator.cwes,
                    ) &&
                    selectedIndicator.cwes.length > 0
                      ? selectedIndicator.cwes.join(", ")
                      : "—"
                  }
                />

                {!selectedIndicator.knownExploited && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    No CISA KEV match does not mean this
                    vulnerability is safe or not
                    exploitable.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm text-gray-800">
        {value || "—"}
      </p>
    </div>
  );
}

function DetailBlock({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#2B245C]">
        {label}
      </p>

      <div className="mt-2 whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
        {value || "—"}
      </div>
    </div>
  );
}