"use client";
import SummaryBoxes from "@/globalcomponents/rbiTracker/rbi-tracker-userdashboardcomponents/SummaryBoxes";
import SubmissionInsights from "@/globalcomponents/rbiTracker/rbi-tracker-userdashboardcomponents/SubmissionInsights";
import React from "react";
import Cookies from "js-cookie";

function RbiTrackerUserDashboard() {
  const userData = JSON.parse(Cookies.get("user_data") || "{}");

  return (
    <div className="p-6 ">
      <h2 className="text-3xl font-extrabold text-blue-700  mb-6">
        Hello,{" "}
        <span className="text-blue-900">
          {userData?.user_name
            ? userData.user_name
            : `${userData?.firstName || ""} ${
                userData?.lastName || ""
              }`.trim() || "N/A"}
        </span>
        !
      </h2>

      <SummaryBoxes />
      <SubmissionInsights />
    </div>
  );
}

export default RbiTrackerUserDashboard;
