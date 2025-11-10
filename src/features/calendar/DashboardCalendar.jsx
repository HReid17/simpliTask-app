import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./dashboardCalendar.css"

export default function DashboardCalendar() {

    const tasks = useSelector((s) => s.tasks.tasks)
    const nav = useNavigate()

    const statusFromProgress = (p = 0) =>
        p >= 100 ? "Complete" : p > 0 ? "Ongoing" : "Todo";

    const colorFromProgress = (p = 0) => {
        if (p >= 100) return "#16a34a" // Complete (green)
        if (p > 0) return "#f59e0b" // Ongoing (amber)
        return "#2563eb" // Todo (blue)
    }

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
                        task: t,                 // keep entire task here
                        status: statusFromProgress(t.progress),
                    },
                };
            }),
        [tasks]
    );

    return (
        <div className="calendar-card">
            <div className="top-line">
                <h2>Calendar</h2>
                {<button className="view-btn" onClick={() => nav("/calendar")}>Open Calendar</button>}
            </div>

            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="twoWeek"
                views={{
                    twoWeek: { type: 'dayGrid', duration: { weeks: 2 } },
                }}
                firstDay={1}
                headerToolbar={false}     // hide big toolbar in the widget
                height="auto"             // keep it small
                fixedWeekCount={false}
                showNonCurrentDates={false}
                events={events}
                eventDisplay="block"
                dayMaxEventRows={2}       // "+n more" if crowded
                dateClick={() => nav("/calendar")}
                eventClick={() => nav("/calendar")}
            />
        </div>
    )
}