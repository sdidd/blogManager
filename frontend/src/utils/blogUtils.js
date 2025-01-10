import API from "../api";

const LOCAL_STORAGE_KEY = "unsavedBlog";

export function useDraft() {
  const [title, setTitle] = useState(localStorage.getItem(LOCAL_STORAGE_KEY)?.title || "");
  const [content, setContent] = useState(localStorage.getItem(LOCAL_STORAGE_KEY)?.content || "");
  const [tempImages, setTempImages] = useState(localStorage.getItem(LOCAL_STORAGE_KEY)?.tempImages || []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ title, content, tempImages }));
  }, [title, content, tempImages]);

  const clearDraft = () => localStorage.removeItem(LOCAL_STORAGE_KEY);

  return { title, setTitle, content, setContent, tempImages, setTempImages, clearDraft };
}

export async function saveBlog(blogId, title, content, images, status) {
  const response = await API.post("/api/blog/createOrUpdate", { blogId, title, content, tempImages: images, status });
  return response.data.blog;
}
