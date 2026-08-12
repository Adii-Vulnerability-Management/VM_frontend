import CustomAxios from "@/config/CustomAxios";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { AiOutlineClear, AiOutlineSave } from "react-icons/ai";
import SignatureCanvas from "react-signature-canvas";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import {
  baseurl,
  initURL,
  TisaxLocationTypeOptions,
  assessmentTypeOptions,
  assessmentLevelOptions,
  defaultAssessmentTypesMap,
} from "@/config/config";
import SelectDropdown from "@/components/ui/SelectDropdown";
import Image from "next/image";
import Loader from "@/components/ui/Loader";
import Cookies from "js-cookie";
function TisaxCover(props) {
  const router = useRouter();
  const todayDate = new Date().toISOString().split("T")[0];
  const [fileError, setFileError] = useState(null);
  const sign = useRef(null);
  const [countryData, setCountryData] = useState(null);
  const [url, setUrl] = useState();
  const [isCreateSignatureVisible, setIsCreateSignatureVisible] =
    useState(true);
  const [defaultAssessmentTypes, setDefaultAssessmentTypes] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [headquarterData, setHeadquarterData] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
  const { id  , vda_type , rootId} = router.query;
  const isEditMode = Boolean(id);
  const isAudit = router.asPath.includes("tisax-audit");
  const segment = isAudit ? "tisax-audit" : "tisax";

  const stored = Cookies.get("user_data");
  const role = stored ? JSON.parse(stored).user_designation : "Admin";
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
  const handleGenerate = () => {
    if (sign.current.isEmpty()) {
      toastError("Please provide a valid signature before saving.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true); // Mark as submitted
    setIsLoading(true); // start loader

    const errors = {};

    // Required dropdowns
    if (!formData.vda_version) errors.vda_version = "ISA version is required.";
    if (!formData.assessment_level)
      errors.assessment_level = "Assessment level is required.";
    if (!formData.country) errors.country = "Country is required.";
    if (!formData.locationtype?.[0]?.value)
      errors.locationtype = "Location type is required.";
    if (
      formData.locationtype?.[0]?.value === "Sublocation" &&
      (!formData.headquarter?.headquarterId ||
        !formData.headquarter?.headquarterLocationId)
    ) {
      errors.headquarter = "Headquarter is required for Sublocation.";
    }

    setFieldErrors({ message: { 0: errors } });

    // ❌ If any dropdown error exists, stop the submission
    if (Object.keys(errors).length > 0) {
      toastError("Please fill all required dropdown fields.");
      setIsLoading(false);
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
      const response = await CustomAxios[isEditMode ? "patch" : "post"](
        `${baseurl}/${initURL}/tisax${isEditMode ? `/${id}` : ""}`,
        tisaxnewformData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 201) {
        toastSuccess("Form submitted successfully!");
        props.updateCardData();
        props.setShowModal(false);
        router.push("/industry/automobile/tisax");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "An unexpected error occurred.";
      toastError(`Error: ${errorMsg}`);
    } finally {
      setIsLoading(false); // stop loader
    }
  };

  useEffect(() => {
    // Initial Reset on Modal Open
    if (props.showModal) {
      const baseForm = {
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
        locationtype: [{ value: "Sublocation", label: "Sublocation" }],
        location_id: "",
        country: null,
        category: [],
        assessment_level: "",
        vda_version: "",
        headquarter: [],
      };

      // If location is provided, override locationtype
      if (props.location?.value) {
        baseForm.locationtype = [
          { value: props.location.value, label: props.location.value },
        ];
      }

      setFormData(baseForm);
      setFieldErrors({});
      setIsSubmitted(false);
      setUrl(null);
    }
  }, [props.showModal, props.location]);

  useEffect(() => {
    // Set assessment type options when level changes
    setDefaultAssessmentTypes(
      defaultAssessmentTypesMap[formData.assessment_level?.value] || []
    );
  }, [formData.assessment_level]);

  useEffect(() => {
    // Sync category with updated assessment types
    if (defaultAssessmentTypes.length > 0) {
      setFormData((prev) => ({
        ...prev,
        category: [...defaultAssessmentTypes],
      }));
    }
  }, [defaultAssessmentTypes]);

  useEffect(() => {
    // Fetch Country and Headquarter data in parallel
    const fetchInitialData = async () => {
      try {
        const [countryRes, hqRes] = await Promise.all([
          CustomAxios.get(
            "/api/countries/codes"
          ),
          CustomAxios.get(`${baseurl}/${initURL}/tisax/getHeadquarters`),
        ]);

        setCountryData(
          countryRes.data.data.map((country) => ({
            value: country.name,
            label: country.name,
          }))
        );

        setHeadquarterData(
          hqRes.data.map((item) => ({
            value: item._id,
            label: item.location_id,
          }))
        );
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

 useEffect(() => {
   if (!isEditMode) return;
   setIsLoading(true);

   const finalize = (record) => {
     // map whatever `record` has into your formData shape:
     setFormData({
       company_name: record.company_name || "",
       company_address: record.company_address || "",
       tisax_scopeid: record.tisax_scopeid || "",
       DnBDUNS_No: record.DnBDUNS_No || "",
       assessment_date: record.assessment_date?.split("T")[0] || "",
       contact_person_name: record.contact_person_name || "",
       contact_phone_number: record.contact_phone_number || "",
       contact_email: record.contact_email || "",
       creator_name: record.creator_name || "",
       locationtype: [
         { value: record.locationtype, label: record.locationtype },
       ],
       location_id: record.location_id || "",
       country: { value: record.country, label: record.country },
       category: (record.category || []).map((c) => ({ value: c, label: c })),
       assessment_level: {
         value: record.assessment_level,
         label: record.assessment_level,
       },
       vda_version: { value: record.vda_version, label: record.vda_version },
       headquarter: record.headquarter || {},
       // if you want to preload the assign/deadline into the form:
       assignDate: record.assignDate || "",
       endDate: record.deadline || "",
       signature: null, // we’ll handle the URL separately
     });
     if (record.signature_file_url) {
       setUrl(record.signature_file_url);
     }
     setIsLoading(false);
   };

   const handleErr = (e) => {
     console.error(e);
     toastError("Failed to load record");
     setIsLoading(false);
   };

   (async () => {
     try {
       let record = {};
       if (role === "Admin") {
         const resp = await CustomAxios.get(
           `${baseurl}/${initURL}/${segment}/${id}` +
             (isAudit && vda_type
               ? `?vda_type=${encodeURIComponent(vda_type)}`
               : "")
         );
         record = resp.data;
       } else if (role === "Employee") {
         const list = (
           await CustomAxios.get(
             `${baseurl}/${initURL}/assign-tisax-task/employee-assigned-tasks`
           )
         ).data;
         record = (list.find((l) => l._id === rootId) || {}).locationId || {};
       } else if (role === "Reviewer") {
         const resp = await CustomAxios.get(
           `${baseurl}/${initURL}/assign-tisax-task/reviewer-assigned-tasks/${rootId}`
         );
         record = resp.data.locationId || {};
       } else if (role === "Assigner") {
         const list = (
           await CustomAxios.get(
             `${baseurl}/${initURL}/assign-tisax-task/assigner-assigned-tasks`
           )
         ).data;
         record = (list.find((l) => l._id === rootId) || {}).locationId || {};
       } else {
         throw new Error(`Unknown role ${role}`);
       }
       finalize(record);
     } catch (e) {
       handleErr(e);
     }
   })();
 }, [isEditMode, id, rootId, role, segment, vda_type, isAudit]);


  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Loader />
        </div>
      ) : (
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
                  <SelectDropdown
                    name="vda_version"
                    isDisabled={isEditMode}
                    value={formData.vda_version}
                    options={[
                      { value: "5.1", label: "ISA 5.1" },
                      { value: "6.0.3", label: "ISA 6.0.3" },
                    ]}
                    onChange={(selectedOption) =>
                      setFormData((prev) => ({
                        ...prev,
                        vda_version: selectedOption,
                      }))
                    }
                    placeholder="Select ISA Version"
                  />
                  {fieldErrors.message?.["0"]?.vda_version && (
                    <span className="text-red-500 text-xs">
                      {fieldErrors.message["0"].vda_version}
                    </span>
                  )}
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
                    className={`w-full p-2 border ${
                      isSubmitted && fieldErrors.company_name
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-sm text-sm`}
                    required
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
                    required
                    name="company_address"
                    value={formData.company_address}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${
                      isSubmitted && fieldErrors.company_name
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
                  <SelectDropdown
                    name="locationtype"
                    value={formData.locationtype?.[0]}
                    options={TisaxLocationTypeOptions}
                    onChange={(option) =>
                      handleOptionsChange(
                        { value: option.value, label: option.label },
                        "locationtype"
                      )
                    }
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
                    <SelectDropdown
                      name="headquarter"
                      value={
                        headquarterData.find(
                          (opt) =>
                            opt.value === formData.headquarter?.headquarterId
                        ) || null
                      }
                      options={headquarterData}
                      onChange={(option) =>
                        handleOptionsChange(option, "headquarter")
                      }
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
                    required
                    type="string"
                    name="location_id"
                    value={formData.location_id}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${
                      isSubmitted && fieldErrors.company_name
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
                  <SelectDropdown
                    name="country"
                    value={formData.country}
                    options={countryData || []}
                    onChange={(option) =>
                      handleOptionsChange(option, "country")
                    }
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
                    required
                    type="string"
                    name="tisax_scopeid"
                    value={formData.tisax_scopeid}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${
                      isSubmitted && fieldErrors.company_name
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
                  <SelectDropdown
                    name="assessment_level"
                    value={formData.assessment_level}
                    options={assessmentLevelOptions}
                    onChange={(option) =>
                      handleOptionsChange(option, "assessment_level")
                    }
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
                  <SelectDropdown
                    name="category"
                    value={formData.category}
                    options={
                      defaultAssessmentTypes.length
                        ? defaultAssessmentTypes
                        : assessmentTypeOptions
                    }
                    isMulti={true}
                    isDisabled={true}
                    onChange={(options) =>
                      handleOptionsChange(options, "category")
                    }
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
                    required
                    type="string"
                    name="DnBDUNS_No"
                    value={formData.DnBDUNS_No}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${
                      isSubmitted && fieldErrors.company_name
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
                    required
                    type="date"
                    name="assessment_date"
                    value={formData.assessment_date}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${
                      isSubmitted && fieldErrors.company_name
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
                    required
                    type="text"
                    name="contact_person_name"
                    value={formData.contact_person_name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${
                      isSubmitted && fieldErrors.company_name
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
                    required
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
                    className={`w-full p-2 border ${
                      fieldErrors.message?.["0"]?.contact_phone_number
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
                    required
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${
                      isSubmitted && fieldErrors.company_name
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
                    required
                    type="text"
                    name="creator_name"
                    value={formData.creator_name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${
                      isSubmitted && fieldErrors.company_name
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
                      required
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
                      required
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
                          <Image
                            src={url}
                            alt="Signature Preview"
                            width={150}
                            height={100} // you can adjust this based on your preview size
                            className="max-w-full h-auto border border-gray-300 object-contain"
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
                        className={`focus:outline-none ${
                          isButtonDisabled
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
                        required
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
                          <Image
                            src={URL.createObjectURL(formData.signature)}
                            alt="Image Preview"
                            width={150}
                            height={100} // You can tweak the height
                            unoptimized
                            className="max-w-full h-auto border border-gray-300 object-contain"
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
              </div>

              {fieldErrors.message && fieldErrors.message["0"]?.signature && (
                <span className="text-red-500 text-xs">
                  {fieldErrors.message["0"]["signature"]}
                </span>
              )}

              {/* Submit button, only enabled if signature is saved */}
              <div className="mt-4 flex justify-center">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-700 text-white"
                >
                  {isEditMode ? "Update Form" : "Submit Form"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default TisaxCover;
