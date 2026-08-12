import React from "react";

export default function RBITrackerDef() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen font-sans">
      {/* Header Section */}
      <h1 className="text-4xl font-extrabold text-blue-800 mb-8">
        RBI Tracker Definitions
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        The RBI Tracker and Submission Portal is designed to streamline the
        management of bank returns, employee roles, and submission tracking.
        This portal empowers administrators and employees with effective tools
        for seamless workflows.
      </p>

      {/* Definition Sections */}
      <div className="space-y-8">
        {/* Branch Management */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-300">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            Branch Management
          </h2>
          <p className="text-gray-600">
            Administrators can manage branch details, which serve as a central
            point for organizing employees and departments.
          </p>
          <ul className="list-disc ml-6 mt-4 text-gray-600 space-y-2">
            <li>Add new branches and associate employees with them.</li>
            <li>Track branch-wise employees and their activities.</li>
          </ul>
        </div>

        {/* Department Management */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-300">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            Department Management
          </h2>
          <p className="text-gray-600">
            Departments help in categorizing employees within a branch based on
            roles and responsibilities for efficient task allocation.
          </p>
          <ul className="list-disc ml-6 mt-4 text-gray-600 space-y-2">
            <li>Create departments within branches to organize employees.</li>
            <li>Assign employees to specific departments.</li>
            <li>Track departmental activities effectively.</li>
          </ul>
        </div>

        {/* Employee Management */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-300">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            Employee Management
          </h2>
          <p className="text-gray-600">
            Employees can be added individually or linked to a specific branch
            or department. Upon addition, employees receive their login
            credentials via email.
          </p>
          <ul className="list-disc ml-6 mt-4 text-gray-600 space-y-2">
            <li>Add employees to branches or departments.</li>
            <li>Assign roles and responsibilities to employees.</li>
            <li>Send automated email notifications with login credentials.</li>
          </ul>
        </div>

        {/* Return Assignment */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-300">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            Return Assignment Process
          </h2>
          <p className="text-gray-600">
            Admins can assign returns by selecting the return type, specifying
            start and end dates, and setting the frequency. The system
            automatically calculates submission and reminder dates.
          </p>
          <ul className="list-disc ml-6 mt-4 text-gray-600 space-y-2">
            <li>
              Admin selects a <strong>return</strong>, sets{" "}
              <strong>start</strong> and <strong>end dates</strong>, and chooses
              a <strong>frequency</strong> (e.g., Weekly, Monthly).
            </li>
            <li>
              Submission dates are auto-calculated based on frequency (e.g.,
              every Friday for weekly frequency).
            </li>
            <li>Reminders are sent 3 days before submission dates.</li>
            <li>
              Returns are assigned to employees by searching their{" "}
              <strong>name</strong> or <strong>employee ID</strong>.
            </li>
            <li>
              Both admin and employee receive email notifications with
              assignment details.
            </li>
          </ul>
          <p className="mt-4 text-gray-600">
            <strong>Example:</strong> If the start date is <em>01/01/2025</em>,
            the end date is <em>31/01/2025</em>, and the frequency is{" "}
            <em>Weekly</em>, the system will generate 4 submission dates and
            corresponding reminders.
          </p>
        </div>

        {/* Tracking and Notifications */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-300">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            Tracking and Notifications
          </h2>
          <p className="text-gray-600">
            The dashboard provides a centralized tracking mechanism for both
            admins and employees.
          </p>
          <ul className="list-disc ml-6 mt-4 text-gray-600 space-y-2">
            <li>
              <strong>Admin Dashboard:</strong> View assigned returns, monitor
              submission statuses, and review employee comments.
            </li>
            <li>
              <strong>Employee Portal:</strong> Employees can view their
              assigned returns, submit reports, and add comments.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
