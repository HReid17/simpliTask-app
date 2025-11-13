import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// --- Mock FullCalendar + plugins with a lightweight stub
vi.mock("@fullcalendar/react", () => {
  return {
    __esModule: true,
    default: ({ events, eventClick, eventContent }) => (
      <div data-testid="fc">
        {events.map((ev) => (
          <div key={ev.id} data-testid={`ev-${ev.id}`} style={{ backgroundColor: ev.backgroundColor, borderColor: ev.borderColor }}>
            {/* Clickable wrapper to simulate FullCalendar's event click */}
            <div role="button" onClick={() => eventClick({ event: ev })}>
              {eventContent({ event: ev })}
            </div>
          </div>
        ))}
      </div>
    ),
  };
});

// The plugins are just values; we mock them as empty objects
vi.mock("@fullcalendar/daygrid", () => ({ __esModule: true, default: {} }));
vi.mock("@fullcalendar/timegrid", () => ({ __esModule: true, default: {} }));
vi.mock("@fullcalendar/interaction", () => ({ __esModule: true, default: {} }));

// --- Import component AFTER mocks
import CalendarPage from "../../features/calendar/CalendarPage";

// --- Minimal Redux store to satisfy useSelector((s) => s.tasks.tasks)
function makeStore(preloadedTasks) {
  return configureStore({
    reducer: {
      tasks: (state = { tasks: preloadedTasks }) => state,
    },
    preloadedState: { tasks: { tasks: preloadedTasks } },
  });
}

function renderWithStore(ui, { tasks = [] } = {}) {
  const store = makeStore(tasks);
  return render(<Provider store={store}>{ui}</Provider>);
}

// --- Sample tasks with varied progress + dates
const TASKS = [
  { id: 1, name: "Task A", date: "2025-11-20", progress: 0, description: "A desc" },
  { id: 2, name: "Task B", date: "2025-11-21", progress: 50 },
  { id: 3, name: "Task C", date: "2025-11-22", progress: 100, description: "C desc" },
];

// utility for asserting the due date string exactly as the component computes it
const dueString = (iso) => new Date(iso).toLocaleDateString();

describe("CalendarPage", () => {
  beforeEach(() => {
    // nothing required yet
  });

  // Test 1: Maps tasks into events and renders titles
  it("renders a FullCalendar stub with event titles from tasks", () => {
    renderWithStore(<CalendarPage />, { tasks: TASKS });

    // Our stub puts all events under data-testid="fc"
    const fc = screen.getByTestId("fc");
    expect(fc).toBeInTheDocument();

    // Titles should be present (coming from eventContent - .title)
    expect(screen.getByText("Task A")).toBeInTheDocument();
    expect(screen.getByText("Task B")).toBeInTheDocument();
    expect(screen.getByText("Task C")).toBeInTheDocument();
  });

  // Test 2: Colors reflect progress (Todo/Ongoing/Complete)
  it("applies background/border colors based on progress", () => {
    renderWithStore(<CalendarPage />, { tasks: TASKS });

    // From colorFromProgress: 0 -> blue, >0 -> amber, >=100 -> green
    expect(screen.getByTestId("ev-1")).toHaveStyle({ backgroundColor: "#2563eb", borderColor: "#2563eb" }); // Todo
    expect(screen.getByTestId("ev-2")).toHaveStyle({ backgroundColor: "#f59e0b", borderColor: "#f59e0b" }); // Ongoing
    expect(screen.getByTestId("ev-3")).toHaveStyle({ backgroundColor: "#16a34a", borderColor: "#16a34a" }); // Complete
  });


  // Test 3: Clicking toggles details open/closed and shows description, due, status
  it("toggles event details on click and shows description, due date, and status", async () => {
    const user = userEvent.setup();
    renderWithStore(<CalendarPage />, { tasks: TASKS });

    // Click Task A to open
    await user.click(screen.getByRole("button", { name: /task a/i }));

    // Details for Task A should show
    expect(screen.getByText("A desc")).toBeInTheDocument(); // description
    // Due date uses toLocaleDateString on task.date
    expect(screen.getByText(dueString("2025-11-20"))).toBeInTheDocument();
    // Status derived from progress (0 => "Todo")
    expect(screen.getByText(/todo/i)).toBeInTheDocument();

    // Click again to close
    await user.click(screen.getByRole("button", { name: /task a/i }));
    expect(screen.queryByText("A desc")).toBeNull();
  });

  
  // Test 4: Different progress values reflect correct status strings
  it("derives status from progress: Todo, Ongoing, Complete", async () => {
    const user = userEvent.setup();
    renderWithStore(<CalendarPage />, { tasks: TASKS });

    // Open each one to reveal status
    await user.click(screen.getByRole("button", { name: /task a/i }));
    expect(screen.getByText(/todo/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /task b/i }));
    expect(screen.getByText(/ongoing/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /task c/i }));
    expect(screen.getByText(/complete/i)).toBeInTheDocument();
  });
});
