// components/ui/CalendarDropdown.js
import React, { useState, useEffect, useRef } from "react";
import { FiCalendar } from "react-icons/fi";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import isSameDay from "date-fns/isSameDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import Dialog from "@/components/ui/Dialog";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import Loader from "@/components/ui/Loader";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Month names for the dropdown
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function CustomToolbar({ currentDate, setCurrentDate }) {
  const m = currentDate.getMonth();
  const y = currentDate.getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => y - 5 + i);

  const onMonthChange = (e) => {
    const newM = +e.target.value;
    setCurrentDate(new Date(y, newM, 1));
  };
  const onYearChange = (e) => {
    const newY = +e.target.value;
    setCurrentDate(new Date(newY, m, 1));
  };
  return (
    <div className="rbc-toolbar flex items-center justify-between p-2 space-x-2">
      <button
        onClick={() => setCurrentDate(new Date())}
        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        Today
      </button>
      <select value={m} onChange={onMonthChange} className="border p-1 rounded">
        {monthNames.map((name, idx) => (
          <option key={name} value={idx}>
            {name}
          </option>
        ))}
      </select>
      <select value={y} onChange={onYearChange} className="border p-1 rounded">
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function CalendarDropdown({ className = "" }) {
  const ref = useRef();
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // fetch tasks once when opening
  useEffect(() => {
    if (!open || tasks.length) return;
    setLoading(true);
    CustomAxios.get(`${baseurl}/${initURL}/tasks`)
      .then(({ data }) => setTasks(data))
      .catch((e) => setError(e.message || "Failed to load tasks"))
      .finally(() => setLoading(false));
  }, [open]);

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // build one‑day events on the endDate only
  const priorityColors = { low: "#16A34A", medium: "#D97706", high: "#DC2626" };
  const events = tasks.map((t) => {
    const end = new Date(t.endDate);
    return {
      id: t._id,
      title: t.summary,
      start: end,
      end: new Date(end.getTime() + 1), // minimal span so it shows on that day
      allDay: true,
      resource: {
        priority: t.priority.toLowerCase(),
        status: t.status.toLowerCase(),
      },
    };
  });

  // only show tasks whose endDate equals the clicked date
  const tasksOnDay = (date) =>
    tasks.filter((t) => isSameDay(new Date(t.endDate), date));

  // open dialog for date or "+n more"
  const handleSelect = (slot) => {
    const date = slot.start || slot;
    setSelectedDate(date);
    setModalOpen(true);
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`hover:text-opacity-80 focus:outline-none ${className}`}
        aria-label="Tasks Calendar"
      >
        <FiCalendar size={24} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[320px] h-[360px] bg-white rounded-lg shadow-lg z-50 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader />
            </div>
          ) : error ? (
            <div className="p-4 text-red-500">{error}</div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              date={currentDate}
              onNavigate={setCurrentDate}
              defaultView="month"
              views={["month"]}
              components={{
                toolbar: (props) => (
                  <CustomToolbar
                    {...props}
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                  />
                ),
                event: () => null, // hide inline titles
              }}
              selectable
              onSelectSlot={handleSelect}
              onDrillDown={handleSelect}
              dayPropGetter={(date) => {
                const dayTasks = tasksOnDay(date);
                if (!dayTasks.length) return {};
                // pick top priority for tint
                const order = { high: 2, medium: 1, low: 0 };
                const top = dayTasks.sort(
                  (a, b) =>
                    order[b.priority.toLowerCase()] -
                    order[a.priority.toLowerCase()]
                )[0];
                return {
                  style: {
                    backgroundColor:
                      priorityColors[top.priority.toLowerCase()] + "22",
                  },
                };
              }}
              style={{ height: "100%" }}
            />
          )}
        </div>
      )}

      <Dialog isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-6 w-[400px]">
          <h2 className="text-xl font-semibold mb-4">
            Tasks ending on{" "}
            {selectedDate?.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </h2>
          <ul className="space-y-3 max-h-64 overflow-auto">
            {tasksOnDay(selectedDate).map((t) => (
              <li
                key={t._id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div>
                  <p className="font-medium">{t.summary}</p>
                  <p className="text-sm text-gray-600">{t.category}</p>
                </div>
                <span
                  className={`w-3 h-3 rounded-full inline-block ${
                    t.status.toLowerCase() === "completed"
                      ? "bg-green-600"
                      : t.status.toLowerCase() === "in progress"
                      ? "bg-blue-600"
                      : t.status.toLowerCase() === "on hold"
                      ? "bg-yellow-600"
                      : "bg-gray-400"
                  }`}
                  title={t.status}
                />
              </li>
            ))}
            {tasksOnDay(selectedDate).length === 0 && (
              <li className="text-gray-500">No tasks ending on this date</li>
            )}
          </ul>
          <div className="mt-6 text-right">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
