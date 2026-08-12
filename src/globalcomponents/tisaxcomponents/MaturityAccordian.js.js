// components/Accordion.js
import React, { useState } from "react";
import { AiOutlineDown } from "react-icons/ai";

function MaturityAccordion({ items, title }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="rounded-lg shadow-xl p-6 bg-white">
      <h2 className="text-3xl font-bold text-[#050038] mb-6">{title}</h2>
      {items.length > 0 &&
        items.map((item, index) => (
          <div key={index} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
            <div
              className="bg-[#F8F9FA] px-6 py-4 cursor-pointer shadow-sm flex justify-between items-center hover:bg-[#E0E0E0] transition duration-300 ease-in-out rounded-t-lg"
              onClick={() => toggleItem(index)}
            >
              <strong className="text-lg text-[#333333]">{item.Name}</strong>
              <AiOutlineDown
                size={20}
                className={`text-[#333333] transition-transform ${
                  openIndex === index ? "rotate-180" : "rotate-0"
                }`}
              />
            </div>
            {openIndex === index && (
              <div className="bg-white px-6 py-4 border-t border-gray-200 transition-opacity duration-300 ease-in-out rounded-b-lg">
                {Object.entries(item).map(
                  ([key, value], i) =>
                    i > 0 && (
                      <div key={i} className="mb-3">
                        <p className="text-base text-[#757575]">
                          <b className="text-[#333333]">Maturity Level {i - 1}:</b>{" "}
                          {value
                            ? value.split(/(?<=[.!?])\s+/).map((sentence, idx, arr) => (
                                <span key={idx}>
                                  {sentence.trim()}
                                  {idx < arr.length - 1 && sentence.trim().endsWith(".") ? <br /> : null}
                                </span>
                              ))
                            : null}
                        </p>
                      </div>
                    )
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

export default MaturityAccordion;
