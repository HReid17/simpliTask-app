import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./dashboardTasksCard.css"

export default function DashboardTasksCard() {

    const max = 5;

    const tasks = useSelector((s) => s.tasks.tasks)
    const nav = useNavigate()

    const upcomingTasks = useMemo(() => {
        return [...tasks]
            .filter((t) => t.date && Number(t.progress) < 100)
            .sort((a, b) => +new Date(a.date) - +new Date(b.date))
            .slice(0, max)
    }, [tasks])

    const statusFromProgress = (p = 0) =>
        p >= 100 ? "Complete" : p > 0 ? "Ongoing" : "Todo";

    console.log(tasks.map(t => t.progress));


    const handleTaskClick = () => {
        nav("/tasks");
    };


    return (
        <div className="tasks-card">
            <div className="top-line">
                <h2>Upcoming Task's</h2>
                <button className="view-btn" onClick={() => nav("/tasks")}>View All</button>
            </div>

            {upcomingTasks.length === 0 ? (
                <p>No upcoming Tasks...</p>
            ) : (
                <div className="tasks-list scrollable">
                    <ul>
                        {upcomingTasks.map((t) => (
                            <li key={t.id} onClick={handleTaskClick}>
                                <div className="details">
                                    <span className="name">{t.name}</span>
                                    <span className="date">Due: {new Date(t.date).toLocaleDateString()}</span>
                                    <span className="progress">{statusFromProgress(t.progress)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

            )}
        </div>
    )

}