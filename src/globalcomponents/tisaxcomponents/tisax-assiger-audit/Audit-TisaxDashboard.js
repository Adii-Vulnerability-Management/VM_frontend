import React, { useEffect, useState } from "react";
import Link from "next/link";
import AuditTisaxForms from "./AuditTisaxForms";
import { CustomAxios } from "../../CustomAxios";
import { Headquarter, Sublocation, baseurl, initURL } from "../../BaseUrl";
import ExcelImport from "./ExcelImport";
import ExcelImportV6 from "./ExcelImportV6";
import SelectLocationDocument from "./SelectLocationDocument";
import { useDispatch } from "react-redux";
import { setCardDetails } from "../../reduxes/SliceComponent/ImportDropdownData";

function AuditTisaxdashboard() {
  const [cardData, setCardData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showFileModal, setshowFileModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [location, setLocation] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [assessmentLevel, setAssessmentLevel] = useState("");
  const [vdaVersion, setVdaVersion] = useState("");
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isHydrated) {
      setIsHydrated(true);
      return;
    }
    fetchData();
  }, [isHydrated]);

  const fetchData = async (page = 1, limit = 20) => {
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/tisax-audit?page=${page}&limit=${limit}`
      );
      dispatch(setCardDetails(response?.data?.docs));
      setCardData(response.data.docs);
    } catch (error) {
      setError(error?.response?.data?.message);

    }
  };

  const toggleModalSublocation = () => {
    setShowModal(!showModal);
    setLocation({
      value: "Sublocation",
      label: "Sublocation",
    });
  };

  const toggleModal = () => {
    setShowModal(!showModal);
    setLocation({
      value: "Headquarter",
      label: "Headquarter",
    });
  };

  const toggleFileModal = (type) => {
    setshowFileModal(!showFileModal);
    setModalType(type);
  };

  const closeFileModal = () => {
    setAssessmentLevel("");
    setshowFileModal(false);
    setModalType("");
  };

  const handleDropdownChange = (event) => {
    setAssessmentLevel(event.target.value);
  };

  const handleVdaVersionChange = (event) => {
    setVdaVersion(event.target.value);
  };

  // const handleFileChange = (event) => {
  //   const selectedFile = event.target.files[0];
  //   if (selectedFile) {
  //     if (
  //       selectedFile.type ===
  //       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  //     ) {
  //       
  //     } else {
  //       console.error("Invalid file type. Please select a valid XLSX file.");
  //     }
  //   }
  // };

  return (
    <>
      {error ? (
        <div className="text-center py-12">
          <div className="mb-3">
            <img
              src="/images/error/403-error-img.jpg"
              alt=""
              className="mx-auto"
              style={{
                paddingTop: "1.5em",
                width: "25rem",
                height: "15rem",
              }}
            />
          </div>
          <h1 className="text-3xl font-bold">Oops! {error}</h1>
          <p className="mb-4">
            Or simply leverage the expertise of our consultation team.
          </p>
          <Link href="/">
            <a className="btn btn-primary">Go Home</a>
          </Link>
        </div>
      ) : (
        <div>
          <div className="p-6">
            <div className="flex justify-end">
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                onClick={() => toggleFileModal("answer")}
              >
                Import Excel File
              </button>
            </div>

            {cardData?.length ? (
              <div className="mt-4">
                <SelectLocationDocument cardData={cardData} />
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-screen">
                <div>No Data Available</div>
              </div>
            )}

            {showFileModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">
                      {modalType === "upload"
                        ? "Upload File"
                        : "Upload Only Answer File"}
                    </h2>
                    <button
                      className="text-red-500 font-bold"
                      onClick={closeFileModal}
                    >
                      &times;
                    </button>
                  </div>

                  {modalType === "answer" && (
                    <form>
                      <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">
                          VDA Version Type:
                        </label>
                        <select
                          className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                          onChange={handleVdaVersionChange}
                        >
                          <option value="" disabled selected>
                            Select a VDA Version
                          </option>
                          <option value="5.1">5.1</option>
                          <option value="6.0.3">6.0.3</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">
                          Select an assessment level:
                        </label>
                        <select
                          className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                          onChange={handleDropdownChange}
                        >
                          <option value="" disabled selected>
                            Select an assessment level
                          </option>
                          <option value="AL2">AL2</option>
                          <option value="AL3">AL3</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <p className="mb-2">Download a sample file:</p>
                        <a
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                          href="/path/to/sample-file.xlsx"
                          download
                        >
                          Download Sample File
                        </a>
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">
                          Choose Answer File (XLSX only)
                        </label>

                        {vdaVersion === "6.0.3" ? (
                          <ExcelImportV6
                            assessmentLevel={assessmentLevel}
                            setAssessmentLevel={setAssessmentLevel}
                          />
                        ) : (
                          <ExcelImport
                            assessmentLevel={assessmentLevel}
                            setAssessmentLevel={setAssessmentLevel}
                          />
                        )}
                      </div>
                    </form>
                  )}

                  <div className="flex justify-end mt-4">
                    <button
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                      onClick={closeFileModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Add New Sublocation</h2>
                    <button
                      className="text-red-500 font-bold"
                      onClick={toggleModal}
                    >
                      &times;
                    </button>
                  </div>
                  <AuditTisaxForms
                    location={location}
                    setShowModal={setShowModal}
                  />
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cardData?.map((card) =>
                card.vda_type !== "Imported Combine Answer" ? (
                  <div key={card._id} className="bg-white rounded-lg shadow-lg">
                    <Link
                      href={`/tisax-audit/AuditTisaxTabs?id=${card._id}&&vda_type=${card.vda_type}&assessment_level=${card.assessment_level}&vda_version=${card.vda_version}`}
                    >
                      <a>
                        <div className="p-4">
                          <span className="block text-lg font-bold">
                            Location ID - {card.location_id}
                          </span>
                          <span className="block">
                            Assessment Level - {card.assessment_level}
                          </span>
                          <span className="block">
                            VDA Version - {card.vda_version}
                          </span>

                          <div className="mt-4">
                            <div className="flex items-center">
                              <img
                                className="w-10 h-10 rounded-full"
                                src={
                                  card.locationtype.toLowerCase() ===
                                    "sublocation"
                                    ? "/images/iso/sublocation.png"
                                    : "/images/iso/hqlg.png"
                                }
                                alt=""
                              />
                              <div className="ml-4">
                                <h5 className="font-bold">
                                  {card.locationtype.toLowerCase() ===
                                    "headquarter"
                                    ? Headquarter
                                    : Sublocation}
                                </h5>
                                <p className="text-sm">
                                  {card.assessment_date
                                    ?.toLocaleString()
                                    ?.split("T")[0]}
                                </p>
                              </div>
                            </div>
                            <p className="mt-2">
                              <strong>Address:</strong> {card.company_address}
                            </p>
                          </div>
                        </div>
                      </a>
                    </Link>
                  </div>
                ) : (
                  <div key={card._id} className="bg-white rounded-lg shadow-lg">
                    <Link
                      href={`/importtisax/TisaxsTabs?id=${card._id}&vda_type=${card.vda_type}&assessment_level=${card.assessment_level}&vda_version=${card.vda_version}`}
                    >
                      <a>
                        <div className="p-4">
                          <span className="block text-lg font-bold">
                            Location ID - {card.location_id}
                          </span>
                          <span className="block">
                            Assessment Level - {card.assessment_level}
                          </span>
                          <span className="block">
                            VDA Version - {card.vda_version}
                          </span>

                          <div className="mt-4">
                            <div className="flex items-center">
                              <img
                                className="w-10 h-10 rounded-full"
                                src={
                                  card.locationtype.toLowerCase() ===
                                    "sublocation"
                                    ? "/images/iso/sublocation.png"
                                    : "/images/iso/hqlg.png"
                                }
                                alt=""
                              />
                              <div className="ml-4">
                                <h5 className="font-bold">
                                  {card.locationtype.toLowerCase() ===
                                    "headquarter"
                                    ? Headquarter
                                    : Sublocation}
                                </h5>
                                <p className="text-sm">
                                  {card.assessment_date
                                    ?.toLocaleString()
                                    ?.split("T")[0]}
                                </p>
                              </div>
                            </div>
                            <p className="mt-2">
                              <strong>Address:</strong> {card.company_address}
                            </p>
                          </div>
                        </div>
                      </a>
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AuditTisaxdashboard;
