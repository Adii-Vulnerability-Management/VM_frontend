// src/modules/Industry/BankingAndFinance/FFIECHub/PartTwoCybersecurityMaturity.jsx
import React, { useState } from "react";
import {
  FaClipboardList,
  FaProjectDiagram,
  FaUsers,
  FaShieldAlt,
  FaChartPie,
  FaClipboardCheck,
  FaSave,
  FaPlay,
} from "react-icons/fa";
import TabNavBar from "@/components/layout/TabNavBar";

import DomainOneRiskManagementOversight from "./DomainOneRiskManagementOversight";
import DomainTwoThreatIntelligenceCollaboration from "./DomainTwoThreatIntelligenceCollaboration";
import DomainThreeCybersecurityControls from "./DomainThreeCybersecurityControls";
import DomainFourExternalDependencyManagement from "./DomainFourExternalDependencyManagement";
import DomainFiveCyberIncidentManagementAndResilience from "./DomainFiveCyberIncidentManagementAndResilience";
import MaturityRollup from "./MaturityRollup";
import MaturitySummary from "./MaturitySummary";
import CombinedMaturityTable from "./CombinedMaturityTable";

export default function PartTwoCybersecurityMaturity() {
  const steps = [
    {
      id: "DomainOneRiskManagementOversight",
      label: "Risk Mgmt & Oversight",
      icon: <FaProjectDiagram className="w-5 h-5" />,
      component: DomainOneRiskManagementOversight,
    },
    {
      id: "DomainTwoThreatIntelligenceCollaboration",
      label: "Threat Intel & Collab",
      icon: <FaUsers className="w-5 h-5" />,
      component: DomainTwoThreatIntelligenceCollaboration,
    },
    {
      id: "DomainThreeCybersecurityControls",
      label: "Cybersecurity Controls",
      icon: <FaShieldAlt className="w-5 h-5" />,
      component: DomainThreeCybersecurityControls,
    },
    {
      id: "DomainFourExternalDependencyManagement",
      label: "External Dependency",
      icon: <FaClipboardList className="w-5 h-5" />,
      component: DomainFourExternalDependencyManagement,
    },
    {
      id: "DomainFiveCyberIncidentManagementAndResilience",
      label: "Incident Mgmt & Resilience",
      icon: <FaClipboardCheck className="w-5 h-5" />,
      component: DomainFiveCyberIncidentManagementAndResilience,
    },
    {
      id: "MaturityRollup",
      label: "Compute Maturity",
      icon: <FaChartPie className="w-5 h-5" />,
      component: MaturityRollup,
    },
    {
      id: "MaturitySummary",
      label: "Maturity Summary",
      icon: <FaChartPie className="w-5 h-5" />,
      component: MaturitySummary,
    },
       {
          id: "CombinedMaturityTable",
          label: "Combined Maturity Table",
          icon: <FaPlay className="w-5 h-5" />,
          component: <CombinedMaturityTable />,
        },
  ];

  const [activeStep, setActiveStep] = useState(steps[0].id);
  const [assessmentName, setAssessmentName] = useState("");
  const [answers, setAnswers] = useState({
    DomainOneRiskManagementOversight: [],
    DomainTwoThreatIntelligenceCollaboration: [],
    DomainThreeCybersecurityControls: [],
    DomainFourExternalDependencyManagement: [],
    DomainFiveCyberIncidentManagementAndResilience: [],
  });
  const [maturityData, setMaturityData] = useState({});

  const handleAnswerChange = (stepId, newEntries) => {
    setAnswers((prev) => ({ ...prev, [stepId]: newEntries }));
  };

  const handleSave = () => {
    const payload = {
      name: assessmentName,
      sections: answers,
      maturity: maturityData,
    };
    console.log("Part Two saved:", payload);
    alert("Cybersecurity Maturity saved!");
  };
   // Validate assessment name
  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Assessment: Part Two – Cybersecurity Maturity
        </h2>
        <div className="flex items-center space-x-2">
          <label htmlFor="assessmentName" className="text-sm font-medium">
            Assessment Name
          </label>
          <input
            id="assessmentName"
            type="text"
            value={assessmentName}
            onChange={(e) => setAssessmentName(e.target.value)}
            placeholder="Enter a name"
            className="w-64 p-2 border rounded"
          />
        </div>
      </div>

      <TabNavBar
        tabs={steps.map((s) => ({ id: s.id, label: s.label, icon: s.icon }))}
        activeTab={activeStep}
        onTabChange={setActiveStep}
      />

      <div className="mt-4">
        {steps.map((s) => (
          <div
            key={s.id}
            style={{ display: activeStep === s.id ? "block" : "none" }}
          >
            {" "}
            {s.id.startsWith("Domain") && (
              <s.component
                answers={answers[s.id] || []}
                onChange={(next) => handleAnswerChange(s.id, next)}
              />
            )}
            {s.id === "MaturityRollup" && (
              <MaturityRollup answers={answers} onComputed={setMaturityData} />

            )}
            {s.id === "CombinedMaturityTable" && (
              <CombinedMaturityTable answers={answers} />
            )}
            {s.id === "MaturitySummary" && (
              <MaturitySummary summary={maturityData} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-right">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FaSave className="mr-2" /> Save Part Two
        </button>
      </div>
    </div>
  );
}
