// config/config.js

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

/** Alias for AI / absolute API URLs (env is NEXT_PUBLIC_API_BASE_URL). */
export const NEXT_PUBLIC_API_URL = API_BASE_URL;

export const appConfig = {
  apiBaseUrl: API_BASE_URL,
  appName: "GRC 3",
  defaultLocale: "en-IN",
};
// export const baseurl = "https://securetain.click";
export const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL;
// export const baseurl = "http://dev.grc3.io";
// export const baseurl = "http://34.235.207.221:7000";


// THIS IS NEW API END POINT FOR AI DATA BASE SCANNING 14 JAN 20260 -->  IP ADDRESS CHANGE 19 JAN 2026
export const scanBaseUrl =
  process.env.NEXT_PUBLIC_SCAN_API_BASE_URL || "http://192.168.1.43:8006";


export const WebShocket_baseurl = process.env.NEXT_PUBLIC_WS_BASE_URL;
export const MainLoginPageUrl = "/login";
export const VendorLoginPageUrl = "/vendor-trust/VendorLogin";

// export const initURL = "${initURL}";
export const initURL =
  process.env.NEXT_PUBLIC_PRODUCTION === "true"
    ? "apiv2"
    : process.env.NEXT_PUBLIC_Dev; // export const initURL = "apiv2user8";
//export const initURL = "apiv2jay";
// export const initURL = "${initURL}";

export const WebShocket_initURL = "wsv2";

export const Headquarter = "Headquarter";
export const Sublocation = "Sublocation";
export const vdaVersionOptions = [
  { value: "5.1", label: "5.1" },
  { value: "6.0.3", label: "6.0.3" },
];
////
export const TisaxLocationTypeOptions = [
  { value: "Headquarter", label: "Headquarter" },
  { value: "Sublocation", label: "Sublocation" },
];
//
export const CategoryOptions = [
  { value: "IT Cyber", label: "IT Cyber" },
  { value: "Compliance", label: "Compliance" },
  { value: "Data Privacy", label: "Data Privacy" },
  { value: "Environmental", label: "Environmental" },
  { value: "Finance", label: "Finance" },
  { value: "Legal", label: "Legal" },
  { value: "Operations", label: "Operations" },
];

export const statusInProgress = "In Progress";
export const statusAnswered = "Answered";
export const statusReviewed = "Reviewed";
export const statusRejected = "Rejected";

export const assessmentTypeOptions = [
  {
    value: "Information Security PL high (AL2)",
    label: "Information Security PL high (AL2)",
  },
  {
    value: "Information Security PL very high (AL3)",
    label: "Information Security PL very high (AL3)",
  },
  {
    value: "Prototype Protection PL high (AL3)",
    label: "Prototype Protection PL high (AL3)",
  },
  {
    value: "Data Protection",
    label: "Data Protection",
  },
];
export const assessmentLevelOptions = [
  { value: "AL2", label: "AL2" },
  { value: "AL3", label: "AL3" },
];

export const defaultAssessmentTypesMap = {
  AL2: [
    {
      value: "Information Security PL high (AL2)",
      label: "Information Security PL high (AL2)",
    },
    {
      value: "Data Protection",
      label: "Data Protection",
    },
  ],
  AL3: [
    {
      value: "Information Security PL very high (AL3)",
      label: "Information Security PL very high (AL3)",
    },
    {
      value: "Prototype Protection PL high (AL3)",
      label: "Prototype Protection PL high (AL3)",
    },
    {
      value: "Data Protection",
      label: "Data Protection",
    },
  ],
};

export const MaturityJson = [
  {
    Name: "Name",
    "Maturity level 0": "Incomplete ",
    "Maturity level 1": "Performed",
    "Maturity level 2": "Managed",
    "Maturity level 3": "Established",
    "Maturity level 4": "Predictable",
    "Maturity level 5": "Optimizing",
  },
  {
    Name: "Principle",
    "Maturity level 0":
      "A process does not exist, is not followed or not suitable to achieve the objective.",
    "Maturity level 1":
      "A process is followed which is not or insufficiently documented (“informal process”) and there is some evidence that it achieves its objective.",
    "Maturity level 2":
      "A process achieving its objectives is followed. Process documentation and process implementation evidence are available.",
    "Maturity level 3":
      "A standard process integrated into the overall system is followed. Dependencies on other processes are documented and suitable interfaces are created. Evidence exists that the process has been used sustainably and actively over an extended period.",
    "Maturity level 4":
      "An established process is followed. The effectiveness of the process is continually monitored by collecting key figures. Limit values are defined at which the process is considered to be insufficiently effective and requires adjustment. (Key Performance Indicators)",
    "Maturity level 5":
      "A predictable process with continual improvement as a major objective is followed. Improvement is actively advanced by means of dedicated resources.",
  },
  {
    Name: "Definition",
    "Maturity level 0":
      "A process is not implemented or fails to achieve its process purpose. Little or no evidence exists of any systematic achievement of the process purpose.",
    "Maturity level 1":
      "- The implemented process achieves its (process) purpose.\n- The intended base practices are verifiably performed.\n",
    "Maturity level 2":
      "Control of process implementation (PA 2.1):\n- Objectives for the performance of the process are identified.\n- Implementation of the process is planned and monitored.\n- Implementation of the process is adjusted to meet plans.\n- Responsibilities and authorities for implementing the process are defined, assigned and communicated.\n- Resources and information necessary for implementing the process are identified, made available, assigned and used.\n- Interfaces between the involved parties are managed to ensure effective communication and clear assignment of responsibilities.\n\nWork Product Management (PA 2.2):\n- Requirements for the work products of the process are defined\n- Requirements for documentation and control of the work products are defined.\n- Work products are appropriately identified, documented and controlled.\n- Work products are reviewed in accordance with planned measures and adjusted as necessary to meet requirements.",
    "Maturity level 3":
      "Process Definition (PA 3.1):\n- A standard process, including appropriately adapted requirements, is defined which describes the essential elements a defined process must comprise.\n- The sequence and interaction of the standard process with other processes are determined.\n- Competencies and roles required for process implementation are identified as part of the standard process.\n- The infrastructure and work environment required for process implementation are identified as part of the standard process.\n- Suitable methods for monitoring the effectiveness and suitability of the process are determined.\n\nProcess Deployment (PA 3.2):\n- A defined process based on an appropriately selected and/or tailored standard process is deployed.\n- Required roles, responsibilities and authorities for implementing the defined process are assigned and communicated.\n- Personnel performing the defined process are competent on the basis of appropriate education, training and experience.\n- The necessary resources and information required for implementing the defined process are made available, allocated and used.\n- The necessary infrastructure and work environment required for implementing the defined process are available, managed and maintained.\n- Appropriate data is collected and analysed to gain a basic understanding of the behaviour of the process, to demonstrate its suitability and effectiveness, and to evaluate where continuous improvement of the process can be made. ",
    "Maturity level 4":
      "Process Measurement (PA 4.1):\n- Process information requirements in support of relevant defined business goals are established.\n- Process measurement objectives are derived from process information requirements.\n- Quantitative objectives for process performance in support of relevant defined business goals are established.\n- Characteristic values and frequency of measurements are identified and defined in line with process measurement objectives and quantitative objectives for process performance.\n- Results of measurement are collected, analyzed and reported in order to monitor the extent to which the quantitative\nobjectives for process performance are met.\n- Measurement results are used to characterize process performance.\n\n Process control (PA 4.2):\n- Analysis and control techniques are determined and applied, as applicable.\n- Variable control limits are established for normal process implementation.\n- Measurement data is analyzed for special variations.\n- Corrective actions are taken to address special variations.\n- Control limits are re-established (as necessary) following corrective action.",
    "Maturity level 5":
      "Process Innovation (PA 5.1)\n- Process improvement objectives are defined for the respective process that supports the relevant business goals.\n- Appropriate data are analyzed to identify the common causes of variations in process performance.\n- Appropriate data are analyzed to identify options for best practice and innovation.\n- Improvement options derived from new technologies and new process concepts are identified.\n- An implementation strategy is established to achieve the process improvement objectives.\n\nContinuous optimization (PA 5.2):\n- The impact of all proposed changes is assessed against the objectives of the defined process and the standard process.\n- Implementation of all agreed changes is managed to ensure that any disruption to the process performance is understood and addressed.\n- Based on actual performance, effectiveness of process change is evaluated against the defined process requirements and process objectives to determine whether results are corresponding to common or special cases.",
  },
  {
    Name: "Possible evidence (GWP)",
    "Maturity level 0": null,
    "Maturity level 1":
      "+ Work products providing evidence of process outcomes.",
    "Maturity level 2":
      "+ Process documentation\n+ Process plan\n+ Quality plan/records\n+ Process implementation records\n",
    "Maturity level 3":
      "+ Process documentation\n+ Process plan\n+ Quality records\n+ Policies and standards\n+ Process implementation records",
    "Maturity level 4":
      "+ Process documentation\n+ Process control plan\n+ Process improvement plan\n+ Process measurement plan\n+ Process implementation records",
    "Maturity level 5":
      "+ Process improvement plan\n+ Process measurement plan\n+ Process implementation records",
  },
];

export const Definition1Json = [
  {
    Tab: "Welcome",
    Description: "Welcome page.",
    "Intended use of tab": "Information",
  },
  {
    Tab: "Cover",
    Description:
      "The cover contains boxes for information on the implementing organization, the scope of review, the auditor and the contact person of the organization under review.",
    "Intended use of tab": "For own use",
  },
  {
    Tab: "Maturity levels",
    Description:
      "VDA ISA intends the implementation to be assessed by means of a 5 step maturity model as defined in this tab. The maturity levels comprise Incomplete, Performed, Managed, Established and Predictable.\nWith this VDA ISA version, the target maturity level for all control questions is consistently 3 (Established).",
    "Intended use of tab": "Information",
  },
  {
    Tab: "Definitions",
    Description:
      "Under Definitions, the key terms of the requirements to be fulfilled are described. Requirements can be categorized as MUST, SHOULD, additionally in case of HIGH protection needs and additionally in case of VERY HIGH protection needs. This subdivision is necessary as information of high and very high protection needs requires special protective measures.\nAdditionally, key terms and abbreviations are listed and explained in this tab.",
    "Intended use of tab": "Information",
  },
  {
    Tab: "Information Security",
    Description:
      "The tab “Information Security” includes all basic controls based on the standard ISO/IEC 27001. The controls themselves are formulated as questions. The objective of the respective control and the requirements for achieving it are listed in accordingly designated columns.\nHere, each control must invariably be assessed according to the degree to which the objective is achieved. The assessment of the maturity levels (as described in the tab “Maturity levels”) of each control is recorded in the box (column E) and automatically transferred to the tab “Results”.\nAdditional columns give examples to support potential implementation.\nHere, requirements always refer to the own company with respect to its organization, processes and infrastructure. Requirements never refer to products put on the market by your company. Requirements for safe product development are not part of this module.",
    "Intended use of tab": "Implementation requirements",
  },
  {
    Tab: "Prototype Protection",
    Description:
      "Prototype protection includes vehicles, components and parts which are classified as requiring protection but have not yet been presented to the public and/or published in adequate form by the OEM.\nThe commissioning department of the OEM is responsible for classifying the protection need of vehicles, components and parts. The minimum requirements for prototype protection are to be applied for protection classes High and Very high according to ISA. ",
    "Intended use of tab": "Implementation requirements",
  },
  {
    Tab: "Data Protection",
    Description:
      "This tab is to be edited additionally in case of processing within the meaning of Art. 28 of the EU General Data Protection Regulation and contains controls requiring merely yes/no answers.",
    "Intended use of tab": "Implementation requirements",
  },
  {
    Tab: "Results (ISA5)",
    Description:
      "Here, the results of the individual tabs (review catalog pages) are summarized and presented in printing format. For presentation purposes, the new simplified form according to ISA 5 is use.\nThe spider web diagram provides an overview of all controls. The list of all controls shows the target maturity levels to be achieved. \nWhen calculating the overall result, the results of controls overachieving their target maturity level are cutback and averaged. This ensures that the requirements are comprehensively fulfilled and that there is no compensation of overachieved and underachieved controls.",
    "Intended use of tab": "Presentation of results",
  },
  {
    Tab: "Results (ISA4)",
    Description:
      "Here, the results of the individual tabs (review catalog pages) are summarized and presented in printing format in the known form according to ISA 4.\nThe list of all controls shows the target maturity levels to be achieved.\nWhen calculating the overall result, the results of controls overachieving their target maturity level are cutback and averaged. This ensures that the requirements are comprehensively fulfilled and that there is no compensation of overachieved and underachieved controls.",
    "Intended use of tab": "Presentation of results",
  },
  {
    Tab: "Examples KPI",
    Description:
      "This tab shows examples of Key Performance Indicators (KPI) for measuring process results both for controls for which the ISA has defined a target maturity level of 4 and for controls where a measurement appears useful. The tab content provides support for identifying own suitable KPIs. It does not present mandatory requirements for achieving maturity level 4. For controls having a target maturity level of 3 or less, definition of KPIs is not mandatory, but may be helpful for a central management of information security at many locations.",
    "Intended use of tab": "Examples and support",
  },
  {
    Tab: "License",
    Description: "License conditions under which the VDA ISA is published.",
    "Intended use of tab": "Information",
  },
  {
    Tab: "Change history",
    Description: "List of changes over the VDA ISA lifecycle.",
    "Intended use of tab": "Information",
  },
];

export const Definition2Json = [
  {
    Term: "Protection class “normal”,\nnormal protection needs",
    Explanation:
      "The potential damage to the organization is limited and manageable.",
    Examples: "Confidentiality classification “internal”",
  },
  {
    Term: "Protection class “high”,\nhigh protection needs",
    Explanation: "The potential damage to the organization may be substantial.",
    Examples: "Confidentiality classification “confidential”",
  },
  {
    Term: "Protection class “very high”,\nvery high protection needs",
    Explanation:
      "The potential damage can reach a level of potentially threatening or disastrous impact on the organization’s existence.",
    Examples: "Confidentiality classification “strictly confidential”",
  },
  {
    Term: "Requirements (must)",
    Explanation:
      "The requirements indicated in this column are strict requirements without any exemptions.",
    Examples: null,
  },
  {
    Term: "Requirements (should)",
    Explanation:
      "Principally, the requirements indicated in this column must be implemented by the organization. In certain circumstances, however, there may be a valid justification for non-compliance with these requirements. In case of any deviation, its effects must be understood by the organization and it must be plausibly justified.",
    Examples: null,
  },
  {
    Term: "Additional requirements in case of high protection needs",
    Explanation:
      "The requirements indicated in this column must additionally be met if the tested subject has high protection needs. ",
    Examples: null,
  },
  {
    Term: "Additional requirements in case of very high protection needs",
    Explanation:
      "The requirements indicated in this column must additionally be met if the tested subject has very high protection needs. ",
    Examples: null,
  },
  {
    Term: "Result (Maturity level)",
    Explanation:
      "In the result tabs ISA5 and ISA4 (spider web diagram), all results are presented as assessed. The line for the target maturity level does not consider controls marked “n.a”. When calculating the average, however, the maximum achievable target maturity level is taken into account.",
    Examples: null,
  },
];
export const Definition3Json = [
  {
    Term: "Business Continuity Management (BCM)",
    Explanation:
      "BCM is intended to ensure the functionality of business-critical processes within the organization during and after any crisis situation.",
    Examples: null,
  },
  {
    Term: "Cloud/external IT services",
    Explanation:
      "An external service is the processing of company information outside the audit scope.\n(e.g. ext. hosting, O365 cloud services, AWS, web services such as Kaspersky anti-virus dashboards on the web, SIEM services provided by ext. companies, etc.)\nImportant for rejecting non-relevant web services:\n•  Cloud service: Damage may have direct impact on the company (CIA)\n•  Data are externally processed in a confidential/strictly confidential manner (e.g. not by translating individual words)",
    Examples: null,
  },
  {
    Term: "Non-disclosure agreements (NDA)",
    Explanation:
      "Non-disclosure agreements provide legal protection of an organization’s information particularly where information is exchanged beyond the boundaries of the organization. ",
    Examples: null,
  },
  {
    Term: "Generic work product (GWP)",
    Explanation: "Any work product resulting from the execution of a process.",
    Examples: null,
  },
  {
    Term: "Information Owner/Information Officer/Data Owner",
    Explanation:
      "Person or organizational body preparing data or making data available for use and being able to provide information on their protection needs.",
    Examples: null,
  },
  {
    Term: "Information security management system (ISMS) ",
    Explanation:
      "The information security management system is a control mechanism used by the organization’s management to ensure that information security is the result of sustainable management rather than that of mere coincidence and individual effort. ",
    Examples: null,
  },
  {
    Term: "Information security risks",
    Explanation:
      "Risks existing in the preparation and processing of information. These are based on potential events having negative impact on achieving the protection goals of information security.",
    Examples: null,
  },
  {
    Term: "Information security risk management (ISRM)",
    Explanation:
      "The information security risk management is required for an early detection, assessment and handling of risks in order to achieve the protection goals of information security. Hence, it enables the organization to establish adequate measures for the protection of its information assets while considering the associated chances and risks.",
    Examples: null,
  },
  {
    Term: "Supporting Asset",
    Explanation:
      "Supporting assets (electronic and physical) are used for storing, processing and transporting information assets.",
    Examples:
      "Mobile data storage devices, IT systems, IT services/IT service providers, paper documents",
  },
  {
    Term: "Information Asset",
    Explanation: "Information of essential value to the organization. ",
    Examples:
      "Business secrets, critical business processes, know-how, patents",
  },
  {
    Term: "IT service",
    Explanation: "Services in the field of information technology.",
    Examples: null,
  },
  {
    Term: "IT system",
    Explanation:
      "Any type of system used for electronic information processing. ",
    Examples:
      "Computer, server, cloud, communication systems, video conference systems, smartphones, tablets",
  },
  {
    Term: "Classification of information",
    Explanation:
      "The value of the information for the organization is determined based on the relevant protection goals of information security (confidentiality, integrity and availability). Based on this, the information is classified according to the classification scheme. This enables the organization to implement adequate protective measures.",
    Examples: null,
  },
  {
    Term: "Network service",
    Explanation:
      "A network service is a service which is provided by an IT system and used by other IT systems to communicate with the system via a data network.",
    Examples: "DHCP, DNS, https, STARTTLS",
  },
  {
    Term: "Original Equipment Manufacturer (OEM)",
    Explanation:
      "Within the context of VDA ISA, this refers to an automobile manufacturer.",
    Examples: null,
  },
  {
    Term: "Personal data",
    Explanation:
      "The term personal data is used for all information referring to an identified or identifiable person; a natural person is considered to be identifiable if they can be directly or indirectly identified particularly by assignment to an identifier, e.g. a name, to an identification number, to location data, to an online identification or to one or more specific features describing the physical, physiological, genetic, psychological, economic, cultural or social identity of this natural person.",
    Examples: null,
  },
  {
    Term: "Process Attributes (PA)",
    Explanation:
      "A measurable characteristic for a process capability that is applicable to each process.",
    Examples: null,
  },
  {
    Term: "Prototype",
    Explanation:
      "Prototypes are vehicles, components and parts which are classified as requiring protection but have not yet been presented to the public and/or published in adequate form by the OEM.",
    Examples: null,
  },
  {
    Term: "Maturity Level",
    Explanation:
      "Criterion for the “maturity” of the overall ISMS or parts thereof. This is the degree of structuring and systematic management of the overall process or parts thereof. For the maturity levels used in this document, the requirements given in the tab “Maturity levels” apply.",
    Examples:
      "Criterion for the degree of development of the entire ISMS or of parts thereof. This is the degree of structuring and systematic management of the processes involved. The tab “Maturity levels” includes the definition of the different maturity levels applicable within the context of this document.",
  },
  {
    Term: "Guideline",
    Explanation: "Collective term for company-internal specifications",
    Examples: null,
  },
  {
    Term: "Protection goals",
    Explanation: "Confidentiality (C)\nIntegrity (I)\nAvailability (A)",
    Examples: "Tab “Information Security”,\nColumn M (C, I, A)",
  },
  {
    Term: "Security zones",
    Explanation:
      "Security zones usually refer to a nested arrangement of areas encapsulated by means of barriers and access mechanisms. Their purpose is the physical protection of information assets. The more sensitive the information assets to be processed are the more protective measures are required.",
    Examples:
      "Storage spaces, garages, workshops, test tracks, data processing centers, development areas",
  },
];
