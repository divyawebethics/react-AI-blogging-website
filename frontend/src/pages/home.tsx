import { useState, useEffect } from "react";
import { fetchPosts } from "../apis/postApis";
import { SideBar } from "../components/sidebar";
import { useNavigate } from "react-router-dom";

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

export const Home = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getPosts = async () => {
      try {
        const data = await fetchPosts();
        setPosts(data); 
      } catch (error) {
        console.error("Failed to fetch posts", error);
      } finally {
        setLoading(false);
      }
    };
    getPosts();
  }, []);

  return (  
    <div className="flex bg-gray-50 min-h-screen">
      <SideBar onToggle={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && <p>Loading Posts...</p>}
          {!loading && posts.length === 0 && <p>No Posts available</p>}

          {posts.map((post) => (
            <div key={post.id} className="flex flex-col max-w-sm mx-4 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {post.image_url && (
                <img className="w-full h-48 object-cover" src={post.image_url} alt={post.title} />
              )}

              <div className="p-5 flex flex-col flex-1">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 line-clamp-2">
                  {post.title}
                </h5>
                <p className="mb-3 font-normal text-gray-700 line-clamp-3 flex-1">
                  {post.description}
                </p>
                <div className="justify-items-center">
                  <button
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="mt-auto w-max px-3 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
                    >
                    Read more
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
