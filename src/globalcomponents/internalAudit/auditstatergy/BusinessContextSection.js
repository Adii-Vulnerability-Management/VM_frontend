
export default function BusinessContextSection({ data, onChange }) {
    return (
        <>

            <div className="grid grid-cols-2 gap-6">
                {/* Question Fields */}
                <label className="block font-medium text-gray-600 mb-2">
                    What are your key business objectives and resultant goals for the
                    next two to five years?
                </label>
                <textarea
                    name="keyObjectives"
                    value={data.keyObjectives}
                    onChange={e => onChange('keyObjectives', e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    rows={3}
                ></textarea>

                <label className="block font-medium text-gray-600 mb-2">
                    What are your primary strategies? How do you plan to execute on
                    these strategies?
                </label>
                <textarea
                    name="primaryStrategies"
                    value={data.primaryStrategies}
                    onChange={e => onChange('primaryStrategies', e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    rows={3}
                ></textarea>

                <label className="block font-medium text-gray-600 mb-2">
                    What is the direction of the key product line, supply chain,
                    service offerings, etc.?
                </label>
                <textarea
                    name="direction"
                    value={data.direction}
                    onChange={e => onChange('direction', e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    rows={3}
                ></textarea>

                <label className="block font-medium text-gray-600 mb-2">
                    How will you know if your unit is successful? What will you
                    measure?
                </label>
                <textarea
                    name="successMeasures"
                    value={data.successMeasures}
                    onChange={e => onChange('successMeasures', e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    rows={3}
                ></textarea>

                <label className="block font-medium text-gray-600 mb-2">
                    What are the key success factors that will make or break your
                    unit’s success long-term?
                </label>
                <textarea
                    name="keySuccessFactors"
                    value={data.keySuccessFactors}
                    onChange={e => onChange('keySuccessFactors', e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    rows={3}
                ></textarea>

                <label className="block font-medium text-gray-600 mb-2">
                    What major obstacles will the business unit face in reaching these
                    objectives?
                </label>
                <textarea
                    name="obstacles"
                    value={data.obstacles}
                    onChange={e => onChange('obstacles', e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    rows={3}
                ></textarea>

                <label className="block font-medium text-gray-600 mb-2">
                    Technological: Evolution, impact, and disruption of technology
                    change
                </label>
                <textarea
                    name="technological"
                    value={data.technological}
                    onChange={e => onChange('technological', e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    rows={3}
                ></textarea>

                <label className="block font-medium text-gray-600 mb-2">
                    Political: Political attitudes, institutions, and legislation
                    shifting the political environment
                </label>
                <textarea
                    name="political"
                    value={data.political}
                    onChange={e => onChange('political', e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    rows={3}
                ></textarea>

                <label className="block font-medium text-gray-600 mb-2">
                    Economic: Factors in the economic environment locally and globally
                    that influence businesses and government
                </label>
                <textarea
                    name="economic"
                    value={data.economic}
                    onChange={e => onChange('economic', e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    rows={3}
                ></textarea>

                <label className="block font-medium text-gray-600 mb-2">
                    Social and cultural: Attitudes, behaviors, and lifestyles of
                    individuals and groups in a society
                </label>
                <textarea
                    name="social"
                    value={data.social}
                    onChange={e => onChange('social', e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    rows={3}
                ></textarea>

                <label className="block font-medium text-gray-600 mb-2">
                    Trust and ethics: Ethical expectations, behaviors, duties, and
                    biases of people and companies
                </label>
                <textarea
                    name="ethics"
                    value={data.ethics}
                    onChange={e => onChange('ethics', e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    rows={3}
                ></textarea>

                <label className="block font-medium text-gray-600 mb-2">
                    Regulatory and legal: Changes in laws and governmental policies
                    and regulations
                </label>
                <textarea
                    name="regulatory"
                    value={data.regulatory}
                    onChange={e => onChange('regulatory', e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    rows={3}
                ></textarea>

                <label className="block font-medium text-gray-600 mb-2">
                    Environmental: Technical, political, economic, cultural, and legal
                    changes supporting environmental protection
                </label>
                <textarea
                    name="environmental"
                    value={data.environmental}
                    onChange={e => onChange('environmental', e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    rows={3}
                ></textarea>
            </div>
        </>
    )
}
