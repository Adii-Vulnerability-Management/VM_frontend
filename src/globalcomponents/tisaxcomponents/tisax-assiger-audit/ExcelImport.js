import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { useDispatch, useSelector } from "react-redux";
import {
  setCoverData,
  setInformationSecurityData,
  setDataProtectionData,
  setPrototypeProtectionData,
} from "@/reduxes/SliceComponent/DataSlice";

import Link from "next/link";
import { compareTwoStrings } from "string-similarity";
import {
  setImportDataProtectionData,
  setImportInformationSecurityData,
  setImportPrototypeProtectionData,
} from "@/reduxes/SliceComponent/ImportSaveSlice";
import { useRouter } from "next/router";

const ExcelImport = (assessmentLevel) => {
  const [jsonData, setJsonData] = useState({});
  const [tableData, setTableData] = useState([]);
  const dispatch = useDispatch();
  const router = useRouter();
  const [fileSelected, setFileSelected] = useState(false);

  const assessmentlevel = assessmentLevel.assessmentLevel;
  useEffect(() => {
    const defaultSheet = "cover";
    const defaultTableData = jsonData[defaultSheet] || [];
    setTableData(defaultTableData);

    const convertedData = {};
    Object.keys(jsonData).forEach((sheetName) => {
      const sheetData = jsonData[sheetName];
      if (sheetName === "cover") {
        convertedData[sheetName] = convertData(sheetData);
      } else if (sheetName === "data protection") {
        const Data = convertDataOther(sheetData);
        const filterdata = Data.filter((item) =>
          /^\d+.\d+$/.test(item["ISA New"].trim())
        );
        convertedData[sheetName] = groupByDataProtection(filterdata);
      } else {
        const Data = convertDataOther(sheetData);
        if (Data) {
          let parentKey, parentKey_question;
          let subKey, subKey_question;
          Data.forEach((item) => {
            const single = /^\d+$/.test(item["ISA New"].trim());
            const double = /^\d+.\d+$/.test(item["ISA New"].trim());
            const triple = /^\d+.\d+.\d+$/.test(item["ISA New"].trim());
            if (single) {
              parentKey = item["ISA New"].trim();
              parentKey_question = item["Control question"];
            }
            if (double) {
              subKey = item["ISA New"].trim();
              subKey_question = item["Control question"];
            }
            if (triple) {
              const idParts = item["ISA New"].split(".");
              const triple_parentKey = idParts[0];
              const triple_subKey = idParts.slice(0, 2).join(".");

              if (
                triple_parentKey === parentKey &&
                sheetName !== "prototype protection"
              ) {
                item["Root ISA New"] = parentKey;
                item["Root Control question"] = parentKey_question;
              }
              if (triple_subKey === subKey) {
                item["Parent ISA New"] = subKey;
                item["Parent Control question"] = subKey_question;
              } else {
                item["Parent ISA New"] = "";
                item["Parent Control question"] = "";
              }
            }
          });
          const filterdata = Data.filter((item) =>
            /^\d+\.\d+\.\d+$/.test(item["ISA New"].trim())
          );
          convertedData[sheetName] = groupByDatas(filterdata);
        }
      }
    });

    dispatch(setCoverData(convertedData.cover));
    dispatch(setInformationSecurityData(convertedData["information security"]));
    dispatch(setDataProtectionData(convertedData["data protection"]));
    dispatch(setPrototypeProtectionData(convertedData["prototype protection"]));
  }, [jsonData]);

  const groupByDataProtection = (data) => {
    const groupedData = {};
    data.forEach((item) => {
      const parentKey_question = item["Root Control question"];
      const parentKey = item["Root ISA New"];
      const groupKey = `"Root ISA New":${parentKey}, "Root Control question":${parentKey_question}`;

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = { Items: [] };
      }
      const modifiedItem = {};
      Object.keys(item).forEach((key) => {
        const validCheck =
          typeof item[key] === "string" &&
          (item[key].trim().toLowerCase() === "none" ||
            item[key].trim().toLowerCase() === "na" ||
            item[key].trim() === "");

        const modifiedKey = key.replace(/\r/g, " ").trim();
        switch (true) {
          case modifiedKey.toLowerCase().includes("referenz dokumentation") ||
            modifiedKey.toLowerCase().includes("reference documentation"):
            modifiedItem["Reference Documentation"] = validCheck
              ? ""
              : [item[key].trim()];
            break;
          case modifiedKey
            .toLowerCase()
            .includes("feststellungen/prüfergebnis") ||
            modifiedKey.toLowerCase().includes("finding") ||
            modifiedKey.toLowerCase().includes("result"):
            modifiedItem["findings"] = validCheck ? "" : [item[key].trim()];
            break;
          case modifiedKey
            .toLowerCase()
            .includes("beschreibung der umsetzung") ||
            modifiedKey.toLowerCase().includes("description"):
            modifiedItem["combine answer"] = validCheck
              ? ""
              : [item[key].trim()];
            break;
          case modifiedKey.toLowerCase().includes("requirements"):
            modifiedItem["Requirements"] = [item[key].trim()];
            break;
          case modifiedKey.toLowerCase().includes("assessment"):
            modifiedItem["Assessment"] =
              typeof item[key] === "string" && item[key].trim() === ""
                ? "na"
                : item[key].trim();
            break;
          default:
            modifiedItem[modifiedKey] = item[key];
            break;
        }
      });
      groupedData[groupKey].Items.push(modifiedItem);
    });
    return Object.values(groupedData);
  };

  const groupByDatas = (data) => {
    const groupedData = {};
    data.forEach((item) => {
      const parentKey_question = item["Root Control question"];
      const parentKey = item["Root ISA New"];
      const groupKey = `"Root ISA New":${parentKey}, "Root Control question":${parentKey_question}`;
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          "Root ISA New": parentKey,
          "Root Control question": parentKey_question,
          Items: [],
        };
      }

      const modifiedItem = {};
      Object.keys(item).forEach((key) => {
        const validCheck =
          typeof item[key] === "string" &&
          (item[key].trim().toLowerCase() === "none" ||
            item[key].trim().toLowerCase() === "na" ||
            item[key].trim() === "");

        const modifiedKey = key.replace(/\r/g, " ").trim();
        switch (true) {
          case modifiedKey.toLowerCase().includes("(must)"):
            modifiedItem["Must Requirements"] = validCheck ? "" : [item[key]];
            break;
          case modifiedKey.toLowerCase().includes("referenz dokumentation") ||
            modifiedKey.toLowerCase().includes("reference documentation"):
            modifiedItem["Reference Documentation"] = validCheck
              ? ""
              : [item[key].trim()];
            break;
          case modifiedKey
            .toLowerCase()
            .includes("feststellungen/prüfergebnis") ||
            modifiedKey.toLowerCase().includes("finding") ||
            modifiedKey.toLowerCase().includes("result"):
            modifiedItem["findings"] = validCheck ? "" : [item[key].trim()];
            break;
          case modifiedKey
            .toLowerCase()
            .includes("beschreibung der umsetzung") ||
            modifiedKey.toLowerCase().includes("description"):
            modifiedItem["combine answer"] = validCheck
              ? ""
              : [item[key].trim()];
            break;
          case modifiedKey.toLowerCase().includes("(should)"):
            modifiedItem["Should Requirements"] = validCheck
              ? ""
              : [item[key].trim()];
            break;
          case modifiedKey.toLowerCase().includes("for high protection needs"):
            modifiedItem["Additional requirements for high protection needs"] =
              validCheck ? "" : [item[key]];
            break;
          case modifiedKey
            .toLowerCase()
            .includes("for very high protection needs"):
            modifiedItem[
              "Additional requirements for very high protection needs"
            ] = validCheck ? "" : [item[key]];
            break;
          case modifiedKey.toLowerCase().includes("maturity level"):
            modifiedItem["Maturity Level"] = validCheck ? 0 : item[key];
            break;
          case modifiedKey
            .toLowerCase()
            .includes(
              "additional requirements for vehicles classified as requiring protection"
            ):
            modifiedItem[
              "Additional requirements for vehicles classified as requiring protection"
            ] = validCheck ? "" : item[key];
            break;
          default:
            modifiedItem[modifiedKey] = item[key];
            break;
        }
      });
      groupedData[groupKey].Items.push(modifiedItem);
    });
    return Object.values(groupedData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      console.error("No file selected.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });

      const sheetsData = {};

      workbook.SheetNames.forEach((sheetName) => {
        const trimmedSheetName = sheetName.trim().toLowerCase();
        let newtrimmedSheetName = null;

        if (compareTwoStrings(trimmedSheetName, "cover") > 0.6) {
          newtrimmedSheetName = "cover";
        }
        if (compareTwoStrings(trimmedSheetName, "information security") > 0.6) {
          newtrimmedSheetName = "information security";
        }
        if (compareTwoStrings(trimmedSheetName, "prototype protection") > 0.6) {
          newtrimmedSheetName = "prototype protection";
        }
        if (compareTwoStrings(trimmedSheetName, "data protection") > 0.6) {
          newtrimmedSheetName = "data protection";
        }

        if (
          [
            "cover",
            "information security",
            "data protection",
            "prototype protection",
          ].includes(newtrimmedSheetName)
        ) {
          const sheet = workbook.Sheets[sheetName];

          if (compareTwoStrings(trimmedSheetName, "information security") > 0.6) {
            const jsonData = XLSX.utils.sheet_to_json(sheet, {
              header: 1,
              range: XLSX.utils.decode_range(sheet["!ref"]),
              defval: "",
            });
            const startColumnIndex = XLSX.utils.decode_col("D");
            const endColumnIndex = XLSX.utils.decode_col("W");
            const rowWithCondition = jsonData.findIndex((row) =>
              row.includes("7.1.2")
            );

            const infosheetData = jsonData
              .slice(1, rowWithCondition + 1)
              .map((row) =>
                row.filter(
                  (cell, columnIndex) =>
                    columnIndex >= startColumnIndex &&
                    columnIndex <= endColumnIndex
                )
              );

            sheetsData["information security"] = infosheetData;
          } else if (compareTwoStrings(trimmedSheetName, "cover") > 0.6) {
            const coverjsonData = XLSX.utils.sheet_to_json(sheet, {
              header: 1,
              range: XLSX.utils.decode_range(sheet["!ref"]),
              defval: "",
              dateNF: "dd/mm/yyyy",
              cellDates: true,
              raw: false,
              strip: true,
            });
            sheetsData["cover"] = coverjsonData;
          } else if (
            compareTwoStrings(trimmedSheetName, "data protection") > 0.6
          ) {
            const jsonData = XLSX.utils.sheet_to_json(sheet, {
              header: 1,
              range: XLSX.utils.decode_range(sheet["!ref"]),
              defval: "",
            });
            const startColumnIndex = XLSX.utils.decode_col("D");
            const endColumnIndex = XLSX.utils.decode_col("W");
            const rowWithCondition = jsonData.findIndex((row) =>
              row.includes("9.4")
            );

            const dataprosheetData = jsonData
              .slice(1, rowWithCondition + 1)
              .map((row) =>
                row.filter(
                  (cell, columnIndex) =>
                    columnIndex >= startColumnIndex &&
                    columnIndex <= endColumnIndex
                )
              );
            sheetsData["data protection"] = dataprosheetData;
          } else if (
            compareTwoStrings(trimmedSheetName, "prototype protection") > 0.6
          ) {
            const jsonData = XLSX.utils.sheet_to_json(sheet, {
              header: 1,
              range: XLSX.utils.decode_range(sheet["!ref"]),
              defval: "",
            });
            const startColumnIndex = XLSX.utils.decode_col("D");
            const endColumnIndex = XLSX.utils.decode_col("W");
            const rowWithCondition = jsonData.findIndex((row) =>
              row.includes("8.5.2")
            );
            const prototypesheetData = jsonData
              .slice(1, rowWithCondition + 1)
              .map((row) =>
                row.filter(
                  (cell, columnIndex) =>
                    columnIndex >= startColumnIndex &&
                    columnIndex <= endColumnIndex
                )
              );
            sheetsData["prototype protection"] = prototypesheetData;
          } else {
            sheetsData[trimmedSheetName] = XLSX.utils.sheet_to_json(sheet, {
              header: 1,
            });
          }
        }
      });

      const defaultSheet = workbook.SheetNames[0].trim().toLowerCase();
      setJsonData(sheetsData);
      setTableData(sheetsData[defaultSheet] || []);
    };

    reader.onerror = (e) => {
      console.error("Error reading file:", e.target.error);
    };

    reader.readAsBinaryString(file);
    setFileSelected(true);
  };

  const convertData = (sheetData) => {
    const result = sheetData?.reduce((acc, row) => {
      let key, value;
      row.forEach((cell) => {
        if (cell && !key) {
          key = typeof cell === "string" ? cell?.trim() : cell?.toString();
        } else if (cell && key && !value) {
          value = typeof cell === "string" ? cell?.trim() : cell?.toString();
        }
      });
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});

    const keysData = [
      "Company / Organization",
      "Address",
      "Scope/TISAX Scope ID",
      "D&B D-U-N-S® No",
      "Date of the assessment",
      "Contact person",
      "Telephone number",
      "E-mail address",
      "Creator",
      "Signature",
    ];
    const entryData = {};
    keysData.forEach((key, index) => {
      Object.keys(result)?.forEach((resultkey) => {
        const comp = compareTwoStrings(
          resultkey.toLowerCase(),
          key.toLowerCase()
        );
        if (comp > 0.7) {
          entryData[key] = result[resultkey].trim();
        }
      });
    });
    return entryData;
  };

  const convertDataOther = (sheetdata) => {
    const keys = sheetdata[0];
    const result = [];

    const findParentIndex = (parentISA) => {
      return result.findIndex((item) => item["ISA New"] === parentISA);
    };

    for (let i = 1; i < sheetdata.length; i++) {
      const values = sheetdata[i];
      const entry = {};

      keys.forEach((key, index) => {
        entry[key] = values[index];
      });

      const parentIndex = findParentIndex(entry["Parent ISA New"]);

      if (parentIndex !== -1) {
        if (!result[parentIndex].Items) {
          result[parentIndex].Items = [];
        }
        result[parentIndex].Items.push(entry);
      } else {
        result.push(entry);
      }
    }
    return result;
  };

  const handleDownload = () => {
    const wb = XLSX.utils.book_new();
    Object.keys(jsonData).forEach((sheetName) => {
      const sheetData = jsonData[sheetName];
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    const arrayBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.xlsx";
    a.click();
  };

  const defaultdataprotection = useSelector(
    (state) => state?.data?.dataProtection
  );
  const defaultInformationSecurity = useSelector(
    (state) => state.data.informationSecurity
  );
  const defoultPrototypeProtection = useSelector(
    (state) => state.data.prototypeProtection
  );

  const handleImport = (
    defaultdataprotection,
    defaultInformationSecurity,
    defoultPrototypeProtection
  ) => {
    const updatedData = [...defaultInformationSecurity];
    const newDataItems = updatedData?.map((item) => item.Items).flat();
    const updatedDataPrototype = [...defoultPrototypeProtection[0]?.Items];
    const newDataItemsPrototype = updatedDataPrototype?.map((item) => item);
    dispatch(setImportPrototypeProtectionData(newDataItemsPrototype));
    if (
      defaultdataprotection &&
      defaultdataprotection.length > 0 &&
      defaultdataprotection[0]
    ) {
      dispatch(setImportDataProtectionData(defaultdataprotection[0].Items));
    }

    dispatch(setImportInformationSecurityData(newDataItems));
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        disabled={!assessmentlevel}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
      />

      {tableData.length > 0 && (
        <Link
          href={`/importtisax/TisaxsTabs?assessment_level=${assessmentlevel}&vda_version=5.1`}
        >
          <button
            className="mt-2 ms-3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleImport(
              defaultdataprotection,
              defaultInformationSecurity,
              defoultPrototypeProtection
            )}
            disabled={!assessmentlevel}
          >
            Import
          </button>
        </Link>
      )}
    </div>
  );
};

export default ExcelImport;
