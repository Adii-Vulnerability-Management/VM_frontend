
import { useState } from "react";

export default function ProbaImpact() {
  const [data, setData] = useState([
    {
      probability: "Almost Certain",
      likelihood: "Up to 99%",
      description: "Risk will likely occur",
      threatImpact: "Catastrophic (-30)",
      opportunityImpact: "Outstanding (+30)",
    },
    {
      probability: "Likely",
      likelihood: "Up to 75%",
      description: "Risk is likely to occur",
      threatImpact: "Critical (-15)",
      opportunityImpact: "Major Improvement (+15)",
    },
    {
      probability: "Possible",
      likelihood: "Up to 50%",
      description: "Risk may occur",
      threatImpact: "Moderate (-8)",
      opportunityImpact: "Minor Improvement (+8)",
    },
    {
      probability: "Unlikely",
      likelihood: "Up to 25%",
      description: "Risk is unlikely to occur",
      threatImpact: "Minor (-3)",
      opportunityImpact: "Negligible (+3)",
    },
    {
      probability: "Rare",
      likelihood: "Up to 5%",
      description: "Risk is very unlikely",
      threatImpact: "Insignificant (-1)",
      opportunityImpact: "Minimal (+1)",
    },
  ]);

  return (
    <div className="p-8 font-sans">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Probability-Impact Analysis
      </h2>
      <p className="text-gray-600 mb-6">
        Evaluate risks by combining their probability levels and impact
        categories for both threats and opportunities.
      </p>

      {/* Probability table */}

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-blue-600 text-white text-center font-bold p-2">
          Probability
        </div>
        <table className="table-auto w-full border-collapse border border-gray-300 text-md text-center">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border border-gray-300 p-2">Probability level</th>
              <th className="border border-gray-300 p-2">Description</th>
              <th className="border border-gray-300 p-2">
                Indicative probability
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-red-600">
              <td className="border border-gray-300 p-2 font-bold">
                Almost Certain
                <br />
                <span className="text-red-600">15</span>
              </td>
              <td className="border border-gray-300 p-2">
                Risk will likely occur
              </td>
              <td className="border border-gray-300 p-2">Up to 99 %</td>
            </tr>
            <tr className="text-orange-600">
              <td className="border border-gray-300 p-2 font-bold">
                Possible
                <br />
                <span className="text-orange-600">8</span>
              </td>
              <td className="border border-gray-300 p-2">
                Risk will possibly occur
              </td>
              <td className="border border-gray-300 p-2">Around 50 %</td>
            </tr>
            <tr className="text-yellow-600">
              <td className="border border-gray-300 p-2 font-bold">
                Unlikely
                <br />
                <span className="text-yellow-600">5</span>
              </td>
              <td className="border border-gray-300 p-2">
                Risk has is unlikely to occur
              </td>
              <td className="border border-gray-300 p-2">Between 3 and 10%</td>
            </tr>
            <tr className="text-green-600">
              <td className="border border-gray-300 p-2 font-bold">
                Rare
                <br />
                <span className="text-green-600">3</span>
              </td>
              <td className="border border-gray-300 p-2">Risk is rare</td>
              <td className="border border-gray-300 p-2">Less than 3%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* table 2 */}

      <div className="overflow-x-auto mt-10 mb-10">
        <table className="table-auto border-collapse w-full text-md text-center">
          <thead>
            <tr>
              <th className="bg-white-600 text-white p-2"></th>

              <th className="bg-red-600 text-white p-2 border border-black">
                Catastrophic
                <br />
                -30
              </th>
              <th className="bg-orange-600 text-white border border-black p-2">
                Critical
                <br />
                -15
              </th>
              <th className="bg-yellow-500 text-white border border-black p-2">
                Medium
                <br />
                -8
              </th>
              <th className="bg-yellow-300 text-black border border-black p-2">
                Insignificant
                <br />
                -3
              </th>
              <th className="bg-yellow-200 text-black border border-black p-2">
                Insignificant
                <br />3
              </th>
              <th className="bg-green-400 text-white p-2 border border-black">
                Minor Improvement
                <br />8
              </th>
              <th className="bg-green-500 text-white p-2 border border-black">
                Major Improvement
                <br />
                15
              </th>
              <th className="bg-green-600 text-white p-2 border border-black">
                Outstanding
                <br />
                30
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="bg-white text-red-600 font-bold p-2 border border-black">
                Almost Certain
                <br />
                15
              </td>
              <td className="bg-red-600 text-black p-2 border border-black">
                -450
              </td>
              <td className="bg-red-600 text-black p-2 border border-black">
                -225
              </td>
              <td className="bg-yellow-500 text-black p-2 border border-black">
                -120
              </td>
              <td className="bg-yellow-500 text-black border border-black p-2">
                -45
              </td>
              <td className="bg-green-400 text-black p-2 border border-black">
                45
              </td>
              <td className="bg-green-400 text-black p-2 border border-black">
                120
              </td>
              <td className="bg-green-500 text-black p-2 border border-black">
                225
              </td>
              <td className="bg-green-500 text-black p-2 border border-black">
                450
              </td>
            </tr>
            <tr>
              <td className="bg-white text-orange-600 font-bold p-2 border border-black">
                Possible
                <br />8
              </td>
              <td className="bg-red-600 text-black p-2 border border-black">
                -240
              </td>
              <td className="bg-yellow-500 text-black p-2 border border-black">
                -120
              </td>
              <td className="bg-yellow-500 text-black border border-black p-2">
                -64
              </td>
              <td className="bg-yellow-300 text-black p-2 border border-black">
                -24
              </td>
              <td className="bg-green-100 text-black p-2 border border-black">
                24
              </td>
              <td className="bg-green-400 text-black p-2 border border-black">
                64
              </td>
              <td className="bg-green-400 text-black p-2 border border-black">
                120
              </td>
              <td className="bg-green-500 text-black p-2 border border-black">
                240
              </td>
            </tr>
            <tr>
              <td className="bg-white text-yellow-500 font-bold p-2 border border-black">
                Unlikely
                <br />5
              </td>
              <td className="bg-red-600 text-black p-2 border border-black">
                -150
              </td>
              <td className="bg-yellow-500 text-black border border-black p-2">
                -75
              </td>
              <td className="bg-yellow-300 text-black p-2 border border-black">
                -40
              </td>
              <td className="bg-gray text-black p-2 border border-black">
                -15
              </td>
              <td className="bg-yellow-200 text-black p-2 border border-black">
                15
              </td>
              <td className="bg-green-100 text-black p-2 border border-black">
                40
              </td>
              <td className="bg-green-400 text-black p-2 border border-black">
                75
              </td>
              <td className="bg-green-500 text-black p-2 border border-black">
                150
              </td>
            </tr>
            <tr>
              <td className="bg-white text-green-500 font-bold p-2 border border-black">
                Rare
                <br />3
              </td>
              <td className="bg-red-600 text-black p-2 border border-black">
                -90
              </td>
              <td className="bg-yellow-500 text-black border border-black p-2">
                -45
              </td>
              <td className="bg-yellow-300 text-black p-2 border border-black">
                -24
              </td>
              <td className="bg-ygray text-black p-2 border border-black">
                -9
              </td>
              <td className="bg-yellow-200 text-black p-2 border border-black">
                9
              </td>
              <td className="bg-green-100 text-black p-2 border border-black">
                24
              </td>
              <td className="bg-green-400 text-black p-2 border border-black">
                45
              </td>
              <td className="bg-green-400 text-black p-2 border border-black">
                90
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Impact table */}

      <div className="overflow-x-auto mt-10 mb-10 ali">
        <table className="min-w-full text-md text-center">
          <thead>
            <tr>
              <th
                colspan="9"
                className="bg-blue-600 text-white font-bold border border-gray-200 p-2"
              >
                Impacts
              </th>
            </tr>

            <tr>
              <th className="bg-white p-2"></th>
              <th
                colspan="4"
                className="bg-blue-600 text-white font-bold border border-black p-2"
              >
                Threats
              </th>
              <th
                colspan="4"
                className="bg-blue-600 text-white font-bold border border-black p-2"
              >
                Opportunities
              </th>
            </tr>
            <tr>
              <th className="bg-white p-2"></th>
              <th className="bg-red-600 text-white border border-black p-2">
                Catastrophic <br></br> -30
              </th>
              <th className="bg-orange-600 text-white border border-black p-2">
                Critical <br></br> -15
              </th>
              <th className="bg-yellow-500 text-white border border-black p-2">
                Medium <br></br> -8
              </th>
              <th className="bg-yellow-300 text-black border border-black p-2">
                Insignificant <br></br> -3
              </th>
              <th className="bg-yellow-200 text-black border border-black p-2">
                Insignificant <br></br> 3
              </th>
              <th className="bg-green-400 text-white border border-black p-2">
                Minor Improvement <br></br> 8
              </th>
              <th className="bg-green-500 text-white border border-black p-2">
                Major Improvement <br></br> 15
              </th>
              <th className="bg-green-600 text-white border border-black p-2">
                Outstanding <br></br> 30
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="bg-blue-100 font-bold border border-black p-2">
                QUALITY
              </td>
              <td className="bg-gray-100 border border-black p-2">
                Quality concern jeopardizing project achievement
              </td>
              <td className="bg-gray-100 border border-black p-2">
                Quality concern requiring customer approval
              </td>
              <td className="bg-gray-100 border border-black p-2">
                Expert defect
              </td>
              <td className="bg-gray-100 border border-black p-2">
                Non noticeable quality concern
              </td>
              <td className="bg-gray-100 border border-black p-2">
                Non noticeable quality concern
              </td>
              <td className="bg-gray-100 border border-black p-2">
                Removal of an expert defect
              </td>
              <td className="bg-gray-100 border border-black p-2">
                Remove / avoid of Quality wall
              </td>
              <td className="bg-gray-100 border border-black p-2">
                Improvement of PPAP / PSW date
              </td>
            </tr>

            <tr>
              <td className="bg-blue-100 font-bold border border-black p-2">
                TIMING
              </td>
              <td className="bg-gray-100 border border-black p-2">
                {" "}
                &gt; X % of hours increase or Key date impossible to meet{" "}
              </td>
              <td className="bg-gray-100 border border-black p-2">
                {" "}
                &lt; X % of hours increaseor Key date difficult to meet{" "}
              </td>
              <td className="bg-gray-100 border border-black p-2">
                {" "}
                &lt; X % of hours increase
              </td>
              <td className="bg-gray-100 border border-black p-2">
                Insignificant hours increase
              </td>
              <td className="bg-gray-100 border border-black p-2">
                Insignificant hours reduction
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &lt; X % of hours reduction
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &lt; X % of hours reduction or Key date easier to meet
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &gt; X % of hours reduction
              </td>
            </tr>

            <tr>
              <td className="bg-blue-100 font-bold border border-black p-2">
                PROFITABILITY
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &gt; % Gross Margin impact or &gt; X k€ impact
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &lt; % Gross Margin impact or &lt; X k€ impact
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &lt; % Gross Margin impact or &lt; X k€ impact
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &lt; % Gross Margin impact or &lt; X k€ impact
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &lt; % Gross Margin impact or &lt; X k€ impact
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &lt; % Gross Margin impact or &lt; X k€ impact
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &lt; % Gross Margin impact or &lt; X k€ impact
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &gt; % Gross Margin impact or &gt; X k€ impact
              </td>
            </tr>

            <tr>
              <td className="bg-blue-100 font-bold border border-black p-2">
                &quot;example for project : 1M€ dev results 20 € GM&quot;
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &gt; 2 € Gross Margin or &gt; 100 k€
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &lt; 2 € Gross Margin or &lt; 100 k€
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &lt; 0,5 € Gross Margin or &lt; 10 k€
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &lt; 0,1 € Gross Margin &lt; 3 k€
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &lt; 0,1 Gross Margin &lt; 3 k€
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &lt; 0,5 € Gross Margin or &lt; 10 k€
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &lt; 2 € Gross Margin or &lt; 100 k€
              </td>
              <td className="bg-gray-100 border border-black p-2">
                &gt; 2 € Gross Margin or &gt; 100 k€
              </td>
            </tr>

            <tr>
              <td className="bg-blue-100 font-bold border border-black p-2">
                HSE
              </td>
              <td className="bg-gray-100 border border-black p-2">
                Major injury or fatality Major effect on environment
              </td>
              <td className="bg-gray-100 border border-black p-2">
                Minor injury or illness Moderate effect on environment
              </td>
              <td className="bg-gray-100 border border-black p-2">
                Injury requiring first aid Contained on site nuisances
              </td>
              <td className="bg-gray-100 border border-black p-2">No injury</td>
              <td className="bg-blue-100 border border-black p-2"></td>
              <td className="bg-blue-100 border border-black p-2"></td>
              <td className="bg-blue-100 border border-black p-2"></td>
              <td className="bg-blue-100 border border-black p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Table 4 */}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4 border-b border-gray-300 text-left">
                Probability Level
              </th>
              <th className="py-3 px-4 border-b border-gray-300 text-left">
                Likelihood
              </th>
              <th className="py-3 px-4 border-b border-gray-300 text-left">
                Description
              </th>
              <th className="py-3 px-4 border-b border-gray-300 text-left">
                Threat Impact
              </th>
              <th className="py-3 px-4 border-b border-gray-300 text-left">
                Opportunity Impact
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="py-3 px-4 border-b border-gray-300">
                  {row.probability}
                </td>
                <td className="py-3 px-4 border-b border-gray-300">
                  {row.likelihood}
                </td>
                <td className="py-3 px-4 border-b border-gray-300">
                  {row.description}
                </td>
                <td className="py-3 px-4 border-b border-gray-300 text-red-600">
                  {row.threatImpact}
                </td>
                <td className="py-3 px-4 border-b border-gray-300 text-green-600">
                  {row.opportunityImpact}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-bold text-gray-700 mb-4">
          Additional Visual Analysis
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-red-100 rounded-md shadow-md">
            <h4 className="text-lg font-semibold text-red-700 mb-2">
              Threats Summary
            </h4>
            <p className="text-sm text-gray-600">
              Focus on mitigating risks that fall under &quot;Catastrophic&quot;
              and &quot;Critical&quot; levels.
            </p>
          </div>
          <div className="p-4 bg-green-100 rounded-md shadow-md">
            <h4 className="text-lg font-semibold text-green-700 mb-2">
              Opportunities Summary
            </h4>
            <p className="text-sm text-gray-600">
              Leverage opportunities categorized as &quot;Major
              Improvement&quot; and &quot;Outstanding.&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
