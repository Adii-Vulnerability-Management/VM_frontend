import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import SelectDropdown from "@/components/ui/SelectDropdown";
import { setWebShocketMessage } from "@/store/SliceComponent/ImportDropdownData";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TisaxAuditWebSocket from "./TIsaxAuditWebSocket/TisaxAuditWebSocket";
function SelectLocationDocument({ cardData }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedHeadquarter, setSelectedHeadquarter] = useState(null);
  const [selectedSubheadquarters, setSelectedSubheadquarters] = useState([]);
  const coverData = useSelector((state) => state.imprtCardData.cardDetails);
  const [headquartersOptions, setHeadquartersOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [messageData, setMessageData] = useState(null);
  const [disableData, setDisableData] = useState(true);
  const dispatch = useDispatch();
  const [downloadProgress, setDownloadProgress] = useState(0);

  const downloadFile = async () => {
    try {
      setShowLoader(true);
      const response = await axios({
        url: messageData.file_url,
        method: "GET",
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setDownloadProgress(progress);
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "report.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowLoader(false);
    } catch (error) {
      console.error("Error downloading file:", error);
      setShowLoader(false);
    }
  };

  useEffect(() => {
    const options = coverData?.map((data) => ({
      label: `${data?.location_id} (${data?.locationtype})`,
      value: `${data._id},${data?.vda_type}`,
      myid: `${data._id}`,
    }));
    setHeadquartersOptions(options);
  }, [coverData]);

  const handleHeadquarterChange = (selectedOption) => {
    setSelectedHeadquarter(selectedOption);
    setDisableData(false);
    dispatch(setWebShocketMessage(selectedOption));
  };

  const handleSubheadquarterChange = (selectedOptions) => {
    if (selectedOptions) {
      setSelectedSubheadquarters(selectedOptions);
    }
  };

  const handleSave = () => {
    const mainLocation = selectedHeadquarter
      ? {
          _id: selectedHeadquarter.value.split(",")[0],
          vda_type: selectedHeadquarter.value.split(",")[1],
        }
      : null;

    const subLocations =
      selectedSubheadquarters && selectedSubheadquarters?.length > 0
        ? selectedSubheadquarters?.map((sub) => {
            const [id, type] = sub.value.split(",");
            return {
              _id: id,
              vda_type: type,
            };
          })
        : null;

    const saveData = {
      main_location: mainLocation,
      sub_location: subLocations,
    };

    return saveData;
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowLoader(false);
    setMessageData(null);
  };

  const handleShowModal = () => setShowModal(true);

  const selectedOption = selectedSubheadquarters?.map((option) => option.value);

  const headquartersFilteredOptions = headquartersOptions?.filter(
    ({ value }) => !selectedOption.includes(value)
  );

  return (
    <div className="flex justify-end ">
      {cardData?.length > 0 && (
        <Button
          className=" text-white font-bold py-2 px-4 rounded"
          onClick={handleShowModal}
        >
          Generate Word Report
        </Button>
      )}

      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Select Headquarter and Sublocation
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={handleCloseModal}
                >
                  ×
                </button>
              </div>

              <div className="mb-4">
                {!showLoader ? (
                  messageData?.message || messageData?.error ? (
                    <div>
                      {messageData.error ? <p>{messageData.error}</p> : null}
                      {messageData.message ? (
                        <div className="text-center">
                          <p>{messageData.message}</p>
                          <button
                            onClick={downloadFile}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-4 rounded"
                          >
                            Download File
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div>
                      <label className="block mb-2">Select Headquarter:</label>
                      <SelectDropdown
                        options={headquartersFilteredOptions}
                        value={selectedHeadquarter}
                        onChange={handleHeadquarterChange}
                        placeholder="Select Headquarter"
                        isDisabled={false}
                      />
                      <label className="block mt-4 mb-2">
                        Select Sublocations:
                      </label>
                      <SelectDropdown
                        options={headquartersOptions?.filter(
                          (option) =>
                            option.value !== selectedHeadquarter?.value
                        )}
                        value={selectedSubheadquarters}
                        onChange={handleSubheadquarterChange}
                        placeholder="Select Sublocations"
                        isMulti={true}
                        isDisabled={!selectedHeadquarter}
                      />
                    </div>
                  )
                ) : (
                  <div className="text-center">
                    <Loader />
                    <p className="mt-2 text-sm text-gray-600">
                      Generating Report...
                    </p>
                  </div>
                )}

                {showLoader && messageData ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Downloading Report...
                    </p>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                        <div
                          style={{ width: `${downloadProgress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        >
                          {downloadProgress}%
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end mt-4">
                <TisaxAuditWebSocket
                  onSave={handleSave}
                  showModal={showModal}
                  isModalOpen={isModalOpen}
                  setIsModalOpen={setIsModalOpen}
                  selectedHeadquarter={selectedHeadquarter}
                  setShowModal={setShowModal}
                  setShowLoader={setShowLoader}
                  showLoader={showLoader}
                  setSelectedHeadquarter={setSelectedHeadquarter}
                  setSelectedSubheadquarters={setSelectedSubheadquarters}
                  messageData={messageData}
                  setMessageData={setMessageData}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SelectLocationDocument;
