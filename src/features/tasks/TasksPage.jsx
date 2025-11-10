import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useSearchParams } from "react-router-dom";
import { addTask, removeTask, editTask } from "./tasksSlice"
import sortIcon from "../../assets/sort.png"
import sortingIcon from "../../assets/sorting.png"
import pencil from "../../assets/pencil.png"
import "./tasksPage.css"

export default function TasksPage() {
    const dispatch = useDispatch();
    const tasks = useSelector((state) => state.tasks.tasks)
    const projects = useSelector((state) => state.projects.projects)
    const [searchParams] = useSearchParams();

    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [project, setProject] = useState("")
    const [progress, setProgress] = useState("")

    const [sortOrder, setSortOrder] = useState("asc")
    const [displayedTasks, setDisplayedTasks] = useState(tasks)

    const [isEditing, setIsEditing] = useState({ id: null, field: null })
    const [editValue, setEditValue] = useState("")

    const [activeEditRow, setActiveEditRow] = useState(null)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        setDisplayedTasks(tasks);
    }, [tasks]);

    const handleAdd = (e) => {
        e.preventDefault();

        if (!name) return;

        dispatch(
            addTask({
                name,
                date,
                project,
                progress: Number(progress)
            })
        )

        setName("");
        setDate("");
        setProject("");
        setProgress(0);

        setShowForm(false);
    }


    const handleSortByName = () => {
        const newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(newOrder);

        const sorted = [...tasks].sort((a, b) => {
            if (newOrder === "asc") return a.name.localeCompare(b.name);
            else return b.name.localeCompare(a.name);
        });

        setDisplayedTasks(sorted);
    };


    const handleSortByDate = () => {
        const newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(newOrder);

        const sorted = [...tasks].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            if (newOrder === "asc") return dateA - dateB;
            else return dateB - dateA;

        });

        setDisplayedTasks(sorted)
    }


    const handleByProject = () => {
        const newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(newOrder);

        const sorted = [...tasks].sort((a, b) => {
            const projectA = projects.find(p => p.id === a.project)?.name || "";
            const projectB = projects.find(p => p.id === b.project)?.name || "";

            if (newOrder === "asc") return projectA.localeCompare(projectB);
            else return projectB.localeCompare(projectA);
        });

        setDisplayedTasks(sorted);
    };


    const handleSortByProgress = () => {
        const newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(newOrder);

        const sorted = [...tasks].sort((a, b) => {
            if (newOrder === "asc") return a.progress - b.progress;
            else return b.progress - a.progress;
        })

        setDisplayedTasks(sorted)
    }

    const handleEdit = (taskId, field, currentValue) => {
        setIsEditing({ id: taskId, field })
        setEditValue(currentValue ?? "")
    }

    const handleSaveEdit = (taskId) => {
        dispatch(editTask({ id: taskId, field: isEditing.field, value: editValue }));
        setIsEditing({ id: null, field: null });
        setEditValue("");
    };

    const handleKeyDown = (e, taskId) => {
        if (e.key === "Enter") handleSaveEdit(taskId);
        if (e.key === "Escape") {
            setIsEditing({ id: null, field: null });
            setEditValue("");
        }
    };

    const findTaskById = (id) => {
        return tasks.find(t => String(t.id) === String(id));
    };

    useEffect(() => {
        const editId = searchParams.get("editId");
        const field = searchParams.get("field") || "name";
        if (!editId || tasks.length === 0) return;

        const task = findTaskById(editId);
        if (!task) return;

        // Make sure the table shows the latest ordering that includes the task.
        // (You already mirror tasks -> displayedTasks)
        setDisplayedTasks((prev) => {
            // If your sorting might hide/move it, you can just re-apply default order here:
            return tasks;
        });

        // Open the row and specific inline editor
        setActiveEditRow(task.id);
        // set edit mode for that field using your existing function
        const currentValue = task[field];
        setIsEditing({ id: task.id, field });
        setEditValue(currentValue ?? "");

        // Scroll that row into view after DOM paints
        requestAnimationFrame(() => {
            const row = document.querySelector(`tr[data-task-id="${task.id}"]`);
            if (row) {
                row.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }, [searchParams, tasks]); // re-run if tasks load/refresh

    return (
        <div className="task-wrapper">
            <div className="page-header">
                <h1>Welcome to your tasks...</h1>

                <div className="header-buttons">
                    <button className="link-btn" onClick={() => setShowForm((prev) => !prev)}>
                        {showForm ? "Close" : "Add New"}
                    </button>
                </div>
            </div>

            {showForm && (<form className="add-task-form" onSubmit={handleAdd}>
                <input
                    type="text"
                    placeholder="Task Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="date"
                    placeholder="Date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <select value={project} onChange={(e) => setProject(e.target.value)}>
                    <option value="">Select a Project...</option>
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <input
                    type="number"
                    placeholder="Progress"
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                />

                <button type="submit">Save Task</button>
            </form>)}

            <div className="task-table">
                <table>
                    <thead>
                        <tr>
                            <th>Task Name <button className="sortIcon-btn" onClick={handleSortByName}><img src={sortIcon} alt="sort-icon" className="sortIcon" /></button></th>
                            <th>Task Date <button className="sortingIcon-btn" onClick={handleSortByDate}><img src={sortingIcon} alt="sorting-icon" className="sortingIcon" /></button></th>
                            <th>Project <button className="sortIcon-btn" onClick={handleByProject}><img src={sortIcon} alt="sort-icon" className="sortIcon" /></button></th>
                            <th>Progress <button className="sortingIcon-btn" onClick={handleSortByProgress}><img src={sortingIcon} alt="sorting-icon" className="sortingIcon" /></button></th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedTasks.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                                    No tasks yet - add some above !
                                </td>
                            </tr>
                        ) : (
                            displayedTasks.map((task) => (
                                <tr key={task.id} data-task-id={task.id}>
                                    {/* NAME */}
                                    <td>
                                        {isEditing?.id === task.id && isEditing.field === "name" ? (
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => handleSaveEdit(task.id)}
                                                onKeyDown={(e) => handleKeyDown(e, task.id)}
                                                autoFocus
                                            />
                                        ) : (
                                            <>
                                                {task.name}
                                                {activeEditRow === task.id && (
                                                    <button
                                                        className="edit-btn"
                                                        type="button"
                                                        onClick={() => handleEdit(task.id, "name", task.name)}
                                                    >
                                                        <img src={pencil} alt="edit" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </td>

                                    {/* DATE */}
                                    <td>
                                        {isEditing?.id === task.id && isEditing.field === "date" ? (
                                            <input
                                                type="date"
                                                value={editValue || ""}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => handleSaveEdit(task.id)}
                                                onKeyDown={(e) => handleKeyDown(e, task.id)}
                                                autoFocus
                                            />
                                        ) : (
                                            <>
                                                {task.date || "-"}
                                                {activeEditRow === task.id && (
                                                    <button
                                                        className="edit-btn"
                                                        type="button"
                                                        onClick={() => handleEdit(task.id, "date", task.date || "")}
                                                    >
                                                        <img src={pencil} alt="edit" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </td>


                                    {/* PROJECT */}
                                    <td>
                                        {isEditing?.id === task.id && isEditing.field === "project" ? (
                                            <select
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => handleSaveEdit(task.id)}
                                                autoFocus
                                            >
                                                <option value="">Unassigned</option>
                                                {projects.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <>
                                                {projects.find(p => p.id === task.project)?.name || "-"}
                                                {activeEditRow === task.id && (
                                                    <button
                                                        className="edit-btn"
                                                        type="button"
                                                        onClick={() => handleEdit(task.id, "project", task.project || "")}
                                                    >
                                                        <img src={pencil} alt="edit" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </td>



                                    {/* PROGRESS */}
                                    <td>
                                        {isEditing?.id === task.id && isEditing.field === "progress" ? (
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => handleSaveEdit(task.id)}
                                                onKeyDown={(e) => handleKeyDown(e, task.id)}
                                                autoFocus
                                            />
                                        ) : (
                                            <>
                                                {task.progress}%
                                                {activeEditRow === task.id && (
                                                    <button
                                                        className="edit-btn"
                                                        type="button"
                                                        onClick={() => handleEdit(task.id, "progress", String(task.progress))}
                                                    >
                                                        <img src={pencil} alt="edit" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </td>


                                    {/* ACTIONS */}
                                    <td className="actions">
                                        {activeEditRow === task.id ? (
                                            <button className="link-btn" type="button" onClick={() => setActiveEditRow(null)}>
                                                Close
                                            </button>
                                        ) : (
                                            <>
                                                <button className="link-btn" type="button" onClick={() => setActiveEditRow(task.id)}>
                                                    Edit
                                                </button>
                                                <button className="delete-btn" type="button" onClick={() => dispatch(removeTask(task.id))}>
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    )
}