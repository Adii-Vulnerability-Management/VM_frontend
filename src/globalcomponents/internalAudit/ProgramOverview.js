// src/components/ProgramOverview.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import CustomAxios from '../CustomAxios';
import { baseurl, initURL } from '../../../BaseUrl';
import Loader from '../loader/Loader';
import { FiClipboard } from 'react-icons/fi';

export default function ProgramOverview() {
    const router = useRouter();
    const { programId: pidFromUrl } = router.query;

    const [charters, setCharters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewing, setViewing] = useState(null); // the charter to view in modal

    // Fetch all programs
    useEffect(() => {
        (async () => {
            try {
                const { data } = await CustomAxios.get(
                    `${baseurl}/${initURL}/audit-charter`
                );
                setCharters(data);
                if (!pidFromUrl && data.length) {
                    router.replace({
                        pathname: router.pathname,
                        query: { ...router.query, programId: data[0]._id },
                    }, undefined, { shallow: true });
                }
            } catch (err) {
                console.error('Failed to fetch Audit Charters', err);
                toast.error('Unable to load Program Overview');
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

    if (charters.length === 0) {
        return (
            <div className="w-full h-[75vh] flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <FiClipboard className="mx-auto text-gray-300 text-5xl mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                        No Programs Available
                    </h3>
                    <p className="text-sm text-gray-500">
                        You haven’t created any programs yet.<br />
                        create a Program to get started.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Table */}
            <div className="overflow-x-auto shadow rounded-lg">
                <table className="min-w-full 
 ">
                    <thead className="bg-[#2B245C]">
                        <tr className='bg-[#2B245C]'>
                            {['Program Name', 'Date', 'Prepared By', 'Authorized By', 'Actions'].map(h => (
                                <th
                                    key={h}
                                    className="px-6 py-3 text-center text-xs font-semibold text-white uppercase"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {charters.map(c => (
                            <tr key={c._id} className="hover:bg-gray-50 text-center">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {c.auditProgramName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {new Date(c.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {c.preparedBy}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {c.authorizedBy}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap  space-x-2">
                                    <button
                                        onClick={() =>
                                            router.push(
                                                {
                                                    pathname: router.pathname,
                                                    query: {
                                                        ...router.query,
                                                        programId: c._id,
                                                        subTab: 'riskAnalysis',
                                                    },
                                                },
                                                undefined,
                                                { shallow: true }
                                            )
                                        }
                                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition"
                                    >
                                        Go to Risk Analysis
                                    </button>
                                    <button
                                        onClick={() => setViewing(c)}
                                        className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-800 text-xs font-medium rounded hover:bg-gray-300 transition"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {viewing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 overflow-auto max-h-[80vh]">
                        <div className="flex justify-between bg-[#2B245C] text-white items-center border-b p-4">
                            <h3 className="text-lg font-semibold text-white">
                                {viewing.auditProgramName}
                            </h3>
                            <button
                                onClick={() => setViewing(null)}
                                className=" hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="font-semibold">Date:</span>{' '}
                                    {new Date(viewing.date).toLocaleDateString()}
                                </div>
                                <div>
                                    <span className="font-semibold">Prepared By:</span>{' '}
                                    {viewing.preparedBy}
                                </div>
                                <div>
                                    <span className="font-semibold">Authorized By:</span>{' '}
                                    {viewing.authorizedBy}
                                </div>
                                <div>
                                    <span className="font-semibold">Created At:</span>{' '}
                                    {new Date(viewing.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div className="space-y-4">
                                {viewing.sections.map(sec => (
                                    <div key={sec._id} className="border rounded-lg p-3 bg-gray-50">
                                        <h4 className="font-medium text-gray-800 mb-1">{sec.title}</h4>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                                            {sec.points.map((pt, idx) => (
                                                <li key={idx}>{pt}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
