import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPost } from "../apis/postApis";
import { SideBar } from "../components/sidebar";
import type { PostData } from "../props/formTypes";

export const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    const getPost = async () => {
      if (!id) return;
      
      try {
        const postData = await fetchPost(Number(id));
        console.log("Post data:", postData);
        console.log("Image URL:", postData.image_url); 
        setPost(postData);
      } catch (error) {
        console.error("Failed to fetch post", error);
      } finally {
        setLoading(false);
      }
    };
    getPost();
  }, [id]);

  if (loading) return <p className="p-6">Loading post...</p>;
  if (!post) return <p className="p-6">Post not found</p>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SideBar onToggle={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
        <div className="flex justify-center p-8">
          <article className="bg-white rounded-lg shadow-lg p-8 min-w-[60%] max-w-4xl w-full">
            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-96 object-cover rounded-lg mb-6"
                onError={(e) => {
                  console.error("Image failed to load:", post.image_url);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                onLoad={() => console.log("Image loaded successfully")}
              />
            )}
            <h1 className="text-4xl text-justify font-bold text-gray-900 mb-4">{post.title}</h1>
            <p className="text-xl text-justify text-gray-600 mb-6 leading-relaxed">{post.description}</p>
            <div className="border-t border-gray-200 pt-6">
              <div className="prose prose-lg max-w-none text-justify text-gray-800 whitespace-pre-line">
                {post.body}
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
              <p>Category: {post.category || "Uncategorized"}</p>
              <p>Published: {new Date(post.created_at || '').toLocaleDateString()}</p>
              {post.is_private && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded ml-2">
                  Private
                </span>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};