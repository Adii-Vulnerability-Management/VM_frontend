import CustomAxios from "@/globalcomponents/CustomAxios";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { AiOutlineClear, AiOutlineClose, AiOutlineSave } from "react-icons/ai";
import Select from "react-select";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "react-toastify";
import {
  baseurl,
  initURL,
  TisaxLocationTypeOptions,
} from "../../../../BaseUrl";

function TsaxForms(props) {
  useEffect(() => {
    if (props.location?.value) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        locationtype: [
          { value: props.location.value, label: props.location.value },
        ],
      }));
    }
  }, [props.location]);

  const forceUpdate = useRef(0);
  const [fileError, setFileError] = useState(null);
  const vdaVersionOptions = [
    { value: "5.1", label: "ISA 5.1" },
    { value: "6.0.3", label: "ISA 6.0.3" },
  ];

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (file && validTypes.includes(file.type)) {
      setFormData({
        ...formData,
        signature: file,
      });
      setFileError(null);
    } else {
      setFileError("Please upload a valid image file (PNG, JPEG, JPG).");
      setFormData({
        ...formData,
        signature: null,
      });
    }
  };

  const handleClearImage = () => {
    setFormData({
      ...formData,
      signature: null,
    });
    setFileError(null);
    document.querySelector('input[name="signature"]').value = null;
  };

  const router = useRouter();
  const [formData, setFormData] = useState({
    company_name: "",
    company_address: "",
    tisax_scopeid: "",
    DnBDUNS_No: "",
    assessment_date: "",
    contact_person_name: "",
    contact_phone_number: "",
    contact_email: "",
    creator_name: "",
    signature: null,
    // locationtype: [props.location?.value],
    locationtype: [{ value: "Sublocation", label: "Sublocation" }], // Set default to "Sublocation"
    location_id: "",
    country: null,
    category: [],
    assessment_level: "",
    vda_version: "",
    headquarter: [],
  });
  const [countryData, setCountryData] = useState(null);
  const sign = useRef(null);
  const [url, setUrl] = useState();
  const [isCreateSignatureVisible, setIsCreateSignatureVisible] =
    useState(true);
  const [defaultAssessmentTypes, setDefaultAssessmentTypes] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [headquarterData, setHeadquarterData] = useState([]);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
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

    setDefaultAssessmentTypes(
      defaultAssessmentTypesMap[formData.assessment_level?.value] || []
    );
  }, [formData.assessment_level]);

  useEffect(() => {
    const selectedValues = [...defaultAssessmentTypes];
    setFormData({
      ...formData,
      category: selectedValues,
    });
  }, [defaultAssessmentTypes]);

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

  const handleCreateSignatureToggle = () => {
    setIsCreateSignatureVisible(!isCreateSignatureVisible);
    setIsButtonDisabled(false);
    setFormData({ ...formData, signature: null });
  };

  const handleFileUploadToggle = (e) => {
    setIsCreateSignatureVisible(e.target.value === "true");
    setUrl();
  };

  // Handle changes in Select components and ensure correct format
  const handleOptionsChange = (selectedOptions, fieldName) => {
    if (fieldName === "locationtype") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        locationtype: [
          { value: selectedOptions.value, label: selectedOptions.label },
        ],
        headquarter:
          selectedOptions.value === "Sublocation"
            ? prevFormData.headquarter
            : {}, // Only keep headquarter data if "Sublocation"
      }));
    } else if (
      fieldName === "headquarter" &&
      formData.locationtype[0].value === "Sublocation"
    ) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        headquarter: {
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
    const fetchData = async () => {
      try {
        const response = await CustomAxios.get(
          "/api/countries/codes"
        );
        const options = response.data.data.map((country) => ({
          value: country.name,
          label: country.name,
        }));
        setCountryData(options);
      } catch (error) {

      }
    };

    fetchData();
  }, []);

  const handleGenerate = () => {
    if (sign.current.isEmpty()) {
      toast.error("Please provide a valid signature before saving.");
      return;
    }

    setIsButtonDisabled(true);
    const signatureDataURL = sign.current
      .getTrimmedCanvas()
      .toDataURL("image/png");

    // Convert to Blob and set to formData
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
  };

  const handleClear = () => {
    sign.current.clear(); // Clear the signature canvas
    setUrl(""); // Clear the preview URL
    setFormData({
      ...formData,
      signature: null, // Reset the signature in the form data
    });
    setIsButtonDisabled(false); // Re-enable the Save button
  };

  useEffect(() => {
    const fetchHeadquarters = async () => {
      try {
        const response = await CustomAxios.get(
          `${baseurl}/${initURL}/tisax/getHeadquarters`
        );
        const data = response.data;

        const headquarterOptions = data.map((item) => ({
          value: item._id, // Use _id as the value
          label: item.location_id, // Use location_id as the display label
        }));
        setHeadquarterData(headquarterOptions);
      } catch (error) {
        console.error("Error fetching headquarter data:", error);
      }
    };

    fetchHeadquarters();
  }, []);
  // Update validation function
  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      "vda_version",
      "company_name",
      "company_address",
      "tisax_scopeid",
      "DnBDUNS_No",
      "country",
      "locationtype",
      "location_id",
      "assessment_date",
      "contact_person_name",
      "contact_phone_number",
      "contact_email",
      "creator_name",
      "signature",
      "assessment_level",
    ];

    requiredFields.forEach((field) => {
      if (
        !formData[field] ||
        (Array.isArray(formData[field]) && formData[field].length === 0)
      ) {
        errors[field] = `${field.replace(/_/g, " ")} is required.`;
      }
    });

    // Ensure `headquarter` is empty when `locationtype` is "Headquarter"
    if (formData.locationtype?.[0]?.value === "Headquarter") {
      delete errors.headquarter; // Ensure headquarter errors are removed
    }

    setFieldErrors(errors);
    setIsFormComplete(Object.keys(errors).length === 0);
    return errors;
  };

  // Modify handleSubmit to skip `headquarter` when `locationtype` is "Headquarter"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true); // Mark as submitted

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      const errorMessage = Object.values(errors).join(", ");
      toast.error(`Please address the following issues: ${errorMessage}`);
      return;
    }

    const tisaxnewformData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "signature" && value instanceof Blob) {
        tisaxnewformData.append("signature", value, "signature.png");
      } else if (key === "locationtype") {
        tisaxnewformData.append("locationtype", value[0]?.value || "");
      } else if (key === "country") {
        tisaxnewformData.append("country", value?.value || "");
      } else if (key === "vda_version" || key === "assessment_level") {
        tisaxnewformData.append(key, value?.value || "");
      } else if (key === "category") {
        value.forEach((item, index) =>
          tisaxnewformData.append(`category[${index}]`, item.value)
        );
      } else if (
        key === "headquarter" &&
        formData.locationtype[0]?.value === "Sublocation"
      ) {
        // Append headquarter data only if locationtype is "Sublocation"
        if (value.headquarterId) {
          tisaxnewformData.append(
            "headquarter[headquarterId]",
            value.headquarterId
          );
        }
        if (value.headquarterLocationId) {
          tisaxnewformData.append(
            "headquarter[headquarterLocationId]",
            value.headquarterLocationId
          );
        }
      } else if (key !== "headquarter") {
        // Skip headquarter key when locationtype is "Headquarter"
        tisaxnewformData.append(key, value);
      }
    });

    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/tisax`,
        tisaxnewformData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        toast.success("Form submitted successfully!");
        props.updateCardData();
        props.setShowModal(false);
        router.push("/industry/tisax");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "An unexpected error occurred.";
      toast.error(`Error: ${errorMsg}`);
    }
  };

  // Validation function to check form completion

  // Update form completeness state on form data change
  useEffect(() => {
    setIsFormComplete(validateForm());
  }, [formData]);

  const todayDate = new Date().toISOString().split("T")[0];
  <button
    onClick={() => setIsModalOpen(false)}
    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
  >
    &times;
  </button>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="relative bg-white shadow-lg p-8 rounded-lg max-w-4xl w-full mx-auto overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Add New Location</h2>
          <button
            type="button"
            onClick={() => props.setShowModal(false)}
            className="text-red-500 hover:text-red-700 focus:outline-none"
          >
            <AiOutlineClose size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-1 gap-4">
          <div className="bg-white shadow-md p-6 rounded-lg">
            <form onSubmit={handleSubmit}>
              {/* 1st row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* VDA Version Type */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1 requiredicon">
                    ISA Version Type:<span className="text-red-500">*</span>
                  </label>
                  <select
                    name="isa_version"
                    value={formData.vda_version?.value || ""} // Safely access value with default
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        vda_version: {
                          value: e.target.value,
                          label: `ISA ${e.target.value}`,
                        }, // Update formData with the selected value
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-sm text-sm"
                  >
                    <option value="">Select ISA Version</option>
                    <option value="5.1">ISA 5.1</option>
                    <option value="6.0.3">ISA 6.0.3</option>
                  </select>
                </div>

                {/* Company/Organization */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1 requiredicon">
                    Company/Organization:<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${isSubmitted && fieldErrors.company_name
                      ? "border-red-500"
                      : "border-gray-300"
                      } rounded-sm text-sm`}
                  />
                  {fieldErrors.message &&
                    fieldErrors.message["0"]?.company_name && (
                      <span className="text-red-500 text-xs">
                        {fieldErrors.message["0"]["company_name"]}
                      </span>
                    )}
                </div>

                {/* Address */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    Address: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_address"
                    value={formData.company_address}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${isSubmitted && fieldErrors.company_name
                      ? "border-red-500"
                      : "border-gray-300"
                      } rounded-sm text-sm`}
                  />
                  {fieldErrors.message &&
                    fieldErrors.message["0"]?.company_address && (
                      <span className="text-red-500 text-xs">
                        {fieldErrors.message["0"]["company_address"]}
                      </span>
                    )}
                </div>

                {/* Location */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    Location: <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="locationtype"
                    options={TisaxLocationTypeOptions}
                    value={formData.locationtype}
                    onChange={(selectedOptions) =>
                      handleOptionsChange(selectedOptions, "locationtype")
                    }
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />

                  {fieldErrors.message &&
                    fieldErrors.message["0"]?.locationtype && (
                      <span className="text-red-500 text-xs">
                        {fieldErrors.message["0"]["locationtype"]}
                      </span>
                    )}
                </div>

                {/* Headquarter (Conditional) */}
                {formData.locationtype?.[0]?.value === "Sublocation" && (
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">
                      Select Headquarter:{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="headquarter"
                      options={headquarterData}
                      value={
                        headquarterData.find(
                          (option) =>
                            option.value === formData.headquarter?.headquarterId
                        ) || null
                      }
                      onChange={(selectedOptions) =>
                        handleOptionsChange(selectedOptions, "headquarter")
                      }
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {fieldErrors.message &&
                      fieldErrors.message["0"]?.headquarter && (
                        <span className="text-red-500 text-xs">
                          {fieldErrors.message["0"]["headquarter"]}
                        </span>
                      )}
                  </div>
                )}

                {/* Location ID */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    Location ID: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="string"
                    name="location_id"
                    value={formData.location_id}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${isSubmitted && fieldErrors.company_name
                      ? "border-red-500"
                      : "border-gray-300"
                      } rounded-sm text-sm`}
                  />
                  {fieldErrors.message &&
                    fieldErrors.message["0"]?.location_id && (
                      <span className="text-red-500 text-xs">
                        {fieldErrors.message["0"]["location_id"]}
                      </span>
                    )}
                </div>

                {/* Country */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    Country: <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="country"
                    options={countryData}
                    value={formData.country}
                    onChange={(selectedOptions) =>
                      handleOptionsChange(selectedOptions, "country")
                    }
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                  {fieldErrors.message && fieldErrors.message["0"]?.country && (
                    <span className="text-red-500 text-xs">
                      {fieldErrors.message["0"]["country"]}
                    </span>
                  )}
                </div>

                {/* Scope/TISAX Scope ID */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    Scope/TISAX Scope ID:{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="string"
                    name="tisax_scopeid"
                    value={formData.tisax_scopeid}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${isSubmitted && fieldErrors.company_name
                      ? "border-red-500"
                      : "border-gray-300"
                      } rounded-sm text-sm`}
                  />
                  {fieldErrors.message &&
                    fieldErrors.message["0"]?.tisax_scopeid && (
                      <span className="text-red-500 text-xs">
                        {fieldErrors.message["0"]["tisax_scopeid"]}
                      </span>
                    )}
                </div>

                {/* Assessment Level */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    Assessment Level:<span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="assessment_level"
                    options={assessmentLevelOptions}
                    value={formData.assessment_level}
                    onChange={(selectedOptions) =>
                      handleOptionsChange(selectedOptions, "assessment_level")
                    }
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                  {fieldErrors.message &&
                    fieldErrors.message["0"]?.assessment_level && (
                      <span className="text-red-500 text-xs">
                        {fieldErrors.message["0"]["assessment_level"]}
                      </span>
                    )}
                </div>

                {/* Assessment Type */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    Assessment Type:<span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="category"
                    isMulti
                    isDisabled
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
                  />
                  {fieldErrors.message &&
                    fieldErrors.message[0]?.category &&
                    !formData.assessment_level && (
                      <span className="text-red-500 text-xs">
                        {fieldErrors.message[0].category}
                      </span>
                    )}
                </div>

                {/* D&B D-U-N-Sr No */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    D&B D-U-N-Sr No: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="string"
                    name="DnBDUNS_No"
                    value={formData.DnBDUNS_No}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${isSubmitted && fieldErrors.company_name
                      ? "border-red-500"
                      : "border-gray-300"
                      } rounded-sm text-sm`}
                  />
                  {fieldErrors.message &&
                    fieldErrors.message["0"]?.DnBDUNS_No && (
                      <span className="text-red-500 text-xs">
                        {fieldErrors.message["0"]["DnBDUNS_No"]}
                      </span>
                    )}
                </div>

                {/* Date of Assessment */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    Date of Assessment: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="assessment_date"
                    value={formData.assessment_date}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${isSubmitted && fieldErrors.company_name
                      ? "border-red-500"
                      : "border-gray-300"
                      } rounded-sm text-sm`}
                    min={todayDate} // Restrict past dates
                  />

                  {fieldErrors.message &&
                    fieldErrors.message["0"]?.assessment_date && (
                      <span className="text-red-500 text-xs">
                        {fieldErrors.message["0"]["assessment_date"]}
                      </span>
                    )}
                </div>

                {/* Contact Person */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    Contact Person: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact_person_name"
                    value={formData.contact_person_name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${isSubmitted && fieldErrors.company_name
                      ? "border-red-500"
                      : "border-gray-300"
                      } rounded-sm text-sm`}
                  />
                  {fieldErrors.message &&
                    fieldErrors.message["0"]?.contact_person_name && (
                      <span className="text-red-500 text-xs">
                        {fieldErrors.message["0"]["contact_person_name"]}
                      </span>
                    )}
                </div>

                {/* Telephone Number */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    Telephone Number: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contact_phone_number"
                    value={formData.contact_phone_number}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        // Regex to allow only numbers
                        handleInputChange(e); // Update if input is valid
                        setFieldErrors((prev) => ({
                          ...prev,
                          message: {
                            ...prev.message,
                            0: {
                              ...prev.message?.["0"],
                              contact_phone_number: "",
                            },
                          },
                        }));
                      } else {
                        setFieldErrors((prev) => ({
                          ...prev,
                          message: {
                            ...prev.message,
                            0: {
                              ...prev.message?.["0"],
                              contact_phone_number:
                                "Please enter a valid phone number",
                            },
                          },
                        }));
                      }
                    }}
                    className={`w-full p-2 border ${fieldErrors.message?.["0"]?.contact_phone_number
                      ? "border-red-500"
                      : "border-gray-300"
                      } rounded-sm text-sm`}
                  />
                  {fieldErrors.message?.["0"]?.contact_phone_number && (
                    <span className="text-red-500 text-xs">
                      {fieldErrors.message["0"]["contact_phone_number"]}
                    </span>
                  )}
                </div>

                {/* Email Address */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    Email Address: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${isSubmitted && fieldErrors.company_name
                      ? "border-red-500"
                      : "border-gray-300"
                      } rounded-sm text-sm`}
                  />
                  {fieldErrors.message &&
                    fieldErrors.message["0"]?.contact_email && (
                      <span className="text-red-500 text-xs">
                        {fieldErrors.message["0"]["contact_email"]}
                      </span>
                    )}
                </div>

                {/* Project Creator */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    Project Creator: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="creator_name"
                    value={formData.creator_name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${isSubmitted && fieldErrors.company_name
                      ? "border-red-500"
                      : "border-gray-300"
                      } rounded-sm text-sm`}
                  />
                  {fieldErrors.message &&
                    fieldErrors.message["0"]?.creator_name && (
                      <span className="text-red-500 text-xs">
                        {fieldErrors.message["0"]["creator_name"]}
                      </span>
                    )}
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">
                  Project Signature: <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <input
                      type="radio"
                      id="radio-create-signatures"
                      name="signatureMethod"
                      value={true}
                      checked={isCreateSignatureVisible}
                      onChange={handleCreateSignatureToggle}
                      className="mr-2"
                    />
                    <label htmlFor="radio-create-signatures">
                      Create Signature
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="radio-file-upload"
                      name="signatureMethod"
                      value={false}
                      checked={!isCreateSignatureVisible}
                      onChange={handleFileUploadToggle}
                      className="mr-2"
                    />
                    <label htmlFor="radio-file-upload">File Upload</label>
                  </div>
                </div>

                {/* Conditional Signature Canvas or File Upload */}
                {isCreateSignatureVisible ? (
                  <>
                    <div className="flex items-start space-x-4 mt-4">
                      <SignatureCanvas
                        canvasProps={{
                          width: 300,
                          height: 100,
                          className: "border border-gray-500",
                        }}
                        ref={sign}
                      />
                      {/* Show the preview next to the canvas */}
                      {url && (
                        <div>
                          <p className="text-sm text-green-500 mb-2">
                            Preview:
                          </p>
                          <img
                            src={url}
                            alt="Signature Preview"
                            className="max-w-full h-auto border border-gray-300"
                            style={{ width: "150px", height: "auto" }} // Adjust preview size
                          />
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center space-x-4">
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                        onClick={handleClear}
                      >
                        <AiOutlineClear size={24} /> {/* Clear Icon */}
                      </button>
                      <button
                        type="button"
                        className={`focus:outline-none ${isButtonDisabled
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-500 hover:text-blue-700"
                          }`}
                        onClick={handleGenerate}
                        disabled={isButtonDisabled}
                      >
                        <AiOutlineSave size={24} /> {/* Save Icon */}
                      </button>
                    </div>

                    {!url && (
                      <p className="text-sm text-gray-500 mt-2">
                        Please save your signature to preview and submit the
                        form.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mt-4">
                      <input
                        type="file"
                        name="signature"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileInput}
                        className="w-full p-2 border border-gray-300 rounded-sm text-sm"
                      />
                      {fileError && (
                        <p className="text-sm text-red-500 mt-2">{fileError}</p>
                      )}

                      {/* Show the preview only if a valid image is uploaded */}
                      {formData?.signature && (
                        <div className="flex items-start space-x-4 mt-4">
                          <img
                            src={URL.createObjectURL(formData.signature)}
                            alt="Image Preview"
                            className="max-w-full h-auto border border-gray-300"
                            style={{ width: "150px", height: "auto" }} // Adjust preview size
                          />
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 focus:outline-none"
                            onClick={handleClearImage}
                          >
                            <AiOutlineClear size={24} />{" "}
                            {/* Clear Image Icon */}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {fieldErrors.message && fieldErrors.message["0"]?.signature && (
                  <span className="text-red-500 text-xs">
                    {fieldErrors.message["0"]["signature"]}
                  </span>
                )}

                {/* Submit button, only enabled if signature is saved */}
                <div className="mt-4">
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg w-full ${isFormComplete
                      ? "bg-green-500 hover:bg-green-700"
                      : "bg-gray-400 cursor-not-allowed"
                      } text-white`}
                    disabled={!isFormComplete}
                  >
                    Submit Form
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TsaxForms;
