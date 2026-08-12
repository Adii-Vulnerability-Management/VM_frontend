// export const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL;
// export const baseurl = "http://34.235.207.221:7000";
export const baseurl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev.grc3.io";


export const WebShocket_baseurl = process.env.NEXT_PUBLIC_WS_BASE_URL;
export const MainLoginPageUrl = "/login";
export const VendorLoginPageUrl = "/vendor-trust/VendorLogin";

// export const initURL = "priv";
export const initURL =
  process.env.NEXT_PUBLIC_PRODUCTION === "true"
    ? "apiv2"
    : process.env.NEXT_PUBLIC_Dev;
export const WebShocket_initURL = "wsv2";

export const Headquarter = "Headquarter";
export const Sublocation = "Sublocation";
export const vdaVersionOptions = [
  { value: "5.1", label: "5.1" },
  { value: "6.0.3", label: "6.0.3" },
];
////
export const TisaxLocationTypeOptions = [
  { value: "Headquarter", label: "Headquarter" },
  { value: "Sublocation", label: "Sublocation" },
];
//
export const CategoryOptions = [
  { value: "IT Cyber", label: "IT Cyber" },
  { value: "Compliance", label: "Compliance" },
  { value: "Data Privacy", label: "Data Privacy" },
  { value: "Environmental", label: "Environmental" },
  { value: "Finance", label: "Finance" },
  { value: "Legal", label: "Legal" },
  { value: "Operations", label: "Operations" },
];

export const statusInProgress = "In Progress";
export const statusAnswered = "Answered";
export const statusReviewed = "Reviewed";
export const statusRejected = "Rejected";
