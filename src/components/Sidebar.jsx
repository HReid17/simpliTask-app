import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {

    const getLinkClass = ({ isActive }) => (isActive ? "active" : "");

    return (
        <div className="side">
            <div className="logo">
                <h3>Simpli<span className="highlight">Task</span></h3>
            </div>
            <ul>
                <li>
                    <NavLink to="/dashboard" className={getLinkClass}>Dashboard</NavLink>
                </li>
                <li>
                    <NavLink to="/tasks" className={getLinkClass}>My Tasks</NavLink>
                </li>
                <li>
                    <NavLink to="/projects" className={getLinkClass}>Projects</NavLink>
                </li>
                <li>
                    <NavLink to="/calendar" className={getLinkClass}>Calendar</NavLink>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
