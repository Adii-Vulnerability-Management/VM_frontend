import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const CustomEditor = dynamic(() => import('@/globalcomponents/CustomEditor'), { ssr: false });


const VeryHigh = ({
  item,
  groupIndex,
  itemIndex,
  handleRequirementChangeveryhigh,
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000); // Set loading to false after 1 second
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
        {item["Additional requirements for very high protection needs"]?.map(
          (requirement, reqIndexs) => (
            <div key={reqIndexs} className="mb-4">
              {/* Render the question number and first line of the question side by side */}
              <div className="flex">
                <span className="font-bold">Q{reqIndexs + 1}:-</span>
                <div className="ml-2">{requirement?.question?.split("\n")[0]}</div>
              </div>
      
              {/* Handle the bullet points and additional lines */}
              {requirement?.question?.split("\n").slice(1).map((paragraph, paraIndex) => (
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
                initialData={requirement.answer}
                onChange={(newValues) => {
                  handleRequirementChangeveryhigh(
                    groupIndex,
                    itemIndex,
                    "Very High",
                    reqIndexs,
                    newValues
                  );
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

export default VeryHigh;
