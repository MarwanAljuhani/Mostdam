import { UilHome } from "@iconscout/react-unicons";
import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./navbar.css";

export const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);
  /*const handleSignOut = async () => {
    try {
      await signOut(auth);
      // After signing out, you can redirect the user to a login page or do any other necessary actions.
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };*/

  return (
    <div className="navbarContainer">
      <Link to="/" style={{ textDecoration: "none", color: "white" }}>
        <UilHome className="homeIcon" />
      </Link>
      <div className="navbarBtn">
        <NavLink to="/" activeClassName="active" className="navLink" exact>
          <button>EXPLORE</button>
        </NavLink>
        <NavLink
          to="/FollowingPage"
          activeClassName="active"
          className="navLink"
          exact
        >
          <button>FOLLOWING</button>
        </NavLink>
      </div>

      <div className="profile">
        {currentUser && (
          <Link to={`/profile/${currentUser.uid}`}>
            <img
              src={currentUser.photoURL || "./Images/defaultuser.png"}
              alt=""
            />
          </Link>
        )}
      </div>
    </div>
  );
};
