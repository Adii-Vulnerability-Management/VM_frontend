import { baseurl, initURL } from '@/config/config';
import CustomAxios from '@/config/CustomAxios';
import Loader from '@/globalcomponents/NewUi/Loader';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function ISO42001Clauses() {

    const userData = JSON.parse(Cookies.get('user_data') || '{}');
    const role = userData.user_designation;
    const isAdmin = role.toLowerCase() === 'admin';

    const [answers, setAnswers] = useState({});
    const [clauses, setClauses] = useState([]);
    const [hasAnswers, setHasAnswers] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // fetch clauses & answers in parallel
    const loadAll = async () => {
        setIsFetching(true);
        try {
            const [clausesRes, answersRes] = await Promise.all([
                CustomAxios.get(`${baseurl}/${initURL}/iso42001/clauses`),
                CustomAxios.get(`${baseurl}/${initURL}/iso42001/clause-answers/user`),
            ]);

            setClauses(clausesRes.data);

            if (Array.isArray(answersRes.data) && answersRes.data.length > 0) {
                setHasAnswers(true);
                const map = {};
                answersRes.data.forEach((cla) =>
                    cla.steps.forEach((step) => {
                        map[step.controlId] = step.answer;
                    })
                );
                setAnswers(map);
            } else {
                setHasAnswers(false);
                setAnswers({});
            }
        } catch (err) {
            console.error('Failed to load data:', err);
            toast.error('Failed to load clauses or answers.');
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    const handleInputChange = (stepId, value) => {
        setAnswers((prev) => ({ ...prev, [stepId]: value }));
    };

    const handleSave = async () => {

        const emptyStep = clauses
            .flatMap(clause => clause.steps)
            .find(step => !(answers[step.controlId]?.trim()));
        if (emptyStep) {
            toast.error(`Please enter a response for “${emptyStep.label}” before saving.`);
            return;
        }

        setIsSaving(true);
        const bulkPayload = {
            answers: clauses.map((clause) => ({
                clauseId: clause._id,
                steps: clause.steps.map((step) => ({
                    stepId: step._id,
                    controlId: step.controlId,
                    answer: answers[step.controlId] || '',
                })),
            })),
        };

        try {
            const url = `${baseurl}/${initURL}/iso42001/clause-answers/bulk`;
            if (hasAnswers) {
                await CustomAxios.patch(url, bulkPayload);
            } else {
                await CustomAxios.post(url, bulkPayload);
                setHasAnswers(true);
            }
            toast.success('All answers saved successfully!');
            await loadAll(); // re-fetch both clauses & answers
        } catch (err) {
            console.error('Failed to save answers:', err);
            toast.error('Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isFetching) {
        return (
            <div className="h-[75vh] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded-xl border border-gray-200">
            {/* Intro */}


            <section className="mb-12">
                <h1 className="text-3xl font-bold text-[#2B245C] mb-4 border-l-4 border-[#2B245C] pl-4">
                    Introduction &amp; Step-by-Step Process
                </h1>
                <p className="text-gray-700 leading-relaxed">
                    AI compliance isn’t a one-and-done project. It’s a continuous journey
                    with clear milestones. Organizations aiming for ISO 42001
                    certification should follow Clauses 1–10 and Annex A controls.
                </p>
            </section>

            {/* Clauses */}
            {clauses.map((clause) => (
                <div key={clause._id} className="mb-12">
                    <h2 className="text-2xl font-semibold text-[#2B245C] mb-3 border-l-4 border-[#2B245C] pl-4">
                        {clause.title}
                    </h2>
                    <div className="space-y-6">
                        {clause.steps.map((step) => (
                            <div key={step.controlId} className="space-y-2">
                                <p className="font-medium text-lg text-gray-800">
                                    {step.label}
                                </p>
                                <p className="text-gray-600">{step.description}</p>
                                <textarea
                                    className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
                                    rows={3}
                                    placeholder={`Enter your response for ${step.label}...`}
                                    value={answers[step.controlId] || ''}
                                    disabled={!isAdmin}
                                    onChange={(e) =>
                                        handleInputChange(step.controlId, e.target.value)
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Save Button */}
            <div className="mt-10 text-right">
                <button
                    onClick={handleSave}
                    disabled={isSaving || !isAdmin}
                    className={`inline-block px-6 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2B245C] transition ${isSaving
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#2B245C] hover:bg-[#1e1a44]'
                        }`}
                >
                    {isSaving ? 'Saving…' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
