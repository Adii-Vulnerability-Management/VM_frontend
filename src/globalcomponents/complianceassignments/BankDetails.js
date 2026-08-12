import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import { useState } from "react";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../BaseUrl";

const FrameworkDepartMentForm = ({ branchShow }) => {
  const [loading, setLoading] = useState(false);
  const [departmentFormData, setDepartmentFormData] = useState({
    departmentType: "",
    departmentHead: "",
    departmentContact: "",
    departmentEmail: "",
    departmentEmployees: "",
    departmentLocation: "",
    departmentCode: "",
    departmentFunctions: "",
  });

  const [errors, setErrors] = useState({});
  const departmentHandleInputChange = (e) => {
    const { name, value } = e.target;
    setDepartmentFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const validateDepartmentContact = (contact) => /^[0-9]{10}$/.test(contact);
  const validateDepartmentEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    Object.keys(departmentFormData).forEach((key) => {
      if (!departmentFormData[key]) {
        newErrors[key] = "This field is required.";
      }
    });

    if (
      departmentFormData.departmentContact &&
      !validateDepartmentContact(departmentFormData.departmentContact)
    ) {
      newErrors.departmentContact = "Contact must be a 10-digit number.";
    }

    if (
      departmentFormData.departmentEmail &&
      !validateDepartmentEmail(departmentFormData.departmentEmail)
    ) {
      newErrors.departmentEmail = "Invalid email format.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      setLoading(true);
      try {
        const response = await CustomAxios.post(
          `${baseurl}/${initURL}/rbi-tracking/create-department-details`,
          departmentFormData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          toast.success("Details Submitted successfully!");
          setDepartmentFormData({
            departmentType: "",
            departmentHead: "",
            departmentContact: "",
            departmentEmail: "",
            departmentEmployees: "",
            departmentLocation: "",
            departmentCode: "",
            departmentFunctions: "",
          });
        } else {
          toast.error("Failed to submit form");
        }
      } catch (error) {
        // Default error message
        let errorMessage =
          "An error occurred while submitting the form. Please try again.";

        if (error.response?.data?.message) {
          // If `message` is an array, use the first entry
          if (
            Array.isArray(error.response.data.message) &&
            error.response.data.message.length > 0
          ) {
            errorMessage = error.response.data.message[0];
          } else if (typeof error.response.data.message === "string") {
            // If `message` is a string, use it directly
            errorMessage = error.response.data.message;
          }
        }
        // Display the error message
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className=" font-bold text-[#2B245C]">Department Details</h2>
        </div>
        <form onSubmit={handleDepartmentSubmit} method="POST">
          <div className="p-6 bg-[#F8F9FE]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {/* Department Type */}
              <div className="flex flex-col lg:col-span-3">
                <label className="text-sm mb-1text-gray-700">
                  <span className="text-red-600 mr-1">*</span>Select Department
                </label>
                <select
                  name="departmentType"
                  value={departmentFormData.departmentType}
                  onChange={departmentHandleInputChange}
                  required
                  className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="" disabled selected>
                    Select a Department
                  </option>
                  <option value="Finance">Finance</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Operations">Operations</option>
                  <option value="IT">IT</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Risk Management">Risk Management</option>
                  <option value="Audit">Audit</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Treasury">Treasury</option>
                  <option value="Legal">Legal</option>
                  <option value="Retail Banking">Retail Banking</option>
                  <option value="Corporate Banking">Corporate Banking</option>
                  <option value="Wealth Management">Wealth Management</option>
                  <option value="Investment Banking">Investment Banking</option>
                  <option value="Credit and Loan Processing">
                    Credit and Loan Processing
                  </option>
                  <option value="Branch Operations">Branch Operations</option>
                  <option value="Security and Fraud Management">
                    Security and Fraud Management
                  </option>
                  <option value="Payments and Settlements">
                    Payments and Settlements
                  </option>
                  <option value="Training and Development">
                    Training and Development
                  </option>
                  <option value="Procurement">Procurement</option>
                  <option value="Administration">Administration</option>
                  <option value="Digital Banking">Digital Banking</option>
                  <option value="Public Relations">Public Relations</option>
                  <option value="Customer Analytics">Customer Analytics</option>
                  <option value="Insurance Services">Insurance Services</option>
                  <option value="Credit Card Services">
                    Credit Card Services
                  </option>
                  <option value="Microfinance and Rural Banking">
                    Microfinance and Rural Banking
                  </option>
                  <option value="Infrastructure Financing">
                    Infrastructure Financing
                  </option>
                  <option value="NRI Banking">NRI Banking</option>
                </select>
                {errors.departmentType && (
                  <span className="text-xs text-red-600 mt-1">
                    {errors.departmentType}
                  </span>
                )}
              </div>

              {/* Department Head */}
              <div className="flex flex-col">
                <label className="text-sm mb-1 text-[#2B245C]">
                  <span className="text-red-600 mr-1">*</span>Department Head
                </label>
                <input
                  type="text"
                  name="departmentHead"
                  value={departmentFormData.departmentHead}
                  onChange={departmentHandleInputChange}
                  placeholder="Enter Department Head Name"
                  required
                  className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.departmentHead && (
                  <span className="text-xs text-red-600 mt-1">
                    {errors.departmentHead}
                  </span>
                )}
              </div>

              {/* Department Contact */}
              <div className="flex flex-col">
                <label className="text-sm mb-1 text-[#2B245C]">
                  <span className="text-red-600 mr-1">*</span>Department Contact
                </label>
                <input
                  type="tel"
                  name="departmentContact"
                  value={departmentFormData.departmentContact}
                  onChange={departmentHandleInputChange}
                  placeholder="9876543210"
                  required
                  className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.departmentContact && (
                  <span className="text-xs text-red-600 mt-1">
                    {errors.departmentContact}
                  </span>
                )}
              </div>

              {/* Department Email */}
              <div className="flex flex-col">
                <label className="text-sm mb-1 text-[#2B245C]">
                  <span className="text-red-600 mr-1">*</span>Department Email
                </label>
                <input
                  type="email"
                  name="departmentEmail"
                  value={departmentFormData.departmentEmail}
                  onChange={departmentHandleInputChange}
                  placeholder="fH6r2@example.com"
                  required
                  className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.departmentEmail && (
                  <span className="text-xs text-red-600 mt-1">
                    {errors.departmentEmail}
                  </span>
                )}
              </div>

              {/* Number of Employees */}
              <div className="flex flex-col">
                <label className="text-sm mb-1 text-[#2B245C]">
                  <span className="text-red-600 mr-1">*</span>Number of
                  Employees
                </label>
                <input
                  type="number"
                  name="departmentEmployees"
                  value={departmentFormData.departmentEmployees}
                  onChange={departmentHandleInputChange}
                  placeholder="Enter number of employees"
                  required
                  className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.departmentEmployees && (
                  <span className="text-xs text-red-600 mt-1">
                    {errors.departmentEmployees}
                  </span>
                )}
              </div>

              {/* Department Location */}
              <div className="flex flex-col">
                <label className="text-sm mb-1 text-[#2B245C]">
                  <span className="text-red-600 mr-1">*</span>Department
                  Location
                </label>
                <input
                  type="text"
                  name="departmentLocation"
                  value={departmentFormData.departmentLocation}
                  onChange={departmentHandleInputChange}
                  placeholder="Enter department location"
                  required
                  className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.departmentLocation && (
                  <span className="text-xs text-red-600 mt-1">
                    {errors.departmentLocation}
                  </span>
                )}
              </div>

              {/* Department Code */}
              <div className="flex flex-col">
                <label className="text-sm mb-1 text-[#2B245C]">
                  <span className="text-red-600 mr-1">*</span>Department Code
                </label>
                <input
                  type="text"
                  name="departmentCode"
                  value={departmentFormData.departmentCode}
                  onChange={departmentHandleInputChange}
                  placeholder="Enter department code"
                  required
                  className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.departmentCode && (
                  <span className="text-xs text-red-600 mt-1">
                    {errors.departmentCode}
                  </span>
                )}
              </div>

              {/* Department Functions */}
              <div className="flex flex-col lg:col-span-3">
                <label className="text-sm mb-1 text-[#2B245C]">
                  <span className="text-red-600 mr-1">*</span>Department
                  Functions
                </label>
                <textarea
                  name="departmentFunctions"
                  value={departmentFormData.departmentFunctions}
                  onChange={departmentHandleInputChange}
                  placeholder="Describe the core functions of the department"
                  required
                  className="p-2 border border-gray-200 rounded-md bg-white min-h-[100px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.departmentFunctions && (
                  <span className="text-xs text-red-600 mt-1">
                    {errors.departmentFunctions}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="bg-[#1e284e] text-white px-8 py-2 rounded-md min-w-20 flex justify-center items-center"
              >
                {loading ? <Loader /> : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FrameworkDepartMentForm;
