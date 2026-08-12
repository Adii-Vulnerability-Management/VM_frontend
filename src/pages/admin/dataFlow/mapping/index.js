import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DataFlowNav from "../Nav";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";

// Define sections with categories ___
const sections = [
  {
    href: "./mapping/vendors",
    title: "Vendors",
    desc: "Manage processors/sub-processors and contracts.",
    category: "Data Privacy Program",
    tourId: "card-vendors",
  },
  {
    href: "./mapping/bpa",
    title: "Activities (BPA)",
    desc: "Define processing activities and governance details.",
    category: "Data Privacy Program",
    tourId: "card-bpa",
  },
  {
    href: "./mapping/system-activities",
    title: "System Activities",
    desc: "Link activities to assets/vendors & security posture.",
    category: "Data Privacy Program",
    tourId: "card-system-activities",
  },
  {
    href: "./mapping/flows",
    title: "Flows",
    desc: "Create edges between system activities (transfers).",
    category: "Data Privacy Program",
    tourId: "card-flows",
  },
  {
    href: "./framework-topics",
    title: "Framework Topics",
    desc: "Generate topics for popular frameworks.",
    category: "Data Privacy Program",
    tourId: "card-framework-topics",
  },
  {
    href: "./framework-map",
    title: "Framework Map (Citations)",
    desc: "Create and maintain mappings between compliance frameworks and topics.",
    category: "Data Privacy Program",
    tourId: "card-framework-map",
  },
  {
    href: "./mapping/coverage",
    title: "Coverage Matrix",
    desc: "See framework coverage for a BPA.",
    category: "Data Privacy Program",
    tourId: "card-coverage-matrix",
  },
  {
    href: "./coverage",
    title: "Data Mapping",
    desc: "Visualize your data flows across systems and vendors.",
    category: "Data Privacy Program",
    tourId: "card-coverage",
  },
  {
    href: "./mapping/ropa",
    title: "ROPA",
    desc: "Generate GDPR records.",
    category: "Data Privacy Program",
    tourId: "card-ropa",
  },

  // --- Data taxonomy (clean hierarchy) ---
  {
    href: "./dataCategories",
    title: "Data Categories",
    desc: "Bucket data elements (Identifiers, Financial, Health, Biometric, Device/Online, etc.).",
    category: "Data Dictionary",
    tourId: "card-data-categories",
  },
  {
    href: "./dataClassifications",
    title: "Data Classification",
    desc: "Policy labels applied to elements (and optionally categories) for handling and access controls.",
    category: "Data Dictionary",
    tourId: "card-data-classifications",
  },
  {
    href: "./dataSubjects",
    title: "Data Subject Types",
    desc: "Define who the data is about (customer, employee, vendor contact, patient, etc.).",
    category: "Data Dictionary",
    tourId: "card-data-subjects",
  },
  {
    href: "./dataElements",
    title: "Data Elements",
    desc: "Define what fields you collect and link them to subject types, categories, classification, and purposes.",
    category: "Data Dictionary",
    tourId: "card-data-elements",
  },
  {
    href: "./purposes",
    title: "Purposes",
    desc: "Define why data is processed (account creation, fraud prevention, marketing, support, analytics, etc.).",
    category: "Data Dictionary",
    tourId: "card-purposes",
  },

  {
    href: "./retention/retentionPolicies",
    title: "Data Retention Policies",
    desc: "Define how long different categories of data are retained before deletion or anonymization.",
    category: "Data Retention and Entities",
    tourId: "card-retention-policies",
  },
  {
    href: "./retention/retentionRules",
    title: "Data Retention Rules",
    desc: "Define retention rules and policies that determine when and how data is archived, deleted, or anonymized.",
    category: "Data Retention and Entities",
    tourId: "card-retention-rules",
  },
  {
    href: "./entities",
    title: "Entities",
    desc: "Manage your entities here.",
    category: "Data Retention and Entities",
    tourId: "card-entities",
  },
];

function SectionGrid({ title, category, tourKey, items }) {
  return (
    <div
      className="mb-8 rounded-2xl border border-[#2B245C]/20 bg-white p-5 shadow-sm"
      data-tour={tourKey}
    >
      <h2 className="text-2xl font-semibold text-[#2B245C] mb-4">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items
          .filter((s) => s.category === category)
          .map((s) => (
            <Link
              key={s.href}
              href={s.href}
              data-tour={s.tourId}
              className="group block rounded-xl border border-[#2B245C] bg-gray-50 p-5 shadow-md hover:shadow-lg hover:border-black hover:bg-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="text-lg font-semibold text-[#2B245C] mb-2">
                  {s.title}
                </div>
              </div>
              <div className="text-sm text-gray-800">{s.desc}</div>
            </Link>
          ))}
      </div>
    </div>
  );
}

export default function MappingHome() {
  const [tourOpen, setTourOpen] = useState(false);

  // Add scoped class to body for tour CSS fixes
  useEffect(() => {
    document.body.classList.add("mapping-home-tour-scope");
    return () => document.body.classList.remove("mapping-home-tour-scope");
  }, []);

  const steps = useMemo(
    () => [
      {
        target: '[data-tour="page-title"]',
        title: "Data-Flow Mapping",
        content:
          "This page is your starting point for mapping BPAs, systems, vendors, and flows. Use it to build lineage and generate governance outputs like Coverage and ROPA.",
        placement: "bottom",
      },
      {
        target: '[data-tour="primary-sections"]',
        title: "Data Privacy Program",
        content:
          "This section contains the core building blocks of your privacy program. Here you define business processes (BPAs), the systems that handle data, the vendors involved, and how data moves between them. These mappings power compliance reporting, risk assessments, and outputs like Coverage and ROPA.",
        placement: "bottom",
      },
      {
        target: '[data-tour="card-vendors"]',
        title: "Vendors",
        content:
          "Register processors/sub-processors and store contract details (like DPA/BAA). Once saved, vendors can be linked in System Activities and Flows so reports can flag missing vendor documentation.",
        placement: "right",
      },
      {
        target: '[data-tour="card-bpa"]',
        title: "Activities (BPA)",
        content:
          "Create a Business Process Activity (BPA) for each business process (onboarding, payroll, marketing, etc.). BPAs are required for linking systems/vendors and generating Coverage and ROPA summaries.",
        placement: "right",
      },
      {
        target: '[data-tour="card-system-activities"]',
        title: "System Activities",
        content:
          "Attach a BPA to the real systems that process the data (CRM, HRIS, cloud apps). System Activities become the anchor for flows, coverage calculations, vendor checks, and ROPA entries.",
        placement: "right",
      },
      {
        target: '[data-tour="card-flows"]',
        title: "Flows",
        content:
          "Define transfers between system activities. Saved flows become part of your lineage graph and help identify cross-border transfers and gaps. Without flows you see systems, but not how data moves between them.",
        placement: "right",
      },
      {
        target: '[data-tour="card-framework-topics"]',
        title: "Framework Topics",
        content:
          "Create reusable control topics (e.g., Encryption, Vendor DPAs, Retention). These topics power Coverage scoring and framework reporting.",
        placement: "right",
      },
      {
        target: '[data-tour="card-framework-map"]',
        title: "Framework Map (Citations)",
        content:
          "Map your internal topics to specific framework clauses/citations. This lets Coverage reports reference the correct regulatory citations.",
        placement: "right",
      },
      {
        target: '[data-tour="card-coverage-matrix"]',
        title: "Coverage Matrix",
        content:
          "Assess framework/topic coverage for a selected BPA. This highlights what’s complete and what’s missing across key control areas.",
        placement: "right",
      },
      {
        target: '[data-tour="card-coverage"]',
        title: "Data Mapping",
        content:
          "Visualize your data flows across systems and vendors. This interactive map helps identify data movement, cross-border transfers, and potential risks in your processing activities.",
        placement: "right",
      },
      {
        target: '[data-tour="card-ropa"]', 
        title: "ROPA",
        content:
          "Generate GDPR Records of Processing Activities for a BPA using your mapped systems, vendors, and flows.",
        placement: "right",
      },
      {
        target: '[data-tour="secondary-sections"]',
        title: "Data Dictionary",
        content:
          "These modules standardize the vocabulary for what data you process, who it relates to, how sensitive it is, and why it’s processed.",
        placement: "top",
      },
      {
        target: '[data-tour="card-data-categories"]',
        title: "Data Categories",
        content:
          "Create reusable category buckets like PII–Contact Info or Financial Records. Categories become standardized options across mapping pages.",
        placement: "right",
      },
      {
        target: '[data-tour="card-data-classifications"]',
        title: "Data Classification",
        content:
          "Define sensitivity tiers (Public, Internal, Confidential, Restricted). These labels support handling rules and access/security expectations.",
        placement: "right",
      },
      {
        target: '[data-tour="card-data-subjects"]',
        title: "Data Subject Types",
        content:
          "Define who the data is about (customers, employees, patients, vendors, etc.). This is reused across elements, BPAs, and retention rules.",
        placement: "right",
      },
      {
        target: '[data-tour="card-data-elements"]',
        title: "Data Elements",
        content:
          "Catalog specific fields (SSN, Payroll ID, Device Location). Link each element to subjects, categories, classifications (and purposes) to describe your data precisely.",
        placement: "right",
      },
      {
        target: '[data-tour="card-purposes"]',
        title: "Purposes",
        content:
          "Define why data is processed (account creation, fraud prevention, marketing, analytics, support). Purposes improve reporting and regulatory justification.",
        placement: "right",
      },
      {
        target: '[data-tour="retention-sections"]',
        title: "Data Retention and Entities",
        content:
          "Define how long data is kept and which entity owns processing. Policies define the intent; rules apply it to specific data and scope.",
        placement: "top",
      },
      {
        target: '[data-tour="card-retention-policies"]',
        title: "Data Retention Policies",
        content:
          "Create reusable retention policy documents (owner, description, tags, default period, references). This is the high-level policy layer.",
        placement: "right",
      },
      {
        target: '[data-tour="card-retention-rules"]',
        title: "Data Retention Rules",
        content:
          "Apply a policy to specific categories/elements with an exact retention period/condition and an end action (delete/anonymize/archive). Rules can be tenant-wide or scoped.",
        placement: "right",
      },
      {
        target: '[data-tour="card-entities"]',
        title: "Entities",
        content:
          "Manage legal entities/business units so governance, retention ownership, and reporting attribution are correct across your organization.",
        placement: "right",
      },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DataFlowNav />

      {/* Scoped CSS fix for Tour "Next btn" overflow */}
      <style jsx global>{`
        body.mapping-home-tour-scope
          .flex.items-center.justify-between.gap-3.pt-3.border-t.border-gray-100 {
          flex-wrap: wrap !important;
        }

        body.mapping-home-tour-scope
          .flex.items-center.justify-between.gap-3.pt-3.border-t.border-gray-100
          > .flex.items-center.gap-2 {
          width: 100% !important;
        }

        body.mapping-home-tour-scope
          .flex.items-center.justify-between.gap-3.pt-3.border-t.border-gray-100
          > .flex.gap-2 {
          margin-left: auto !important;
        }
      `}</style>

      <div className="bg-white min-h-screen rounded-lg p-5 my-3 mx-5">
        {/* Header */}
        <div
          data-tour="page-title"
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 relative"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">
                Data-Flow Mapping
              </h1>
              <p className="mt-1 text-sm text-white">
                Define activities, connect systems, trace flows, and generate
                governance outputs.
              </p>
            </div>

            {/* Help button (opens tour) */}
            <div data-tour="help-button" className="flex items-center">
              <GuideButton
                onClick={() => setTourOpen(true)}
                variant="primary"
                size="md"
                className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
              >
                Help
              </GuideButton>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="py-6">
          <SectionGrid
            title="Data Privacy Program"
            category="Data Privacy Program"
            tourKey="primary-sections"
            items={sections}
          />

          <SectionGrid
            title="Data Dictionary"
            category="Data Dictionary"
            tourKey="secondary-sections"
            items={sections}
          />

          <div
            className="mt-8 rounded-2xl border border-[#2B245C]/20 bg-white p-5 shadow-sm"
            data-tour="retention-sections"
          >
            <h2 className="text-2xl font-semibold text-[#2B245C] mb-4">
              Data Retention and Entities
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sections
                .filter((s) => s.category === "Data Retention and Entities")
                .map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    data-tour={s.tourId}
                    className="group block rounded-xl border border-[#2B245C] bg-gray-50 p-5 shadow-md hover:shadow-lg hover:border-black hover:bg-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-lg font-semibold text-[#2B245C] mb-3">
                        {s.title}
                      </div>
                    </div>
                    <div className="text-sm text-gray-800">{s.desc}</div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>

      <Tour steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}
