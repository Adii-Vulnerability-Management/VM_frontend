import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import SignatureCanvas from "react-signature-canvas";
import { AiOutlineClear, AiOutlineSave } from "react-icons/ai";
import { baseurl, initURL } from "../../../BaseUrl";
import CustomAxios from "../CustomAxios";
import { toast } from "react-toastify";

function Nis2Cover() {
  const router = useRouter();
  const { id } = router.query; // Extract ID from URL
  const sign = useRef(null);

  const [formData, setFormData] = useState({
    company: "",
    address: "",
    dateOfAdvice: "",
    contactPerson: "",
    telephoneNumber: "",
    email: "",
    Division: "", 
    Division_Location: "", 
    reviewStatus: "pending",
    CreatedBy: { firstName: "", lastName: "", contactNumber: "", email: "" },
    ReviewedBy: { firstName: "", lastName: "", contactNumber: "", email: "" },
    ApprovedBy: { firstName: "", lastName: "", contactNumber: "", email: "" },
    signature: null,
  });

  const [url, setUrl] = useState();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // ✅ Fetch Existing Data
  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (assessmentId) => {
    setLoading(true);
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/nis2selfassessment/${assessmentId}`
      );

      if (response.data) {
        const data = response.data;

        setFormData({
          company: data.company || "",
          address: data.address || "",
          dateOfAdvice: data.dateOfAdvice
            ? new Date(data.dateOfAdvice).toISOString().split("T")[0]
            : "",
          contactPerson: data.contactPerson || "",
          telephoneNumber: data.telephoneNumber || "",
          email: data.email || "",
          reviewStatus: data.reviewStatus || "pending",
          CreatedBy: data.CreatedBy || { firstName: "", lastName: "", contactNumber: "", email: "" },
          ReviewedBy: data.ReviewedBy || { firstName: "", lastName: "", contactNumber: "", email: "" },
          ApprovedBy: data.ApprovedBy || { firstName: "", lastName: "", contactNumber: "", email: "" },
          signature: data.signature_path || null,
          Division: data.Division || "",
          Division_Location: data.Division_Location || "",
        });

        if (data.signature_path) {
          setUrl(data.signature_path);
        }
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
      toast.error("Failed to load assessment data.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prevData) => ({
        ...prevData,
        [parent]: {
          ...prevData[parent],
          [child]: value.trim(),
        },
      }));
    } else {
      setFormData({ ...formData, [name]: value.trim() });
    }
  };

  // ✅ Handle Review Status Change
  const handleChangeReviewStatus = (e) => {
    setFormData({ ...formData, reviewStatus: e.target.value });
  };

  // ✅ Handle Signature Clear
  const handleClearSignature = () => {
    if (sign.current) {
      sign.current.clear();
      setUrl("");
      setFormData({ ...formData, signature: null });
    }
  };

  // ✅ Convert Data URL to Blob
  const dataURLtoBlob = (dataURL) => {
    const byteString = atob(dataURL.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: "image/png" });
  };
 // ✅ Handle Form Delete (DELETE Request)
  const handleDelete = async () => {
    if (!id) {
      toast.error("Invalid assessment ID.");
      return;
    }
    // Confirmation dialog
    if (!window.confirm("Are you sure you want to delete this assessment?")) {
      return;
    }

    try {
      const response = await CustomAxios.delete(
        `${baseurl}/${initURL}/nis2selfassessment/${id}`
      );

      if (response.data) {
        toast.success("Assessment deleted successfully!");
        router.push("/NIS2-self-assesment/Nis2"); // Redirect after deletion
      }
    } catch (error) {
      console.error("Error deleting assessment:", error.response?.data || error);
      toast.error("Failed to delete assessment.");
    }
  };

  // ✅ Handle Signature Save
  const handleSaveSignature = () => {
    if (!sign.current || sign.current.isEmpty()) {
      toast.error("Please provide a valid signature before saving.");
      return;
    }
    setIsButtonDisabled(true);
    const signatureDataURL = sign.current.getTrimmedCanvas().toDataURL("image/png");
    const signatureBlob = dataURLtoBlob(signatureDataURL);

    setFormData({ ...formData, signature: signatureBlob });
    setUrl(signatureDataURL);
    setIsButtonDisabled(false);
  };

  // ✅ Handle Form Update (PATCH Request)
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!id) {
      toast.error("Invalid assessment ID.");
      return;
    }

    const submissionData = new FormData();

    // ✅ Send each nested field separately (Correct Approach)
    ["CreatedBy", "ReviewedBy", "ApprovedBy"].forEach((field) => {
      submissionData.append(`${field}[firstName]`, formData[field].firstName);
      submissionData.append(`${field}[lastName]`, formData[field].lastName);
      submissionData.append(`${field}[contactNumber]`, formData[field].contactNumber);
      submissionData.append(`${field}[email]`, formData[field].email);
    });


    // Append other fields
    ["company", "address", "dateOfAdvice", "contactPerson", "telephoneNumber", "email", "Division", "Division_Location", "reviewStatus"].forEach((key) => {
      if (formData[key]) {
        submissionData.append(key, formData[key]);
      }
    });

    // Append signature if updated
  if (formData.signature instanceof Blob) {
    submissionData.append(
      "signature",
      new File([formData.signature], "signature.png", { type: "image/png" })
    );
  }


    try {
      const response = await CustomAxios.patch(
        `${baseurl}/${initURL}/nis2selfassessment/${id}`,
        submissionData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data) {
        toast.success("Assessment updated successfully!");
        router.push("/NIS2-self-assesment/dashboard");
      }
    } catch (error) {
      console.error("Error updating assessment:", error.response?.data || error);
      toast.error("Failed to update assessment.");
    }
  };

  return (
    <div className="pb-4 p-4">
      <div className="p-4">
        <div className="border rounded-lg shadow-md">
          <div className="border-b px-4 py-3 bg-gray-50">
            <strong>Information Security Assessment Form</strong>
          </div>
          <div className="p-4">
            <form onSubmit={handleUpdate}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  
                {/* Company */}
                <div className="mb-2">
                  <label className="text-sm mb-0 block">Company:</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter company name"
                    required
                  />
                </div>
  
                {/* Address */}
                <div className="mb-2">
                  <label className="text-sm mb-0 block">Address:</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter address"
                    required
                  />
                </div>
  
                {/* Date of the Advice */}
                <div className="mb-2">
                  <label className="text-sm mb-0 block">Date of the Advice:</label>
                  <input
                    type="date"
                    name="dateOfAdvice"
                    value={formData.dateOfAdvice}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    required
                  />
                </div>
  
                {/* Contact Person */}
                <div className="mb-2">
                  <label className="text-sm mb-0 block">Contact Person:</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter contact person's name"
                    required
                  />
                </div>
  
                {/* Telephone Number */}
                <div className="mb-2">
                  <label className="text-sm mb-0 block">Contact Number:</label>
                  <input
                    type="tel"
                    name="telephoneNumber"
                    value={formData.telephoneNumber}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter telephone number"
                    required
                  />
                </div>
  
                {/* Email */}
                <div className="mb-2">
                  <label className="text-sm mb-0 block">Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                {/* Division */}
                <div className="mb-2">
                  <label className="text-sm mb-0 block">Division:</label>
                  <input
                    type="text"
                    name="Division"
                    value={formData.Division}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter division"
                    required
                  />
                </div>

                {/* Division Location */}
                <div className="mb-2">
                  <label className="text-sm mb-0 block">Division Location:</label>
                  <input
                    type="text"
                    name="Division_Location"
                    value={formData.Division_Location}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter division location"
                    required
                  />
                </div>
  
                {/* Created By */}
                <h5 className="col-span-2 mt-4">Created By</h5>
                <div className="mb-2">
                  <label className="text-sm mb-0 block">First Name:</label>
                  <input
                    type="text"
                    name="CreatedBy.firstName"
                    value={formData.CreatedBy.firstName}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter creator's first name"
                    required
                  />
                </div>
  
                <div className="mb-2">
                  <label className="text-sm mb-0 block">Last Name:</label>
                  <input
                    type="text"
                    name="CreatedBy.lastName"
                    value={formData.CreatedBy.lastName}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter creator's last name"
                    required
                  />
                </div>

                <div className="mb-2">
                <label className="text-sm mb-0 block">Contact Number:</label>
                <input
                  type="text"
                  name="CreatedBy.contactNumber"
                  value={formData.CreatedBy.contactNumber}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded text-sm"
                  placeholder="Enter creator's contact number"
                  required
                />
                </div>

                <div className="mb-2">
                <label className="text-sm mb-0 block">Email:</label>
                <input
                  type="email"
                  name="CreatedBy.email"
                  value={formData.CreatedBy.email}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded text-sm"
                  placeholder="Enter creator's email"
                  required
                />
                </div>

                {/* Review By */}
                <h5 className="col-span-2 mt-4">Reviewed By</h5>

                <div className="mb-2">
                  <label className="text-sm mb-0 block">First Name:</label>
                  <input
                    type="text"
                    name="ReviewedBy.firstName"
                    value={formData.ReviewedBy.firstName}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter reviewer's first name"
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="text-sm mb-0 block">Last Name:</label>
                  <input
                    type="text"
                    name="ReviewedBy.lastName"
                    value={formData.ReviewedBy.lastName}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter reviewer's last name"
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="text-sm mb-0 block">Contact Number:</label>
                  <input
                    type="text"
                    name="ReviewedBy.contactNumber"
                    value={formData.ReviewedBy.contactNumber}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter reviewer's contact number"
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="text-sm mb-0 block">Email:</label>
                  <input
                    type="email"
                    name="ReviewedBy.email"
                    value={formData.ReviewedBy.email}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter reviewer's email"
                    required
                  />
                </div>

                {/* Approved By */}
                <h5 className="col-span-2 mt-4">Approved By</h5>

                <div className="mb-2">
                  <label className="text-sm mb-0 block">First Name:</label>
                  <input
                    type="text"
                    name="ApprovedBy.firstName"
                    value={formData.ApprovedBy.firstName}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter approver's first name"
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="text-sm mb-0 block">Last Name:</label>
                  <input
                    type="text"
                    name="ApprovedBy.lastName"
                    value={formData.ApprovedBy.lastName}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter approver's last name"
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="text-sm mb-0 block">Contact Number:</label>
                  <input
                    type="text"
                    name="ApprovedBy.contactNumber"
                    value={formData.ApprovedBy.contactNumber}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter approver's contact number"
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="text-sm mb-0 block">Email:</label>
                  <input
                    type="email"
                    name="ApprovedBy.email"
                    value={formData.ApprovedBy.email}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Enter approver's email"
                    required
                  />
                </div>
  
                {/* Review Status */}
                <div className="mb-2 flex items-center col-span-2">
                  <label htmlFor="review-status" className="mr-2">Review Status:</label>
                  <select
                    id="review-status"
                    value={formData.reviewStatus}
                    onChange={handleChangeReviewStatus}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
  
                {/* Signature Section */}
                {/* <div className="mb-2 lg:col-span-2">
                  <label className="text-sm mb-0 block">Signature:</label>
                  {isEditing ? (
                    <div>
                      <SignatureCanvas
                        canvasProps={{ width: 300, height: 100, className: "border border-gray-400" }}
                        ref={sign}
                      />
                      <div className="flex space-x-4 mt-2">
                        <button type="button" onClick={handleClearSignature}>
                          <AiOutlineClear size={24} />
                        </button>
                        <button type="button" onClick={handleSaveSignature} disabled={isButtonDisabled}>
                          <AiOutlineSave size={24} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <img src={url || "https://via.placeholder.com/150"} alt="Signature" onClick={() => setIsEditing(true)} />
                  )}
                </div> */}

                <div className="col-span-2 flex justify-between mt-4">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-6 py-2 rounded"
                  >
                    Delete Assessment
                  </button>

                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded"
                    
                  >
                    Update Assessment
                  </button>
                </div>
  
              </div> 
            </form>
          </div>
        </div>
      </div>
    </div>
  );
  
}

export default Nis2Cover;

