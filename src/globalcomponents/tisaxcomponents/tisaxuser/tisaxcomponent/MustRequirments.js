import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import debounce from "lodash/debounce";

// Dynamically import the CustomEditor component
const CustomEditor = dynamic(
  () => import("../../../CustomEditor"),
  { ssr: false }
);

const MustRequirements = ({ item, groupIndex, itemIndex, handleRequirementChange }) => {
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
          {item["Must Requirements"]?.map((requirement, reqIndex) => (
            <div key={reqIndex} className="mb-6">
              {/* Render the Must requirements */}
              <div className="flex">
                <span className="font-bold">Q{reqIndex + 1}:-</span>
                <div className="ml-2">{requirement.question?.split("\n")[0]}</div>
              </div>

              {/* Handling multi-line paragraphs or bullet points */}
              {requirement.question?.split("\n").slice(1).map((paragraph, paraIndex) => (
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
                onChange={debounce((value) => {
                  handleRequirementChange(groupIndex, itemIndex, "Must", reqIndex, value);
                }, 300)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MustRequirements;
