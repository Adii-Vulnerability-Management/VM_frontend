import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const CustomEditor = dynamic(
  () => {
    return import("@/globalcomponents/CustomEditor");
  },
  {
    ssr: false,
  }
);

const AdditionalRequirement = ({
  item,
  groupIndex,
  itemIndex,
  handleAdditionalRequirementsChange,
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="text-gray-700">
          <span className="font-bold">Q1:-</span>
          {item[
            "Additional requirements for vehicles classified as requiring protection"
          ]?.question}
          <br />
          <br />
          <CustomEditor
            initialData={
              item[
                "Additional requirements for vehicles classified as requiring protection"
              ]?.answer
            }
            onChange={(value) => {
              handleAdditionalRequirementsChange(
                groupIndex,
                itemIndex,
                "answer",
                value
              );
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AdditionalRequirement;
