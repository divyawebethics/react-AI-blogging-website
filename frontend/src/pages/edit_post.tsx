import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { SideBar } from "../components/sidebar";
import { TitleSection } from "../components/posts/formSections/titleSection";
import { DescriptionSection } from "../components/posts/formSections/descriptionSection";
import { CategorySection } from "../components/posts/formSections/categorySection";
import { ImageUploadSection } from "../components/posts/formSections/ImageUploadSection";
import { BodySection } from "../components/posts/formSections/bodySection";
import { fetchPosts, createPost } from "../apis/postApis";

interface FormData {
  title: string;
  description: string;
  category: string;
  body: string;
  image: FileList;
  is_private: boolean;
}

export const EditPost: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await fetchPosts();
        const post = data.find((p: any) => p.id === Number(id));
        if (post) {
          reset({
            title: post.title,
            description: post.description,
            category: String(post.category_id),
            body: post.body,
            is_private: post.is_private,
          });
        }
      } catch (error) {
        console.error("Failed to fetch post", error);
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await createPost({ ...data, category_id: parseInt(data.category) });
      alert("Post updated successfully!");
      navigate(`/post/${id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to update post");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SideBar onToggle={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"} p-8`}>
        <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
          <TitleSection register={register} error={errors.title?.message} />
          <DescriptionSection register={register} error={errors.description?.message} />
          <CategorySection register={register} error={errors.category?.message} />
          <ImageUploadSection register={register} />
          <BodySection register={register} error={errors.body?.message} />

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
