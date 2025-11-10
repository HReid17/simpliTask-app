import { useMemo, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import searchIcon from "../assets/search-interface-symbol.png"
import "./Searchbar.css"

export default function Searchbar() {
    const [q, setQ] = useState("");
    const tasks = useSelector((s) => s.tasks.tasks);
    const searchRef = useRef(null);
    const nav = useNavigate();


    const results = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) return [];
        return tasks
            .filter(t => t.name?.toLowerCase().includes(query))
            .slice(0, 8); // cap the list
    }, [q, tasks]);

    const handleSelect = (taskId) => {
        nav(`/tasks?editId=${taskId}&field=name`);
        setQ("");
        document.activeElement.blur(); // removes focus from the input
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setQ(""); // clear search (hides results)
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    return (
        <div className="searchbar" ref={searchRef}>
            <form onSubmit={(e) => e.preventDefault()}>
                <button type="submit">
                    <img src={searchIcon} alt="Search" className="search-icon" />
                </button>
                <input
                    type="search"
                    placeholder="Search tasks..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />

                {q && results.length > 0 && (
                    <ul className="task-search-results">
                        {results.map(t => (
                            <li key={t.id} onClick={() => handleSelect(t.id)}>
                                {t.name}
                            </li>
                        ))}
                    </ul>
                )}

                {q && results.length === 0 && (
                    <div className="task-search-empty">No matching tasks</div>
                )}
            </form>
        </div>

    );
}
