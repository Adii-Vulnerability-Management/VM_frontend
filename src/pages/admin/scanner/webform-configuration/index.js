// components/WebformConfigurationTabs.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

// Adjust these paths to your project structure
import OptInFormBuilder from "../websites/i-webform";
import SelectorForm from "../websites/form";

export default function WebformConfigurationTabs() {
  const router = useRouter();

  const TABS = useMemo(
    () => [
      { key: "external", label: "Existing Webform Configuration" },
      { key: "internal", label: "New Webform Configuration" },
    ],
    [],
  );

  const isValidTab = (t) => TABS.some((x) => x.key === t);

  const [active, setActive] = useState("external");

  // Initialize from query (?tab=internal)
  useEffect(() => {
    if (!router.isReady) return;
    const qtab = typeof router.query.tab === "string" ? router.query.tab : "";
    setActive(isValidTab(qtab) ? qtab : "external");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // Keep query in sync with active tab (shallow replace)
  useEffect(() => {
    if (!router.isReady) return;
    const current =
      typeof router.query.tab === "string" ? router.query.tab : "";
    if (active !== current) {
      router.replace(
        { pathname: router.pathname, query: { ...router.query, tab: active } },
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
      {/* <div className="m-8 mt-12 rounded-2xl bg-white shadow-sm ring-1 ring-black/5"> */}
      <div className="mx-5 bg-white rounded-lg p-5 my-3">
        {/* Header */}
        {/* <div className="p-6"> */}

        <header className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <h1 className="text-3xl font-bold text-cyan-50">
            Webform Configuration
          </h1>
          <p className="mt-1 text-sm text-white">
            Configure consent capture for your site. Use{" "}
            <strong>Existing</strong> to map an existing form; use{" "}
            <strong>New Webform</strong> to build a new form you can embed or open
            from any link.
          </p>
        </header>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Webform Configuration Sections"
          className="relative flex w-full items-center gap-1.5 overflow-x-auto rounded-lg bg-gray-50 p-1 mt-5"
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
        {/* </div> */}

        {/* Panels (no extra padding from the outer card) */}
        <section className="mt-5">
          {/* External Webform Configuration */}
          <div
            role="tabpanel"
            id="panel-external"
            aria-labelledby="tab-external"
            hidden={active !== "external"}
            className="animate-[fadeIn_200ms_ease-out]"
          >
            <div className="rounded-xl border border-gray-200">
              {/* Info bar */}
              <div className="flex items-start gap-3 border-b border-gray-200 rounded-xl bg-gray-50 px-4 py-3">
                <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-sm text-gray-600">
                  Configure your <strong>existing</strong> form on the website.
                  You can also trigger the consent UI by binding it to{" "}
                  <em>any link click</em> (e.g., “Subscribe”, “Join”).
                </p>
              </div>
              {/* No extra padding wrapper here — the child component controls its own spacing */}
              <SelectorForm />
            </div>
          </div>

          {/* Internal Webform Configuration */}
          <div
            role="tabpanel"
            id="panel-internal"
            aria-labelledby="tab-internal"
            hidden={active !== "internal"}
            className="animate-[fadeIn_200ms_ease-out]"
          >
            <div className="rounded-xl border border-gray-200">
              {/* Info bar */}
              <div className="flex items-start gap-3 border-b border-gray-200 rounded-xl bg-gray-50 px-4 py-3">
                <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-indigo-500" />
                <p className="text-sm text-gray-600">
                  Build a <strong>new</strong> webform you can embed anywhere on
                  your site, or open programmatically / on link click.
                </p>
              </div>
              {/* No extra padding wrapper here either */}
              <OptInFormBuilder />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
