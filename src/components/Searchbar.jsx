import searchIcon from "../assets/search-interface-symbol.png"
import "./Searchbar.css"
import { useState } from "react";

export default function Searchbar() {
    const [query, setQuery] = useState("");

    const onSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <div className="searchbar">
            <form onSubmit={onSubmit} role="search" aria-label="Site">
                <input
                    type="text"
                    placeholder="Find your task's..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search"
                />
                <button type="submit" aria-label="Search">
                    <img
                        className="search-icon"
                        src={searchIcon}
                        alt=""
                        aria-hidden="true"
                        style={{ width: "24px", height: "24px" }}
                    />
                </button>
            </form>
        </div>
    )
}
