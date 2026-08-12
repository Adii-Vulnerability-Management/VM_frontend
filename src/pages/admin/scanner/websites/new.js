// src/cmp/pages/NewWebsite.js
import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import Tour from "@/components/Tour/Tour";
import GuideButton from "@/components/Tour/GuideButton";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const langExamples = ["en", "fr", "de", "es", "hi"];

// ---------- Domain helpers ----------
/** Safely extract a hostname from arbitrary user input. */
function extractHostname(raw) {
  if (!raw) return "";
  let v = String(raw).trim();
  v = v.replace(/\s+/g, "").replace(/[\u200B-\u200D\uFEFF]/g, "");
  try {
    const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(v);
    const u = new URL(hasScheme ? v : `http://${v}`);
    v = u.hostname;
  } catch {
    v = v
      .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
      .replace(/^:\/\//, "")
      .split("/")[0]
      .split("?")[0]
      .split("#")[0]
      .split("@")
      .pop()
      .split(":")[0];
  }
  v = v.replace(/\.$/, "").toLowerCase();
  return v;
}

/** Strong domain regex: labels 1–63, no leading/trailing hyphens, TLD letters only, total ≤ 253. */
const DOMAIN_REGEX =
  /^(?=.{1,253}$)(?!.*\.\.)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*\.[a-z]{2,}$/i;

/** Validate hostname per common DNS rules (ASCII hostnames). Returns '' if OK, else message. */
function validateHostname(host) {
  if (!host) return "Please enter a domain.";
  if (host.includes("_")) return "Underscores are not allowed in domain names.";
  if (host.startsWith("-") || host.endsWith("-"))
    return "Domain cannot start or end with a hyphen.";
  if (host.includes(".."))
    return 'Domain cannot contain empty labels (e.g., "..").';
  const labels = host.split(".");
  if (labels.some((l) => l.length === 0))
    return "Domain contains an empty label.";
  if (labels.some((l) => l.length > 63))
    return "Each label must be at most 63 characters.";
  if (host.length > 253) return "Full domain must be at most 253 characters.";
  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,}$/i.test(tld))
    return 'The top-level domain must contain only letters (e.g., ".com", ".io").';
  if (!DOMAIN_REGEX.test(host)) return "Enter a valid domain like example.com";
  return "";
}

export default function NewWebsite() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tourOpen, setTourOpen] = useState(false);
  const [form, setForm] = useState({
    protocol: "https://",
    domain: "",
    defaultLang: "",
    scanFrequency: "daily", // hourly | daily | weekly
    scanTime: "02:00", // HH:MM
    scanDay: "Sunday", // for weekly
    customCron: "", // advanced override
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "domain") {
      setForm((f) => ({ ...f, domain: value }));
      return;
    }
    if (name === "protocol") {
      const v =
        value === "http://" || value === "https://" ? value : "https://";
      setForm((f) => ({ ...f, protocol: v }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const schedulePreview = useMemo(() => {
    if (form.customCron.trim())
      return `Using custom cron: ${form.customCron.trim()}`;
    if (form.scanFrequency === "hourly") return "Every hour (IST)";
    if (form.scanFrequency === "daily")
      return `Daily at ${form.scanTime} (IST)`;
    if (form.scanFrequency === "weekly")
      return `Every ${form.scanDay} at ${form.scanTime} (IST)`;
    return "";
  }, [form]);

  // -------- Simplified Tour: 6 short steps --------
  const tourSteps = useMemo(
    () => [
      {
        target: "#domain",
        title: "Domain",
        content:
          "Enter the hostname only (no paths). Choose protocol on the left.",
        gap: 8,
      },
      {
        target: "#defaultLang",
        title: "Default language",
        content: "Primary language code, e.g., en / hi / fr.",
      },
      {
        target: "#freqGroup",
        title: "Frequency",
        content: "Pick hourly, daily, or weekly for scans.",
      },
      {
        target: "#scanTime",
        title: "Scan time",
        content: "Set the time (IST). For weekly, pick a day too.",
        placement: "right",
      },
      {
        target: "#schedulePreview",
        title: "Preview",
        content: "This shows exactly when scans will run.",
        placement: "left",
      },
      // If you prefer only 5 steps, remove the Preview step or the Advanced step.
    ],
    [form.scanFrequency],
  );
  // -----------------------------------------------

  const validate = () => {
    const host = extractHostname(form.domain);
    const hostErr = validateHostname(host);
    if (hostErr) return hostErr;
    if (form.protocol !== "http://" && form.protocol !== "https://")
      return "Please select a valid protocol.";
    if (!form.defaultLang) return "Please enter a default language (e.g., en).";
    if (form.customCron && !/^[\d*?,/ -]+$/.test(form.customCron.trim())) {
      return "Custom cron looks invalid.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      const cleanHost = extractHostname(form.domain);
      const payload = {
        defaultLang: form.defaultLang.trim(),
        scanFrequency: form.scanFrequency,
        scanTime: form.scanTime,
        scanDay: form.scanDay,
        customCron: form.customCron.trim(),
        domain: `${form.protocol}${cleanHost}`,
      };
      await CustomAxios.post(`${baseurl}/${initURL}/cmp/websites`, payload);
      router.push("/admin/scanner/websites");
    } catch (err) {
      console.error(err);
      setError("Could not create website. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-5">
      <div className="mx-2 min-h-screen bg-white rounded-lg p-5">
        {/* Header */}
        <div className="p-6 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-white hover:text-gray-200 border border-gray-600 px-3 py-2 rounded-xl mb-2 hover:border-gray-400"
          >
            ← Back
          </button>
          <div className="flex justify-between item-center">
            <div>
              <h1 className="text-3xl font-semibold text-cyan-50">
                New Website
              </h1>
              <p className="text-sm text-white mt-1">
                Add a site and choose when the scanner should run.
              </p>
            </div>
            <div>
              <GuideButton
                onClick={() => setTourOpen(true)}
                variant="primary"
                size="md"
                className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="py-5">
          <form onSubmit={handleSubmit} className="space-y-8">
            <Section title="Basics">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field
                    label="Domain"
                    hint="Select protocol and enter domain, e.g., example.com"
                    required
                  >
                    <div className="mt-2 flex overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                      <select
                        name="protocol"
                        value={form.protocol}
                        onChange={handleChange}
                        className="bg-gray-50 border-r border-gray-200 px-2 py-2 text-gray-700 focus:outline-none"
                        aria-label="Protocol"
                      >
                        <option value="http://">http://</option>
                        <option value="https://">https://</option>
                      </select>
                      <input
                        id="domain"
                        name="domain"
                        placeholder="example.com"
                        value={form.domain}
                        onChange={handleChange}
                        required
                        className="flex-1 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none"
                        autoComplete="off"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      We’ll store the protocol separately; don’t include paths
                      or trailing slashes.
                    </p>
                  </Field>

                  <div className="mt-6 md:mt-4">
                    <Field
                      label="Default Language"
                      hint={`e.g., ${langExamples.join(", ")}`}
                      required
                    >
                      <input
                        id="defaultLang"
                        name="defaultLang"
                        placeholder="en"
                        value={form.defaultLang}
                        onChange={handleChange}
                        required
                        className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </Section>

            <Section
              title="Scan Schedule"
              subtitle="Choose how frequently to crawl and scan your site."
            >
              <div className="space-y-6">
                {/* Frequency segmented buttons */}
                <div id="freqGroup">
                  <label className="block text-sm font-medium text-gray-700">
                    Frequency
                  </label>
                  <div className="mt-2 inline-flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-1">
                    {["hourly", "daily", "weekly"].map((freq) => (
                      <label
                        key={freq}
                        className={`relative cursor-pointer select-none px-4 py-2 text-sm font-medium capitalize transition ${
                          form.scanFrequency === freq
                            ? "bg-white text-indigo-700 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <input
                          type="radio"
                          name="scanFrequency"
                          value={freq}
                          checked={form.scanFrequency === freq}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        {freq}
                      </label>
                    ))}
                  </div>
                </div>

                {(form.scanFrequency === "daily" ||
                  form.scanFrequency === "weekly") && (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field label="Time (IST)">
                      <input
                        type="time"
                        id="scanTime"
                        name="scanTime"
                        value={form.scanTime}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </Field>

                    {form.scanFrequency === "weekly" && (
                      <Field label="Day">
                        <select
                          id="scanDay"
                          name="scanDay"
                          value={form.scanDay}
                          onChange={handleChange}
                          className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        >
                          {days.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                  </div>
                )}

                {/* Advanced cron */}
                <details
                  name="customCron"
                  className="rounded-xl border border-gray-200 bg-white p-4 open:shadow-sm"
                >
                  <summary className="cursor-pointer select-none text-sm font-semibold text-indigo-700">
                    Advanced: Custom Cron
                  </summary>
                  <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        placeholder="e.g. 0 3 * * 1-5"
                        value={form.customCron}
                        onChange={handleChange}
                        className="block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Leave blank to use the preset schedule above. Format:
                        min hour day month weekday
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                      <p className="font-medium text-gray-700">Examples</p>
                      <ul className="mt-1 list-disc pl-5">
                        <li>
                          Every weekday at 03:00 → <code>0 3 * * 1-5</code>
                        </li>
                        <li>
                          Every 6 hours → <code>0 */6 * * *</code>
                        </li>
                        <li>
                          At 02:00 on the 1st → <code>0 2 1 * *</code>
                        </li>
                      </ul>
                    </div>
                  </div>
                </details>

                {/* Summary */}
                <div
                  id="schedulePreview"
                  className="flex items-center justify-between rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3"
                >
                  <span className="text-sm text-gray-700">
                    Schedule preview
                  </span>
                  <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm">
                    {schedulePreview}
                  </span>
                </div>
              </div>
            </Section>

            {/* Sticky footer */}
            <div className="sticky bottom-0 z-10 -mx-4 border-t bg-white/80 px-4 py-4 backdrop-blur">
              <div className="flex items-center justify-between">
                {error ? (
                  <p className="text-sm text-red-600">{error}</p>
                ) : (
                  <p className="hidden text-sm text-gray-500 sm:block">
                    You can edit this later from the websites list.
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-lg border border-[#2B245C] bg-white px-10 py-2 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    id="createBtn"
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-[#2B245C] border border-[#2B245C] text-white px-10 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white"></span>
                        Creating…
                      </>
                    ) : (
                      "Create"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Tour
        steps={tourSteps}
        open={tourOpen}
        onClose={() => setTourOpen(false)}
      />

    </div>
  );
}

/* ---------- Small UI helpers (same as Edit page) ---------- */
function Section({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-[#2B245C]">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}
