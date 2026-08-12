import Dialog from "@/components/ui/Dialog";
import Loader from "@/components/ui/Loader";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import Pagination from "@/globalcomponents/NewUi/Pagination";
import { useEffect, useMemo, useState } from "react";
import { FiEye, FiSave } from "react-icons/fi";
import { toast } from "react-toastify";
const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || "${initURL}";
export default function ISO42001ControlsEnhanced() {
  const [data, setData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [dueMap, setDueMap] = useState(new Map());
  const [assignMap, setAssignMap] = useState(new Map());
  const [reviewMap, setReviewMap] = useState(new Map());
  const [approveMap, setApproveMap] = useState(new Map());
  const [priorityMap, setPriorityMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [savingMap, setSavingMap] = useState(new Map());

  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("controlId");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  async function fetchApplicableControls() {
    const { data: docs } = await CustomAxios.get(
      `${baseurl}/${initURL}/iso42001/applicabilities`,
    );

    const dm = new Map(),
      am = new Map(),
      rm = new Map(),
      apm = new Map(),
      pm = new Map();
    docs.forEach((doc) => {
      const key = doc._id;
      if (doc.dueDate) dm.set(key, doc.dueDate.slice(0, 10));
      if (doc.assigneeUuid?.user_uuid) am.set(key, doc.assigneeUuid.user_uuid);
      if (doc.reviewerUuid?.user_uuid) rm.set(key, doc.reviewerUuid.user_uuid);
      if (doc.approverUuid?.user_uuid) apm.set(key, doc.approverUuid.user_uuid);
      // set existing priority or default 'medium'
      pm.set(key, doc.priority || "medium");
    });

    setDueMap(dm);
    setAssignMap(am);
    setReviewMap(rm);
    setApproveMap(apm);
    setPriorityMap(pm);
    setData(docs);
  }

  async function fetchEmployees() {
    const { data: list } = await CustomAxios.get(`/${initURL}/apiv1/users`);
    setEmployees(list);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchApplicableControls(), fetchEmployees()])
      .catch((e) => {
        console.error(e);
        setError("Failed to load data.");
        toast.error("Unable to fetch data.");
      })
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(
    () => data.map((doc) => ({ _id: doc._id, control: doc.controlId })),
    [data],
  );
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        r.control.controlId.toLowerCase().includes(term) ||
        (r.control.title || "").toLowerCase().includes(term),
    );
  }, [rows, searchTerm]);
  const sorted = useMemo(() => {
    const arr = [...filtered].sort((a, b) => {
      const av = (a.control[sortKey] || "").toString().toLowerCase();
      const bv = (b.control[sortKey] || "").toString().toLowerCase();
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortAsc]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageControls = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage]);

  const handleAssign = (id, v) => setAssignMap((m) => new Map(m).set(id, v));
  const handleReview = (id, v) => setReviewMap((m) => new Map(m).set(id, v));
  const handleApprove = (id, v) => setApproveMap((m) => new Map(m).set(id, v));
  const handleDue = (id, v) => setDueMap((m) => new Map(m).set(id, v));
  const handlePriority = (id, v) =>
    setPriorityMap((m) => new Map(m).set(id, v));

  const byRole = (role) => employees.filter((u) => u.user_designation === role);

  const saveAssignment = async (controlObj, docId) => {
    const due = dueMap.get(docId);
    const pr = priorityMap.get(docId);
    const as = assignMap.get(docId);
    const rv = reviewMap.get(docId);
    const ap = approveMap.get(docId);
    if (!due || !pr || !as || !rv || !ap) {
      toast.error(
        "Please fill Due Date, Priority, Assignee, Reviewer and Approver before saving.",
      );
      return;
    }

    setSavingMap((m) => new Map(m).set(docId, true));
    try {
      const payload = {
        dueDate: dueMap.get(docId) || undefined,
        assigneeUuid: assignMap.get(docId) || undefined,
        reviewerUuid: reviewMap.get(docId) || undefined,
        approverUuid: approveMap.get(docId) || undefined,
        priority: priorityMap.get(docId) || undefined,
      };
      await CustomAxios.patch(
        `${baseurl}/${initURL}/iso42001/applicabilities/${docId}/assignment`,
        payload,
      );
      toast.success(`Saved ${controlObj.controlId}`);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to save ${controlObj.controlId}`);
    } finally {
      setSavingMap((m) => new Map(m).set(docId, false));
    }
  };

  if (loading) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow space-y-6">
      <Dialog
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.controlId}
      >
        {selected?.description && (
          <p className="mb-4">{selected.description}</p>
        )}
        {selected?.subsections.map((ss) => (
          <div key={ss._id} className="mb-4">
            <h4 className="font-semibold">{ss.heading}</h4>
            {ss.content && <p className="mt-1">{ss.content}</p>}
            {ss.list?.length > 0 && (
              <ul className="list-disc ml-5 mt-2">
                {ss.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </Dialog>

      <div className="flex justify-end">
        <div className="relative">
          <input
            type="search"
            placeholder="Search controls…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-64 pl-10 pr-4 py-2 border rounded-lg focus:ring-2"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-[#2B245C] text-white">
              {[
                "ID",
                "Title",
                "Due",
                "Priority",
                "Assignee",
                "Reviewer",
                "Approver",
                "Actions",
              ].map((h, idx) => (
                <th
                  key={idx}
                  className="px-2 py-3 text-center text-sm font-semibold"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageControls.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-6 text-center text-gray-500 italic"
                >
                  No assignments found.
                </td>
              </tr>
            ) : (
              pageControls.map((r, i) => (
                <tr key={r._id} className={i % 2 ? "bg-gray-50" : ""}>
                  <td className="px-2 py-2 text-center">
                    {r.control.controlId}
                  </td>
                  <td className="px-2 py-2 text-center">{r.control.title}</td>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="date"
                      value={dueMap.get(r._id) || ""}
                      onChange={(e) => handleDue(r._id, e.target.value)}
                      className="w-32 rounded-lg border px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <select
                      value={priorityMap.get(r._id) || "medium"}
                      onChange={(e) => handlePriority(r._id, e.target.value)}
                      className="w-24 rounded-lg border px-2 py-1"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <select
                      value={assignMap.get(r._id) || ""}
                      onChange={(e) => handleAssign(r._id, e.target.value)}
                      className="w-28 rounded-lg border px-2 py-1"
                    >
                      <option value="">Select…</option>
                      {byRole("Employee").map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.first_name} {u.last_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <select
                      value={reviewMap.get(r._id) || ""}
                      onChange={(e) => handleReview(r._id, e.target.value)}
                      className="w-28 rounded-lg border px-2 py-1"
                    >
                      <option value="">Select…</option>
                      {byRole("Reviewer").map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.first_name} {u.last_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <select
                      value={approveMap.get(r._id) || ""}
                      onChange={(e) => handleApprove(r._id, e.target.value)}
                      className="w-28 rounded-lg border px-2 py-1"
                    >
                      <option value="">Select…</option>
                      {byRole("Approver").map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.first_name} {u.last_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1 text-center space-x-2">
                    <button
                      onClick={() => setSelected(r.control)}
                      className="px-3 py-1 bg-[#2B245C] text-white rounded-lg"
                    >
                      <FiEye />
                    </button>
                    <button
                      onClick={() => saveAssignment(r.control, r._id)}
                      disabled={savingMap.get(r._id)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                    >
                      {savingMap.get(r._id) ? (
                        <FiSave className="animate-spin" />
                      ) : (
                        <FiSave />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setCurrentPage(p)}
      />
    </div>
  );
}
