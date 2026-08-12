import React, { useEffect, useState, forwardRef } from "react";
import { useRef } from "react";
import CustomAxios from "@/config/CustomAxios";
import {
  Headquarter,
  Sublocation,
  baseurl,
  initURL,
  vdaVersionOptions,
} from "@/config/config";
import { useRouter } from "next/router";
import SignatureCanvas from "react-signature-canvas";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setImportCoverData } from "@/store/SliceComponent/ImportSaveSlice";
import { toast } from "react-toastify";
import SelectDropdown from "@/components/ui/SelectDropdown";
import { AiOutlineClear, AiOutlineSave } from "react-icons/ai";

const ImportCover = React.forwardRef(({ handleAssessmentLevelChange }, ref) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { vda_type, assessment_level, id, vda_version } = router.query;

  const [formData, setFormData] = useState({ vda_version: vda_version });
  const [disablefeild, setDisableFeild] = useState(false);
  const [countryData, setCountryData] = useState(null);
  const [headquarterData, setHeadquarterData] = useState([]);
  const [url, setUrl] = useState();
  const [isCreateSignatureVisible, setIsCreateSignatureVisible] =
    useState(true);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [defaultAssessmentTypes, setDefaultAssessmentTypes] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previousAssessmentLevel, setPreviousAssessmentLevel] = useState(
    formData.assessment_level
  );
  const [selectedAssessmentLevel, setSelectedAssessmentLevel] = useState(
    assessment_level === "AL3" ? "AL3" : "AL2"
  );
  const [fieldErrors, setFieldErrors] = useState({});

  const alevel = assessment_level;
  const signCanvasRef = useRef(null); // Use useRef to handle the signature canvas ref

  const validateform = (response, componentName) => {
    toast.error(`Errors are shown in ${componentName}`);
    const errorData = response.data.errors;
    if (errorData) {
      const err = errorData.message;
      if (
        typeof err === "string" &&
        err.trim() === "Please Upload Signature File."
      ) {
        // toast.error(err);
      } else {
        // Handle other cases
        const fieldErrors = {};
        err.forEach((error) => {
          Object.entries(error).forEach(([fieldName, errorMessage]) => {
            fieldErrors[fieldName] = errorMessage;
          });
        });
        setFieldErrors(fieldErrors); // Update field errors state
      }
    }
  };

  const handleChange = (selectedOption) => {
    // your existing code
    const newLevel = selectedOption.value;
    setSelectedAssessmentLevel(newLevel);

    if (alevel === "AL2" && newLevel === "AL3") {
      // Show a toast message indicating that changing from AL2 to AL3 is not allowed
      toast.error("You cannot change from AL2 to AL3.");
    } else {
      // setSelectedAssessmentLevel(newLevel);
      handleOptionsChange(selectedOption, "assessment_level");
      handleAssessmentLevelChange(selectedOption);
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
    if (vda_version) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        vda_version: vda_version,
      }));
    }
  }, [vda_version]);

  useEffect(() => {
    const selectedValues = [...defaultAssessmentTypes];
    if (selectedValues.length > 0) {
      setFormData({
        ...formData,
        category: selectedValues,
      });
    }
  }, [defaultAssessmentTypes]);

  const handleInputChange = (e) => {
    const { name, type, value } = e.target;
    if (type === "file") {
      const file = e.target.files[0];
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];

      // Validate and preview only if the file type is valid
      if (file && validTypes.includes(file.type)) {
        setFormData({
          ...formData,
          [name]: file,
        });
        setUrl(URL.createObjectURL(file)); // Show preview
      } else {
        // Show error message if the file type is not allowed
        toast.error("Please upload a valid image file (PNG, JPEG, JPG).");
        setFormData({
          ...formData,
          [name]: null,
        });
        setUrl(null);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleVdaVersionChange = (selectedOptions) => {
    setFieldErrors((prevFieldErrors) => ({
      ...prevFieldErrors,
      vda_version: selectedOptions ? "" : "Field should not be empty",
    }));

    setFormData({
      ...formData,
      vda_version: selectedOptions.value,
    });
  };

  const handleOptionsChange = (selectedOptions, fieldName) => {
    // Clear the error message if the selectedOptions are not empty
    setFieldErrors((prevFieldErrors) => ({
      ...prevFieldErrors,
      [fieldName]: selectedOptions ? "" : "Field should not be empty",
    }));

    if (fieldName === "assessment_level") {
      const newAssessmentLevel = selectedOptions.value;
      setPreviousAssessmentLevel(newAssessmentLevel);
      // Update formData with the new selectedOptions
      setFormData({
        ...formData,
        [fieldName]: selectedOptions,
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

  const defaultValuesResponse = useSelector((state) => state.data.cover);

  useEffect(() => {
    const fetchHeadquarters = async () => {
      if (formData.locationtype?.value === "Sublocation") {
        try {
          const response = await CustomAxios.get(
            `${baseurl}/${initURL}/tisax-audit/getHeadquarters`
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
      }
    };

    fetchHeadquarters();
  }, [formData.locationtype]);

  //This useeffect is for time of file import values in router defaultValuesResponse
  useEffect(() => {
    if (!isHydrated) {
      setIsHydrated(true);
      return;
    }
    const fetchData = async () => {
      try {
        setFormData((prevFormData) => ({
          ...prevFormData,
          company_name: defaultValuesResponse?.["Company / Organization"] || "",
          company_address: defaultValuesResponse?.["Address"] || "",
          tisax_scopeid: defaultValuesResponse?.["Scope/TISAX Scope ID"] || "",
          DnBDUNS_No: defaultValuesResponse?.["D&B D-U-N-S® No"] || "",
          assessment_date:
            defaultValuesResponse?.["Date of the assessment"]?.split("/")[0] <=
            12
              ? new Date(defaultValuesResponse["Date of the assessment"])
                  ?.toLocaleDateString("en-CA", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                  .replace(/\//g, "-")
              : "",
          contact_person_name: defaultValuesResponse?.["Contact person"] || "",
          contact_phone_number:
            defaultValuesResponse?.["Telephone number"] || "",
          contact_email: defaultValuesResponse?.["E-mail address"] || "",
          creator_name: defaultValuesResponse?.["Creator"] || "",
          location_id: defaultValuesResponse?.location_id || "",
          locationtype: defaultValuesResponse?.locationTypeOptions || "",
          country:
            defaultValuesResponse?.countryTypeOptions !== undefined
              ? defaultValuesResponse.countryTypeOptions
              : "",
          // vda_version: defaultValuesResponse?.vda_version !== undefined ? defaultValuesResponse.vdaVersionOptions : "",
          vda_version:
            prevFormData.vda_version ||
            (defaultValuesResponse?.vda_version !== undefined
              ? defaultValuesResponse.vda_version
              : ""),
          // headquarter: defaultValuesResponse?.countryTypeOptions !== undefined ? defaultValuesResponse.countryTypeOptions : "",

          assessment_level:
            defaultValuesResponse?.assessment_levelOptions || "",
          signature: defaultValuesResponse?.signature_file_url,
        }));
        setUrl(defaultValuesResponse?.signature_file_url);
        // Fetch country data
        const countryResponse = await CustomAxios.get(
          '/api/countries/codes'
        );
        const countryOptions = countryResponse.data.data?.map((country) => ({
          value: country.name,
          label: country.name,
        }));
        setCountryData(countryOptions);
      } catch (error) {}
    };
    fetchData();
    // if (vda_type) {
    //   setDisableFeild(true);
    // }
  }, [isHydrated, vda_type]);

  const locationOptions = [
    { value: Headquarter, label: Headquarter },
    { value: Sublocation, label: Sublocation },
  ];

  const handleCreateSignatureToggle = () => {
    setIsCreateSignatureVisible(!isCreateSignatureVisible);
    setIsButtonDisabled(false);
  };

  const handleFileUploadToggle = (e) => {
    setIsCreateSignatureVisible(e.target.value === "true");
    setFormData({ ...formData, signature: "" }); // Clear previous signature when switching
  };

  const handleGenerate = () => {
    const signatureDataURL = signCanvasRef.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
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
    setFormData({ ...formData, signature: signatureBlob });
    setUrl(signatureDataURL); // Display signature
    setIsButtonDisabled(true);
  };

  const handleClear = () => {
    signCanvasRef.current.clear();
    setUrl("");
    setIsButtonDisabled(false);
  };

  //function for importcover edit patch
  const handleSubmit = async (e) => {
    e.preventDefault();
    const tisaxnewformData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      switch (key) {
        case "signature":
          // if (typeof value !== "string") {
          //   tisaxnewformData?.append("signature", value, "signature.png");
          // }
          if (
            typeof value !== "string" &&
            value !== null &&
            value instanceof Blob
          ) {
            tisaxnewformData.append("signature", value, "signature.png");
          }
          break;
        case "locationtype":
          const typeValue = Array.isArray(value)
            ? value[0]?.value
            : value?.value;
          tisaxnewformData.append("locationtype", typeValue);
          break;
        case "country":
          const countryValue = Array.isArray(value)
            ? value[0]?.value
            : value?.value;
          tisaxnewformData.append("country", countryValue);
          break;
        case "headquarter":
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
        default:
          tisaxnewformData.append(key, value);
      }
    });

    try {
      const response = await CustomAxios.patch(
        // baseurl + `/${initURL}/tisax/${id}`,
        baseurl +
          `/${initURL}/tisax-audit/UpdateImportCover/${id}?vda_type=${vda_type}`,
        tisaxnewformData, // Use the FormData object
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        setIsEditing(false);
        setDisableFeild(true);
        setIsButtonDisabled(false);
        toast.success("data submitted successfully!");
        // Clear field errors after successful submission
        setFieldErrors({});
        // After successful submission, update the URL without reloading the page
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
        validateform(response, "Cover");
      }
    } catch (error) {
      toast.error(error.response.data.errors.message);
      console.error(error.customData, "Error sending data:", error);
    }
  };

  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

  const handleButtonClickEdit = () => {
    setIsEditing(true);
    setDisableFeild(false);
  };
  const handleButtonClickEditCancel = () => {
    setIsEditing(false);
    setDisableFeild(true);
  };

  //this useEffect is for the import Edit GET API
  useEffect(() => {
    const { id } = router.query;
    const fetchData = async (id) => {
      try {
        const response = await CustomAxios.get(
          `${baseurl}/${initURL}/tisax-audit/${id}?vda_type=${vda_type}` // Replace with your actual API endpoint
        );
        const responseData = response.data;

        let headquarterOptions = [];
        if (
          responseData.locationtype === "Sublocation" &&
          responseData.headquarter
        ) {
          headquarterOptions = [
            {
              value: responseData.headquarter.headquarterId,
              label: responseData.headquarter.headquarterLocationId,
            },
          ];
        }

        setHeadquarterData(headquarterOptions);

        const locationTypeOptions = [
          {
            value: responseData.locationtype,
            label: responseData.locationtype,
          },
        ];

        const countryTypeOptions = [
          {
            value: responseData.country,
            label: responseData.country,
          },
        ];
        const categoryOptions = response.data.category?.map((category) => ({
          value: category,
          label: category,
        }));
        const assessment_levelOptions = [
          {
            value: responseData.assessment_level,
            label: responseData.assessment_level,
          },
        ];
        const formattedAssessmentDate = response.data.assessment_date
          ? new Date(response.data.assessment_date).toISOString().split("T")[0]
          : "";

        setFormData({
          company_name: responseData.company_name || "",
          vda_version: responseData.vda_version || "",
          company_address: responseData.company_address || "",
          tisax_scopeid: responseData.tisax_scopeid || "",
          DnBDUNS_No: responseData.DnBDUNS_No || "",
          assessment_date: formattedAssessmentDate,
          contact_person_name: responseData.contact_person_name || "",
          contact_phone_number: responseData.contact_phone_number || "",
          contact_email: responseData.contact_email || "",
          creator_name: responseData.creator_name || "",
          location_id: responseData.location_id || "",
          locationtype: locationTypeOptions || "", // Assuming there's a field named 'locationtype' in the API response
          country: countryTypeOptions[0].value , // Assuming there's a field named 'country' in the API response
          assessment_level: assessment_levelOptions[0].value , // Assuming there's a field named 'assessment_level' in the API response
          category: categoryOptions || [], // Assuming 'category' is an array in the API response
          signature: responseData.signature_file_url || "",

          ...(responseData.locationtype === "Sublocation" &&
          responseData.headquarter
            ? {
                headquarter: {
                  headquarterId: responseData.headquarter.headquarterId,
                  headquarterLocationId:
                    responseData.headquarter.headquarterLocationId,
                },
              }
            : {}),
        });

        setUrl(responseData.signature_file_url);
        // Fetch country data
        const countryResponse = await CustomAxios.get(
          '/api/countries/codes'
        );
        const countryOptions = countryResponse.data.data?.map((country) => ({
          value: country.name,
          label: country.name,
        }));
        setCountryData(countryOptions);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (id) {
      fetchData(id);
    }
  }, [router]);

  useEffect(() => {
    handleSavemain();
  }, [formData]);

  const handleSavemain = () => {
    const tisaxnewformData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      switch (key) {
        case "signature":
          if (
            typeof value !== "string" &&
            value !== undefined &&
            value instanceof Blob
          ) {
            tisaxnewformData.append("signature", value, "signature.png");
          }
          break;
        case "locationtype":
          tisaxnewformData.append("locationtype", value?.value);
          break;
        case "country":
          let countryValue = Array.isArray(value)
            ? value[0]?.value
            : value?.value;
          if (!countryValue) {
            countryValue = ""; // Set to empty string
          }
          tisaxnewformData.append("country", countryValue);
          break;

        case "headquarter":
          // Only append headquarter data if locationtype is sublocation
          if (formData.locationtype.value === "Sublocation") {
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
        default:
          tisaxnewformData.append(key, value);
      }
    });
    const extractedData = {};
    for (let pair of tisaxnewformData.entries()) {
      extractedData[pair[0]] = pair[1];
    }
    dispatch(setImportCoverData(extractedData));
  };

  // Forward the ref to the outermost element or to the component itself
  React.useImperativeHandle(ref, () => ({
    validateform,
  }));

  return (
    <div className="p-4">
      <div className="p-4 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6">
          Information Security Assessment Form
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                VDA Version Type:
              </label>
              <SelectDropdown
                name="vda_version"
                options={vdaVersionOptions}
                value={vdaVersionOptions.find(
                  (option) => option.value === formData.vda_version
                )}
                onChange={handleVdaVersionChange}
                isDisabled={disablefeild}
                className="mt-1"
              />

              <span className="text-red-600 text-xs">
                {fieldErrors.vda_version}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company/Organization:
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                className={`mt-1 w-full border ${
                  formData?.company_name?.trim() === ""
                    ? "border-red-600"
                    : "border-gray-300"
                } rounded-md shadow-sm`}
                disabled={disablefeild}
              />
              <span className="text-red-600 text-xs">
                {fieldErrors.company_name}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address:
              </label>
              <input
                type="text"
                name="company_address"
                value={formData.company_address}
                onChange={handleInputChange}
                className={`mt-1 w-full border ${
                  formData?.company_address?.trim() === ""
                    ? "border-red-600"
                    : "border-gray-300"
                } rounded-md shadow-sm`}
                disabled={disablefeild}
              />
              <span className="text-red-600 text-xs">
                {fieldErrors.company_address}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location:
              </label>
              <SelectDropdown
                name="locationtype"
                options={locationOptions}
                value={formData.locationtype}
                onChange={(selectedOptions) =>
                  handleOptionsChange(selectedOptions, "locationtype")
                }
                isDisabled={disablefeild}
                className="mt-1"
              />

              <span className="text-red-600 text-xs">
                {fieldErrors.locationtype}
              </span>
            </div>
            {formData.locationtype?.value === "Sublocation" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Headquarter:
                </label>
                <SelectDropdown
                  name="headquarter"
                  options={headquarterData}
                  value={headquarterData.find(
                    (option) =>
                      option.value === formData.headquarter?.headquarterId
                  )}
                  onChange={(selectedOptions) =>
                    handleOptionsChange(selectedOptions, "headquarter")
                  }
                  isDisabled={disablefeild}
                  className="mt-1"
                />

                <span className="text-red-600 text-xs">
                  {fieldErrors.headquarter}
                </span>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location ID:
              </label>
              <input
                type="text"
                name="location_id"
                value={formData.location_id}
                onChange={handleInputChange}
                className={`mt-1 w-full border ${
                  formData?.location_id?.trim() === ""
                    ? "border-red-600"
                    : "border-gray-300"
                } rounded-md shadow-sm`}
                disabled={disablefeild}
              />
              <span className="text-red-600 text-xs">
                {fieldErrors.location_id}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country:
              </label>
              <SelectDropdown
                name="country"
                options={countryData}
                value={formData.country}
                onChange={(selectedOptions) =>
                  handleOptionsChange(selectedOptions, "country")
                }
                isDisabled={disablefeild}
                className="mt-1"
              />

              <span className="text-red-600 text-xs">
                {fieldErrors.country}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Scope/TISAX Scope ID:
              </label>
              <input
                type="text"
                name="tisax_scopeid"
                value={formData.tisax_scopeid}
                onChange={handleInputChange}
                className={`mt-1 w-full border ${
                  formData?.tisax_scopeid?.trim() === ""
                    ? "border-red-600"
                    : "border-gray-300"
                } rounded-md shadow-sm`}
                disabled={disablefeild}
              />
              <span className="text-red-600 text-xs">
                {fieldErrors.tisax_scopeid}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assessment Level:
              </label>
              <SelectDropdown
                name="assessment_level"
                options={assessmentLevelOptions}
                value={formData.assessment_level}
                onChange={(selectedOptions) =>
                  handleOptionsChange(selectedOptions, "assessment_level")
                }
                isDisabled={disablefeild}
                className="mt-1"
              />

              <span className="text-red-600 text-xs">
                {fieldErrors.assessment_level}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assessment Type:
              </label>
              <SelectDropdown
                name="category"
                options={assessmentTypeOptions}
                value={formData.category}
                onChange={(selectedOptions) =>
                  handleOptionsChange(selectedOptions, "category")
                }
                isDisabled={disablefeild}
                isMulti={true}
                className="mt-1"
              />

              <span className="text-red-600 text-xs">
                {fieldErrors.category}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project Creator:
              </label>
              <input
                type="text"
                name="creator_name"
                value={formData.creator_name}
                onChange={handleInputChange}
                className={`mt-1 w-full border ${
                  formData?.creator_name?.trim() === ""
                    ? "border-red-600"
                    : "border-gray-300"
                } rounded-md shadow-sm`}
                disabled={disablefeild}
              />
              <span className="text-red-600 text-xs">
                {fieldErrors.creator_name}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                D&B D-U-N-S No:
              </label>
              <input
                type="text"
                name="DnBDUNS_No"
                value={formData.DnBDUNS_No}
                onChange={handleInputChange}
                className={`mt-1 w-full border ${
                  formData?.DnBDUNS_No?.trim() === ""
                    ? "border-red-600"
                    : "border-gray-300"
                } rounded-md shadow-sm`}
                disabled={disablefeild}
              />
              <span className="text-red-600 text-xs">
                {fieldErrors.DnBDUNS_No}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of Assessment:
              </label>
              <input
                type="date"
                name="assessment_date"
                value={formData.assessment_date}
                onChange={handleInputChange}
                className={`mt-1 w-full border ${
                  formData?.assessment_date?.trim() === ""
                    ? "border-red-600"
                    : "border-gray-300"
                } rounded-md shadow-sm`}
                disabled={disablefeild}
              />
              <span className="text-red-600 text-xs">
                {fieldErrors.assessment_date}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Person:
              </label>
              <input
                type="text"
                name="contact_person_name"
                value={formData.contact_person_name}
                onChange={handleInputChange}
                className={`mt-1 w-full border ${
                  formData?.contact_person_name?.trim() === ""
                    ? "border-red-600"
                    : "border-gray-300"
                } rounded-md shadow-sm`}
                disabled={disablefeild}
              />
              <span className="text-red-600 text-xs">
                {fieldErrors.contact_person_name}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Telephone Number:
              </label>
              <input
                type="text"
                name="contact_phone_number"
                value={formData.contact_phone_number}
                onChange={handleInputChange}
                className={`mt-1 w-full border ${
                  formData?.contact_phone_number?.trim() === ""
                    ? "border-red-600"
                    : "border-gray-300"
                } rounded-md shadow-sm`}
                disabled={disablefeild}
              />
              <span className="text-red-600 text-xs">
                {fieldErrors.contact_phone_number}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address:
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleInputChange}
                className={`mt-1 w-full border ${
                  formData?.contact_email?.trim() === ""
                    ? "border-red-600"
                    : "border-gray-300"
                } rounded-md shadow-sm`}
                disabled={disablefeild}
              />
              <span className="text-red-600 text-xs">
                {fieldErrors.contact_email}
              </span>
            </div>
            {/* Signature Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project Signature:
              </label>

              {/* Display the existing signature when not editing */}
              {/* {!isEditing && formData.signature && (
                  <img
                    src={originalSignature || formData.signature}
                    alt="Original Signature"
                    className="max-w-[200px] mt-2"
                  />
                )} */}

              {/* Editing mode for signature */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="radio"
                    id="radio-create-signature"
                    value={true}
                    checked={isCreateSignatureVisible}
                    onChange={handleCreateSignatureToggle}
                    disabled={disablefeild}
                  />
                  <label htmlFor="radio-create-signature">
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
                  />
                  <label htmlFor="radio-file-upload">File Upload</label>
                </div>
              </div>

              {/* Signature Canvas or File Input */}
              {isCreateSignatureVisible ? (
                <div>
                  <SignatureCanvas
                    penColor="black"
                    canvasProps={{
                      width: 300,
                      height: 100,
                      className: "sigCanvas border border-gray-400 px-4",
                    }}
                    ref={signCanvasRef}
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
                    type="button"
                    className={`focus:outline-none ${
                      isButtonDisabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-500 hover:text-blue-700"
                    }`}
                    onClick={handleGenerate}
                    disabled={disablefeild || isButtonDisabled}
                  >
                    <AiOutlineSave size={24} /> {/* Save Icon */}
                  </button>
                  <br />
                </div>
              ) : (
                <input
                  type="file"
                  name="signature"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleInputChange}
                  className="mt-2"
                  disabled={disablefeild}
                />
              )}
              {/* Preview saved or uploaded signature */}
              {url && (
                <img
                  src={url}
                  alt="Signature Preview"
                  className="max-w-[200px] mt-2"
                />
              )}
              {/* Preview uploaded or saved signature */}
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

              {fieldErrors.signature && (
                <span className="text-red-600 text-xs">
                  {fieldErrors.signature}
                </span>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
});

ImportCover.displayName = "ImportCover";
export default ImportCover;
