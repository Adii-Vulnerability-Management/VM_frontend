// pages/industry/automobile/tisax/TisaxMaturity.js
import React from "react";
import { MaturityJson } from "@/config/config"; 
import Accordion from "@/components/ui/Accordion";

function TisaxMaturity() {
  return (
    <div className="bg-[#F4F4F9] min-h-screen py-6 px-4">
      <h1 className="text-3xl font-bold text-[#2B245C] mb-6">
        Information Security Assessment
      </h1>

      {MaturityJson.map((item, index) => (
        <Accordion key={index} title={item.Name}>
          {Object.entries(item).map(([key, value], i) =>
            i > 0 ? (
              <div key={i} className="mb-4">
                <p className="text-base text-gray-700">
                  <b className="text-[#2B245C]">Maturity Level {i - 1}:</b>{" "}
                  {value &&
                    value.split(/(?<=[.!?])\s+/).map((sentence, idx, arr) => (
                      <span key={idx}>
                        {sentence.trim()}
                        {idx < arr.length - 1 &&
                          sentence.trim().endsWith(".") && <br />}
                      </span>
                    ))}
                </p>
              </div>
            ) : null
          )}
        </Accordion>
      ))}
    </div>
  );
}

export default TisaxMaturity;
