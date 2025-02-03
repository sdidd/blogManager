import React, { useEffect, useState } from "react";
import { blogAPI } from "../../api";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ReactMarkdown from "react-markdown";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { useSwipeable } from "react-swipeable";
import remarkGfm from "remark-gfm";
import "../../css/NavigationButtons.css";

const BlogHome = ({ sortType, isLoggedIn }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalBlogsFetched, setTotalBlogsFetched] = useState(0);

  const fetchBlogs = async (limit = 3, offset = 0) => {
    try {
      const res = await blogAPI.get(`/api/blog/home?sort=${sortType}&limit=${limit}&offset=${offset}`);
      return res.data;
    } catch (err) {
      console.error("Error fetching blogs:", err);
      return [];
    }
  };

  const storeViewedBlog = async (blogId) => {
    try {
        if(localStorage.getItem('token')){
      await blogAPI.post('/api/blog/storeViewedBlog', { blogId });
        }else{
            console.log("Not logged in");
        }
    } catch (err) {
      console.error("Error storing viewed blog:", err);
    }
  };

  useEffect(() => {
    const initialFetch = async () => {
      const initialBlogs = await fetchBlogs();
      setBlogs(initialBlogs);
      setTotalBlogsFetched(initialBlogs.length);
      setLoading(false);
    };
    initialFetch();
  }, [sortType]);

  const nextBlog = async () => {
    if (sortType === 'algorithm') {
      setLoading(true);
      const newBlogs = await fetchBlogs(1, totalBlogsFetched);
      if (newBlogs.length > 0) {
        setBlogs((prevBlogs) => [...prevBlogs.slice(1), ...newBlogs]);
        setTotalBlogsFetched((prevTotal) => prevTotal + newBlogs.length);
        setCurrentIndex(0);
      } else {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % blogs.length);
      }
      setLoading(false);
    } else {
      if (currentIndex < blogs.length - 1) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
        await storeViewedBlog(blogs[currentIndex]._id);
      } else {
        setLoading(true);
        const newBlogs = await fetchBlogs(3, totalBlogsFetched);
        setBlogs((prevBlogs) => [...prevBlogs.slice(1), ...newBlogs]);
        setTotalBlogsFetched((prevTotal) => prevTotal + newBlogs.length);
        setCurrentIndex((prevIndex) => prevIndex - 1);
        setLoading(false);
      }
    }
  };

  const prevBlog = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => nextBlog(),
    onSwipedRight: () => prevBlog(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  if (loading) {
    return <Skeleton height={600} />;
  }

  return (
    <section className="mt-4" {...handlers}>
      <div className="container">
        {blogs.length > 0 && (
          <div className="card shadow">
            <div className="card-body">
              <ReactMarkdown className="" remarkPlugins={[remarkGfm]}>
                {blogs[currentIndex].title}
              </ReactMarkdown>
              <div className="card-text" style={{ height: "600px" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{blogs[currentIndex].content}</ReactMarkdown>
              </div>
            </div>
            <div className="card-footer text-muted">
              {blogs[currentIndex].likes} Likes | {blogs[currentIndex].comments.length} Comments | {blogs[currentIndex].views} Views
            </div>
          </div>
        )}

        <button
          className="btn btn-outline-secondary navigation-button position-fixed start-0 top-50 translate-middle-y"
          onClick={prevBlog}
          disabled={currentIndex === 0}
        >
          <FaChevronLeft />
        </button>
        <button
          className="btn btn-outline-secondary navigation-button position-fixed end-0 top-50 translate-middle-y"
          onClick={nextBlog}
          disabled={currentIndex === blogs.length}
        >
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
};

export default BlogHome;
