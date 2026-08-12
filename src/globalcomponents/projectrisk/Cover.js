export default function Cover() {
  return (
    <div className="font-sans leading-relaxed">
      <h2 className="text-2xl text-gray-800 mb-4">
        Project Risk Assessment Dashboard
      </h2>
      <p className="mb-6">
        Welcome to the <strong>Project Risk Assessment Plan</strong>. This tool
        is designed to provide a comprehensive framework for identifying,
        evaluating, and managing risks and opportunities in your project.
        Explore detailed plans, assessments, and simulations to minimize risks
        and maximize success.
      </p>

      {/* Revision History */}
      <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
        <div className="bg-blue-600 text-white text-sm font-bold p-3">
          REVISION HISTORY (LAST 3 CHANGES)
        </div>

        <table class="table-auto border-collapse border border-gray-300 text-xs w-full">
          <thead class="bg-blue-600 text-white font-bold">
            <tr>
              <th class="border border-gray-300 p-2">INDEX</th>
              <th class="border border-gray-300 p-2">
                DESCRIPTION OF THE MODIFICATION
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-300 p-2 font-semibold">T</td>
              <td class="border border-gray-300 p-2">
                <p>* LEAN IMS code update:</p>
                <p class="pl-4">
                  - <strong>Old:</strong> DEVTS-PMA-006 Project risks treatment
                  plan
                  <br />- <strong>New:</strong> DIV.04.FO.118 - Risks treatment
                  plan
                </p>
                <p>
                  * Correction of calculation of probability % in quantitative
                  risk assessment in case of probability 15 &quot;almost
                  certain&quot;
                </p>
                <p>
                  * Quantitative analysis: Residual probability and ERP budget
                  contingency trigger included in the quantitative risk
                  analysis. Complete correction of quantitative probability
                  determination. Qualitative Impact list choice strictly acc. to
                  the threat or opportunity trigger
                </p>
              </td>
            </tr>

            <tr>
              <td class="border border-gray-300 p-2 font-semibold">S</td>
              <td class="border border-gray-300 p-2">
                Add of Confidentiality in Threats checklist and Color Code for
                due date
              </td>
            </tr>

            <tr>
              <td class="border border-gray-300 p-2 font-semibold">R</td>
              <td class="border border-gray-300 p-2">
                Change in the name of the 4 steps to perform the risk analysis +
                Change of the way to calculate the qualitative risk assessment
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Project Information */}
      <div className="mt-5 p-4 border border-gray-300 rounded-lg bg-gray-50 mb-6">
        <h3 className="mb-3 text-gray-600">Project Information</h3>
        <p>
          <strong>Project Name:</strong> Example Project
        </p>
        <p>
          <strong>Document Code:</strong>{" "}
          <span className="text-blue-600">DIV.O4.FO.118</span>
        </p>
        <p>
          <strong>Description:</strong> A structured plan for identifying and
          mitigating risks while leveraging opportunities to ensure project
          success.
        </p>
        <p>
          <strong>Version:</strong> 1.0
        </p>
        <p>
          <strong>Contributors:</strong> Risk Management Team
        </p>
      </div>

      {/* Index */}
      <div className="mt-5 p-4 border border-blue-500 rounded-lg bg-blue-50 mb-6">
        <h3 className="mb-3 text-blue-600">Index</h3>
        <ul className="list-none pl-0">
          <li className="mb-2">
            <strong>1.</strong>{" "}
            <span className="text-gray-800">
              Qualitative Risk Treatment Plan
            </span>{" "}
            - Understand and evaluate risks based on probability and impact.
          </li>
          <li className="mb-2">
            <strong>2.</strong>{" "}
            <span className="text-gray-800">Quantitative Risk Assessment</span>{" "}
            - Dive into numerical data to analyze risk exposure.
          </li>
          <li className="mb-2">
            <strong>3.</strong>{" "}
            <span className="text-gray-800">Threats Checklist</span> - Track
            potential threats and their sources.
          </li>
          <li className="mb-2">
            <strong>4.</strong>{" "}
            <span className="text-gray-800">Opportunities Checklist</span> -
            Highlight and manage beneficial opportunities.
          </li>
          <li className="mb-2">
            <strong>5.</strong>{" "}
            <span className="text-gray-800">Monte Carlo Analysis</span> -
            Simulate and visualize risk outcomes for informed decision-making.
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-5 text-center">
        <p className="text-sm text-gray-500">
          For assistance, contact the <strong>Risk Management Team</strong> at{" "}
          <a
            href="mailto:support@example.com"
            className="text-blue-600 hover:underline"
          >
            support@example.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
