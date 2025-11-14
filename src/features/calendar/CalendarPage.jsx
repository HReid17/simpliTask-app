import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./calendarPage.css"

/* Plugins - 

dayGridPlugi: month view.
timeGridPlugin: week/day time columns (for the other buttons).
interactionPlugin: enables clicks and other interactions. */

export default function CalendarPage() {

  const tasks = useSelector((state) => state.tasks.tasks);    // Pull the current task list from Redux store
  const [selectedEventId, setSelectedEventId] = useState(null); // Tracks which event (if any) is expanded in-place

  const statusFromProgress = (p = 0) =>
    p >= 100 ? "Complete" : p > 0 ? "Ongoing" : "Todo";

  const colorFromProgress = (p = 0) => {
    if (p >= 100) return "#16a34a" // Complete (green)
    if (p > 0) return "#f59e0b" // Ongoing (amber)
    return "#2563eb" // Todo (blue)
  }

  // Every task becomes an event on its due date and is memorised using useMemo
  const events = useMemo(
    () =>
      tasks.map((t) => {
        const bg = colorFromProgress(t.progress);
        return {
          id: String(t.id),
          title: t.name,
          start: new Date(t.date),
          allDay: true,                // Puts the event inside a day cell (not a timed slot)
          backgroundColor: bg,
          borderColor: bg,
          extendedProps: {
            task: t,                 // keep entire task 
            status: statusFromProgress(t.progress),
          },
        };
      }),
    [tasks]
  );

  // For when the user clicks an event on the calendar
  const onEventClick = (arg) => {
    const id = arg.event.id;
    setSelectedEventId((prev) => (prev === id ? null : id)); // toggle open/closed
  };

  // Custom render: expand when selected
  const renderEventContent = (arg) => {
    const isOpen = arg.event.id === selectedEventId;
    const task = arg.event.extendedProps?.task || {};
    const status = arg.event.extendedProps?.status;

    return (

      <div className={`task-pill ${isOpen ? "open" : ""}`}>
        <div className="title">{arg.event.title}</div>

        {/* If an event is selected, show full task details inline */}
        {isOpen && (
          <div className="details">
            {task.description && <p className="desc">{task.description}</p>}

            <dl className="meta">
              <div>
                <dt>Due:</dt>
                <dd>{new Date(task.date).toLocaleDateString()}</dd>
              </div>

              {status && (
                <div>
                  <dt>Status:</dt>
                  <dd className="capitalize">{status}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="calendar-card-wrapper">
      <div className="calendar">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            start: "today prev,next",
            center: "title",
            end: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height="100%"

          // Event date from Tasks
          events={events}

          // Handles our clicks on event blocks
          eventClick={onEventClick}

          // Custom rendering logic for each event (title + details)
          eventContent={renderEventContent}

          eventDisplay="block"       // Block so it can grow
          dayMaxEventRows={2}      // prevent FC from collapsing extra content

        />
      </div>
    </div>
  );
}
