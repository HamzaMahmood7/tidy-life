import { useContext } from "react";
import { NavLink } from "react-router-dom";
import Logo from "../assets/Taskless-app-logo.png";
import { AuthContext } from "../contexts/AuthContext";
import {
  CheckSquare,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  UserPlus,
  Users,
} from "lucide-react";

const Navbar = () => {
  const { handleLogout, isLoggedIn } = useContext(AuthContext);

  return (
    <nav className="sidebar">
      <div className="sidebar-top">
        <NavLink to={"/dashboard"}>
          <img src={Logo} alt="logo" className="nav-logo" />
        </NavLink>
        <h2 className="app-name">Taskless</h2>
      </div>

      <div className="nav-links">
        {isLoggedIn ? (
          <>
            <NavLink to={"/dashboard"} className="nav-item">
              <LayoutDashboard size={20} /> <span>Dashboard</span>
            </NavLink>
            <NavLink to={"/task-list"} className="nav-item">
              <CheckSquare size={20} /> <span>Tasks</span>
            </NavLink>
            <NavLink to={"/group-list"} className="nav-item">
              <Users size={20} /> <span>Groups</span>
            </NavLink>
            <NavLink to={"/profile"} className="nav-item">
              <User size={20} /> <span>Profile</span>
            </NavLink>
            <button onClick={handleLogout} className="nav-item logout-btn">
              <LogOut size={20} /> <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <NavLink to={"/"} className="nav-item">
              <UserPlus size={20} /> <span>Sign Up</span>
            </NavLink>
            <NavLink to={"/login"} className="nav-item">
              <LogIn size={20} /> <span>Login</span>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
