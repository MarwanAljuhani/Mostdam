import { UilCommentAlt, UilShareAlt } from "@iconscout/react-unicons";
import FavoriteIcon from "@mui/icons-material/Favorite";

import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { db } from "../firebase/firebase";
import "./feed.css";

export const Explore = () => {
  const { currentUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedMap, setCopiedMap] = useState({});

  const formatPostTime = (timestamp) => {
    const now = new Date();
    const postTime = timestamp.toDate();
    const timeDifference = now - postTime;
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) {
      return `${seconds} ${seconds === 1 ? "second" : "seconds"} ago`;
    } else if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    } else if (hours < 24) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else {
      // If more than a day, display the full date and time
      return postTime.toLocaleString();
    }
  };

  const fetchRandomPosts = async () => {
    try {
      if (currentUser) {
        const allPostsRef = collection(db, "posts");

        // Fetch all posts once
        const allPostsSnapshot = await getDocs(allPostsRef);
        const allPostsData = allPostsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Shuffle the posts
        const shuffledPosts = allPostsData.sort(() => Math.random() - 0.5);

        // Set the initial random posts
        setPosts(shuffledPosts.slice(0, 5));
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching random posts:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomPosts();
  }, [currentUser,]);

  const handleLikeClick = async (postId) => {
    try {
      if (currentUser) {
        const currentUserId = currentUser.uid;
        const post = posts.find((p) => p.id === postId);

        if (post) {
          if (!post.likes.includes(currentUserId)) {
            await updateDoc(doc(db, "posts", postId), {
              likes: arrayUnion(currentUserId),
            });

            // Update the local state if needed
            setPosts((prevPosts) =>
              prevPosts.map((p) =>
                p.id === postId
                  ? { ...p, likes: [...p.likes, currentUserId] }
                  : p
              )
            );
          } else {
            // Unlike the post
            await updateDoc(doc(db, "posts", postId), {
              likes: arrayRemove(currentUserId),
            });

            // Update the local state if needed
            setPosts((prevPosts) =>
              prevPosts.map((p) =>
                p.id === postId
                  ? {
                      ...p,
                      likes: p.likes.filter((id) => id !== currentUserId),
                    }
                  : p
              )
            );
          }
        }
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleCopyLink = (postId) => {
    const postLink = `${window.location.origin}/post/${postId}`;

    const textarea = document.createElement("textarea");
    textarea.value = postLink;
    document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(0, 99999);

    document.execCommand("copy");

    document.body.removeChild(textarea);

    // Update the copy status for the specific post
    setCopiedMap((prevCopiedMap) => ({
      ...prevCopiedMap,
      [postId]: true,
    }));

    // Reset copy status after a brief delay
    setTimeout(() => {
      setCopiedMap((prevCopiedMap) => ({
        ...prevCopiedMap,
        [postId]: false,
      }));
    }, 2000);
  };

  return (
    <div>
      {isLoading ? (
    <p style={{ color: 'white' }}>Loading...</p>

      ) : (
        <div>
          {posts.map((post) => (
            <div className="postsContainer" key={post.id}>
              <Link
                to={`/post/${post.id}`}
                style={{ textDecoration: "none", color: "white" }}
              >
                <Link
                  className="infoSection"
                  to={`/profile/${post.userId}`}
                  style={{ textDecoration: "none", color: "white" }}
                >
                  <img
                    src={post.userPhotoURL || "./Images/defaultuser.png"}
                    alt=""
                  />
                  <div className="info">
                    <p>{post.userName}</p>
                    <p className="text">{formatPostTime(post.postTime)}</p>
                  </div>
                </Link>

                <p className="text">{post.postContent}</p>
                <div className="imgSection">
                  <img src={post.postImage} alt="" />
                </div>
              </Link>
              <div className="bottomSection">
                <FavoriteIcon
                  onClick={() => handleLikeClick(post.id)}
                  style={{
                    color: post.likes.includes(currentUser.uid)
                      ? "red"
                      : "white",
                    cursor: "pointer", // If you want to show a pointer cursor on hover
                  }}
                />

                <Link
                  to={`/post/${post.id}`}
                  style={{ textDecoration: "none", color: "white" }}
                >
                  <div className="commentIcon">
                    <UilCommentAlt />
                    <span>{post.comments.length} comments</span>
                  </div>
                </Link>
                <UilShareAlt
                  onClick={() => handleCopyLink(post.id)}
                  color={copiedMap[post.id] ? "green" : "white"}
                />
              </div>
              {copiedMap[post.id] && (
                <p className="copyMessage">Link copied!</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
