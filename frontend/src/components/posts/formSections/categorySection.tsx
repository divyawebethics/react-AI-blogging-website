import React, { useEffect, useState } from "react";
import type { UseFormRegister } from "react-hook-form";
import type { FormData } from "../../../props/formTypes";
import { fetchCategories } from "../../../apis/categoryApis";

interface Props {
  register: UseFormRegister<FormData>;
  error?: string;
}

export const CategorySection: React.FC<Props> = ({ register, error }) => {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <section className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
      <label className="block text-sm font-semibold text-gray-700 mb-3">Choose Category *</label>
      <select
        {...register("category", { required: "Please select a category" })}
        className="w-full border text-gray-600 border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 outline-none bg-white"
      >
        <option value="">-- Select a category --</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </section>
  );
};
