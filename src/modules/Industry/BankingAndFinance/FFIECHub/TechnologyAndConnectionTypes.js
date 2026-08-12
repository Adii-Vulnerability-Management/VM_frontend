import AssessmentTable from "./AssessmentTable";
// import initialQuestions from "@/data/techAndConnectionQuestions";
const initialQuestions = [
  {
    id: 1,
    text: "Total number of Internet service provider (ISP) connections (including branch connections)",
    options: {
      Least: "No connections",
      Minimal: "Minimal complexity (1–20 connections)",
      Moderate: "Moderate complexity (21–100 connections)",
      Significant: "Significant complexity (101–200 connections)",
      Most: "Substantial complexity (>200 connections)",
    },
  },
  {
    id: 2,
    text: "Unsecured external connections (FTP, Telnet, rlogin count)",
    options: {
      Least: "None",
      Minimal: "Few instances (1–5)",
      Moderate: "Several instances (6–10)",
      Significant: "Significant instances (11–25)",
      Most: "Substantial instances (>25)",
    },
  },
  {
    id: 3,
    text: "Wireless network access",
    options: {
      Least: "No wireless access",
      Minimal: "Separate guest & corporate APs",
      Moderate: "Logical separation; 1–250 users; 1–25 APs",
      Significant: "251–1,000 users; 26–100 APs",
      Most: ">1,000 users; >100 APs",
    },
  },
  {
    id: 4,
    text: "Personal devices allowed to connect to corporate network",
    options: {
      Least: "None",
      Minimal: "<5% employees; email only",
      Moderate: "<10% employees; email only",
      Significant: "<25% employees; email & some apps",
      Most: ">25% employees; all apps accessed",
    },
  },
  {
    id: 5,
    text: "Third parties with access to internal systems",
    options: {
      Least: "No third-party access",
      Minimal: "1–5 parties; <50 users",
      Moderate: "6–10 parties; 50–500 users",
      Significant: "11–25 parties; 501–1,500 users",
      Most: ">25 parties; >1,500 users",
    },
  },
  {
    id: 6,
    text: "Wholesale customers with dedicated connections",
    options: {
      Least: "None",
      Minimal: "1–5 connections",
      Moderate: "6–10 connections",
      Significant: "11–25 connections",
      Most: ">25 connections",
    },
  },
  {
    id: 7,
    text: "Internally hosted or modified vendor apps supporting critical activities",
    options: {
      Least: "No applications",
      Minimal: "1–5 apps",
      Moderate: "6–10 apps",
      Significant: "11–25 apps",
      Most: ">25 apps",
    },
  },
  {
    id: 8,
    text: "Vendor-developed apps supporting critical activities",
    options: {
      Least: "0–5 apps",
      Minimal: "6–30 apps",
      Moderate: "31–75 apps",
      Significant: "76–200 apps",
      Most: ">200 apps",
    },
  },
  {
    id: 9,
    text: "User-developed tools (spreadsheets, databases)",
    options: {
      Least: "None",
      Minimal: "1–100",
      Moderate: "101–500",
      Significant: "501–2,500",
      Most: ">2,500",
    },
  },
  {
    id: 10,
    text: "End-of-life (EOL) systems",
    options: {
      Least: "None at or nearing EOL",
      Minimal: "Few at risk; none critical",
      Moderate: "Several at risk; some critical",
      Significant: "Many critical at EOL or at risk",
      Most: "Majority critical at EOL or unknown",
    },
  },
  {
    id: 11,
    text: "Open Source Software (OSS) usage",
    options: {
      Least: "No OSS",
      Minimal: "Limited OSS; none critical",
      Moderate: "Several OSS critical",
      Significant: "Large number OSS critical",
      Most: "Majority operations depend on OSS",
    },
  },
  {
    id: 12,
    text: "Network devices count (servers, routers, firewalls)",
    options: {
      Least: "<250 devices",
      Minimal: "250–1,500 devices",
      Moderate: "1,501–25,000 devices",
      Significant: "25,001–50,000 devices",
      Most: ">50,000 devices",
    },
  },
  {
    id: 13,
    text: "Third-party service providers (no internal access)",
    options: {
      Least: "None",
      Minimal: "1–25 providers",
      Moderate: "26–100 providers",
      Significant: "101–200; some foreign",
      Most: ">200; some foreign",
    },
  },
  {
    id: 14,
    text: "Cloud computing service providers",
    options: {
      Least: "No cloud providers",
      Minimal: "1–3 private cloud only",
      Moderate: "4–7 providers",
      Significant: "8–10; includes public/international",
      Most: ">10; includes public/international",
    },
  },
];
export default function TechnologyAndConnectionTypes({ answers, onChange }) {
  return (
    <AssessmentTable
      questions={initialQuestions}
      riskLevels={["Least", "Minimal", "Moderate", "Significant", "Most"]}
      answers={answers}
      onChange={onChange}
    />
  );
}
