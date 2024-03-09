import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, storage, db } from "../../components/firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import "./signup.css";
import { useNavigate, Link } from "react-router-dom";

export const Signup = () => {
  const [err, setErr] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const userImage = e.target[3].files[0];

    console.log("Form data:", userName, email, password, userImage);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      setPasswordError(
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number."
      );
      return;
    } else {
      setPasswordError("");
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
    
      const storageRef = ref(storage, `userImages/${res.user.uid}`);
    
      let downloadURL = ""; // Default value
    
      if (userImage) {
        const uploadTask = uploadBytesResumable(storageRef, userImage);
    
        try {
          await uploadTask;
          downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          setErr(true);
          return;
        }
      }
    
      await updateProfile(res.user, {
        displayName: userName,
        photoURL: downloadURL || "./Images/defaultuser.png", // Use default image if downloadURL is empty
      });
    
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        displayName: userName,
        email,
        photoURL: downloadURL || "./Images/defaultuser.png", // Use default image if downloadURL is empty
        followers: [],
        followings: [],
      });
    
      console.log("Sign up successful. Redirecting to home.");
      navigate("/");
    } catch (err) {
      console.error("Error creating user:", err);
      setErr(true);
    }
    
  };

  return (
    <div className="signup-container">
      <div className="signupLeftSection">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" name="username" />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" />
            {passwordError && <p className="error-message">{passwordError}</p>}
          </div>
          <div>
            <label htmlFor="image">Upload Image:</label>
            <input type="file" id="image" name="image" />
          </div>
          <div className="signupBtn">
            <button type="submit">Sign Up</button>
          </div>
          {err && <span>Something went wrong</span>}
        </form>
        <p className="login-link">
          If you have an account, <Link to="/login">log in here</Link>.
        </p>
      </div>
      <div className="signupRightSection">
        <img src="./Images/signupImage.webp" alt="" />
      </div>
    </div>
  );
};
