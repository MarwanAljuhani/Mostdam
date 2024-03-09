import { signOut } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../../components/firebase/firebase";
import { AuthContext } from "../../context/AuthContext";
import "./userProfilePage.css";

export const UserProfilePage = () => {
  const { currentUser } = useContext(AuthContext);
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingsCount, setFollowingsCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      // Fetch user's document
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        setUser(userDoc.data());
        setFollowersCount(userDoc.data().followers.length);
        setFollowingsCount(userDoc.data().followings.length);
      }
    };

    const checkIfFollowing = async () => {
      if (currentUser) {
        // Assuming 'following' is an array in your currentUser document
        const usersRef = doc(db, "users", currentUser.uid);
        const usersDoc = await getDoc(usersRef);

        if (usersDoc.exists()) {
          const users = usersDoc.data().followings || [];
          setIsFollowing(users.includes(userId));
        }
      }
    };

    fetchUserData();
    checkIfFollowing();
  }, [currentUser, userId]);

  const handleFollowClick = async () => {
    if (currentUser && user) {
      const currentUserId = currentUser.uid;
      const targetUserId = user.uid;

      if (!isFollowing) {
        // Follow the user
        await updateDoc(doc(db, "users", currentUserId), {
          followings: arrayUnion(targetUserId),
        });
        await updateDoc(doc(db, "users", targetUserId), {
          followers: arrayUnion(currentUserId),
        });
        setFollowersCount(followersCount + 1);
      } else {
        // Unfollow the user
        await updateDoc(doc(db, "users", currentUserId), {
          followings: arrayRemove(targetUserId),
        });
        await updateDoc(doc(db, "users", targetUserId), {
          followers: arrayRemove(currentUserId),
        });
        setFollowersCount(followersCount - 1);
      }

      // Toggle the follow state
      setIsFollowing(!isFollowing);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/Login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="user-profile-page">
      <h2>User Profile</h2>
      {user && (
        <div>
          <img src={user.photoURL } alt="" />
          <p>Name: {user.displayName}</p>
        </div>
      )}

      <div className="followingInfo">
        <p>Followers: {followersCount}</p>
        <p>Following: {followingsCount}</p>
      </div>

      {currentUser && userId !== currentUser.uid ? (
        <button onClick={handleFollowClick}>
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      ) : (
        <button onClick={handleSignOut}>Log Out</button>
      )}
    </div>
  );
};
