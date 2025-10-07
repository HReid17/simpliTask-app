import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "../styles/globals.css"; 

const AppShell = ({ children }) => {
  return (
    <div className="shell">
      
      <div className="main-layout">
        <aside className="sidebar">
          <Sidebar />
        </aside>

        <div className="main">
          <header className="topbar">
            <TopBar />
          </header>

          <main className="content">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
