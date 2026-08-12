import React, { useState, useEffect, useRef } from "react";
import AssessmentTable from "./AssessmentTable";


// Questions for Delivery Channels
const initialQuestions = [
  {
    id: 1,
    text: "Online presence (customer)",
    options: {
      Least: "No Web-facing applications or social media presence",
      Minimal:
        "Serves as an informational Web site or social media page (e.g., provides branch and ATM locations and marketing materials)",
      Moderate:
        "Serves as a delivery channel for retail online banking; may communicate to customers through social media",
      Significant:
        "Serves as a delivery channel for wholesale customers; may include retail account origination",
      Most: "Internet applications serve as a channel to wholesale customers to manage large value assets",
    },
  },
  {
    id: 2,
    text: "Mobile presence",
    options: {
      Least: "None",
      Minimal: "SMS text alerts or notices only; browser-based access",
      Moderate:
        "Mobile banking application for retail customers (e.g., bill payment, mobile check capture, internal transfers only)",
      Significant:
        "Mobile banking application includes external transfers (e.g., for corporate clients, recurring external transactions)",
      Most: "Full functionality, including originating new transactions (e.g., ACH, wire)",
    },
  },
  {
    id: 3,
    text: "Automated Teller Machines (ATM) (Operation)",
    options: {
      Least: "No ATM services",
      Minimal: "ATM services offered but no owned machines",
      Moderate:
        "ATM services managed by a third party; ATMs at local and regional branches; cash reload services outsourced",
      Significant:
        "ATM services managed internally; ATMs at U.S. branches and retail locations; cash reload services outsourced",
      Most: "ATM services managed internally; ATM services provided to other financial institutions; ATMs at domestic and international branches and retail locations; cash reload services managed internally",
    },
  },
];

export default function DeliveryChannels({ answers, onChange }) {
  return (
    <AssessmentTable
      questions={initialQuestions}
      riskLevels={["Least", "Minimal", "Moderate", "Significant", "Most"]}
      answers={answers}
      onChange={onChange}
    />
  );
}
  