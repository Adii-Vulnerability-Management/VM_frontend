import React, { useState } from "react";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import { toast } from "react-toastify";
import SelectDropdown from "@/components/ui/SelectDropdown";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";

export default function SendLocationToAuditor({ cardData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null); // <-- single ID

  const handleCloseModal = () => {
    setIsOpen(false);
    setSelectedId(null);
  };
  const handleShowModal = () => setIsOpen(true);

  // Build your dropdown options
  const options = cardData.map((item) => ({
    label: `${item.locationtype} (${item.location_id})`,
    value: item._id,
  }));

  // Find the one selected option (or null)
  const selectedOption =
    options.find((opt) => opt.value === selectedId) || null;

  // onChange now receives a single option (or null when cleared)
  const handleChange = (opt) => {
    setSelectedId(opt?.value ?? null);
  };

 const handleSubmit = async (e) => {
   e.preventDefault();
   if (!selectedId) {
     toast.error("Please select a location to send.");
     return;
   }

   try {
     const record = cardData.find((item) => item._id === selectedId);
     if (!record) throw new Error(`No data for id ${selectedId}`);

     const allowedFields = [
       "company_name",
       "company_address",
       "tisax_scopeid",
       "DnBDUNS_No",
       "assessment_date",
       "contact_person_name",
       "contact_phone_number",
       "contact_email",
       "creator_name",
       "signature",
       "locationtype",
       "location_id",
       "country",
       "category",
       "assessment_level",
       "vda_version",
     ];

     const form = new FormData();
     allowedFields.forEach((key) => {
       if (record[key] !== undefined && record[key] !== null) {
         if (Array.isArray(record[key])) {
           record[key].forEach((val, index) => {
             form.append(`${key}[${index}]`, val);
           });
         } else {
           form.append(key, record[key]);
         }
       }
     });

     form.set("isInAudit", "true");

     await CustomAxios.patch(
       `${baseurl}/${initURL}/tisax/${selectedId}`,
       form,
       { headers: { "Content-Type": "multipart/form-data" } }
     );

     toast.success("Location sent to audit!");
     handleCloseModal();
   } catch (err) {
     console.error(err);
     toast.error("Failed to send to audit.");
   }
 };

  return (
    <div>
      <Button onClick={handleShowModal}>Send to Auditor</Button>

      <Dialog
        isOpen={isOpen}
        onClose={handleCloseModal}
        title="Select Location for Audit"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Select location for audit:
            </label>
            <SelectDropdown
              options={options}
              value={selectedOption}
              onChange={handleChange}
              // no isMulti here!
            />
          </div>
          <Button type="submit">Send</Button>
        </form>
      </Dialog>
    </div>
  );
}
