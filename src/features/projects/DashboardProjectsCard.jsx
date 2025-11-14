import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./dashboardProjectCard.css"

export default function DashboardProjectsCard() {

    const statusClass = (s = "") => {
        const v = s.toLowerCase();
        if (v.includes("complete")) return "bg-green-100 text-green-700";
        if (v.includes("progress") || v.includes("ongoing")) return "bg-amber-100 text-amber-700";
        if (v.includes("not")) return "bg-red-100 text-red-700"; 
        return "bg-gray-100 text-gray-700";
    };

    const projects = useSelector((s) => s.projects.projects)
    const tasks = useSelector((s) => s.tasks.tasks)
    const nav = useNavigate()

    // Count tasks per project 
    const taskCounts = useMemo(() => {
        return tasks.reduce((acc, t) => {
            const pid = t.projectId ?? t.project?.id ?? t.project ?? null;
            if (!pid) return acc;
            acc[pid] = (acc[pid] || 0) + 1;
            return acc;
        }, {});
    }, [tasks]);

    const recentProjects = projects;

    return (
        <div className="projects-card">
            <div className="top-line">
                <h2>Projects</h2>
                <button className="view-btn" onClick={() => nav("/projects")}>View All</button>
            </div>

            <div className="projects-list">
                {recentProjects.length === 0 ? (
                    <p>No projects</p>
                ) : (
                    <ul>
                        {recentProjects.map((p) => {
                            const count = taskCounts[p.id] || 0; // Tasks are keyed by project name
                            return (
                                <li
                                    key={p.id}
                                    onClick={() => nav(`/projects/${p.id}`)}
                                    className={`project-item ${statusClass(p.status)}`}
                                >
                                    <div className="project-details">

                                        <div className="left">
                                            <span className="name">{p.name}</span>
                                            <span className="count">{count} {count === 1 ? "task" : "tasks"}</span>
                                        </div>

                                        <div className="right">
                                            <span className="completion"> Scheduled completion: {p.due ? new Date(p.due).toLocaleDateString() : "—"}</span>
                                        </div>

                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
    )
}