import { useState, useEffect } from "react";
import CustomAxios from "@/config/CustomAxios";
import Loader from "@/components/ui/Loader";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../../../../BaseUrl";
import { resolveTenantId } from "@/utils/tenant";

// const STATIC_ROLES = [
//   "Employee",
//   "Reviewer",
//   "Assigner",
//   "Approver",
//   "Contributor",
//   "Supervisor",
//   "Creator",
// ];

export default function UserCreation() {
  const [loading, setLoading] = useState(false);
  // const [roles, setRoles] = useState([]); // fetched roles for dropdown
  const [data, setData] = useState({
    first_name: "",
    last_name: "",
    employeeId: "",
    // user_designation: "",
    email: "",
    contact_number: "",
    address: "",
  });
  const [errors, setErrors] = useState({});

  // const loadRoles = async () => {
  //   try {
  //     const { data } = await CustomAxios.get(`${initURL}/access/roles`);
  //     const list = Array.isArray(data?.data) ? data.data : [];
  //     // take role names only + remove empty
  //     const names = list.map((r) => r?.name).filter(Boolean);
  //     setRoles(names);
  //   } catch {
  //     toast.error("Failed to load roles");
  //     setRoles([]);
  //   }
  // };

  // useEffect(() => {
  //   loadRoles();
  // }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((d) => ({ ...d, [name]: value }));
    setErrors((e) => ({ ...e, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!data.first_name.trim()) errs.first_name = "Required";
    if (!data.last_name.trim()) errs.last_name = "Required";
    if (!data.employeeId.trim()) errs.employeeId = "Required";
    // if (!data.user_designation) errs.user_designation = "Required";
    if (!/\S+@\S+\.\S+/.test(data.email)) errs.email = "Invalid email";
    if (!data.contact_number.trim()) errs.contact_number = "Required";
    if (!data.address.trim()) errs.address = "Required";
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const body = {
        ...data,
        tenant_id: resolveTenantId() || undefined,
      };
      const res = await CustomAxios.post(
        `${baseurl}/${initURL}/apiv1/users/create`,
        body,
      );

      if (res.data?.statusCode >= 400) {
        const msg = res.data?.message || res.data?.body;
        toast.error(Array.isArray(msg) ? msg[0] : msg || "Creation failed");
        return;
      }

      toast.success(
        res.data.message ||
        "User created. Roles and credentials will be emailed after role assignment.",
      );
      setData({
        first_name: "",
        last_name: "",
        employeeId: "",
        // user_designation: "",
        email: "",
        contact_number: "",
        address: "",
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.body;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "first_name", label: "First Name", type: "text" },
    { name: "last_name", label: "Last Name", type: "text" },
    { name: "employeeId", label: "Employee ID", type: "text" },
    // {
    //   name: "user_designation",
    //   label: "Role",
    //   type: "select",

    //   // static and fetched Roles
    //   options: [
    //     ...STATIC_ROLES.map((s) => {
    //       const match = roles.find((r) => r.toLowerCase() === s.toLowerCase());
    //       return match || s;
    //     }),
    //     ...roles.filter(
    //       (r) => !STATIC_ROLES.some((s) => s.toLowerCase() === r.toLowerCase()),
    //     ),
    //   ],
    // },

    { name: "email", label: "Email", type: "email" },
    { name: "contact_number", label: "Contact Number", type: "tel" },

    //new
    { name: "address", label: "Address", type: "text" },
  ];

  return (
    <div className="py-5 px-2 space-y-5">
      <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
          Create User
        </h2>
        <p className="mb-8 text-sm text-gray-600">
          Enter the user&apos;s basic details here. After saving, continue to Manage Roles and then Assign Roles.
        </p>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {fields.map((f) => (
            <div key={f.name} className="flex flex-col mb-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                {f.label}
              </label>
              {f.type === "select" ? (
                <select
                  name={f.name}
                  value={data[f.name]}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all
                  ${errors[f.name] ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="" disabled>
                    Select {f.label}
                  </option>
                  {f.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={f.name}
                  type={f.type}
                  value={data[f.name]}
                  onChange={handleChange}
                  placeholder={f.label}
                  className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all
                  ${errors[f.name] ? "border-red-500" : "border-gray-300"}`}
                />
              )}
              {errors[f.name] && (
                <span className="text-xs text-red-600 mt-1">
                  {errors[f.name]}
                </span>
              )}
            </div>
          ))}

          {/* Submit button spans both columns, right‑aligned */}
          <div className="md:col-span-2 flex justify-end mt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
            >
              {loading ? <Loader /> : "Submit"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
