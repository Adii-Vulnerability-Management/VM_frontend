// import React, { useState } from "react";
// import { Col, Row, Card, Nav, Tab, Container } from "react-bootstrap";
// import AuditTisaxMaturity from "./audit-tisaxcomponent/AuditTisaxMaturity";
// import AuditTisaxCover from "./audit-tisaxcomponent/AuditTisaxCover";
// import AuditTisaxInformationSecurity from "./audit-tisaxcomponent/AuditTisaxInformationSecurity";
// import AuditTisaxDefinition from "./audit-tisaxcomponent/AuditTisaxDefinition";
// import AuditTisaxProtoTypeProtection from "./audit-tisaxcomponent/AuditTisaxProtoTypeProtection";
// import AuditTisaxDataProtection from "./audit-tisaxcomponent/AuditTisaxDataProtection";
// import { useRouter } from "next/router";

// const tabItems = [
//   "Cover",
//   "Maturity",
//   "Definitions",
//   "Information Security",
//   "Prototype Protection",
//   "Data Protection",
// ];

// function AuditTisaxTabs() {
//   const [maturityType, setMaturityType] = useState("");
//   const [activeKey, setActiveKey] = useState("Cover");
//   const router = useRouter();
//   const { vda_type, assessment_level } = router.query;
//   const [hidePrototypeProtection, setHidePrototypeProtection] = useState(
//     assessment_level === "AL2"
//   );
//   const handleNavSelect = (key) => {
//     setActiveKey(key);
//   };
//   const handleMaturityTypeChange = (event) => {
//     setMaturityType(event.target.value);
//   };

//   return (
//     <div>
//       <Container fluid className="p-6">
//         <Row>
//           <Col xl={12} lg={12} md={12} sm={12}>
//             <Tab.Container defaultActiveKey="Cover">
//               <Card>
//                 <Card.Header className="border-bottom-0 p-0">
//                   <Nav className="nav-lb-tab"
//                     activeKey={activeKey}
//                   onSelect={handleNavSelect}
//                   >
//                     {tabItems.map((key) =>
//                       key === "Prototype Protection" &&
//                       assessment_level === "AL2" ? null : (
//                         <Nav.Item key={key}>
//                           <Nav.Link eventKey={key} className="mb-sm-3 mb-md-0">
//                             {key}
//                           </Nav.Link>
//                         </Nav.Item>
//                       )
//                     )}
//                   </Nav>
//                 </Card.Header>
//                 <Card.Body className="p-0">

//                 <Tab.Content>
//                     <AuditTisaxCover eventKey="Cover" />
//                     <AuditTisaxMaturity
//                       eventKey="Maturity"
//                       handleMaturityTypeChange={handleMaturityTypeChange}
//                       setMaturityType={setMaturityType}
//                     />
//                     <AuditTisaxDefinition eventKey="Definitions" />
//                     {/* <Link href="/tisax-audit/AuditTisaxInformationSecurity"> */}
//                     <AuditTisaxInformationSecurity eventKey="Information Security" />
//                     {/* </Link> */}
//                     <AuditTisaxDataProtection eventKey="Data Protection" />
//                     {!hidePrototypeProtection  && (
//                     <AuditTisaxProtoTypeProtection eventKey="Prototype Protection" />
//                     )}
//                   </Tab.Content>


//                 </Card.Body>
//               </Card>
//             </Tab.Container>
//           </Col>
//         </Row>
//       </Container>
//     </div>
//   );
// }

// export default AuditTisaxTabs;


