import { useState } from "react";
import axios from "axios";
import { baseurl, initURL } from "../../../BaseUrl";
import { toast } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";

const BankDetails = ({ branchShow }) => {
  const [loading, setLoading] = useState(false);
  const [branchFormData, setBranchFormData] = useState({
    bankName: "",
    divisionBranch: "",
    address1: "",
    address2: "",
    address3: "",
    bankContact: "",
    country: "",
    cityState: "",
    zipCode: "",
    ifscCode: "",
    branchManagerFirstName: "",
    branchManagerLastName: "",
    branchManagerEmailId: "",
    branchManagerContact: "",
  });

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
  const [showBranchDetails, setShowBranchDetails] = useState(branchShow);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBranchFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const departmentHandleInputChange = (e) => {
    const { name, value } = e.target;
    setDepartmentFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateContact = (contact) => /^[0-9]{10}$/.test(contact);

  const handleSubmit = async () => {
    const newErrors = {};
    Object.keys(branchFormData).forEach((key) => {
      if (!branchFormData[key]) {
        newErrors[key] = "This field is required.";
      }
    });

    if (
      branchFormData.branchManagerContact &&
      !validateContact(branchFormData.branchManagerContact)
    ) {
      newErrors.branchManagerContact = "Contact must be a 10-digit number.";
    }

    if (
      branchFormData.bankContact &&
      !validateContact(branchFormData.bankContact)
    ) {
      newErrors.bankContact = "Contact must be a 10-digit number.";
    }

    if (
      branchFormData.departmentContact &&
      !validateContact(branchFormData.departmentContact)
    ) {
      newErrors.departmentContact = "Contact must be a 10-digit number.";
    }

    if (
      branchFormData.branchManagerEmailId &&
      !validateEmail(branchFormData.branchManagerEmailId)
    ) {
      newErrors.branchManagerEmailId = "Invalid email format.";
    }

    if (
      branchFormData.departmentEmail &&
      !validateEmail(branchFormData.departmentEmail)
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
          `${baseurl}/${initURL}/rbi-tracking/create-bank-details`,
          branchFormData,
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.status === 200 || response.status === 201) {
          toast.success("Details Submitted successfully!");
          setBranchFormData({
            bankName: "",
            divisionBranch: "",
            address1: "",
            address2: "",
            address3: "",
            bankContact: "",
            country: "",
            cityState: "",
            zipCode: "",
            ifscCode: "",
            branchManagerFirstName: "",
            branchManagerLastName: "",
            branchManagerEmailId: "",
            branchManagerContact: "",
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
          <h2 className=" font-bold text-[#2B245C]">
            {showBranchDetails ? "Branch Details" : "Department Details"}
          </h2>
        </div>

        {showBranchDetails ? (
          <div>
            {/* Branch Details Form */}
            <div className="p-6 bg-[#F8F9FE] rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-[#2B245C]">
                    <span className="text-red-600">*</span> Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={branchFormData.bankName}
                    onChange={handleInputChange}
                    placeholder="Enter Bank Name"
                    className={`p-2 border ${
                      errors.bankName ? "border-red-600" : "border-gray-300"
                    } rounded-md focus:ring focus:ring-blue-200`}
                  />
                  {errors.bankName && (
                    <span className="text-xs text-red-600">
                      {errors.bankName}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-gray-700">
                    <span className="text-red-600">*</span> Division/Branch
                  </label>
                  <input
                    type="text"
                    name="divisionBranch"
                    value={branchFormData.divisionBranch}
                    onChange={handleInputChange}
                    placeholder="Division/Branch"
                    className={`p-2 border ${
                      errors.divisionBranch
                        ? "border-red-600"
                        : "border-gray-300"
                    } rounded-md focus:ring focus:ring-blue-200`}
                  />
                  {errors.divisionBranch && (
                    <span className="text-xs text-red-600">
                      {errors.divisionBranch}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-gray-700">
                    <span className="text-red-600">*</span> IFSC Code
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={branchFormData.ifscCode}
                    onChange={handleInputChange}
                    placeholder="e.g., SBIN0001234"
                    className={`p-2 border ${
                      errors.ifscCode ? "border-red-600" : "border-gray-300"
                    } rounded-md focus:ring focus:ring-blue-200`}
                  />
                  {errors.ifscCode && (
                    <span className="text-xs text-red-600">
                      {errors.ifscCode}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-gray-700">
                    <span className="text-red-600">*</span> Bank Contact
                  </label>
                  <input
                    type="tel"
                    name="bankContact"
                    value={branchFormData.bankContact}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className={`p-2 border ${
                      errors.bankContact ? "border-red-600" : "border-gray-300"
                    } rounded-md focus:ring focus:ring-blue-200`}
                  />
                  {errors.bankContact && (
                    <span className="text-xs text-red-600">
                      {errors.bankContact}
                    </span>
                  )}
                </div>

                <div className="flex flex-col col-span-1">
                  <label className="text-sm mb-1 text-gray-700">
                    <span className="text-red-600">*</span> Address 1
                  </label>
                  <input
                    type="text"
                    name="address1"
                    value={branchFormData.address1}
                    onChange={handleInputChange}
                    placeholder="Building Name"
                    className={` p-2 border ${
                      errors.address1 ? "border-red-600" : "border-gray-300"
                    } rounded-md focus:ring focus:ring-blue-200`}
                  />
                  {errors.address1 && (
                    <span className="text-xs text-red-600">
                      {errors.address1}
                    </span>
                  )}
                </div>

                <div className="flex flex-col col-span-">
                  <label className="text-sm mb-1 text-gray-700">
                    Address 2
                  </label>
                  <input
                    type="text"
                    name="address2"
                    value={branchFormData.address2}
                    onChange={handleInputChange}
                    placeholder="Street Address"
                    className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                  />
                </div>

                <div className="flex flex-col col-span-1">
                  <label className="text-sm mb-1 text-gray-700">
                    Address 3
                  </label>
                  <input
                    type="text"
                    name="address3"
                    value={branchFormData.address3}
                    onChange={handleInputChange}
                    placeholder="Street Address"
                    className=" p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-gray-700">
                    <span className="text-red-600">*</span> Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={branchFormData.country}
                    onChange={handleInputChange}
                    placeholder="India"
                    className={` p-2 border ${
                      errors.country ? "border-red-600" : "border-gray-300"
                    } rounded-md focus:ring focus:ring-blue-200`}
                  />
                  {errors.country && (
                    <span className="text-xs text-red-600">
                      {errors.country}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-gray-700">
                    <span className="text-red-600">*</span> City, State
                  </label>
                  <input
                    type="text"
                    name="cityState"
                    value={branchFormData.cityState}
                    onChange={handleInputChange}
                    placeholder="Thane, Mah"
                    className={` p-2 border ${
                      errors.cityState ? "border-red-600" : "border-gray-300"
                    } rounded-md focus:ring focus:ring-blue-200`}
                  />
                  {errors.cityState && (
                    <span className="text-xs text-red-600">
                      {errors.cityState}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-gray-700">
                    <span className="text-red-600">*</span> Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={branchFormData.zipCode}
                    onChange={handleInputChange}
                    placeholder="400606"
                    className={` p-2 border ${
                      errors.zipCode ? "border-red-600" : "border-gray-300"
                    } rounded-md focus:ring focus:ring-blue-200`}
                  />
                  {errors.zipCode && (
                    <span className="text-xs text-red-600">
                      {errors.zipCode}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Branch Manager Details */}
            <div className="p-6 bg-[#F8F9FE] rounded-lg shadow-md mt-8">
              <h3 className="text-xl font-bold text-[#2B245C] mb-4">
                Branch Manager Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-gray-700">
                    <span className="text-red-600">*</span> First Name
                  </label>
                  <input
                    type="text"
                    name="branchManagerFirstName"
                    value={branchFormData.branchManagerFirstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className={`p-2 border ${
                      errors.branchManagerFirstName
                        ? "border-red-600"
                        : "border-gray-300"
                    } rounded-md focus:ring focus:ring-blue-200`}
                  />
                  {errors.branchManagerFirstName && (
                    <span className="text-xs text-red-600">
                      {errors.branchManagerFirstName}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-gray-700">
                    <span className="text-red-600">*</span> Last Name
                  </label>
                  <input
                    type="text"
                    name="branchManagerLastName"
                    value={branchFormData.branchManagerLastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className={`p-2 border ${
                      errors.branchManagerLastName
                        ? "border-red-600"
                        : "border-gray-300"
                    } rounded-md focus:ring focus:ring-blue-200`}
                  />
                  {errors.branchManagerLastName && (
                    <span className="text-xs text-red-600">
                      {errors.branchManagerLastName}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm  mb-1 text-gray-700">
                    <span className="text-red-600">*</span> Email ID
                  </label>
                  <input
                    type="email"
                    name="branchManagerEmailId"
                    value={branchFormData.branchManagerEmailId}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className={` p-2 border ${
                      errors.branchManagerEmailId
                        ? "border-red-600"
                        : "border-gray-300"
                    } rounded-md focus:ring focus:ring-blue-200`}
                  />
                  {errors.branchManagerEmailId && (
                    <span className="text-xs text-red-600">
                      {errors.branchManagerEmailId}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-gray-700">
                    <span className="text-red-600">*</span> Contact Number
                  </label>
                  <input
                    type="tel"
                    name="branchManagerContact"
                    value={branchFormData.branchManagerContact}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className={` p-2 border ${
                      errors.branchManagerContact
                        ? "border-red-600"
                        : "border-gray-300"
                    } rounded-md focus:ring focus:ring-blue-200`}
                  />
                  {errors.branchManagerContact && (
                    <span className="text-xs text-red-600">
                      {errors.branchManagerContact}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-[#1e284e] text-white px-8 py-2 rounded-md min-w-20 flex justify-center items-center"
                >
                  <span className="font-medium text-lg">
                    {loading ? <Loader /> : "Submit"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleDepartmentSubmit} method="POST">
            <div className="p-6 bg-[#F8F9FE]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                {/* Department Type */}
                <div className="flex flex-col lg:col-span-3">
                  <label className="text-sm mb-1text-gray-700">
                    <span className="text-red-600 mr-1">*</span>Select
                    Department
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
                    <option value="Investment Banking">
                      Investment Banking
                    </option>
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
                    <option value="Customer Analytics">
                      Customer Analytics
                    </option>
                    <option value="Insurance Services">
                      Insurance Services
                    </option>
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
                    <span className="text-red-600 mr-1">*</span>Department
                    Contact
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
        )}
      </div>
    </div>
  );
};

export default BankDetails;
