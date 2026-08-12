import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { baseurl } from "../../../BaseUrl";

const CreateCompany = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    contactNumber: "",
    email: "",
    tenantId: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(baseurl + "/priv/apiv1/createCompany", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Assuming the backend returns the created company with its tenant ID
      const { tenantId, companyName } = response.data;
      Cookies.set("tenant_id", tenantId, { expires: 1 });

      // Redirect or show success message
      alert(`Company ${companyName} created successfully! Tenant ID: ${tenantId}`);
      // Optionally redirect to a dashboard or another page
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg animate-fade-in">
        <h2 className="text-3xl font-bold text-center text-blue-900">Create Company</h2>
        <p className="text-center text-gray-600">
          Please enter the company details to create the company profile.
        </p>

        {error && <p className="text-center text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              name="companyName"
              required
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Company Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Address</label>
            <input
              type="text"
              name="companyAddress"
              required
              placeholder="Enter company address"
              value={formData.companyAddress}
              onChange={handleChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input
              type="text"
              name="contactNumber"
              required
              placeholder="Enter contact number"
              value={formData.contactNumber}
              onChange={handleChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="Enter company email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Tenant ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tenant ID</label>
            <input
              type="text"
              name="tenantId"
              required
              placeholder="Enter unique Tenant ID"
              value={formData.tenantId}
              onChange={handleChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 focus:outline-none transition duration-300"
          >
            {loading ? "Creating..." : "Create Company"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCompany;
