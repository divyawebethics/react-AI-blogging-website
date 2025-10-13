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

interface FormData {
  title: string;
  description: string;
  category: string;
  body: string;
  image: FileList;
  is_private: boolean;
}

export const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    const getPost = async () => {
      try {
        const data = await fetchPost(Number(id));
        reset({
          title: data.title,
          description: data.description,
          category: String(data.category_id),
          body: data.body,
          is_private: data.is_private,
        });
      } catch (error) {
        console.error("Failed to fetch post", error);
      }
    };

    if (id) getPost();
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      const payload = {
        title: data.title,
        description: data.description,
        category_id: Number(data.category),
        body: data.body,
        is_private: data.is_private ?? false,
        image_url: "", 
      };

      await updatePost(Number(id), payload);
      alert("Post updated successfully!");
      navigate("/"); 
    } catch (error) {
      console.error(error);
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_private"
                {...register("is_private")}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_private" className="text-gray-700">
                Publish as Private
              </label>
            </div>

            <div className="flex justify-end">
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
          </form>
        </main>
      </div>
    </div>
  );
};
