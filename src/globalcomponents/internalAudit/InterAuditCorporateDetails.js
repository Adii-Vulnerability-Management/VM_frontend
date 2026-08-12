import { useEffect, useState } from "react";
import { Building, ChevronDown, ChevronUp } from "lucide-react";
import CustomAxios from "../CustomAxios";
import { baseurl, initURL } from "../../../BaseUrl";
import Loader from "../loader/Loader";

export default function InterAuditCorporateDetails() {
  const [company] = useState({
    companyName: "E-Innosec",
    address: "123 Business Ave, City, State",
  });
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openDiv, setOpenDiv] = useState({});
  const [openDept, setOpenDept] = useState({});
  const [openBA, setOpenBA] = useState({});

  // only render fields with truthy values
  const renderField = (label, value) => {
    if (!value && value !== 0) return null;
    return (
      <div className="col-span-2 sm:col-span-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          type="text"
          value={value}
          disabled
          className="mt-1 w-full border rounded px-2 py-1 bg-gray-50 text-gray-800"
        />
      </div>
    );
  };

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const [divRes, deptRes, baRes] = await Promise.all([
          CustomAxios.get(`${baseurl}/${initURL}/ghub-division`),
          CustomAxios.get(`${baseurl}/${initURL}/ghub-department`),
          CustomAxios.get(`${baseurl}/${initURL}/ghub-business-area`),
        ]);

        const nested = divRes.data.map((div) => {
          const depts = deptRes.data
            .filter((d) => div.departments.includes(d._id))
            .map((d) => ({
              ...d,
              businessAreas: baRes.data
                .filter((b) => d.businessAreas.includes(b._id))
                .map((b) => b),
            }));
          return { ...div, departments: depts };
        });

        setDivisions(nested);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-white rounded-2xl shadow-lg">
      {/* Company Details */}
      <section className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Building className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Company Details</h3>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {renderField("Company Name", company.companyName)}
          {renderField("Address", company.address)}
        </div>
      </section>

      {/* Divisions */}
      {divisions.map((div) => (
        <section
          key={div._id}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          {/* Division Header */}
          <button
            onClick={() =>
              setOpenDiv((o) => ({ ...o, [div._id]: !o[div._id] }))
            }
            className="w-full flex justify-between items-center px-6 py-4 bg-gray-50 hover:bg-gray-100"
          >
            <span className="font-semibold text-gray-800">Division - {div.name}</span>
            {openDiv[div._id] ? <ChevronUp /> : <ChevronDown />}
          </button>

          {openDiv[div._id] && (
            <div className="p-6 space-y-6">
              {/* Division Details */}

              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {renderField("Name", div.name)}
                {renderField("Head", div.head)}
                {renderField("Location", div.location)}
                {renderField("Code", div.code)}
                {renderField("Description", div.description)}
                {renderField("Status", div.status)}
              </div>

              {/* Departments Accordion */}
              <div>
                <button
                  onClick={() =>
                    setOpenDept((o) => ({ ...o, [div._id]: !o[div._id] }))
                  }
                  className="flex items-center text-gray-800 hover:text-gray-900"
                >
                  {openDept[div._id] ? (
                    <ChevronUp className="w-5 h-5 mr-1" />
                  ) : (
                    <ChevronDown className="w-5 h-5 mr-1" />
                  )}
                  <span className="font-semibold">Departments</span>
                </button>

                {openDept[div._id] &&
                  div.departments.map((d) => (
                    <div
                      key={d._id}
                      className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4"
                    >

                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {renderField("Name", d.departmentName)}
                        {renderField("Head", d.departmentHead)}
                        {renderField("Contact", d.departmentContact)}
                        {renderField("Email", d.departmentEmail)}
                        {renderField("Employees", d.departmentEmployees)}
                        {renderField("Location", d.departmentLocation)}
                        {renderField("Code", d.departmentCode)}
                        {renderField("Functions", d.departmentFunctions)}
                      </div>

                      {/* Business Areas Accordion */}
                      <div className="pl-4">
                        <button
                          onClick={() =>
                            setOpenBA((o) => ({ ...o, [d._id]: !o[d._id] }))
                          }
                          className="flex items-center text-gray-700 hover:text-gray-800"
                        >
                          {openBA[d._id] ? (
                            <ChevronUp className="w-4 h-4 mr-1" />
                          ) : (
                            <ChevronDown className="w-4 h-4 mr-1" />
                          )}
                          <span className="font-medium text-sm">
                            Business Areas
                          </span>
                        </button>

                        {openBA[d._id] &&
                          d.businessAreas.map((ba) => (
                            <div
                              key={ba._id}
                              className="mt-3 p-4 bg-white rounded-lg space-y-4"
                            >
                              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                {renderField("Name", ba.name)}
                                {renderField("Code", ba.code)}
                                {renderField("Description", ba.description)}
                                {renderField("Status", ba.status)}
                              </div>

                              {/* Processes */}
                              {ba.processAreas && ba.processAreas.length > 0 && (
                                <div className="pl-4">
                                  <div className="text-sm font-semibold text-gray-500 mb-2">
                                    Process Details
                                  </div>
                                  {ba.processAreas.map((p) => (
                                    <div
                                      key={p._id}
                                      className="grid grid-cols-2 gap-x-8 gap-y-2 mb-2"
                                    >
                                      {renderField("Name", p.name)}
                                      {renderField("Code", p.code)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
