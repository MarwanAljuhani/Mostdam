import { useContext, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { Navbar } from "./components/navbar/Navbar";
import { AuthContext } from "./context/AuthContext";
import { FollowingPage } from "./pages/followingPage/FollowingPage";
import { Home } from "./pages/home/Home";
import { Login } from "./pages/login/Login";
import { Signup } from "./pages/signup/Signup";
import { UserProfilePage } from "./pages/userProfilePage/UserProfilePage";
import { ViewSinglePostPage } from "./pages/viewSinglePostPage/ViewSinglePostPage";

function App() {
 
  const { currentUser } = useContext(AuthContext);





  return (
  
    <div className="appContainer">

      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route
            path="/signup"
            element={currentUser ? <Navigate to="/" /> : <Signup />}
          />
          <Route
            path="/login"
            element={currentUser ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/post/:postId"
            element={
              currentUser ? <ViewSinglePostPage /> : <Navigate to="/signup" />
            }
          />
          <Route
            path="/"
            element={currentUser ? <Home /> : <Navigate to="/signup" />}
          />
          <Route
            path="/FollowingPage"
            element={
              currentUser ? (
                <FollowingPage />
              ) : (
                // Redirect to login or another page if the user is not logged in
                <Navigate to="/signup" />
              )
            }
          />
          <Route
            path="/profile/:userId"
            element={
              currentUser ? (
                <UserProfilePage user={currentUser} />
              ) : (
                <Navigate to="/signup" />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
