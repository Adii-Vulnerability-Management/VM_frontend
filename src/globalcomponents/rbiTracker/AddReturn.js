import { useState } from "react";
import CustomAxios from "../CustomAxios";
import { toast } from "react-toastify";
import Loader from "@/globalcomponents/loader/Loader";
import { baseurl, initURL } from "../../../BaseUrl";

const AddReturn = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reportingEntityInitials: "",
    returnName: "",
    returnDescription: "",
    departmentConcerned: "",
    reportCode: "",
    detailsOfRelatedCirculars: "",
    frequency: "",
    reportingEntity: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "This field is required.";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    const payload = [
      {
        "Reporting Entity required to submit the return -Initials":
          formData.reportingEntityInitials,
        "Reporting Entity required to submit the return":
          formData.reportingEntity,
        "Return Name": formData.returnName,
        "Return Description": formData.returnDescription,
        "Details of Related Circulars": formData.detailsOfRelatedCirculars,
        Frequency: formData.frequency,
        "Department Concerned": formData.departmentConcerned,
        "Report Code": formData.reportCode,
      },
    ];
    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/rbi-tracking/submission-tracking`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Return details submitted successfully!");
        setFormData({
          reportingEntityInitials: "",
          returnName: "",
          returnDescription: "",
          departmentConcerned: "",
          reportCode: "",
          detailsOfRelatedCirculars: "",
          frequency: "",
          reportingEntity: "",
        });
      } else {
        toast.error("Failed to submit form");
      }
    } catch (error) {
      toast.error("An error occurred while submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold text-[#2B245C] mb-6">
        Add New Return Detail
      </h2>
      <div className="p-6 bg-[#F8F9FE] rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              key: "reportingEntityInitials",
              label: "Reporting Entity Initials",
            },
            { key: "returnName", label: "Return Name" },
            { key: "returnDescription", label: "Return Description" },
            { key: "departmentConcerned", label: "Department Concerned" },
            { key: "reportCode", label: "Report Code" },
            {
              key: "detailsOfRelatedCirculars",
              label: "Details of Related Circulars",
            },
            { key: "reportingEntity", label: "Reporting Entity" },
          ].map(({ key, label }) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                <span className="text-red-600">*</span> {label}
              </label>
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={handleInputChange}
                placeholder={`Enter ${label}`}
                className={`p-2 border ${
                  errors[key] ? "border-red-600" : "border-gray-300"
                } rounded-md focus:ring focus:ring-blue-200`}
              />
              {errors[key] && (
                <span className="text-xs text-red-600">{errors[key]}</span>
              )}
            </div>
          ))}
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-[#2B245C]">
              <span className="text-red-600">*</span> Frequency
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
            >
              <option value="">Select Frequency</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Fortnightly">Fortnightly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Half-Yearly">Half-Yearly</option>
              <option value="Yearly">Yearly</option>
            </select>
            {errors.frequency && (
              <span className="text-xs text-red-600">{errors.frequency}</span>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[#1e284e] text-white px-8 py-2 rounded-md min-w-20 flex justify-center items-center"
          >
            {loading ? <Loader /> : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddReturn;
