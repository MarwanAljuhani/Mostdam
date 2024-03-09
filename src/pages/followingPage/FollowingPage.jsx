import { doc, getDoc } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { Following } from "../../components/feed/Following";
import { db } from "../../components/firebase/firebase";
import { PostForm } from "../../components/postForm/PostForm";
import { AuthContext } from "../../context/AuthContext";
import "./followingPage.css";


export const FollowingPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [followings, setFollowings] = useState([]);

  useEffect(() => {
    const fetchFollowings = async () => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);

        try {
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.followings) {
              setFollowings(userData.followings);
            }
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
        }
      }
    };

    fetchFollowings();
  }, [currentUser]);

  return (
    <>
      <div className="homeContainer">
        <PostForm />
        <Following followedUsers={followings} />
      </div>
    </>
  );
};
