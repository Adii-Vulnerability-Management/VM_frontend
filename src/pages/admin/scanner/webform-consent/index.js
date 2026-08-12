// pages/webform-consent.jsx
import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

// load Tour dynamically to avoid SSR issues
const Tour = dynamic(() => import("@/components/Tour/Tour"), { ssr: false });
import { useRouter } from "next/router";
import SelectorRunSummaryDashboard from "../websites/form-result";
import SubmissionsDashboard from "../websites/i-webform/submissions";
import GuideButton from "@/components/Tour/GuideButton";

export default function WebformConsentPage() {
  const router = useRouter();

  const TABS = useMemo(
    () => [
      // { key: "combined", label: "Combined Webform Consent" },F
      { key: "external", label: "Existing Webform Consent" },
      { key: "internal", label: "New Webform Consent" },
    ],
    [],
  );

  const isValidTab = (t) => TABS.some((x) => x.key === t);

  const [active, setActive] = useState("external");
  const [tourOpen, setTourOpen] = useState(false);

  const tourSteps = useMemo(() => {
    // Steps tailored per tab
    if (active === "external") {
      return [
        {
          target: '[data-tour="external-overview"]',
          title: "Existing Webform Consent",
          content:
            "Overview of recent existing webform consent activity and trends.",
        },
        {
          target: '[data-tour="external-list"]',
          title: "Runs & Results",
          content: "Browse recent runs, inspect responses and consent counts.",
        },
      ];
    }
    if (active === "internal") {
      return [
        {
          target: '[data-tour="internal-overview"]',
          title: "New Webform Consent",
          content:
            "Overview of new form submission activity and detailed submissions list.",
        },
        {
          target: '[data-tour="internal-list"]',
          title: "Submissions",
          content: "Inspect individual submissions and processing status.",
        },
      ];
    }
    // combined
    // return [
    //   {
    //     target: '[data-tour="combined-left"]',
    //     title: "Combined View - Left",
    //     content: "Summary of external consent activity and recent runs.",
    //   },
    //   {
    //     target: '[data-tour="combined-right"]',
    //     title: "Combined View - Right",
    //     content: "Submissions and internal activity side-by-side.",
    //   },
    // ];
  }, [active]);

  // Initialize from query (?tab=internal) once router is ready
  useEffect(() => {
    if (!router.isReady) return;
    const qtab = typeof router.query.tab === "string" ? router.query.tab : "";
    setActive(isValidTab(qtab) ? qtab : "external");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // Keep query in sync with active tab (shallow replace, no scroll)
  useEffect(() => {
    if (!router.isReady) return;
    const current =
      typeof router.query.tab === "string" ? router.query.tab : "";
    if (active !== current) {
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, tab: active },
        },
        undefined,
        { shallow: true, scroll: false },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, router.isReady]);

  const handleKeyDown = (e, idx) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    let nextIndex = idx;
    if (e.key === "ArrowRight") nextIndex = (idx + 1) % TABS.length;
    if (e.key === "ArrowLeft")
      nextIndex = (idx - 1 + TABS.length) % TABS.length;
    if (e.key === "Home") nextIndex = 0;
    if (e.key === "End") nextIndex = TABS.length - 1;
    const nextKey = TABS[nextIndex].key;
    setActive(nextKey);
    if (typeof document !== "undefined") {
      const btn = document.querySelector(`[data-tab="${nextKey}"]`);
      if (btn) btn.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-cyan-50">
                Webform Consent Dashboard
              </h1>
              <p className="mt-1 text-sm text-white">
                Review and compare existing and new webform consent
                activity.
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

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Webform Consent Sections"
          className="relative my-4 flex w-full items-center gap-1 overflow-x-auto bg-gray-50 border-b border-gray-200 p-1"
        >
          {TABS.map((tab, idx) => {
            const selected = active === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${tab.key}`}
                id={`tab-${tab.key}`}
                data-tab={tab.key}
                onClick={() => setActive(tab.key)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={[
                  "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition",
                  selected
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Panels */}
        <section className="mt-4">
          {/* External */}
          <div
            role="tabpanel"
            id="panel-external"
            aria-labelledby="tab-external"
            hidden={active !== "external"}
            data-tour="external-overview"
            className="animate-[fadeIn_200ms_ease-out]"
          >
            <div className="rounded-xl border border-[#2B245C]">
              <div data-tour="external-list">
                <SelectorRunSummaryDashboard />
              </div>
            </div>
          </div>

          {/* Internal */}
          <div
            role="tabpanel"
            id="panel-internal"
            aria-labelledby="tab-internal"
            hidden={active !== "internal"}
            data-tour="internal-overview"
            className="animate-[fadeIn_200ms_ease-out]"
          >
            <div className="rounded-xl border border-[#2B245C]">
              <div data-tour="internal-list">
                <SubmissionsDashboard />
              </div>
            </div>
          </div>

          {/* Combined */}
          {/* <div
            role="tabpanel"
            id="panel-combined"
            aria-labelledby="tab-combined"
            hidden={active !== "combined"}
            data-tour="combined-overview"
            className="animate-[fadeIn_200ms_ease-out]"
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-stretch">
              <div className="h-full rounded-xl border border-[#2B245C] overflow-hidden bg-gray-50">
                <div data-tour="combined-left" className="h-full">
                  <SelectorRunSummaryDashboard />
                </div>
              </div>
              <div className="h-full rounded-xl border border-[#2B245C] overflow-hidden bg-gray-50">
                <div data-tour="combined-right" className="h-full">
                  <SubmissionsDashboard />
                </div>
              </div>
            </div>
          </div> */}
        </section>
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
