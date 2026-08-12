import { useRouter } from 'next/router';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import CustomAxios from '../CustomAxios';
import { baseurl, initURL } from '../../../BaseUrl';
import Loader from '../loader/Loader';


const fields = [
  { label: 'Unit (Division)', name: 'unit' },
  { label: 'Department', name: 'department' },
  { label: 'Business Area', name: 'businessArea' },
  { label: 'Process Area (Audit Topic)', name: 'processArea' },
  { label: 'Audit Ref', name: 'auditRef' },
  { label: 'Audit Area', name: 'auditTopic' },
  { label: 'Audit Type', name: 'auditType' },
  { label: 'Risk Ref', name: 'riskRef' },
  { label: 'Risk Category', name: 'riskCategory' },
  { label: 'Risk Description', name: 'riskDescription' },
  { label: 'Risk', name: 'residualRisk' },
  { label: 'Overall Assurance Rating', name: 'overallAssuranceRating' },
  { label: 'Last Audit', name: 'lastAudit' },
  { label: 'Objective', name: 'objective' },
  { label: 'Scope', name: 'scope' },
  { label: 'Budget', name: 'budget' },
  { label: 'Days', name: 'days' },
  { label: 'Report Outcome', name: 'reportOutcome' },
  { label: 'Key Contracts', name: 'keyContracts' }
];

// Fields that user must fill in this section
const userFieldNames = [
  'lastAudit',
  'objective',
  'scope',
  'budget',
  'days',
  'reportOutcome',
  'keyContracts'
];

const corporateNames = ['unit', 'department', 'businessArea', 'processArea', 'auditRef',
  'auditTopic',
  'auditType',];
const riskNames = [
  'riskCategory',
  'riskPriority',
  'riskRef',
  'riskDescription',
  'residualRisk',
  'overallAssuranceRating',
];
const corporateFields = fields.filter(f => corporateNames.includes(f.name));
const riskFields = fields.filter(f => riskNames.includes(f.name));
const additionalFields = fields.filter(
  f => !corporateNames.includes(f.name) && !riskNames.includes(f.name)
);

const getColumnBgColor = (index) => {
  if (index < 7) return '#4d93d9';
  if (index < 12) return '#153d64';
  return '#0b3040';
};
const alwaysDisabled = new Set([
  'unit',
  'department',
  'businessArea',
  'processArea',
  'auditTopic',
  'overallAssuranceRating',
  'residualRisk',
]);
export default function AuditUniverse() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { programId } = router.query;
  const [universeData, setUniverseData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [formData, setFormData] = useState({});
  const [comment, setComment] = useState('');

  // Load selected entry into formData
  useEffect(() => {
    if (selectedIndex !== null) {
      setFormData({ ...universeData[selectedIndex] });
    } else {
      setFormData({});
    }
  }, [selectedIndex, universeData]);



  // Generic change handler for text fields
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSaveChanges = async () => {
    if (selectedIndex === null) {
      toast.info("Please select a row first");
      return;
    }
    if (!programId) {
      toast.error("Program ID Not found!")
      return;
    }

    // Validate required fields (including nested ones)
    const requiredFields = [
      'unit', 'department', 'businessArea', 'processArea',
      'auditRef', 'auditTopic', 'auditType',
      'riskRef', 'riskCategory', 'riskDescription',
      'lastAudit', 'objective', 'scope', 'budget',
      'days', 'reportOutcome', 'keyContracts',
    ];

    const missingFields = [];

    requiredFields.forEach(field => {
      const value = formData[field];

      // Handle nested corporate objects
      if (['unit', 'department', 'businessArea', 'processArea'].includes(field)) {
        const nestedValue = formData[field]?.name || formData[field]?.departmentName;
        if (!nestedValue || nestedValue.trim() === '') {
          missingFields.push(field);
        }
      } else if (!value || value.toString().trim() === '') {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      const readable = missingFields.map(f => {
        const match = fields.find(field => field.name === f);
        return match ? match.label : f;
      });
      toast.error(`Please fill in: ${readable.join(', ')}`);
      return;
    }

    const entry = universeData[selectedIndex];
    const id = entry._id;

    const updatePayload = {
      // corporate refs (always as raw IDs)
      unit: formData.unit?._id ?? formData.unit,
      department: formData.department?._id ?? formData.department,
      businessArea: formData.businessArea?._id ?? formData.businessArea,
      processArea: formData.processArea?._id ?? formData.processArea,

      // newly editable risk/audit fields
      auditRef: formData.auditRef,
      auditTopic: formData.auditTopic,
      auditType: formData.auditType,
      riskRef: formData.riskRef,
      riskCategory: formData.riskCategory,
      riskDescription: formData.riskDescription,

      // the rest of your “planning” fields
      lastAudit: formData.lastAudit,
      objective: formData.objective,
      scope: formData.scope,
      budget: formData.budget,
      days: formData.days,
      reportOutcome: formData.reportOutcome,
      keyContracts: formData.keyContracts,
    };
    setLoading(true);

    try {
      await CustomAxios.patch(
        `${baseurl}/${initURL}/audit-universe/${id}`,
        updatePayload
      );
      await fetchUniverse();
      toast.success("Updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };


  const fetchUniverse = async () => {
    if (!programId) {
      return;
    }
    setLoading(true);
    try {
      const { data } = await CustomAxios.get(
        `${baseurl}/${initURL}/audit-universe/program/${programId}`
      );
      setUniverseData(data);
    } catch (err) {
      console.error('Failed to load audit universe:', err);
      toast.error('Could not load Audit Universe data.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (selectedIndex !== null) {
      const entry = universeData[selectedIndex]
      setFormData({
        ...entry,
        // seed our lastAudit datepicker from processArea.lastAuditDate
        lastAudit: entry.processArea?.lastAuditDate ?? ''
      })
      setComment(`💡 Note: Data is coming from Risk Assessment ${entry.type}`)
    } else {
      setFormData({ type: '' })
      setComment('')
    }
  }, [selectedIndex, universeData])

  useEffect(() => {
    fetchUniverse();
  }, [programId]);

  if (loading) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  return (
    <div className="p-4">
      {/* Top form split into 3 cards */}
      {comment && (
        <div className="mb-4 px-4 py-2 bg-gray-100 border-l-4 border-gray-400 text-gray-700 italic rounded">
          {comment}
        </div>
      )}
      <div className="space-y-8 mb-4">
        {/* Corporate Details */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-[#2B245C] px-6 py-4">
            <h3 className="text-xl font-semibold text-white">Corporate</h3>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {corporateFields.map(f => {
              // pick the right display value
              const displayValue =
                f.name === 'unit'
                  ? formData.unit?.name ?? ''
                  : f.name === 'department'
                    ? formData.department?.departmentName ?? ''
                    : f.name === 'businessArea'
                      ? formData.businessArea?.name ?? ''
                      : f.name === 'processArea'
                        ? formData.processArea?.name ?? ''
                        : formData[f.name] ?? '';

              return (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">
                    {f.label}
                  </label>
                  <input
                    type="text"
                    name={f.name}
                    value={displayValue}
                    onChange={handleFieldChange}
                    disabled={alwaysDisabled.has(f.name)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-800 text-sm 
               focus:outline-none focus:ring-2 focus:ring-[#2B245C] focus:border-transparent
               disabled:opacity-60 disabled:bg-gray-50 disabled:cursor-not-allowed transition"
                  />
                </div>
              );
            })}

          </div>
        </div>

        {/* Risk Details */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-[#2B245C] px-6 py-4">
            <h3 className="text-xl font-semibold text-white">Risk</h3>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {riskFields.map(f => {
              const val = formData[f.name] ?? '';
              return (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">
                    {f.label}
                  </label>
                  <input
                    type="text"
                    name={f.name}
                    value={val}
                    // only disable if empty
                    disabled={alwaysDisabled.has(f.name)}
                    onChange={handleFieldChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-[#2B245C] focus:border-transparent
                     disabled:opacity-60 disabled:cursor-not-allowed transition"
                  />
                </div>
              )
            })}
          </div>

        </div>

        {/* Audit Planning */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-[#2B245C] px-6 py-4">
            <h3 className="text-xl font-semibold text-white">Audit Planning</h3>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {additionalFields.map(f => {
              const isEditable = userFieldNames.includes(f.name)
              const isDateField = f.name === 'lastAudit'

              return (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">
                    {f.label}
                  </label>

                  {isDateField ? (
                    <input
                      type="date"
                      name="lastAudit"
                      value={formData.lastAudit ? formData.lastAudit.slice(0, 10) : ''}
                      disabled={!isEditable}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        lastAudit: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : ''
                      }))}
                      className={`w-full px-3 py-2 rounded-md text-sm transition
                ${isEditable
                          ? 'bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B245C] focus:border-transparent'
                          : 'bg-gray-50 border border-gray-200 opacity-60 cursor-not-allowed'
                        }`}
                    />
                  ) : (
                    <input
                      type="text"
                      name={f.name}
                      value={formData[f.name] ?? ''}
                      disabled={!isEditable}
                      onChange={isEditable ? handleFieldChange : undefined}
                      className={`w-full px-3 py-2 rounded-md text-sm transition
                ${isEditable
                          ? 'bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B245C] focus:border-transparent'
                          : 'bg-gray-50 border border-gray-200 opacity-60 cursor-not-allowed'
                        }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>


      {/* Save button */}
      <div className="text-right">
        <button
          // onClick={handleSave}
          onClick={handleSaveChanges}
          disabled={selectedIndex === null}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
        >
          Save
        </button>
      </div>

      {/* Table with selection (unchanged) */}
      <div className="bg-white">
        <h2 className="text-xl font-semibold mb-2">Audit Universe</h2>
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full border border-gray-300 text-sm text-center rounded-lg">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Select</th>
                {fields.map((f, i) => (
                  <th
                    key={f.name}
                    className="border border-gray-300 p-2 text-white"
                    style={{ backgroundColor: getColumnBgColor(i) }}
                  >
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {universeData.map((entry, ri) => (
                <tr key={ri} className={selectedIndex === ri ? 'bg-gray-100' : ''}>
                  <td className="border border-gray-300 p-2">
                    <input
                      type="radio"
                      className='cursor-pointer'
                      name="selectedEntry"
                      checked={selectedIndex === ri}
                      onChange={() => setSelectedIndex(ri)}
                    />
                  </td>
                  {fields.map(f => {
                    let displayValue = '';

                    // populated corporate refs
                    if (f.name === 'unit') {
                      displayValue = entry.unit?.name ?? '';
                    } else if (f.name === 'department') {
                      displayValue = entry.department?.departmentName ?? '';
                    } else if (f.name === 'businessArea') {
                      displayValue = entry.businessArea?.name ?? '';
                    } else if (f.name === 'processArea') {
                      displayValue = entry.processArea?.name ?? '';
                    }
                    else if (f.name === 'lastAudit') {                      // ← new case
                      const d = entry?.processArea?.lastAuditDate
                      displayValue = d ?
                        new Date(d).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                        : ''
                    } else {
                      displayValue = entry[f.name] ?? '';
                    }

                    return (
                      <td key={f.name} className="border border-gray-300 p-2">
                        {displayValue}
                      </td>
                    );
                  })}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
