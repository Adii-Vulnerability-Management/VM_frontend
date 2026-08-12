import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SideNavbar from "@/globalcomponents/layouts/SideNavbar";
import "tailwindcss/tailwind.css";
import Cookies from "js-cookie";

function DefaultDashboard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const isExcludedPage = [
    "/login",
    "/login/mfaVerification",
    "/signup",
    "/",
    "/vendor-trust/VendorLogin",
    "/vendor-trust/VendorPass",
    "/vendor-trust/VendorResponseInput",
    "/vendor-trust/auditreport",
    "/third-parties-risk-management/ThirdPartyLogin",
    "/third-parties-risk-management/ThirdPartyPass",
    "/third-parties-risk-management/ThirdPartyResponseInput",
    "/third-parties-risk-management/auditreport",
    "/customer-trust/ReviewerLogin",
    "/customer-trust/ReviewerPass",
    "/customer-trust/ReviewerResponseInput",
    "/customer-trust/CustomerResponseInput",
      "/customer-trust/auditreport", // CUSTOMER TRUST AUDIT REPORT PAGE

  ].includes(router.pathname); // Exclude sidebar on login and home pages

  // useEffect(() => {
  //   const userData = Cookies.get('user_data');
  //   if (userData) {
  //     setIsAuthenticated(true);
  //   }
  // }, []);

  return (
    <div className="flex w-full h-screen transition-transform">
      {/* Conditionally render the Sidebar only if not on the login page */}
      {!isExcludedPage && <SideNavbar />}

      {/* Main content */}
      <div className="w-full overflow-y-auto">{children}</div>
    </div>
  );
}

export default DefaultDashboard;
