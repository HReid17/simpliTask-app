import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addProject, editProject, removeProject } from "./projectsSlice";
import "./projectsPage.css";

const STATUS_OPTIONS = [
    { value: "complete", label: "Complete", color: "green" },
    { value: "in-progress", label: "In Progress", color: "yellow" },
    { value: "not-started", label: "Not Started", color: "red" },
];

// Using META as a quick lookup of the status (easier when it comes to color coding them)

function statusMeta(status) {
    return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[1];
}

export default function ProjectsPage() {

    // Helpers
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const projects = useSelector((s) => s.projects.projects)

    // Form
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState("")
    const [due, setDue] = useState("")
    const [status, setStatus] = useState("in-Progress")

    // Inline Edit
    const [editingId, setEditingId] = useState(null)
    const [draft, setDraft] = useState({ name: "", due: "", status: "in-progress" });

    const resetAddForm = () => {
        setName(""),
            setDue(""),
            setStatus("in-progress")
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        dispatch(addProject({ name: name.trim(), due, status }))
        resetAddForm();
        setShowForm(false);
    };

    const startEdit = (p) => {
        setEditingId(p.id);
        setDraft({ name: p.name || "", due: p.due || "", status: p.status || "in-progress" })
    };

    const saveEdit = (id) => {
        dispatch(editProject({ id, ...draft }))
        setEditingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null)
    };

    const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString("en-GB") : "-")

    return (
        <div className="projects-wrapper">
            <div className="page-header">
                <h1>My Projects</h1>

                <div className="header-buttons">
                    <button className="link-btn" onClick={() => setShowForm((v) => !v)}>
                        {showForm ? "Close" : "Add New"}
                    </button>
                </div>
            </div>

            <div className="projects-columns">
                <div>Name</div>
                <div>Scheduled Completion</div>
                <div>Status</div>
            </div>

            {(showForm && (
                <form className="project-card project-card--editing project-card--new" onSubmit={(e) => handleAdd(e)}>
                    <div data-label="Name">
                        <input
                            type="text"
                            placeholder="Project Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div data-label="Date">
                        <input type="date"
                            value={due}
                            onChange={(e) => setDue(e.target.value)} />
                    </div>
                    <div data-label="Status">
                        <div className="project-card-status">
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                {STATUS_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                            <button className="save-btn" type="submit">
                                Save
                            </button>
                        </div>
                    </div>
                </form>
            ))
            }

            <div className="projects-list">
                {projects.length === 0 && <div className="empty">No projects yet...</div>}

                {projects.map((p) => {
                    const meta = statusMeta(p.status);
                    const isEditing = editingId === p.id;

                    return (
                        <div key={p.id} className={`project-card ${isEditing ? "project-card--editing" : ""}`}>
                            <div data-label="Name">
                                {isEditing ? (
                                    <input
                                        autoFocus
                                        type="text"
                                        value={draft.name}
                                        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                                    />
                                ) : (
                                    <button className="project-link" onClick={() => navigate(`/projects/${p.id}`)}>
                                        {p.name}
                                    </button>
                                )}
                            </div>

                            <div data-label="Scheduled Completion">
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={draft.due}
                                        onChange={(e) => setDraft((d) => ({ ...d, due: e.target.value }))}
                                    />
                                ) : (
                                    fmt(p.due)
                                )}
                            </div>

                            <div className={`project-card-status ${isEditing ? "project-card-status--edit" : ""}`}
                                data-label="Status">
                                {isEditing ? (
                                    <>
                                        <select
                                            value={draft.status}
                                            onChange={(e) => setDraft(d => ({ ...d, status: e.target.value }))}
                                        >
                                            {STATUS_OPTIONS.map(o => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>

                                        <button className="save-btn" onClick={() => saveEdit(p.id)} type="button">
                                            Save
                                        </button>
                                        <button className="link-btn" onClick={cancelEdit} type="button">
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span>{meta.label}</span>
                                        <span className={`status-dot status-dot-${meta.color}`}></span>
                                        <div className="row-actions">
                                            <button className="link-btn" onClick={() => startEdit(p)} type="button">
                                                Edit
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => dispatch(removeProject(p.id))}
                                                type="button"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}

                            </div>
                        </div>
                    )
                })}
            </div>

        </div >
    )
}