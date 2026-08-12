// src/modules/Industry/BankingAndFinance/FFIECHub/StartAssessment.js
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  FaProjectDiagram,
  FaMobileAlt,
  FaTruck,
  FaUsers,
  FaShieldAlt,
  FaSave,
} from "react-icons/fa";
import TabNavBar from "@/components/layout/TabNavBar";

import TechnologyAndConnectionTypes from "./TechnologyAndConnectionTypes";
import OnlineMobileAndServices from "./OnlineMobileAndServices";
import DeliveryChannels from "./DeliveryChannels";
import OrganizationalCharacteristics from "./OrganizationalCharacteristics";
import ExternalThreats from "./ExternalThreats";
import RiskRollup from "./RiskRollup";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export default function PartOneInherentRiskProfile() {
  const steps = [
    {
      id: "TechnologyAndConnectionTypes",
      label: "Technology & Connections",
      icon: <FaProjectDiagram className="w-5 h-5" />,
      component: TechnologyAndConnectionTypes,
    },
    {
      id: "OnlineMobileAndServices",
      label: "Online & Mobile",
      icon: <FaMobileAlt className="w-5 h-5" />,
      component: OnlineMobileAndServices,
    },
    {
      id: "DeliveryChannels",
      label: "Delivery Channels",
      icon: <FaTruck className="w-5 h-5" />,
      component: DeliveryChannels,
    },
    {
      id: "OrganizationalCharacteristics",
      label: "Org Characteristics",
      icon: <FaUsers className="w-5 h-5" />,
      component: OrganizationalCharacteristics,
    },
    {
      id: "ExternalThreats",
      label: "External Threats",
      icon: <FaShieldAlt className="w-5 h-5" />,
      component: ExternalThreats,
    },
  ];
  const router = useRouter();
  const { id } = router.query;

  const [activeStep, setActiveStep] = useState(steps[0].id);
  const [assessmentName, setAssessmentName] = useState("");
  const [answers, setAnswers] = useState({
    TechnologyAndConnectionTypes: [],
    OnlineMobileAndServices: [],
    DeliveryChannels: [],
    OrganizationalCharacteristics: [],
    ExternalThreats: [],
  });
  const [rollupData, setRollupData] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const handleAnswerChange = (stepId, newArray) => {
    setAnswers((prev) => ({
      ...prev,
      [stepId]: newArray,
    }));
  };
  const riskData = useMemo(
    () => ({ name: assessmentName, sections: answers }),
    [assessmentName, answers]
  );
  
  // check that each section is a non-empty array and all have a selected
  const allAnswered = steps.every((s) => {
    const arr = answers[s.id];
    return Array.isArray(arr) && arr.length > 0 && arr.every((e) => e.selected);
  });

  const handleSave = async () => {
    if (!assessmentName.trim()) {
      return toast.error("Please enter an assessment name");
    }

    const payload = {
      name: assessmentName,
      sections: answers,
      rollup: rollupData, // now always an object
      startDate: startDate || new Date().toISOString(),
      endDate:
        rollupData?.percentAnswered === 100
          ? endDate || new Date().toISOString()
          : null,
    };

    try {
      if (id) {
        await CustomAxios.put(
          `${baseurl}/${initURL}/assessments/${id}`,
          payload
        );
        toast.success("Assessment updated");
      } else {
        const resp = await CustomAxios.post(
          `${baseurl}/${initURL}/assessments`,
          payload
        );
        toast.success("Assessment created");
        // router.replace({
        //   pathname: router.pathname,
        //   query: { ...router.query, id: resp.data._id },
        // });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save assessment");
    }
  };
  
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const { data } = await CustomAxios.get(
          `${baseurl}/${initURL}/assessments/${id}`
        );

        // 1) Fill in the name
        setAssessmentName(data.name);

        // 2) Overwrite each section’s answers+notes
        //    (your step-components read from `answers[sectionKey]`)
        setAnswers(data.sections);

        // 3) Fill in the roll-up table
        setRollupData(data.rollup);

        // 4) Pre-set start/end dates
        setStartDate(data.startDate?.slice(0, 10) || null);
        setEndDate(data.endDate?.slice(0, 10) || null);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load existing assessment");
      }
    })();
  }, [id]);
  
  const handleComputed = useCallback(
    (computed) => {
      setRollupData(computed);
      if (!startDate) setStartDate(new Date().toISOString().slice(0, 10));
      if (computed.percentAnswered === 100 && !endDate)
        setEndDate(new Date().toISOString().slice(0, 10));
    },
    [endDate, startDate]
  );
  
  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">
          Assessment : Part One - Inherent Risk Profile
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
            placeholder="Enter a name for this assessment"
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
        {steps.map((s) =>
          activeStep === s.id ? (
            <div key={s.id}>
              <s.component
                answers={answers[s.id]}
                onChange={(arr) => handleAnswerChange(s.id, arr)}
              />
            </div>
          ) : null
        )}
      </div>
      <RiskRollup data={riskData} onComputed={handleComputed} />

      <div className="mt-6 text-right">
        <button
          onClick={handleSave}
          disabled={!assessmentName.trim()}
          title={
            !assessmentName.trim()
              ? "Please enter an assessment name first"
              : "Save Assessment"
          }
          className={`px-4 py-2 inline-flex items-center text-white rounded ${
            assessmentName.trim()
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          <FaSave className="mr-2" />
          Save Assessment
        </button>
      </div>
    </div>
  );
}
