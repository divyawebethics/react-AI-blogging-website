import { useEffect, useState } from "react";
import { fetchPosts } from "../apis/postApis";
import { SideBar } from "../components/sidebar";
import { useNavigate } from "react-router-dom";
import type { PostData } from "../props/formTypes";

export const Home = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts().then(setPosts).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-lg">Loading...</p>;

  return (
    <div className="page flex">
      <SideBar onToggle={setSidebarCollapsed} />
      <main
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {posts.map((post: PostData) => (
          <div
            key={post.id}
            className="bg-white shadow-lg rounded-xl p-4 hover:shadow-xl transition duration-200 flex flex-col h-full"
          >
            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-48 object-cover rounded-lg mb-3"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="flex-grow">
              <h2 className="text-xl text-gray-700 font-bold mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-3">{post.description}</p>
            </div>
            <div className="mt-auto pt-3">
              <button
                onClick={() => navigate(`/post/${post.id}`)}
                className="w-50 bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 transition duration-200"
              >
                Read More
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};