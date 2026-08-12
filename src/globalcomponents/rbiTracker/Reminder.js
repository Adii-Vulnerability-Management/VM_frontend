import React, { useState } from "react";
import { format, addDays, subDays, lastDayOfMonth, getDay } from "date-fns";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const ReminderSystem = ({
  propfrequency = "monthly",
  reminders = [],
  setReminders,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [frequency, setFrequency] = useState(propfrequency.toLowerCase());
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getFridays = (start, end) => {
    const fridays = [];
    let current = new Date(start);
    current.setDate(current.getDate() + ((5 - current.getDay() + 7) % 7)); // Set to first Friday
    while (current <= end) {
      fridays.push(new Date(current));
      current.setDate(current.getDate() + 7); // Add 7 days for the next Friday
    }
    return fridays;
  };

  const calculateDates = () => {
    if (!startDate) {
      toast.error("Start Date is required!");
      return;
    }
    if (!endDate) {
      toast.error("End Date is required!");
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    let submissionDates = [];

    if (frequency === "weekly") {
      submissionDates = getFridays(start, end);
    } else if (frequency === "monthly") {
      let currentMonth = new Date(start);
      while (currentMonth <= end) {
        const lastDay = lastDayOfMonth(currentMonth);
        const lastFriday =
          getDay(lastDay) >= 5
            ? subDays(lastDay, getDay(lastDay) - 5)
            : subDays(lastDay, getDay(lastDay) + 2);
        if (lastFriday <= end) submissionDates.push(lastFriday);
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        currentMonth.setDate(1);
      }
    } else if (frequency === "fortnightly") {
      let currentDate = new Date(start);
      // Align to the nearest Friday
      currentDate.setDate(
        currentDate.getDate() + ((5 - currentDate.getDay() + 7) % 7)
      );

      while (currentDate <= end) {
        submissionDates.push(new Date(currentDate));
        currentDate = addDays(currentDate, 14); // Add 14 days
      }
    } else if (frequency === "quarterly") {
      let currentMonth = new Date(start);
      while (currentMonth <= end) {
        if ([2, 5, 8, 11].includes(currentMonth.getMonth())) {
          const lastDay = lastDayOfMonth(currentMonth);
          const lastFriday =
            getDay(lastDay) >= 5
              ? subDays(lastDay, getDay(lastDay) - 5)
              : subDays(lastDay, getDay(lastDay) + 2);
          if (lastFriday <= end) submissionDates.push(lastFriday);
        }
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        currentMonth.setDate(1);
      }
    } else if (frequency === "half-yearly") {
      let currentMonth = new Date(start);
      while (currentMonth <= end) {
        if ([5, 11].includes(currentMonth.getMonth())) {
          const lastDay = lastDayOfMonth(currentMonth);
          const lastFriday =
            getDay(lastDay) >= 5
              ? subDays(lastDay, getDay(lastDay) - 5)
              : subDays(lastDay, getDay(lastDay) + 2);
          if (lastFriday <= end) submissionDates.push(lastFriday);
        }
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        currentMonth.setDate(1);
      }
    } else if (frequency === "yearly") {
      let currentYear = new Date(start);
      while (currentYear <= end) {
        const lastDay = lastDayOfMonth(new Date(currentYear.setMonth(11))); // December
        const lastFriday =
          getDay(lastDay) >= 5
            ? subDays(lastDay, getDay(lastDay) - 5)
            : subDays(lastDay, getDay(lastDay) + 2);
        if (lastFriday <= end) submissionDates.push(lastFriday);
        currentYear.setFullYear(currentYear.getFullYear() + 1);
      }
    }

    const reminderData = submissionDates.map((date) => {
      const reminderDate = subDays(date, 3);
      return {
        submissionDate: format(date, "yyyy-MM-dd"),
        reminderDate: format(reminderDate, "yyyy-MM-dd"),
        delayedDays: 0,
      };
    });

    setReminders(reminderData);
    setIsSubmitted(false);
  };

  const handleDateChange = (index, type, value) => {
    const updatedReminders = [...reminders];
    updatedReminders[index][type] = value;
    setReminders(updatedReminders);
  };

  const handleSaveChanges = () => {
    if (reminders.length == 0) {
      toast.error("Please generate reminders first!");
      return;
    }
    setIsSubmitted(true);
  };

  return (
    <div>
      {!isSubmitted ? (
        <>
          <div className="rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-[#2B245C] mb-4">
              Modify Submission Schedule
            </h2>

            <div className="flex items-center gap-4">
              <div className="flex flex-row items-center gap-2">
                <label className="font-medium text-gray-700">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  min={dayjs().format("YYYY-MM-DD")}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 border rounded-md w-full md:w-auto"
                />
              </div>

              <div className="flex flex-row items-center gap-2">
                <label className="font-medium text-gray-700">End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  min={dayjs().format("YYYY-MM-DD")}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2 border rounded-md w-full md:w-auto"
                />
              </div>

              <div className="flex ml-auto">
                <button
                  onClick={calculateDates}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Generate Reminders
                </button>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold mt-4 mb-4 text-blue-600">
            Modify Reminders
          </h3>
          <table className="table-auto w-full border-collapse border border-gray-200 bg-white rounded-md shadow-md">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border border-gray-200">Submission Date</th>
                <th className="p-2 border border-gray-200">Reminder Date</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((reminder, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-2 border border-gray-200">
                    <div className="flex gap-2 items-center">
                      <input
                        type="date"
                        value={reminder.submissionDate}
                        onChange={(e) =>
                          handleDateChange(
                            index,
                            "submissionDate",
                            e.target.value
                          )
                        }
                        className="p-1 border rounded-md"
                      />
                      <span className="text-sm text-gray-500">
                        {dayjs(reminder.submissionDate).format("dddd")}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 border border-gray-200">
                    <div className="flex gap-2 items-center">
                      <input
                        type="date"
                        value={reminder.reminderDate}
                        onChange={(e) =>
                          handleDateChange(
                            index,
                            "reminderDate",
                            e.target.value
                          )
                        }
                        className="p-1 border rounded-md"
                      />
                      <span className="text-sm text-gray-500">
                        {dayjs(reminder.reminderDate).format("dddd")}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleSaveChanges}
            className="bg-green-600 text-white px-4 py-2 rounded-md mt-4 hover:bg-green-700 transition"
          >
            Save Schedule
          </button>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4 text-blue-700">
            Final Reminder Schedule
          </h2>
          <table className="table-auto w-full border-collapse border border-gray-200 bg-white rounded-md shadow-md">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border border-gray-200">Submission Date</th>
                <th className="p-2 border border-gray-200">Reminder Date</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((reminder, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-2 border border-gray-200">
                    <div className="flex items-center gap-2">
                      {reminder.submissionDate}
                      <span className="text-sm text-gray-500">
                        {dayjs(reminder.submissionDate).format("dddd")}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 border border-gray-200">
                    <div className="flex items-center gap-2">
                      {reminder.reminderDate}
                      <span className="text-sm text-gray-500">
                        {dayjs(reminder.reminderDate).format("dddd")}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md mt-4 hover:bg-blue-700 transition"
          >
            Modify Schedule
          </button>
        </>
      )}
    </div>
  );
};

export default ReminderSystem;
