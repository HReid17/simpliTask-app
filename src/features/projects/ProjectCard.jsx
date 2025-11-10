import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addTask, removeTask, editTask } from "../tasks/tasksSlice";
import "./projectCard.css";

export default function ProjectCard() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const projects = useSelector((s) => s.projects.projects);
    const tasks = useSelector((s) => s.tasks.tasks);

    // Handle string vs number IDs safely
    const project = useMemo(
        () => projects.find((p) => String(p.id) === String(projectId)),
        [projects, projectId]
    );

    const projectTasks = useMemo(
        () => tasks.filter((t) => String(t.project) === String(projectId)),
        [tasks, projectId]
    );

    // add task form
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [progress, setProgress] = useState(0);

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        dispatch(
            addTask({
                name: name.trim(),
                date,
                project: projectId,
                progress: Number(progress) || 0,
            })
        );
        setName("");
        setDate("");
        setProgress(0);
    };

    // Edit mode state
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [draft, setDraft] = useState({ name: "", date: "", progress: 0 });

    const startEdit = (task) => {
        setEditingTaskId(task.id);
        setDraft({
            name: task.name || "",
            date: task.date || "",
            progress: task.progress || 0,
        });
    };

    const saveEdit = (id) => {
        dispatch(editTask({ id, field: "name", value: draft.name }));
        dispatch(editTask({ id, field: "date", value: draft.date }));
        dispatch(editTask({ id, field: "progress", value: Number(draft.progress) }));
        setEditingTaskId(null);
    };

    const cancelEdit = () => setEditingTaskId(null);

    if (!project) {
        return (
            <div className="card-wrapper">
                <div className="header">
                    <button className="link-btn" onClick={() => navigate("/projects")}>
                        ← Back to Projects
                    </button>
                    <h1>Project not found</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="card-wrapper">
            <div className="header">
                <button className="link-btn" onClick={() => navigate("/projects")}>
                    Back to Projects
                </button>
                <h1 className="name">{project.name}</h1>
                <div className="meta">
                    <span>
                        Due:{" "}
                        {project.due
                            ? new Date(project.due).toLocaleDateString("en-GB")
                            : "-"}
                    </span>
                    <span>Status: {project.status?.replace("-", " ") || "-"}</span>
                </div>
            </div>

            <div className="tasks">
                <div className="task-columns">
                    <span>Task</span>
                    <span>Due Date</span>
                    <span>Progress</span>
                </div>

                {projectTasks.length === 0 ? (
                    <p className="empty">No tasks assigned to this project yet.</p>
                ) : (
                    <ul className="task-list">
                        {projectTasks.map((t) => {
                            const isEditing = editingTaskId === t.id;

                            return (
                                <li key={t.id} className="task-row">
                                    {isEditing ? (
                                        <>
                                            {/* Edit Mode */}
                                            <>
                                                <input
                                                    type="text"
                                                    value={draft.name}
                                                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                                                />
                                                <input
                                                    type="date"
                                                    value={draft.date}
                                                    onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                                                />
                                                <div className="task-progress">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        value={draft.progress}
                                                        onChange={(e) => setDraft((d) => ({ ...d, progress: e.target.value }))}
                                                        style={{ width: "60px" }}
                                                    />
                                                    <button className="save-btn" onClick={() => saveEdit(t.id)}>Save</button>
                                                    <button className="link-btn" onClick={cancelEdit}>Cancel</button>
                                                </div>
                                            </>

                                        </>
                                    ) : (
                                        <>
                                            {/* Read Mode */}
                                            <span className="task-name"><strong>{t.name}</strong></span>
                                            <span className="task-due muted">Due: {t.date || "-"}</span>
                                            <span className="task-progress">
                                                Progress: {t.progress}%
                                                <button className="link-btn" onClick={() => startEdit(t)}>Edit</button>
                                                <button className="delete-btn" onClick={() => dispatch(removeTask(t.id))}>
                                                    Delete
                                                </button>
                                            </span>

                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}

                <form className="add-task-inline" onSubmit={handleAddTask}>
                    <input
                        type="text"
                        placeholder="New Task"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <div className="task-progress">
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={progress}
                            onChange={(e) => setProgress(e.target.value)}
                            placeholder="%"
                            style={{ width: "60px" }}
                        />
                        <button type="submit" className="save-btn">Add Task</button>
                    </div>
                </form>

            </div>
        </div>
    );
}