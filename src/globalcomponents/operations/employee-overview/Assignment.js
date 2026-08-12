import { useState, useEffect } from "react";
import { baseurl, initURL } from "../../../../BaseUrl";
import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import { toast } from "react-toastify";
import { can, guard } from "@/auth/auth-permissions";
import { useRouter } from "next/router";

const EmployeePolicyTrainingProcedure = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true); // Global loading state
  const [saveLoading, setSaveLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [selectedTrainings, setSelectedTrainings] = useState([]);
  const [selectedTrainingDates, setSelectedTrainingDates] = useState({});
  const [selectedProcedures, setSelectedProcedures] = useState([]);
  // Onboarding Details
  const [onboardingDate, setOnboardingDate] = useState("");
  const [onboardingDepartment, setOnboardingDepartment] = useState("");
  const [onboardingTitle, setOnboardingTitle] = useState("");

  const canAssign = can(["operations.assign"]);

  // Helper to fetch employees
  const ALLOWED_ROLES = ["APPROVER", "EMPLOYEE", "CONTRIBUTOR", "REVIEWER"];

  const hasAllowedRole = (roles = []) =>
    roles.some((role) => ALLOWED_ROLES.includes(role));

  // **Fetch All Data in Parallel Using `Promise.all()`**
  const fetchData = async () => {
    setLoading(true);
    try {
      const [employeeRes, policyRes, trainingRes, procedureRes, assignmentRes] =
        await Promise.all([
          CustomAxios.get(
            `${baseurl}/${initURL}/apiv1/users/db?page=1&limit=100`,
          ),
          CustomAxios.get(`${baseurl}/${initURL}/policy/all`),
          CustomAxios.get(`${baseurl}/${initURL}/training-campaign/all`),
          CustomAxios.get(`${baseurl}/${initURL}/employee/procedure/all`),
          CustomAxios.get(`${baseurl}/${initURL}/policy-training-assignment`),
        ]);

      const users = employeeRes?.data?.data || [];
      const filteredUsers = users.filter((user) => hasAllowedRole(user.roles));

      setEmployees(filteredUsers);
      setPolicies(policyRes.data || []);
      setTrainings(trainingRes.data || []);
      setProcedures(procedureRes.data || []);
      setAssignments(assignmentRes.data?.map((e) => e.employeeId._id) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle checkbox selection for policies and procedures
  const handleCheckboxChange = (id, selectedList, setSelectedList) => {
    if (selectedList.includes(id)) {
      setSelectedList(selectedList.filter((item) => item !== id));
    } else {
      setSelectedList([...selectedList, id]);
    }
  };

  const handleTrainingChange = (id) => {
    if (selectedTrainings.includes(id)) {
      // Remove training and its completion date
      setSelectedTrainings(selectedTrainings.filter((item) => item !== id));
      setSelectedTrainingDates((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } else {
      // Add training with empty completion date
      setSelectedTrainings([...selectedTrainings, id]);
      setSelectedTrainingDates((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleTrainingDateChange = (id, date) => {
    setSelectedTrainingDates((prev) => ({ ...prev, [id]: date }));
  };

  // **Handle Form Submission**
  const handleLinkData = async () => {
    // Validation for required fields
    if (!selectedEmployee) {
      toast.error("Please select an employee.");
      return;
    }

    if (
      !onboardingDate ||
      !onboardingDepartment.trim() ||
      !onboardingTitle.trim()
    ) {
      toast.error(
        "Please fill in all onboarding details (Date, Department, Title).",
      );
      return;
    }

    const payload = {
      employeeId: selectedEmployee,
      onboardingDetails: {
        date: onboardingDate,
        department: onboardingDepartment.trim(),
        title: onboardingTitle.trim(),
      },
      policies: selectedPolicies.map((policyId) => ({
        policy: policyId,
        status: "Pending",
        acceptedDate: null,
      })),
      trainings: selectedTrainings.map((trainingId) => ({
        training: trainingId,
        completionDate: selectedTrainingDates[trainingId] || null,
      })),
      procedures: selectedProcedures.map((procedureId) => ({
        procedure: procedureId,
        status: "Pending",
        acceptedDate: null,
      })),
    };
    setSaveLoading(true);
    try {
      await CustomAxios.post(
        `${baseurl}/${initURL}/policy-training-assignment`,
        payload,
      );
      toast.success("Data linked successfully!");
      resetForm();
      fetchData(); // Refresh data after submission
    } catch (error) {
      console.error("Error linking data:", error);
      toast.error("Failed to link data. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  // **Reset Form After Successful Submission**
  const resetForm = () => {
    setSelectedEmployee("");
    setSelectedPolicies([]);
    setSelectedTrainings([]);
    setSelectedTrainingDates({});
    setSelectedProcedures([]);
    setOnboardingDate("");
    setOnboardingDepartment("");
    setOnboardingTitle("");
  };

  if (loading) {
    return (
      <div className="text-blue-600 hover:text-blue-800 flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h1 className="text-3xl font-bold text-cyan-50">
          Employee Training & Policy Assignment
        </h1>
        <p className="mt-1 text-sm text-white">
          Ensure your employees are fully onboarded and compliant with our
          policies.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Employee Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Employee Selection:
          </label>
          {employees.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              ⚠️ No employees available for assignment.
            </p>
          ) : (
            <select
              className="w-full p-2 border rounded"
              onChange={(e) => setSelectedEmployee(e.target.value)}
              value={selectedEmployee}
            >
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.user_name ||
                    `${emp.first_name || ""} ${emp.last_name || ""}`.trim()}{" "}
                  ({emp.email || emp.user_email || "-"})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 🆕 Onboarding Details Section */}
        <div className="mb-6 p-6 border rounded-lg shadow-md bg-white">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            📋 Onboarding Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Picker */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">📅 Date:</label>
              <input
                type="date"
                className="w-full p-3 border rounded-lg shadow-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={onboardingDate}
                onChange={(e) => setOnboardingDate(e.target.value)}
              />
            </div>

            {/* Department Input */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">
                🏢 Department:
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg shadow-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter Department"
                value={onboardingDepartment}
                onChange={(e) => setOnboardingDepartment(e.target.value)}
              />
            </div>

            {/* Title Input */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">
                🎓 Title:
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg shadow-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter Title"
                value={onboardingTitle}
                onChange={(e) => setOnboardingTitle(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Policies Selection */}
        <div className="mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Policies Selection:
            </label>
            {policies.filter((p) => p.policyStatus === "Active").length ===
              0 ? (
              <p className="text-gray-500 text-sm italic">
                ⚠️ No active policies available for selection.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {policies
                  .filter((p) => p.policyStatus === "Active")
                  .map((policy) => (
                    <label
                      key={policy._id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPolicies.includes(policy._id)}
                        onChange={() =>
                          handleCheckboxChange(
                            policy._id,
                            selectedPolicies,
                            setSelectedPolicies,
                          )
                        }
                        className="form-checkbox"
                      />
                      <span>{policy.name}</span>
                    </label>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Training Selection with Completion Date */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Trainings Selection:
          </label>
          {trainings.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              ⚠️ No trainings available for selection.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {trainings.map((training) => (
                <div
                  key={training._id}
                  className="flex flex-col space-y-2 p-3 border rounded bg-gray-50"
                >
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedTrainings.includes(training._id)}
                      onChange={() => handleTrainingChange(training._id)}
                      className="form-checkbox"
                    />
                    <span>{training.name}</span>
                  </label>
                  {selectedTrainings.includes(training._id) && (
                    <input
                      type="date"
                      className="w-full p-2 border rounded mt-2"
                      value={selectedTrainingDates[training._id] || ""}
                      onChange={(e) =>
                        handleTrainingDateChange(training._id, e.target.value)
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Procedures Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Procedures Selection:
          </label>
          {procedures.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              ⚠️ No procedures available for selection.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {procedures.map((proc) => (
                <label key={proc._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedProcedures.includes(proc._id)}
                    onChange={() =>
                      handleCheckboxChange(
                        proc._id,
                        selectedProcedures,
                        setSelectedProcedures,
                      )
                    }
                    className="form-checkbox"
                  />
                  <span>{proc.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            className="bg-gradient-to-r from-[#2B245C] to-[#3C3570] text-white font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
            onClick={() => guard(canAssign, router, handleLinkData)}
          >
            {saveLoading ? <Loader /> : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeePolicyTrainingProcedure;
