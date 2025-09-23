import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from "react-router-dom";
import {RouterProvider} from "react-router-dom";
import App from './App.jsx'
import Dashboard from './features/dashboard/Dashboard.jsx';
import CalendarPage from './features/calendar/calendarPage.jsx';
import ProjectsPage from './features/projects/ProjectsPage.jsx';
import TasksPage from './features/tasks/TasksPage.jsx';
import NotFound from './features/Notfound.jsx';

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/calendarpage", element: <CalendarPage /> },
  { path: "/projectspage", element: <ProjectsPage /> },
  { path: "/taskspage", element: <TasksPage /> },
  { path: "*", element: <NotFound /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
