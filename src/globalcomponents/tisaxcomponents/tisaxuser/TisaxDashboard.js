// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   Col,
//   Container,
//   Image,
//   Row,
//   Button,
//   Modal,
// } from "react-bootstrap";
// import { CircularProgressbar } from "react-circular-progressbar";
// import Link from "next/link";
// import TsaxForms from "./TsaxForms";
// import { CustomAxios } from "../../CustomAxios";
// import { Headquarter, Sublocation, baseurl, initURL } from "../../BaseUrl";
// import SendEmailAuditor from "./SendEmailAuditor";

// function TisaxDashboard() {
//   const [cardData, setCardData] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [location, setLocation] = useState(null);
//   const [isHydrated, setIsHydrated] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!isHydrated) {
//       setIsHydrated(true);
//       return;
//     }
//     fetchData();
//   }, [isHydrated]);
//   const updateCardData = () => {
//     fetchData();
//   };

//   const fetchData = async (page = 1, limit = 10) => {
//     try {
//       const response = await CustomAxios.get(
//         `${baseurl}/${initURL}/tisax?page=${page}&limit=${limit}`
//       );
//       setCardData(response.data.docs);
//     } catch (error) {
//
//       setError(error?.response?.data?.message);
//
//     }
//   };

//   const toggleModalSublocation = () => {
//     setShowModal(!showModal);
//     setLocation({
//       value: Sublocation,
//       label: Sublocation,
//     });
//   };
//   const toggleModal = () => {
//     setShowModal(!showModal);
//     setLocation({
//       value: Headquarter,
//       label: Headquarter,
//     });
//   };

//   return (
//     <>
//       {error ? (
//         <div>
//           <Col sm={12}>
//             <div className="text-center">
//               <div className="mb-3">
//                 <Image
//                   src="/images/error/403-error-img.jpg"
//                   alt=""
//                   className="img-fluid"
//                   style={{
//                     paddingTop: "1.5em",
//                     width: "25rem",
//                     height: "15rem",
//                   }}
//                 />
//               </div>
//               <h1 className="display-8 fw-bold">Oops! {error}</h1>
//               <p className="mb-4">
//                 Or simply leverage the expertise of our consultation team.
//               </p>
//               <Link href="/" className="btn btn-primary">
//                 Go Home
//               </Link>
//             </div>
//           </Col>
//         </div>
//       ) : (
//         <div>
//           <Container fluid className="p-6">
//             {cardData?.length > 0 ? (
//               <Row>
//                 <Col>
//                   <Row>
//                     <Col>
//                       <SendEmailAuditor cardData={cardData} />
//                       <Button
//                         className="btn-sm btn-secondary float-end my-2"
//                         onClick={toggleModalSublocation}
//                       >
//                         Add More Location
//                       </Button>
//                     </Col>
//                   </Row>
//                 </Col>
//               </Row>
//             ) : (
//               <div className="position-relative" style={{ minHeight: "80vh" }}>
//                 <Row className="position-absolute top-50 start-50 translate-middle">
//                   <Col className="text-center">
//                     <Button
//                       className="btn-sm btn-secondary my-2"
//                       onClick={toggleModal}
//                     >
//                       Add Headquarter
//                     </Button>
//                   </Col>
//                 </Row>
//               </div>
//             )}

//             <Modal
//               show={showModal}
//               backdrop="static"
//               keyboard={false}
//               onHide={toggleModal}
//               size="lg"
//             >
//               <Modal.Header closeButton>
//                 <Modal.Title> Add New Sublocation </Modal.Title>
//               </Modal.Header>
//               <Modal.Body>
//                 <TsaxForms
//                   location={location}
//                   setShowModal={setShowModal}
//                   updateCardData={updateCardData}
//                 />
//               </Modal.Body>
//             </Modal>
//             <Row>
//               {cardData?.map((card) => (
//                 <Col key={card._id} md={6} lg={4} xxl={4}>
//                   <Link
//                     href={`/tisax/TisaxTabs?id=${
//                       card._id
//                     }&vda_type=${encodeURIComponent(
//                       card.vda_type
//                     )}&assessment_level=${encodeURIComponent(
//                       card.assessment_level
//                     )}`}
//                   >
//                     <Card
//                       className="tisax_card mb-5"
//                       style={{ width: "18rem", height: "15rem" }}
//                     >
//                       {/* Displaying the headquarters or sublocation ID */}
//                       <span className="card__id mt-4">
//                         Location ID - {card.location_id}
//                       </span>

//                       <span className="card__id">
//                         Assessment Level - {card.assessment_level}
//                       </span>

//                       <span className="card__id">
//                         VDA Version - {card.vda_version}
//                       </span>


//                       <Card.Body className="cardbodymain">
//                         <div className="details">
//                           <svg
//                             className="card__arc"
//                             xmlns="http://www.w3.org/2000/svg"
//                           >
//                             <path />
//                           </svg>
//                           <div className="d-flex detail1">
//                             <div>
//                               <Image
//                                 className="card__thumb"
//                                 src={
//                                   card.locationtype.toLowerCase() === "sublocation"
//                                     ? "/images/iso/sublocation.png"
//                                     : "/images/iso/hqlg.png"
//                                 }
//                                 alt=""
//                                 width={40}
//                                 height={40}
//                                 roundedCircle
//                               />
//                             </div>

//                             <div>
//                               <h5 className="card__title">
//                                 {card.locationtype.toLowerCase()==="headquarter"?(Headquarter):Sublocation}
//                               </h5>
//                               <p className="card__status m-0 p-0">
//                                 {
//                                   card.assessment_date
//                                     ?.toLocaleString()
//                                     ?.split("T")[0]
//                                 }
//                               </p>
//                             </div>
//                           </div>

//                           <div className="subdetail mt-4">
//                             {/* <span className="card__status">1 hour ago</span> */}

//                             <p className="card__description">
//                             <h5 className="d-inline-block">Address</h5> - {card.company_address}{" "}
//                             </p>
//                           </div>
//                         </div>
//                         {/* <Button variant="primary">Go somewhere</Button> */}
//                       </Card.Body>
//                     </Card>
//                   </Link>
//                 </Col>
//               ))}
//             </Row>
//           </Container>
//         </div>
//       )}
//     </>
//   );
// }

// export default TisaxDashboard;
