import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// ---- Mock router navigate
const navigateMock = vi.fn();
vi.mock("react-router-dom", async (orig) => {
    const actual = await orig();
    return { ...actual, useNavigate: () => navigateMock };
});

// ---- Mock ONLY nanoid from RTK
vi.mock("@reduxjs/toolkit", async (orig) => {
    const actual = await orig();
    return {
        ...actual,
        nanoid: () => "fixed-id-123",
    };
});

// ---- Import the real reducer and component AFTER mocks
import projectsReducer from "../../features/projects/projectsSlice";
import ProjectsPage from "../../features/projects/ProjectsPage";


// ---- Tiny real store with reducer
function makeStore(preloadedProjects) {
    return configureStore({
        reducer: { projects: projectsReducer },
        preloadedState: { projects: { projects: preloadedProjects } },
    });
}
function renderWithStore(ui, { projects = [] } = {}) {
    const store = makeStore(projects);
    return render(<Provider store={store}>{ui}</Provider>);
}

// Sample projects
const PROJECTS = [
    { id: "p1", name: "Landing Page", due: "2025-11-01", status: "in-progress" },
    { id: "p2", name: "Admin Panel", due: "2025-12-05", status: "complete" },
    { id: "p3", name: "Auth Flow", due: "", status: "not-started" },
];

describe("ProjectsPage (integration with real reducer)", () => {
    beforeEach(() => {
        navigateMock.mockReset();
    });


    // Test 1: Add form toggle + create with trimmed data, then close form
    it("shows Add form, saves a new project with trimmed name, and closes the form", async () => {
        const user = userEvent.setup();
        renderWithStore(<ProjectsPage />, { projects: [] });

        // Empty state visible
        expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();

        // Open form (button text becomes "Close")
        await user.click(screen.getByRole("button", { name: /add new/i }));
        expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();

        // Find the form via the Save button (closest form ancestor)
        const saveBtn = screen.getByRole("button", { name: /^save$/i });
        const form = saveBtn.closest("form");
        expect(form).toBeTruthy();

        // Fill fields
        const nameInput = screen.getByPlaceholderText(/project name/i);
        await user.type(nameInput, "   New Project   "); // test trimming

        // Reliable grab for the date input (type="date")
        const dateEl = form.querySelector('input[type="date"]');
        await user.clear(dateEl);
        await user.type(dateEl, "2025-11-20");

        // Pick a status
        const statusCombo = within(form).getByRole("combobox");
        await user.selectOptions(statusCombo, "complete");

        // Save
        await user.click(saveBtn);

        // New project card should render with trimmed name
        expect(screen.getByRole("button", { name: "New Project" })).toBeInTheDocument();

        // UK-formatted date 
        const ukDate = new Date("2025-11-20").toLocaleDateString("en-GB");
        expect(screen.getByText(ukDate)).toBeInTheDocument();

        // Status label + dot class
        const card = screen.getByRole("button", { name: "New Project" }).closest(".project-card");
        expect(within(card).getByText(/complete/i)).toBeInTheDocument();
        expect(card.querySelector(".status-dot-green")).toBeTruthy();

        // Form closed (Add New visible again)
        expect(screen.getByRole("button", { name: /add new/i })).toBeInTheDocument();
    });


    // Test 2: Navigate to a project details page by clicking its name
    it("navigates to /projects/:id when clicking a project name", async () => {
        const user = userEvent.setup();
        renderWithStore(<ProjectsPage />, { projects: PROJECTS });

        await user.click(screen.getByRole("button", { name: /landing page/i }));
        expect(navigateMock).toHaveBeenCalledWith("/projects/p1");
    });


    // Test 3: Edit flow – enter edit mode, change fields, save - DOM updates
    it("edits a project inline and shows updated values after saving", async () => {
        const user = userEvent.setup();
        renderWithStore(<ProjectsPage />, { projects: PROJECTS });

        const card = screen.getByRole("button", { name: /admin panel/i }).closest(".project-card");

        // Enter edit mode
        await user.click(within(card).getByRole("button", { name: /edit/i }));

        // Update name
        const nameInput = within(card).getByDisplayValue("Admin Panel");
        await user.clear(nameInput);
        await user.type(nameInput, "Admin Console");

        // Update due date
        const dueInput = within(card).getByDisplayValue("2025-12-05");
        await user.clear(dueInput);
        await user.type(dueInput, "2025-12-10");

        // Update status
        const statusCombo = within(card).getByRole("combobox");
        await user.selectOptions(statusCombo, "in-progress");

        // Save
        await user.click(within(card).getByRole("button", { name: /^save$/i }));

        // Back to view mode with updated values
        expect(within(card).getByRole("button", { name: "Admin Console" })).toBeInTheDocument();
        const ukDate = new Date("2025-12-10").toLocaleDateString("en-GB");
        expect(within(card).getByText(ukDate)).toBeInTheDocument();
        expect(within(card).getByText(/in progress/i)).toBeInTheDocument();
        expect(card.querySelector(".status-dot-yellow")).toBeTruthy();
    });


    // Test 4: Cancel edit returns to view mode without persisting changes
    it("cancels edit and returns to view mode (no changes applied)", async () => {
        const user = userEvent.setup();
        renderWithStore(<ProjectsPage />, { projects: PROJECTS });

        const card = screen.getByRole("button", { name: /auth flow/i }).closest(".project-card");
        await user.click(within(card).getByRole("button", { name: /edit/i }));

        // Type a change but cancel
        const nameInput = within(card).getByDisplayValue("Auth Flow");
        await user.type(nameInput, " X");
        await user.click(within(card).getByRole("button", { name: /cancel/i }));

        // Back to view mode with original name
        expect(within(card).getByRole("button", { name: "Auth Flow" })).toBeInTheDocument();
        expect(within(card).queryByRole("textbox")).toBeNull();
    });


    // Test 5: Delete removes the project card
    it("deletes a project card when Delete is clicked", async () => {
        const user = userEvent.setup();
        renderWithStore(<ProjectsPage />, { projects: PROJECTS });

        // Delete "Landing Page"
        const card = screen.getByRole("button", { name: /landing page/i }).closest(".project-card");
        await user.click(within(card).getByRole("button", { name: /delete/i }));

        expect(screen.queryByRole("button", { name: /landing page/i })).toBeNull();
    });

    
    // Test 6: Status labels and dot classes match each project status
    it("shows correct status label and dot class for each status", () => {
        renderWithStore(<ProjectsPage />, { projects: PROJECTS });

        // in-progress - "In Progress" + yellow dot
        {
            const card = screen.getByRole("button", { name: /landing page/i }).closest(".project-card");
            expect(within(card).getByText(/in progress/i)).toBeInTheDocument();
            expect(card.querySelector(".status-dot-yellow")).toBeTruthy();
        }

        // complete - "Complete" + green dot
        {
            const card = screen.getByRole("button", { name: /admin panel/i }).closest(".project-card");
            expect(within(card).getByText(/complete/i)).toBeInTheDocument();
            expect(card.querySelector(".status-dot-green")).toBeTruthy();
        }

        // not-started - "Not Started" + red dot
        {
            const card = screen.getByRole("button", { name: /auth flow/i }).closest(".project-card");
            expect(within(card).getByText(/not started/i)).toBeInTheDocument();
            expect(card.querySelector(".status-dot-red")).toBeTruthy();
        }
    });
});
