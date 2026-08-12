// src/pages/admin/scanner/websites/[id]/cookies.jsx
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import axios from "axios";
import { baseurl, initURL } from "@/config/config";
import { BiArrowBack } from "react-icons/bi";

const CATEGORIES = [
  "Essential",
  "Functional",
  "Analytics",
  "Marketing",
  "Advertising",
  "Social Media",
  "Uncategorized",
  "Other",
];

export default function CookiePage() {
  const { query } = useRouter();
  const websiteId = query.id;
  const router = useRouter();

  const [cookies, setCookies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!websiteId) return;
    setLoading(true);
    axios
      .get(`${baseurl}/${initURL}/cookies/all/${websiteId}`)
      .then((res) => setCookies(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [websiteId]);

  const updateCategory = async (id, category) => {
    setSavingId(id);
    try {
      await axios.patch(`${baseurl}/${initURL}/cookies/${id}/classify`, {
        category,
      });
      setCookies((prev) =>
        prev.map((c) => (c._id === id ? { ...c, category } : c)),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-6 w-48 rounded bg-gray-200 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gray-100"></div>
            <div className="h-4 w-5/6 rounded bg-gray-100"></div>
            <div className="h-4 w-2/3 rounded bg-gray-100"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        {/* Header */}
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-cyan-50">Cookie Manager</h1>
            <p className="mt-1 text-sm text-white">
              Review and classify cookies detected for this website.
            </p>
          </div>

          <button
            onClick={() => router.back()}
            title="Back"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-center text-sm font-semibold text-[#2B245C] transition hover:bg-gray-100"
          >
            <BiArrowBack size={18} />
            Back
          </button>
        </div>

        {/* Table */}
        <div className="py-5 space-y-5">
          <section className="mb-3 space-y-3 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <h2 className="mb-3 text-2xl font-semibold text-[#2B245C]">
              Detected Website Cookies
            </h2>

            {cookies.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-600">
                No cookies found.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-2 font-medium">Name</th>
                      <th className="px-4 py-2 font-medium">Domain</th>
                      <th className="px-4 py-2 font-medium">Path</th>
                      <th className="px-4 py-2 font-medium">Category</th>
                      <th className="px-4 py-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cookies.map((ck) => (
                      <tr key={ck._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {ck.name}
                        </td>
                        <td className="px-4 py-2 text-gray-700">{ck.domain}</td>
                        <td className="px-4 py-2 text-gray-700">{ck.path}</td>
                        <td className="px-4 py-2">
                          {ck.category || (
                            <span className="text-gray-400 italic">
                              Unclassified
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <select
                            onChange={(e) =>
                              updateCategory(ck._id, e.target.value)
                            }
                            value={ck.category || ""}
                            disabled={savingId === ck._id}
                            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 disabled:opacity-60"
                          >
                            <option value="" disabled>
                              Select category
                            </option>
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          {savingId === ck._id && (
                            <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 align-middle"></span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
