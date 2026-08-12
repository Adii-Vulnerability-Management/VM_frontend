import Accordion from "@/globalcomponents/NewUi/Accordion";
import { useState } from "react";
import {
    FaArchive,
    FaBalanceScale,
    FaBookOpen,
    FaBullhorn,
    FaChartPie,
    FaClipboardList,
    FaCodeBranch,
    FaExclamationTriangle,
    FaFileAlt,
    FaGraduationCap,
    FaHandsHelping,
    FaLayerGroup,
    FaListAlt,
    FaLock,
    FaNetworkWired,
    FaProjectDiagram,
    FaSearch,
    FaSyncAlt,
    FaTasks,
    FaTrashAlt,
    FaUsers,
    FaUserShield,
} from "react-icons/fa";

export default function ISO42001KnowledgeBase() {

    const [activeTab, setActiveTab] = useState("Annex");

    const tabs = ["Annex", "Governance", "RMF"];
    return (
        <div className="space-y-6">
            <div className="flex space-x-4">
                {tabs.map(t => (
                    <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`px-4 py-2 rounded-full font-medium transition ${activeTab === t
                            ? "bg-[#2B245C] text-white"
                            : "bg-white text-gray-700 border"
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>
            {activeTab === "Annex" && <section>
                <header className="flex items-center space-x-2 mb-4">
                    <FaBookOpen className="text-2xl text-[#2B245C]" />
                    <h2 className="text-2xl font-semibold text-[#2B245C]">What ISO 42001 Is and Why It Matters</h2>
                </header>
                <p className="text-gray-700">
                    ISO 42001 is a new international management standard just for AI systems. It helps organizations build, use, and monitor AI in a safe, responsible way. Getting certified means you’ve put in place policies, processes, and controls that reduce risk and make your AI systems more trustworthy.
                </p>
            </section>}

            {activeTab === "Annex" && <Accordion
                icon={FaLock}
                title="Annex A Controls (“What to Do”)"
            >
                <p className="text-gray-700 mb-2">
                    Annex A is the heart of the standard. It lists 14 control areas (A.2 through A.10) that guide you on exactly what needs to be in your AI management system:
                </p>
                <div className="rounded-lg">
                    <table className="min-w-full text-sm border-collapse mb-4 rounded-lg">
                        <thead>
                            <tr className="bg-[#2B245C] text-white">
                                <th className="px-3 py-2 text-left">Control</th>
                                <th className="px-3 py-2 text-left"> Purpose</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ["A.2 Policies Related to AI", "Write a clear AI policy: your goals, rules, and how you’ll improve over time."],
                                ["A.3 Internal Organization", "Define roles, responsibilities, and who reports to whom for AI oversight."],
                                ["A.4 Resources for AI Systems", "Make sure you have the right people, budget, tools, and training."],
                                ["A.5 Assessing Impacts of AI Systems", "Check how your AI affects people, privacy, fairness, safety, etc."],
                                ["A.6 AI System Life Cycle", "Cover AI from design → development → deployment → retirement."],
                                ["A.7 Data for AI Systems", "Ensure data quality, proper labeling, and data management."],
                                ["A.8 Info for Interested Parties of AI Systems", "Share clear info about your AI with customers, partners, regulators."],
                                ["A.9 Use of AI Systems", "Govern how AI is actually operated in day-to-day business."],
                                ["A.10 Third-Party & Customer Relationships", "Manage risks when AI comes from or serves outside parties."],
                            ].map(([ctrl, desc], idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="border px-3 py-2 text-gray-800">{ctrl}</td>
                                    <td className="border px-3 py-2 text-gray-700">{desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Accordion>}

            {activeTab === "Annex" && <Accordion
                icon={FaListAlt}
                title="Step-by-Step Certification Process"
            >
                <ol className="list-decimal list-inside text-gray-700 space-y-2">
                    <li><strong>Define Your Context (Clause 4):</strong> Identify internal/external issues, purpose of AI, and reporting processes.</li>
                    <li><strong>Identify Interested Parties (Clause 4.2):</strong> List stakeholders and address their needs (Control A.10).</li>
                    <li><strong>Determine Scope (Clause 4.3):</strong> Set boundaries for your AI MS relative to clauses and controls.</li>
                    <li><strong>Create AI MS (Clause 4.4):</strong> Build processes & interactions (Controls A.6, A.7).</li>
                    <li><strong>Leadership & Commitment (Clause 5):</strong> Secure top management buy-in and define responsibilities (Control A.3).</li>
                    <li><strong>Risk & Impact Assessments (Clause 6):</strong> Conduct risk reviews and develop treatment plans (Controls A.5).</li>
                    <li><strong>Resources & Training (Clause 7):</strong> Provide personnel, competence, and awareness (Control A.4).</li>
                    <li><strong>Operational Control (Clause 8):</strong> Use PDCA for continuous improvement and regular assessments.</li>
                    <li><strong>Performance Evaluation (Clause 9):</strong> Monitor objectives, audit, and management review.</li>
                    <li><strong>Continuous Improvement (Clause 10):</strong> Correct nonconformities and enhance your AI MS.</li>
                </ol>
            </Accordion>}

            {activeTab === "Annex" && <Accordion
                icon={FaSearch}
                title="Guidance & Risk Sources (Annex B & C)"
            >
                <p className="text-gray-700 mb-2">
                    <strong>Annex B (Normative):</strong> Provides implementation guidance for each Annex A control, similar to ISO 27002.
                </p>
                <p className="text-gray-700 mb-2">
                    <strong>Annex C (Informative):</strong> Lists potential objectives and risk sources to consider in your risk assessments:
                </p>
                <table className="min-w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-[#2B245C] text-white">
                            <th className="px-4 py-2">Objectives</th>
                            <th className="px-4 py-2">Risk Sources</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ["Accountability", "Complexity of environment"],
                            ["AI expertise", "Lack of transparency/explainability"],
                            ["Data quality", "Level of automation"],
                            ["Fairness", "System hardware issues"],
                            ["Privacy", "Technology readiness"],
                            ["Robustness", "System life cycle issues"],
                            ["Safety", "ML-specific risks"],
                        ].map(([obj, risk], i) => (
                            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="border px-4 py-2 text-gray-800">{obj}</td>
                                <td className="border px-4 py-2 text-gray-700">{risk}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="text-gray-600 text-sm italic">
                    Annex D (Informative) provides guidance on using the AI management system across domains or sectors.
                </p>
            </Accordion>}

            {activeTab === "Annex" && <Accordion
                icon={FaFileAlt}
                title="Complementary Frameworks & Regulations">
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>NIST AI RMF 1.0 (Jan 2023):</strong> Voluntary framework for AI trustworthiness.</li>
                    <li><strong>EU AI Act (In Progress):</strong> Regulation centered on safety, rights, and research.</li>
                    <li><strong>Biden Executive Order (Oct 2023):</strong> US strategy to harness AI potential responsibly.</li>
                    <li><strong>HITRUST CSF v11.2.0 AI:</strong> Cybersecurity controls updated for AI risk management.</li>
                </ul>
            </Accordion>}

            {activeTab === "RMF" && (
                <div className="space-y-6">

                    <Accordion icon={FaTasks} title="AI RMF Functions">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                <strong>The AI RMF Functions</strong><br />
                                The AI RMF comprises four key functions: GOVERN, MAP, MEASURE, and MANAGE. These functions provide organizations with a structured and measurable process to address AI risks effectively. While GOVERN applies across all stages of AI risk management, MAP, MEASURE, and MANAGE can be tailored to specific AI system contexts and lifecycle stages.
                            </p>
                            <p>Let’s delve into the explanation of each function.</p>

                            <p><strong>1. Govern</strong><br />
                                The govern function establishes and nurtures a risk management culture within organizations involved in AI systems. It involves:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Cultivating a risk-aware culture throughout the AI system’s lifecycle.</li>
                                <li>Outlining processes to identify and manage potential risks, aligning with organizational values and principles.</li>
                                <li>Assessing potential impacts and aligning risk management with organizational policies and priorities.</li>
                                <li>Ensuring accountability structures are in place, with clear roles and responsibilities documented.</li>
                                <li>Prioritizing diversity, equity, inclusion, and accessibility in risk management throughout the AI system’s lifecycle.</li>
                                <li>Establishing processes for engagement with external AI actors and addressing risks arising from third-party entities.</li>
                            </ul>
                            <p><em>Key Emphasis:</em> Governance is an ongoing, cross-cutting process, and strong governance enhances organizational risk culture.</p>

                            <p><strong>2. Map</strong><br />
                                The map function establishes the context for understanding risks related to an AI system. It involves:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Understanding and documenting intended purposes, potential impacts, and contextual factors.</li>
                                <li>Categorizing the AI system, defining tasks and methods, and assessing scientific integrity.</li>
                                <li>Understanding AI capabilities, goals, and expected benefits, comparing them with benchmarks.</li>
                                <li>Mapping risks and benefits of all components, including third-party entities.</li>
                                <li>Characterizing impacts on individuals, groups, and society.</li>
                            </ul>
                            <p><em>Key Emphasis:</em> Mapping enhances the organization’s ability to identify, prevent, and understand risks by considering diverse perspectives and engaging with external collaborators.</p>

                            <p><strong>3. Measure</strong><br />
                                The measure function employs quantitative and qualitative tools to analyze and assess AI risks. It includes:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Identifying and applying appropriate methods and metrics.</li>
                                <li>Evaluating AI systems for trustworthy characteristics, performance, safety, and security.</li>
                                <li>Establishing mechanisms for tracking identified risks over time.</li>
                                <li>Gathering feedback about the efficacy of measurement processes.</li>
                            </ul>
                            <p><em>Key Emphasis:</em> Measurement provides a basis for objective, repeatable testing, informing risk management decisions and allowing for continuous improvement.</p>

                            <p><strong>4. Manage</strong><br />
                                The manage function involves allocating resources to mapped and measured risks and responding to incidents. It includes:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Prioritizing and responding to AI risks based on assessments from the Map and Measure functions.</li>
                                <li>Planning and implementing strategies to maximize benefits and minimize negative impacts.</li>
                                <li>Managing risks and benefits from third-party entities.</li>
                                <li>Documenting and monitoring risk treatments, response, recovery, and communication plans.</li>
                            </ul>
                            <p><em>Key Emphasis:</em> The manage function focuses on ongoing risk management, ensuring that plans are in place and resources are allocated to address identified risks effectively.</p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaFileAlt} title="Implementation Phases">
                        <div className="space-y-4 text-gray-700">
                            <h3 className="font-semibold">NIST AI RMF Guide: A Three-Phase Approach to Implementation</h3>
                            <p><strong>Phase 1: Study and Prepare</strong><br />
                                Commencing the implementation journey involves a detailed study of the NIST AI RMF and its accompanying playbook. During this phase, organizations should identify relevant internal documentation, such as ethical playbooks and corporate policies related to AI.
                            </p>
                            <p><strong>Phase 2: Map to Internal Methodology</strong><br />
                                The second phase centers on mapping the NIST AI data risk management framework core functions to the organization’s internal methodology. For instance, aligning the Govern, Map, Measure, and Manage functions with existing internal processes helps identify areas of alignment and potential gaps. This phase ensures the organization’s approach covers all essential functions across the AI lifecycle.
                            </p>
                            <p><strong>Phase 3: Systematic Analysis</strong><br />
                                Building upon the insights gathered in the first two phases, a systematic analysis is conducted to evaluate alignment with the NIST AI RMF functions, categories, and subcategories. This detailed scrutiny ensures that internal standards, policies, and practice guidance integrate with the framework’s requirements. The systematic analysis serves as a bridge between theoretical alignment and practical implementation.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaSearch} title="Challenges">
                        <div className="space-y-4 text-gray-700">
                            <h3 className="font-semibold">Challenges in AI Risk Management</h3>
                            <p>While the NIST AI RMF gives the process some structure, managing AI risks is still challenging. Notable obstacles include:</p>
                            <p><strong>Risk Measurement</strong><br />
                                AI itself is a relatively new concept, which means there’s a lot we can’t yet understand or define. It’s difficult to accurately measure risk, track emerging problems, and solve issues based on previous experiences because there isn’t extensive context or available metrics. Companies using AI often have to learn as they go.
                            </p>
                            <p><strong>Risk Prioritization</strong><br />
                                Not all AI risks are of equal concern. But when it’s unclear how AI systems work, it’s hard to tell which issues are most important. AI systems trained with sensitive information should be at the top of your list because there’s more to lose if something compromises them. Those trained with non-sensitive data aren’t as risky since they don’t usually contain personally identifiable information.
                            </p>
                            <p><strong>Risk Tolerance</strong><br />
                                Risk tolerance refers to how much risk your team or organization can handle. Previous experiences, data sensitivity, and legal or regulatory requirements can all impact this challenge. The most important thing to note about risk tolerance is that it can—and will—evolve as AI systems do. Stay fluid and continually reassess your organization’s tolerance to make sure you can handle what comes your way.
                            </p>
                            <p><strong>Risks Across Different Stages of AI Lifecycle</strong><br />
                                Depending on AI’s use case, it can have a long lifecycle. The more you use it, the more opportunity there is for risk. And since AI systems become increasingly complex as they change over time, measuring risks early on differs tremendously from doing so later. Your risk management practices have to account for this evolution.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaFileAlt} title="Implementation Steps">
                        <div className="space-y-4 text-gray-700">
                            <h3 className="font-semibold">How to Implement the NIST AI Risk Management Framework</h3>
                            <p>Want to implement the NIST AI standards? Here’s how:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li><strong>Understand the AI Risk Management Framework:</strong> The first step is to read and understand the NIST AI RMF documentation. It’s a complex, lengthy text, but the insights within are invaluable.</li>
                                <li><strong>Recognize AI System Presence:</strong> Inventory the AI applications and systems your team uses. Note their objectives, data inputs, and outcomes to help identify potential risks.</li>
                                <li><strong>Perform a Risk Analysis:</strong> Go through your list of AI systems, determine the potential vulnerabilities and threats, and categorize them into different risk levels. This gives you the information to isolate how these risks could impact your business and its goals.</li>
                                <li><strong>Determine Risk Mitigation Techniques:</strong> Develop procedures to mitigate risks, like implementing technical controls or tightening security for systems using sensitive data. To streamline the process, work with an expert or AI risk management software.</li>
                                <li><strong>Implement Risk Mitigation Techniques:</strong> Now it’s time to act proactively and implement the techniques you explored. If possible, perform tests to make sure the proposed strategies work. Remember: Risk mitigation techniques will change as AI systems do, so check in intermittently by completing more analyses.</li>
                            </ol>
                        </div>
                    </Accordion>

                </div>
            )}

            {activeTab === "Governance" && (
                <div className="space-y-6">

                    <Accordion icon={FaBalanceScale} title="Legal & Regulatory Requirements">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                AI systems may be subject to specific applicable legal and regulatory requirements. Some legal requirements can mandate (e.g., nondiscrimination, data privacy and security controls) documentation, disclosure, and increased AI system transparency. These requirements are complex and may not be applicable or differ across applications and contexts.
                            </p>
                            <p>
                                For example, AI system testing processes for bias measurement, such as disparate impact, are not applied uniformly within the legal context. Disparate impact is broadly defined as a facially neutral policy or practice that disproportionately harms a group based on a protected trait. Notably, some modeling algorithms or debiasing techniques that rely on demographic information could also come into tension with legal prohibitions on disparate treatment (i.e., intentional discrimination).
                            </p>
                            <p>
                                Additionally, some intended users of AI systems may not have consistent or reliable access to fundamental internet technologies (the “digital divide”) or may experience difficulties interacting with AI systems due to disabilities or impairments. Such factors may mean different communities experience bias or other negative impacts when trying to access AI systems. Failure to address such design issues may pose legal risks, for example in employment-related activities affecting persons with disabilities.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaClipboardList} title="Policies, Processes & Procedures">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Policies, processes, and procedures are central components of effective AI risk management and fundamental to individual and organizational accountability. All stakeholders benefit from policies, processes, and procedures which require preventing harm by design and default.
                            </p>
                            <p>
                                Organizational policies and procedures will vary based on available resources and risk profiles, but can help systematize AI actor roles and responsibilities throughout the AI lifecycle. Without such policies, risk management can be subjective across the organization, and exacerbate rather than minimize risks over time.
                            </p>
                            <p>
                                Policies, or summaries thereof, are understandable to relevant AI actors. They reflect an understanding of the underlying metrics, measurements, and tests necessary to support policy and AI system design, development, deployment, and use. Lack of clear information about responsibilities and chains of command will limit the effectiveness of risk management.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaChartPie} title="Finite Risk Management Resources">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Risk management resources are finite in any organization. Adequate AI governance policies delineate the mapping, measurement, and prioritization of risks to allocate resources toward the most material issues for an AI system.
                            </p>
                            <p>
                                Policies may specify systematic processes for assigning mapped and measured risks to standardized risk scales. AI risk tolerances range from negligible to critical—almost no risk to risks that can result in irredeemable human, reputational, financial, or environmental losses.
                            </p>
                            <p>
                                A typical risk measurement approach entails the multiplication, or qualitative combination, of measured or estimated impact and likelihood into a risk score (risk ≈ impact × likelihood). This score is placed on a risk scale (e.g., red-amber-green or simulations). Impact assessments help understand severity, and in the most fulsome approaches all models are assigned a risk level.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaFileAlt} title="Documentation & Transparency">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Clear policies and procedures for documentation and transparency facilitate communication of roles and responsibilities across Map, Measure, and Manage functions. Standardized documentation integrates AI risk management processes and enhances accountability.
                            </p>
                            <p>
                                By adding contact information to work-product documents, AI actors improve communication, ownership, and product quality. Proper storage and access procedures allow quick retrieval of critical information during incidents. Explainable ML methods can bolster technical documentation by providing extra review and interpretation context.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaSearch} title="Continuous Monitoring & Incident Response">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                AI systems are dynamic and may perform in unexpected ways once deployed. Continuous monitoring tracks issues and performance changes, in real time or at set intervals, across the AI lifecycle.
                            </p>
                            <p>
                                Incident response and “appeal and override” are IT management processes enabling real-time flagging of potential incidents and human adjudication. Establishing and maintaining incident response plans reduces additive impacts during AI incidents. Smaller organizations can leverage these plans even without full governance programs.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaArchive} title="AI System Inventory">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                An AI system inventory is an organized database of artifacts relating to each model or system—documentation, plans, data dictionaries, source code links, AI actor contacts, etc.—providing a holistic view of AI assets.
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>“When was this model last refreshed?”</li>
                                <li>“How many models are currently deployed?”</li>
                                <li>“How many users are impacted by our models?”</li>
                            </ul>
                            <p>
                                Inventories are a core element of model risk management, delivering technical, business, and risk benefits. Partial inventories lack the full value of a complete system register.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaTrashAlt} title="Decommissioning AI Systems">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Irregular or indiscriminate termination or deletion of AI systems may increase organizational risk. To maintain trust, establish policies and procedures for systematic, deliberate decommissioning—considering user and community concerns, dependent systems, and legal or regulatory requirements.
                            </p>
                            <p>
                                Decommissioned models should be archived alongside active models for a defined retention period.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaUsers} title="Cultivating a Risk-Aware Culture">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                A risk-aware culture begins with clear responsibility definitions. Independent test & evaluation teams reporting outside of development can counter biases like groupthink or sunk-cost fallacy.
                            </p>
                            <p>
                                Empowered AI actors should be able to question design and implementation decisions, enabling organizations to anticipate and manage risks before they become ingrained.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaGraduationCap} title="Training & Awareness">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Integrate AI risk management curricula into enterprise learning requirements. Regular training helps AI actors maintain awareness of:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Risk management goals and their role in achieving them</li>
                                <li>Organizational policies, applicable laws, and best practices</li>
                            </ul>
                            <p>
                                (See MAP 3.4 & 3.5 for more on training alignment.)
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaUserShield} title="Leadership Accountability">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Senior leadership and the C-Suite must maintain awareness of AI risks, affirm risk appetite, and be responsible for risk management. Accountability structures ensure a designated team or officer oversees the AI portfolio (e.g., predictive models, ML).
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaHandsHelping} title="Workforce Diversity & Inclusion">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Diverse teams—across experience, disciplines, and backgrounds—enhance capacity to anticipate and manage risks. Where needed, engage external experts to fill gaps in lived experience or domain expertise.
                            </p>
                            <p>
                                Without senior commitment, DI&I benefits can be overridden by competing organizational incentives.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaNetworkWired} title="Cross-Functional Perspectives">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Engage a broad set of perspectives—technical, legal, compliance, social science, human factors—across the AI lifecycle. Define and differentiate roles for AI system oversight versus downstream use.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaLayerGroup} title="Fostering a Strong Risk Culture">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Many organizations adopt a “three-lines of defense” model: separate teams for development, risk management, and auditing. Smaller orgs can replicate similar challenge processes—like “effective challenge” and red-teaming—for adversarial testing under stress.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaProjectDiagram} title="Impact Assessments">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Impact assessments frame risks for specific use cases, generating documentation for managing harms. They may:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Be applied iteratively as goals evolve</li>
                                <li>Include perspectives from operators, users, and impacted communities</li>
                                <li>Assist in “go/no-go” decisions</li>
                                <li>Consider conflicts of interest within assessment teams</li>
                            </ul>
                            <p>
                                (See the MAP playbook guidance for details.)
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaExclamationTriangle} title="System Limitations & Incident Tracking">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Identify system limitations, detect and track negative impacts (concept drift, bias, underspecification), and share findings. Use in-house testing, limited pre-alpha/beta testbeds, and stakeholder feedback loops.
                            </p>
                            <p>
                                Information sharing about detected issues can:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Draw attention to risks, failures, or abuses</li>
                                <li>Leverage insights across implementations</li>
                                <li>Proactively avoid known failure modes</li>
                            </ul>
                            <p>
                                Consider reporting to AI Incident Database, AIAAIC, or MITRE CVE.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaBullhorn} title="Fitness-for-Purpose & Stakeholder Engagement">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Beyond lab testing, assess AI fitness-for-purpose in its intended context. Use participatory stakeholder engagement to design for impact, identify emergent risks, and gather iterative feedback.
                            </p>
                            <p>
                                Engagement should be facilitated by qualitative experts, run continuously through the lifecycle, and transparently communicated to avoid “participation washing.” Supplement with targeted expert consultation as needed.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaLayerGroup} title="Collaborative Decision-Making & Risk Tolerance">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Equip AI actors with knowledge and processes to make collaborative deployment decisions. Risk tolerance—set by leadership—governs resource allocation: higher-risk systems receive more controls and oversight than lower-risk ones.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaCodeBranch} title="Managing Third-Party Integration Risks">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Third-party data, models, and services introduce complexity. Tailor governance approaches to each use case—treat open source, public data, and commercial models with the same rigor as internal assets.
                            </p>
                        </div>
                    </Accordion>

                    <Accordion icon={FaSyncAlt} title="Redundancy & Safeguards for Third-Party Functions">
                        <div className="space-y-4 text-gray-700">
                            <p>
                                To mitigate harms from third-party failures, implement redundancies and fallback procedures covering critical external functions.
                            </p>
                        </div>
                    </Accordion>

                </div>
            )}



            {/* Dashboard Section */}
            {/* <section>
                <header className="flex items-center space-x-2 mb-4">
                    <FaChartPie className="text-2xl text-[#2B245C]" />
                    <h2 className="text-2xl font-semibold text-[#2B245C]">Dashboard</h2>
                </header>
                <p className="text-gray-700 mb-2">
                    The Dashboard is your command center—it surfaces the health of your AI Management System at a glance:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>Summary Cards:</strong> Quick totals for Completed ✅, Pending ⏳, and Overdue ⚠️ controls.</li>
                    <li><strong>Priority Distribution:</strong> A pie chart showing High 🔴, Medium 🟠, and Low 🟢 priority breakdown.</li>
                    <li><strong>Assignment Workload:</strong> Bar chart of active controls per team member.</li>
                    <li><strong>Completion Trend:</strong> Line chart tracking monthly “Completed vs. Pending” counts.</li>
                    <li><strong>Upcoming Due Controls:</strong> Table of the next controls nearing their due dates.</li>
                </ul>
            </section> */}

            {/* Clauses Section */}
            {/* <section >
                <header className="flex items-center space-x-2 mb-4">
                    <FaListAlt className="text-2xl text-[#2B245C]" />
                    <h2 className="text-2xl font-semibold text-[#2B245C]">Clauses</h2>
                </header>
                <p className="text-gray-700 mb-2">
                    The Clauses tab lists the normative ISO 42001 requirements (Clauses 4–10) that define your AI MS:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Clause number and title (e.g. “5.1 Leadership & Commitment”).</li>
                    <li>Plain‐language summary explaining the requirement and its intent.</li>
                    <li>Links to related Annex A controls, ensuring traceability from policy to practice.</li>
                </ul>
            </section> */}

            {/* Annex A Section */}
            {/* <section>
                <header className="flex items-center space-x-2 mb-4">
                    <FaLock className="text-2xl text-[#2B245C]" />
                    <h2 className="text-2xl font-semibold text-[#2B245C]">Annex A Controls</h2>
                </header>
                <p className="text-gray-700 mb-2">
                    Annex A is the master catalog of all ISO 42001 controls (A.2.1–A.11.x). It’s your reference for every requirement:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Read-only list of control IDs, titles, and full descriptions.</li>
                    <li>Search and filter by control code or keyword to pinpoint specific controls.</li>
                    <li>Toggle “Applicable” ✔️/❌ to include or exclude controls from your scope, with a required justification for exclusions.</li>
                </ul>
            </section> */}

            {/* Controls Section */}
            {/* <section>
                <header className="flex items-center space-x-2 mb-4">
                    <FaTasks className="text-2xl text-[#2B245C]" />
                    <h2 className="text-2xl font-semibold text-[#2B245C]">Controls</h2>
                </header>
                <p className="text-gray-700 mb-2">
                    The Controls tab is where you execute and document each applicable control:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Assign controls to team members, set due dates, and flag by priority.</li>
                    <li>Upload evidence files and record Pass/Fail test outcomes.</li>
                    <li>Add tester comments and view reviewer & approver statuses with notes.</li>
                    <li>Use bulk actions to assign, update statuses, or export multiple controls at once.</li>
                </ul>
            </section> */}

        </div>
    );
}
