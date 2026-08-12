import React, { useEffect, useState } from "react";
import Link from "next/link";
import Select from "react-select";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL, vdaVersionOptions } from "../../../../../BaseUrl";
import { useRouter } from "next/router";

function AuditTisaxCover(props) {
  const router = useRouter();

  const [fileurl, setFileurl] = useState(null);
  const [formData, setFormData] = useState({});
  const [disablefeild, setDisableFeild] = useState(true);
  const [countryData, setCountryData] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const handleInputChange = (e) => {
    const { name, type, value } = e.target;

    if (type === "file") {
      const file = e.target.files[0];

      setFormData({
        ...formData,
        [name]: file,
      });

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          // You can set the preview image URL in the state if needed
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleOptionsChange = (selectedOptions, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: selectedOptions,
    });

    if (fieldName === "category") {
      const selectedValues = [...selectedOptions];
      setFormData({
        ...formData,
        [fieldName]: selectedValues,
      });
    }
  };

  const assessmentTypeOptions = [
    { value: "Information Security", label: "Information Security" },
    { value: "Prototype Protection", label: "Prototype Protection" },
    { value: "Data Protection", label: "Data Protection" },
  ];

  const { id } = router.query;
  useEffect(() => {
    if (!isHydrated) {
      setIsHydrated(true);
      return;
    }
    const fetchData = async (id) => {
      try {
        const defaultValuesResponse = await CustomAxios.get(
          `${baseurl}/${initURL}/tisax/${id}`
        );

        setFileurl(defaultValuesResponse.data.signature_file_url);
        const locationTypeOptions = [
          {
            value: defaultValuesResponse.data.locationtype,
            label: defaultValuesResponse.data.locationtype,
          },
        ];
        const contryTypeOptions = [
          {
            value: defaultValuesResponse.data.country,
            label: defaultValuesResponse.data.country,
          },
        ];
        const categoryOptions = defaultValuesResponse.data.category.map(
          (category) => ({
            value: category,
            label: category,
          })
        );

        const assessment_levelOptions = [
          {
            value: defaultValuesResponse.data.assessment_level,
            label: defaultValuesResponse.data.assessment_level,
          },
        ];

        const formattedAssessmentDate = defaultValuesResponse.data.assessment_date
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
          assessment_level: assessment_levelOptions || "",
          contact_person_name:
            defaultValuesResponse.data.contact_person_name || "",
          contact_phone_number:
            defaultValuesResponse.data.contact_phone_number || "",
          contact_email: defaultValuesResponse.data.contact_email || "",
          creator_name: defaultValuesResponse.data.creator_name || "",
          location_id: defaultValuesResponse.data.location_id || "",
          locationtype: locationTypeOptions || "",
          country: contryTypeOptions || "",
          category: categoryOptions || [],
          signature: defaultValuesResponse.data.signature_file_url,
          vda_version: {
            value: defaultValuesResponse.data.vda_version,
            label: defaultValuesResponse.data.vda_version,
          },
        }));

        const countryResponse = await CustomAxios.get(
          '/api/countries/codes'
        );
        const countryOptions = countryResponse.data.data.map((country) => ({
          value: country.name,
          label: country.name,
        }));
        setCountryData(countryOptions);
      } catch (error) {

      }
    };
    if (id) {
      fetchData(id);
    }
  }, [isHydrated, id]);

  const handleButtonClickEdit = () => {
    setDisableFeild(false);
  };

  const handleButtonClickEditCancel = () => {
    setDisableFeild(true);
  };

  const currentDate = new Date().toISOString().split("T")[0];

  return (
    <div className="p-4">
      <div className="p-4">
        <div className="mb-4 bg-white shadow-md rounded-lg p-6">
          <div className="text-xl font-semibold mb-4">Information Security Assessment Form</div>
          <form>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  VDA Version Type:
                </label>
                <Select
                  name="vda_version"
                  options={vdaVersionOptions}
                  value={formData.vda_version}
                  onChange={(selectedOptions) =>
                    handleOptionsChange(selectedOptions, "vda_version")
                  }
                  isDisabled={disablefeild}
                  className="mt-1 block w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location:
                </label>
                <Select
                  name="locationtype"
                  value={formData.locationtype}
                  isDisabled
                  className="mt-1 block w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location ID:
                </label>
                <input
                  type="text"
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={disablefeild}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country:
                </label>
                <Select
                  name="country"
                  options={countryData}
                  value={formData.country}
                  onChange={(selectedOptions) =>
                    handleOptionsChange(selectedOptions, "country")
                  }
                  isDisabled={disablefeild}
                  className="mt-1 block w-full"
                />
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={disablefeild}
                />
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={disablefeild}
                />
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={disablefeild}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assessment Level:
                </label>
                <Select
                  name="assessment_level"
                  options={[
                    { value: "AL2", label: "AL2" },
                    { value: "AL3", label: "AL3" },
                  ]}
                  value={formData.assessment_level}
                  onChange={(selectedOptions) =>
                    handleOptionsChange(selectedOptions, "assessment_level")
                  }
                  isDisabled={disablefeild}
                  className="mt-1 block w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assessment Type:
                </label>
                <Select
                  name="category"
                  isMulti
                  options={assessmentTypeOptions}
                  value={formData.category}
                  onChange={(selectedOptions) =>
                    handleOptionsChange(selectedOptions, "category")
                  }
                  isDisabled={disablefeild}
                  className="mt-1 block w-full"
                />
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={disablefeild}
                />
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  min={currentDate}
                  disabled={disablefeild}
                />
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={disablefeild}
                />
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={disablefeild}
                />
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={disablefeild}
                />
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={disablefeild}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project Signature:
                </label>
                {formData.signature && (
                  <img
                    src={formData.signature}
                    alt="Preview"
                    className="mt-2 max-w-xs"
                  />
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuditTisaxCover;
