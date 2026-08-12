
export const RISK_CATEGORY_RISK_RATE_MAP = {
  Low: 1,
  Medium: 3,
  High: 5,
  Select: null,
};

export const CONTROL_IMPLEMENTED_SCORE_MAP = {
  "Fully Implemented": 1,
  "Partially Implemented": 3,
  No: 5,
  "Not Applicable": 0,
  Select: null,
};

export const CalculateRiskMetrics = (row) => {
  const updatedRow = { ...row };

  // 1. Calculate Risk Rate from Risk Category
  if (row["Risk Category"]) {
    updatedRow["Risk Rate"] =
      RISK_CATEGORY_RISK_RATE_MAP[row["Risk Category"]] || null;
  }

  // 2. Calculate Control Point Response Rate from Control Implemented?
  if (row["Control Implemented?"]) {
    updatedRow["Control Point Response Rate"] =
      CONTROL_IMPLEMENTED_SCORE_MAP[row["Control Implemented?"]] || null;
    updatedRow["Control Point Rating Score Customer Resp"] =
      CONTROL_IMPLEMENTED_SCORE_MAP[row["Control Implemented?"]] || null;
  }

  // 3. Calculate Probability Of Risk Score
  if (
    updatedRow["Risk Rate"] &&
    updatedRow["Control Point Response Rate"] &&
    updatedRow["Probability of Risk"]
  ) {
    updatedRow["Probability Of risk Score"] =
      updatedRow["Risk Rate"] *
      updatedRow["Control Point Response Rate"] *
      updatedRow["Probability of Risk"];
  }

  // 4. Calculate Impact Of Risk Rating Score
  if (
    updatedRow["Risk Rate"] &&
    updatedRow["Control Point Response Rate"] &&
    updatedRow["Impact of Risk"]
  ) {
    updatedRow["Impact Of Risk Rating Score"] =
      updatedRow["Risk Rate"] *
      updatedRow["Control Point Response Rate"] *
      updatedRow["Impact of Risk"];
  }

  // 5. Update Risk Collate string
  updatedRow["Risk Collate Collate for VLkp"] = [
    updatedRow["Risk Rate"],
    updatedRow["Control Point Response Rate"],
    updatedRow["Probability of Risk"],
    updatedRow["Impact of Risk"],
    updatedRow["Is Control Mandatory"],
    updatedRow["Is Control People Dependant"],
    updatedRow["Is Control Process Dependant"],
    updatedRow["Is Control Technology Dependant"],
  ]
    .map((value) => {if(value !== undefined && value !== null){
      return value;
    }})
    .join("\\");

    //5.1 Calculate Maximum Risk Severity
    if (
      updatedRow["Risk Rate"] &&
      updatedRow["Control Point Response Rate"] &&
      updatedRow["Probability of Risk"] &&
      updatedRow["Impact of Risk"] &&
      updatedRow["Is Control Mandatory"] &&
      updatedRow["Is Control People Dependant"] &&
      updatedRow["Is Control Process Dependant"] &&
      updatedRow["Is Control Technology Dependant"]
    ) {
      updatedRow["Maximum Risk Severity"] =
        updatedRow["Risk Rate"] *
        updatedRow["Control Point Response Rate"] *
        updatedRow["Probability of Risk"] *
        updatedRow["Impact of Risk"] *
        updatedRow["Is Control Mandatory"] *
        updatedRow["Is Control People Dependant"] *
        updatedRow["Is Control Process Dependant"] *
        updatedRow["Is Control Technology Dependant"];
    }


  // 5.2. Calculate Calculated Risk Severity
  if (
    updatedRow["Risk Rate"] &&
    updatedRow["Control Point Response Rate"] &&
    updatedRow["Probability of Risk"] &&
    updatedRow["Impact of Risk"] &&
    updatedRow["Is Control Mandatory"] &&
    updatedRow["Is Control People Dependant"] &&
    updatedRow["Is Control Process Dependant"] &&
    updatedRow["Is Control Technology Dependant"]
  ) {
    updatedRow["Calculated Risk Severity"] =
      updatedRow["Risk Rate"] *
      updatedRow["Control Point Response Rate"] *
      updatedRow["Probability of Risk"] *
      updatedRow["Impact of Risk"] *
      updatedRow["Is Control Mandatory"] *
      updatedRow["Is Control People Dependant"] *
      updatedRow["Is Control Process Dependant"] *
      updatedRow["Is Control Technology Dependant"];
  }


  // 6. Calculate Risk Severity Calculated by multiplying all non-null values in Risk Collate for VLkp
  const riskCollateValues = [
    updatedRow["Risk Rate"],
    updatedRow["Control Point Response Rate"],
    updatedRow["Probability of Risk"],
    updatedRow["Impact of Risk"],
    updatedRow["Is Control Mandatory"],
    updatedRow["Is Control People Dependant"],
    updatedRow["Is Control Process Dependant"],
    updatedRow["Is Control Technology Dependant"],
  ].filter((value) => value !== null && value !== undefined);

  // If riskCollateValues is empty, set Risk Severity Calculated to null; otherwise, multiply the values
  updatedRow["Risk Severity Calculated"] =
    riskCollateValues.length > 0
      ? riskCollateValues.reduce((acc, value) => acc * value, 1)
      : null;

  return updatedRow;
};

export default CalculateRiskMetrics;
