import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPosts } from "../apis/postApis";
import { SideBar } from "../components/sidebar";

interface Post {
  id: number;
  title: string;
  description: string;
  body: string;
  image_url?: string;
  category_id: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
//   const navigate = useNavigate();

  useEffect(() => {
    const getPost = async () => {
      try {
        const data = await fetchPosts();
        const selectedPost = data.find((p: Post) => p.id === Number(id));
        setPost(selectedPost || null);
      } catch (error) {
        console.error("Failed to fetch post", error);
      }
    };
    getPost();
  }, [id]);

 
  if (!post) return <p className="p-6">Loading post...</p>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SideBar onToggle={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"} p-8`}>
        {post.image_url && (
          <img className="w-full h-64 object-cover rounded-lg mb-6" src={post.image_url} alt={post.title} />
        )}
        <h1 className="text-3xl text-gray-900 font-bold mb-4">{post.title}</h1>
        <p className="text-gray-700 mb-6">{post.description}</p>
        <div className="prose max-w-none text-gray-800 mb-6">{post.body}</div>
      </div>
    </div>
  );
};
