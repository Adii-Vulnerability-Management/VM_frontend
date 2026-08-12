import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import the CustomEditor component
const CustomEditor = dynamic(
  () => {
    return import("@/globalcomponents/CustomEditor");
  },
  {
    ssr: false,
  }
);

const SgaAdditionalRequirement = ({
  item,
  groupIndex,
/*************  ✨ Codeium Command ⭐  *************/
/**
 * This component renders a section for Additional requirements for Simplified Group Assessments
 * inside the Tisax Information Security component.
 *
 * @param {object} item - The item object containing the information for the
 *   Additional requirements for Simplified Group Assessments section.
 * @param {number} groupIndex - The index of the parent group in the Tisax Information Security
 *   component.
 * @param {number} itemIndex - The index of the item in the parent group.
 * @param {function} handleSGA - The function to call when the user changes an answer in the
 *   Additional requirements for Simplified Group Assessments section.
 * @returns {ReactElement} A React element representing the section for Additional requirements
 *   for Simplified Group Assessments.
 */
/******  c144e95e-39de-4b5f-bb78-bdecbba2164a  *******/  itemIndex,
  handleSGA,
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000); // Set loading to false after 1 second
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex justify-center items-center">
          {/* Tailwind spinner */}
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
  {item["Additional requirements for Simplified Group Assessments"]?.map(
    (requirement, reqIndexs) => (
      <div key={reqIndexs} className="mb-6">
        {/* Render the question number and first line of the question side by side */}
        <div className="flex">
          <span className="font-bold">Q{reqIndexs + 1}:-</span>
          <div className="ml-2">{requirement?.question?.split("\n")[0]}</div>
        </div>

        {/* Render additional lines and bullet points, if any */}
        {requirement?.question?.split("\n").slice(1).map((paragraph, paraIndex) => (
          <div key={paraIndex} className="mt-2">
            {paragraph.startsWith(" - ") ? (
              <span>&#8226; {paragraph.substring(3)}</span>
            ) : (
              <span>{paragraph}</span>
            )}
          </div>
        ))}

        {/* CustomEditor component */}
        <br />
        <CustomEditor
          initialData={requirement.answer}
          onChange={(newValues) => {
            handleSGA(groupIndex, itemIndex, "SGA", reqIndexs, newValues);
          }}
        />
      </div>
    )
  )}
</div>

      )}
    </div>
  );
};

export default SgaAdditionalRequirement;
