import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// --- Mock react-router useNavigate
const navigateMock = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return { ...actual, useNavigate: () => navigateMock };
});

import Searchbar from "../../components/Searchbar";

// --- Create a lightweight mock Redux store
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

// --- Sample task data for tests
const TASKS = [
  { id: "1", name: "Pay bills" },
  { id: "2", name: "Buy milk" },
  { id: "3", name: "Refactor SearchBar" },
  { id: "4", name: "Review PRs" },
  { id: "5", name: undefined }, // ensures undefined names don't crash filter
];

describe("Searchbar component", () => {
  beforeEach(() => navigateMock.mockReset());

  // Test 1: Ensures filtering, rendering, navigation, and clearing all work
  it("filters tasks, shows results, and navigates + clears on selection", async () => {
    const user = userEvent.setup();
    renderWithStore(<Searchbar />, { tasks: TASKS });

    // A) Initially empty — no results visible
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.queryByText(/no matching tasks/i)).toBeNull();

    // B) Type a trimmed, case-insensitive query
    const input = screen.getByPlaceholderText(/search tasks/i);
    await user.type(input, "  re  "); // should match "Refactor SearchBar" and "Review PRs"

    // C) Matching results appear in a list
    const list = await screen.findByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual(
      expect.arrayContaining(["Refactor SearchBar", "Review PRs"])
    );

    // D) Click a specific result (query by text, not role name)
    await user.click(within(list).getByText(/refactor searchbar/i));

    // After clicking, should navigate and clear search
    expect(navigateMock).toHaveBeenCalledWith("/tasks?editId=3&field=name");
    expect(input).toHaveValue("");
    expect(screen.queryByRole("list")).toBeNull();

    // E) Searching for something nonexistent shows "No matching tasks"
    await user.type(input, "zzzzz");
    expect(await screen.findByText(/no matching tasks/i)).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });


  // Test 2: Ensures clicking outside clears the search input and results
  it("clears query and results when clicking outside the searchbar", async () => {
    const user = userEvent.setup();

    // Render and keep the container so we can scope queries
    const { container } = renderWithStore(<Searchbar />, { tasks: TASKS });

    // Scope to this specific instance to avoid picking up any stray inputs
    const root = container.querySelector(".searchbar");
    const input = within(root).getByPlaceholderText(/search tasks/i);

    await user.type(input, "pay"); // triggers results
    await within(root).findByRole("list");

    // Simulate click outside searchbar
    const outside = document.createElement("div");
    document.body.appendChild(outside);
    await user.click(outside);

    // After click outside the query and results are cleared for this instance
    expect(within(root).queryByRole("list")).toBeNull();
    expect(within(root).queryByText(/no matching tasks/i)).toBeNull();
    expect(input).toHaveValue("");
  });


  // Test 3: Ensures form submission doesn’t reload or navigate
  it("prevents form submission from triggering navigation", async () => {
    const user = userEvent.setup();
    renderWithStore(<Searchbar />, { tasks: TASKS });

    // Click the submit button — onSubmit should call preventDefault
    const btn = screen.getByRole("button", { name: /search/i });
    await user.click(btn);

    // Form submit does NOT trigger navigation
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
