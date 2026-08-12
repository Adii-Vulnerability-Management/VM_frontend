import React, { useState } from 'react';
import Select from "react-select";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";
import { toast } from "react-toastify";

function SendEmailAuditor(props) {
    const { cardData } = props;
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ optiondata: [], email: '' });
    const [errors, setErrors] = useState({ email: '', optiondata: '' });

    const handleCloseModal = () => {
        setShowModal(false);
        setErrors({ email: '', optiondata: '' });
    };

    const handleShowModal = () => setShowModal(true);

    const handleChange = (e) => {
        if (e.target) {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });

            if (name === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                setErrors({ ...errors, email: value && !emailRegex.test(value) ? 'Please enter a valid email address' : '' });
            }

            if (name === 'optiondata') {
                setFormData({ ...formData, optiondata: value });
                setErrors({ ...errors, optiondata: value.length > 0 ? '' : 'Please select at least one option' });
            }
        } else {
            const selectedValues = e.map(option => option.value);
            setFormData({ ...formData, optiondata: selectedValues });
            setErrors({ ...errors, optiondata: selectedValues.length > 0 ? '' : 'Please select at least one option' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const requiredFields = ["email", "optiondata"];
        const missingFields = requiredFields.filter(field => {
            if (field === "optiondata") {
                return !formData || !formData[field]?.length;
            }
            return !formData || !formData[field];
        });

        if (missingFields.length > 0) {
            setErrors({ ...errors, ...missingFields.reduce((acc, curr) => ({ ...acc, [curr]: 'This field is required.' }), {}) });
            return;
        }

        try {
            const response = await CustomAxios.post(`${baseurl}/${initURL}/tisax/share_with_auditor`, {
                ids: formData.optiondata,
                email_id: formData.email
            });

            if (response.status === 201) {
                toast.success(response.data);
                handleCloseModal();
            } else {
                toast.error('Failed to send data.');
            }

            setErrors(null);
            setFormData({
                optiondata: [],
                email: '',
            });
        } catch (error) {

        }
    };

    return (
        <div>
            <button
                className="bg-[#007ACC] hover:bg-[#005A99] text-white font-semibold text-md py-2 px-4 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition duration-300 ease-in-out transform my-2"
                onClick={handleShowModal}
            >
                Send to Auditor
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        <div className="px-6 py-4">
                            <h3 className="text-lg font-medium mb-4">Select Auditor</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Select for audit:</label>
                                    <Select
                                        classNamePrefix={"react-select"}
                                        isMulti
                                        name="optiondata"
                                        options={cardData?.map(item => ({ label: `${item?.locationtype}(${item?.location_id})`, value: item?._id }))}
                                        onChange={handleChange}
                                    />
                                    {errors.optiondata && <p className="text-red-500 text-sm">{errors.optiondata}</p>}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter email address"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        className="bg-red-500 text-white text-sm px-4 py-2 rounded"
                                        onClick={handleCloseModal}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white text-sm px-4 py-2 rounded"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SendEmailAuditor;
