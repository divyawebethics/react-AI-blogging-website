import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SideBar } from "../components/sidebar";
import { fetchPosts, deletePost } from "../apis/postApis";
import type { PostData } from "../props/formTypes";

export const PostsDashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [posts, setPosts] = useState<PostData[]>([]); // Use PostData directly
  const navigate = useNavigate();

  const loadPosts = async () => {
    try {
      const data = await fetchPosts();
      setPosts(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this post?");
    if (!isConfirmed) return;

    try {
      await deletePost(id);
      alert("Post deleted successfully!");
      loadPosts();
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SideBar onToggle={setSidebarCollapsed} />

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
        <header className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-20 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Posts Dashboard</h1>
          <button
            onClick={() => navigate("/posts/create-post")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
          >
            + Create Post
          </button>
        </header>

        <main className="p-8 max-w-6xl mx-auto">
          {posts.length === 0 ? (
            <div className="bg-white border rounded-lg shadow-sm p-6 text-gray-600 text-center">
              No posts yet. Create your first one!
            </div>
          ) : (
            <div className="relative overflow-x-auto bg-white border rounded-lg shadow-sm">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Last Updated</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="bg-white border-b hover:bg-gray-50">
                      <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {post.title}
                      </th>
                      <td className="px-6 py-4 text-gray-900">{post.category}</td>
                      <td
                        className={`px-6 py-4 font-medium ${
                          post.is_private ? "text-red-500" : "text-green-600"
                        }`}
                      >
                        {post.is_private ? "Private" : "Public"}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(post.updated_at || '').toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => navigate(`/post/edit/${post.id}`)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id || 0)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};