import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/ui/Loader";
// const CustomEditor = dynamic(() => import("@/components/ui/CustomEditor"), {
//   ssr: false,
// });

const RequirementRenderer = ({
  item,
  sectionKey,
  groupIndex,
  itemIndex,
  levelType,
  onChangeRequirement,
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const sectionData = item[sectionKey];

  if (!sectionData) return null;

  const renderQuestionBlock = (requirement, reqIndex = 0) => (
    <div key={reqIndex} className="mb-6">
      <div className="flex">
        <span className="font-bold">Q{reqIndex + 1}:-</span>
        <div className="ml-2">{requirement?.question?.split("\n")[0]}</div>
      </div>

      {requirement?.question
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

      {/* <CustomEditor
        initialData={requirement.answer || ""}
        onChange={(value) =>
          onChangeRequirement(
            groupIndex,
            itemIndex,
            levelType,
            reqIndex,
            value
          )
        }
      /> */}

      <textarea
        rows={4}
        className="w-full border rounded p-2"
        value={requirement.answer || ""}
        onChange={(e) =>
          onChangeRequirement(
            groupIndex,
            itemIndex,
            levelType,
            reqIndex,
            e.target.value
          )
        }
      />
    </div>
  );

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex justify-center items-center">
          <Loader />{" "}
        </div>
      ) : Array.isArray(sectionData) ? (
        sectionData.map(renderQuestionBlock)
      ) : (
        renderQuestionBlock(sectionData)
      )}
    </div>
  );
};

export default RequirementRenderer;
