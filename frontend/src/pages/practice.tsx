import { SideBar } from "./../components/sidebar";
import { useState, useEffect } from "react";
import { fetchPosts } from "../apis/postApis"; // Make sure this points to your API functions

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

  useEffect(() => {
    const getPosts = async () => {
      try {
        const data = await fetchPosts();
        // Filter only public posts
        const publicPosts = data.filter((post: Post) => !post.is_private);
        setPosts(publicPosts);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      } finally {
        setLoading(false);
      }
    };

    getPosts();
  }, []);

  return (
    <div className="flex h-screen">
      <SideBar onToggle={setSidebarCollapsed} />

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && <p>Loading posts...</p>}
          {!loading && posts.length === 0 && <p className="text-white">No public posts available.</p>}

          {posts.map((post) => (
            <div key={post.id} className="max-w-sm mx-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              {post.image_url && (
                <img className="rounded-t-lg" src={post.image_url} alt={post.title} />
              )}
              <div className="p-5">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{post.title}</h5>
                <p className="mb-3 font-normal text-gray-700">{post.description}</p>
                <a
                  href={`/posts/${post.id}`}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
                >
                  Read more
                  <svg
                    className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 5h12m0 0L9 1m4 4L9 9"
                    />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
