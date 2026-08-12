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

const Requirment = ({ item, index, handleFormChangeRequirement }) => {
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
          {item["Requirements"].map((requirement, reqIndex) => (
            <div key={reqIndex} className="mb-6">
              <span className="font-bold">Q{reqIndex + 1}:-</span>
              {requirement?.question
                ?.split("\n")
                .map((paragraph, paraIndex) => (
                  <span key={paraIndex} className="block mt-2">
                    {paragraph.startsWith(" - ") ? (
                      <span>&#8226; {paragraph.substring(3)}</span>
                    ) : (
                      paragraph
                    )}
                  </span>
                ))}
              <br />
              <CustomEditor
                initialData={requirement.answer || ""}
                onChange={(myvalue) => {
                  handleFormChangeRequirement(index, reqIndex, "answer", myvalue);
                }}
              />
              <br />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requirment;
