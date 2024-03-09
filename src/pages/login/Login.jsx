import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../components/firebase/firebase";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";

export const Login = () => {
  const [err, setErr] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // Redirect to home upon successful sign-in
    } catch (error) {
      console.error("Error signing in:", error);
      setErr(true);
    }
  };

  return (
    <div className="signinContainer">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" />
        </div>
        <div className="signinBtn">
          <button type="submit">Sign In</button>
          <Link to="/Signup">go to sign in page</Link>
        </div>
        {err && <span>Something went wrong</span>}
      </form>
    </div>
  );
};
