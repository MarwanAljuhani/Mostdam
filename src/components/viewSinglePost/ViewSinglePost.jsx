import { UilCommentAlt, UilShareAlt } from "@iconscout/react-unicons";
import FavoriteIcon from "@mui/icons-material/Favorite";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { db } from "../firebase/firebase";
import "./viewSinglePost.css";

export const ViewSinglePost = () => {
  const { currentUser } = useContext(AuthContext);
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [commentUsers, setCommentUsers] = useState({});
  const navigate = useNavigate();
  const [copiedMap, setCopiedMap] = useState({});

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, "posts", postId);
        const postDoc = await getDoc(postRef);

        if (postDoc.exists()) {
          setPost({ id: postDoc.id, ...postDoc.data() });
          console.log("Fetched post:", post);
        } else {
          console.log("Post not found");
        }
      } catch (error) {
        console.error("Error fetching single post:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleLikeClick = async () => {
    try {
      if (currentUser) {
        const currentUserId = currentUser.uid;

        if (!post.likes.includes(currentUserId)) {
          await updateDoc(doc(db, "posts", postId), {
            likes: arrayUnion(currentUserId),
          });

          setPost((prevPost) => ({
            ...prevPost,
            likes: [...prevPost.likes, currentUserId],
          }));
        } else {
          await updateDoc(doc(db, "posts", postId), {
            likes: arrayRemove(currentUserId),
          });

          setPost((prevPost) => ({
            ...prevPost,
            likes: prevPost.likes.filter((id) => id !== currentUserId),
          }));
        }
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleCommentSubmit = async () => {
    try {
      if (currentUser) {
        // Add the comment to the post
        const commentData = {
          userId: currentUser.uid,
          userName: currentUser.displayName,
          commentText: commentText,
          commentTime: new Date(),
        };

        await updateDoc(doc(db, "posts", postId), {
          comments: arrayUnion(commentData),
        });

        // Update the local state if needed
        setPost((prevPost) => ({
          ...prevPost,
          comments: [...prevPost.comments, commentData],
        }));

        // Clear the comment text
        setCommentText("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };
  useEffect(() => {
    const fetchCommentUsers = async () => {
      const users = {};

      // Fetch user data for each unique userId in comments
      post.comments.forEach((comment) => {
        const userId = comment.userId;
        if (!users[userId]) {
          getUserData(userId).then((userData) => {
            users[userId] = userData;
            setCommentUsers({ ...users });
          });
        }
      });
    };

    if (post) {
      fetchCommentUsers();
    }
  }, [post]);
  const getUserData = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        console.log("User not found");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };
  const handleDeletePost = async () => {
    try {
      if (currentUser && post && currentUser.uid === post.userId) {
        await deleteDoc(doc(db, "posts", postId));

        navigate("/");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
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
        <div className="loadingIcon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
          </svg>
        </div>
      ) : (
        <div className="postContainer">
          <div className="post">
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
                <p className="text">
                  {" "}
                  {post.postTime.toDate().toLocaleString()}
                </p>
              </div>
            </Link>
            <p className="text">{post.postContent}</p>
            {post.postImage && (
              <div className="imgSection">
                <img src={post.postImage} alt="" />
              </div>
            )}
            {currentUser && currentUser.uid === post.userId && (
              <button onClick={handleDeletePost} className="deletePostBtn">
                Delete Post
              </button>
            )}
            <div className="bottomSection">
              <FavoriteIcon
                onClick={() => handleLikeClick(post.id)}
                style={{
                  color: post.likes.includes(currentUser.uid) ? "red" : "white",
                  cursor: "pointer",
                }}
              />
              <div className="commentIcon">
                <UilCommentAlt />
                <span>{post.comments.length} comments</span>
              </div>
              <UilShareAlt
                onClick={() => handleCopyLink(post.id)}
                color={copiedMap[post.id] ? "green" : "white"}
              />
            </div>

            <div className="addComment">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button onClick={handleCommentSubmit}>Comment</button>
            </div>
          </div>
          <div className="commentContainer">
            {post.comments.map((comment, index) => (
              <div key={index} className="commentSection">
                <div className="comment">
                  <div className="commentUserInfo">
                    {commentUsers[comment.userId] && (
                      <>
                        <img
                          src={commentUsers[comment.userId].photoURL}
                          alt="User"
                          className="commentUserPhoto"
                        />
                        <p>{commentUsers[comment.userId].displayName}</p>
                      </>
                    )}
                  </div>
                  <div className="commentText">{comment.commentText}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
