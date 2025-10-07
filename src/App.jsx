import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./components/AppShell";
import Dashboard from "./features/dashboard/Dashboard";
import TasksPage from "./features/tasks/TasksPage";
import ProjectsPage from "./features/projects/ProjectsPage";
import CalendarPage from "./features/calendar/CalendarPage";
import NotFound from "./features/NotFound";

export default function App() {

  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

