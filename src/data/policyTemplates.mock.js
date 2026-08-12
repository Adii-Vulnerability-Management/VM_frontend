// pages/operations/policy/ai-dummy.js

export const dummyVariants = [
  {
    id: "variant-1",
    title: "Change Management Policy — Standard",
    defaultName: "Change Management Policy — Standard - Template",
    html: `
        <h1>Change Management Policy — Standard</h1>
        <p>This is a dummy preview of a standard Change Management Policy.</p>
        <h2>Purpose</h2>
        <p>Define how changes are planned, approved, and tracked.</p>
      `,
    docx_b64: null,
    filename: "Change Management Policy — Standard.docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  {
    id: "variant-2",
    title: "Change Management Policy — Enterprise",
    defaultName: "Change Management Policy — Enterprise - Template",
    html: `
        <h1>Change Management Policy — Enterprise</h1>
        <p>This is a dummy preview of an enterprise-level Change Management Policy.</p>
        <h2>Scope</h2>
        <p>Applies to all systems, applications, and business units.</p>
      `,
    docx_b64: null,
    filename: "Change Management Policy — Enterprise.docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  {
    id: "variant-3",
    title: "Change Management Policy — Lean",
    defaultName: "Change Management Policy — Lean - Template",
    html: `
        <h1>Change Management Policy — Lean</h1>
        <p>This is a dummy preview of a lightweight Change Management Policy.</p>
        <h2>Principles</h2>
        <p>Automation first, peer reviews, and frequent small changes.</p>
      `,
    docx_b64: null,
    filename: "Change Management Policy — Lean.docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
];

export const framework_juridiction_sector_data = {
  frameworks: [
    "Global",
    "ISO/IEC 27001",
    "ISO/IEC 27002",
    "ISO/IEC 27701",
    "ISO/IEC 27017",
    "ISO/IEC 27018",
    "ISO 22301",
    "ISO 31000",
    "IEC 62443",
    "NIST CSF",
    "NIST SP 800-53 Rev.5",
    "NIST SP 800-171",
    "FedRAMP",
    "FISMA",
    "SOC 2",
    "CIS Controls v8",
    "OWASP ASVS",
    "PCI DSS v4.0",
    "ITIL",
    "COBIT 2019",
    "GDPR",
    "CCPA/CPRA",
    "UK GDPR",
    "PIPEDA",
    "LGPD",
    "PDPA (Singapore)",
    "DPDP Act 2023 (India)",
    "POPIA",
    "DIFC DP Law",
    "HIPAA",
    "HITRUST CSF",
    "SOX",
    "GLBA",
    "NYDFS 23 NYCRR 500",
    "DORA",
    "MAS TRM",
    "RBI Guidelines",
    "SEBI Guidelines",
    "IRDAI Guidelines",
    "NERC CIP",
    "CJIS",
  ],

  jurisdictions: [
    "Global",
    "EU/EEA",
    "EFTA",
    "GCC",
    "APAC",
    "LATAM",
    "US",
    "EU",
    "UK",
    "Canada",
    "India",
    "Singapore",
    "UAE",
    "Saudi Arabia",
    "Australia",
    "New Zealand",
    "Japan",
    "South Korea",
    "China",
    "Hong Kong SAR",
    "Brazil",
    "Mexico",
    "South Africa",
    "Nigeria",
    "Egypt",
    "Turkey",
    "Switzerland",
    "Norway",
    "Israel",
  ],

  sectors: [
    "Generic",
    "Technology / SaaS",
    "Healthcare / Hospitals",
    "Pharma / Biotech",
    "Finance / Banking",
    "FinTech",
    "Insurance",
    "Government / Public Sector",
    "Defense / Aerospace",
    "Manufacturing",
    "Industrial / OT / ICS",
    "Energy / Utilities / Oil & Gas",
    "Retail / eCommerce",
    "Telecommunications",
    "Media & Entertainment",
    "Education",
    "Transportation & Logistics",
    "Hospitality & Travel",
    "Real Estate / PropTech",
    "Legal / Professional Services",
    "Nonprofit / NGO",
  ],
};
