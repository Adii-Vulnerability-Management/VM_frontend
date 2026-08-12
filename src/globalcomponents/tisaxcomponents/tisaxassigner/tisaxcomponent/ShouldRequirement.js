import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import the CustomEditor component
const CustomEditor = dynamic(() => import("@/globalcomponents/CustomEditor"), {
  ssr: false,
});

const ShouldRequirement = ({
  item,
  groupIndex,
  itemIndex,
  handleRequirementChange,
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
          {item["Should Requirements"]?.map((requirement, reqIndex) => (
            <div key={reqIndex} className="mb-6">
              {/* Render the Should requirements */}
              <div className="flex">
                <span className="font-bold">Q{reqIndex + 1}:-</span>
                <div className="ml-2">
                  {requirement.question?.split("\n")[0]}
                </div>
              </div>

              {/* Handling multi-line paragraphs or bullet points */}
              {requirement.question
                ?.split("\n")
                .slice(1)
                .map((paragraph, paraIndex) => (
                  <div key={paraIndex} className="mt-2">
                    {paragraph.startsWith(" - ") ? (
                      <span>&#8226; {paragraph.substring(3)}</span>
                    ) : (
                      <span>{paragraph}</span>
                    )}
                  </div>
                ))}

              <br />
              {/* CustomEditor component */}
              <CustomEditor
                initialData={requirement.answer || ""}
                onChange={(value) => {
                  handleRequirementChange(
                    groupIndex,
                    itemIndex,
                    "Should",
                    reqIndex,
                    value
                  );
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShouldRequirement;
