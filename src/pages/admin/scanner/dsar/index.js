import { baseurl, initURL } from "@/config/config";
import CustomAxios from "@/config/CustomAxios";
import React, { useState } from "react";
import { can, guard } from "@/auth/auth-permissions";
import { useRouter } from "next/navigation";
import Tour from "@/components/Tour/Tour";
import { toast } from "react-toastify";
import GuideButton from "@/components/Tour/GuideButton";

const requestOptions = [
  "Access My Data",
  "Delete My Data",
  "Correct My Data",
  "Restrict Processing",
  "Opt-Out of Marketing",
];

const DSARForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    requestTypes: [],
    notes: "",
    confirmAuth: false,
    cmpUserId: "",
    domainName: "",
  });

  // DSAR tour state
  const [dsarTourOpen, setDsarTourOpen] = useState(false);

  // Permission
  const canCreate = can("privacy.create");

  const dsarTourSteps = [
    {
      target: '[data-tour="dsar-fullname"]',
      title: "Full Name",
      content:
        "Enter the full name of the data subject or the authorized agent submitting the request.",
    },
    {
      target: '[data-tour="dsar-email"]',
      title: "Email Address",
      content:
        "Provide the email address where we can reach you regarding this request.",
    },
    {
      target: '[data-tour="dsar-country"]',
      title: "Country",
      content:
        "Select the country that best represents your residency or the jurisdiction under which the request is made.",
    },
    {
      target: '[data-tour="dsar-request-types"]',
      title: "Request Type(s)",
      content:
        "Select one or more request types (Access, Delete, Correct, Restrict, Opt-out) that apply to your request.",
    },
    {
      target: '[data-tour="dsar-notes"]',
      title: "Additional Information",
      content:
        "Optional: provide context or details that will help us process your request more efficiently.",
    },
    {
      target: '[data-tour="dsar-cmp-user-id"]',
      title: "CMP User ID",
      content:
        "Optional: If you have a Consent Management Platform (CMP) user identifier, enter it here to help us locate your consent preferences faster.",
    },
    {
      target: '[data-tour="dsar-domain-name"]',
      title: "Domain Name",
      content:
        "Optional: Enter the domain/app where you interacted with us (e.g., clientdomain.com). This helps route your request to the right property.",
    },
    {
      target: '[data-tour="dsar-confirm"]',
      title: "Confirmation",
      content:
        "Confirm that you are the data subject or an authorized agent before submitting the form.",
    },
    {
      target: '[data-tour="dsar-submit"]',
      title: "Submit Request",
      content:
        "Click to submit your DPRM request. The button is enabled only after you select at least one request type and confirm authorization.",
    },
  ];

  const [submitting, setSubmitting] = useState(false); // loader state

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "requestTypes") {
      const updated = checked
        ? [...formData.requestTypes, value]
        : formData.requestTypes.filter((item) => item !== value);
      setFormData((prev) => ({ ...prev, requestTypes: updated }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const resetForm = () =>
    setFormData({
      fullName: "",
      email: "",
      country: "",
      requestTypes: [],
      notes: "",
      confirmAuth: false,
      cmpUserId: "",
      domainName: "",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.requestTypes.length) {
      toast.error("Please select at least one request type.");
      return;
    }

    setSubmitting(true);
    try {
      await CustomAxios.post(`${baseurl}/${initURL}/dsar`, formData);

      toast.success("Your DPRM request has been submitted successfully.");
      resetForm();
    } catch (error) {
      console.error("Error submitting DPRM:", error);
      toast.error(
        "There was an error submitting your request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-cyan-50">
                Data Principal Rights Management
              </h1>
              <p className="text-sm text-white mt-1">
                Submit your data privacy request under DPDP, GDPR, CCPA, or similar
                regulations.
              </p>
            </div>
            <GuideButton
              onClick={() => setDsarTourOpen(true)}
              variant="primary"
              size="md"
              className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
            />
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                guard(canCreate, router, () => handleSubmit(e));
              }}
              className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
                submitting ? "opacity-90" : ""
              }`}
            >
              {/* Full Name */}
              <div data-tour="dsar-fullname">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  disabled={submitting}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 disabled:bg-gray-50"
                />
              </div>

              {/* Email */}
              <div data-tour="dsar-email">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  disabled={submitting}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 disabled:bg-gray-50"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  data-tour="dsar-country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white disabled:bg-gray-50"
                >
                  <option value="">Select your country</option>
                  <option value="us">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="eu">European Union</option>
                  <option value="ca">Canada</option>
                  <option value="in">India</option>
                </select>
              </div>

              {/* Request Type(s) */}
              <div data-tour="dsar-request-types">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Type(s) <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {requestOptions.map((option) => (
                    <label
                      key={option}
                      className="flex items-center text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        name="requestTypes"
                        value={option}
                        checked={formData.requestTypes.includes(option)}
                        onChange={handleChange}
                        disabled={submitting}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {formData.requestTypes.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Please select at least one request type.
                  </p>
                )}
              </div>

              {/* Additional Notes */}
              <div className="md:col-span-2" data-tour="dsar-notes">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Information{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Provide any relevant information..."
                  disabled={submitting}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 disabled:bg-gray-50"
                />
              </div>

              {/* CMP User ID */}
              <div data-tour="dsar-cmp-user-id">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CMP User ID <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="cmpUserId"
                  value={formData.cmpUserId}
                  onChange={handleChange}
                  placeholder="CMP user ID"
                  disabled={submitting}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 disabled:bg-gray-50"
                />
              </div>

              {/* Domain Name */}
              <div data-tour="dsar-domain-name">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain Name <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="domainName"
                  value={formData.domainName}
                  onChange={handleChange}
                  placeholder="e.g. clientdomain.com"
                  disabled={submitting}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 disabled:bg-gray-50"
                />
              </div>

              {/* Confirmation */}
              <div className="md:col-span-2 flex items-start mt-1">
                <input
                  type="checkbox"
                  name="confirmAuth"
                  data-tour="dsar-confirm"
                  checked={formData.confirmAuth}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded mt-1"
                />
                <label className="ml-3 text-sm text-gray-700">
                  I confirm that I am the data principal/data subject or an authorized agent
                  submitting this request.
                </label>
              </div>

              {/* Submit */}
              <div className="md:col-span-2" data-tour="dsar-submit">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !formData.requestTypes.length ||
                    !formData.confirmAuth
                  }
                  className="mt-3 w-full bg-[#2B245C] text-white font-medium py-3 px-6 rounded-md shadow hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="inline-flex items-center">
                      <span className="mr-3 inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting…
                    </span>
                  ) : (
                    "Submit DPRM Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      {/* Tour component for DSAR */}
      <Tour
        steps={dsarTourSteps}
        open={dsarTourOpen}
        onClose={() => setDsarTourOpen(false)}
      />
    </div>
  );
};

export default DSARForm;
