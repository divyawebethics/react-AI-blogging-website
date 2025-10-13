import React from "react";
import type { UseFormRegister } from "react-hook-form";
import type { FormData } from "../../../props/create_blog_props";

interface Props {
  register: UseFormRegister<FormData>;
  error?: string;
}

export const TitleSection: React.FC<Props> = ({ register, error }) => (
  <section className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
    <label className="block text-sm font-semibold text-gray-700 mb-3">Post Title *</label>
    <input
      {...register("title", { required: "Post title is required" })}
      type="text"
      placeholder="Enter an engaging title..."
      className="w-full text-gray-700 text-2xl font-semibold bg-transparent border-none outline-none placeholder-gray-400"
    />
    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  </section>
);
