import "./Dashboard.css";
import DashboardTasksCard from "../tasks/DashboardTasksCard";
import DashboardProjectsCard from "../projects/DashboardProjectsCard";
import DashboardCalendar from "../calendar/DashboardCalendar";

export default function Dashboard() {
  return (
    <div className="dashboard-wrapper">
      <div className="upper">
        <DashboardTasksCard />
      </div>
      <div className="lower">
        <DashboardProjectsCard />
        <DashboardCalendar />
      </div>
    </div>
  );
}
