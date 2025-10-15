
import { createCategory, deleteCategory, fetchCategories, updateCategory } from "../apis/categoryApis";
import { SideBar } from "../components/sidebar";
import { useEffect, useState } from "react";

interface Category{
  id:number,
  name:string
}
export function Categories() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");


  useEffect(()=>{
    loadCategories()
  },[])

  const loadCategories = async() =>{
    const data = await fetchCategories();
    setCategories(data)
  }

  const handleAdd = async() =>{
    if(!newCategory) return;
    await createCategory(newCategory);
    setNewCategory("");
    loadCategories();
  }
  
  const handleDelete = async(id:number) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this category?")
    if (!isConfirmed) return;
    try{
      await deleteCategory(id);
      alert("Category deleted successfully!")
      loadCategories();
    }catch (error) {
    console.error("Failed to delete category:", error);
    alert("Failed to delete category. Please try again.");
  }

  }

  const handleUpdate = async(id:number) => {
    const newName = prompt("Enter new category name");
    if(!newName) return;
    await updateCategory(id, newName);
    loadCategories();
  }


  return (
    <div>
        <div className="flex min-h-screen bg-gray-50">
          <SideBar onToggle={setSidebarCollapsed} />
          <div
              className={`flex-1 transition-all duration-300 ${
                sidebarCollapsed ? "ml-20" : "ml-64"
              }`}
            >
            <div className="flex-1 flex flex-col p-3 place-items-center my-4">
              <div className="flex flex-row text-gray-500">
                <h1>Create a new category</h1>
              </div>
              <div className="container mx-auto my-10">
                <h1 className="text-center text-gray-400 text-3xl font-semibold mb-4">
                      Categories
                </h1>
                <div className="md:w-1/2 mx-auto">
                    <div className="bg-white shadow-md rounded-lg p-6 text-gray-500">
                        <form id="todo-form">
                            <div className="flex mb-4">
                                <input type="text" 
                                      className="w-full px-4 py-2 mr-2 rounded-lg border-gray-300 focus:outline-none focus:border-blue-500" id="todo-input" 
                                      placeholder="Add new category" 
                                      value={newCategory}
                                      onChange={(e)=>setNewCategory(e.target.value)}
                                      required/>
                                <button type="button" 
                                onClick={handleAdd}
                                className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Add</button>

                            </div>
                        </form>
                        <ul>
                          {categories.map((cat) => (
                            <li key={cat.id} className="flex justify-between items-center mb-2 p-2 bg-white rounded shadow-sm">
                              <span>{cat.name}</span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUpdate(cat.id)}
                                  className="px-2 py-1 text-white bg-green-500 rounded hover:bg-green-600 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(cat.id)}
                                  className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600 text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                    </div>  
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
}


above is my Categories.tsx File

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { SideBar } from "../components/sidebar";
import { TitleSection } from "../components/posts/formSections/titleSection";
import { DescriptionSection } from "../components/posts/formSections/descriptionSection";
import { CategorySection } from "../components/posts/formSections/categorySection";
import { ImageUploadSection } from "../components/posts/formSections/ImageUploadSection";
import { BodySection } from "../components/posts/formSections/bodySection";

import { createPost } from "../apis/postApis";
import type { FormData } from "../props/formTypes";

export const CreatePost: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData & { image_file?: FileList }>();
  const [isPublishing, setIsPublishing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const navigate = useNavigate();

  const formData = watch();

  const onSubmit = async (data: FormData & { image_file?: FileList }) => {
    setIsPublishing(true);

    try {
      const formPayload = new FormData();
      formPayload.append("title", data.title);
      formPayload.append("description", data.description);
      formPayload.append("body", data.body);
      formPayload.append("category_id", data.category);
      formPayload.append("is_private", String(data.is_private ?? false));

      if (data.image_file && data.image_file.length > 0) {
        formPayload.append("image", data.image_file[0]);
      }

      await createPost(formPayload);

      alert(`Post published successfully as ${data.is_private ? "Private" : "Public"}!`);
      reset();
      navigate("/post");
    } catch (error) {
      console.error("Failed to publish post:", error);
      alert("Failed to publish post");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SideBar onToggle={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
        <header className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-20">
          <h1 className="text-2xl font-bold text-gray-800">Create Post</h1>
        </header>

        <main className="p-8 max-w-4xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <TitleSection register={register} error={errors.title?.message} />
            <DescriptionSection register={register} error={errors.description?.message} />
            <CategorySection register={register} error={errors.category?.message} />
            <ImageUploadSection register={register} />
            <BodySection register={register} error={errors.body?.message} />

            <div className="flex justify-between items-center mt-10 p-4 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="false"
                    {...register("is_private", { setValueAs: (v: string) => v === "true" })}
                    defaultChecked
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">Public</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="true"
                    {...register("is_private", { setValueAs: (v: string) => v === "true" })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">Private</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isPublishing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isPublishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Publish Post</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 mb-2">
                Current Form Data (Live Preview):
              </p>
              <pre className="text-xs text-gray-700 overflow-auto bg-white p-2 rounded max-h-40">
                {JSON.stringify(
                  { 
                    ...formData, 
                    image_file: formData.image_file && formData.image_file.length > 0 ? { 
                      name: formData.image_file[0]?.name, 
                      size: formData.image_file[0]?.size,
                      type: formData.image_file[0]?.type,
                    } : null 
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};


above is my createPost.tsx File

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { SideBar } from "../components/sidebar";
import { TitleSection } from "../components/posts/formSections/titleSection";
import { DescriptionSection } from "../components/posts/formSections/descriptionSection";
import { CategorySection } from "../components/posts/formSections/categorySection";
import { ImageUploadSection } from "../components/posts/formSections/ImageUploadSection";
import { BodySection } from "../components/posts/formSections/bodySection";
import { fetchPost, updatePost } from "../apis/postApis";
import type { FormData } from "../props/formTypes";

export const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<FormData>();
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [originalIsPrivate, setOriginalIsPrivate] = useState(false);

  const formData = watch();
  const currentIsPrivate = watch("is_private");

  useEffect(() => {
    const getPost = async () => {
      try {
        const data = await fetchPost(Number(id));
        setOriginalIsPrivate(data.is_private);
        
        reset({
          title: data.title,
          description: data.description,
          category: String(data.category_id),
          body: data.body,
          is_private: data.is_private, 
        });
      } catch (error) {
        console.error("Failed to fetch post", error);
        alert("Failed to load post");
      }
    };

    if (id) getPost();
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      const formPayload = new FormData();
            formPayload.append("title", data.title);
            formPayload.append("description", data.description);
            formPayload.append("body", data.body);
            formPayload.append("category_id", data.category);
            formPayload.append("is_private", String(data.is_private ?? false));
      
            if (data.image_file && data.image_file.length > 0) {
              formPayload.append("image", data.image_file[0]);
            }
      
      

        await updatePost(Number(id),formPayload);
      
      alert("Post updated successfully!");
      navigate("/post"); 
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update post");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SideBar onToggle={setSidebarCollapsed} />

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
        <header className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-20">
          <h1 className="text-2xl font-bold text-gray-800">Edit Post</h1>
        </header>

        <main className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
            <TitleSection register={register} error={errors.title?.message} />
            <DescriptionSection register={register} error={errors.description?.message} />
            <CategorySection register={register} error={errors.category?.message} />
            <ImageUploadSection register={register} />
            <BodySection register={register} error={errors.body?.message} />

            <div className="flex justify-between items-center mt-10 p-4 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="false"
                    checked={currentIsPrivate === false}
                    onChange={() => setValue("is_private", false)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">Public</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="true"
                    checked={currentIsPrivate === true}
                    onChange={() => setValue("is_private", true)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">Private</span>
                </label>
                <div className="text-sm text-gray-500 ml-4">
                  Original: {originalIsPrivate ? "Private" : "Public"}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>💾 Save Changes</span>
                )}
              </button>
            </div>

            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 mb-2">
                Current Form Data (Live Preview):
              </p>
              <pre className="text-xs text-gray-700 overflow-auto bg-white p-2 rounded max-h-40">
                {JSON.stringify(
                  { 
                    ...formData, 
                    image_file: formData.image_file && formData.image_file.length > 0 ? { 
                      name: formData.image_file[0]?.name, 
                      size: formData.image_file[0]?.size,
                      type: formData.image_file[0]?.type,
                    } : null 
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};


above is EditPost.tsx File

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SideBar } from "../components/sidebar";
import { fetchPosts, deletePost } from "../apis/postApis";

interface Post {
  id: number;
  title: string;
  category: string;
  updated_at: string;
  is_private: boolean;
}

export const PostsDashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();

  const loadPosts = async () => {
    try {
      const data = await fetchPosts();
      setPosts(data);
      console.log(data)
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
            onClick={() => navigate("/post/create-post")}
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
                        {new Date(post.updated_at).toLocaleString("en-IN", {
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
                          onClick={() => handleDelete(post.id)}
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
 
above is PostsDashboard.tsx file 

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

above is Home.tsx file 

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

above is read_post.tsx file 