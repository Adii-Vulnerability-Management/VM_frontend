// src/cmp/pages/EditWebsite.js
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import Link from "next/link";
import LoginSettingsForm from "./LoginSettingsForm";
import { BiArrowBack } from "react-icons/bi";
import Tour from "@/components/Tour/Tour";
import GuideButton from "@/components/Tour/GuideButton";

export default function EditWebsite() {
  const [form, setForm] = useState({
    domain: "",
    defaultLang: "",
    bannerConfigId: "",
    scanFrequency: "daily",
    scanTime: "02:00",
    scanDay: "Sunday",
    customCron: "",
    loginSettings: {
      loginPath: "/login",
      loginUsername: "",
      loginPassword: "",
      usernameSelectors: ["#username", "input[name*=user]"],
      passwordSelectors: ["#password", "input[type=password]"],
      submitSelectors: ["button[type=submit]", "input[type=submit]"],
    },
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [tourOpen, setTourOpen] = useState(false);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setFetching(true);
    CustomAxios.get(`${baseurl}/${initURL}/cmp/websites/${id}`)
      .then((res) => {
        if (!isMounted) return;
        const {
          domain,
          defaultLang,
          bannerConfigId,
          scanFrequency = "daily",
          scanTime = "02:00",
          scanDay = "Sunday",
          customCron = "",
          loginSettings = {},
        } = res.data || {};
        setForm((f) => ({
          ...f,
          domain: domain ?? f.domain,
          defaultLang: defaultLang ?? f.defaultLang,
          bannerConfigId: bannerConfigId ?? f.bannerConfigId,
          scanFrequency,
          scanTime,
          scanDay,
          customCron,
          loginSettings: {
            loginPath: loginSettings.loginPath || f.loginSettings.loginPath,
            loginUsername: loginSettings.loginUsername || "",
            loginPassword: loginSettings.loginPassword || "",
            usernameSelectors:
              loginSettings.usernameSelectors ||
              f.loginSettings.usernameSelectors,
            passwordSelectors:
              loginSettings.passwordSelectors ||
              f.loginSettings.passwordSelectors,
            submitSelectors:
              loginSettings.submitSelectors || f.loginSettings.submitSelectors,
          },
        }));
      })
      .catch(console.error)
      .finally(() => setFetching(false));

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await CustomAxios.patch(`${baseurl}/${initURL}/cmp/websites/${id}`, form);
      router.push("/admin/scanner/websites");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scheduleSummary = useMemo(() => {
    if (form.customCron?.trim()) return `Custom cron: ${form.customCron}`;
    const t = form.scanTime || "02:00";
    if (form.scanFrequency === "hourly") return "Every hour (IST)";
    if (form.scanFrequency === "daily") return `Daily at ${t} (IST)`;
    if (form.scanFrequency === "weekly")
      return `Every ${form.scanDay} at ${t} (IST)`;
    return "";
  }, [form.scanFrequency, form.scanTime, form.scanDay, form.customCron]);

  // ---------- IDs inside LoginSettingsForm (we pass these as props) ----------
  const loginFieldIds = {
    path: "ls-loginPath",
    username: "ls-username",
    password: "ls-password",
    userSelectors: "ls-userSel",
    passSelectors: "ls-passSel",
    submitSelectors: "ls-submitSel",
  };

  // ---------- Tour: brief for Website & Scan; detailed for each login input ---
  const tourSteps = useMemo(
    () => [
      {
        target: "#websiteSection",
        title: "1) Website",
        content:
          "Set the domain and default language. Manage the banner config from here.",
      },

      // Login section – each input gets its own step:
      {
        target: "#loginSection",
        title: "2) Login Settings",
        content:
          "Tell the scanner how to authenticate before crawling protected pages.",
      },
      {
        target: `#${loginFieldIds.path}`,
        title: "Login Path",
        content: "Where the scanner should navigate for login, e.g., /login.",
        placement: "bottom",
      },
      {
        target: `#${loginFieldIds.username}`,
        title: "Username",
        content: "Username used to sign in during the scan.",
        placement: "bottom",
      },
      {
        target: `#${loginFieldIds.password}`,
        title: "Password",
        content: "Password used to sign in (stored securely on your side).",
        placement: "bottom",
      },
      {
        target: `#${loginFieldIds.userSelectors}`,
        title: "Username Field Selectors",
        content:
          "CSS selectors for the username input. You can provide multiple; the first match is used.",
        placement: "bottom",
      },
      {
        target: `#${loginFieldIds.passSelectors}`,
        title: "Password Field Selectors",
        content: "CSS selectors for the password input (multiple allowed).",
        placement: "bottom",
      },
      {
        target: `#${loginFieldIds.submitSelectors}`,
        title: "Submit Button Selectors",
        content: "CSS selectors to find and click the login submit element.",
        placement: "bottom",
      },

      // Scan section brief:
      {
        target: "#scanSection",
        title: "3) Scan Schedule",
        content:
          "Pick hourly/daily/weekly, or use Custom Cron for advanced timing.",
        placement: "top",
      },
    ],
    [],
  );
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 bg-white rounded-lg p-5 my-3">
        {/* Header */}
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex items-center justify-between">
          <div>
            <h1 id="hdrTitle" className="text-3xl font-bold text-cyan-50">
              Edit Website
            </h1>
            <p className="mt-1 text-sm text-white">
              Configure domain, banner, login, and scan schedule.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              title="Back to Website list"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white text-[#2B245C] px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-blue-50 transition-all"
            >
              <BiArrowBack size={18} />
              Back
            </button>

            <Link
              href={
                form.bannerConfigId
                  ? `/admin/scanner/banner-configs/${form.bannerConfigId}?wId=${id}`
                  : `/admin/scanner/banner-configs/new?wId=${id}`
              }
              className="rounded-lg bg-blue-50 text-[#2B245C] px-5 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-blue-100 transition-all"
            >
              Manage Banner Configuration
            </Link>

            {/* Guide button in header */}
            <GuideButton
              onClick={() => setTourOpen(true)}
              variant="primary"
              size="md"
              className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
            >
              Guide
            </GuideButton>
          </div>
        </div>

        {/* Body */}
        <div className="py-5 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Domain & Language */}
            <Section id="websiteSection" title="Website">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Domain" required>
                  <input
                    name="domain"
                    value={form.domain}
                    onChange={handleChange}
                    required
                    placeholder="example.com"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </Field>

                <Field
                  label="Default Language"
                  required
                  hint="ISO code or readable (e.g. en, en-US, English)"
                >
                  <input
                    name="defaultLang"
                    value={form.defaultLang}
                    onChange={handleChange}
                    required
                    placeholder="en"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </Field>

                <div className="md:col-span-2">
                  <InlineCallout>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-medium text-gray-800">
                        Banner configuration
                      </span>
                      <Link
                        href={
                          form.bannerConfigId
                            ? `/admin/scanner/banner-configs/${form.bannerConfigId}?wId=${id}`
                            : `/admin/scanner/banner-configs/new?wId=${id}`
                        }
                        className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                      >
                        {form.bannerConfigId ? "Edit banner" : "Create banner"}
                      </Link>
                      {form.bannerConfigId && (
                        <span className="text-xs text-gray-500">
                          ID: {form.bannerConfigId}
                        </span>
                      )}
                    </div>
                  </InlineCallout>
                </div>
              </div>
            </Section>

            {/* Login Settings */}
            <Section
              id="loginSection"
              title="Login Settings"
              subtitle="Optional: provide credentials and selectors for authenticated scanning."
            >
              <LoginSettingsForm
                loginSettings={form.loginSettings}
                onChange={setForm}
                // 👇 pass explicit IDs so Tour can target real inputs
                fieldIds={loginFieldIds}
              />
            </Section>

            {/* Scan Schedule */}
            <Section
              id="scanSection"
              title="Scan Schedule"
              subtitle="Choose how frequently to crawl and scan your site."
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Frequency
                  </label>
                  <div className="mt-2 inline-flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-1">
                    {["hourly", "daily", "weekly"].map((freq) => (
                      <label
                        key={freq}
                        className={`relative cursor-pointer select-none px-4 py-2 text-sm font-medium capitalize transition ${form.scanFrequency === freq ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
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
                        name="scanTime"
                        value={form.scanTime}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </Field>

                    {form.scanFrequency === "weekly" && (
                      <Field label="Day">
                        <select
                          name="scanDay"
                          value={form.scanDay}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        >
                          {[
                            "Sunday",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                          ].map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                  </div>
                )}

                <details className="rounded-xl border border-gray-200 bg-white p-4 open:shadow-sm">
                  <summary className="cursor-pointer select-none text-sm font-semibold text-indigo-700">
                    Advanced: Custom Cron
                  </summary>
                  <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        name="customCron"
                        placeholder="e.g. 0 3 * * 1-5"
                        value={form.customCron}
                        onChange={handleChange}
                        className="block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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

                <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3">
                  <span className="text-sm text-gray-700">
                    Schedule summary
                  </span>
                  <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm">
                    {scheduleSummary}
                  </span>
                </div>
              </div>
            </Section>

            {/* Actions - sticky footer */}
            <div className="sticky bottom-0 z-10 -mx-4 border-t bg-white/80 px-4 py-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="hidden text-sm text-gray-500 sm:block">
                  Make sure you save your changes.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center rounded-lg border border-[#2B245C] bg-white px-5 py-2 text-sm font-medium text-[#2B245C] shadow-sm hover:bg-blue-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-lg bg-[#2B245C] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? "Saving…" : "Update"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {fetching && (
          <div className="fixed inset-0 z-20 grid place-items-center bg-white/70">
            <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"></span>
              <span className="text-sm text-gray-700">Loading website…</span>
            </div>
          </div>
        )}
      </div>

      {/* Tour */}
      <Tour
        steps={tourSteps}
        open={tourOpen}
        onClose={() => setTourOpen(false)}
      />
    </div>
  );
}

// ————————————————————————————
// Small UI helpers
function Section({ id, title, subtitle, children }) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-[#2B245C]">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-gray-700">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

function InlineCallout({ children }) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
      {children}
    </div>
  );
}
