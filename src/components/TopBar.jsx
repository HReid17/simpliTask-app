import "./TopBar.css"
import Searchbar from "./Searchbar"

const TopBar = () => {

  return (
    <div className="top">
        <div className="searchbar">
            <Searchbar />
        </div>

        <div className="profile">
            <h4>Harrison</h4>
            <span className="avatar">H</span>
        </div>
    </div>
  )
}

export default TopBar