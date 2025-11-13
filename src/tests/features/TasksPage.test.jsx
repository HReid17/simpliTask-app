import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// ---- Mocks & test utils

// 1) Stable scrollIntoView to avoid JSDOM errors
beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
});

// 2) Mock action creators 
const addTaskAC = (payload) => ({ type: "tasks/add", payload });
const editTaskAC = (payload) => ({ type: "tasks/edit", payload });
const removeTaskAC = (payload) => ({ type: "tasks/remove", payload });


// import { addTask, removeTask, editTask } from "./tasksSlice"`
vi.mock("../../features/tasks/tasksSlice", () => ({
    addTask: (...a) => addTaskAC(...a),
    editTask: (...a) => editTaskAC(...a),
    removeTask: (...a) => removeTaskAC(...a),
}));


// 3) Minimal tasks reducer that handles our mocked actions
let idCounter = 1000;
const tasksReducer = (state = { tasks: [] }, action) => {
    switch (action.type) {
        case "tasks/add": {
            const { name, date, project, progress } = action.payload;
            return {
                ...state,
                tasks: [
                    ...state.tasks,
                    { id: String(idCounter++), name, date, project, progress: Number(progress) || 0 },
                ],
            };
        }
        case "tasks/edit": {
            const { id, field, value } = action.payload;
            return {
                ...state,
                tasks: state.tasks.map((t) =>
                    String(t.id) === String(id) ? { ...t, [field]: field === "progress" ? Number(value) : value } : t
                ),
            };
        }
        case "tasks/remove": {
            const removeId = action.payload;
            return { ...state, tasks: state.tasks.filter((t) => String(t.id) !== String(removeId)) };
        }
        default:
            return state;
    }
};

// 4) Tiny projects reducer (read-only for name lookups)
const projectsReducer = (state = { projects: [] }) => state;


// 5) Mock useSearchParams per-test; default is empty params
let mockParams = new URLSearchParams("");
vi.mock("react-router-dom", async (orig) => {
    const actual = await orig();
    return {
        ...actual,
        useSearchParams: () => [mockParams],
    };
});


import TasksPage from "../../features/tasks/TasksPage";

// ---- Store helper
function makeStore({ tasks = [], projects = [] } = {}) {
    return configureStore({
        reducer: {
            tasks: tasksReducer,
            projects: projectsReducer,
        },
        preloadedState: {
            tasks: { tasks },
            projects: { projects },
        },
    });
}
function renderWithStore(ui, preloaded) {
    const store = makeStore(preloaded);
    return render(<Provider store={store}>{ui}</Provider>);
}


// ---- Fixtures
const PROJECTS = [
    { id: "p1", name: "Alpha" },
    { id: "p2", name: "Beta" },
];
const TASKS = [
    { id: "t1", name: "Write docs", date: "2025-11-10", project: "p1", progress: 10 },
    { id: "t2", name: "Fix bugs", date: "2025-11-05", project: "p2", progress: 80 },
    { id: "t3", name: "Build UI", date: "2025-11-20", project: "", progress: 0 },
];


// Test 1: Add flow (toggle form - save - new row appears; form closes)

it("adds a task via the form with selected fields and closes the form", async () => {
    const user = userEvent.setup();
    mockParams = new URLSearchParams(""); // no URL-driven edit
    renderWithStore(<TasksPage />, { tasks: [], projects: PROJECTS });

    // Open form
    await user.click(screen.getByRole("button", { name: /add new/i }));

    // Fill form
    const nameInput = screen.getByPlaceholderText(/task name/i);
    await user.type(nameInput, "New Task");
    const dateInput = screen.getByPlaceholderText(/date/i) || screen.getByDisplayValue("");
    // Safer: query by type
    const dateEl = document.querySelector('form.add-task-form input[type="date"]');
    await user.type(dateEl, "2025-11-30");
    const projectCombo = screen.getByRole("combobox");
    await user.selectOptions(projectCombo, "p2");
    const progressInput = screen.getByPlaceholderText(/progress/i);
    await user.clear(progressInput);
    await user.type(progressInput, "25");

    // Save
    await user.click(screen.getByRole("button", { name: /save task/i }));

    // New row shows up with values (progress shows with % in table)
    expect(screen.getByText("New Task")).toBeInTheDocument();
    expect(screen.getByText("2025-11-30")).toBeInTheDocument(); // raw date string is shown
    expect(screen.getByText("Beta")).toBeInTheDocument();       // project name lookup
    expect(screen.getByText("25%")).toBeInTheDocument();

    // Form closed (Add New visible again)
    expect(screen.getByRole("button", { name: /add new/i })).toBeInTheDocument();
});


// Test 2: Sorting by name toggles asc/desc

it("sorts by name descending on first click, then ascending on second", async () => {
    const user = userEvent.setup();
    mockParams = new URLSearchParams("");
    renderWithStore(<TasksPage />, { tasks: TASKS, projects: PROJECTS });

    const header = screen.getByText(/task name/i).closest("th");
    const sortBtn = within(header).getByRole("button");

    // 1st click → desc (because newOrder toggles from 'asc' to 'desc')
    await user.click(sortBtn);
    let rows = screen.getAllByRole("row").slice(1);
    let names = rows.map((r) => r.cells[0].textContent.trim());
    expect(names).toEqual(["Write docs", "Fix bugs", "Build UI"]);

    // 2nd click → asc
    await user.click(sortBtn);
    rows = screen.getAllByRole("row").slice(1);
    names = rows.map((r) => r.cells[0].textContent.trim());
    expect(names).toEqual(["Build UI", "Fix bugs", "Write docs"]);
});


// Test 3: Sorting by date toggles asc/desc

it("sorts by date descending on first click, then ascending on second", async () => {
    const user = userEvent.setup();
    mockParams = new URLSearchParams("");
    renderWithStore(<TasksPage />, { tasks: TASKS, projects: PROJECTS });

    const header = screen.getByText(/task date/i).closest("th");
    const sortBtn = within(header).getByRole("button");

    // 1st click → desc (latest first)
    await user.click(sortBtn);
    let rows = screen.getAllByRole("row").slice(1);
    let dates = rows.map((r) => r.cells[1].textContent.trim());
    expect(dates).toEqual(["2025-11-20", "2025-11-10", "2025-11-05"]);

    // 2nd click → asc (earliest first)
    await user.click(sortBtn);
    rows = screen.getAllByRole("row").slice(1);
    dates = rows.map((r) => r.cells[1].textContent.trim());
    expect(dates).toEqual(["2025-11-05", "2025-11-10", "2025-11-20"]);
});


// Test 4: Sorting by project name uses projects lookup

it("sorts by project name descending on first click, then ascending on second", async () => {
    const user = userEvent.setup();
    mockParams = new URLSearchParams("");
    renderWithStore(<TasksPage />, { tasks: TASKS, projects: PROJECTS });

    const header = screen.getByText(/^project$/i).closest("th");
    const sortBtn = within(header).getByRole("button");

    // 1st click → desc (project names descending; '-' last)
    await user.click(sortBtn);
    let rows = screen.getAllByRole("row").slice(1);
    let projectsCol = rows.map((r) => r.cells[2].textContent.trim());
    expect(projectsCol).toEqual(["Beta", "Alpha", "-"]);

    // 2nd click → asc ('-' first, then Alpha, Beta)
    await user.click(sortBtn);
    rows = screen.getAllByRole("row").slice(1);
    projectsCol = rows.map((r) => r.cells[2].textContent.trim());
    expect(projectsCol).toEqual(["-", "Alpha", "Beta"]);
});


// Test 5: Inline edit via Actions - click Edit, then pencil on cell, change & blur saves

it("enters inline edit for a cell, saves on blur, and updates the table", async () => {
    const user = userEvent.setup();
    mockParams = new URLSearchParams("");
    renderWithStore(<TasksPage />, { tasks: TASKS, projects: PROJECTS });

    const row = screen.getAllByRole("row").find((r) => r.cells[0].textContent.includes("Write docs"));

    // Actions → Edit to show pencils
    const actionsCell = row.cells[4];
    await user.click(within(actionsCell).getByRole("button", { name: /edit/i }));

    // Click pencil in Name cell
    const nameCell = row.cells[0];
    await user.click(within(nameCell).getByRole("button", { name: /edit/i }));

    // Edit then blur to save
    const input = within(nameCell).getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Write docs UPDATED");

    // Trigger blur and WAIT until input unmounts
    input.blur();
    await screen.findByText("Write docs UPDATED");
    expect(within(nameCell).queryByRole("textbox")).toBeNull();
});


//  Task 6: open row via Actions, edit Progress, save on blur

it("edits the Progress cell via Actions → pencil and saves on blur", async () => {
    const user = userEvent.setup();
    mockParams = new URLSearchParams(""); // no URL params
    renderWithStore(<TasksPage />, { tasks: TASKS, projects: PROJECTS });

    // Find row for "Fix bugs"
    const row = screen.getAllByRole("row").find((r) => r.cells[0].textContent.includes("Fix bugs"));
    const progressCell = row.cells[3];

    // Click Actions → Edit to reveal pencils on this row
    const actionsCell = row.cells[4];
    await user.click(within(actionsCell).getByRole("button", { name: /edit/i }));

    // Click the pencil in the Progress cell
    const progressPencil = within(progressCell).getByRole("button", { name: /edit/i });
    await user.click(progressPencil);

    // Change value and blur to save
    const input = within(progressCell).getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "90");
    input.blur();

    // Wait until input unmounts, then assert "90%" is rendered (allow whitespace)
    await waitFor(() => {
        expect(within(progressCell).queryByRole("spinbutton")).toBeNull();
        expect(progressCell.textContent.replace(/\s/g, "")).toContain("90%");
    });
});


// Test 7: Delete removes the row

it("deletes a task", async () => {
    const user = userEvent.setup();
    mockParams = new URLSearchParams("");
    renderWithStore(<TasksPage />, { tasks: TASKS, projects: PROJECTS });

    // Delete "Build UI"
    const row = screen.getAllByRole("row").find((r) => r.cells[0].textContent.includes("Build UI"));
    const actionsCell = row.cells[4];
    await user.click(within(actionsCell).getByRole("button", { name: /delete/i }));

    // Row gone
    const stillThere = screen.queryAllByRole("row").some((r) => r.textContent.includes("Build UI"));
    expect(stillThere).toBe(false);
});
