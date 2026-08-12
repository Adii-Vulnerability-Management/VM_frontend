import React, { useEffect, useState } from "react";

import Select from "react-select";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { toast } from "react-toastify";
import { baseurl, initURL, vdaVersionOptions } from "../../../../../BaseUrl";
import { useRouter } from "next/router";
import SignatureCanvas from "react-signature-canvas";
import { AiOutlineClear, AiOutlineSave } from "react-icons/ai"; // Import icons

function TisaxCover(props) {
  const router = useRouter();
  const { id, rootId } = router.query;
  const [fileurl, setFileurl] = useState(null);
  const [formData, setFormData] = useState({});
  const [disablefeild, setDisableFeild] = useState(true);
  const [countryData, setCountryData] = useState(null);
  const [url, setUrl] = useState();
  const [isCreateSignatureVisible, setIsCreateSignatureVisible] =
    useState(true);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [defaultAssessmentTypes, setDefaultAssessmentTypes] = useState([]);
  const [changesSaved, setChangesSaved] = useState(false);
  const { vda_type, assessment_level } = router.query;
  const [fieldErrors, setFieldErrors] = useState({});
  const [headquarterData, setHeadquarterData] = useState([]);

  // Add this line with other state declarations
  const [originalSignature, setOriginalSignature] = useState(null);

  // Add a state variable to track the edited signature
  const [editedSignature, setEditedSignature] = useState(null);

  const [sign, setSign] = useState();

  const handleInputChange = (e) => {
    const { name, type, value } = e.target;

    // Clear the error message for the field being edited
    setFieldErrors((prevFieldErrors) => {
      const updatedMessage = {
        ...(prevFieldErrors.message && prevFieldErrors.message["0"]), // Get the existing message for group "0"
        [name]: value ? "" : "Field should not be empty",
      };

      return {
        ...prevFieldErrors,
        message: {
          0: updatedMessage, // Update the message for group "0"
        },
      };
    });

    if (type === "file") {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        [name]: file,
      });

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => { };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleButtonClickEdit = () => {
    setIsEditing(true);
    setDisableFeild(false);
  };

  const handleButtonClickEditCancel = () => {
    setIsEditing(false);
    setDisableFeild(true);
  };

  const handleOptionsChange = (selectedOptions, fieldName) => {
    setFieldErrors((prevFieldErrors) => {
      const updatedMessage = {
        ...(prevFieldErrors.message && prevFieldErrors.message["0"]), // Get the existing message for group "0"
        [fieldName]: selectedOptions ? "" : `${fieldName} should not be empty`, // Set error message if selectedOptions is empty
      };

      return {
        ...prevFieldErrors,
        message: {
          0: updatedMessage, // Update the message for group "0"
        },
      };
    });

    if (fieldName === "category") {
      // Filter out null values and create an array of selected values
      const selectedValues = [...selectedOptions];

      setFormData({
        ...formData,
        [fieldName]: selectedValues,
      });
    } else if (fieldName === "headquarter") {

      // Assuming the selected option contains the value and label
      setFormData((prevFormData) => ({
        ...prevFormData,
        [fieldName]: {
          headquarterId: selectedOptions.value,
          headquarterLocationId: selectedOptions.label,
        },
      }));

    } else {
      setFormData({
        ...formData,
        [fieldName]: selectedOptions,
      });
    }
  };

  const defaultAssessmentTypesMap = {
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
  useEffect(() => {
    // Update default assessment types based on the selected assessment level
    setDefaultAssessmentTypes(
      defaultAssessmentTypesMap[formData.assessment_level?.value] || []
    );
  }, [formData.assessment_level]);

  useEffect(() => {
    if (assessment_level === "AL2") {
      setFormData({
        ...formData,
        assessment_level: [{ value: "AL2", label: "AL2" }],
        category: defaultAssessmentTypesMap?.AL2,
      });
    } else if (assessment_level === "AL3") {
      setFormData({
        ...formData,
        assessment_level: [{ value: "AL3", label: "AL3" }],
        category: defaultAssessmentTypesMap?.AL3,
      });
    }
  }, [assessment_level]);

  useEffect(() => {
    const selectedValues = [...defaultAssessmentTypes];
    if (selectedValues.length > 0) {
      setFormData({
        ...formData,
        category: selectedValues,
      });
    }
  }, [defaultAssessmentTypes]);

  const assessmentTypeOptions = [
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

  const assessmentLevelOptions = [
    { value: "AL2", label: "AL2" },
    { value: "AL3", label: "AL3" },
  ];

  useEffect(() => {
    if (!isHydrated) {
      setIsHydrated(true); // Set flag to true once component is hydrated
      return; // Skip execution during hydration
    }

    const fetchData = async (id) => {
      try {
        // Fetch default values for your form
        let defaultValuesResponse = await CustomAxios.get(
          `${baseurl}/${initURL}/assign-tisax-task/employee-assigned-tasks` // Replace with your actual API endpoint
        );
        let filterData = defaultValuesResponse.data.find((loc) => loc._id == rootId) || {}

        defaultValuesResponse.data = filterData?.locationId || {}
        console.log(defaultValuesResponse, 'defaultValuesResponse');

        // Set default values in the state
        setFileurl(defaultValuesResponse?.data?.signature_file_url);
        const locationTypeOptions = [
          {
            value: defaultValuesResponse.data.locationtype,
            label: defaultValuesResponse.data.locationtype,
          },
        ];

        if (defaultValuesResponse.data.headquarter) {
          const headquarteroptions = [
            {
              value: defaultValuesResponse.data.headquarter.headquarterId,
              label:
                defaultValuesResponse.data.headquarter.headquarterLocationId,
            },
          ];

          setHeadquarterData(headquarteroptions);
        }

        const contryTypeOptions = [
          {
            value: defaultValuesResponse.data.country,
            label: defaultValuesResponse.data.country,
          },
        ];

        const assessment_levelOptions = [
          {
            value: defaultValuesResponse.data.assessment_level,
            label: defaultValuesResponse.data.assessment_level,
          },
        ];
        const formattedAssessmentDate = defaultValuesResponse.data
          .assessment_date
          ? new Date(defaultValuesResponse.data.assessment_date)
            .toISOString()
            .split("T")[0]
          : "";
        setFormData((prevFormData) => ({
          ...prevFormData,
          company_name: defaultValuesResponse.data.company_name || "",
          company_address: defaultValuesResponse.data.company_address || "",
          tisax_scopeid: defaultValuesResponse.data.tisax_scopeid || "",
          DnBDUNS_No: defaultValuesResponse.data.DnBDUNS_No || "",
          assessment_date: formattedAssessmentDate,
          contact_person_name:
            defaultValuesResponse.data.contact_person_name || "",
          contact_phone_number:
            defaultValuesResponse.data.contact_phone_number || "",
          contact_email: defaultValuesResponse.data.contact_email || "",
          creator_name: defaultValuesResponse.data.creator_name || "",
          location_id: defaultValuesResponse.data.location_id || "",
          locationtype: locationTypeOptions || "",
          country: contryTypeOptions || "",
          // category: categoryOptions || [],
          assessment_level: assessment_levelOptions || "",
          signature: defaultValuesResponse.data.signature_file_url,
          vda_version: {
            value: defaultValuesResponse.data.vda_version,
            label: defaultValuesResponse.data.vda_version,
          }, // Ensure this is set
          headquarter: {
            headquarterId:
              defaultValuesResponse.data.headquarter?.headquarterId || "",
            headquarterLocationId:
              defaultValuesResponse.data.headquarter?.headquarterLocationId ||
              "",
          },
        }));
        setUrl(defaultValuesResponse.data.signature_file_url);
        // Fetch country data
        const countryResponse = await CustomAxios.get(
          '/api/countries/codes'
        );
        const countryOptions = countryResponse.data.data.map((country) => ({
          value: country.name,
          label: country.name,
        }));
        setCountryData(countryOptions);

        // Set the original signature
        setOriginalSignature(defaultValuesResponse?.data?.signature_file_url);
        // ...
      } catch (error) {

      }
    };
    if (id) {
      fetchData(id);
    }
  }, [isHydrated, id]);

  const handleCreateSignatureToggle = () => {
    setIsCreateSignatureVisible(!isCreateSignatureVisible);
    setIsButtonDisabled(false);
  };

  const handleFileUploadToggle = (e) => {
    setIsCreateSignatureVisible(e.target.value === "true");
  };

  const handleGenerate = () => {
    // Keep the button enabled unless necessary to prevent multiple clicks quickly
    const signatureDataURL = sign.getTrimmedCanvas().toDataURL("image/png");
    setEditedSignature(signatureDataURL);

    const dataURLtoBlob = (dataURL) => {
      const byteString = atob(dataURL.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: "image/png" });
    };

    const signatureBlob = dataURLtoBlob(signatureDataURL);
    setFormData({
      ...formData,
      signature: signatureBlob,
    });

    setUrl(signatureDataURL); // Display the signature immediately
    setChangesSaved(true);

    // Disable the button only after the signature has been processed, but re-enable it after clearing
    setIsButtonDisabled(true);
  };

  const handleClear = () => {
    if (sign) {
      sign.clear(); // Clears the signature canvas
      setUrl(""); // Clears the displayed signature
      setIsButtonDisabled(false); // Re-enable Save button if needed
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tisaxnewformData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      switch (key) {
        case "signature":
          if (typeof value !== "string") {
            tisaxnewformData?.append("signature", value, "signature.png");
          }
          break;
        case "locationtype":
          tisaxnewformData.append("locationtype", value[0]?.value);
          break;
        case "country":
          const countryValue = Array.isArray(value)
            ? value[0]?.value
            : value?.value;
          tisaxnewformData.append("country", countryValue);
          break;
        case "assessment_level":
          const levelValue = Array.isArray(value)
            ? value[0]?.value
            : value?.value;
          tisaxnewformData.append("assessment_level", levelValue);
          break;
        case "category":
          value.forEach((assessment, index) => {
            tisaxnewformData.append(`category[${index}]`, assessment.value);
          });
          break;
        case "headquarter":
          // Only append headquarter data if the location type is not "Headquarter"
          if (formData.locationtype[0]?.value !== "Headquarter") {
            if (value && typeof value === "object") {
              tisaxnewformData.append(
                "headquarter[headquarterId]",
                value.headquarterId
              );
              tisaxnewformData.append(
                "headquarter[headquarterLocationId]",
                value.headquarterLocationId
              );
            }
          }
          break;
        case "vda_version":
          tisaxnewformData.append(`vda_version`, value.value);
          break;
        default:
          tisaxnewformData.append(key, value);
      }
    });

    try {
      const response = await CustomAxios.patch(
        baseurl + `/${initURL}/tisax/${id}`,
        tisaxnewformData, // Use the FormData object
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        // Handle success case
        setFieldErrors({});
        toast.success("Data submitted successfully!");
        setIsEditing(false);
        setDisableFeild(true);
        setIsButtonDisabled(false);
        // Update the URL without reloading the page
        const updatedQuery = { ...router.query };
        if (tisaxnewformData.get("assessment_level")) {
          updatedQuery.assessment_level =
            tisaxnewformData.getAll("assessment_level");
        }

        // Update the URL with the new query
        router.push({
          pathname: router.pathname,
          query: updatedQuery,
        });
      } else if (response.status === 400) {
        // Handle bad request error
        toast.error("Bad request. Please check your input data.");
        const errorData = response.data.errors;
        if (errorData) {
          const newFieldErrors = {};
          Object.entries(errorData).forEach(([fieldName, errorMessage]) => {
            newFieldErrors[fieldName] = errorMessage;
          });
          setFieldErrors({
            ...fieldErrors,
            ...newFieldErrors,
          });
        }
      }
    } catch (error) {
      // Handle network or server error
      console.error("Error sending data:", error);
      const errorMessage = error.response
        ? error.response.data.errors.message[0].location_id
        : "Unknown error occurred";
      toast.error(errorMessage);
    }
  };

  const currentDate = new Date().toISOString().split("T")[0];
  return (
    <div className="pb-4 p-4">
      <div>
        <div className="p-4">
          <div className="w-full">
            <div className="border rounded-lg shadow-md">
              <div className="border-b px-4 py-3 bg-gray-50">
                <strong>Information Security Assessment Form</strong>
              </div>
              <div className="p-4">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="mb-2">
                      <label className="text-sm mb-0 block">
                        VDA Version Type2:
                      </label>
                      <Select
                        name="vda_version"
                        options={vdaVersionOptions}
                        value={formData.vda_version}
                        onChange={(selectedOptions) =>
                          handleOptionsChange(selectedOptions, "vda_version")
                        }
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isDisabled={disablefeild}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="text-sm mb-0 block">
                        Company/Organization:
                      </label>
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        className="w-full border p-2 rounded text-sm"
                        disabled={disablefeild}
                      />
                      {fieldErrors.message?.["0"]?.["company_name"] && (
                        <span className="text-red-500 text-sm">
                          {fieldErrors.message["0"]["company_name"]}
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="text-sm mb-0 block">
                        Address: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="company_address"
                        value={formData.company_address}
                        onChange={handleInputChange}
                        className="w-full border p-2 rounded text-sm"
                        disabled={disablefeild}
                      />
                      {fieldErrors.message?.["0"]?.["company_address"] && (
                        <span className="text-red-500 text-sm">
                          {fieldErrors.message["0"]["company_address"]}
                        </span>
                      )}
                    </div>

                    {formData.locationtype?.[0]?.value === "Sublocation" && (
                      <div className="mb-2">
                        <label className="text-sm mb-0 block">
                          <span className="text-red-500">*</span> Select
                          Headquarter:
                        </label>
                        <Select
                          name="headquarter"
                          options={headquarterData}
                          value={
                            headquarterData.find(
                              (option) =>
                                option.value ===
                                formData.headquarter?.headquarterId
                            ) || null
                          }
                          onChange={(selectedOptions) =>
                            handleOptionsChange(selectedOptions, "headquarter")
                          }
                          className="react-select-container"
                          classNamePrefix="react-select"
                          isDisabled={disablefeild}
                        />
                        {fieldErrors.message?.["0"]?.["headquarter"] && (
                          <span className="text-red-500 text-sm">
                            {fieldErrors.message["0"]["headquarter"]}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mb-2">
                      <label className="text-sm mb-0 block">Location:</label>
                      <Select
                        name="locationtype"
                        value={formData.locationtype}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isDisabled
                      />
                      {fieldErrors.message?.["0"]?.["locationtype"] && (
                        <span className="text-red-500 text-sm">
                          {fieldErrors.message["0"]["locationtype"]}
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="text-sm mb-0 block">Location ID:</label>
                      <input
                        type="string"
                        name="location_id"
                        value={formData.location_id}
                        onChange={handleInputChange}
                        className="w-full border p-2 rounded text-sm"
                        disabled={disablefeild}
                      />
                      {fieldErrors.message?.["0"]?.["location_id"] && (
                        <span className="text-red-500 text-sm">
                          {fieldErrors.message["0"]["location_id"]}
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="text-sm mb-0 block">Country:</label>
                      <Select
                        name="country"
                        options={countryData}
                        value={formData.country}
                        onChange={(selectedOptions) =>
                          handleOptionsChange(selectedOptions, "country")
                        }
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isDisabled={disablefeild}
                      />
                      {fieldErrors.message?.["0"]?.["country"] && (
                        <span className="text-red-500 text-sm">
                          {fieldErrors.message["0"]["country"]}
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="text-sm mb-0 block">
                        Assessment Level:
                      </label>
                      <Select
                        name="assessment_level"
                        options={assessmentLevelOptions}
                        value={formData.assessment_level}
                        onChange={(selectedOptions) =>
                          handleOptionsChange(
                            selectedOptions,
                            "assessment_level"
                          )
                        }
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isDisabled={disablefeild}
                      />
                      {fieldErrors.message?.["0"]?.["assessment_level"] && (
                        <span className="text-red-500 text-sm">
                          {fieldErrors.message["0"]["assessment_level"]}
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="text-sm mb-0 block">
                        <span className="text-red-500">*</span> Assessment Type:
                      </label>
                      <Select
                        name="category"
                        isMulti
                        options={
                          defaultAssessmentTypes.length
                            ? defaultAssessmentTypes
                            : assessmentTypeOptions
                        }
                        value={formData.category}
                        onChange={(selectedOptions) =>
                          handleOptionsChange(selectedOptions, "category")
                        }
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isDisabled
                      />
                      {fieldErrors.message?.["0"]?.["category"] && (
                        <span className="text-red-500 text-sm">
                          {fieldErrors.message["0"]["category"]}
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="text-sm mb-0 block">
                        Scope/TISAX Scope ID:
                      </label>
                      <input
                        type="string"
                        name="tisax_scopeid"
                        value={formData.tisax_scopeid}
                        onChange={handleInputChange}
                        className="w-full border p-2 rounded text-sm"
                        disabled={disablefeild}
                      />
                      {fieldErrors.message?.["0"]?.["tisax_scopeid"] && (
                        <span className="text-red-500 text-sm">
                          {fieldErrors.message["0"]["tisax_scopeid"]}
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="text-sm mb-0 block">
                        D&B D-U-N-Sr No:
                      </label>
                      <input
                        type="string"
                        name="DnBDUNS_No"
                        value={formData.DnBDUNS_No}
                        onChange={handleInputChange}
                        className="w-full border p-2 rounded text-sm"
                        disabled={disablefeild}
                      />
                      {fieldErrors.message?.["0"]?.["DnBDUNS_No"] && (
                        <span className="text-red-500 text-sm">
                          {fieldErrors.message["0"]["DnBDUNS_No"]}
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="text-sm mb-0 block">
                        Date of Assessment:
                      </label>
                      <input
                        type="date"
                        name="assessment_date"
                        value={formData.assessment_date}
                        onChange={handleInputChange}
                        className="w-full border p-2 rounded text-sm"
                        disabled={disablefeild}
                      />
                      {fieldErrors.message?.["0"]?.["assessment_date"] && (
                        <span className="text-red-500 text-sm">
                          {fieldErrors.message["0"]["assessment_date"]}
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="text-sm mb-0 block">
                        Contact Person:
                      </label>
                      <input
                        type="text"
                        name="contact_person_name"
                        value={formData.contact_person_name}
                        onChange={handleInputChange}
                        className="w-full border p-2 rounded text-sm"
                        disabled={disablefeild}
                      />
                      {fieldErrors.message?.["0"]?.["contact_person_name"] && (
                        <span className="text-red-500 text-sm">
                          {fieldErrors.message["0"]["contact_person_name"]}
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="text-sm mb-0 block">
                        Telephone Number:
                      </label>
                      <input
                        type="text"
                        name="contact_phone_number"
                        value={formData.contact_phone_number}
                        onChange={handleInputChange}
                        className="w-full border p-2 rounded text-sm"
                        disabled={disablefeild}
                      />
                      {fieldErrors.message?.["0"]?.["contact_phone_number"] && (
                        <span className="text-red-500 text-sm">
                          {fieldErrors.message["0"]["contact_phone_number"]}
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="text-sm mb-0 block">
                        Email Address:
                      </label>
                      <input
                        type="email"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleInputChange}
                        className="w-full border p-2 rounded text-sm"
                        disabled={disablefeild}
                      />
                      {fieldErrors.message?.["0"]?.["contact_email"] && (
                        <span className="text-red-500 text-sm">
                          {fieldErrors.message["0"]["contact_email"]}
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="text-sm mb-0 block">
                        Project Creator:
                      </label>
                      <input
                        type="text"
                        name="creator_name"
                        value={formData.creator_name}
                        onChange={handleInputChange}
                        className="w-full border p-2 rounded text-sm"
                        disabled={disablefeild}
                      />
                      {fieldErrors.message?.["0"]?.["creator_name"] && (
                        <span className="text-red-500 text-sm">
                          {fieldErrors.message["0"]["creator_name"]}
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      {/* <label className="text-sm mb-0 block">
                        Project Signature:
                      </label> */}
                      {/* {!isEditing && (
                        <img
                          src={originalSignature || formData.signature}
                          alt="Original Signature"
                          className="max-w-[200px] mt-2"
                        />
                      )} */}
                      {isEditing && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <input
                              type="radio"
                              id="radio-create-signatures"
                              value={true}
                              checked={isCreateSignatureVisible}
                              onChange={handleCreateSignatureToggle}
                              disabled={disablefeild}
                            />{" "}
                            <label htmlFor="radio-create-signatures">
                              Create Signature
                            </label>
                          </div>
                          <div>
                            <input
                              type="radio"
                              id="radio-file-upload"
                              value={false}
                              checked={!isCreateSignatureVisible}
                              onChange={handleFileUploadToggle}
                              disabled={disablefeild}
                            />{" "}
                            <label htmlFor="radio-file-upload">
                              File Upload
                            </label>
                          </div>
                        </div>
                      )}
                      {isEditing && isCreateSignatureVisible && (
                        <div>
                          <SignatureCanvas
                            canvasProps={{
                              width: 300,
                              height: 100,
                              className:
                                "sigCanvas border border-gray-400 px-4",
                            }}
                            ref={(ref) => setSign(ref)}
                            disabled={disablefeild}
                          />
                          <br />
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 focus:outline-none mx-3"
                            onClick={handleClear}
                            disabled={disablefeild}
                          >
                            <AiOutlineClear size={24} /> {/* Clear Icon */}
                          </button>
                          <button
                            className="focus:outline-none text-blue-500 hover:text-blue-700"

                            onClick={handleGenerate}
                            disabled={disablefeild || isButtonDisabled}
                          >
                            <AiOutlineSave size={24} /> {/* Save Icon */}
                          </button>
                          <br />
                          <br />
                        </div>
                      )}
                      {/* {isEditing && !isCreateSignatureVisible && (
                        <input
                          type="file"
                          name="signature"
                          onChange={handleInputChange}
                          className="w-full border p-2 rounded text-sm"
                          disabled={disablefeild}
                        />
                      )}
                      {formData.signature && url && isEditing && (
                        <img
                          src={
                            formData.signature instanceof File
                              ? URL.createObjectURL(formData.signature)
                              : url || formData.signature
                          }
                          alt="Preview"
                          className="max-w-[200px] mt-2"
                        />
                      )}
                      {fieldErrors.message?.["0"]?.["signature"] && (
                        <span className="text-red-500 text-sm">
                          {fieldErrors.message["0"]["signature"]}
                        </span>
                      )} */}
                    </div>
                  </div>

                  {/* <div className="mt-4">
                    {disablefeild ? (
                      <button
                        className="bg-[#007ACC] hover:bg-[#005A99] active:bg-[#004F8A] text-white px-4 py-2 rounded text-sm"
                        onClick={handleButtonClickEdit}
                      >
                        Edit
                      </button>
                    ) : (
                      <div>
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded text-sm mx-3"
                          onClick={handleButtonClickEditCancel}
                        >
                          Cancel
                        </button>
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded text-sm"
                          type="submit"
                        >
                          Submit
                        </button>
                      </div>
                    )}
                  </div> */}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TisaxCover;
