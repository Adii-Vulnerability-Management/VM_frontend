import React, { useState, useEffect , useRef } from "react";
import AssessmentTable from "./AssessmentTable";


// Online/Mobile Products and Technology Services questions
const initialQuestions = [
  {
    id: 1,
    text: "Issue debit or credit cards",
    options: {
      Least: "Do not issue debit or credit cards",
      Minimal:
        "Issue debit and/or credit cards through a third party; <10,000 cards outstanding",
      Moderate:
        "Issue debit or credit cards through a third party; between 10,000–50,000 cards outstanding",
      Significant:
        "Issue debit or credit cards directly; between 50,000–100,000 cards outstanding",
      Most: "Issue debit or credit cards directly; >100,000 cards outstanding; issue cards on behalf of other financial institutions",
    },
  },
  {
    id: 2,
    text: "Prepaid cards",
    options: {
      Least: "Do not issue prepaid cards",
      Minimal:
        "Issue prepaid cards through a third party; <5,000 cards outstanding",
      Moderate:
        "Issue prepaid cards through a third party; 5,000–10,000 cards outstanding",
      Significant:
        "Issue prepaid cards through a third party; 10,001–20,000 cards outstanding",
      Most: "Issue prepaid cards internally, through a third party, or on behalf of other financial institutions; >20,000 cards outstanding",
    },
  },
  {
    id: 3,
    text: "Emerging payments technologies (e.g., digital wallets, mobile wallets)",
    options: {
      Least: "Do not accept or use emerging payments technologies",
      Minimal:
        "Indirect acceptance or use; customer use may affect deposit or credit account",
      Moderate:
        "Direct acceptance or use; partner or co-brand with non-bank providers; limited transaction volume",
      Significant:
        "Direct acceptance or use; small transaction volume; no foreign payments",
      Most: "Direct acceptance; moderate transaction volume and/or foreign payments",
    },
  },
  {
    id: 4,
    text: "Person-to-person payments (P2P)",
    options: {
      Least: "Not offered",
      Minimal:
        "Customers allowed to originate payments; <1,000 customers or monthly volume <50,000",
      Moderate:
        "Customers allowed to originate payments; 1,000–5,000 customers or monthly volume 50,000–100,000",
      Significant:
        "Customers allowed to originate payments; 5,001–10,000 customers or monthly volume 100,001–1,000,000",
      Most: "Customers allowed to request or originate payments; >10,000 customers or monthly volume >1,000,000",
    },
  },
  {
    id: 5,
    text: "Originating ACH payments",
    options: {
      Least: "No ACH origination",
      Minimal: "Originate ACH credits; daily volume <3% of total assets",
      Moderate:
        "Originate ACH debits and credits; daily volume 3%–5% of total assets",
      Significant:
        "Sponsor third-party processor; daily volume 6%–25% of total assets",
      Most: "Sponsor nested processors; daily volume >25% of total assets",
    },
  },
  {
    id: 6,
    text: "Originating wholesale payments (e.g., CHIPS)",
    options: {
      Least: "Do not originate wholesale payments",
      Minimal: "Daily volume <3% of total assets",
      Moderate: "Daily volume 3%–5% of total assets",
      Significant: "Daily volume 6%–25% of total assets",
      Most: "Daily volume >25% of total assets",
    },
  },
  {
    id: 7,
    text: "Wire transfers",
    options: {
      Least: "Not offered",
      Minimal: "In-person only; domestic only; volume <3% of assets",
      Moderate: "In-person, phone, fax; domestic 3%–5%; international <3%",
      Significant: "Online, text, email; domestic 6%–25%; international 3%–10%",
      Most: "Online, text, email; domestic >25%; international >10%",
    },
  },
  {
    id: 8,
    text: "Merchant remote deposit capture (RDC)",
    options: {
      Least: "Do not offer Merchant RDC",
      Minimal: "<100 merchant clients; volume <3% of assets",
      Moderate: "100–500 clients; volume 3%–5% of assets",
      Significant: "501–1,000 clients; volume 6%–25% of assets",
      Most: ">1,000 clients; volume >25% of assets",
    },
  },
  {
    id: 9,
    text: "Global remittances",
    options: {
      Least: "Do not offer global remittances",
      Minimal: "Volume <3% of assets",
      Moderate: "Volume 3%–5% of assets",
      Significant: "Volume 6%–25% of assets",
      Most: "Volume >25% of assets",
    },
  },
  {
    id: 10,
    text: "Treasury services and clients",
    options: {
      Least: "No treasury management services",
      Minimal: "<1,000 clients; limited services",
      Moderate: "Lockbox, ACH, RDC; 1,000–10,000 clients",
      Significant: "Receivables & liquidity; 10,001–20,000 clients",
      Most: "Full suite; >20,000 clients",
    },
  },
  {
    id: 11,
    text: "Trust services",
    options: {
      Least: "Trust services not offered",
      Minimal: "Offered through third party; AUM < $500M",
      Moderate: "Provided directly; AUM $500M–$999M",
      Significant: "Provided directly; AUM $1B–$10B",
      Most: "Provided directly; AUM > $10B",
    },
  },
  {
    id: 12,
    text: "Act as a correspondent bank (Interbank transfers)",
    options: {
      Least: "Do not act as a correspondent bank",
      Minimal: "Correspondent for <100 institutions",
      Moderate: "Correspondent for 100–250 institutions",
      Significant: "Correspondent for 251–500 institutions",
      Most: "Correspondent for >500 institutions",
    },
  },
  {
    id: 13,
    text: "Merchant acquirer (sponsor merchants or card processor)",
    options: {
      Least: "Do not act as a merchant acquirer",
      Minimal: "<1,000 merchants",
      Moderate: "Outsource processing; 1,000–10,000 merchants",
      Significant: "Processor for 10,001–100,000 merchants",
      Most: ">100,000 merchants",
    },
  },
  {
    id: 14,
    text: "Host IT services for other organizations (joint or admin support)",
    options: {
      Least: "Do not provide IT services for other orgs",
      Minimal: "For affiliated orgs only",
      Moderate: "Up to 25 unaffiliated orgs",
      Significant: "26–50 unaffiliated orgs",
      Most: ">50 unaffiliated orgs",
    },
  },
];

export default function OnlineMobileAndServices({ answers, onChange }) {
  return (
    <AssessmentTable
      questions={initialQuestions}
      riskLevels={["Least", "Minimal", "Moderate", "Significant", "Most"]}
      answers={answers}
      onChange={onChange}
    />
  );
}