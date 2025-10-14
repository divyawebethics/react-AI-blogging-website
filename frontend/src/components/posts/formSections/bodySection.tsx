import React from "react";
import type { UseFormRegister } from "react-hook-form";
import type { FormData } from "../../../props/formTypes";

interface Props {
  register: UseFormRegister<FormData>;
  error?: string;
}

export const BodySection: React.FC<Props> = ({ register, error }) => (
  <section className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
    <label className="block text-sm font-semibold text-gray-700 mb-3">Body *</label>
    <textarea
      {...register("body", { required: "Content is required" })}
      rows={10}
      placeholder="Start writing your blog post here..."
      className="w-full text-gray-600 border border-gray-300 rounded-lg p-3 resize-y focus:ring-2 focus:ring-purple-400 outline-none"
    />
    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  </section>
);
