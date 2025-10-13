import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  TitleSection,
  DescriptionSection,
  CategorySection,
  ImageUploadSection,
  BodySection,
} from "./formSections";

interface FormData {
  title: string;
  description: string;
  category: string;
  body: string;
  image: FileList;
}

export const PostForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [isPublishing, setIsPublishing] = useState(false);

  const onSubmit = (data: FormData) => {
    setIsPublishing(true);
    setTimeout(() => {
      console.log("📤 Post submitted:", data);
      alert("✅ Post published successfully!");
      setIsPublishing(false);
    }, 1500);
  };

  return (
    <div className="p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
        <TitleSection register={register} errors={errors} />
        <DescriptionSection register={register} errors={errors} />
        <CategorySection register={register} errors={errors} />
        <ImageUploadSection register={register} />
        <BodySection register={register} errors={errors} />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPublishing}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
      </form>
    </div>
  );
};
