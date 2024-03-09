import { Explore } from "../../components/feed/Explore";
import { PostForm } from "../../components/postForm/PostForm";
import "./home.css";

export const Home = () => {
  return (
    <>
      <div className="homeContainer">
        <PostForm />
        <Explore />
      </div>
    </>
  );
};
