import { UilSearch } from "@iconscout/react-unicons";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useState } from "react";
import { db } from "../firebase/firebase";
import "./searchForUsers.css";

const SearchForUsers = () => {
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState(false);

  const handleSearch = async () => {
    try {
      const q = query(
        collection(db, "users"),
        where("displayName", ">=", userName),
        where("displayName", "<=", userName + "\uf8ff")
      );

      const querySnapshot = await getDocs(q);
      const usersData = [];

      if (querySnapshot.empty) {
        setUsers([]);
        setErr(true);
      } else {
        querySnapshot.forEach((doc) => {
          usersData.push(doc.data());
        });
        setUsers(usersData);
        setErr(false);
      }
    } catch (error) {
      console.error("Error searching for users:", error);
      setErr(true);
    }
  };

  const handleInput = (e) => {
    const inputValue = e.target.value;
    setUserName(e.target.value);
    if (inputValue.trim() === "") {
      setUsers([]);
      setErr(false);
    } else {
      handleSearch();
    }
  };

  return (
    <div className="searchContainer">
      <div className="inputContainer">
        <UilSearch className="searchIcon" />
        <input
          type="text"
          placeholder="Search for users..."
          onChange={handleInput}
          value={userName}
        />
      </div>
      {err && <span>User not found</span>}
      {users.length > 0 && (
        <div className="foundedUsers">
          {users.map((user) => (
            <p>
              <img src={user.photoURL} alt="" />
              {user.displayName}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchForUsers;
