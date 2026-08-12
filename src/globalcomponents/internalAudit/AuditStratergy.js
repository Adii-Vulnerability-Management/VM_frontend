import {
  BookOpen,
  Briefcase,
  Globe,
  MapPin,
  PieChart,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../BaseUrl";
import CustomAxios from "../CustomAxios";
import AssessmentTabs from "./auditstatergy/AssessmentTabs";
import BusinessContextSection from "./auditstatergy/BusinessContextSection";
import DecideKPI from "./auditstatergy/DecideKPI";
import DocumentStrategySection from "./auditstatergy/DocumentStrategySection";
import InitiativesRoadmapSection from "./auditstatergy/InitiativesRoadmapSection";
import SwotAnalysisSection from "./auditstatergy/SwotAnalysisSection";
import VisionStakeholderSection from "./auditstatergy/VisionStakeholderSection";
import AuditTopicSelect, { PriorityAreaInput } from "./AuditTopicSelect";
import IndernalAuditSection from "./IndernalAuditSection";
import { useRouter } from "next/router";
import Loader from "../loader/Loader";

const SECTION_CONFIG = [
  { key: "verifyContext", label: "Verify the Business Context", icon: Globe },
  { key: "assessEnv", label: "Assess Current Environment", icon: Globe },
  { key: "auditAbility", label: "Assess Your Audit Functions Ability", icon: Briefcase },
  { key: "visionStakeholder", label: "Align Vision with Stakeholder Expectations", icon: Users },
  { key: "initiatives", label: "Identify Initiatives & Develop Road-map", icon: MapPin },
  { key: "decideKpi", label: "Decide KPI – How to Measure Progress", icon: PieChart },
  { key: "documentStrategy", label: "Document Your Strategy", icon: BookOpen }
];


function AuditStrategy() {
  const router = useRouter()
  const { programId, uid } = router.query
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedTopicObj, setSelectedTopicObj] = useState(null);
  const [loading, setLoading] = useState(false);
  const [strategyId, setStrategyId] = useState(null);
  // new Business Context state:
  const [businessContext, setBusinessContext] = useState({
    keyObjectives: "",
    primaryStrategies: "",
    direction: "",
    successMeasures: "",
    keySuccessFactors: "",
    obstacles: "",
    technological: "",
    political: "",
    economic: "",
    social: "",
    ethics: "",
    regulatory: "",
    environmental: ""
  });

  const [swot, setSwot] = useState({
    mode: "manual",
    manual: {
      strengths: "",
      weaknesses: "",
      opportunities: "",
      threats: ""
    },
    selected: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    }
  });

  const handleSwotChange = (path, value) => {
    if (path === "mode") {
      setSwot((s) => {
        const newMode = value;
        return {
          // always update mode
          mode: newMode,
          // if switching to “manual” clear selected, otherwise preserve it
          selected:
            newMode === "manual"
              ? { strengths: [], weaknesses: [], opportunities: [], threats: [] }
              : s.selected,
          // if switching to “select” clear manual, otherwise preserve it
          manual:
            newMode === "select"
              ? { strengths: "", weaknesses: "", opportunities: "", threats: "" }
              : s.manual,
        };
      });
    } else if (path.startsWith("manual.")) {
      const key = path.split(".")[1];
      setSwot((s) => ({
        ...s,
        manual: { ...s.manual, [key]: value },
      }));
    } else if (path.startsWith("selected.")) {
      const key = path.split(".")[1];
      setSwot((s) => ({
        ...s,
        selected: { ...s.selected, [key]: value },
      }));
    }
  };

  // helper to update any field:
  const handleBusinessContextChange = (field, value) => {
    setBusinessContext((bc) => ({ ...bc, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!programId) {
      toast.error("Program ID is missing.");
      return;
    }

    if (!selectedTopicObj?.processArea?._id) {
      toast.error("Please select an Audit Topic.");
      return;
    }
    // 1. Validate Business Context
    const bcMissing = Object.entries(businessContext)
      .filter(([_, v]) => !v || v.trim() === "")
      .map(([k]) => k);

    if (bcMissing.length > 0) {
      toast.error(`Please complete Business Context fields: ${bcMissing.join(", ")}`);
      return;
    }

    // 2. Validate SWOT
    if (swot.mode === "manual") {
      const emptyManual = Object.entries(swot.manual)
        .filter(([_, v]) => !v || v.trim() === "")
        .map(([k]) => k);
      if (emptyManual.length > 0) {
        toast.error(`SWOT Manual fields missing: ${emptyManual.join(", ")}`);
        return;
      }
    } else {
      const allEmpty = Object.values(swot.selected).every(arr => arr.length === 0);
      if (allEmpty) {
        toast.error("Please select at least one SWOT point in 'Select' mode.");
        return;
      }
    }

    // 3. Validate Vision Stakeholder
    if (
      !visionStakeholder.vision.trim() ||
      !visionStakeholder.mission.trim() ||
      Object.values(visionStakeholder)
        .filter(Array.isArray)
        .every(arr => arr.length === 0)
    ) {
      toast.error("Please complete vision, mission, and at least one stakeholder group.");
      return;
    }

    // 4. Validate Initiatives
    if (initiativesRoadmap.rows.length === 0) {
      toast.error("Please add at least one initiative to the roadmap.");
      return;
    }

    // 5. Validate Document Strategy
    const emptyDocKeys = Object.entries(docStrategy)
      .filter(([_, val]) => !val.points || val.points.length === 0 || val.points.every(p => !p.trim()))
      .map(([k]) => k);

    if (emptyDocKeys.length > 0) {
      toast.error(`Document Strategy sections missing points: ${emptyDocKeys.join(", ")}`);
      return;
    }

    // 6. Validate Assessment
    const selfComplete = assessment.selfAnswers.some(ans => ans > 0);
    const peerComplete = assessment.peerAnswers.some(ans => ans > 0);
    const benchComplete = assessment.benchAnswers.some(ans => ans && ans.trim() !== "");

    const assessmentComplete = selfComplete || peerComplete || benchComplete;

    if (!assessmentComplete) {
      toast.error("Please complete at least one assessment section (self, peer, or benchmark).");
      return;
    }

    setLoading(true);
    // build the DTO-shaped payload
    const payload = {
      auditTopic: selectedTopicObj?.processArea?._id,
      programID: programId,
      auditUniverseID: uid,
      businessContext, // matches CreateBusinessContextDto
      swotAnalysis: {
        mode: swot.mode,
        manual: { ...swot.manual },
        selected: { ...swot.selected },
      },
      visionStakeholder: {
        customers: [...visionStakeholder.customers],
        employees: [...visionStakeholder.employees],
        investors: [...visionStakeholder.investors],
        suppliers: [...visionStakeholder.suppliers],
        community: [...visionStakeholder.community],
        vision: visionStakeholder.vision,
        mission: visionStakeholder.mission,
      },
      initiativesRoadmap: initiativesRoadmap.rows.map(row => ({
        valueDriver: row.valueDriver,
        initiative: row.initiative,
        status: row.status,
      })),
      documentStrategy: {
        riskManagement: [...docStrategy.riskManagement.points],
        controlEffectiveness: [...docStrategy.controlEffectiveness.points],
        compliance: [...docStrategy.compliance.points],
        operationalEfficiency: [...docStrategy.operationalEfficiency.points],
        governance: [...docStrategy.governance.points],
        financialAudits: [...docStrategy.financialAudits.points],
        operationalAudits: [...docStrategy.operationalAudits.points],
        complianceAudits: [...docStrategy.complianceAudits.points],
        itAudits: [...docStrategy.itAudits.points],
        riskBasedAudits: [...docStrategy.riskBasedAudits.points],
        followUpAudits: [...docStrategy.followUpAudits.points],
        riskAssessment: [...docStrategy.riskAssessment.points],
        auditPlanning: [...docStrategy.auditPlanning.points],
        auditExecution: [...docStrategy.auditExecution.points],
        reporting: [...docStrategy.reporting.points],
        followUpAndMonitoring: [...docStrategy.followUpAndMonitoring.points],
        boardOfDirectors: [...docStrategy.boardOfDirectors.points],
        seniorManagement: [...docStrategy.seniorManagement.points],
        externalAuditors: [...docStrategy.externalAuditors.points],
        riskManagementCommittee: [...docStrategy.riskManagementCommittee.points],
        // auditTeam: [...docStrategy.auditTeam.points],
        trainingAndDevelopment: [...docStrategy.trainingAndDevelopment.points],
        technologyTools: [...docStrategy.technologyTools.points],
        completionOfAuditPlan: [...docStrategy.completionOfAuditPlan.points],
        timelinessOfReporting: [...docStrategy.timelinessOfReporting.points],
        implementationOfRecommendations: [...docStrategy.implementationOfRecommendations.points],
        stakeholderSatisfaction: [...docStrategy.stakeholderSatisfaction.points],
      },
      assessmentSection: {
        selfQuestions: [...assessment.selfQuestions],
        selfAnswers: [...assessment.selfAnswers],
        peerQuestions: [...assessment.peerQuestions],
        peerAnswers: [...assessment.peerAnswers],
        benchQuestions: [...assessment.benchQuestions],
        benchAnswers: [...assessment.benchAnswers],
      },
      // each section's priorities: array of { area, rating }
      businessContextPriorities: sectionPriorities.verifyContext,
      swotAnalysisPriorities: sectionPriorities.assessEnv,
      visionStakeholderPriorities: sectionPriorities.visionStakeholder,
      initiativesRoadmapPriorities: sectionPriorities.initiatives,
      documentStrategyPriorities: sectionPriorities.documentStrategy,
      assessmentSectionPriorities: sectionPriorities.auditAbility,
    };

    try {

      let res;
      if (strategyId) {

        const { manual, selected, mode } = swot;
        const cleanManual = (({ strengths, weaknesses, opportunities, threats }) =>
          ({ strengths, weaknesses, opportunities, threats }))(manual);
        const cleanSelected = (({ strengths, weaknesses, opportunities, threats }) =>
          ({ strengths, weaknesses, opportunities, threats }))(selected);

        const patchPayload = {
          ...payload,
          swotAnalysis: {
            mode,
            manual: cleanManual,
            selected: cleanSelected,
          },
        };

        // update existing
        res = await CustomAxios.patch(
          `${baseurl}/${initURL}/audit-strategy/${strategyId}`,
          patchPayload
        );
      } else {
        // create new
        res = await CustomAxios.post(
          `${baseurl}/${initURL}/audit-strategy`,
          payload
        );
        // capture new _id for future patches
        setStrategyId(res.data._id);
      }
      toast.success("Saved successfully!");
      console.log("Created auditStrategy:", res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save data.");
    } finally {
      setLoading(false);
    }
  };
  const [visionStakeholder, setVisionStakeholder] = useState({
    customers: [], employees: [], investors: [], suppliers: [], community: [],
    vision: "", mission: ""
  });
  const [sectionPriorities, setSectionPriorities] = useState(
    SECTION_CONFIG.reduce((acc, s) => ({ ...acc, [s.key]: [] }), {})
  );
  const handleVisionStakeholderChange = (f, v) =>
    setVisionStakeholder((vs) => ({ ...vs, [f]: v }));

  const handleAddPriority = (sectionKey, newItem) =>
    setSectionPriorities(prev => ({
      ...prev,
      [sectionKey]: [...prev[sectionKey], newItem],
    }));

  const [initiativesRoadmap, setInitiativesRoadmap] = useState({
    selectedValueDriver: "",
    selectedInitiative: "",
    selectedStatus: "",
    rows: []
  });

  // …handlers for other sections…

  const handleInitiativesChange = (newData) => {
    setInitiativesRoadmap(newData);
  };

  const [docStrategy, setDocStrategy] = useState({
    riskManagement: { points: ["Identify and assess…"], newPoint: "", editingIndex: null, editingValue: "" },
    controlEffectiveness: { points: ["Evaluate design…"], newPoint: "", editingIndex: null, editingValue: "" },
    compliance: { points: ["Assess compliance…"], newPoint: "", editingIndex: null, editingValue: "" },
    operationalEfficiency: { points: ["Ensure resources…"], newPoint: "", editingIndex: null, editingValue: "" },
    governance: { points: ["Provide assurance…"], newPoint: "", editingIndex: null, editingValue: "" },
    financialAudits: { points: ["Reviewing financial…"], newPoint: "", editingIndex: null, editingValue: "" },
    operationalAudits: { points: ["Evaluating processes…"], newPoint: "", editingIndex: null, editingValue: "" },
    complianceAudits: { points: ["Ensuring adherence…"], newPoint: "", editingIndex: null, editingValue: "" },
    itAudits: { points: ["Assessing IT systems…"], newPoint: "", editingIndex: null, editingValue: "" },
    riskBasedAudits: { points: ["Focusing on high risk…"], newPoint: "", editingIndex: null, editingValue: "" },
    followUpAudits: { points: ["Verifying implementation…"], newPoint: "", editingIndex: null, editingValue: "" },
    riskAssessment: { points: ["Comprehensive risk assessment…"], newPoint: "", editingIndex: null, editingValue: "" },
    auditPlanning: { points: ["Annual audit plan…"], newPoint: "", editingIndex: null, editingValue: "" },
    auditExecution: { points: ["Structured audit approach…"], newPoint: "", editingIndex: null, editingValue: "" },
    reporting: { points: ["Findings documented…"], newPoint: "", editingIndex: null, editingValue: "" },
    followUpAndMonitoring: { points: ["Track corrective actions…"], newPoint: "", editingIndex: null, editingValue: "" },
    boardOfDirectors: { points: ["Regular updates…"], newPoint: "", editingIndex: null, editingValue: "" },
    seniorManagement: { points: ["Report on findings…"], newPoint: "", editingIndex: null, editingValue: "" },
    externalAuditors: { points: ["Collaborate with external…"], newPoint: "", editingIndex: null, editingValue: "" },
    riskManagementCommittee: { points: ["Share risk insights…"], newPoint: "", editingIndex: null, editingValue: "" },
    auditTeam: { points: ["Auditors with domain expertise…"], newPoint: "", editingIndex: null, editingValue: "" },
    trainingAndDevelopment: { points: ["Continuous professional development…"], newPoint: "", editingIndex: null, editingValue: "" },
    technologyTools: { points: ["Leverage audit management tools…"], newPoint: "", editingIndex: null, editingValue: "" },
    completionOfAuditPlan: { points: ["% of audits completed…"], newPoint: "", editingIndex: null, editingValue: "" },
    timelinessOfReporting: { points: ["Time to issue reports…"], newPoint: "", editingIndex: null, editingValue: "" },
    implementationOfRecommendations: { points: ["% recommendations implemented…"], newPoint: "", editingIndex: null, editingValue: "" },
    stakeholderSatisfaction: { points: ["Feedback from stakeholders…"], newPoint: "", editingIndex: null, editingValue: "" },
  });

  const handleDocStrategyChange = (newData) => {
    setDocStrategy(newData);
  };

  const [assessment, setAssessment] = useState({
    activeTab: 0,
    selfQuestions: [
      "Rate your understanding of internal audit processes.",
      "Rate your performance in achieving targets.",
      "Rate your communication skills."
    ],
    peerQuestions: [
      "Rate your colleague's teamwork.",
      "Rate your colleague's problem-solving skills.",
      "Rate your colleague's reliability."
    ],
    benchQuestions: [
      "Does the organization meet industry standards?",
      "Is the process streamlined compared to competitors?",
      "Is the quality of work above industry average?"
    ],
    selfAnswers: [0, 0, 0],
    peerAnswers: [0, 0, 0],
    benchAnswers: ["", "", ""]
  });

  const handleAssessmentChange = updated => {
    setAssessment(updated);
  }

  useEffect(() => {
    if (!programId || !selectedTopicObj?.processArea?._id || !uid) return;

    const fetchStrategy = async () => {
      setLoading(true);
      try {
        const { data } = await CustomAxios.get(
          `${baseurl}/${initURL}/audit-strategy`,
          { params: { programID: programId, auditTopic: selectedTopicObj?.processArea?._id, auditUniverseID: uid } }
        );
        if (Array.isArray(data) && data.length > 0) {
          console.log('inside a array');

          const existing = Array.isArray(data)
            ? data.find(
              item =>
                item.programID === programId.toString() &&
                item.auditTopic === selectedTopicObj?.processArea?._id.toString()
            )
            : null;
          if (existing) {
            setStrategyId(existing._id);
            // 1) businessContext
            setBusinessContext(existing.businessContext || {});

            // 2) swotAnalysis
            setSwot({
              mode: existing.swotAnalysis.mode,
              manual: existing.swotAnalysis.manual,
              selected: existing.swotAnalysis.selected,
            });

            // 3) visionStakeholder
            setVisionStakeholder(existing.visionStakeholder || {});

            // 4) initiativesRoadmap
            setInitiativesRoadmap({
              rows: existing.initiativesRoadmap.map(r => ({
                valueDriver: r.valueDriver,
                initiative: r.initiative,
                status: r.status
              }))
            });

            // 5) documentStrategy
            setDocStrategy(Object.fromEntries(
              Object.entries(existing.documentStrategy).map(([k, pts]) => ([
                k,
                { points: pts, newPoint: "", editingIndex: null, editingValue: "" }
              ]))
            ));

            // 6) assessmentSection
            setAssessment({
              activeTab: 0,
              selfQuestions: existing.assessmentSection.selfQuestions,
              selfAnswers: existing.assessmentSection.selfAnswers,
              peerQuestions: existing.assessmentSection.peerQuestions,
              peerAnswers: existing.assessmentSection.peerAnswers,
              benchQuestions: existing.assessmentSection.benchQuestions,
              benchAnswers: existing.assessmentSection.benchAnswers,
            });

            // 7) priorities
            setSectionPriorities({
              verifyContext: existing.businessContextPriorities,
              assessEnv: existing.swotAnalysisPriorities,
              auditAbility: existing.assessmentSectionPriorities,
              visionStakeholder: existing.visionStakeholderPriorities,
              initiatives: existing.initiativesRoadmapPriorities,
              decideKpi: [],                  // no mapping in response?
              documentStrategy: existing.documentStrategyPriorities,
              // if you also have decideKpi or other keys, map them here
            });
          }
          return;
        }
        setStrategyId(""); // or null, depending on how you initialized it
        setBusinessContext({
          keyObjectives: "",
          primaryStrategies: "",
          direction: "",
          successMeasures: "",
          keySuccessFactors: "",
          obstacles: "",
          technological: "",
          political: "",
          economic: "",
          social: "",
          ethics: "",
          regulatory: "",
          environmental: "",
        });
        setSwot({
          mode: "manual", // or whatever default you want
          manual: { strengths: "", weaknesses: "", opportunities: "", threats: "" },
          selected: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
        });
        setVisionStakeholder({
          customers: [],
          employees: [],
          investors: [],
          suppliers: [],
          community: [],
          vision: "",
          mission: "",
        });
        setInitiativesRoadmap({ rows: [] });
        setDocStrategy({
          riskManagement: { points: ["Identify and assess…"], newPoint: "", editingIndex: null, editingValue: "" },
          controlEffectiveness: { points: ["Evaluate design…"], newPoint: "", editingIndex: null, editingValue: "" },
          compliance: { points: ["Assess compliance…"], newPoint: "", editingIndex: null, editingValue: "" },
          operationalEfficiency: { points: ["Ensure resources…"], newPoint: "", editingIndex: null, editingValue: "" },
          governance: { points: ["Provide assurance…"], newPoint: "", editingIndex: null, editingValue: "" },
          financialAudits: { points: ["Reviewing financial…"], newPoint: "", editingIndex: null, editingValue: "" },
          operationalAudits: { points: ["Evaluating processes…"], newPoint: "", editingIndex: null, editingValue: "" },
          complianceAudits: { points: ["Ensuring adherence…"], newPoint: "", editingIndex: null, editingValue: "" },
          itAudits: { points: ["Assessing IT systems…"], newPoint: "", editingIndex: null, editingValue: "" },
          riskBasedAudits: { points: ["Focusing on high risk…"], newPoint: "", editingIndex: null, editingValue: "" },
          followUpAudits: { points: ["Verifying implementation…"], newPoint: "", editingIndex: null, editingValue: "" },
          riskAssessment: { points: ["Comprehensive risk assessment…"], newPoint: "", editingIndex: null, editingValue: "" },
          auditPlanning: { points: ["Annual audit plan…"], newPoint: "", editingIndex: null, editingValue: "" },
          auditExecution: { points: ["Structured audit approach…"], newPoint: "", editingIndex: null, editingValue: "" },
          reporting: { points: ["Findings documented…"], newPoint: "", editingIndex: null, editingValue: "" },
          followUpAndMonitoring: { points: ["Track corrective actions…"], newPoint: "", editingIndex: null, editingValue: "" },
          boardOfDirectors: { points: ["Regular updates…"], newPoint: "", editingIndex: null, editingValue: "" },
          seniorManagement: { points: ["Report on findings…"], newPoint: "", editingIndex: null, editingValue: "" },
          externalAuditors: { points: ["Collaborate with external…"], newPoint: "", editingIndex: null, editingValue: "" },
          riskManagementCommittee: { points: ["Share risk insights…"], newPoint: "", editingIndex: null, editingValue: "" },
          auditTeam: { points: ["Auditors with domain expertise…"], newPoint: "", editingIndex: null, editingValue: "" },
          trainingAndDevelopment: { points: ["Continuous professional development…"], newPoint: "", editingIndex: null, editingValue: "" },
          technologyTools: { points: ["Leverage audit management tools…"], newPoint: "", editingIndex: null, editingValue: "" },
          completionOfAuditPlan: { points: ["% of audits completed…"], newPoint: "", editingIndex: null, editingValue: "" },
          timelinessOfReporting: { points: ["Time to issue reports…"], newPoint: "", editingIndex: null, editingValue: "" },
          implementationOfRecommendations: { points: ["% recommendations implemented…"], newPoint: "", editingIndex: null, editingValue: "" },
          stakeholderSatisfaction: { points: ["Feedback from stakeholders…"], newPoint: "", editingIndex: null, editingValue: "" },
        }); // or initialize each document‐strategy key to {points: [], newPoint: "", editingIndex: null, editingValue: ""}, if you have a standard shape
        setAssessment({
          activeTab: 0,
          selfQuestions: [
            "Rate your understanding of internal audit processes.",
            "Rate your performance in achieving targets.",
            "Rate your communication skills."
          ],
          peerQuestions: [
            "Rate your colleague's teamwork.",
            "Rate your colleague's problem-solving skills.",
            "Rate your colleague's reliability."
          ],
          benchQuestions: [
            "Does the organization meet industry standards?",
            "Is the process streamlined compared to competitors?",
            "Is the quality of work above industry average?"
          ],
          selfAnswers: [0, 0, 0],
          peerAnswers: [0, 0, 0],
          benchAnswers: ["", "", ""]
        });
        setSectionPriorities(SECTION_CONFIG.reduce((acc, s) => ({ ...acc, [s.key]: [] }), {}));

      } catch (err) {
        console.error("Failed to fetch existing strategy:", err);
        toast.error("Could not load existing Audit Strategy");
      } finally {
        setLoading(false);
      }
    };

    fetchStrategy();
  }, [programId, selectedTopicObj?.processArea?._id, uid]);

  if (loading) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-8">
      <div className="flex justify-end">
        <AuditTopicSelect
          placeholder="Choose an audit topic"
          setSelectedTopicObj={setSelectedTopicObj}
          selectedTopicObj={selectedTopicObj}
          value={selectedTopic}
          onChange={setSelectedTopic}
        />
      </div>
      {/* 0) Scale Legend */}
      <div className="p-4 bg-blue-50 rounded border-l-4 border-blue-400">
        <h2 className="text-lg font-semibold text-blue-700 mb-2">
          Strategy Priority Scale
        </h2>
        <ul className="list-disc list-inside text-sm text-gray-700">
          <li><strong>1 – Low:</strong> Minor support</li>
          <li><strong>2 – Moderate:</strong> Helpful but manageable</li>
          <li><strong>3 – High:</strong> Significant impact</li>
          <li><strong>4 – Extreme:</strong> Core to top goals</li>
        </ul>
      </div>

      {/* 1) All sections */}
      {SECTION_CONFIG.map(({ key, label, icon: Icon }) => (
        <IndernalAuditSection key={key} title={label} icon={Icon}>
          <PriorityAreaInput
            items={sectionPriorities[key]}
            onAdd={(item) => handleAddPriority(key, item)}
            className="mb-6"
            heading={`New Identified Priorities Based on ${label}`}
          />
          {key === "verifyContext" && <BusinessContextSection
            data={businessContext}
            onChange={handleBusinessContextChange} />}
          {key === "assessEnv" && <SwotAnalysisSection
            data={swot}
            onChange={handleSwotChange} />}
          {key === "auditAbility" && <AssessmentTabs
            data={assessment}
            onChange={handleAssessmentChange}
          />}
          {key === "visionStakeholder" && <VisionStakeholderSection
            data={visionStakeholder}
            onChange={handleVisionStakeholderChange}
          />}
          {key === "initiatives" && <InitiativesRoadmapSection data={initiativesRoadmap}
            onChange={handleInitiativesChange} />}
          {key === "decideKpi" && <DecideKPI />}
          {key === "documentStrategy" && <DocumentStrategySection data={docStrategy}
            onChange={handleDocStrategyChange} />}
        </IndernalAuditSection>
      ))}

      {/* Save Changes Button */}
      <div className="flex justify-end mt-6">
        <button onClick={handleSaveChanges}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-md transition">
          Save Changes
        </button>
      </div>

    </div>
  );
}

export default AuditStrategy;
