const data = [
  {
    "Root ISA New": "1",
    "Root Control question": "Information Security",
    "Parent ISA New": "1.1",
    "Parent Control question": "Information security guidelines",
    "ISA New": "1.1.1",
    "Control question":
      "To what extent are information security policies in place?",
    Objective:
      "The organization needs at least one information security policy. This reflects the importance and importance of information security and is adapted to the organization. Additional guidelines may be useful depending on the size and structure of the organization.",
    "Must Requirements": [
      "Information security requirements have been defined and documented: – The requirements are adapted to the objectives of the organization, — A policy is created and shared by the organization.",
      "The Directive sets out the objectives and importance of information security within the organization.",
    ],
    "Should Requirements": [
      "The requirements for information security based on organizational strategy, laws and contracts are taken into account in the Directive.",
      "The Directive indicates the consequences of non compliance.",
      "Other relevant security policies have been created.",
      "Regular review and, if necessary, revision of the guidelines are in place.",
      "The guidelines are made available to employees in an appropriate form (e.g. intranet).",
      "Employees and external business partners are informed of any changes relevant to them.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "1",
    "Root Control question": "Information Security",
    "Parent ISA New": "1.2",
    "Parent Control question": "Organization of Information Security",
    "ISA New": "1.2.1",
    "Control question":
      "To what extent is information security managed in the organization?",
    Objective:
      "Information security can only be implemented sustainably in an organization if it is anchored in the strategic goals of an organization. The Information Security Management System (ISMS) is a control tool for the organization's management to ensure that information security is not only the result of chance and individual commitment, but also of sustainable management.",
    "Must Requirements": [
      "The scope of the ISMS (the organization managed by the ISMS) is set.",
      "The organization's ISMS requirements have been determined.",
      "The organization management commissioned and approved the ISMS.",
      "The ISMS provides the organizational management with suitable control and monitoring means (e.g. management review).",
      "Applicable measures have been identified (e.g. ISO 27001 declaration of applicability, completed ISA catalog).",
      "The effectiveness of the ISMS is regularly reviewed by management.",
    ],
    "Should Requirements": null,
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "1",
    "Root Control question": "Information Security",
    "Parent ISA New": "1.2",
    "Parent Control question": "Organization of Information Security",
    "ISA New": "1.2.2",
    "Control question":
      "To what extent are the responsibilities for information security organized??",
    Objective:
      "A successful ISMS requires clear organizational responsibilities.",
    "Must Requirements": [
      "Responsibilities for information security in the organization are defined, documented, and assigned.",
      "The responsible employees are defined and qualified for their task.",
      "The necessary resources are available.",
      "The contact persons are known within the organization and relevant business partners.",
    ],
    "Should Requirements": [
      "There is a definition and documentation of an appropriate information security structure in the organization.",
      "Other relevant safety tasks are taken into account.",
    ],
    "Additional requirements for high protection needs": [
      "Appropriate organizational separation of responsibilities should be established to avoid conflicts of interest (separation of functions). (C, I, A)",
    ],
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "1",
    "Root Control question": "Information Security",
    "Parent ISA New": "1.2",
    "Parent Control question": "Organization of Information Security",
    "ISA New": "1.2.3",
    "Control question":
      "To what extent are information security requirements considered in projects?",
    Objective:
      "Für die Durchführung von Projekten ist es wichtig, die Informationssicherheitsanforderungen zu berücksichtigen. Dies gilt für Projekte innerhalb der Organisation, unabhängig von der Art des Projekts. Durch eine geeignete Verankerung des Informationssicherheitsprozesses in den Projektmanagementverfahren der Organisation wird sichergestellt, dass keine Anforderungen übersehen werden. ",
    "Must Requirements": [
      "Projekte sind unter Berücksichtigung der Anforderungen an die Informationssicherheit klassifiziert.",
    ],
    "Should Requirements": [
      "Die Vorgehensweise und Kriterien zur Klassifizierung von Projekten sind dokumentiert.",
      "In einer frühen Phase des Projektes wird eine Risikobewertung auf Basis der definierten Vorgehensweise durchgeführt und bei Änderungen des Projektes wiederholt.",
      "Für identifizierte Informationssicherheitsrisiken werden Maßnahmen abgeleitet und im Projekt berücksichtigt.",
    ],
    "Additional requirements for high protection needs": [
      "Die so abgeleiteten Maßnahmen werden im Verlauf des Projektes regelmäßig überprüft und bei Änderungen der Bewertungskriterien neu bewertet. (C, I, A)",
    ],
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "1",
    "Root Control question": "Information Security",
    "Parent ISA New": "1.2",
    "Parent Control question": "Organization of Information Security",
    "ISA New": "1.2.4",
    "Control question":
      "To what extent are the responsibilities defined between IT service providers outside the organization and their own organization?",
    Objective:
      "It is important to have a common understanding of the division of responsibilities and to ensure the implementation of all safety requirements. When using non organizational IT service providers and IT services, the responsibilities regarding the implementation of information security measures must therefore be defined and documented in a verifiable manner.",
    "Must Requirements": [
      "The relevant IT services used have been identified.",
      "The security requirements relevant to the IT service have been identified:",
      "The organization responsible for the implementation of the requirement is defined and aware of its responsibility.",
      "Mechanisms for shared responsibilities have been defined and implemented.",
      "The responsible organization fulfills its respective responsibilities.",
    ],
    "Should Requirements": [
      "For IT services, the configuration was designed, implemented and documented according to the necessary security requirements.",
      "The responsible personnel are trained accordingly.",
    ],
    "Additional requirements for high protection needs": [
      "A list of the relevant IT services and the responsible IT service providers exists. (C, I, A)",
      "The applicability of ISA measures has been verified and documented. (C, I, A)",
      "Service configuration is included in periodic security assessments. (C, I, A)",
      "There is evidence that IT service providers are meeting their responsibilities. (C, I, A)",
      "Integration into local protection measures (such as secure authentication procedures) is established and documented. (C, I, A)",
    ],
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "1",
    "Root Control question": "Information Security",
    "Parent ISA New": "1.3",
    "Parent Control question": "Asset-Management",
    "ISA New": "1.3.1",
    "Control question":
      "To what extent are information values (assets) identified and recorded?",
    Objective:
      "For any organization, it is important to know the information that is of significant value to them (e.g. trade secrets, critical business processes, know-how, patents). These are called information values. Inventory ensures that the organization has an overview of its information assets. In addition, it is important to know the information carriers (e.g. IT systems, services/IT services, employees) that process these information values.",
    "Must Requirements": [
      "' Information values and other assets whose security is relevant to the organization are identified and recorded. - A responsible person is assigned to these information values.",
      "The information carriers that process the information values are identified and recorded: – A responsible person is assigned to these information carriers.",
    ],
    "Should Requirements": [
      "There is a directory of relevant information values: – The relevant information carriers are assigned to each relevant information value. – A regular review of the register will take place.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "1",
    "Root Control question": "Information Security",
    "Parent ISA New": "1.3",
    "Parent Control question": "Asset-Management",
    "ISA New": "1.3.2",
    "Control question":
      "To what extent are information assets classified and managed according to their protection needs?",
    Objective:
      "The objective of classifying information values is to consistently identify their protection needs. To this end, the value of information to the organization is determined on the basis of the protection objectives of information security (confidentiality, integrity and availability) and classified into a classification scheme. This allows the organization to implement adequate protection measures.",
    "Must Requirements": [
      "A common scheme for classifying information values with respect to the protection objective of confidentiality is available.",
      "An assessment of the identified information values according to the defined criteria is carried out and assigned to the existing classification scheme.",
      "Specifications for the handling of information carriers (e.g. labeling, correct handling, transport, storage, return, deletion/disposal) depending on the classification of the information values are available and implemented.",
    ],
    "Should Requirements": [
      "' Integrity and availability protection objectives are taken into account.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "1",
    "Root Control question": "Information Security",
    "Parent ISA New": "1.3",
    "Parent Control question": "Asset-Management",
    "ISA New": "1.3.3",
    "Control question":
      "To what extent is it ensured that only evaluated and approved IT services outside the organization are used to process information values of the organization?",
    Objective:
      "In particular, in the case of IT services outside the organization, which can be used at relatively low cost or free of charge, there is an increased risk that the procurement and commissioning will take place without appropriate consideration of the information security requirements and thus security will not be ensured.",
    "Must Requirements": [
      "No non organizational IT services will be used without explicit assessment and implementation of information security requirements: – A risk assessment of non organizational IT services is available, – Legal, regulatory and contractual requirements are taken into account.",
      "Non-organizational IT services were tailored to the protection needs of the processed information values.",
    ],
    "Should Requirements": [
      "Requirements regarding procurement, commissioning and release in connection with the use of non organizational IT services have been identified and fulfilled.",
      "A procedure for release taking into account protection needs is established.",
      "Non-organizational IT services and their release are documented.",
      "It is regularly checked that only approved IT services from outside the organization are used.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "1",
    "Root Control question": "Information Security",
    "Parent ISA New": "1.3",
    "Parent Control question": "Asset-Management",
    "ISA New": "1.3.4",
    "Control question":
      "To what extent is it ensured that only evaluated and approved software is used to process information values of the organization?",
    Objective:
      "Information processing is usually carried out with special software. Security issues in the software easily become a risk to the information being processed. Accordingly, the software must be properly managed.",
    "Must Requirements": [
      "Before installation or use, the software is approved. The following aspects will be taken into account: – Limited release for specific use cases or tasks - Compliance with information security requirements – Usage rights and software licensing – Source/view of software",
      "Software release also applies to software for a specific purpose, e.g. maintenance tools.",
    ],
    "Should Requirements": [
      "' The types of software to manage, such as firmware, operating systems, applications, libraries, device drivers, are identified.",
      "Managed software repositories exist",
      "Software repositories are protected against unauthorized manipulation",
      "The release of the software is regularly checked",
      "Software versions and patch levels are known.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": [
      "Additional software usage requirements (e.g. need to control or monitor usage) are defined (if applicable) (C, I, A)",
    ],
  },
  {
    "Root ISA New": "1",
    "Root Control question": "Information Security",
    "Parent ISA New": "1.4",
    "Parent Control question": "Information Security Risk Management",
    "ISA New": "1.4.1",
    "Control question": "How are information security risks managed?",
    Objective:
      "The objective of information security risk management is the timely identification, assessment and treatment of risks in order to achieve the protection objectives of information security. It thus enables the organization to establish appropriate measures to protect its information assets, taking into account the associated opportunities and risks. It is recommended to make an organization's information security risk management as simple as possible in order to operate it effectively and efficiently.",
    "Must Requirements": [
      "Risk assessments are carried out both periodically and in response to events.",
      "Information security risks are adequately assessed (e.g. in terms of probability of occurrence and potential damage).",
      "Information security risks are documented.",
      "Each information security risk is assigned a controller (risk owner). It is responsible for assessing and addressing information security risks.",
    ],
    "Should Requirements": [
      "' There is a process in place to determine how to identify, assess, and manage security risks within the organization.",
      "Criteria for the assessment and management of safety risks are in place.",
      "Measures for dealing with security risks and those responsible for them are defined and documented: – A plan of measures or an overview of the implementation status of the measures is followed.",
      "In the event of changes in the environment (e.g. organizational structure, location, changes to regulations), a timely reassessment is carried out.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "1",
    "Root Control question": "Information Security",
    "Parent ISA New": "1.5",
    "Parent Control question": "Assessment",
    "ISA New": "1.5.1",
    "Control question":
      "To what extent is compliance with information security ensured in procedures and processes?",
    Objective:
      "It is not enough to define information security requirements and create and publish policies. It is important to regularly review their effectiveness.",
    "Must Requirements": [
      "Compliance with guidelines is verified throughout the organization.",
      "Examinations of information security policies and procedures are carried out regularly.",
      "Corrective actions for possible non conformities (deviations) are initiated and followed up.",
      "Compliance with information security requirements (e.g. technical specifications) will be reviewed at regular intervals.",
      "The results of the verifications carried out shall be recorded and retained.",
    ],
    "Should Requirements": [
      "A plan is in place setting out the content and framework (timetable, scope, controls) of the reviews to be carried out.Informationssicherheit!D20",
      "Informationssicherheit!D20",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "1",
    "Root Control question": "Information Security",
    "Parent ISA New": "1.5",
    "Parent Control question": "Assessment",
    "ISA New": "1.5.2",
    "Control question":
      "To what extent is the ISMS audited by an independent body?",
    Objective:
      "As an essential control tool, it is not enough to assess the effectiveness of ISMS exclusively from an internal perspective. In addition, an independent and thus objective assessment must be obtained at regular intervals and in the event of significant changes.",
    "Must Requirements": [
      "Information security audits shall be carried out by an independent and competent body at regular intervals and in the event of significant changes.",
      "Corrective actions for possible deviations are initiated and followed up.",
    ],
    "Should Requirements": [
      "The results of the tests carried out are documented and reported to the organization's management.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "1",
    "Root Control question": "Information Security",
    "Parent ISA New": "1.6",
    "Parent Control question": "Incident and Crisis Management",
    "ISA New": "1.6.1",
    "Control question":
      "To what extent are events or observations relevant to information security reported?                                           ",
    Objective:
      "Possible security events or observations are recognized by everyone. It is crucial that everyone is aware of when and how to report their own observations, which may have a safety impact, or events, so that experts can decide whether and how to deal with them.",
    "Must Requirements": [
      "There is a definition of a reportable security event or observation known to staff and relevant stakeholders. The following aspects will be taken into account: – Events and observations related to personnel (e.g. misconduct) – Events and observations related to physical security (e.g. burglary, theft, unauthorized access to security zones, vulnerabilities in security zones) – Events and observations related to IT and cybersecurity (e.g. vulnerable IT systems, successful or unsuccessful attacks detected) – Events and observations relating to suppliers and other business partners (e.g. any incident that may have a negative impact on the security of your own organization)",
      "Appropriate mechanisms for reporting security events based on perceived risks are established and implemented and known to all relevant possible reporters",
      "Appropriate channels of communication are available for the persons reporting events.",
    ],
    "Should Requirements": [
      "There is a single point of contact for reporting events.",
      "Depending on the perceived severity, different reporting channels are available (i.e. real-time communication for significant events/emergencies in addition to asynchronous mechanisms such as tickets or email).",
      "Employees are required to report relevant events and are trained accordingly.",
      "Reporting of security events by parties outside the organization is taken into account. – An externally accessible means of reporting security events is available and is communicated, – The response to security event reports from non organizational parties is defined",
      "Incident reporting procedures and information on how to report them are accessible to all relevant reporting persons.",
      "A procedure for feedback to reporters is in place.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": [
      "Tests and exercises shall be carried out on a regular basis with regard to the reporting of safety events and observations. (C, I, A)",
    ],
  },
  {
    "Root ISA New": "1",
    "Root Control question": "Information Security",
    "Parent ISA New": "1.6",
    "Parent Control question": "Incident and Crisis Management",
    "ISA New": "1.6.2",
    "Control question": "To what extent are reported security events managed?",
    Objective:
      "Once security events have been reported, it is critical to manage how they are handled. This means ensuring that the nature and criticality of the reported event as well as the responsible persons are quickly identified to ensure that time-critical aspects can be dealt with in a timely manner. Once identification has taken place, it is necessary to ensure that the responsible persons are aware of the event and deal with it within a reasonable timeframe. In addition, if the event affects several different people or the management is also involved, coordinating communication is an important part of event management. Finally, if there are external reporting requirements (contractual or regulatory), it is important to ensure that they are also met in a professional manner.",
    "Must Requirements": [
      "' Reported events are handled without unnecessary delay.",
      "Adequate response to reported security events is ensured.",
      "Lessons learned in this respect will be incorporated into the continuous improvement.",
    ],
    "Should Requirements": [
      "During the processing, reported events are categorized (e.g. according to the responsibility in terms of personnel, physical security and cybersecurity events), qualified (e.g. not relevant to security, observation, proposed security enhancement, security vulnerability, security incident) and prioritized (e.g. low, medium, high, critical severity).",
      "Responsibilities for handling events are defined and assigned based on the event category. The following aspects will be taken into account: – Coordinate incidents and vulnerabilities across multiple categories – Skills and resources – Contact procedures based on type and priority (e.g. non time critical communication, time critical communication, emergency communication) – Absence management",
      "A strategy is in place to archive official reports and search for prosecutions of aspects of security incidents that may be relevant to criminal law. (C, I, A)",
    ],
    "Additional requirements for high protection needs": [
      "' Maximum response times are defined based on class, category, and severity. (C, I, A)",
      "Events that have not been properly handled according to their priority will be escalated. (C, I, A) – Conditions and thresholds, such as maximum response times, are defined before escalation – Mechanisms, processes and contacts for escalation are defined – Escalation routes to the top management of the organization have been defined",
      "Legal, regulatory and contractual reporting obligations and corresponding contact information are known. (C, I, A)",
      "A communication strategy for security-related events is in place. The following aspects are taken into account: (C, I, A) – Who to communicate with (e.g. shareholders, affected business partners and customers, other shareholders, general public) – When to communicate – Responsibilities for communication – Authorization and release of communication – Legal and regulatory restrictions on communication – What to communicate (e.g. prepared templates and building blocks for specific scenarios) – How to communicate (e.g. communication channels)",
      "Procedures for responding to supplier security incidents are in place. The following aspects are taken into account: (C, I, A) – Analyze the impact on your organization and call up internal mechanisms – The need for reporting according to own reporting procedures",
    ],
    "Additional requirements for very high protection needs": [
      "The handling of events in different categories and with different priorities is regularly reviewed. (A) - Practice or simulation of rare categories and priorities - Exercises or simulations include escalation procedures",
    ],
  },
  {
    "Root ISA New": "1",
    "Root Control question": "Information Security",
    "Parent ISA New": "1.6",
    "Parent Control question": "Incident and Crisis Management",
    "ISA New": "1.6.3",
    "Control question":
      "To what extent is the organization prepared to deal with crisis situations? ",
    Objective:
      "A crisis situation occurs when extraordinary situations (such as natural disasters, physical attacks, pandemics, extraordinary social situations, cyber attacks that lead to the failure of critical infrastructure) severely disrupt core business operations. In such cases, the organization's main priority is to deal with the situation in the most dignified way possible and to recover as quickly as possible. To achieve this, and because time is crucial, the usual concept is to switch to a crisis management mode, to execute pre-planned procedures with a certain distribution of responsibilities and structures that allow an organization to deal with such a situation.",
    "Must Requirements": [
      "Appropriate planning is in place to respond to and recover from crisis situations.",
      "The necessary resources are available.",
      "Responsibilities and powers for crisis management within the organization are defined, documented and assigned.",
      "The responsible employees are defined and qualified for their task.",
    ],
    "Should Requirements": [
      "procedures for the detection of crisis situations are in place. – General indications of an existing or imminent crisis situation and a certain foreseeable crisis have been identified",
      "A procedure to retrieve and/or escalate crisis management is in place.",
      "Strategic objectives and their priority in crisis situations are defined and known to the relevant staff. The following aspects will be taken into account: – Ethical priorities (e.g. protection of life and health) – Core business processes (e.g. processes that ensure the organization’s survival) – Adequate information security",
      "A crisis unit is defined and approved. The following aspects will be taken into account: – Management commitment – Composition (e.g. involvement of all key functional areas of the organization including governance of the organization (management), business operations (production), human resources, information security, business security, emergency operations, IT/cybersecurity, communications, finance) – Structure and roles – Competencies of the participants – Expectation and powers – Decision-making procedures",
      "Crisis measures and procedures are defined and approved. The following aspects will be taken into account: – Exemption powers and decision-making processes beyond the crisis unit – Primary and backup communication – Emergency operating procedures – Exceptional organizational structures (e.g. reporting, gathering information, decision-making) – Exceptional functional areas, responsibilities and powers (including reporting) – Exceptional tools",
      "Crisis planning is regularly reviewed and updated.",
    ],
    "Additional requirements for high protection needs": [
      "Relevant different possible crisis scenarios have been identified. The following aspects will be taken into account: (A) – Crisis situations with unavailability of key personnel (e.g. health crisis, kidnapping/management accidents): – Crisis situations with unavailability of critical physical resources (e.g. fire or natural disasters at specific sites) — Crisis situations with critical infrastructure failure (e.g., major communication channel failure, complete IT infrastructure failure)",
      "Necessary resources and information to address the crisis (e.g. communication infrastructure, availability of necessary information such as contact information and relevant risks in different crisis situations) have been identified. (A) - Appropriate measures are in place to ensure infrastructure availability or contingency planning, as well as information that takes into account different crisis scenarios",
      "A communication strategy for crisis situations is in place. The following aspects will be taken into account: (A) – Who to communicate with (e.g. shareholders, affected business partners and customers, other shareholders, general public) – When to communicate – Responsibilities for communication – Authorization and release of communication – Legal and regulatory restrictions on communication (e.g. stock corporation regulations) – What to communicate (e.g. prepared templates for explanations, contact information and building blocks for specific scenarios) – Communication channels (e.g. media channels, social media) – Tools for monitoring communication – Instructions and procedures for employees (in the case of direct communication approaches such as direct contact of employees by business partners)",
      "The efficiency, feasibility and adequacy of crisis planning will be regularly evaluated. (A)",
      "Random crisis planning checks are carried out (e.g. simulation, planning exercises involving key personnel) (A)",
    ],
    "Additional requirements for very high protection needs": [
      "Crisis exercises and simulations involving all relevant persons and decision-makers will be carried out regularly. (A)",
    ],
  },
  {
    "Root ISA New": "2",
    "Root Control question": "Human Resources",
    "Parent ISA New": "2.1",
    "Parent Control question": "Human Resources",
    "ISA New": "2.1.1",
    "Control question":
      "To what extent are employees trained and made aware of the risks involved in handling information?",
    Objective:
      "If employees are not aware of the requirements and risks of information security, there is a risk that employees will behave incorrectly and the organization will be harmed. Therefore, it is important that information security is internalized and lived as a natural part of their work.",
    "Must Requirements": ["Employees are trained and sensitized."],
    "Should Requirements": [
      "A concept for awareness raising and training of employees has been developed. At least the following aspects shall be taken into account: – Information Security Directive, – Information security event notifications, – Behavior in the event of malware, – User account and login policies (e.g. password policy), — Compliance issues for information security, - Requirements and procedures for the use of non disclosure agreements in the sharing of sensitive information, – Use of non organizational IT services.",
      "Target groups for training and awareness activities (i.e. people working in specific high risk environments such as administrators, employees with access to customer networks, personnel in manufacturing areas) are identified and included in a training concept.",
      "The concept was approved by the responsible management.",
      "Training and awareness-raising activities are carried out both periodically and in response to events.",
      "Participation in training and awareness-raising activities shall be documented.",
      "Employees are familiar with information security contacts.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "2",
    "Root Control question": "Human Resources",
    "Parent ISA New": "2.1",
    "Parent Control question": "Human Resources",
    "ISA New": "2.1.2",
    "Control question": "To what extent is mobile working regulated?",
    Objective:
      "When working outside the specially defined safety zones (mobile working), risks arise that require appropriate protective measures.",
    "Must Requirements": [
      "The requirements for mobile working have been determined and fulfilled. The following aspects will be taken into account: - Secure handling and access to information (both electronic and paper), taking into account the need for protection and contractual requirements in private (e.g. home office) and public areas (e.g. traveling) - Behavior in private areas - Behavior in public areas - Measures to prevent theft (e.g. in public areas)",
      "Access to the organization's network is through a secure connection (e.g. VPN) and strong authentication.",
    ],
    "Should Requirements": [
      "The following aspects are taken into account: – Measures during travel (e.g. inspection by authorities), – Measures to be taken when traveling to safety-critical countries.",
      "Employee awareness.",
    ],
    "Additional requirements for high protection needs": [
      "Measures to protect against overhearing and inspection have been implemented. ©",
    ],
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "3",
    "Root Control question": "Physical Security",
    "Parent ISA New": "3.1",
    "Parent Control question": "Physical Security",
    "ISA New": "3.1.1",
    "Control question":
      "To what extent are security zones managed to protect information assets?",
    Objective:
      "Security zones are used to physically protect information assets. The more sensitive the information values to be processed, the more protective measures are required.",
    "Must Requirements": [
      "A safety zone concept including the associated protective measures based on the requirements for handling information values is in place: – Physical conditions (e.g. site/building/premises) are taken into account in the definition of safety zones, – This also includes delivery and shipping areas.",
      "The defined protection measures have been implemented.",
      "The rules of conduct for security zones are known to all persons involved.",
    ],
    "Should Requirements": [
      "Procedures for granting and withdrawing access authorizations are in place.",
      "Guidelines for visitor management (including visitor registration and monitoring) are defined.",
      "Guidelines for the introduction and use of mobile IT devices and mobile data carriers (e.g. registration before taking away, labeling obligations) have been defined and implemented.",
      "Network/infrastructure components (own or customer networks) are protected against unauthorized access.",
      "External properties for the storage and processing of information values are taken into account within the framework of the security zone concept (e.g. storage rooms, garages, workshops, test tracks, data processing centers).",
    ],
    "Additional requirements for high protection needs": [
      "Measures to protect against simple listening and inspection have been implemented. ©",
    ],
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "3",
    "Root Control question": "Physical Security",
    "Parent ISA New": "3.1",
    "Parent Control question": "Physical Security",
    "ISA New": "3.1.2",
    "Control question":
      "To what extent is the handling of information carriers managed?",
    Objective:
      "Information carriers are subject to risks such as loss, theft or unauthorized access during their life cycle (e.g. use, disposal).",
    "Must Requirements": [
      "The requirements for handling information carriers (e.g. transport, storage, repair, loss, return, disposal) have been identified and fulfilled.",
    ],
    "Should Requirements": null,
    "Additional requirements for high protection needs": [
      "' information carriers are protected. Disposal of information carriers shall be carried out in accordance with one of the relevant standards (e.g. ISO 21964, at least security level 4). ©",
    ],
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "3",
    "Root Control question": "Physical Security",
    "Parent ISA New": "3.1",
    "Parent Control question": "Physical Security",
    "ISA New": "3.1.3",
    "Control question":
      "To what extent is the use of mobile IT devices and mobile data media managed?",
    Objective:
      "Mobile IT devices (e.g. notebooks, tablets, smartphones) and mobile data carriers (e.g. SD cards, hard drives) are usually not only used in the premises of an organization, but also used on the move. This results in an increased risk of, for example, loss or theft.",
    "Must Requirements": [
      "The requirements for mobile IT equipment and mobile data carriers have been identified and fulfilled. The following aspects will be taken into account: - Encryption - Access protection (e.g. PIN, password) - Labeling (also considering requirements for use in the presence of customers).",
    ],
    "Should Requirements": [
      "Registration of IT equipment.",
      "Users are aware of missing data protection on mobile devices.",
    ],
    "Additional requirements for high protection needs": [
      "General Encryption of Mobile Disks or Information Values Stored on Mobile Disks: (C, I) – If this is not technically feasible, information will be protected by similarly effective measures.",
    ],
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "4",
    "Root Control question": "Identity and Access Management",
    "Parent ISA New": "4.1",
    "Parent Control question": "Identity Management",
    "ISA New": "4.1.1",
    "Control question":
      "To what extent is the use of means of identification managed?",
    Objective:
      "In order to verify the authorization for both physical and electronic access, identification means such as keys, visual identity cards, other physical access devices and also cryptographic tokens are often used. The protection features are only reliable if the use of such means of identification is handled adequately.",
    "Must Requirements": [
      "The requirements for the handling of means of identification over the entire life cycle have been identified and fulfilled. The following aspects will be taken into account: - Creation, handover, return and destruction - Validity periods - Traceability - Dealing with loss.",
    ],
    "Should Requirements": [
      "Identification means can only be produced under controlled conditions.",
    ],
    "Additional requirements for high protection needs": [
      "The validity of means of identification shall be limited to a reasonable period of time. (C, I, A)",
      "A concept for blocking or invalidating means of identification in the event of loss is, as far as possible, developed and implemented. (C, I, A)",
    ],
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "4",
    "Root Control question": "Identity and Access Management",
    "Parent ISA New": "4.1",
    "Parent Control question": "Identity Management",
    "ISA New": "4.1.2",
    "Control question":
      "To what extent will users' access to IT services and systems be secured?",
    Objective:
      "Only securely identified (authenticated) users are to be granted access to IT systems. For this purpose, the identity of a user is determined securely by suitable methods.",
    "Must Requirements": [
      "The validity of means of identification shall be limited to a reasonable period of time. (C, I, A)",
      "A concept for blocking or invalidating means of identification in the event of loss is, as far as possible, developed and implemented. (C, I, A'",
      "The selection of user authentication procedures was made on the basis of a risk assessment. Possible attack scenarios have been considered (e.g. direct access via the Internet).",
      "State-of-the-art procedures are applied for user authentication.",
    ],
    "Should Requirements": [
      "User authentication procedures are defined and implemented based on business and security requirements: – Users are authenticated at least using strong passwords according to the current state of the art.",
      "Advanced authentication methods for privileged user accounts are applied (e.g. privileged access management, 2-factor authentication).",
    ],
    "Additional requirements for high protection needs": [
      "Depending on the risk assessment, the authentication process and access control have been strengthened by complementary measures (e.g. persistent access monitoring for irregularities or use of strong authentication, automatic logout, blocking on inactivity or protection against brute force attacks). (C, I, A)",
    ],
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "4",
    "Root Control question": "Identity and Access Management",
    "Parent ISA New": "4.1",
    "Parent Control question": "Identity Management",
    "ISA New": "4.1.3",
    "Control question":
      "To what extent are user accounts and credentials securely managed and applied?",
    Objective:
      "Access to information and IT systems takes place via validated user accounts, which are assigned to a person. It is important to protect credentials and ensure traceability of transactions and access.",
    "Must Requirements": [
      "User account creation, modification, and deletion is in progress.",
      "Unique and personalized user accounts are used.",
      'The use of "summary accounts" is regulated (e.g. limited to cases where traceability of actions is not necessary).',
      "User accounts are locked immediately after the user leaves or leaves the organization (e.g. when the employment relationship ends).",
      "User accounts are checked periodically.",
      "Secure delivery of credentials to the user.",
      "A credential policy has been defined and implemented. The following aspects will be taken into account: – no disclosure of credentials to third parties – even to persons of authority – in compliance with legal framework conditions – no writing of credentials or unencrypted storage – immediate change of login information in case of suspected compromise - no use of identical credentials for business and non business use – Change of temporary or initial credentials after 1 login – Credential quality requirements (e.g. password length, character types to be used).",
      "The credentials (e.g. passwords) of a personalized user account must be known only to the associated user.",
    ],
    "Should Requirements": [
      "' A basic user profile with minimal access rights and functionalities exists and will be applied.",
      "Default accounts and passwords specified by the manufacturer are disabled (e.g. by blocking or changing the password).",
      "User accounts are set up by or authorized by the responsible authority.",
      "The creation of user accounts is subject to an approval process (4-eyes principle).",
      "User accounts of service providers will be blocked after completion of their task.",
      "Hold and delete periods for user accounts are defined.",
      "The use of standard passwords is technically prevented.",
      "If strong authentication is used, the medium (e.g. Factor Ownership) is used securely.",
      "User accounts are checked periodically. This includes user accounts in customer IT systems.",
      "The interactive login to service accounts (technical accounts) is technically prevented.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "4",
    "Root Control question": "Identity and Access Management",
    "Parent ISA New": "4.2",
    "Parent Control question": "Access Management",
    "ISA New": "4.2.1",
    "Control question": "To what extent are access rights granted and managed?",
    Objective:
      "Access rights management ensures that only authorized users have access to information and IT services. To this end, access rights are assigned to the user accounts.",
    "Must Requirements": [
      'The requirements for managing access rights (authorization) have been identified and fulfilled. The following aspects will be taken into account: – Application, verification and authorization procedures, – The application of the "need to know"/"least privilege" principle. – Access rights are revoked when they are no longer needed',
      "The granted access rights for normal and privileged user accounts as well as technical accounts are regularly checked in IT systems of customers.",
    ],
    "Should Requirements": [
      "' Authorization concepts for access to information have been created.",
      "Permission roles are used.",
      "The allocation of rights is needs-based and according to the role and/or the area of responsibility.",
      "Normal user accounts are not granted privileged access rights.",
      "The access rights of a user account of a user are adjusted after the user has changed (e.g. to another area of responsibility).",
    ],
    "Additional requirements for high protection needs": [
      "The access rights are released by the internal information manager. (C, I, A)",
    ],
    "Additional requirements for very high protection needs": [
      "Prevent unauthorized access and knowledge (privileged users): (C) — Information is stored encrypted at the content level (for example, file level). - When encryption is impractical, information must be protected by similarly effective measures.",
      "Existing access rights are regularly reviewed at shorter intervals (e.g. quarterly) (C)",
    ],
  },
  {
    "Root ISA New": "5",
    "Root Control question": "IT security/cybersecurity",
    "Parent ISA New": "5.1",
    "Parent Control question": "Cryptography",
    "ISA New": "5.1.1",
    "Control question":
      "To what extent is the use of cryptographic techniques managed?",
    Objective:
      "When using cryptographic techniques, it is important to take into account risks in the area of availability (lost key material) as well as risks arising from incorrectly applied integrity and confidentiality techniques (poor algorithms/protocols or insufficient key strengths).",
    "Must Requirements": [
      "All cryptographic methods used (e.g. encryption, signature and hash algorithms, protocols) provide the security required for the respective field of application in accordance with the recognized industry standard – as far as legally possible.",
    ],
    "Should Requirements": [
      "Creation of a technical set of encryption requirements to protect information according to its classification.",
      "A usage concept for cryptography has been defined and implemented. The following aspects will be taken into account: - Cryptographic techniques - Key strengths - Procedures for the full life cycle of cryptographic keys including generation, storage, archiving, retrieval, distribution, deactivation, renewal and deletion.",
      "A disaster recovery process for key materials is in place.",
    ],
    "Additional requirements for high protection needs": [
      "requirements for key sovereignty (in particular for processing outside the organization) have been identified and fulfilled. (C, I)",
    ],
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "5",
    "Root Control question": "IT security/cybersecurity",
    "Parent ISA New": "5.1",
    "Parent Control question": "Cryptography",
    "ISA New": "5.1.2",
    "Control question":
      "To what extent is information protected during transmission?",
    Objective:
      "If information is transmitted via public or private networks, it may be read or modified by unauthorized third parties. It is therefore necessary to identify requirements for the protection needs of the information and to implement them by taking appropriate measures during such transmission.",
    "Must Requirements": [
      "The network services used to transmit information are identified and documented.",
      "Policies and procedures are defined and implemented according to the classification requirements for the use of network services.",
      "Measures to protect transmitted content from unauthorized access have been implemented.",
    ],
    "Should Requirements": [
      "Measures to ensure the correct addresses and the correct transport of information have been implemented.",
      "The electronic data exchange takes place according to the respective classification by content or transport encryption.",
      "Remote access connections are verified to have appropriate security features (e.g. encryption, granting and terminating access) and capabilities.",
    ],
    "Additional requirements for high protection needs": [
      "information is transported or transmitted in encrypted form: (C) - If encryption is not possible, information must be protected by similarly effective measures.",
    ],
    "Additional requirements for very high protection needs": [
      "' information is transported or transmitted encrypted for content. ©",
    ],
  },
  {
    "Root ISA New": "5",
    "Root Control question": "IT security/cybersecurity",
    "Parent ISA New": "5.2",
    "Parent Control question": "Operations Security",
    "ISA New": "5.2.1",
    "Control question": "To what extent are changes managed?",
    Objective:
      "The aim is to ensure that any changes in the organization, business processes and IT systems (change management) take into account information security aspects, so that these changes do not lead to an unregulated reduction in the level of information security.",
    "Must Requirements": [
      "Information security requirements for changes in organization, business processes, IT systems are identified and implemented.",
    ],
    "Should Requirements": [
      "A formal approval procedure is in place.",
      "Changes will be verified and evaluated for potential impact on information security.",
      "Changes affecting information security are planned and reviewed.",
      "Emergency procedures in case of errors are taken into account.",
    ],
    "Additional requirements for high protection needs": [
      "Compliance with information security requirements will be verified during and after the implementation of the changes. (C, I, A)",
    ],
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "5",
    "Root Control question": "IT security/cybersecurity",
    "Parent ISA New": "5.2",
    "Parent Control question": "Operations Security",
    "ISA New": "5.2.2",
    "Control question":
      "To what extent are development and testing environments separated from production environments?",
    Objective:
      "The goal of separating development, test, and production environments is to ensure that the availability, confidentiality, and integrity of production data are maintained.",
    "Must Requirements": [
      "The IT systems have undergone a risk assessment to determine the extent to which they need to be separated into development, test and production systems.",
      "Segmentation is implemented on the basis of the results of the risk analysis.",
    ],
    "Should Requirements": [
      "The requirements for development and test environments have been determined and implemented. The following aspects will be taken into account: - Separation of development, test and production systems - No development and system tools on production systems (except those necessary for operation) - Use of different user profiles for development, test and production systems.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "5",
    "Root Control question": "IT security/cybersecurity",
    "Parent ISA New": "5.2",
    "Parent Control question": "Operations Security",
    "ISA New": "5.2.3",
    "Control question": "To what extent are IT systems protected from malware?",
    Objective:
      "The aim is to ensure the protection of IT systems against malicious software both technically and organizationally.",
    "Must Requirements": [
      "Malware protection requirements have been identified.",
      "Technical and organizational measures for protection against malware have been defined and implemented.",
    ],
    "Should Requirements": [
      "' Unneeded network services are disabled.",
      "Access to network services is restricted to the required access with appropriate protection measures (see examples).",
      "Malware protection software is installed and is automatically updated at regular intervals (e.g. virus scanner).",
      "Received files and software are automatically scanned for malware before they are executed (on-access scan).",
      "The entire database of all systems is regularly checked for malware.",
      "Data transmitted by central gateways (e.g. e-mail, internet, third party networks) are automatically checked by means of a protection software: – Encrypted connections are considered.",
      "Measures to prevent users from deactivating or modifying protection software are defined and implemented.",
      "Case-related awareness-raising activities by staff.",
      "Alternative measures (e.g. special resilience measures, few services, no active users, network isolation) have been implemented for IT systems operating without software to protect against malware.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "5",
    "Root Control question": "IT security/cybersecurity",
    "Parent ISA New": "5.2",
    "Parent Control question": "Operations Security",
    "ISA New": "5.2.4",
    "Control question": "To what extent are event logs recorded and analyzed?",
    Objective:
      "Event logs support event traceability in the event of a security incident. This requires that events that are necessary to determine the causes are recorded and stored. In addition, logging and analysis of activities in accordance with applicable legislation (e.g. Data Protection Act or Business Constitution Act) is required to determine which user account has made changes to IT systems.",
    "Must Requirements": [
      "' Information security requirements for handling event logs are identified and met.",
      "Security-related requirements for logging the activities of system administrators and users have been identified and met.",
      "The IT systems used are assessed for the need for logging.",
      "When using non organizational IT services, information on monitoring options is collected and taken into account in the assessment.",
      "Event logs are regularly reviewed for breaches and anomalies in accordance with legal and operational requirements.",
    ],
    "Should Requirements": [
      "A procedure for escalating relevant events to the competent body (e.g. security incident notification, data protection, company security, IT security) is defined and established.",
      "Event logs (content and metadata) are protected against changes. (e.g. through a dedicated environment).",
      "Appropriate monitoring and recording of all information security-relevant actions in the network are established.",
    ],
    "Additional requirements for high protection needs": [
      "' Information security requirements relevant to security during handling of event logs, such as contractual requirements, have been identified and implemented. (C, I, A)",
      "Access during setup and disconnection of non organizational network connections (e.g. remote maintenance) is logged. (C, I, A)",
    ],
    "Additional requirements for very high protection needs": [
      "Logging of all accesses to data with a very high protection requirement, as far as technically possible and within the framework of legal and operational regulations. (C, I)",
    ],
  },
  {
    "Root ISA New": "5",
    "Root Control question": "IT security/cybersecurity",
    "Parent ISA New": "5.2",
    "Parent Control question": "Operations Security",
    "ISA New": "5.2.5",
    "Control question":
      "To what extent are vulnerabilities detected and addressed?  ",
    Objective:
      "Vulnerabilities increase the risk that IT systems will fail to meet confidentiality, availability and integrity requirements. One of the ways in which attackers can gain access to the IT system or jeopardize its operational stability is by exploiting vulnerabilities.",
    "Must Requirements": [
      "Technical vulnerability information on the IT systems used is collected (e.g. information from the manufacturer, system audits, CVS database) and assessed (e.g. Common Vulnerability Scoring System, CVSS)",
      "Potentially affected IT systems and software are identified, assessed and vulnerabilities addressed.",
    ],
    "Should Requirements": [
      "Appropriate patch management has been defined and implemented (e.g., checking and installing patches).",
      "Measures to minimize risks are implemented where necessary.",
      "Successful installation of patches is appropriately verified.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "5",
    "Root Control question": "IT security/cybersecurity",
    "Parent ISA New": "5.2",
    "Parent Control question": "Operations Security",
    "ISA New": "5.2.6",
    "Control question":
      "To what extent are IT systems and services technically audited (system and service audit)?",
    Objective:
      "The objective of technical reviews is to identify conditions that may jeopardize the availability, confidentiality or integrity of IT systems and services.",
    "Must Requirements": [
      "requirements for auditing IT systems or services have been identified.",
      "The scope of the system audit is defined in good time.",
      "System or service audits are coordinated with the operator and users of the IT systems or services.",
      "The results of system or service audits are stored in a traceable manner and reported to the responsible management.",
      "Measures are derived from the results.",
    ],
    "Should Requirements": [
      "' System and service audits are planned taking into account all the security risks that could be caused by them (e.g. faults).",
      "Regular system or service audits are performed – carried out by specialist personnel – appropriate tools (e.g. vulnerability scanners) are used for system and service audits (where applicable) – from the Internet and the internal network",
      "A report shall be prepared within a reasonable period of time after the audit has been completed.",
    ],
    "Additional requirements for high protection needs": [
      "For critical IT systems or services, additional system or service audit requirements have been identified that are met (e.g. service-specific tests and tools and/or penetration tests, risk-based time intervals) (A)",
    ],
    "Additional requirements for very high protection needs": [
      "IT systems and services are regularly scanned for vulnerabilities. (A) - Appropriate protection measures must be implemented for systems and services that cannot be scanned.",
    ],
  },
  {
    "Root ISA New": "5",
    "Root Control question": "IT security/cybersecurity",
    "Parent ISA New": "5.2",
    "Parent Control question": "Operations Security",
    "ISA New": "5.2.7",
    "Control question": "To what extent is the organization's network managed?",
    Objective:
      "IT systems in a network are exposed to different risks or have different protection needs. In order to detect or prevent unwanted data exchange or access between these IT systems, they are divided into suitable segments and access is controlled and monitored by security technologies.",
    "Must Requirements": [
      "Network management and control requirements are identified and met.",
      "Requirements for segmentation of the network have been identified and fulfilled.",
    ],
    "Should Requirements": [
      "procedures for managing and controlling the networks are defined.",
      "For risk-based segmentation of the network, the following aspects are taken into account: - Limitations on the connectivity of IT systems to the network, – Application of security technologies, — Considerations for performance, trust, availability, information security, and functional security – Limiting the impact of compromised IT systems – Detection of possible attacks and the lateral movement of attackers – Separation of networks with different operational purposes (e.g. test and development networks, office networks, production networks) - The increased risk posed by network services accessible via the Internet, – Technology-specific separation when using external IT services, – Adequate separation between own and customer networks, taking into account customer requirements – Detect and prevent data loss/leakage",
    ],
    "Additional requirements for high protection needs": [
      "Advanced network management and control requirements have been identified and implemented. The following aspects are taken into account: (C, I, A) - Authentication of IT systems in the network - Access to the management interfaces of IT systems is restricted. – Specific risks (e.g. wireless access and remote access)",
    ],
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "5",
    "Root Control question": "IT security/cybersecurity",
    "Parent ISA New": "5.2",
    "Parent Control question": "Operations Security",
    "ISA New": "5.2.8",
    "Control question":
      "To what extent is continuity planning available for IT services?",
    Objective:
      "Continuity (including contingency) planning for IT services is part of an overall program to achieve continuity of operations for the organization's mission and mission critical functions. Measures covered by continuity plans include regulated system degradation, system shutdown, use of manual mode, alternative information streams and operation in modes reserved for the occurrence of a safety incident.",
    "Must Requirements": [
      "Identifies critical IT services and considers business impact.",
      "Requirements and responsibilities for the continuity and recovery of these IT services are known and fulfilled by the relevant stakeholders.",
    ],
    "Should Requirements": [
      "Identifying critical IT systems – the relevant systems are classified according to their protection needs – appropriate and appropriate security measures are implemented",
      "Continuity planning shall include at least the following scenarios concerning critical IT systems: – (Distributed) Denial of Service attacks – Successful ransomware attacks and other sabotage activities – System failure – Natural disaster",
      "Continuity planning takes into account the following cases: – Alternative communication strategies if primary means of communication are not available – Alternative storage strategies if primary means of storage are not available – Alternative power supply and network",
      "Continuity planning is regularly reviewed and updated",
    ],
    "Additional requirements for high protection needs": [
      "Continuity Planning includes predefined timeframes (recovery time objective) for resuming operations in accordance with requirements. (A)",
      "Appropriate SLAs (service level agreements) exist with external service providers in accordance with the continuity planning. (A)",
      "Continuity plans include coordination of contractually agreed communication with counterparties (A)",
      "Continuity planning is regularly reviewed, including full restoration and restoration of the system to a known state and compliance with specified timelines. (A)",
      "A backup and recovery strategy for critical IT services and information is defined and implemented. The following aspects will be taken into account: – Backups are protected against unauthorized modification or deletion by malware. (I, A) - Backups are protected against unauthorized access by malware or its operators (C, I)",
    ],
    "Additional requirements for very high protection needs": [
      "The continuity planning is coordinated with the continuity plans of the relevant non organizational service providers. (A)",
      "Maintaining the core mission and core business functions is possible with minimal or no loss of business continuity. The plan for the continuation of the core mission and essential business functions shall take into account the following aspects: – Alternative operational strategies and necessary separate standby systems to maintain and/or resume operations to the extent possible in the event of critical IT services becoming unavailable. (A) - Alternative storage and backup locations that provide equivalent controls to the primary location. (C, I, A)",
      "Continuity planning is regularly reviewed. Tests and all findings are documented. (I, A)",
    ],
  },
  {
    "Root ISA New": "5",
    "Root Control question": "IT security/cybersecurity",
    "Parent ISA New": "5.2",
    "Parent Control question": "Operations Security",
    "ISA New": "5.2.9",
    "Control question":
      "How is backup and recovery of data and IT services ensured?",
    Objective:
      "Data and IT services may become unavailable due to events such as hardware failures, software errors, operator errors or attacks. Backup and recovery enables organizations to recover from these situations and minimize the potential damage to the organization.",
    "Must Requirements": [
      "Backup concepts exist for the relevant IT systems. The following aspects will be taken into account: — Provide protection to ensure confidentiality, integrity, and availability for data backups.",
      "Recovery concepts exist for the relevant IT services.",
    ],
    "Should Requirements": [
      "A backup and restore concept exists for each relevant IT service. — Consider dependencies between IT services and the order in which they are restored.",
    ],
    "Additional requirements for high protection needs": [
      "Backup and restore concepts are reviewed methodically at regular intervals. (A)",
      "General recovery capacity is considered and tested (e.g. sampling, testing systems) (I, A)",
      "Backup and restore concepts take into account the following aspects: (A) - Recovery Point Objective (RPO). — Recovery Time Objective (RTO). — Required resources for recovery (considering capacity and performance, including personnel and hardware). — Avoid overloading scenarios during recovery. – Adequate spatial redundancy (e.g. separate room, separate fire compartment, separate data center, separate site).",
    ],
    "Additional requirements for very high protection needs": [
      "(Additional) backups are performed using offline procedures, immutable backups, or by applying an isolated IAM technology. (I, A)",
      "Recovery procedures are systematically and technically reviewed at regular intervals. (I, A)",
      "Geographical redundancy is considered in data backup and restore concepts. (A)",
    ],
  },
  {
    "Root ISA New": "5",
    "Root Control question": null,
    "Parent ISA New": "5.3",
    "Parent Control question": "IT security/cybersecurity",
    "ISA New": "5.3.1",
    "Control question":
      "To what extent is information security taken into account in new or more advanced IT systems?",
    Objective:
      "Information security is an integral part of the entire lifecycle of IT systems. This includes, in particular, the consideration of information security requirements when developing or purchasing IT systems.",
    "Must Requirements": [
      "Information security requirements in the planning and development of IT systems have been identified and taken into account.",
      "Information security requirements for the procurement or expansion of IT systems and IT components have been identified and taken into account.",
      "Information security requirements for changes in developed IT systems are taken into account.",
      "System acceptance testing is performed taking into account information security requirements.",
    ],
    "Should Requirements": [
      "' specifications have been created. The following aspects will be taken into account: — Information security requirements. — Seller recommendations and best practices for secure configuration and implementation – Best practices and safety guidelines – Failsafe (designed to return to a safe state in the event of failure or malfunction)",
      "Specifications are tested against information security requirements.",
      "A check of the IT system for compliance is carried out before productive use.",
      "To the extent possible, avoid using productive data for testing purposes (anonymization or pseudonymization if applicable): – When productive data is used for testing purposes, it must be ensured that the testing system has similar protective measures to those in the productive system, – Requirements for the life cycle of test data (e.g. erasure, longest life in the IT system), – Case-specific requirements for the creation of test data are defined.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "5",
    "Root Control question": "IT security/cybersecurity",
    "Parent ISA New": "5.3",
    "Parent Control question":
      "System acquisition, requirements management and development",
    "ISA New": "5.3.2",
    "Control question":
      "To what extent are requirements for network services defined?",
    Objective:
      "Network services have different requirements for information security, quality of data transmission or management. It is important to know these criteria and the extent of use of the different network services.",
    "Must Requirements": [
      "' Information security requirements for network services have been identified and met.",
    ],
    "Should Requirements": [
      "A procedure for securing and using network services has been defined and implemented.",
      "Requirements are agreed in the form of SLAs.",
      "Appropriate redundancy solutions have been implemented.",
    ],
    "Additional requirements for high protection needs": [
      "Methods for monitoring the quality of network traffic (e.g. traffic flow analyzes, availability measurements) are defined and implemented. (A)",
    ],
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "5",
    "Root Control question": "IT security/cybersecurity",
    "Parent ISA New": "5.3",
    "Parent Control question":
      "System acquisition, requirements management and development",
    "ISA New": "5.3.3",
    "Control question":
      "What are the rules governing the return and safe removal of information assets from IT services outside the organization?",
    Objective:
      "In order to ensure the sovereignty of the information values as owner of the information, it is necessary that, in the event of termination of the IT service, the information values can be safely removed again or returned on demand.",
    "Must Requirements": [
      "A procedure for the return and secure removal of information values from any IT service outside the organization has been defined and implemented.",
    ],
    "Should Requirements": [
      "A description of the scheduling process is available, will be adapted in the event of changes and is contractually stipulated.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "5",
    "Root Control question": "IT security/cybersecurity",
    "Parent ISA New": "5.3",
    "Parent Control question":
      "System acquisition, requirements management and development",
    "ISA New": "5.3.4",
    "Control question":
      "To what extent is information protected in shared non organizational IT services?",
    Objective:
      "A clear separation between the individual clients must be ensured, so that the own information in IT services outside the organization is protected at all times and that it is prevented from being accessed by other organizations (clients).",
    "Must Requirements": [
      "Effective separation (e.g. client separation) prevents unauthorized users of other organizations from accessing their own information.",
    ],
    "Should Requirements": [
      "The vendor's demarcation concept is documented and will be adjusted in the event of changes. The following aspects will be taken into account: — Separate data, features, custom software, operating system, storage system, and network — Risk assessment for operating third-party software within the shared environment.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "6",
    "Root Control question": "Supplier relations",
    "Parent ISA New": "6.1",
    "Parent Control question": "Supplier relations",
    "ISA New": "6.1.1",
    "Control question":
      "To what extent is information security ensured for contractors and cooperation partners?",
    Objective:
      "An appropriate level of information security shall also be maintained in cooperation with cooperation partners and contractors.",
    "Must Requirements": [
      "Contractors and cooperation partners will be subject to an information security risk assessment.",
      "Contracts with contractors and cooperation partners ensure an adequate level of information security.",
      "Contractual agreements with clients are passed on to contractors and cooperation partners, if applicable.",
      "Compliance with contractual agreements is verified.",
    ],
    "Should Requirements": [
      "Contractors and cooperation partners are contractually obliged to pass on all requirements for an adequate level of information security to their subcontractors.",
      "Service reports and documents from contractors and cooperation partners are reviewed.",
    ],
    "Additional requirements for high protection needs": [
      "There is evidence that the supplier's level of information security is appropriate to the protection needs of the information (e.g. certificate, certificate, internal audit). (C, I, A)",
    ],
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "6",
    "Root Control question": "Supplier relations",
    "Parent ISA New": "6.1",
    "Parent Control question": "Supplier relations",
    "ISA New": "6.1.2",
    "Control question":
      "To what extent is confidentiality in the exchange of information contractually agreed?",
    Objective:
      "Non-disclosure agreements are designed to provide legal protection for information held by an organization, in particular when it is exchanged across organizational boundaries.",
    "Must Requirements": [
      "The confidentiality requirements have been identified and fulfilled.",
      "Requirements and procedures for the use of non disclosure agreements are known to all persons sharing sensitive information.",
      "Valid confidentiality agreements shall be concluded prior to the disclosure of sensitive information.",
      "The requirements and procedures for the application of non disclosure agreements and the handling of sensitive information will be reviewed at regular intervals.",
    ],
    "Should Requirements": [
      "' Templates for non disclosure agreements exist and are checked for legal applicability.",
      "Non-disclosure agreements shall contain the following information: – persons/organizations involved, – the type of information covered by the agreement, – the subject matter of the agreement, – the period of validity of the agreement, – the responsibilities of the obliged entity(s).",
      "Confidentiality agreements contain provisions on the handling of sensitive information beyond the contractual relationship.",
      "Possible evidence of compliance (e.g. third-party verification or audit rights) is defined.",
      "A process to monitor the validity of temporary confidentiality agreements and to trigger a timely renewal of confidentiality agreements is defined and implemented.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
  {
    "Root ISA New": "7",
    "Root Control question": "Compliance",
    "Parent ISA New": "7.1",
    "Parent Control question": "Compliance",
    "ISA New": "7.1.1",
    "Control question":
      "To what extent is compliance with regulatory and contractual provisions ensured?",
    Objective:
      "Failure to comply with legal, regulatory, or contractual requirements may result in risks to the information security of customers and their own organization. It is therefore crucial to ensure that these provisions are known and respected.",
    "Must Requirements": [
      "Legal, regulatory and contractual provisions relevant to information security (see examples) are determined at regular intervals.",
      "Compliance policies are defined, implemented, and communicated to those responsible.",
    ],
    "Should Requirements": [
      "The integrity of records in accordance with legal, regulatory, or contractual provisions and business requirements is taken into account.",
    ],
    "Additional requirements for high protection needs": null,
    "Additional requirements for very high protection needs": null,
  },
];

export default data;
