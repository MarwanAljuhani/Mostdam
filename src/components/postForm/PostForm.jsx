import { UilPaperclip } from "@iconscout/react-unicons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import React, { useContext, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { db, storage } from "../firebase/firebase";
import "./postForm.css";

export const PostForm = () => {
  const { currentUser } = useContext(AuthContext);
  const postInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const postContent = postInputRef.current.value;

    try {
      const { displayName, photoURL } = currentUser;

      let downloadURL = "";
      if (file) {
        const storageRef = ref(
          storage,
          `images/${currentUser.uid}/${file.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, file);

        await uploadTask;
        downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      }

      const postData = {
        userId: currentUser.uid,
        postContent: postContent,
        postTime: serverTimestamp(),
        userName: displayName,
        userPhotoURL: photoURL,
        likes: [],
        comments: [],
        postImage: downloadURL,
      };

      const postRef = await addDoc(collection(db, "posts"), postData);
      console.log("Post created with ID: ", postRef.id);

      postInputRef.current.value = "";
      fileInputRef.current.value = "";
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Error adding post: ", error);
      if (error.code === "permission-den ed") {
        console.error("Permission denied. Check Firebase security rules.");
      } else if (error.code === "aborted") {
        console.error("Operation aborted. Check your Firebase configuration.");
      } else {
        console.error("Unknown error. Check Firebase logs for more details.");
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="postFormContainer">
      <form onSubmit={handleSubmit}>
        <div className="upperSection">
          <img src={currentUser.photoURL || "./Images/defaultuser.png"} alt="" />
          <input ref={postInputRef} placeholder="Type something..." />
        </div>
        <div className="previewSection">
          {preview && (
            <img src={preview} alt="Preview" className="previewImage" />
          )}
        </div>
        <div className="bottomSection">
          <label htmlFor="fileInput">
            <UilPaperclip />
          </label>
          <input
            id="fileInput"
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <button type="submit">Post</button>
        </div>
      </form>
    </div>
  );
};
