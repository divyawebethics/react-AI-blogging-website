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