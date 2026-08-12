// EmployeeOnboardingPage.js
import { useState } from "react";
import { toast } from "react-toastify";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import CustomAxios from "@/globalcomponents/CustomAxios";

const EmployeeOnboardingPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleCreateUser = async () => {
    // Validation logic for fields (same as the one you provided)
    if (
      !firstName ||
      !lastName ||
      !employeeId ||
      !userEmail ||
      !password ||
      !companyName ||
      !contactNumber ||
      !companyAddress ||
      !address
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    // Other validations...

    const userData = {
      user_name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      email: userEmail,
      employeeId: employeeId,
      contact_number: contactNumber,
      company_name: companyName,
      company_address: companyAddress,
      address: address,
      password: password,
      date_joined: new Date().toISOString(),
    };

    try {
      await CustomAxios.post('/api/users', userData);
      toast.success("Employee Created Successfully");

      // Reset fields after success
      setFirstName("");
      setLastName("");
      setEmployeeId("");
      setUserEmail("");
      setContactNumber("");
      setCompanyName("");
      setCompanyAddress("");
      setAddress("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Failed to create employee");
    }
  };

  return (
    <div className="py-5 px-2 space-y-5">
      <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h2 className="text-2xl font-bold text-[#2B245C] mb-3">
          Employee Onboarding
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              placeholder='e.g. "John"'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              placeholder='e.g. "Doe"'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Employee ID
            </label>
            <input
              type="text"
              placeholder='e.g. "Employee ID"'
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder='e.g. "abc@gmail.com"'
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Contact Number
            </label>
            <input
              type="text"
              placeholder='e.g. "98765XXXXX"'
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              placeholder='e.g. "ABC Pvt Ltd"'
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Company Address
            </label>
            <input
              type="text"
              placeholder='e.g. "123, Main Street, City"'
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              placeholder='e.g. "abc@gmail.com"'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
              <button
                type="button"
                onClick={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={handleCreateUser}
          className="mt-4 bg-[#2B245C] text-white font-medium text-sm px-4 py-2.5 rounded-lg w-full"
        >
          Create Employee
        </button>
      </section>
    </div>
  );
};

export default EmployeeOnboardingPage;

// import { useState} from "react";
// import { FaEyeSlash, FaEye } from "react-icons/fa";

// const EmployeeOnboarding = () => {
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [employeeId, setEmployeeId] = useState("");
//   const [userEmail, setUserEmail] = useState("");
//   const [contactNumber, setContactNumber] = useState("");
//   const [companyName, setCompanyName] = useState("");
//   const [companyAddress, setCompanyAddress] = useState("");
//   const [address, setAddress] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [passwordVisible, setPasswordVisible] = useState(false);
//   const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

//   return (
//     <div className="p-4 border rounded-lg mt-10">
//       <h3 className="text-lg font-semibold mb-3">Employee Onboarding</h3>

//     <div className="grid grid-cols-2 gap-4 mb-4">
//       <input
//         type="text"
//         placeholder="First Name"
//         value={firstName}
//         onChange={(e) => setFirstName(e.target.value)}
//         className="w-full p-3 border rounded focus:outline-blue-500"
//       />
//       <input
//         type="text"
//         placeholder="Last Name"
//         value={lastName}
//         onChange={(e) => setLastName(e.target.value)}
//         className="w-full p-3 border rounded focus:outline-blue-500"
//       />
//       <input
//         type="text"
//         placeholder="Employee ID"
//         value={employeeId}
//         onChange={(e) => setEmployeeId(e.target.value)}
//         className="w-full p-3 border rounded focus:outline-blue-500"
//       />
//       <input
//         type="email"
//         placeholder="Email"
//         value={userEmail}
//         onChange={(e) => setUserEmail(e.target.value)}
//         className="w-full p-3 border rounded focus:outline-blue-500"
//       />
//       <input
//         type="text"
//         placeholder="Contact Number"
//         value={contactNumber}
//         onChange={(e) => setContactNumber(e.target.value)}
//         className="w-full p-3 border rounded focus:outline-blue-500"
//       />
//       <input
//         type="text"
//         placeholder="Company Name"
//         value={companyName}
//         onChange={(e) => setCompanyName(e.target.value)}
//         className="w-full p-3 border rounded focus:outline-blue-500"
//       />
//       <input
//         type="text"
//         placeholder="Company Address"
//         value={companyAddress}
//         onChange={(e) => setCompanyAddress(e.target.value)}
//         className="w-full p-3 border rounded focus:outline-blue-500"
//       />
//       <input
//         type="text"
//         placeholder="Address"
//         value={address}
//         onChange={(e) => setAddress(e.target.value)}
//         className="w-full p-3 border rounded focus:outline-blue-500"
//       />
//       {/* Password Field with Eye Toggle */}
//       <div className="relative">
//         <input
//           type={passwordVisible ? "text" : "password"}
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full p-3 border rounded focus:outline-blue-500"
//         />
//         <button
//           type="button"
//           onClick={() => setPasswordVisible(!passwordVisible)}
//           className="absolute inset-y-0 right-0 pr-3 flex items-center"
//         >
//           {passwordVisible ? (
//             // Eye Off Icon
//             <FaEyeSlash />
//           ) : (
//             // Eye Icon
//             <FaEye />
//           )}
//         </button>
//       </div>

//       {/* Confirm Password Field with Eye Toggle */}
//       <div className="relative ">
//         <input
//           type={confirmPasswordVisible ? "text" : "password"}
//           placeholder="Confirm Password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           className={`w-full p-3 border rounded ${
//             confirmPassword && password !== confirmPassword
//               ? "border-red-500"
//               : "focus:outline-blue-500"
//           }`}
//         />
//         <button
//           type="button"
//           onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
//           className="absolute inset-y-0 right-0 pr-3 flex items-center"
//         >
//           {confirmPasswordVisible ? (
//             // Eye Off Icon
//             <FaEyeSlash />
//           ) : (
//             // Eye Icon
//             <FaEye />
//           )}
//         </button>
//       </div>
//     </div>
//     </div>
//   );
// };

// export default EmployeeOnboarding;
