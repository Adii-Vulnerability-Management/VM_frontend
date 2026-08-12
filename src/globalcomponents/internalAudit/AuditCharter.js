import { useState } from "react";
import {
  AiFillEnvironment,
  AiOutlineAudit,
  AiOutlineCheck,
  AiOutlineCheckCircle,
  AiOutlineClose,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlinePlus,
  AiOutlineSafety,
} from "react-icons/ai";
import { FaRegObjectGroup, FaTasks } from "react-icons/fa";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../BaseUrl";
import CustomAxios from "../CustomAxios";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Loader from "../loader/Loader";

// Reusable EditableSection Component
const EditableSection = ({ icon: Icon, title, points, setPoints }) => {
  const [newPoint, setNewPoint] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const addPoint = () => {
    if (newPoint.trim() !== "") {
      setPoints([...points, newPoint.trim()]);
      setNewPoint("");
    }
  };

  const deletePoint = (index) => {
    setPoints(points.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingValue("");
    }
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditingValue(points[index]);
  };

  const saveEdit = (index) => {
    if (editingValue.trim() !== "") {
      const updatedPoints = [...points];
      updatedPoints[index] = editingValue.trim();
      setPoints(updatedPoints);
      setEditingIndex(null);
      setEditingValue("");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold flex items-center text-blue-600 mb-4">
        {Icon && <Icon className="mr-2" />}
        {title}
      </h3>
      <ul className="list-disc pl-8 text-gray-700 space-y-2">
        {points.map((point, index) => (
          <li key={index}>
            <div className="flex items-center justify-between">
              {editingIndex === index ? (
                <input
                  type="text"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ) : (
                <p>{point}</p>
              )}
              <div className="flex items-center gap-2 ml-4">
                {editingIndex === index ? (
                  <>
                    <AiOutlineCheck
                      onClick={() => saveEdit(index)}
                      className="text-green-500 cursor-pointer"
                      size={20}
                    />
                    <AiOutlineClose
                      onClick={cancelEdit}
                      className="text-gray-500 cursor-pointer"
                      size={20}
                    />
                  </>
                ) : (
                  <>
                    <AiOutlineEdit
                      onClick={() => startEditing(index)}
                      className="text-blue-500 cursor-pointer"
                      size={20}
                    />
                    <AiOutlineDelete
                      onClick={() => deletePoint(index)}
                      className="text-red-500 cursor-pointer"
                      size={20}
                    />
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newPoint}
          onChange={(e) => setNewPoint(e.target.value)}
          placeholder="Add a new point"
          className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={addPoint}
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <AiOutlinePlus size={20} />
        </button>
      </div>
    </div>
  );
};

const AuditCharter = () => {
  const router = useRouter();
  const { programId } = router.query;
  const [auditProgramName, setAuditProgramName] = useState("");
  const [date, setDate] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState("");
  const [loading, setLoading] = useState(false);

  // State for all sections
  const [missionPoints, setMissionPoints] = useState([
    "Internal audit’s mission is to enhance and protect organizational value by providing risk-based and objective assurance, advice, and insight.",
    "The internal audit’s purpose is to provide independent, objective assurance and consulting services designed to add value and improve the organization’s operations.",
  ]);
  const [standardsPoints, setStandardsPoints] = useState([
    "The internal audit activity will govern itself by adherence to the mandatory elements of The IIA’s International Professional Practices Framework (IPPF)...",
  ]);
  const [authorityPoints, setAuthorityPoints] = useState([
    "A statement on the CAE’s functional and administrative reporting relationship in the organization.",
    "A statement that the governing body will establish, maintain, and assure that the internal audit activity has sufficient authority...",
  ]);
  const [independencePoints, setIndependencePoints] = useState([
    "A statement that the CAE will ensure that the internal audit activity remains free of conditions...",
  ]);
  const [scopePoints, setScopePoints] = useState([
    "A statement that the scope of the internal audit activities encompasses, but is not limited to...",
  ]);
  const [responsibilityPoints, setResponsibilityPoints] = useState([
    "Submitting at least annually a risk-based internal audit plan.",
  ]);
  const [qualityPoints, setQualityPoints] = useState([
    "A statement that the internal audit activity will maintain a quality assurance and improvement program...",
  ]);

  const handleSave = async () => {
    if (!auditProgramName || !date || !preparedBy || !authorizedBy) {
      toast.error("Please fill all required fields before saving.");
      return;
    }
    const sections = [
      { title: "Mission and Purpose", points: missionPoints },
      { title: "International Standards", points: standardsPoints },
      { title: "Authority", points: authorityPoints },
      { title: "Independence and Objectivity", points: independencePoints },
      { title: "Scope of Internal Audit Activities", points: scopePoints },
      { title: "Responsibility", points: responsibilityPoints },
      { title: "Quality Assurance and Improvement Program", points: qualityPoints },
    ];

    const emptySections = sections.filter(section =>
      section.points.length === 0 || section.points.every(point => point.trim() === "")
    );

    if (emptySections.length > 0) {
      const emptyTitles = emptySections.map(section => section.title).join(", ");
      toast.error(`Please add at least one valid point in: ${emptyTitles}`);
      return;
    }

    const payload = {
      auditProgramName,
      date,
      preparedBy,
      authorizedBy,
      sections: [
        { title: "Mission and Purpose", points: missionPoints },
        { title: "International Standards", points: standardsPoints },
        { title: "Authority", points: authorityPoints },
        { title: "Independence and Objectivity", points: independencePoints },
        { title: "Scope of Internal Audit Activities", points: scopePoints },
        { title: "Responsibility", points: responsibilityPoints },
        { title: "Quality Assurance and Improvement Program", points: qualityPoints },
      ]
    };

    setLoading(true);

    try {
      if (programId) {
        // PATCH API if programId exists
        await CustomAxios.patch(`${baseurl}/${initURL}/audit-charter/${programId}`, payload);
        toast.success("Audit Charter Updated Successfully!");
      } else {
        // POST API if programId does not exist
        await CustomAxios.post(`${baseurl}/${initURL}/audit-charter`, payload);
        toast.success("Audit Charter Created Successfully!");

        setAuditProgramName("");
        setDate("");
        setPreparedBy("");
        setAuthorizedBy("");

      }

    } catch (error) {
      console.error("Error saving Audit Charter:", error);
      toast.error("Failed to save Audit Charter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditCharterById = async (id) => {
    setLoading(true);
    try {
      const response = await CustomAxios.get(`${baseurl}/${initURL}/audit-charter/${id}`);
      const data = response.data;

      setAuditProgramName(data.auditProgramName || "");
      setDate(data.date ? data.date.split('T')[0] : "");  // Format date if needed
      setPreparedBy(data.preparedBy || "");
      setAuthorizedBy(data.authorizedBy || "");

      // Map sections based on titles
      data.sections.forEach(section => {
        switch (section.title) {
          case "Mission and Purpose":
            setMissionPoints(section.points);
            break;
          case "International Standards":
            setStandardsPoints(section.points);
            break;
          case "Authority":
            setAuthorityPoints(section.points);
            break;
          case "Independence and Objectivity":
            setIndependencePoints(section.points);
            break;
          case "Scope of Internal Audit Activities":
            setScopePoints(section.points);
            break;
          case "Responsibility":
            setResponsibilityPoints(section.points);
            break;
          case "Quality Assurance and Improvement Program":
            setQualityPoints(section.points);
            break;
          default:
            break;
        }
      });

      toast.success("Audit Charter loaded successfully!");
    } catch (error) {
      console.error("Error fetching Audit Charter:", error);
      toast.error("Failed to load Audit Charter.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (programId) {
      fetchAuditCharterById(programId);
    }
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
      {/* Header Fields */}
      <div className="p-6 bg-white rounded-lg shadow-md mt-8">
        <h2 className="font-bold text-[#2B245C] mb-4">e-InnoSec</h2>
        <div className="grid grid-cols-4 gap-4">

          {/* Audit Program Name */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700">Audit Program Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              value={auditProgramName}
              onChange={e => setAuditProgramName(e.target.value)}
              placeholder="Enter Audit Program Name"
              className="border px-3 py-2 rounded-md"
            />
          </div>

          {/* Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700">Date<span className="text-red-500">*</span></label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="border px-3 py-2 rounded-md"
            />
          </div>

          {/* Prepared By */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700">Prepared By<span className="text-red-500">*</span></label>
            <input
              type="text"
              value={preparedBy}
              onChange={e => setPreparedBy(e.target.value)}
              placeholder="Enter Preparer's Name"
              className="border px-3 py-2 rounded-md"
            />
          </div>

          {/* Authorized By */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700">Authorized By<span className="text-red-500">*</span></label>
            <input
              type="text"
              value={authorizedBy}
              onChange={e => setAuthorizedBy(e.target.value)}
              placeholder="Enter Authorizer's Name"
              className="border px-3 py-2 rounded-md"
            />
          </div>

        </div>
      </div>


      {/* Sections */}
      <div className="p-6 bg-white rounded-lg shadow-md mt-8">
        <EditableSection icon={AiFillEnvironment} title="Mission and Purpose" points={missionPoints} setPoints={setMissionPoints} />
        <EditableSection icon={AiOutlineSafety} title="International Standards" points={standardsPoints} setPoints={setStandardsPoints} />
        <EditableSection icon={AiOutlineAudit} title="Authority" points={authorityPoints} setPoints={setAuthorityPoints} />
        <EditableSection icon={FaRegObjectGroup} title="Independence and Objectivity" points={independencePoints} setPoints={setIndependencePoints} />
        <EditableSection icon={FaTasks} title="Scope of Internal Audit Activities" points={scopePoints} setPoints={setScopePoints} />
        <EditableSection icon={AiOutlineCheckCircle} title="Responsibility" points={responsibilityPoints} setPoints={setResponsibilityPoints} />
        <EditableSection icon={AiOutlineCheckCircle} title="Quality Assurance and Improvement Program" points={qualityPoints} setPoints={setQualityPoints} />

        <div className="flex justify-end mt-6">
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-md transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditCharter;
