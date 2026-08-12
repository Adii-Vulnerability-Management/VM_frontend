import React, { useEffect, useState } from "react";
import Select from "react-select";
import { baseurl, initURL } from "../../../../BaseUrl";
import CustomAxios from "@/globalcomponents/CustomAxios";

function AuditTisaxForms(props) {
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
    locationtype: [props.location],
    location_id: "",
    country: "",
    category: [],
  });

  const [countryData, setCountryData] = useState(null);

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
          // Handle file preview if needed
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
    const selectedValues = Array.isArray(selectedOptions)
      ? [...selectedOptions]
      : selectedOptions;
    setFormData({
      ...formData,
      [fieldName]: selectedValues,
    });
  };

  const assessmentTypeOptions = [
    { value: "Information Security PL high (AL2)", label: "Information Security PL high (AL2)" },
    { value: "Information Security PL very high (AL3)", label: "Information Security PL very high (AL3)" },
    { value: "Prototype Protection PL high (AL3)", label: "Prototype Protection PL high (AL3)" },
    { value: "Data Protection PL high (AL2)", label: "Data Protection PL high (AL2)" },
    { value: "Data Protection PL very high (AL3)", label: "Data Protection PL very high (AL3)" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await CustomAxios.get(
          '/api/countries/codes'
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    let tisaxformData = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "locationtype") {
        tisaxformData[`locationtype`] = value[0]?.value;
      } else if (key === "country") {
        tisaxformData[`country`] = value?.value;
      } else if (key === "category") {
        value.forEach((assessment, index) => {
          tisaxformData[`category[${index}]`] = assessment.value;
        });
      } else {
        tisaxformData[`${key}`] = value;
      }
    });
    try {
      const response = await CustomAxios.post(
        baseurl + `/${initURL}/tisax`,
        tisaxformData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 201) {
        setFormData({
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
          locationtype: [props.location],
          location_id: "",
          country: "",
          category: [],
        });
        props.setShowModal(false);
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-full">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">
                <span className="text-red-500">*</span> Location:
              </label>
              <Select
                name="locationtype"
                isDisabled
                value={formData.locationtype}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                <span className="text-red-500">*</span> Location ID:
              </label>
              <input
                type="text"
                name="location_id"
                value={formData.location_id}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                <span className="text-red-500">*</span> Country:
              </label>
              <Select
                name="country"
                options={countryData}
                value={formData.country}
                onChange={(selectedOptions) => handleOptionsChange(selectedOptions, "country")}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Address:
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company_address"
                value={formData.company_address}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Company/Organization:
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                <span className="text-red-500">*</span> Assessment Type:
              </label>
              <Select
                name="category"
                isMulti
                options={assessmentTypeOptions}
                value={formData.category}
                onChange={(selectedOptions) => handleOptionsChange(selectedOptions, "category")}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm mb-1">
                Scope/TISAX Scope ID:
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tisax_scopeid"
                value={formData.tisax_scopeid}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                D&B D-U-N-S No:
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="DnBDUNS_No"
                value={formData.DnBDUNS_No}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm mb-1">
                Date of Assessment:
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="assessment_date"
                value={formData.assessment_date}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Contact Person:
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contact_person_name"
                value={formData.contact_person_name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm mb-1">
                <span className="text-red-500">*</span> Telephone Number:
              </label>
              <input
                type="text"
                name="contact_phone_number"
                value={formData.contact_phone_number}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                <span className="text-red-500">*</span> Email Address:
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm mb-1">
                <span className="text-red-500">*</span> Project Creator:
              </label>
              <input
                type="text"
                name="creator_name"
                value={formData.creator_name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                <span className="text-red-500">*</span> Project Signature:
              </label>
              <input
                type="file"
                name="signature"
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />

              {formData.signature && (
                <img
                  src={URL.createObjectURL(formData.signature)}
                  alt="Preview"
                  className="mt-2 max-w-xs"
                />
              )}
            </div>
          </div>

          <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm rounded-md">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuditTisaxForms;
