import React, { useEffect, useState } from "react";
import axios from "axios";

const EventsCalendar = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const [eventsMap, setEventsMap] = useState({});

  useEffect(() => {
    const fetchMonthEvents = async () => {
      try {
        const res = await axios.get(
          `/api/events/calendar?year=${year}&month=${month}`
        );
        setEventsMap(res.data);
      } catch (err) {
        console.log("Calendar error", err);
      }
    };

    fetchMonthEvents();
  }, [year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayIndex = new Date(year, month - 1, 1).getDay();

  const days = [];

  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const formatKey = (day) => {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-zinc-200">
        {today.toLocaleString("default", { month: "long" })} {year}
      </h3>

      <div className="grid grid-cols-7 gap-2 text-center text-sm text-zinc-400 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) return <div key={index}></div>;

          const key = formatKey(day);
          const hasEvent = eventsMap[key];

          return (
            <div key={index} className="relative group">
              <div
                className={`h-10 flex items-center justify-center rounded-lg cursor-pointer transition
                ${
                  hasEvent
                    ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/30"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {day}
              </div>

              {hasEvent && (
                <div className="absolute z-50 hidden group-hover:block bg-black border border-zinc-700 rounded-lg p-3 text-xs w-52 top-12 left-1/2 -translate-x-1/2 shadow-xl">
                  {hasEvent.map(event => (
                    <div key={event._id} className="mb-2">
                      <p className="text-indigo-400 font-medium">
                        {event.title}
                      </p>
                      <p className="text-zinc-400">{event.category}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsCalendar;