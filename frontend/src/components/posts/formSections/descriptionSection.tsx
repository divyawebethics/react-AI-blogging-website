import React from "react";
import type { UseFormRegister } from "react-hook-form";
import type { FormData } from "../../../props/create_blog_props";

interface Props {
  register: UseFormRegister<FormData>;
  error?: string;
}

export const DescriptionSection: React.FC<Props> = ({ register, error }) => (
  <section className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
    <label className="block text-sm font-semibold text-gray-700 mb-3">Short Description *</label>
    <textarea
      {...register("description", { required: "Description is required" })}
      rows={3}
      placeholder="Write a short introduction..."
      className="w-full text-gray-600 border border-gray-300 rounded-lg p-3 resize-none focus:ring-2 focus:ring-purple-400 outline-none"
    />
    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  </section>
);
